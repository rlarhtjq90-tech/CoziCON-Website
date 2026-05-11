'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  contractId: string
  status: string
  canSign: boolean
  alreadySigned: boolean
  isGC: boolean
}

export default function ContractActions({ contractId, status, canSign, alreadySigned, isGC }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function action(a: string) {
    setLoading(true)
    await fetch(`/api/contracts/${contractId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: a }),
    })
    setLoading(false)
    router.refresh()
  }

  const terminated = status === 'TERMINATED'
  const completed = status === 'COMPLETED'

  return (
    <div className="flex flex-wrap gap-3">
      {canSign && !alreadySigned && !terminated && !completed && (
        <button
          onClick={() => action('sign')}
          disabled={loading}
          className="px-5 py-2.5 bg-primary text-white text-p14 font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? '처리 중...' : '서명하기'}
        </button>
      )}
      {alreadySigned && (
        <span className="px-4 py-2.5 bg-green-50 text-green-600 text-p14 font-medium rounded-lg border border-green-200">
          서명 완료
        </span>
      )}
      {isGC && status === 'ACTIVE' && (
        <button
          onClick={() => action('complete')}
          disabled={loading}
          className="px-5 py-2.5 border border-ink-200 text-ink-600 text-p14 font-medium rounded-lg hover:bg-ink-50 disabled:opacity-50 transition-colors"
        >
          공사 완료 처리
        </button>
      )}
      {isGC && (status === 'PENDING' || status === 'GC_SIGNED' || status === 'ACTIVE') && (
        <button
          onClick={() => { if (confirm('계약을 해지하시겠습니까?')) action('terminate') }}
          disabled={loading}
          className="px-5 py-2.5 border border-red-200 text-red-500 text-p14 font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          계약 해지
        </button>
      )}
    </div>
  )
}
