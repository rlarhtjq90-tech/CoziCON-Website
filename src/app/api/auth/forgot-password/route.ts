import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/db'

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

    // 가입된 이메일인지 확인
    const user = await prisma.user.findUnique({ where: { email } })
    console.log('[forgot-password] email:', email, 'user:', !!user, 'password:', !!user?.password)

    if (!user) {
      // 미가입 이메일 — 보안상 성공과 동일 응답 (anti-enumeration)
      return NextResponse.json({ success: true })
    }
    if (!user.password) {
      // 소셜 로그인(Google 등)으로 가입된 계정
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

    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error: sendError } = await resend.emails.send({
      from: `CoziCON <${process.env.RESEND_FROM_EMAIL}>`,
      to: email,
      subject: '[CoziCON] 비밀번호 재설정 인증번호',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 24px">
          <h2 style="color:#1a2dff;margin-bottom:8px">CoziCON 비밀번호 재설정</h2>
          <p style="color:#555;margin-bottom:24px">아래 인증번호를 3분 이내에 입력해주세요.</p>
          <div style="background:#f3f6fc;border-radius:12px;padding:24px;text-align:center">
            <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#1a2dff">${otp}</span>
          </div>
          <p style="color:#999;font-size:13px;margin-top:24px">
            본인이 요청하지 않은 경우 이 이메일을 무시하세요.
          </p>
        </div>
      `,
    })

    if (sendError) {
      console.error('[forgot-password] Resend 발송 오류:', sendError)
      return NextResponse.json({ error: '이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[forgot-password] 오류:', err)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
