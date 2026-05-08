import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = { params: Promise<{ id: string }> }

// 계약 서명 처리
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })

  const { id } = await params
  const companyId = session.user.companyId

  const contract = await prisma.contract.findUnique({ where: { id } })
  if (!contract) return NextResponse.json({ error: '계약을 찾을 수 없습니다.' }, { status: 404 })

  const isOwner = contract.ownerCompanyId === companyId
  const isContractor = contract.contractorCompanyId === companyId
  if (!isOwner && !isContractor) return NextResponse.json({ error: '권한 없음' }, { status: 403 })

  const now = new Date()

  if (isOwner) {
    if (contract.ownerSignedAt) return NextResponse.json({ error: '이미 서명하셨습니다.' }, { status: 400 })
    if (contract.status !== 'PENDING_OWNER') return NextResponse.json({ error: '서명 단계가 아닙니다.' }, { status: 400 })

    const updated = await prisma.contract.update({
      where: { id },
      data: {
        ownerSignedAt: now,
        status: 'PENDING_CONTRACTOR',
      },
    })
    return NextResponse.json({ contract: updated })
  }

  // 건설사 서명
  if (contract.contractorSignedAt) return NextResponse.json({ error: '이미 서명하셨습니다.' }, { status: 400 })
  if (contract.status !== 'PENDING_CONTRACTOR') return NextResponse.json({ error: '발주사 서명이 먼저 필요합니다.' }, { status: 400 })

  const updated = await prisma.contract.update({
    where: { id },
    data: {
      contractorSignedAt: now,
      status: 'ACTIVE',
    },
  })

  return NextResponse.json({ contract: updated })
}
