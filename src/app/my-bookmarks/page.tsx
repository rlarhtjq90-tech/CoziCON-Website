import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'
import { ArrowLeft, Bookmark, MapPin, Wrench, CalendarDays } from 'lucide-react'

function formatDeadline(date: Date) {
  const diff = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const label = date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
  return { diff, label }
}

export default async function MyBookmarksPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const bookmarks = await prisma.noticeBookmark.findMany({
    where: { userId: session.user.id },
    include: {
      notice: {
        include: {
          company: { select: { name: true } },
          _count: { select: { submissions: true } },
        },
      },
    },
    orderBy: { notice: { createdAt: 'desc' } },
  })

  return (
    <div className="min-h-screen bg-brand-slate-100">
      <AppHeader userId={session.user.id} userEmail={session.user.email ?? ''} companyName={session.user.companyName ?? null} />

      <main className="container-content py-10 max-w-3xl">
        <div className="mb-6">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-p14 text-ink-400 hover:text-primary transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" />
            대시보드
          </Link>
          <h1 className="text-t4 font-bold text-ink-700">관심공고</h1>
          <p className="text-p14 text-ink-400 mt-1">{bookmarks.length}건</p>
        </div>

        {bookmarks.length === 0 ? (
          <div className="bg-white rounded-xl border border-ink-200 p-16 text-center">
            <Bookmark className="w-10 h-10 text-ink-200 mx-auto mb-3" />
            <p className="text-p15 text-ink-400">관심 등록한 공고가 없습니다.</p>
            <Link href="/notices" className="inline-block mt-4 text-p14 text-brand-blue hover:underline">
              공고 목록 보기
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map(({ notice }) => {
              const { diff, label } = formatDeadline(notice.deadline)
              const isExpired = diff < 0 || notice.status !== 'OPEN'

              return (
                <Link
                  key={notice.id}
                  href={`/notices/${notice.id}`}
                  className="block bg-white rounded-xl border border-ink-200 p-5 hover:border-brand-blue/40 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h2 className="text-p16 font-semibold text-ink-700 line-clamp-2">{notice.title}</h2>
                    <span className={`shrink-0 text-p13 font-medium px-2.5 py-0.5 rounded-full ${
                      isExpired ? 'bg-ink-100 text-ink-400' :
                      diff <= 3 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {isExpired ? (notice.status === 'OPENED' ? '개찰됨' : '마감') : `D-${diff}`}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 text-p13 text-ink-400">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {label}
                    </span>
                    {notice.workTypes.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5" />
                        {notice.workTypes.slice(0, 2).join(', ')}
                      </span>
                    )}
                    {notice.regions.length > 0 && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {notice.regions.slice(0, 2).join(', ')}
                      </span>
                    )}
                    <span className="ml-auto">{notice.company.name}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
