import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

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

  return NextResponse.json({ notice }, { status: 201 })
}
