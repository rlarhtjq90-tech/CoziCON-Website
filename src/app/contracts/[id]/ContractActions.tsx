'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'

interface Props {
  contractId: string
  canSign: boolean
  alreadySigned: boolean
  statusLabel: string
}

export default function ContractActions({ contractId, canSign, alreadySigned, statusLabel }: Props) {
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSign() {
    if (!agreed) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/contracts/${contractId}/sign`, { method: 'PATCH' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? '서명 처리 실패')
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (alreadySigned) {
    return (
      <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-xl px-4 py-3">
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-medium">서명 완료</span>
      </div>
    )
  }

  if (!canSign) {
    return (
      <div className="text-sm text-ink-400 bg-ink-50 rounded-xl px-4 py-3">
        현재 상태: <span className="font-medium text-ink-600">{statusLabel}</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-ink-300 text-brand-blue focus:ring-brand-blue"
        />
        <span className="text-sm text-ink-700">
          위 계약 내용을 충분히 검토하였으며, 계약 조건에 동의하여 전자 서명합니다.
        </span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={handleSign}
        disabled={!agreed || loading}
        className="w-full py-3 rounded-xl font-semibold text-white bg-brand-blue hover:bg-blue-700 disabled:bg-ink-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        전자 서명하기
      </button>
    </div>
  )
}
