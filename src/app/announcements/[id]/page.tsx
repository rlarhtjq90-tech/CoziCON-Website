import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Pin } from 'lucide-react'
import AppFooter from '@/components/layout/AppFooter'
import type { Metadata } from 'next'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const item = await prisma.announcement.findUnique({ where: { id }, select: { title: true } })
  return { title: item ? `${item.title} | CastBid 공지사항` : '공지사항' }
}

function formatDate(d: Date) {
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function AnnouncementDetailPage({ params }: Props) {
  const { id } = await params
  const item = await prisma.announcement.findUnique({
    where: { id, isPublished: true },
  })
  if (!item) notFound()

  return (
    <div className="min-h-screen bg-brand-slate-100 flex flex-col">
      <header className="bg-white border-b border-ink-200">
        <div className="container-content h-16 flex items-center justify-between">
          <Link href="/" className="text-t6 font-bold text-primary tracking-tight">CastBid</Link>
          <nav className="flex items-center gap-4 text-p14">
            <Link href="/login" className="text-ink-500 hover:text-primary transition-colors">로그인</Link>
            <Link href="/signup" className="px-4 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary-600 transition-colors">
              시작하기
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container-content py-10 max-w-3xl">
        <Link href="/announcements" className="inline-flex items-center gap-1.5 text-p14 text-ink-500 hover:text-primary mb-6">
          <ChevronLeft className="w-4 h-4" />
          공지사항 목록
        </Link>

        <article className="bg-white rounded-2xl border border-ink-200 p-8">
          <div className="mb-6 pb-6 border-b border-ink-100">
            {item.isPinned && (
              <span className="inline-flex items-center gap-1 text-p12 text-primary font-semibold mb-2">
                <Pin className="w-3 h-3" /> 공지
              </span>
            )}
            <h1 className="text-t5 font-bold text-ink-800">{item.title}</h1>
            <p className="text-p13 text-ink-400 mt-2">{formatDate(item.createdAt)}</p>
          </div>
          <div className="prose prose-sm max-w-none text-ink-700 leading-relaxed whitespace-pre-wrap">
            {item.content}
          </div>
        </article>
      </main>

      <AppFooter />
    </div>
  )
}
