import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

type Props = { params: Promise<{ companyId: string }> }

export async function GET(_req: NextRequest, { params }: Props): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { companyId } = await params

  const portfolios = await prisma.portfolio.findMany({
    where: { companyId },
    orderBy: { startDate: 'desc' },
  })

  return NextResponse.json({ portfolios })
}
