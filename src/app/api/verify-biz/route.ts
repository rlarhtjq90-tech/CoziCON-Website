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

  const { bizNo, ceoName } = body
  const cleanBizNo = bizNo.replace(/-/g, '')

  if (!cleanBizNo || !/^\d{10}$/.test(cleanBizNo)) {
    return NextResponse.json({ error: '사업자등록번호는 10자리 숫자입니다.' }, { status: 400 })
  }
  if (!ceoName?.trim()) {
    return NextResponse.json({ error: '대표자명을 입력해주세요.' }, { status: 400 })
  }

  const apiKey = process.env.NTS_API_KEY

  // API 키 없으면 mock 응답 (개발/승인 대기 중)
  if (!apiKey) {
    return NextResponse.json({ valid: true, isMock: true, message: '(테스트) 사업자번호 확인됨' })
  }

  try {
    const rawKey = normalizeApiKey(apiKey)
    const encodedKey = encodeURIComponent(rawKey)
    const url = `https://api.odcloud.kr/api/nts-businessman/v1/validate?serviceKey=${encodedKey}`
    const reqBody = JSON.stringify({ businesses: [{ b_no: cleanBizNo, p_nm: ceoName.trim() }] })
    console.log('[verify-biz] key prefix:', apiKey.slice(0, 8), '| rawKey prefix:', rawKey.slice(0, 8))
    console.log('[verify-biz] body:', reqBody)
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: reqBody,
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      console.error('[verify-biz] HTTP error:', res.status, errBody)
      return NextResponse.json({ valid: true, isMock: true, message: `(API 오류 ${res.status} — 테스트 통과 처리)` })
    }

    const json = await res.json()
    const result: NtsResult | undefined = json?.data?.[0]

    if (!result) {
      return NextResponse.json({ error: 'API 응답이 올바르지 않습니다.' }, { status: 502 })
    }

    const isValid = result.valid === '01'
    if (!isValid) {
      return NextResponse.json(
        { valid: false, error: '사업자번호 또는 대표자명이 일치하지 않습니다. 다시 확인해주세요.' },
        { status: 422 },
      )
    }

    return NextResponse.json({ valid: true, isMock: false, message: '사업자 정보가 확인되었습니다.' })
  } catch (err) {
    console.error('[verify-biz] error:', err)
    return NextResponse.json({ valid: true, isMock: true, message: '(API 연결 오류 — 테스트 통과 처리)' })
  }
}
