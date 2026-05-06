'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  bidId: string
  currentStatus: string
}

export default function BidActions({ bidId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (currentStatus === 'ACCEPTED' || currentStatus === 'REJECTED') return null

  async function update(status: string) {
    setLoading(true)
    await fetch(`/api/bids/${bidId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      {currentStatus === 'SUBMITTED' && (
        <button
          onClick={() => update('REVIEWED')}
          disabled={loading}
          className="px-3 py-1.5 text-p13 border border-ink-200 rounded-lg text-ink-500 hover:bg-ink-50 disabled:opacity-50 transition-colors"
        >
          검토중
        </button>
      )}
      <button
        onClick={() => update('ACCEPTED')}
        disabled={loading}
        className="px-3 py-1.5 text-p13 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
      >
        낙찰
      </button>
      <button
        onClick={() => update('REJECTED')}
        disabled={loading}
        className="px-3 py-1.5 text-p13 border border-ink-200 rounded-lg text-ink-400 hover:bg-ink-50 disabled:opacity-50 transition-colors"
      >
        탈락
      </button>
    </div>
  )
}
