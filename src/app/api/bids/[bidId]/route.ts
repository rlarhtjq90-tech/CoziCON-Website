import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = { params: Promise<{ bidId: string }> }

// 발주사: 입찰 상태 변경 (ACCEPTED / REJECTED / REVIEWED)
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })

  const { bidId } = await params

  const submission = await prisma.bidSubmission.findUnique({
    where: { id: bidId },
    include: {
      notice: { select: { authorId: true, companyId: true, estimatedPrice: true } },
      company: { select: { id: true } },
    },
  })

  if (!submission) return NextResponse.json({ error: '입찰을 찾을 수 없습니다.' }, { status: 404 })
  if (submission.notice.authorId !== session.user.id) return NextResponse.json({ error: '권한 없음' }, { status: 403 })

  const { status } = await req.json()
  const allowed = ['REVIEWED', 'ACCEPTED', 'REJECTED']
  if (!allowed.includes(status)) return NextResponse.json({ error: '유효하지 않은 상태입니다.' }, { status: 400 })

  if (status === 'ACCEPTED') {
    // 트랜잭션: 낙찰 처리 + Contract 생성 + 공고 마감
    const [updated] = await prisma.$transaction([
      prisma.bidSubmission.update({ where: { id: bidId }, data: { status: 'ACCEPTED' } }),
      prisma.contract.create({
        data: {
          submissionId: bidId,
          noticeId: submission.noticeId,
          ownerCompanyId: submission.notice.companyId,
          contractorCompanyId: submission.companyId,
          contractAmount: submission.proposedPrice ?? submission.notice.estimatedPrice ?? BigInt(0),
          status: 'PENDING_OWNER',
        },
      }),
      prisma.bidNotice.update({ where: { id: submission.noticeId }, data: { status: 'CLOSED' } }),
    ])
    return NextResponse.json({ id: updated.id, status: updated.status })
  }

  const updated = await prisma.bidSubmission.update({
    where: { id: bidId },
    data: { status },
  })

  return NextResponse.json({ id: updated.id, status: updated.status })
}
