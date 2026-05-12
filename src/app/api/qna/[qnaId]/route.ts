import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

type Params = { params: Promise<{ qnaId: string }> }

// 답변 등록 (GC — 공고 작성자만)
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })

  const { qnaId } = await params

  const qna = await prisma.bidQnA.findUnique({
    where: { id: qnaId },
    include: { notice: { select: { authorId: true } } },
  })

  if (!qna) return NextResponse.json({ error: '찾을 수 없습니다.' }, { status: 404 })
  if (qna.notice.authorId !== session.user.id) return NextResponse.json({ error: '권한 없음' }, { status: 403 })

  const { answer } = await req.json()
  if (!answer?.trim()) return NextResponse.json({ error: '답변을 입력해주세요.' }, { status: 400 })

  const updated = await prisma.bidQnA.update({
    where: { id: qnaId },
    data: { answer: answer.trim(), answeredAt: new Date() },
  })

  return NextResponse.json({ id: updated.id })
}
