import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

const IDENTIFIER_PREFIX = 'pw-reset:'

export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword } = await req.json()

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: '모든 항목을 입력해주세요.' }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: '비밀번호는 8자 이상이어야 합니다.' }, { status: 400 })
    }

    const identifier = `${IDENTIFIER_PREFIX}${email}`
    const record = await prisma.verificationToken.findFirst({ where: { identifier } })

    if (!record) {
      return NextResponse.json({ error: '인증번호를 먼저 요청해주세요.' }, { status: 400 })
    }

    if (record.expires < new Date()) {
      return NextResponse.json({ error: '인증번호가 만료됐습니다. 재발송 후 다시 시도하세요.' }, { status: 400 })
    }

    if (record.token !== code) {
      return NextResponse.json({ error: '인증번호가 올바르지 않습니다.' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { email },
      data: { password: hashed },
    })

    await prisma.verificationToken.deleteMany({ where: { identifier } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[reset-password] 오류:', err)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
