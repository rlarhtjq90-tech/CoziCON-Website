import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'
import { ArrowLeft, Plus, Paperclip, MapPin, Wrench, CalendarDays } from 'lucide-react'
import NoticesFilterBar from './NoticesFilterBar'

function formatDeadline(date: Date) {
  const diff = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const label = date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
  if (diff < 0) return { label, badge: '마감', color: 'text-ink-400 bg-ink-100' }
  if (diff <= 3) return { label, badge: `D-${diff}`, color: 'text-red-600 bg-red-50' }
  return { label, badge: `D-${diff}`, color: 'text-brand-blue bg-blue-50' }
}

type SearchParams = Promise<{ q?: string; region?: string; categoryId?: string }>

export default async function NoticesPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { q, region, categoryId } = await searchParams

  const [user, parentCategories] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true },
    }),
    prisma.workCategory.findMany({
      where: { parentId: null },
      select: { id: true, name: true },
      orderBy: { order: 'asc' },
    }),
  ])

  const notices = await prisma.bidNotice.findMany({
    where: {
      status: 'OPEN',
      ...(q ? { title: { contains: q, mode: 'insensitive' } } : {}),
      ...(region ? { regions: { has: region } } : {}),
      ...(categoryId ? { categories: { some: { category: { parentId: categoryId } } } } : {}),
    },
    include: {
      company: { select: { name: true } },
      _count: { select: { attachments: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-brand-slate-100">
      <AppHeader userId={session.user.id} userEmail={session.user.email ?? ''} />

      <main className="container-content py-10">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-p14 text-ink-400 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            대시보드로
          </Link>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-t4 font-bold text-ink-700">입찰공고</h1>
          {user?.userType === 'GENERAL_CONTRACTOR' && (
            <Link
              href="/notices/create"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-p14 font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              공고 등록
            </Link>
          )}
        </div>

        <NoticesFilterBar
          initialQ={q ?? ''}
          initialRegion={region ?? ''}
          initialCategoryId={categoryId ?? ''}
          parentCategories={parentCategories}
          totalCount={notices.length}
        />

        {notices.length === 0 ? (
          <div className="bg-white rounded-xl border border-ink-200 p-16 text-center">
            <p className="text-p15 text-ink-400">
              {q || region || categoryId ? '검색 결과가 없습니다.' : '현재 모집 중인 공고가 없습니다.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {notices.map((notice) => {
              const dl = formatDeadline(notice.deadline)
              return (
                <Link
                  key={notice.id}
                  href={`/notices/${notice.id}`}
                  className="bg-white rounded-xl border border-ink-200 p-6 hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-p13 text-ink-400">{notice.company.name}</span>
                      </div>
                      <h2 className="text-p16 font-semibold text-ink-700 truncate">{notice.title}</h2>
                      <div className="mt-3 flex flex-wrap gap-3 text-p13 text-ink-500">
                        <span className="flex items-center gap-1">
                          <Wrench className="w-3.5 h-3.5" />
                          {notice.workTypes.slice(0, 3).join(', ')}{notice.workTypes.length > 3 ? ` 외 ${notice.workTypes.length - 3}` : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {notice.regions.slice(0, 3).join(', ')}{notice.regions.length > 3 ? ` 외 ${notice.regions.length - 3}` : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          마감 {dl.label}
                        </span>
                        {notice._count.attachments > 0 && (
                          <span className="flex items-center gap-1">
                            <Paperclip className="w-3.5 h-3.5" />
                            {notice._count.attachments}개
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-p13 font-medium px-2 py-0.5 rounded-full ${dl.color}`}>
                        {dl.badge}
                      </span>
                    </div>
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
