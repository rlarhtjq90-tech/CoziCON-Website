import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/db'

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

    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: `CoziCON <${process.env.RESEND_FROM_EMAIL}>`,
      to: email,
      subject: '[CoziCON] 이메일 인증번호',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 24px">
          <h2 style="color:#1a2dff;margin-bottom:8px">CoziCON 이메일 인증</h2>
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

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[send-verification] 오류:', err)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
