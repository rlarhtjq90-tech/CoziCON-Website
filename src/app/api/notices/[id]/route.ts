import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  const { id } = await params

  const notice = await prisma.bidNotice.findUnique({
    where: { id },
    include: {
      company: { select: { name: true, logoUrl: true, address: true, phone: true } },
      attachments: true,
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

  const allowed = ['title', 'workTypes', 'regions', 'deadline', 'description', 'status'] as const
  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) {
      if (key === 'deadline') {
        data[key] = new Date(body[key] as string)
      } else {
        data[key] = body[key]
      }
    }
  }

  const updated = await prisma.bidNotice.update({
    where: { id },
    data,
    include: { attachments: true },
  })

  return NextResponse.json({ notice: updated })
}
