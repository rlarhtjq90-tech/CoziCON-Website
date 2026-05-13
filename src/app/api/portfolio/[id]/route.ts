import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

type Props = { params: Promise<{ id: string }> }

async function getOwnedPortfolio(portfolioId: string, userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { companyId: true, userType: true },
  })
  if (!user?.companyId || user.userType !== 'SPECIALTY_CONTRACTOR') return null

  const portfolio = await prisma.portfolio.findUnique({ where: { id: portfolioId } })
  if (!portfolio || portfolio.companyId !== user.companyId) return null
  return portfolio
}

export async function PATCH(req: NextRequest, { params }: Props): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { id } = await params
  const portfolio = await getOwnedPortfolio(id, session.user.id)
  if (!portfolio) {
    return NextResponse.json({ error: '포트폴리오를 찾을 수 없습니다.' }, { status: 404 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const { title, client, startDate, endDate, amount, workCategory, description, docUrl } = body as {
    title?: string; client?: string; startDate?: string; endDate?: string
    amount?: number; workCategory?: string; description?: string; docUrl?: string
  }

  const updated = await prisma.portfolio.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(client && { client }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
      ...(workCategory && { workCategory }),
      amount: amount !== undefined ? BigInt(Math.round(amount)) : portfolio.amount,
      description: description ?? portfolio.description,
      docUrl: docUrl ?? portfolio.docUrl,
    },
  })

  return NextResponse.json({
    portfolio: { ...updated, amount: updated.amount !== null ? Number(updated.amount) : null }
  })
}

export async function DELETE(_req: NextRequest, { params }: Props): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { id } = await params
  const portfolio = await getOwnedPortfolio(id, session.user.id)
  if (!portfolio) {
    return NextResponse.json({ error: '포트폴리오를 찾을 수 없습니다.' }, { status: 404 })
  }

  await prisma.portfolio.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
