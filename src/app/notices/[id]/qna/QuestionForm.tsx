'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function QuestionForm({ noticeId }: { noticeId: string }) {
  const router = useRouter()
  const [question, setQuestion] = useState('')
  const [isAnon, setIsAnon] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim()) return
    setLoading(true)
    setError('')

    const res = await fetch(`/api/notices/${noticeId}/qna`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, isAnon }),
    })

    setLoading(false)
    if (res.ok) {
      setQuestion('')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? '오류가 발생했습니다.')
    }
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-xl border border-ink-200 p-5 mb-6">
      <h2 className="text-p15 font-semibold text-ink-700 mb-3">질문하기</h2>
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        rows={3}
        placeholder="공고에 대해 궁금한 사항을 질문해주세요. 답변은 모든 참여자에게 공개됩니다."
        className="w-full border border-ink-200 rounded-lg px-3 py-2.5 text-p14 text-ink-700 placeholder:text-ink-300 resize-none focus:outline-none focus:border-primary"
      />
      <div className="flex items-center justify-between mt-3">
        <label className="flex items-center gap-2 text-p13 text-ink-500 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnon}
            onChange={(e) => setIsAnon(e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
          익명으로 질문
        </label>
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-4 py-2 bg-primary text-white text-p14 font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? '등록 중...' : '질문 등록'}
        </button>
      </div>
      {error && <p className="mt-2 text-p13 text-red-500">{error}</p>}
    </form>
  )
}
