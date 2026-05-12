import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

type Params = { params: Promise<{ id: string }> }

// 토글: 없으면 추가, 있으면 삭제
export async function POST(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })

  const { id: noticeId } = await params
  const userId = session.user.id

  const existing = await prisma.noticeBookmark.findUnique({
    where: { userId_noticeId: { userId, noticeId } },
  })

  if (existing) {
    await prisma.noticeBookmark.delete({ where: { userId_noticeId: { userId, noticeId } } })
    return NextResponse.json({ bookmarked: false })
  } else {
    await prisma.noticeBookmark.create({ data: { userId, noticeId } })
    return NextResponse.json({ bookmarked: true })
  }
}
