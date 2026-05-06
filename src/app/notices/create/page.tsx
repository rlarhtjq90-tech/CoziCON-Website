'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, X } from 'lucide-react'

const WORK_TYPES = ['건축', '토목', '전기', '통신', '소방', '기계설비', '조경', '내장', '철근콘크리트', '기타']
const REGIONS = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주']

export default function CreateNoticePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [workTypes, setWorkTypes] = useState<string[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [estimatedPrice, setEstimatedPrice] = useState('')
  const [deadline, setDeadline] = useState('')
  const [description, setDescription] = useState('')
  const [asDraft, setAsDraft] = useState(false)

  function toggleItem(arr: string[], setArr: (v: string[]) => void, item: string) {
    setArr(arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        workTypes,
        regions,
        estimatedPrice: estimatedPrice ? Number(estimatedPrice.replace(/,/g, '')) : null,
        deadline,
        description,
        status: asDraft ? 'DRAFT' : 'OPEN',
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? '오류가 발생했습니다.')
      return
    }

    router.push('/notices')
  }

  return (
    <div className="min-h-screen bg-brand-slate-100">
      <header className="bg-white border-b border-ink-200 shadow-sm">
        <div className="container-content flex items-center justify-between h-16">
          <a href="/" className="text-t6 font-bold text-primary tracking-tight">CoziCON</a>
        </div>
      </header>

      <main className="container-content py-10 max-w-2xl">
        <div className="mb-6">
          <Link href="/notices" className="flex items-center gap-1.5 text-p14 text-ink-400 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            공고 목록으로
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-t4 font-bold text-ink-700">공고 등록</h1>
          <p className="mt-1 text-p15 text-ink-400">입찰 공고를 작성하세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-ink-200 p-8 space-y-6">
          {/* 제목 */}
          <div>
            <label className="block text-p14 font-medium text-ink-700 mb-1.5">
              공고 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예) 2026년 도로 보수공사 입찰 공고"
              className="w-full px-3 py-2.5 border border-ink-200 rounded-lg text-p15 focus:outline-none focus:border-primary"
              required
            />
          </div>

          {/* 공종 */}
          <div>
            <label className="block text-p14 font-medium text-ink-700 mb-1.5">
              공종 <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {WORK_TYPES.map((wt) => (
                <button
                  key={wt}
                  type="button"
                  onClick={() => toggleItem(workTypes, setWorkTypes, wt)}
                  className={`px-3 py-1.5 rounded-full text-p13 border transition-colors ${
                    workTypes.includes(wt)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-ink-500 border-ink-200 hover:border-primary'
                  }`}
                >
                  {wt}
                </button>
              ))}
            </div>
          </div>

          {/* 지역 */}
          <div>
            <label className="block text-p14 font-medium text-ink-700 mb-1.5">
              지역 <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleItem(regions, setRegions, r)}
                  className={`px-3 py-1.5 rounded-full text-p13 border transition-colors ${
                    regions.includes(r)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-ink-500 border-ink-200 hover:border-primary'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* 예정가격 */}
          <div>
            <label className="block text-p14 font-medium text-ink-700 mb-1.5">예정가격 (원)</label>
            <input
              type="number"
              value={estimatedPrice}
              onChange={(e) => setEstimatedPrice(e.target.value)}
              placeholder="예) 500000000"
              className="w-full px-3 py-2.5 border border-ink-200 rounded-lg text-p15 focus:outline-none focus:border-primary"
            />
            {estimatedPrice && (
              <p className="mt-1 text-p13 text-ink-400">
                {Number(estimatedPrice).toLocaleString()}원
              </p>
            )}
          </div>

          {/* 마감일 */}
          <div>
            <label className="block text-p14 font-medium text-ink-700 mb-1.5">
              마감일 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2.5 border border-ink-200 rounded-lg text-p15 focus:outline-none focus:border-primary"
              required
            />
          </div>

          {/* 공고 내용 */}
          <div>
            <label className="block text-p14 font-medium text-ink-700 mb-1.5">공고 내용</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="공사 개요, 입찰 조건, 제출 서류 등을 입력하세요."
              rows={6}
              className="w-full px-3 py-2.5 border border-ink-200 rounded-lg text-p15 focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {error && (
            <p className="text-p14 text-red-500">{error}</p>
          )}

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-p14 text-ink-500 cursor-pointer">
              <input
                type="checkbox"
                checked={asDraft}
                onChange={(e) => setAsDraft(e.target.checked)}
                className="rounded"
              />
              임시저장으로 등록
            </label>
            <div className="flex gap-3">
              <Link
                href="/notices"
                className="px-4 py-2 border border-ink-200 rounded-lg text-p14 text-ink-500 hover:bg-ink-50 transition-colors"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary text-white rounded-lg text-p14 font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {loading ? '등록 중...' : asDraft ? '임시저장' : '공고 등록'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
