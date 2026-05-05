import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { UserType } from '@prisma/client'

const VALID_USER_TYPES: UserType[] = ['GENERAL_CONTRACTOR', 'SPECIALTY_CONTRACTOR']
const TERMS_VERSION = '2026-05-01'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, code, userType, termsAgreed } = await req.json()

    if (!email || !password || !code) {
      return NextResponse.json({ error: '이메일, 비밀번호, 인증번호를 모두 입력해주세요.' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: '비밀번호는 8자 이상이어야 합니다.' }, { status: 400 })
    }
    if (!userType || !VALID_USER_TYPES.includes(userType)) {
      return NextResponse.json({ error: '회원 유형을 선택해주세요.' }, { status: 400 })
    }
    if (!termsAgreed) {
      return NextResponse.json({ error: '약관에 동의해주세요.' }, { status: 400 })
    }

    // 인증번호 최종 검증
    const record = await prisma.verificationToken.findFirst({ where: { identifier: email } })
    if (!record) {
      return NextResponse.json({ error: '이메일 인증을 먼저 완료해주세요.' }, { status: 400 })
    }
    if (record.expires < new Date()) {
      return NextResponse.json({ error: '인증번호가 만료됐습니다. 재발송 후 다시 시도하세요.' }, { status: 400 })
    }
    if (record.token !== code) {
      return NextResponse.json({ error: '인증번호가 올바르지 않습니다.' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: '이미 사용 중인 이메일입니다.' }, { status: 409 })
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? req.headers.get('x-real-ip') ?? null

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        emailVerified: new Date(),
        userType,
        status: 'PENDING',
        termsConsents: {
          create: { termsVersion: TERMS_VERSION, ipAddress: ip },
        },
      },
    })

    await prisma.verificationToken.deleteMany({ where: { identifier: email } })

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
