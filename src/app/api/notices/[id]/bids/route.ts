import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = { params: Promise<{ id: string }> }

// 건설사: 입찰 제출
export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })

  const { id: noticeId } = await params

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { userType: true, status: true, companyId: true },
  })

  if (!user?.companyId) return NextResponse.json({ error: '회사 정보가 없습니다.' }, { status: 403 })
  if (user.userType === 'GENERAL_CONTRACTOR') return NextResponse.json({ error: '종합건설사는 입찰할 수 없습니다.' }, { status: 403 })
  if (user.status !== 'ACTIVE') return NextResponse.json({ error: '승인된 계정만 입찰할 수 있습니다.' }, { status: 403 })

  const notice = await prisma.bidNotice.findUnique({ where: { id: noticeId } })
  if (!notice || notice.status !== 'OPEN') return NextResponse.json({ error: '모집중인 공고가 아닙니다.' }, { status: 400 })
  if (notice.deadline < new Date()) return NextResponse.json({ error: '마감된 공고입니다.' }, { status: 400 })

  const existing = await prisma.bidSubmission.findUnique({
    where: { noticeId_companyId: { noticeId, companyId: user.companyId } },
  })
  if (existing) return NextResponse.json({ error: '이미 입찰한 공고입니다.' }, { status: 409 })

  const { proposedPrice, description } = await req.json()

  const submission = await prisma.bidSubmission.create({
    data: {
      noticeId,
      companyId: user.companyId,
      bidderId: session.user.id,
      proposedPrice: proposedPrice ? BigInt(proposedPrice) : null,
      description: description ?? null,
    },
  })

  return NextResponse.json({ id: submission.id }, { status: 201 })
}

// 발주사: 해당 공고의 입찰 목록 조회
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })

  const { id: noticeId } = await params

  const notice = await prisma.bidNotice.findUnique({ where: { id: noticeId } })
  if (!notice) return NextResponse.json({ error: '공고를 찾을 수 없습니다.' }, { status: 404 })
  if (notice.authorId !== session.user.id) return NextResponse.json({ error: '권한 없음' }, { status: 403 })

  const submissions = await prisma.bidSubmission.findMany({
    where: { noticeId },
    include: {
      company: { select: { name: true, type: true } },
      bidder: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(
    submissions.map((s) => ({
      ...s,
      proposedPrice: s.proposedPrice?.toString() ?? null,
    }))
  )
}
