import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import LogoutButton from '@/app/dashboard/LogoutButton'
import { ArrowLeft } from 'lucide-react'
import BidActions from './BidActions'

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

type Params = { params: Promise<{ id: string }> }

export default async function NoticeBidsPage({ params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { id } = await params

  const notice = await prisma.bidNotice.findUnique({
    where: { id },
    select: { id: true, title: true, authorId: true },
  })

  if (!notice) notFound()
  if (notice.authorId !== session.user.id) redirect('/notices')

  const submissions = await prisma.bidSubmission.findMany({
    where: { noticeId: id },
    include: {
      company: { select: { name: true, type: true } },
      bidder:  { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'asc' },
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

      <main className="container-content py-10 max-w-4xl">
        <div className="mb-6">
          <Link
            href={`/notices/${id}`}
            className="flex items-center gap-1.5 text-p14 text-ink-400 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            공고로 돌아가기
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-t4 font-bold text-ink-700">입찰 현황</h1>
          <p className="mt-1 text-p14 text-ink-400 truncate">{notice.title}</p>
        </div>

        {submissions.length === 0 ? (
          <div className="bg-white rounded-xl border border-ink-200 p-16 text-center">
            <p className="text-p15 text-ink-400">아직 입찰 참여가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((s) => {
              const st = STATUS_LABEL[s.status] ?? STATUS_LABEL.SUBMITTED
              const companyTypeLabel = s.company.type === 'GENERAL_CONTRACTOR' ? '종합건설사' : '전문건설사'
              return (
                <div key={s.id} className="bg-white rounded-xl border border-ink-200 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-p15 font-semibold text-ink-700">{s.company.name}</span>
                        <span className="text-p13 px-2 py-0.5 bg-ink-100 text-ink-500 rounded-full">{companyTypeLabel}</span>
                      </div>
                      <p className="text-p13 text-ink-400 mb-3">
                        {s.bidder.name ?? s.bidder.email} · {new Date(s.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                      <div className="text-p14 font-semibold text-ink-700 mb-2">
                        제안금액: {formatPrice(s.proposedPrice)}
                      </div>
                      {s.description && (
                        <p className="text-p14 text-ink-500 whitespace-pre-wrap line-clamp-3">{s.description}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <span className={`text-p13 font-medium px-2.5 py-0.5 rounded-full ${st.color}`}>
                        {st.label}
                      </span>
                      <BidActions
                        bidId={s.id}
                        currentStatus={s.status}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
