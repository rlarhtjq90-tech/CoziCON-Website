import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })

  const { id } = await params

  const notice = await prisma.bidNotice.findUnique({
    where: { id },
    select: { authorId: true, status: true },
  })

  if (!notice) return NextResponse.json({ error: '공고를 찾을 수 없습니다.' }, { status: 404 })
  if (notice.authorId !== session.user.id) return NextResponse.json({ error: '권한 없음' }, { status: 403 })
  if (notice.status !== 'CLOSED') return NextResponse.json({ error: '마감된 공고만 개찰할 수 있습니다.' }, { status: 400 })

  await prisma.bidNotice.update({
    where: { id },
    data: { status: 'OPENED' },
  })

  return NextResponse.json({ ok: true })
}
