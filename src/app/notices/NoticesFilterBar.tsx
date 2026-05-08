'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'

type ParentCategory = { id: string; name: string }

const REGIONS = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주']

type Props = {
  initialQ: string
  initialRegion: string
  initialCategoryId: string
  parentCategories: ParentCategory[]
  totalCount: number
}

export default function NoticesFilterBar({ initialQ, initialRegion, initialCategoryId, parentCategories, totalCount }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [q, setQ] = useState(initialQ)
  const [region, setRegion] = useState(initialRegion)
  const [categoryId, setCategoryId] = useState(initialCategoryId)

  const isFiltered = !!initialQ || !!initialRegion || !!initialCategoryId

  const pushURL = useCallback((newQ: string, newRegion: string, newCategoryId: string) => {
    const params = new URLSearchParams()
    if (newQ) params.set('q', newQ)
    if (newRegion) params.set('region', newRegion)
    if (newCategoryId) params.set('categoryId', newCategoryId)
    const qs = params.toString()
    startTransition(() => {
      router.push(`/notices${qs ? `?${qs}` : ''}`)
    })
  }, [router])

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') pushURL(q, region, categoryId)
  }

  function handleRegionChange(v: string) {
    setRegion(v)
    pushURL(q, v, categoryId)
  }

  function handleCategoryChange(v: string) {
    setCategoryId(v)
    pushURL(q, region, v)
  }

  function handleClear() {
    setQ('')
    setRegion('')
    setCategoryId('')
    pushURL('', '', '')
  }

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-wrap gap-2">
        {/* 검색 */}
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleSearch}
            onBlur={() => { if (q !== initialQ) pushURL(q, region, categoryId) }}
            placeholder="공고 제목 검색 (Enter)"
            className="w-full pl-9 pr-3 py-2.5 border border-ink-200 rounded-lg text-p14 focus:outline-none focus:border-primary bg-white"
          />
          {q && (
            <button onClick={() => { setQ(''); pushURL('', region, categoryId) }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 지역 */}
        <select
          value={region}
          onChange={(e) => handleRegionChange(e.target.value)}
          className="px-3 py-2.5 border border-ink-200 rounded-lg text-p14 text-ink-600 focus:outline-none focus:border-primary bg-white"
        >
          <option value="">전체 지역</option>
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>

        {/* 공종 대분류 */}
        <select
          value={categoryId}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="px-3 py-2.5 border border-ink-200 rounded-lg text-p14 text-ink-600 focus:outline-none focus:border-primary bg-white"
        >
          <option value="">전체 공종</option>
          {parentCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {/* 필터 초기화 */}
        {isFiltered && (
          <button onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-2.5 border border-ink-200 rounded-lg text-p14 text-ink-400 hover:text-ink-600 hover:border-ink-300 bg-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            초기화
          </button>
        )}
      </div>

      {/* 결과 수 + 적용된 필터 태그 */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-p14 text-ink-400">
          {isPending ? '검색 중...' : `${totalCount}건`}
        </span>
        {initialQ && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-p13 rounded-full">
            "{initialQ}"
            <button onClick={() => { setQ(''); pushURL('', region, categoryId) }}><X className="w-3 h-3" /></button>
          </span>
        )}
        {initialRegion && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-p13 rounded-full">
            {initialRegion}
            <button onClick={() => { setRegion(''); pushURL(q, '', categoryId) }}><X className="w-3 h-3" /></button>
          </span>
        )}
        {initialCategoryId && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-p13 rounded-full">
            {parentCategories.find((c) => c.id === initialCategoryId)?.name}
            <button onClick={() => { setCategoryId(''); pushURL(q, region, '') }}><X className="w-3 h-3" /></button>
          </span>
        )}
      </div>
    </div>
  )
}
