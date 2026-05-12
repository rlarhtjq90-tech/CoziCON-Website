'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Unlock } from 'lucide-react'

export default function ManualOpenButton({ noticeId }: { noticeId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleOpen() {
    if (!confirm('지금 개찰하시겠습니까? 모든 입찰금액이 공개됩니다.')) return
    setLoading(true)
    await fetch(`/api/notices/${noticeId}/open`, { method: 'POST' })
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleOpen}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg text-p14 font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      <Unlock className="w-4 h-4" />
      {loading ? '개찰 중...' : '개찰하기'}
    </button>
  )
}
