import { NextRequest, NextResponse } from 'next/server'

// ── Types ──────────────────────────────────────────────────────────────────

export type LicenseType = 'general' | 'specialty'

export interface LicenseItem {
  companyName: string  // 법인명
  licenseNo: string    // 면허번호
  bizCategory: string  // 업종명
  registeredAt: string // 등록일 YYYY-MM-DD
}

export interface VerifyResponse {
  success: true
  bizno: string
  licenseType: LicenseType
  items: LicenseItem[]
  isMock: boolean
}

export interface VerifyErrorResponse {
  success: false
  message: string
}

// ── Mock data (API 키 없을 때 반환) ────────────────────────────────────────

const MOCK: Record<LicenseType, LicenseItem[]> = {
  general: [
    { companyName: '(주)한국종합건설', licenseNo: 'A0001234', bizCategory: '토목공사업',    registeredAt: '2018-03-15' },
    { companyName: '(주)한국종합건설', licenseNo: 'A0001235', bizCategory: '건축공사업',    registeredAt: '2018-03-15' },
    { companyName: '(주)한국종합건설', licenseNo: 'A0001236', bizCategory: '산업환경설비공사업', registeredAt: '2020-07-22' },
  ],
  specialty: [
    { companyName: '(주)전문시공테크', licenseNo: 'S0009876', bizCategory: '철근콘크리트공사업',    registeredAt: '2019-05-10' },
    { companyName: '(주)전문시공테크', licenseNo: 'S0009877', bizCategory: '금속구조물·창호공사업', registeredAt: '2021-01-03' },
  ],
}

// ── XML 파서 (외부 라이브러리 없음) ────────────────────────────────────────

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))
  return match ? match[1].trim() : ''
}

function parseItems(xml: string): LicenseItem[] {
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/g) ?? []
  return blocks.map((block): LicenseItem => {
    const raw = extractTag(block, 'rgndt') // YYYYMMDD
    const registeredAt =
      raw.length === 8
        ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
        : raw
    return {
      companyName:  extractTag(block, 'corpNm'),
      licenseNo:    extractTag(block, 'lcnsNo'),
      bizCategory:  extractTag(block, 'bsnsDivNm'),
      registeredAt,
    }
  })
}

// ── Route handler ──────────────────────────────────────────────────────────

const API_URLS: Record<LicenseType, string> = {
  general:   'https://apis.data.go.kr/1613000/ConstBizInforService/getConstBizList',
  specialty: 'https://apis.data.go.kr/1613000/ConstSpecBizInforService/getConstSpecBizList',
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. 요청 파싱
  let body: { bizno?: string; licenseType?: LicenseType }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json<VerifyErrorResponse>(
      { success: false, message: '잘못된 요청 형식입니다.' },
      { status: 400 },
    )
  }

  const { bizno, licenseType } = body

  // 2. 입력 검증
  if (!bizno || !licenseType) {
    return NextResponse.json<VerifyErrorResponse>(
      { success: false, message: '사업자등록번호와 면허 유형을 입력해주세요.' },
      { status: 400 },
    )
  }

  const cleanBizno = bizno.replace(/-/g, '')
  if (!/^\d{10}$/.test(cleanBizno)) {
    return NextResponse.json<VerifyErrorResponse>(
      { success: false, message: '사업자등록번호 형식이 올바르지 않습니다. (XXX-XX-XXXXX)' },
      { status: 400 },
    )
  }

  // 3. API 키 없으면 mock 반환
  const apiKey = process.env.CONSTRUCTION_API_KEY
  if (!apiKey) {
    return NextResponse.json<VerifyResponse>({
      success: true,
      bizno: cleanBizno,
      licenseType,
      items: MOCK[licenseType],
      isMock: true,
    })
  }

  // 4. 실 API 호출
  const url = new URL(API_URLS[licenseType])
  url.searchParams.set('serviceKey', apiKey) // URL-decoded 형식으로 저장
  url.searchParams.set('pageNo',     '1')
  url.searchParams.set('numOfRows',  '20')
  url.searchParams.set('bizno',      cleanBizno)

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/xml' },
      signal: AbortSignal.timeout(8000), // Node 18+ 네이티브
    })

    if (!res.ok) {
      throw new Error(`upstream HTTP ${res.status}`)
    }

    const xml = await res.text()

    // data.go.kr 오류 코드 확인
    const resultCode = extractTag(xml, 'resultCode')
    if (resultCode && resultCode !== '00') {
      const resultMsg = extractTag(xml, 'resultMsg')
      return NextResponse.json<VerifyErrorResponse>(
        { success: false, message: `API 오류: ${resultMsg || resultCode}` },
        { status: 502 },
      )
    }

    const items = parseItems(xml)
    if (items.length === 0) {
      return NextResponse.json<VerifyErrorResponse>(
        { success: false, message: '해당 사업자번호로 등록된 건설업 면허를 찾을 수 없습니다.' },
        { status: 404 },
      )
    }

    return NextResponse.json<VerifyResponse>({
      success: true,
      bizno: cleanBizno,
      licenseType,
      items,
      isMock: false,
    })
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'TimeoutError'
    return NextResponse.json<VerifyErrorResponse>(
      {
        success: false,
        message: isTimeout
          ? '국토교통부 API 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.'
          : '면허 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      },
      { status: 503 },
    )
  }
}
