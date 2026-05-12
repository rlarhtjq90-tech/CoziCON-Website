'use client'

import { useState } from 'react'
import { Bookmark } from 'lucide-react'

type Props = { noticeId: string; initialBookmarked: boolean }

export default function BookmarkButton({ noticeId, initialBookmarked }: Props) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const res = await fetch(`/api/notices/${noticeId}/bookmark`, { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      setBookmarked(data.bookmarked)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={bookmarked ? '관심공고 해제' : '관심공고 등록'}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-p14 transition-colors disabled:opacity-50 ${
        bookmarked
          ? 'bg-yellow-50 border-yellow-300 text-yellow-600 hover:bg-yellow-100'
          : 'border-ink-200 text-ink-400 hover:bg-ink-50'
      }`}
    >
      <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-yellow-500 text-yellow-500' : ''}`} />
      {bookmarked ? '관심 해제' : '관심공고'}
    </button>
  )
}
