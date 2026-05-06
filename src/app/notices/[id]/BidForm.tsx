'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'

type Props = {
  noticeId: string
  alreadySubmitted: boolean
  submittedAt: string | null
}

export default function BidForm({ noticeId, alreadySubmitted, submittedAt }: Props) {
  const [submitted, setSubmitted] = useState(alreadySubmitted)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [proposedPrice, setProposedPrice] = useState('')
  const [description, setDescription] = useState('')

  if (submitted) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
        <div>
          <p className="text-p14 font-medium text-green-700">입찰 완료</p>
          {submittedAt && (
            <p className="text-p13 text-green-600">
              {new Date(submittedAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} 제출
            </p>
          )}
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch(`/api/notices/${noticeId}/bids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proposedPrice: proposedPrice ? Number(proposedPrice) : null,
        description: description || null,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? '오류가 발생했습니다.')
      return
    }

    setSubmitted(true)
  }

  return (
    <div>
      <h2 className="text-p15 font-semibold text-ink-700 mb-4">입찰 참여</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-p14 font-medium text-ink-600 mb-1.5">
            제안금액 (원)
            <span className="ml-1 text-p13 text-ink-400 font-normal">선택</span>
          </label>
          <input
            type="number"
            value={proposedPrice}
            onChange={(e) => setProposedPrice(e.target.value)}
            placeholder="예) 450000000"
            className="w-full px-3 py-2.5 border border-ink-200 rounded-lg text-p15 focus:outline-none focus:border-primary"
          />
          {proposedPrice && (
            <p className="mt-1 text-p13 text-ink-400">{Number(proposedPrice).toLocaleString()}원</p>
          )}
        </div>

        <div>
          <label className="block text-p14 font-medium text-ink-600 mb-1.5">
            입찰 제안 내용
            <span className="ml-1 text-p13 text-ink-400 font-normal">선택</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="시공 계획, 경력 사항, 강점 등을 자유롭게 작성하세요."
            rows={4}
            className="w-full px-3 py-2.5 border border-ink-200 rounded-lg text-p15 focus:outline-none focus:border-primary resize-none"
          />
        </div>

        {error && <p className="text-p14 text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-primary text-white rounded-lg text-p15 font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? '제출 중...' : '입찰하기'}
        </button>
      </form>
    </div>
  )
}
