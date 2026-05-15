import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createNotification } from '@/lib/notify'
import { sendNewNoticeEmail } from '@/lib/email'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  const { searchParams } = new URL(req.url)
  const workType = searchParams.get('workType')
  const region = searchParams.get('region')
  const rawStatus = searchParams.get('status') ?? 'OPEN'

  const validStatuses = ['DRAFT', 'OPEN', 'CLOSED', 'OPENED', 'CANCELLED'] as const
  type NoticeStatus = typeof validStatuses[number]
  const status = validStatuses.includes(rawStatus as NoticeStatus) ? (rawStatus as NoticeStatus) : 'OPEN'

  // DRAFT는 본인(작성자) 조회 시에만 허용 — 미인증이면 OPEN만 노출
  if (status === 'DRAFT' && !session?.user?.id) {
    return NextResponse.json({ notices: [] })
  }

  const notices = await prisma.bidNotice.findMany({
    where: {
      status,
      ...(workType ? { workTypes: { has: workType } } : {}),
      ...(region ? { regions: { has: region } } : {}),
    },
    include: {
      company: { select: { name: true, logoUrl: true } },
      _count: { select: { attachments: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ notices })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { userType: true, companyId: true, status: true },
  })

  if (user?.userType !== 'GENERAL_CONTRACTOR') {
    return NextResponse.json({ error: '종합건설사만 공고를 등록할 수 있습니다.' }, { status: 403 })
  }
  if (user.status !== 'ACTIVE') {
    return NextResponse.json({ error: '승인된 계정만 공고를 등록할 수 있습니다.' }, { status: 403 })
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

  type AttachmentInput = { fileName: string; fileUrl: string; fileSize?: number; mimeType?: string }

  const {
    title, workTypes, categoryIds, regions,
    deadline, openingAt, constructionStart, constructionEnd,
    estimatedPrice, bidMethod, requiredLicenses, qualificationNote,
    description, status, attachments,
  } = body as {
    title?: string
    workTypes?: string[]
    categoryIds?: string[]
    regions?: string[]
    deadline?: string
    openingAt?: string
    constructionStart?: string
    constructionEnd?: string
    estimatedPrice?: number | null
    bidMethod?: string | null
    requiredLicenses?: string[]
    qualificationNote?: string | null
    description?: string
    status?: string
    attachments?: AttachmentInput[]
  }

  if (!title || !workTypes?.length || !regions?.length || !deadline) {
    return NextResponse.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 })
  }

  const notice = await prisma.bidNotice.create({
    data: {
      title,
      workTypes,
      regions,
      deadline: new Date(deadline),
      openingAt: openingAt ? new Date(openingAt) : null,
      constructionStart: constructionStart ? new Date(constructionStart) : null,
      constructionEnd: constructionEnd ? new Date(constructionEnd) : null,
      estimatedPrice: estimatedPrice != null ? BigInt(estimatedPrice) : null,
      bidMethod: bidMethod ?? null,
      requiredLicenses: requiredLicenses ?? [],
      qualificationNote: qualificationNote ?? null,
      description: description ?? null,
      status: (status as 'DRAFT' | 'OPEN') ?? 'OPEN',
      companyId: user.companyId,
      authorId: session.user.id,
      attachments: attachments?.length
        ? { create: attachments.map((a) => ({ fileName: a.fileName, fileUrl: a.fileUrl, fileSize: a.fileSize ?? null, mimeType: a.mimeType ?? null })) }
        : undefined,
      categories: categoryIds?.length
        ? { create: categoryIds.map((categoryId) => ({ categoryId })) }
        : undefined,
    },
  })

  // 공고 상태가 OPEN이면 매칭 구독자에게 알림 발송 (best-effort)
  if ((notice.status as string) === 'OPEN') {
    notifySubscribers(notice.id, notice.title, notice.workTypes, notice.regions).catch(() => {})
  }

  return NextResponse.json({ notice }, { status: 201 })
}

async function notifySubscribers(
  noticeId: string,
  noticeTitle: string,
  workTypes: string[],
  regions: string[],
) {
  const subs = await prisma.noticeSubscription.findMany({
    where: { active: true },
    include: { user: { select: { id: true, email: true, name: true } } },
  })

  const matched = subs.filter((sub) => {
    const typeMatch = sub.workTypes.length === 0 || sub.workTypes.some((t) => workTypes.includes(t))
    const regionMatch = sub.regions.length === 0 || sub.regions.some((r) => regions.includes(r))
    return typeMatch && regionMatch
  })

  await Promise.all(
    matched.map(async (sub) => {
      await createNotification(
        sub.user.id,
        'NEW_BID',
        '새 공고가 등록됐습니다',
        `관심 키워드와 일치하는 공고: ${noticeTitle}`,
        `/notices/${noticeId}`,
      )
      if (sub.user.email) {
        await sendNewNoticeEmail(sub.user.email, {
          userName: sub.user.name ?? sub.user.email,
          noticeTitle,
          noticeId,
        })
      }
    }),
  )
}
