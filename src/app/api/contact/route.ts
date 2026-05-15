import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: Request) {
  try {
    const { name, email, company, subject, message } = await req.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 })
    }

    const adminEmail = process.env.ADMIN_CONTACT_EMAIL ?? process.env.ADMIN_EMAILS?.split(',')[0]?.trim()
    const apiKey = process.env.RESEND_API_KEY
    const from = process.env.RESEND_FROM_EMAIL

    if (apiKey && from && adminEmail) {
      const resend = new Resend(apiKey)
      await resend.emails.send({
        from: `CastBid <${from}>`,
        to: adminEmail,
        subject: `[1:1 문의] ${subject} — ${name}`,
        html: `<div style="font-family:sans-serif;max-width:480px">
          <h2>[1:1 문의] ${subject}</h2>
          <p><b>이름:</b> ${name}</p>
          <p><b>이메일:</b> ${email}</p>
          <p><b>회사:</b> ${company || '—'}</p>
          <hr/>
          <p style="white-space:pre-wrap">${message}</p>
        </div>`,
      })
    } else {
      console.log('[contact] 이메일 미설정 — 문의 내용 로그:', { name, email, company, subject, message })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contact]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
