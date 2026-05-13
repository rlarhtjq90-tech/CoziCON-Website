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

  const reviews = await prisma.companyReview.findMany({
    where: { targetCompanyId: companyId },
    include: {
      reviewerCompany: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const avg = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : null

  return NextResponse.json({ reviews, avg, count: reviews.length })
}

export async function POST(req: NextRequest, { params }: Props): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { companyId } = await params

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true, userType: true },
  })

  if (user?.userType !== 'GENERAL_CONTRACTOR') {
    return NextResponse.json({ error: '종합건설사만 리뷰를 작성할 수 있습니다.' }, { status: 403 })
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

  const { contractId, rating, comment } = body as {
    contractId: string; rating: number; comment?: string
  }

  if (!contractId || !rating) {
    return NextResponse.json({ error: '계약 ID와 평점은 필수입니다.' }, { status: 400 })
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: '평점은 1~5 사이 정수여야 합니다.' }, { status: 400 })
  }

  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    select: { gcCompanyId: true, scCompanyId: true, status: true, review: true },
  })

  if (!contract) {
    return NextResponse.json({ error: '계약을 찾을 수 없습니다.' }, { status: 404 })
  }
  if (contract.gcCompanyId !== user.companyId) {
    return NextResponse.json({ error: '해당 계약의 발주사가 아닙니다.' }, { status: 403 })
  }
  if (contract.scCompanyId !== companyId) {
    return NextResponse.json({ error: '계약의 수주사와 대상 회사가 일치하지 않습니다.' }, { status: 400 })
  }
  if (contract.status === 'PENDING') {
    return NextResponse.json({ error: '계약 성립 이후 리뷰를 작성할 수 있습니다.' }, { status: 400 })
  }
  if (contract.review) {
    return NextResponse.json({ error: '이미 리뷰를 작성했습니다.' }, { status: 409 })
  }

  const review = await prisma.companyReview.create({
    data: {
      contractId,
      reviewerCompanyId: user.companyId,
      targetCompanyId: companyId,
      rating,
      comment: comment ?? null,
    },
  })

  return NextResponse.json({ review }, { status: 201 })
}
