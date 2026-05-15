import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { sendBidAwardEmail, sendBidRejectedEmail } from '@/lib/email'
import { sendBidAwardAlimtalk, sendBidRejectedAlimtalk } from '@/lib/alimtalk'
import { createNotification } from '@/lib/notify'
import { decryptBidPrice } from '@/lib/crypto'
import { getUserNotifPrefs } from '@/lib/notif-prefs'
import { logAudit, getClientIp } from '@/lib/audit'

type RouteContext = { params: Promise<{ bidId: string }> }

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })

  const { bidId } = await params

  const submission = await prisma.bidSubmission.findUnique({
    where: { id: bidId },
    include: {
      notice:  { select: { id: true, title: true, authorId: true, companyId: true, constructionStart: true, constructionEnd: true, status: true } },
      bidder:  { select: { email: true, name: true } },
      company: { select: { phone: true } },
    },
  })

  if (!submission) return NextResponse.json({ error: '입찰을 찾을 수 없습니다.' }, { status: 404 })
  if (submission.notice.authorId !== session.user.id) return NextResponse.json({ error: '권한 없음' }, { status: 403 })

  const { status } = await req.json()
  const allowed = ['REVIEWED', 'ACCEPTED', 'REJECTED']
  if (!allowed.includes(status)) return NextResponse.json({ error: '유효하지 않은 상태입니다.' }, { status: 400 })

  // 낙찰/탈락 처리는 반드시 개찰(OPENED) 상태에서만 허용
  if ((status === 'ACCEPTED' || status === 'REJECTED') && submission.notice.status !== 'OPENED') {
    return NextResponse.json({ error: '개찰 후에만 낙찰/탈락 처리가 가능합니다.' }, { status: 400 })
  }

  const updated = await prisma.bidSubmission.update({
    where: { id: bidId },
    data: { status },
  })

  if (status === 'ACCEPTED') {
    const existing = await prisma.contract.findUnique({ where: { submissionId: bidId } })
    let contractId = existing?.id
    if (!existing) {
      const created = await prisma.contract.create({
        data: {
          noticeId: submission.noticeId,
          submissionId: bidId,
          gcCompanyId: submission.notice.companyId,
          scCompanyId: submission.companyId,
          contractAmount: submission.proposedPrice ? decryptBidPrice(submission.proposedPrice) : null,
          startDate: submission.notice.constructionStart,
          endDate: submission.notice.constructionEnd,
        },
      })
      contractId = created.id
    }
    const awardName = submission.bidder.name ?? submission.bidder.email
    logAudit({ userId: session.user.id, action: 'BID_AWARD', targetId: bidId, detail: { noticeId: submission.noticeId } }).catch(() => {})
    const awardPrefs = await getUserNotifPrefs(submission.bidderId)
    await Promise.all([
      awardPrefs.notifEmail && submission.bidder.email && contractId
        ? sendBidAwardEmail(submission.bidder.email, {
            userName: awardName,
            noticeTitle: submission.notice.title,
            contractId,
          })
        : null,
      awardPrefs.notifAlimtalk && submission.company.phone && contractId
        ? sendBidAwardAlimtalk(submission.company.phone, {
            userName: awardName,
            noticeTitle: submission.notice.title,
            contractId,
          })
        : null,
      createNotification(
        submission.bidderId,
        'BID_AWARDED',
        '낙찰 축하드립니다!',
        `${submission.notice.title} 공고에 낙찰되었습니다.`,
        contractId ? `/contracts/${contractId}` : undefined,
      ),
    ])
  }

  if (status === 'REJECTED') {
    const rejectName = submission.bidder.name ?? submission.bidder.email
    logAudit({ userId: session.user.id, action: 'BID_REJECT', targetId: bidId, detail: { noticeId: submission.noticeId } }).catch(() => {})
    const rejectPrefs = await getUserNotifPrefs(submission.bidderId)
    await Promise.all([
      rejectPrefs.notifEmail && submission.bidder.email
        ? sendBidRejectedEmail(submission.bidder.email, {
            userName: rejectName,
            noticeTitle: submission.notice.title,
          })
        : null,
      rejectPrefs.notifAlimtalk && submission.company.phone
        ? sendBidRejectedAlimtalk(submission.company.phone, {
            userName: rejectName,
            noticeTitle: submission.notice.title,
          })
        : null,
      createNotification(
        submission.bidderId,
        'BID_REJECTED',
        '입찰 결과 안내',
        `${submission.notice.title} 공고 입찰에서 탈락하였습니다.`,
        `/notices/${submission.noticeId}`,
      ),
    ])
  }

  return NextResponse.json({ id: updated.id, status: updated.status })
}
