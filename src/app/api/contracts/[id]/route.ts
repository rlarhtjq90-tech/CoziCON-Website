import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = { params: Promise<{ id: string }> }

// 계약 상세 조회
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })

  const { id } = await params
  const companyId = session.user.companyId

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      notice: { select: { id: true, title: true, workTypes: true, regions: true, description: true } },
      submission: { select: { id: true, proposedPrice: true, description: true } },
      ownerCompany: { select: { id: true, name: true, bizNo: true, ceoName: true, address: true, phone: true } },
      contractorCompany: { select: { id: true, name: true, bizNo: true, ceoName: true, address: true, phone: true } },
    },
  })

  if (!contract) return NextResponse.json({ error: '계약을 찾을 수 없습니다.' }, { status: 404 })

  // 계약 당사자만 조회 가능
  if (contract.ownerCompanyId !== companyId && contract.contractorCompanyId !== companyId) {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 })
  }

  return NextResponse.json({ contract })
}

// 계약 조건 업데이트 (발주사만 가능, PENDING_OWNER 상태일 때만)
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })

  const { id } = await params
  const companyId = session.user.companyId

  const contract = await prisma.contract.findUnique({ where: { id } })
  if (!contract) return NextResponse.json({ error: '계약을 찾을 수 없습니다.' }, { status: 404 })
  if (contract.ownerCompanyId !== companyId) return NextResponse.json({ error: '권한 없음' }, { status: 403 })
  if (contract.status !== 'PENDING_OWNER') return NextResponse.json({ error: '이미 처리된 계약입니다.' }, { status: 400 })

  const { startDate, endDate, terms } = await req.json()

  const updated = await prisma.contract.update({
    where: { id },
    data: {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      terms: terms ?? undefined,
    },
  })

  return NextResponse.json({ contract: updated })
}
