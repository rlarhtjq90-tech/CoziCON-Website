import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true, userType: true },
  })
  if (!user?.companyId) {
    return NextResponse.json({ portfolios: [] })
  }

  const portfolios = await prisma.portfolio.findMany({
    where: { companyId: user.companyId },
    orderBy: { startDate: 'desc' },
  })

  return NextResponse.json({
    portfolios: portfolios.map(p => ({ ...p, amount: p.amount !== null ? Number(p.amount) : null }))
  })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true, userType: true },
  })

  if (user?.userType !== 'SPECIALTY_CONTRACTOR') {
    return NextResponse.json({ error: '전문건설사만 포트폴리오를 등록할 수 있습니다.' }, { status: 403 })
  }
  if (!user.companyId) {
    return NextResponse.json({ error: '회사 정보가 없습니다.' }, { status: 400 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const { title, client, startDate, endDate, amount, workCategory, description, docUrl } = body as {
    title: string
    client: string
    startDate: string
    endDate: string
    amount?: number
    workCategory: string
    description?: string
    docUrl?: string
  }

  if (!title || !client || !startDate || !endDate || !workCategory) {
    return NextResponse.json({ error: '필수 항목을 모두 입력해주세요.' }, { status: 400 })
  }

  const portfolio = await prisma.portfolio.create({
    data: {
      companyId: user.companyId,
      title,
      client,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      amount: amount ? BigInt(Math.round(amount)) : null,
      workCategory,
      description: description ?? null,
      docUrl: docUrl ?? null,
    },
  })

  return NextResponse.json({
    portfolio: { ...portfolio, amount: portfolio.amount !== null ? Number(portfolio.amount) : null }
  }, { status: 201 })
}
