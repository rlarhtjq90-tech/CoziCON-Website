'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Building2, AlertCircle } from 'lucide-react'

interface AdminUser {
  id: string
  email: string | null
  createdAt: string
  company: {
    name: string
    bizNo: string
    type: string
    bizDocUrl: string | null
  } | null
}

export default function AdminClient({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [processing, setProcessing] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleApprove(userId: string) {
    setProcessing(userId)
    setActionError(null)
    const res = await fetch('/api/admin/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    } else {
      setActionError('승인 처리에 실패했습니다. 다시 시도해주세요.')
    }
    setProcessing(null)
  }

  async function handleReject(userId: string) {
    setProcessing(userId)
    setActionError(null)
    const res = await fetch('/api/admin/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    } else {
      setActionError('반려 처리에 실패했습니다. 다시 시도해주세요.')
    }
    setProcessing(null)
  }

  const typeLabel: Record<string, string> = {
    GENERAL_CONTRACTOR: '종합건설사',
    SPECIALTY_CONTRACTOR: '전문건설사',
    OWNER: '발주사',
  }

  return (
    <div className="min-h-screen bg-brand-slate-100">
      <header className="bg-white border-b border-ink-200 shadow-sm">
        <div className="container-content flex items-center h-16">
          <a href="/" className="text-t6 font-bold text-primary tracking-tight">CoziCON</a>
          <span className="ml-3 px-2 py-0.5 bg-red-100 text-red-600 text-p12 font-semibold rounded">관리자</span>
        </div>
      </header>

      <main className="container-content py-12">
        <h1 className="text-t4 font-bold text-ink-700 mb-2">승인 대기</h1>
        <p className="text-p15 text-ink-400 mb-8">{users.length}건 대기 중</p>

        {actionError && (
          <div className="mb-4 flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-p14 text-red-600">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{actionError}</span>
          </div>
        )}

        {users.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-card-md">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="text-p16 text-ink-500">대기 중인 승인 요청이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="bg-white rounded-2xl p-6 shadow-card-md flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-p15 font-semibold text-ink-700">{user.company?.name ?? '-'}</p>
                    <span className="px-2 py-0.5 bg-brand-slate-100 text-ink-500 text-p12 rounded">
                      {typeLabel[user.company?.type ?? ''] ?? user.company?.type}
                    </span>
                  </div>
                  <p className="text-p13 text-ink-400 mt-0.5">
                    {user.company?.bizNo} · {user.email}
                  </p>
                  <p className="text-p12 text-ink-300 mt-0.5">
                    신청일: {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                  {user.company?.bizDocUrl && (
                    <a
                      href={user.company.bizDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-p12 text-primary hover:underline mt-0.5 inline-block"
                    >
                      첨부 서류 보기
                    </a>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleApprove(user.id)}
                    disabled={processing === user.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white text-p13 font-semibold rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    승인
                  </button>
                  <button
                    onClick={() => handleReject(user.id)}
                    disabled={processing === user.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white text-p13 font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    반려
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
