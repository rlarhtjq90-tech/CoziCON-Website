import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { prisma } from '@/lib/db'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: '올바른 이메일 주소를 입력해주세요.' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: '이미 사용 중인 이메일입니다.' }, { status: 409 })
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    const expires = new Date(Date.now() + 3 * 60 * 1000)

    await prisma.verificationToken.deleteMany({ where: { identifier: email } })
    await prisma.verificationToken.create({ data: { identifier: email, token: otp, expires } })

    await transporter.sendMail({
      from: `CoziCON <${process.env.GMAIL_USER}>`,
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
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
