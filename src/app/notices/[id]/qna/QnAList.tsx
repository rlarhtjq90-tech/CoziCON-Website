'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, ChevronDown } from 'lucide-react'

type QnAItem = {
  id: string
  question: string
  answer: string | null
  answeredAt: Date | null
  isAnon: boolean
  createdAt: Date
  askerId: string
  asker: { name: string | null; email: string }
}

type Props = {
  qnaList: QnAItem[]
  isOwner: boolean
  currentUserId: string
}

function AnswerForm({ qnaId, onDone }: { qnaId: string; onDone: () => void }) {
  const router = useRouter()
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!answer.trim()) return
    setLoading(true)
    const res = await fetch(`/api/qna/${qnaId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer }),
    })
    setLoading(false)
    if (res.ok) { onDone(); router.refresh() }
  }

  return (
    <form onSubmit={submit} className="mt-3 border-t border-ink-100 pt-3">
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={2}
        placeholder="답변을 입력하세요. 모든 참여자에게 공개됩니다."
        className="w-full border border-ink-200 rounded-lg px-3 py-2 text-p14 text-ink-700 placeholder:text-ink-300 resize-none focus:outline-none focus:border-primary"
      />
      <div className="flex justify-end gap-2 mt-2">
        <button type="button" onClick={onDone} className="px-3 py-1.5 text-p13 text-ink-400 border border-ink-200 rounded-lg hover:bg-ink-50">취소</button>
        <button type="submit" disabled={loading || !answer.trim()} className="px-3 py-1.5 text-p13 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {loading ? '등록 중...' : '답변 등록'}
        </button>
      </div>
    </form>
  )
}

export default function QnAList({ qnaList, isOwner }: Props) {
  const [answeringId, setAnsweringId] = useState<string | null>(null)

  if (qnaList.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-ink-200 p-16 text-center">
        <MessageSquare className="w-10 h-10 text-ink-200 mx-auto mb-3" />
        <p className="text-p15 text-ink-400">아직 질문이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {qnaList.map((q, idx) => {
        const askerName = q.isAnon ? '익명' : (q.asker.name ?? q.asker.email)

        return (
          <div key={q.id} className="bg-white rounded-xl border border-ink-200 p-5">
            {/* 질문 */}
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-blue-50 text-brand-blue text-p13 font-bold flex items-center justify-center">Q</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-p13 text-ink-400">{askerName}</span>
                  <span className="text-p12 text-ink-300">·</span>
                  <span className="text-p12 text-ink-300">{new Date(q.createdAt).toLocaleDateString('ko-KR')}</span>
                  <span className="ml-auto text-p13 text-ink-300">#{idx + 1}</span>
                </div>
                <p className="text-p15 text-ink-700 whitespace-pre-wrap">{q.question}</p>
              </div>
            </div>

            {/* 답변 */}
            {q.answer ? (
              <div className="mt-4 flex items-start gap-3 bg-brand-slate-100 rounded-lg p-4">
                <span className="shrink-0 w-7 h-7 rounded-full bg-green-50 text-green-600 text-p13 font-bold flex items-center justify-center">A</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-p13 text-ink-400 font-medium">발주사</span>
                    {q.answeredAt && <span className="text-p12 text-ink-300">{new Date(q.answeredAt).toLocaleDateString('ko-KR')}</span>}
                  </div>
                  <p className="text-p15 text-ink-700 whitespace-pre-wrap">{q.answer}</p>
                </div>
              </div>
            ) : isOwner ? (
              answeringId === q.id ? (
                <AnswerForm qnaId={q.id} onDone={() => setAnsweringId(null)} />
              ) : (
                <button
                  onClick={() => setAnsweringId(q.id)}
                  className="mt-3 flex items-center gap-1.5 text-p13 text-brand-blue hover:underline"
                >
                  <ChevronDown className="w-4 h-4" />
                  답변하기
                </button>
              )
            ) : (
              <p className="mt-3 text-p13 text-ink-300 italic">아직 답변이 없습니다.</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
