import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'

const IDENTIFIER_PREFIX = 'pw-reset:'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: '올바른 이메일 주소를 입력해주세요.' }, { status: 400 })
    }

    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
      return NextResponse.json({ error: '이메일 발송 서비스가 설정되지 않았습니다. 관리자에게 문의해주세요.' }, { status: 500 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    console.log('[forgot-password] email:', email, 'user:', !!user, 'password:', !!user?.password)

    if (!user) {
      // anti-enumeration: 미가입 이메일도 성공 응답
      return NextResponse.json({ success: true })
    }
    if (!user.password) {
      return NextResponse.json(
        { error: '소셜 로그인(Google)으로 가입된 계정입니다. Google 로그인을 이용해주세요.' },
        { status: 400 }
      )
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    const expires = new Date(Date.now() + 3 * 60 * 1000)
    const identifier = `${IDENTIFIER_PREFIX}${email}`

    await prisma.verificationToken.deleteMany({ where: { identifier } })
    await prisma.verificationToken.create({ data: { identifier, token: otp, expires } })

    await sendPasswordResetEmail(email, otp)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[forgot-password] 오류:', err)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
