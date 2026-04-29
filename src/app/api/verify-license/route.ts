import { NextRequest, NextResponse } from 'next/server'

export const preferredRegion = 'icn1'
export const maxDuration = 20

// ── Types ──────────────────────────────────────────────────────────────────

export type LicenseType = 'general' | 'specialty'

export interface LicenseItem {
  companyName: string
  licenseNo: string
  bizCategory: string
  registeredAt: string
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
  debug?: string
}

// ── Mock data ──────────────────────────────────────────────────────────────

const MOCK: Record<LicenseType, LicenseItem[]> = {
  general: [
    { companyName: '(주)한국종합건설', licenseNo: 'A0001234', bizCategory: '토목공사업',        registeredAt: '2018-03-15' },
    { companyName: '(주)한국종합건설', licenseNo: 'A0001235', bizCategory: '건축공사업',        registeredAt: '2018-03-15' },
    { companyName: '(주)한국종합건설', licenseNo: 'A0001236', bizCategory: '산업환경설비공사업', registeredAt: '2020-07-22' },
  ],
  specialty: [
    { companyName: '(주)전문시공테크', licenseNo: 'S0009876', bizCategory: '철근콘크리트공사업',   registeredAt: '2019-05-10' },
    { companyName: '(주)전문시공테크', licenseNo: 'S0009877', bizCategory: '금속구조물·창호공사업', registeredAt: '2021-01-03' },
  ],
}

// ── XML 파서 ────────────────────────────────────────────────────────────────

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))
  return match ? match[1].trim() : ''
}

function parseItems(xml: string): LicenseItem[] {
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/g) ?? []
  return blocks.map((block): LicenseItem => {
    const raw = extractTag(block, 'rgndt')
    const registeredAt =
      raw.length === 8
        ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
        : raw
    return {
      companyName: extractTag(block, 'corpNm'),
      licenseNo:   extractTag(block, 'lcnsNo'),
      bizCategory: extractTag(block, 'bsnsDivNm'),
      registeredAt,
    }
  })
}

// data.go.kr 인증키 인코딩 정규화 (인코딩/디코딩 키 모두 처리)
function normalizeApiKey(key: string): string {
  try {
    return encodeURIComponent(decodeURIComponent(key))
  } catch {
    return encodeURIComponent(key)
  }
}

const API_URLS: Record<LicenseType, string> = {
  general:   'https://apis.data.go.kr/1613000/ConstBizInforService/getConstBizList',
  specialty: 'https://apis.data.go.kr/1613000/ConstSpecBizInforService/getConstSpecBizList',
}

// ── GET: 연결 진단 (/api/verify-license) ───────────────────────────────────

export async function GET(): Promise<NextResponse> {
  const apiKey = process.env.CONSTRUCTION_API_KEY
  const info: Record<string, unknown> = {
    region:        process.env.VERCEL_REGION ?? 'local',
    hasApiKey:     !!apiKey,
    apiKeyLength:  apiKey?.length ?? 0,
    apiKeyPreview: apiKey ? `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}` : null,
    timestamp:     new Date().toISOString(),
  }

  if (apiKey) {
    const testUrl = `${API_URLS.general}?serviceKey=${normalizeApiKey(apiKey)}&pageNo=1&numOfRows=1&bizno=0000000000`
    try {
      const res = await fetch(testUrl, {
        headers: { Accept: 'application/xml' },
        signal: AbortSignal.timeout(10000),
      })
      const xml = await res.text()
      info.apiConnectivity = 'ok'
      info.httpStatus      = res.status
      info.resultCode      = extractTag(xml, 'resultCode') || '(없음)'
      info.resultMsg       = extractTag(xml, 'resultMsg')  || '(없음)'
      info.xmlSnippet      = xml.slice(0, 300)
    } catch (err) {
      info.apiConnectivity = 'failed'
      info.connectError    = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
    }
  }

  return NextResponse.json(info)
}

// ── POST: 면허 조회 ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
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

  // API 키 없으면 mock 반환
  const apiKey = process.env.CONSTRUCTION_API_KEY
  if (!apiKey) {
    return NextResponse.json<VerifyResponse>({
      success: true, bizno: cleanBizno, licenseType,
      items: MOCK[licenseType], isMock: true,
    })
  }

  // 실 API 호출
  const params  = new URLSearchParams({ pageNo: '1', numOfRows: '20', bizno: cleanBizno })
  const fullUrl = `${API_URLS[licenseType]}?serviceKey=${normalizeApiKey(apiKey)}&${params.toString()}`

  try {
    const res = await fetch(fullUrl, {
      headers: { Accept: 'application/xml' },
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      const msg = `upstream HTTP ${res.status} ${res.statusText}`
      console.error('[verify-license]', msg)
      // HTTP 오류 → mock fallback
      return NextResponse.json<VerifyResponse>({
        success: true, bizno: cleanBizno, licenseType,
        items: MOCK[licenseType], isMock: true,
      })
    }

    const xml        = await res.text()
    const resultCode = extractTag(xml, 'resultCode')
    const resultMsg  = extractTag(xml, 'resultMsg')

    // API 오류 코드 처리
    if (resultCode && resultCode !== '00') {
      console.error('[verify-license] API error:', resultCode, resultMsg)

      // 인증 오류·서비스 미신청 → mock fallback (사용자는 데모라도 볼 수 있도록)
      if (['12', '20', '22', '30', '31', '32'].includes(resultCode)) {
        return NextResponse.json<VerifyResponse>({
          success: true, bizno: cleanBizno, licenseType,
          items: MOCK[licenseType], isMock: true,
        })
      }

      return NextResponse.json<VerifyErrorResponse>(
        {
          success: false,
          message: `API 오류 [${resultCode}]: ${resultMsg || '알 수 없는 오류'}`,
          debug: `resultCode=${resultCode}`,
        },
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
      success: true, bizno: cleanBizno, licenseType, items, isMock: false,
    })

  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'TimeoutError'
    const debugMsg  = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
    console.error('[verify-license] fetch error:', debugMsg)

    // 네트워크 오류·타임아웃 → mock fallback
    return NextResponse.json<VerifyResponse>({
      success: true, bizno: cleanBizno, licenseType,
      items: MOCK[licenseType], isMock: true,
    })
  }
}
