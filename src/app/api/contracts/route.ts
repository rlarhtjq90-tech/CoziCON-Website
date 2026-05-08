import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

// 내 계약 목록 조회 (발주사: 내 공고의 계약 / 건설사: 내가 낙찰받은 계약)
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })

  const companyId = session.user.companyId
  if (!companyId) return NextResponse.json({ contracts: [] })

  const contracts = await prisma.contract.findMany({
    where: {
      OR: [
        { ownerCompanyId: companyId },
        { contractorCompanyId: companyId },
      ],
    },
    include: {
      notice: { select: { id: true, title: true, workTypes: true, regions: true } },
      ownerCompany: { select: { id: true, name: true } },
      contractorCompany: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ contracts })
}
