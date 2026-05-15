import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true, status: true },
  })

  if (!user?.companyId || user.status === 'PENDING') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = 15

  const where = {
    companyId: user.companyId,
    ...(q ? { title: { contains: q, mode: 'insensitive' as const } } : {}),
    ...(category ? { category } : {}),
  }

  const [posts, total] = await Promise.all([
    (prisma as any).companyPost.findMany({
      where,
      include: { author: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    (prisma as any).companyPost.count({ where }),
  ])

  return NextResponse.json({ posts, total, page, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true, status: true },
  })

  if (!user?.companyId || user.status === 'PENDING') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { title, content, category = '일반' } = body

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: '제목과 내용을 입력하세요.' }, { status: 400 })
  }

  if (!['공지', '일반', '자료'].includes(category)) {
    return NextResponse.json({ error: '올바르지 않은 카테고리입니다.' }, { status: 400 })
  }

  const post = await (prisma as any).companyPost.create({
    data: {
      companyId: user.companyId,
      authorId: session.user.id,
      title: title.trim(),
      content: content.trim(),
      category,
    },
    include: { author: { select: { name: true, email: true } } },
  })

  return NextResponse.json({ post }, { status: 201 })
}
