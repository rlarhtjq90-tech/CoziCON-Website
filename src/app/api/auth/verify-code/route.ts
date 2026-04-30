import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json()

    if (!email || !code) {
      return NextResponse.json({ error: '이메일과 인증번호를 입력해주세요.' }, { status: 400 })
    }

    const record = await prisma.verificationToken.findFirst({ where: { identifier: email } })

    if (!record) {
      return NextResponse.json({ error: '인증번호를 먼저 요청해주세요.' }, { status: 400 })
    }

    if (record.expires < new Date()) {
      return NextResponse.json({ error: '인증번호가 만료됐습니다. 재발송 후 다시 시도하세요.' }, { status: 400 })
    }

    if (record.token !== code) {
      return NextResponse.json({ error: '인증번호가 올바르지 않습니다.' }, { status: 400 })
    }

    return NextResponse.json({ verified: true })
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
