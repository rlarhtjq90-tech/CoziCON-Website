import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/layout/AppFooter'
import { Building2, MapPin, Star } from 'lucide-react'

const REGIONS = ['서울','경기','인천','부산','대구','광주','대전','울산','세종','강원','충북','충남','전북','전남','경북','경남','제주']

type Props = { searchParams: Promise<{ q?: string; region?: string; license?: string }> }

export default async function CompaniesPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const { q, region, license } = await searchParams

  const companies = await prisma.company.findMany({
    where: {
      type: 'SPECIALTY_CONTRACTOR',
      ...(region ? { mainRegions: { has: region } } : {}),
      ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
      ...(license ? { licenses: { some: { licenseType: { contains: license, mode: 'insensitive' }, isActive: true } } } : {}),
    },
    include: {
      licenses: { where: { isActive: true }, select: { licenseType: true } },
      reviewsReceived: { select: { rating: true } },
      _count: { select: { portfolios: true } },
    },
    orderBy: { name: 'asc' },
    take: 60,
  })

  return (
    <div className="min-h-screen bg-brand-slate-100 flex flex-col">
      <AppHeader userId={session.user.id} userEmail={session.user.email ?? ''} />

      <main className="flex-1 container-content py-8">
        <div className="mb-6">
          <h1 className="text-t4 font-bold text-ink-700">전문건설사 디렉토리</h1>
          <p className="text-p15 text-ink-400 mt-1">인증된 전문건설사를 검색하고 포트폴리오를 확인하세요.</p>
        </div>

        {/* 검색·필터 */}
        <form method="GET" className="bg-white rounded-2xl border border-ink-200 p-5 mb-6 flex flex-wrap gap-3">
          <input
            name="q"
            defaultValue={q ?? ''}
            placeholder="회사명 검색"
            className="flex-1 min-w-[160px] px-4 py-2.5 border border-ink-200 rounded-lg text-p14 text-ink-700 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <select
            name="region"
            defaultValue={region ?? ''}
            className="px-3 py-2.5 border border-ink-200 rounded-lg text-p14 text-ink-600 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            <option value="">전체 지역</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <input
            name="license"
            defaultValue={license ?? ''}
            placeholder="면허 종목 (예: 전기)"
            className="px-4 py-2.5 border border-ink-200 rounded-lg text-p14 text-ink-700 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-40"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-primary text-white text-p14 font-semibold rounded-lg hover:bg-primary-600 transition-colors"
          >
            검색
          </button>
          {(q || region || license) && (
            <Link href="/companies" className="px-4 py-2.5 text-p14 text-ink-400 border border-ink-200 rounded-lg hover:border-ink-400 transition-colors">
              초기화
            </Link>
          )}
        </form>

        {/* 결과 수 */}
        <p className="text-p13 text-ink-400 mb-4">{companies.length}개 회사</p>

        {companies.length === 0 ? (
          <div className="bg-white rounded-2xl border border-ink-200 py-16 text-center">
            <Building2 className="w-10 h-10 text-ink-300 mx-auto mb-3" />
            <p className="text-p15 font-semibold text-ink-500">검색 결과가 없습니다</p>
            <p className="text-p13 text-ink-400 mt-1">검색어나 필터를 변경해보세요.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 laptop:grid-cols-3">
            {companies.map((c) => {
              const avgRating = c.reviewsReceived.length > 0
                ? c.reviewsReceived.reduce((s, r) => s + r.rating, 0) / c.reviewsReceived.length
                : null
              return (
                <Link
                  key={c.id}
                  href={`/company/${c.id}`}
                  className="bg-white rounded-2xl border border-ink-200 p-6 hover:border-primary hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      {c.logoUrl ? (
                        <img src={c.logoUrl} alt="" className="w-full h-full rounded-xl object-cover" />
                      ) : (
                        <Building2 className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-p15 font-bold text-ink-700 group-hover:text-primary transition-colors truncate">
                        {c.name}
                      </p>
                      {c.ceoName && (
                        <p className="text-p12 text-ink-400 mt-0.5">대표: {c.ceoName}</p>
                      )}
                    </div>
                  </div>

                  {/* 면허 */}
                  {c.licenses.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {c.licenses.slice(0, 3).map((l) => (
                        <span key={l.licenseType} className="px-2 py-0.5 bg-brand-slate-100 text-ink-500 text-p11 rounded-full">
                          {l.licenseType}
                        </span>
                      ))}
                      {c.licenses.length > 3 && (
                        <span className="px-2 py-0.5 bg-brand-slate-100 text-ink-400 text-p11 rounded-full">+{c.licenses.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-p12 text-ink-400 mt-auto">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{c.mainRegions.slice(0, 2).join(', ') || '지역 미입력'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {avgRating && (
                        <span className="flex items-center gap-0.5 text-amber-500">
                          <Star className="w-3 h-3 fill-current" />
                          {avgRating.toFixed(1)}
                        </span>
                      )}
                      <span className="text-ink-300">|</span>
                      <span>포트폴리오 {c._count.portfolios}건</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  )
}
