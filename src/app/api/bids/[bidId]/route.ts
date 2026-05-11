import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = { params: Promise<{ bidId: string }> }

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })

  const { bidId } = await params

  const submission = await prisma.bidSubmission.findUnique({
    where: { id: bidId },
    include: {
      notice: { select: { id: true, authorId: true, companyId: true, constructionStart: true, constructionEnd: true } },
    },
  })

  if (!submission) return NextResponse.json({ error: '입찰을 찾을 수 없습니다.' }, { status: 404 })
  if (submission.notice.authorId !== session.user.id) return NextResponse.json({ error: '권한 없음' }, { status: 403 })

  const { status } = await req.json()
  const allowed = ['REVIEWED', 'ACCEPTED', 'REJECTED']
  if (!allowed.includes(status)) return NextResponse.json({ error: '유효하지 않은 상태입니다.' }, { status: 400 })

  const updated = await prisma.bidSubmission.update({
    where: { id: bidId },
    data: { status },
  })

  // 낙찰 처리 시 계약 자동 생성
  if (status === 'ACCEPTED') {
    const existing = await prisma.contract.findUnique({ where: { submissionId: bidId } })
    if (!existing) {
      await prisma.contract.create({
        data: {
          noticeId: submission.noticeId,
          submissionId: bidId,
          gcCompanyId: submission.notice.companyId,
          scCompanyId: submission.companyId,
          contractAmount: submission.proposedPrice,
          startDate: submission.notice.constructionStart,
          endDate: submission.notice.constructionEnd,
        },
      })
    }
  }

  return NextResponse.json({ id: updated.id, status: updated.status })
}
