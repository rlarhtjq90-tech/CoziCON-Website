import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import LogoutButton from '@/app/dashboard/LogoutButton'
import { ArrowLeft } from 'lucide-react'
import QnAList from './QnAList'
import QuestionForm from './QuestionForm'

type Params = { params: Promise<{ id: string }> }

export default async function QnAPage({ params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const { id } = await params

  const [notice, user] = await Promise.all([
    prisma.bidNotice.findUnique({
      where: { id },
      select: { id: true, title: true, authorId: true, status: true, deadline: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true, status: true },
    }),
  ])

  if (!notice) notFound()

  const qnaList = await prisma.bidQnA.findMany({
    where: { noticeId: id },
    include: { asker: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  })

  const isOwner = notice.authorId === session.user.id
  const isOpen = notice.status === 'OPEN' && notice.deadline > new Date()
  const canQuestion = !isOwner && isOpen && user?.status === 'ACTIVE'

  return (
    <div className="min-h-screen bg-brand-slate-100">
      <header className="bg-white border-b border-ink-200 shadow-sm">
        <div className="container-content flex items-center justify-between h-16">
          <a href="/" className="text-t6 font-bold text-primary tracking-tight">CoziCON</a>
          <div className="flex items-center gap-4">
            <span className="text-p14 text-ink-500">{session.user?.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container-content py-10 max-w-3xl">
        <div className="mb-6">
          <Link href={`/notices/${id}`} className="flex items-center gap-1.5 text-p14 text-ink-400 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            공고로 돌아가기
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-t4 font-bold text-ink-700">Q&amp;A</h1>
          <p className="mt-1 text-p14 text-ink-400 truncate">{notice.title}</p>
          {!isOpen && (
            <p className="mt-2 text-p13 text-ink-400">마감된 공고입니다. 질문 등록이 불가합니다.</p>
          )}
        </div>

        {canQuestion && (
          <QuestionForm noticeId={id} />
        )}

        <QnAList qnaList={qnaList} isOwner={isOwner} currentUserId={session.user.id} />
      </main>
    </div>
  )
}
