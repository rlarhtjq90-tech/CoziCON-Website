'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Star, FileText, MapPin, Phone, Globe } from 'lucide-react'

type License = { id: string; licenseType: string; licenseNo: string | null; grade: string | null }
type Company = {
  id: string; name: string; type: string; ceoName: string | null
  address: string | null; phone: string | null; website: string | null
  mainRegions: string[]; constructionCapacity: string | null
  licenses: License[]
}
type Portfolio = {
  id: string; title: string; client: string; startDate: string; endDate: string
  amount: number | null; workCategory: string; description: string | null; docUrl: string | null
}
type Review = {
  id: string; rating: number; comment: string | null; createdAt: string
  reviewerCompany: { name: string }
}

type Props = {
  company: Company
  portfolios: Portfolio[]
  reviews: Review[]
  avgRating: number | null
  initialTab: string
  reviewableContractId: string | null
  viewerCompanyId: string | null
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-ink-200'}`}
        />
      ))}
    </span>
  )
}

function formatAmount(n: number | null) {
  if (!n) return '—'
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억원`
  if (n >= 10_000) return `${Math.round(n / 10_000)}만원`
  return `${n.toLocaleString()}원`
}

const TYPE_LABEL: Record<string, string> = {
  GENERAL_CONTRACTOR: '종합건설사',
  SPECIALTY_CONTRACTOR: '전문건설사',
}

export default function CompanyPublicClient({
  company, portfolios, reviews, avgRating, initialTab, reviewableContractId,
}: Props) {
  const [tab, setTab] = useState(initialTab)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reviewableContractId || reviewRating === 0) return
    setSubmitting(true)
    setReviewError('')
    try {
      const res = await fetch(`/api/company/${company.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId: reviewableContractId,
          rating: reviewRating,
          comment: reviewComment || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSubmitted(true)
      router.refresh()
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : '제출 실패')
    } finally {
      setSubmitting(false)
    }
  }

  const TABS = [
    { key: 'info', label: '기본 정보' },
    { key: 'portfolio', label: `포트폴리오 (${portfolios.length})` },
    { key: 'reviews', label: `리뷰 (${reviews.length})` },
  ]

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-2xl border border-ink-200 p-6 mb-4 flex items-center gap-4">
        <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
          <Building2 className="w-7 h-7 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-t5 font-bold text-ink-700">{company.name}</h1>
            <span className="px-2 py-0.5 bg-primary-100 text-primary text-p12 font-medium rounded-full">
              {TYPE_LABEL[company.type] ?? company.type}
            </span>
          </div>
          {avgRating !== null && (
            <div className="flex items-center gap-1.5 mt-1">
              <StarDisplay rating={Math.round(avgRating)} />
              <span className="text-p13 text-ink-500">{avgRating} ({reviews.length}건)</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-white rounded-xl border border-ink-200 p-1">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 text-p14 font-medium rounded-lg transition-colors ${
              tab === t.key ? 'bg-primary text-white' : 'text-ink-500 hover:bg-ink-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: 기본 정보 */}
      {tab === 'info' && (
        <div className="bg-white rounded-2xl border border-ink-200 p-6 space-y-4">
          {company.ceoName && (
            <div><span className="text-p13 text-ink-400 w-24 inline-block">대표자</span><span className="text-p14 text-ink-700">{company.ceoName}</span></div>
          )}
          {company.address && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-ink-400 mt-0.5 shrink-0" />
              <span className="text-p14 text-ink-600">{company.address}</span>
            </div>
          )}
          {company.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-ink-400 shrink-0" />
              <span className="text-p14 text-ink-600">{company.phone}</span>
            </div>
          )}
          {company.website && (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-ink-400 shrink-0" />
              <a href={company.website} target="_blank" rel="noopener noreferrer"
                className="text-p14 text-primary hover:underline">{company.website}</a>
            </div>
          )}
          {company.mainRegions.length > 0 && (
            <div>
              <p className="text-p13 text-ink-400 mb-2">주요 지역</p>
              <div className="flex flex-wrap gap-1.5">
                {company.mainRegions.map(r => (
                  <span key={r} className="px-2.5 py-1 bg-ink-50 text-ink-600 text-p12 rounded-full">{r}</span>
                ))}
              </div>
            </div>
          )}
          {company.licenses.length > 0 && (
            <div>
              <p className="text-p13 text-ink-400 mb-2">보유 면허</p>
              <div className="space-y-1.5">
                {company.licenses.map(l => (
                  <div key={l.id} className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-primary-100 text-primary text-p12 font-medium rounded-full">{l.licenseType}</span>
                    {l.grade && <span className="text-p12 text-ink-400">{l.grade}</span>}
                    {l.licenseNo && <span className="text-p12 text-ink-400">#{l.licenseNo}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: 포트폴리오 */}
      {tab === 'portfolio' && (
        <div className="space-y-3">
          {portfolios.length === 0 ? (
            <div className="bg-white rounded-2xl border border-ink-200 p-12 text-center text-ink-400">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-p15">등록된 시공 실적이 없습니다.</p>
            </div>
          ) : portfolios.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-ink-200 p-5">
              <p className="text-p15 font-semibold text-ink-700">{p.title}</p>
              <p className="text-p13 text-ink-400 mt-1">
                {p.client} · {p.workCategory} · {formatAmount(p.amount)}
              </p>
              <p className="text-p13 text-ink-400">
                {p.startDate.slice(0, 10)} ~ {p.endDate.slice(0, 10)}
              </p>
              {p.description && <p className="text-p14 text-ink-600 mt-2">{p.description}</p>}
              {p.docUrl && !p.docUrl.startsWith('__mock__') && (
                <a
                  href={p.docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-p13 text-primary mt-2 hover:underline"
                >
                  <FileText className="w-3.5 h-3.5" />
                  준공서류 보기
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab: 리뷰 */}
      {tab === 'reviews' && (
        <div className="space-y-4">
          {reviewableContractId && !submitted && (
            <div className="bg-white rounded-2xl border border-primary border-dashed p-6">
              <p className="text-p15 font-semibold text-ink-700 mb-4">리뷰 남기기</p>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <p className="text-p13 text-ink-500 mb-2">평점</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setReviewRating(i)}
                        className="p-1"
                      >
                        <Star className={`w-7 h-7 transition-colors ${
                          i <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-ink-200 hover:text-amber-300'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-p13 text-ink-500 mb-1">코멘트 (선택)</p>
                  <textarea
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    rows={3}
                    className="w-full border border-ink-200 rounded-lg px-3 py-2 text-p14 focus:outline-none focus:border-primary resize-none"
                    placeholder="시공 품질, 일정 준수, 소통 등에 대해 자유롭게 작성해주세요."
                  />
                </div>
                {reviewError && <p className="text-p13 text-red-500">{reviewError}</p>}
                <button
                  type="submit"
                  disabled={submitting || reviewRating === 0}
                  className="w-full py-2.5 bg-primary text-white text-p14 font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
                >
                  {submitting ? '제출 중...' : '리뷰 제출'}
                </button>
              </form>
            </div>
          )}
          {submitted && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-p14 text-green-700">
              리뷰가 제출됐습니다. 감사합니다!
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-ink-200 p-12 text-center text-ink-400">
              <Star className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-p15">아직 리뷰가 없습니다.</p>
            </div>
          ) : (
            <>
              {avgRating !== null && (
                <div className="bg-white rounded-xl border border-ink-200 p-4 flex items-center gap-3">
                  <span className="text-t3 font-bold text-ink-700">{avgRating}</span>
                  <div>
                    <StarDisplay rating={Math.round(avgRating)} />
                    <p className="text-p12 text-ink-400 mt-0.5">총 {reviews.length}건 리뷰</p>
                  </div>
                </div>
              )}
              {reviews.map(r => (
                <div key={r.id} className="bg-white rounded-xl border border-ink-200 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <StarDisplay rating={r.rating} />
                      <span className="text-p13 font-medium text-ink-600">{r.reviewerCompany.name}</span>
                    </div>
                    <span className="text-p12 text-ink-400">{r.createdAt.slice(0, 10)}</span>
                  </div>
                  {r.comment && <p className="text-p14 text-ink-600">{r.comment}</p>}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
