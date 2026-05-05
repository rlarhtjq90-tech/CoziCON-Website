import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 20

interface NtsResult {
  b_no: string
  valid: string      // '01' = 유효, '02' = 유효하지 않음
  valid_msg: string
}

interface VerifyBizRequest {
  bizNo: string     // 사업자번호 10자리
  ceoName: string   // 대표자명
  openDate: string  // 개업일 YYYYMMDD
}

function normalizeApiKey(key: string): string {
  try { return decodeURIComponent(key) } catch { return key }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: VerifyBizRequest
  try { body = await req.json() }
  catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 })
  }

  const { bizNo, ceoName, openDate } = body
  const cleanBizNo = bizNo.replace(/-/g, '')

  if (!cleanBizNo || !/^\d{10}$/.test(cleanBizNo)) {
    return NextResponse.json({ error: '사업자등록번호는 10자리 숫자입니다.' }, { status: 400 })
  }
  if (!ceoName?.trim()) {
    return NextResponse.json({ error: '대표자명을 입력해주세요.' }, { status: 400 })
  }
  if (!openDate || !/^\d{8}$/.test(openDate.replace(/-/g, ''))) {
    return NextResponse.json({ error: '개업일 형식이 올바르지 않습니다. (YYYY-MM-DD)' }, { status: 400 })
  }

  const cleanOpenDate = openDate.replace(/-/g, '')
  const apiKey = process.env.NTS_API_KEY

  // API 키 없으면 mock 응답 (개발/승인 대기 중)
  if (!apiKey) {
    return NextResponse.json({ valid: true, isMock: true, message: '(테스트) 사업자번호 확인됨' })
  }

  try {
    const url = `https://api.odcloud.kr/api/nts-businessman/v1/validate?serviceKey=${normalizeApiKey(apiKey)}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        businesses: [{
          b_no: cleanBizNo,
          start_dt: cleanOpenDate,
          p_nm: ceoName.trim(),
          p_nm2: '',
          b_nm: '',
          corp_no: '',
          b_sector: '',
          b_type: '',
        }],
      }),
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      console.error('[verify-biz] HTTP error:', res.status)
      return NextResponse.json({ valid: true, isMock: true, message: '(API 오류 — 테스트 통과 처리)' })
    }

    const json = await res.json()
    const result: NtsResult | undefined = json?.data?.[0]

    if (!result) {
      return NextResponse.json({ error: 'API 응답이 올바르지 않습니다.' }, { status: 502 })
    }

    const isValid = result.valid === '01'
    if (!isValid) {
      return NextResponse.json(
        { valid: false, error: '사업자번호, 대표자명 또는 개업일이 일치하지 않습니다. 다시 확인해주세요.' },
        { status: 422 },
      )
    }

    return NextResponse.json({ valid: true, isMock: false, message: '사업자 정보가 확인되었습니다.' })
  } catch (err) {
    console.error('[verify-biz] error:', err)
    return NextResponse.json({ valid: true, isMock: true, message: '(API 연결 오류 — 테스트 통과 처리)' })
  }
}
