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

// ── KISCON ConAdminInfoSvc1 ─────────────────────────────────────────────────
// GongsiReg: 건설업체 등록 공시 목록 (날짜 범위 조회 후 bizno 필터링)
// 응답 필드: ncrGsKname(업체명), ncrMasterNum(사업자번호),
//           ncrItemName(등록업종), ncrItemregno(업종등록번호), ncrGsDate(등록일자)

const BASE_URL = 'https://apis.data.go.kr/1613000/ConAdminInfoSvc1'

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))
  return match ? match[1].trim() : ''
}

function formatDate(raw: string): string {
  if (raw.length === 8) return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
  return raw
}

// GongsiReg XML에서 특정 사업자번호에 해당하는 item 파싱
function parseGongsiItems(xml: string, cleanBizno: string): LicenseItem[] {
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/g) ?? []
  const matched: LicenseItem[] = []

  for (const block of blocks) {
    const bizno = extractTag(block, 'ncrMasterNum').replace(/-/g, '')
    if (bizno !== cleanBizno) continue

    // 철회된 공시는 제외
    const flag = extractTag(block, 'ncrGsFlag')
    if (flag === '철회') continue

    matched.push({
      companyName:  extractTag(block, 'ncrGsKname'),
      licenseNo:    extractTag(block, 'ncrItemregno') || '-',
      bizCategory:  extractTag(block, 'ncrItemName'),
      registeredAt: formatDate(extractTag(block, 'ncrGsDate')),
    })
  }

  return matched
}

function normalizeApiKey(key: string): string {
  try { return encodeURIComponent(decodeURIComponent(key)) }
  catch { return encodeURIComponent(key) }
}

// 오늘 기준 날짜 문자열 (YYYYMMDD)
function today(): string {
  return new Date().toISOString().slice(0, 10).replace(/-/g, '')
}

// ── GET: 연결 진단 (/api/verify-license) ───────────────────────────────────

export async function GET(): Promise<NextResponse> {
  const apiKey = process.env.CONSTRUCTION_API_KEY
  const info: Record<string, unknown> = {
    region:       process.env.VERCEL_REGION ?? 'local',
    hasApiKey:    !!apiKey,
    apiKeyLength: apiKey?.length ?? 0,
    apiKeyPreview: apiKey ? `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}` : null,
    operation:    'GongsiReg',
    baseUrl:      BASE_URL,
    timestamp:    new Date().toISOString(),
  }

  if (apiKey) {
    const url = `${BASE_URL}/GongsiReg?serviceKey=${normalizeApiKey(apiKey)}&pageNo=1&numOfRows=1&sDate=20240101&eDate=${today()}`
    try {
      const res  = await fetch(url, { headers: { Accept: 'application/xml' }, signal: AbortSignal.timeout(10000) })
      const body = await res.text()
      info.apiConnectivity = 'ok'
      info.httpStatus      = res.status
      info.resultCode      = extractTag(body, 'resultCode') || '(없음)'
      info.resultMsg       = extractTag(body, 'resultMsg')  || '(없음)'
      info.totalCount      = extractTag(body, 'totalCount') || '(없음)'
      info.xmlSnippet      = body.slice(0, 400)
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
  try { body = await req.json() }
  catch {
    return NextResponse.json<VerifyErrorResponse>(
      { success: false, message: '잘못된 요청 형식입니다.' }, { status: 400 },
    )
  }

  const { bizno, licenseType } = body
  if (!bizno || !licenseType) {
    return NextResponse.json<VerifyErrorResponse>(
      { success: false, message: '사업자등록번호와 면허 유형을 입력해주세요.' }, { status: 400 },
    )
  }

  const cleanBizno = bizno.replace(/-/g, '')
  if (!/^\d{10}$/.test(cleanBizno)) {
    return NextResponse.json<VerifyErrorResponse>(
      { success: false, message: '사업자등록번호 형식이 올바르지 않습니다. (XXX-XX-XXXXX)' }, { status: 400 },
    )
  }

  const apiKey = process.env.CONSTRUCTION_API_KEY
  if (!apiKey) {
    return NextResponse.json<VerifyResponse>({
      success: true, bizno: cleanBizno, licenseType,
      items: MOCK[licenseType], isMock: true,
    })
  }

  const key = normalizeApiKey(apiKey)

  // GongsiReg: 최근 15년치 조회 후 사업자번호 필터링
  // numOfRows=100으로 한 번에 최대한 많이 가져옴
  const eDate = today()
  const sDate = '20100101'
  const url = `${BASE_URL}/GongsiReg?serviceKey=${key}&pageNo=1&numOfRows=100&sDate=${sDate}&eDate=${eDate}`

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/xml' },
      signal: AbortSignal.timeout(15000),
    })

    const xml = await res.text()
    console.log('[verify-license] GongsiReg status:', res.status, 'snippet:', xml.slice(0, 200))

    if (!res.ok) {
      console.error('[verify-license] HTTP error:', res.status)
      return NextResponse.json<VerifyResponse>({
        success: true, bizno: cleanBizno, licenseType,
        items: MOCK[licenseType], isMock: true,
      })
    }

    const resultCode = extractTag(xml, 'resultCode')
    if (resultCode && resultCode !== '00') {
      console.error('[verify-license] API error:', resultCode, extractTag(xml, 'resultMsg'))
      return NextResponse.json<VerifyResponse>({
        success: true, bizno: cleanBizno, licenseType,
        items: MOCK[licenseType], isMock: true,
      })
    }

    const items = parseGongsiItems(xml, cleanBizno)

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
    console.error('[verify-license] error:', err)
    return NextResponse.json<VerifyResponse>({
      success: true, bizno: cleanBizno, licenseType,
      items: MOCK[licenseType], isMock: true,
    })
  }
}
