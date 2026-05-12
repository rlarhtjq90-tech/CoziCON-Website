import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import LogoutButton from '@/app/dashboard/LogoutButton'
import { ArrowLeft, Lock, Clock, Trophy } from 'lucide-react'
import BidActions from './BidActions'
import ManualOpenButton from './ManualOpenButton'

function formatPrice(price: bigint | null) {
  if (!price) return '—'
  const n = Number(price)
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억원`
  if (n >= 10_000) return `${(n / 10_000).toFixed(0)}만원`
  return `${n.toLocaleString()}원`
}

const SUBMISSION_STATUS_LABEL: Record<string, { label: string; color: string }> = {
  SUBMITTED: { label: '제출됨',  color: 'bg-blue-50 text-brand-blue' },
  REVIEWED:  { label: '검토중',  color: 'bg-yellow-50 text-yellow-600' },
  ACCEPTED:  { label: '낙찰',    color: 'bg-green-50 text-green-600' },
  REJECTED:  { label: '탈락',    color: 'bg-ink-100 text-ink-400' },
}

type Params = { params: Promise<{ id: string }> }

export default async function NoticeBidsPage({ params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { id } = await params

  const notice = await prisma.bidNotice.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      authorId: true,
      status: true,
      deadline: true,
      openingAt: true,
    },
  })

  if (!notice) notFound()
  if (notice.authorId !== session.user.id) redirect('/notices')

  const isOpened = notice.status === 'OPENED'

  const submissions = await prisma.bidSubmission.findMany({
    where: { noticeId: id },
    include: {
      company: { select: { name: true, type: true } },
      bidder:  { select: { name: true, email: true } },
    },
    orderBy: isOpened
      ? [{ proposedPrice: 'asc' }, { createdAt: 'asc' }]
      : [{ createdAt: 'asc' }],
  })

  const canManualOpen =
    notice.status === 'CLOSED' &&
    (!notice.openingAt || notice.openingAt <= new Date())

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

        {/* 페이지 헤더 */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-t4 font-bold text-ink-700">입찰 현황</h1>
              <span className={`text-p13 font-medium px-2.5 py-0.5 rounded-full ${
                notice.status === 'OPEN'      ? 'bg-green-50 text-green-600' :
                notice.status === 'CLOSED'    ? 'bg-yellow-50 text-yellow-600' :
                notice.status === 'OPENED'    ? 'bg-blue-50 text-brand-blue' :
                'bg-ink-100 text-ink-400'
              }`}>
                {notice.status === 'OPEN'   ? '모집중' :
                 notice.status === 'CLOSED' ? '개찰 대기' :
                 notice.status === 'OPENED' ? '개찰됨' : notice.status}
              </span>
            </div>
            <p className="text-p14 text-ink-400 truncate">{notice.title}</p>
          </div>
          {canManualOpen && (
            <ManualOpenButton noticeId={id} />
          )}
        </div>

        {/* 개찰 전 안내 */}
        {notice.status === 'OPEN' && (
          <div className="mb-6 flex items-center gap-3 bg-white border border-ink-200 rounded-xl p-5">
            <Clock className="w-5 h-5 text-ink-400 shrink-0" />
            <div>
              <p className="text-p15 font-medium text-ink-700">모집 중 — 마감 전까지 입찰금액이 비공개입니다.</p>
              <p className="text-p13 text-ink-400 mt-0.5">
                마감: {notice.deadline.toLocaleString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        )}

        {notice.status === 'CLOSED' && (
          <div className="mb-6 flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-5">
            <Lock className="w-5 h-5 text-yellow-600 shrink-0" />
            <div>
              <p className="text-p15 font-medium text-yellow-800">개찰 대기 중 — 입찰금액이 봉인된 상태입니다.</p>
              <p className="text-p13 text-yellow-700 mt-0.5">
                {notice.openingAt
                  ? `개찰 예정: ${notice.openingAt.toLocaleString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                  : '개찰 일시가 설정되지 않았습니다. 아래 버튼으로 수동 개찰하세요.'}
              </p>
            </div>
          </div>
        )}

        {notice.status === 'OPENED' && (
          <div className="mb-6 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-5">
            <Trophy className="w-5 h-5 text-brand-blue shrink-0" />
            <div>
              <p className="text-p15 font-medium text-ink-700">개찰 완료 — 입찰금액이 공개되었습니다.</p>
              <p className="text-p13 text-ink-500 mt-0.5">입찰가 오름차순으로 정렬됩니다. 낙찰자를 선정하세요.</p>
            </div>
          </div>
        )}

        {/* 입찰 목록 */}
        {submissions.length === 0 ? (
          <div className="bg-white rounded-xl border border-ink-200 p-16 text-center">
            <p className="text-p15 text-ink-400">아직 입찰 참여가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((s, idx) => {
              const st = SUBMISSION_STATUS_LABEL[s.status] ?? SUBMISSION_STATUS_LABEL.SUBMITTED
              const companyTypeLabel = s.company.type === 'GENERAL_CONTRACTOR' ? '종합건설사' : '전문건설사'
              const rank = isOpened ? idx + 1 : null

              return (
                <div
                  key={s.id}
                  className={`bg-white rounded-xl border p-6 ${
                    rank === 1 && s.status !== 'REJECTED' ? 'border-brand-blue ring-1 ring-brand-blue/20' : 'border-ink-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* 순위 뱃지 */}
                      {rank && (
                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-p13 font-bold ${
                          rank === 1 ? 'bg-brand-blue text-white' :
                          rank === 2 ? 'bg-ink-200 text-ink-600' :
                          rank === 3 ? 'bg-amber-100 text-amber-700' :
                          'bg-ink-100 text-ink-400'
                        }`}>
                          {rank}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-p15 font-semibold text-ink-700">{s.company.name}</span>
                          <span className="text-p13 px-2 py-0.5 bg-ink-100 text-ink-500 rounded-full">{companyTypeLabel}</span>
                        </div>
                        <p className="text-p13 text-ink-400 mb-3">
                          {s.bidder.name ?? s.bidder.email} · {new Date(s.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                        {/* 금액: 개찰 후에만 */}
                        {isOpened ? (
                          <div className={`text-p16 font-bold mb-2 ${rank === 1 && s.status !== 'REJECTED' ? 'text-brand-blue' : 'text-ink-700'}`}>
                            {formatPrice(s.proposedPrice)}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-p14 text-ink-300 mb-2">
                            <Lock className="w-3.5 h-3.5" />
                            <span>개찰 후 공개</span>
                          </div>
                        )}
                        {s.description && (
                          <p className="text-p14 text-ink-500 whitespace-pre-wrap line-clamp-2">{s.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <span className={`text-p13 font-medium px-2.5 py-0.5 rounded-full ${st.color}`}>
                        {st.label}
                      </span>
                      {isOpened && (
                        <BidActions
                          bidId={s.id}
                          currentStatus={s.status}
                        />
                      )}
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
