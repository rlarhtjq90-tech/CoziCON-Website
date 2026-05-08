import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { del } from '@vercel/blob'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  const { id } = await params

  const notice = await prisma.bidNotice.findUnique({
    where: { id },
    include: {
      company: { select: { name: true, logoUrl: true, address: true, phone: true } },
      attachments: true,
      categories: { include: { category: true } },
    },
  })

  if (!notice) {
    return NextResponse.json({ error: '공고를 찾을 수 없습니다.' }, { status: 404 })
  }

  return NextResponse.json({ notice })
}

export async function PATCH(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { id } = await params

  const notice = await prisma.bidNotice.findUnique({
    where: { id },
    select: { authorId: true, companyId: true },
  })

  if (!notice) {
    return NextResponse.json({ error: '공고를 찾을 수 없습니다.' }, { status: 404 })
  }
  if (notice.authorId !== session.user.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
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
    description, status,
    attachmentsToAdd, attachmentIdsToDelete,
  } = body as {
    title?: string
    workTypes?: string[]
    categoryIds?: string[]
    regions?: string[]
    deadline?: string
    openingAt?: string | null
    constructionStart?: string | null
    constructionEnd?: string | null
    estimatedPrice?: number | null
    bidMethod?: string | null
    requiredLicenses?: string[]
    qualificationNote?: string | null
    description?: string
    status?: string
    attachmentsToAdd?: AttachmentInput[]
    attachmentIdsToDelete?: string[]
  }

  // 삭제할 첨부파일 Blob에서도 제거
  if (attachmentIdsToDelete?.length) {
    const toDelete = await prisma.bidAttachment.findMany({
      where: { id: { in: attachmentIdsToDelete }, noticeId: id },
      select: { id: true, fileUrl: true },
    })
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      await Promise.allSettled(
        toDelete
          .filter((a) => !a.fileUrl.startsWith('__mock__'))
          .map((a) => del(a.fileUrl))
      )
    }
    await prisma.bidAttachment.deleteMany({
      where: { id: { in: toDelete.map((a) => a.id) } },
    })
  }

  const updated = await prisma.bidNotice.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(workTypes !== undefined && { workTypes }),
      ...(regions !== undefined && { regions }),
      ...(deadline !== undefined && { deadline: new Date(deadline) }),
      ...(openingAt !== undefined && { openingAt: openingAt ? new Date(openingAt) : null }),
      ...(constructionStart !== undefined && { constructionStart: constructionStart ? new Date(constructionStart) : null }),
      ...(constructionEnd !== undefined && { constructionEnd: constructionEnd ? new Date(constructionEnd) : null }),
      ...(estimatedPrice !== undefined && { estimatedPrice: estimatedPrice != null ? BigInt(estimatedPrice) : null }),
      ...(bidMethod !== undefined && { bidMethod: bidMethod ?? null }),
      ...(requiredLicenses !== undefined && { requiredLicenses }),
      ...(qualificationNote !== undefined && { qualificationNote: qualificationNote ?? null }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status: status as 'DRAFT' | 'OPEN' | 'CLOSED' | 'CANCELLED' }),
      ...(categoryIds !== undefined && {
        categories: {
          deleteMany: {},
          create: categoryIds.map((categoryId) => ({ categoryId })),
        },
      }),
      ...(attachmentsToAdd?.length && {
        attachments: {
          create: attachmentsToAdd.map((a) => ({
            fileName: a.fileName,
            fileUrl: a.fileUrl,
            fileSize: a.fileSize ?? null,
            mimeType: a.mimeType ?? null,
          })),
        },
      }),
    },
    include: { attachments: true, categories: { include: { category: true } } },
  })

  return NextResponse.json({ notice: updated })
}
