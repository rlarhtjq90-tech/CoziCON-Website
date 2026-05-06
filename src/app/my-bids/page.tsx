import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import LogoutButton from '@/app/dashboard/LogoutButton'
import { ArrowLeft, MapPin, Wrench, CalendarDays } from 'lucide-react'

function formatPrice(price: bigint | null) {
  if (!price) return '—'
  const n = Number(price)
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억원`
  if (n >= 10_000) return `${(n / 10_000).toFixed(0)}만원`
  return `${n.toLocaleString()}원`
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  SUBMITTED: { label: '제출됨', color: 'bg-blue-50 text-brand-blue' },
  REVIEWED:  { label: '검토중', color: 'bg-yellow-50 text-yellow-600' },
  ACCEPTED:  { label: '낙찰', color: 'bg-green-50 text-green-600' },
  REJECTED:  { label: '탈락', color: 'bg-ink-100 text-ink-400' },
}

export default async function MyBidsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { userType: true, companyId: true },
  })

  if (user?.userType === 'OWNER') redirect('/dashboard')

  const submissions = await prisma.bidSubmission.findMany({
    where: { bidderId: session.user.id },
    include: {
      notice: {
        select: {
          id: true,
          title: true,
          workTypes: true,
          regions: true,
          deadline: true,
          estimatedPrice: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

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

      <main className="container-content py-10">
        <div className="mb-6">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-p14 text-ink-400 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            대시보드로
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-t4 font-bold text-ink-700">내 입찰 현황</h1>
          <p className="mt-1 text-p14 text-ink-400">총 {submissions.length}건 참여</p>
        </div>

        {submissions.length === 0 ? (
          <div className="bg-white rounded-xl border border-ink-200 p-16 text-center">
            <p className="text-p15 text-ink-400">아직 참여한 입찰이 없습니다.</p>
            <Link
              href="/notices"
              className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg text-p14 font-medium hover:bg-primary/90 transition-colors"
            >
              공고 보러가기
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {submissions.map((s) => {
              const n = s.notice
              const st = STATUS_LABEL[s.status] ?? STATUS_LABEL.SUBMITTED
              const diff = Math.ceil((new Date(n.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              const deadlineLabel = new Date(n.deadline).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
              return (
                <Link
                  key={s.id}
                  href={`/notices/${n.id}`}
                  className="bg-white rounded-xl border border-ink-200 p-6 hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-p16 font-semibold text-ink-700 truncate mb-2">{n.title}</h2>
                      <div className="flex flex-wrap gap-3 text-p13 text-ink-500">
                        <span className="flex items-center gap-1">
                          <Wrench className="w-3.5 h-3.5" />
                          {n.workTypes.join(', ')}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {n.regions.join(', ')}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          마감 {deadlineLabel}
                          {diff >= 0 && ` (D-${diff})`}
                        </span>
                      </div>
                      <div className="mt-3 text-p13 text-ink-400">
                        내 제안금액: <span className="font-medium text-ink-600">{formatPrice(s.proposedPrice)}</span>
                        {s.description && (
                          <span className="ml-3 text-ink-400 line-clamp-1">&ldquo;{s.description}&rdquo;</span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <span className={`text-p13 font-medium px-2.5 py-0.5 rounded-full ${st.color}`}>
                        {st.label}
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
