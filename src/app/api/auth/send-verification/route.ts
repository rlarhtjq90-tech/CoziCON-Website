import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendOtpEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: '올바른 이메일 주소를 입력해주세요.' }, { status: 400 })
    }

    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
      console.error('[send-verification] RESEND_API_KEY 또는 RESEND_FROM_EMAIL 환경변수가 설정되지 않았습니다.')
      return NextResponse.json({ error: '이메일 발송 서비스가 설정되지 않았습니다. 관리자에게 문의해주세요.' }, { status: 500 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: '이미 사용 중인 이메일입니다.' }, { status: 409 })
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    const expires = new Date(Date.now() + 3 * 60 * 1000)

    await prisma.verificationToken.deleteMany({ where: { identifier: email } })
    await prisma.verificationToken.create({ data: { identifier: email, token: otp, expires } })

    await sendOtpEmail(email, otp)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[send-verification] 오류:', err)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
