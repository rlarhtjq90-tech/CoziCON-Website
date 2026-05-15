import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/layout/AppFooter'
import NoticeBoardClient from './NoticeBoardClient'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NoticeBoardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true, status: true, company: { select: { name: true } } },
  })

  if (!user?.companyId || user.status === 'PENDING') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-brand-slate-100 flex flex-col">
      <AppHeader
        userId={session.user.id}
        userEmail={session.user.email ?? ''}
        companyName={user.company?.name ?? null}
      />

      <main className="container-content py-8 flex-1 w-full">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-p14 text-ink-400 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            대시보드
          </Link>
        </div>

        <div className="mb-5">
          <h1 className="text-t5 font-bold text-ink-700">회사 게시판</h1>
          <p className="mt-1 text-p14 text-ink-400">사내 공지사항이나 자료를 공유하세요.</p>
        </div>

        <NoticeBoardClient userId={session.user.id} />
      </main>

      <AppFooter />
    </div>
  )
}
