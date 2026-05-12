import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

type Params = { params: Promise<{ id: string }> }

// Q&A 목록 조회 (공고 열람 가능한 모든 사용자)
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })

  const { id: noticeId } = await params

  const qnaList = await prisma.bidQnA.findMany({
    where: { noticeId },
    include: { asker: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({
    qnaList: qnaList.map((q) => ({
      ...q,
      askerName: q.isAnon ? '익명' : (q.asker.name ?? q.asker.email),
    })),
  })
}

// 질문 등록 (SC만, 마감 전)
export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })

  const { id: noticeId } = await params

  const [user, notice] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { userType: true, status: true } }),
    prisma.bidNotice.findUnique({ where: { id: noticeId }, select: { status: true, deadline: true, authorId: true } }),
  ])

  if (!notice) return NextResponse.json({ error: '공고를 찾을 수 없습니다.' }, { status: 404 })
  if (notice.authorId === session.user.id) return NextResponse.json({ error: '공고 작성자는 질문할 수 없습니다.' }, { status: 403 })
  if (notice.status !== 'OPEN' || notice.deadline <= new Date()) return NextResponse.json({ error: '마감된 공고에는 질문할 수 없습니다.' }, { status: 400 })
  if (user?.status !== 'ACTIVE') return NextResponse.json({ error: '승인된 계정만 질문할 수 있습니다.' }, { status: 403 })

  const { question, isAnon } = await req.json()
  if (!question?.trim()) return NextResponse.json({ error: '질문을 입력해주세요.' }, { status: 400 })

  const qna = await prisma.bidQnA.create({
    data: { noticeId, askerId: session.user.id, question: question.trim(), isAnon: !!isAnon },
  })

  return NextResponse.json({ id: qna.id }, { status: 201 })
}
