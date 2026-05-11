import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = { params: Promise<{ contractId: string }> }

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })

  const { contractId } = await params
  const { action } = await req.json()

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true },
  })
  if (!user?.companyId) return NextResponse.json({ error: '회사 정보 없음' }, { status: 403 })

  const contract = await prisma.contract.findUnique({ where: { id: contractId } })
  if (!contract) return NextResponse.json({ error: '계약을 찾을 수 없습니다.' }, { status: 404 })

  const isGC = contract.gcCompanyId === user.companyId
  const isSC = contract.scCompanyId === user.companyId
  if (!isGC && !isSC) return NextResponse.json({ error: '권한 없음' }, { status: 403 })

  // 서명 처리
  if (action === 'sign') {
    const role = isGC ? 'GC' : 'SC'
    await prisma.contractSign.upsert({
      where: { contractId_role: { contractId, role } },
      create: { contractId, userId: session.user.id, role },
      update: { signedAt: new Date() },
    })

    const now = new Date()
    let nextStatus = contract.status

    if (role === 'GC') {
      await prisma.contract.update({ where: { id: contractId }, data: { gcSignedAt: now } })
      if (contract.scSignedAt) nextStatus = 'ACTIVE'
      else nextStatus = 'GC_SIGNED'
    } else {
      await prisma.contract.update({ where: { id: contractId }, data: { scSignedAt: now } })
      if (contract.gcSignedAt) nextStatus = 'ACTIVE'
    }

    const updated = await prisma.contract.update({
      where: { id: contractId },
      data: { status: nextStatus },
    })
    return NextResponse.json({ id: updated.id, status: updated.status })
  }

  // 상태 변경 (발주사만: COMPLETED, TERMINATED)
  if (action === 'complete' || action === 'terminate') {
    if (!isGC) return NextResponse.json({ error: '발주사만 변경 가능합니다.' }, { status: 403 })
    const newStatus = action === 'complete' ? 'COMPLETED' : 'TERMINATED'
    const updated = await prisma.contract.update({
      where: { id: contractId },
      data: { status: newStatus },
    })
    return NextResponse.json({ id: updated.id, status: updated.status })
  }

  return NextResponse.json({ error: '유효하지 않은 액션' }, { status: 400 })
}
