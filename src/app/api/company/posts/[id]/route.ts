import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

async function getAuthorizedPost(id: string, userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { companyId: true },
  })
  if (!user?.companyId) return null

  const post = await (prisma as any).companyPost.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true, email: true } } },
  })

  if (!post || post.companyId !== user.companyId) return null
  return { post, companyId: user.companyId, isOwner: post.authorId === userId }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await getAuthorizedPost(params.id, session.user.id)
  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await (prisma as any).companyPost.update({
    where: { id: params.id },
    data: { viewCount: { increment: 1 } },
  })

  return NextResponse.json({ post: result.post })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await getAuthorizedPost(params.id, session.user.id)
  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!result.isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { title, content, category } = body

  const updates: Record<string, string> = {}
  if (title?.trim()) updates.title = title.trim()
  if (content?.trim()) updates.content = content.trim()
  if (category && ['공지', '일반', '자료'].includes(category)) updates.category = category

  const post = await (prisma as any).companyPost.update({
    where: { id: params.id },
    data: updates,
    include: { author: { select: { name: true, email: true } } },
  })

  return NextResponse.json({ post })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await getAuthorizedPost(params.id, session.user.id)
  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!result.isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await (prisma as any).companyPost.delete({ where: { id: params.id } })

  return NextResponse.json({ ok: true })
}
