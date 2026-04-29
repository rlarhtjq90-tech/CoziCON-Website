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
    { companyName: '(주)한국종합건설', licenseNo: 'A0001234', bizCategory: '토목공사업',         registeredAt: '2018-03-15' },
    { companyName: '(주)한국종합건설', licenseNo: 'A0001235', bizCategory: '건축공사업',         registeredAt: '2018-03-15' },
    { companyName: '(주)한국종합건설', licenseNo: 'A0001236', bizCategory: '산업환경설비공사업',  registeredAt: '2020-07-22' },
  ],
  specialty: [
    { companyName: '(주)전문시공테크', licenseNo: 'S0009876', bizCategory: '철근콘크리트공사업',   registeredAt: '2019-05-10' },
    { companyName: '(주)전문시공테크', licenseNo: 'S0009877', bizCategory: '금속구조물·창호공사업', registeredAt: '2021-01-03' },
  ],
}

// ── KISCON ConAdminInfoSvc1 엔드포인트 ────────────────────────────────────
// 종합·전문 모두 같은 서비스에서 lcnsCl(면허구분코드)로 구분
// 오퍼레이션: getConBizIfo1 (사업자번호로 업체·면허정보 조회)

const BASE_URL = 'https://apis.data.go.kr/1613000/ConAdminInfoSvc1'

// lcnsCl 코드: 1=종합, 2=전문 (실제 코드는 XML 응답 확인 후 보정)
const LICENSE_CL: Record<LicenseType, string> = {
  general:   '1',
  specialty: '2',
}

// ── XML 파서 ────────────────────────────────────────────────────────────────

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))
  return match ? match[1].trim() : ''
}

// KISCON API 응답 필드 파싱
// 실제 필드명은 GET /api/verify-license 진단으로 xmlSnippet 확인 후 보정
function parseKisconItems(xml: string): LicenseItem[] {
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/g) ?? []
  return blocks.map((block): LicenseItem => {
    // 등록일: rgndt 또는 lcnsDt (YYYYMMDD)
    const rawDate = extractTag(block, 'rgndt') || extractTag(block, 'lcnsDt')
    const registeredAt =
      rawDate.length === 8
        ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
        : rawDate

    return {
      // 업체명: bzentyNm 또는 corpNm
      companyName:  extractTag(block, 'bzentyNm')  || extractTag(block, 'corpNm'),
      // 면허번호: lcnsNo
      licenseNo:    extractTag(block, 'lcnsNo'),
      // 업종명: lcnsCnstrtnbizNm 또는 bsnsDivNm
      bizCategory:  extractTag(block, 'lcnsCnstrtnbizNm') || extractTag(block, 'bsnsDivNm'),
      registeredAt,
    }
  })
}

// API 키 정규화 (인코딩 키·디코딩 키 모두 처리)
function normalizeApiKey(key: string): string {
  try {
    return encodeURIComponent(decodeURIComponent(key))
  } catch {
    return encodeURIComponent(key)
  }
}

// ── GET: 연결 진단 (/api/verify-license) ───────────────────────────────────

export async function GET(): Promise<NextResponse> {
  const apiKey = process.env.CONSTRUCTION_API_KEY
  const info: Record<string, unknown> = {
    region:        process.env.VERCEL_REGION ?? 'local',
    hasApiKey:     !!apiKey,
    apiKeyLength:  apiKey?.length ?? 0,
    apiKeyPreview: apiKey ? `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}` : null,
    endpoint:      `${BASE_URL}/getConBizIfo1`,
    timestamp:     new Date().toISOString(),
  }

  if (apiKey) {
    // 테스트: 실제 사업자번호 없이 오퍼레이션 호출 → XML 구조 확인
    const testUrl = `${BASE_URL}/getConBizIfo1?serviceKey=${normalizeApiKey(apiKey)}&pageNo=1&numOfRows=1&bzno=0000000000`
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
      info.xmlSnippet      = xml.slice(0, 600)   // 필드명 확인용 전체 스니펫
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

  const apiKey = process.env.CONSTRUCTION_API_KEY
  if (!apiKey) {
    return NextResponse.json<VerifyResponse>({
      success: true, bizno: cleanBizno, licenseType,
      items: MOCK[licenseType], isMock: true,
    })
  }

  // KISCON ConAdminInfoSvc1 호출
  // bzno: 사업자등록번호, lcnsCl: 면허구분 (종합=1, 전문=2)
  const params  = new URLSearchParams({
    pageNo:    '1',
    numOfRows: '20',
    bzno:      cleanBizno,
    lcnsCl:    LICENSE_CL[licenseType],
  })
  const fullUrl = `${BASE_URL}/getConBizIfo1?serviceKey=${normalizeApiKey(apiKey)}&${params.toString()}`

  try {
    const res = await fetch(fullUrl, {
      headers: { Accept: 'application/xml' },
      signal: AbortSignal.timeout(15000),
    })

    const xml = await res.text()
    console.log('[verify-license] raw XML:', xml.slice(0, 800))

    if (!res.ok) {
      console.error('[verify-license] HTTP error:', res.status, xml.slice(0, 200))
      // HTTP 오류 → mock fallback
      return NextResponse.json<VerifyResponse>({
        success: true, bizno: cleanBizno, licenseType,
        items: MOCK[licenseType], isMock: true,
      })
    }

    const resultCode = extractTag(xml, 'resultCode')
    const resultMsg  = extractTag(xml, 'resultMsg')

    if (resultCode && resultCode !== '00') {
      console.error('[verify-license] API error:', resultCode, resultMsg)
      // API 오류 → mock fallback
      return NextResponse.json<VerifyResponse>({
        success: true, bizno: cleanBizno, licenseType,
        items: MOCK[licenseType], isMock: true,
      })
    }

    const items = parseKisconItems(xml)

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
    const debugMsg = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
    console.error('[verify-license] fetch error:', debugMsg)
    // 네트워크 오류 → mock fallback
    return NextResponse.json<VerifyResponse>({
      success: true, bizno: cleanBizno, licenseType,
      items: MOCK[licenseType], isMock: true,
    })
  }
}
