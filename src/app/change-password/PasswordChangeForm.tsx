'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PasswordChangeForm() {
  const router = useRouter()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (form.newPassword !== form.confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? '오류가 발생했습니다.')
      } else {
        setSuccess(true)
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => router.push('/dashboard'), 1500)
      }
    } catch {
      setError('서버 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-p14 font-medium text-ink-600 mb-1.5">현재 비밀번호</label>
        <input
          type="password"
          value={form.currentPassword}
          onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
          className="w-full px-4 py-3 border border-ink-300 rounded-lg text-p14 text-ink-700 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          required
          autoComplete="current-password"
        />
      </div>
      <div>
        <label className="block text-p14 font-medium text-ink-600 mb-1.5">새 비밀번호</label>
        <input
          type="password"
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          className="w-full px-4 py-3 border border-ink-300 rounded-lg text-p14 text-ink-700 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="8자 이상"
        />
      </div>
      <div>
        <label className="block text-p14 font-medium text-ink-600 mb-1.5">새 비밀번호 확인</label>
        <input
          type="password"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          className="w-full px-4 py-3 border border-ink-300 rounded-lg text-p14 text-ink-700 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          required
          autoComplete="new-password"
        />
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-p14 text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-p14 text-emerald-700 font-medium">
          비밀번호가 변경되었습니다. 대시보드로 이동합니다...
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-primary text-white font-semibold text-p16 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
      >
        {loading ? '변경 중...' : '비밀번호 변경'}
      </button>
    </form>
  )
}
