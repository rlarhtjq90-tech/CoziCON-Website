import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserType } from '@prisma/client'

interface SetupRequest {
  bizNo: string
  companyName: string
  ceoName: string
  bizDocUrl?: string | null
  ntsVerified: boolean
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  let body: SetupRequest
  try { body = await req.json() }
  catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const { bizNo, companyName, ceoName, bizDocUrl, ntsVerified } = body
  const cleanBizNo = bizNo.replace(/-/g, '')

  if (!cleanBizNo || !companyName || !ceoName) {
    return NextResponse.json({ error: '필수 항목을 모두 입력해주세요.' }, { status: 400 })
  }
  if (!ntsVerified) {
    return NextResponse.json({ error: '사업자 진위확인이 완료되지 않았습니다.' }, { status: 400 })
  }

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!dbUser?.userType) {
    return NextResponse.json({ error: '회원 유형 정보가 없습니다.' }, { status: 400 })
  }

  try {
    const existingCompany = await prisma.company.findUnique({ where: { bizNo: cleanBizNo } })
    if (existingCompany && existingCompany.id !== dbUser.companyId) {
      return NextResponse.json({ error: '이미 등록된 사업자번호입니다.' }, { status: 409 })
    }

    const company = await prisma.company.upsert({
      where: { bizNo: cleanBizNo },
      create: {
        bizNo: cleanBizNo,
        name: companyName,
        ceoName,
        type: dbUser.userType as UserType,
        businessVerified: true,
        bizDocUrl: bizDocUrl ?? null,
      },
      update: {
        name: companyName,
        ceoName,
        businessVerified: true,
        bizDocUrl: bizDocUrl ?? undefined,
      },
    })

    await prisma.companyVerification.create({
      data: {
        companyId: company.id,
        bizNo: cleanBizNo,
        result: 'VALID',
        responseData: { source: 'nts', verifiedAt: new Date().toISOString() },
        verifiedBy: session.user.id,
      },
    })

    await prisma.user.update({
      where: { id: session.user.id },
      data: { companyId: company.id },
    })

    return NextResponse.json({ companyId: company.id }, { status: 201 })
  } catch (err) {
    console.error('[company/setup] error:', err)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
