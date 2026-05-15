import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/layout/AppFooter'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PostDetailClient from './PostDetailClient'

interface Props {
  params: { id: string }
}

const categoryColor: Record<string, string> = {
  공지: 'bg-red-50 text-red-600 border-red-200',
  일반: 'bg-sky-50 text-sky-600 border-sky-200',
  자료: 'bg-emerald-50 text-emerald-600 border-emerald-200',
}

export default async function PostDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true, status: true, company: { select: { name: true } } },
  })

  if (!user?.companyId || user.status === 'PENDING') redirect('/dashboard')

  const post = await (prisma as any).companyPost.findUnique({
    where: { id: params.id },
    include: { author: { select: { id: true, name: true, email: true } } },
  })

  if (!post || post.companyId !== user.companyId) notFound()

  await (prisma as any).companyPost.update({
    where: { id: params.id },
    data: { viewCount: { increment: 1 } },
  })

  const isOwner = post.authorId === session.user.id

  return (
    <div className="min-h-screen bg-brand-slate-100 flex flex-col">
      <AppHeader
        userId={session.user.id}
        userEmail={session.user.email ?? ''}
        companyName={user.company?.name ?? null}
      />

      <main className="container-content py-8 flex-1 max-w-3xl">
        <div className="mb-6">
          <Link
            href="/dashboard/notice-board"
            className="flex items-center gap-1.5 text-p14 text-ink-400 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            게시판으로
          </Link>
        </div>

        <PostDetailClient
          post={{
            id: post.id,
            category: post.category,
            title: post.title,
            content: post.content,
            viewCount: post.viewCount + 1,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
            author: post.author,
          }}
          isOwner={isOwner}
          categoryColor={categoryColor}
        />
      </main>

      <AppFooter />
    </div>
  )
}
