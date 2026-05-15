'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, ChevronLeft, MapPin, Wrench } from 'lucide-react'
import Link from 'next/link'

const REGIONS = ['서울','경기','인천','부산','대구','광주','대전','울산','세종','강원','충북','충남','전북','전남','경북','경남','제주']

interface Category { id: string; name: string; code: string; parentId: string | null }

interface Sub {
  workTypes: string[]
  regions: string[]
  active: boolean
}

export default function SubscriptionClient({ initial }: { initial: Sub | null }) {
  const [sub, setSub] = useState<Sub>(initial ?? { workTypes: [], regions: [], active: true })
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [enabled, setEnabled] = useState(initial?.active ?? false)
  const [hasSubscription, setHasSubscription] = useState(!!initial)

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then((d) => {
      const parents: Category[] = (d.categories ?? []).filter((c: Category) => !c.parentId)
      setCategories(parents)
    })
  }, [])

  function toggleWorkType(name: string) {
    setSub((prev) => ({
      ...prev,
      workTypes: prev.workTypes.includes(name)
        ? prev.workTypes.filter((t) => t !== name)
        : [...prev.workTypes, name],
    }))
  }

  function toggleRegion(r: string) {
    setSub((prev) => ({
      ...prev,
      regions: prev.regions.includes(r)
        ? prev.regions.filter((x) => x !== r)
        : [...prev.regions, r],
    }))
  }

  async function save() {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...sub, active: enabled }),
      })
      if (res.ok) {
        setSaved(true)
        setHasSubscription(true)
        setTimeout(() => setSaved(false), 2500)
      }
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!confirm('구독을 삭제하시겠습니까?')) return
    await fetch('/api/subscriptions', { method: 'DELETE' })
    setSub({ workTypes: [], regions: [], active: true })
    setEnabled(false)
    setHasSubscription(false)
  }

  return (
    <>
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-p14 text-ink-500 hover:text-primary mb-6">
        <ChevronLeft className="w-4 h-4" />
        대시보드로 돌아가기
      </Link>

      <div className="bg-white rounded-2xl border border-ink-200 p-8 space-y-8">
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-t6 font-bold text-ink-700">키워드 알림 구독</h1>
              <p className="text-p13 text-ink-400 mt-0.5">선택한 공종·지역의 새 공고가 올라오면 알림을 받습니다.</p>
            </div>
          </div>
          {/* 알림 on/off 토글 */}
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled((v) => !v)}
            className={`shrink-0 relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
              enabled ? 'bg-primary' : 'bg-ink-300'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        {/* 공종 선택 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="w-4 h-4 text-ink-400" />
            <p className="text-p14 font-semibold text-ink-700">공종</p>
            <span className="text-p12 text-ink-400">(비워두면 전체 공종 알림)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleWorkType(c.name)}
                className={`px-3 py-1.5 rounded-full text-p13 border transition-colors ${
                  sub.workTypes.includes(c.name)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-ink-500 border-ink-200 hover:border-primary'
                }`}
              >
                {c.name}
              </button>
            ))}
            {categories.length === 0 && (
              <p className="text-p13 text-ink-400">공종 목록 불러오는 중...</p>
            )}
          </div>
        </div>

        {/* 지역 선택 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-ink-400" />
            <p className="text-p14 font-semibold text-ink-700">지역</p>
            <span className="text-p12 text-ink-400">(비워두면 전체 지역 알림)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => toggleRegion(r)}
                className={`px-3 py-1.5 rounded-full text-p13 border transition-colors ${
                  sub.regions.includes(r)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-ink-500 border-ink-200 hover:border-primary'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* 현재 설정 요약 */}
        {hasSubscription && (
          <div className="bg-brand-slate-100 rounded-xl px-5 py-4 text-p13 text-ink-500 space-y-1">
            <p><span className="font-medium text-ink-700">공종:</span> {sub.workTypes.length > 0 ? sub.workTypes.join(', ') : '전체'}</p>
            <p><span className="font-medium text-ink-700">지역:</span> {sub.regions.length > 0 ? sub.regions.join(', ') : '전체'}</p>
            <p><span className="font-medium text-ink-700">상태:</span> {enabled ? '활성' : '일시 중지'}</p>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex-1 py-2.5 bg-primary text-white font-semibold text-p15 rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-60"
          >
            {saving ? '저장 중...' : hasSubscription ? '구독 업데이트' : '구독 시작'}
          </button>
          {hasSubscription && (
            <button
              type="button"
              onClick={remove}
              className="px-5 py-2.5 text-p14 text-ink-400 border border-ink-200 rounded-xl hover:border-red-300 hover:text-red-400 transition-colors flex items-center gap-1.5"
            >
              <BellOff className="w-4 h-4" />
              구독 해제
            </button>
          )}
        </div>

        {saved && <p className="text-p13 text-green-600 text-center">저장됐습니다.</p>}
      </div>
    </>
  )
}
