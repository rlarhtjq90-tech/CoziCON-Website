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

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      licenses: { where: { isActive: true }, orderBy: { createdAt: 'asc' } },
    },
  })

  if (!company) return NextResponse.json({ error: '회사를 찾을 수 없습니다.' }, { status: 404 })

  return NextResponse.json({ company })
}
