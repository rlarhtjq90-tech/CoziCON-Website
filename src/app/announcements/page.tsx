import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Pin, Megaphone } from 'lucide-react'
import AppFooter from '@/components/layout/AppFooter'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '공지사항 | CastBid',
}

function formatDate(d: Date) {
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function AnnouncementsPage() {
  const list = await prisma.announcement.findMany({
    where: { isPublished: true },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    select: { id: true, title: true, isPinned: true, createdAt: true },
  })

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
        <div className="flex items-center gap-3 mb-6">
          <Megaphone className="w-6 h-6 text-primary" />
          <h1 className="text-t4 font-bold text-ink-700">공지사항</h1>
        </div>

        {list.length === 0 ? (
          <div className="bg-white rounded-2xl border border-ink-200 py-16 text-center">
            <p className="text-p15 text-ink-400">등록된 공지사항이 없습니다.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-ink-200 divide-y divide-ink-100 overflow-hidden">
            {list.map((item) => (
              <Link
                key={item.id}
                href={`/announcements/${item.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-brand-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.isPinned && (
                    <Pin className="w-4 h-4 text-primary shrink-0" />
                  )}
                  <p className={`text-p15 font-medium truncate group-hover:text-primary transition-colors ${item.isPinned ? 'text-ink-800' : 'text-ink-700'}`}>
                    {item.title}
                  </p>
                </div>
                <p className="text-p13 text-ink-400 shrink-0 ml-4">{formatDate(item.createdAt)}</p>
              </Link>
            ))}
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  )
}
