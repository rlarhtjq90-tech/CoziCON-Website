'use client'

import { useState } from 'react'
import { Bell, Mail, MessageSquare, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

interface Prefs {
  notifEmail: boolean
  notifAlimtalk: boolean
}

export default function NotificationPrefsClient({ initial }: { initial: Prefs }) {
  const [prefs, setPrefs] = useState<Prefs>(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function toggle(key: keyof Prefs) {
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    setSaving(true)
    setSaved(false)
    try {
      await fetch('/api/user/notification-prefs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: next[key] }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setPrefs(prefs) // 롤백
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-p14 text-ink-500 hover:text-primary mb-6">
        <ChevronLeft className="w-4 h-4" />
        대시보드로 돌아가기
      </Link>

      <div className="bg-white rounded-2xl border border-ink-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-t6 font-bold text-ink-700">알림 수신 설정</h1>
            <p className="text-p13 text-ink-400 mt-0.5">이메일 및 알림톡 수신 여부를 설정합니다.</p>
          </div>
        </div>

        <div className="space-y-4">
          <ToggleRow
            icon={<Mail className="w-4 h-4 text-primary" />}
            label="이메일 알림"
            desc="낙찰 결과, 계약 서명 요청, 관리자 승인/반려 등의 알림을 이메일로 받습니다."
            enabled={prefs.notifEmail}
            onToggle={() => toggle('notifEmail')}
            disabled={saving}
          />
          <ToggleRow
            icon={<MessageSquare className="w-4 h-4 text-primary" />}
            label="카카오 알림톡"
            desc="낙찰 결과, 개찰 안내, 계약 서명 요청 등의 중요 알림을 카카오 알림톡으로 받습니다."
            enabled={prefs.notifAlimtalk}
            onToggle={() => toggle('notifAlimtalk')}
            disabled={saving}
          />

          {saved && (
            <p className="text-p13 text-green-600 text-center pt-2">설정이 저장되었습니다.</p>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-ink-100">
          <p className="text-p13 text-ink-400">* 인앱 알림은 수신 설정과 관계없이 항상 제공됩니다.</p>
          <p className="text-p13 text-ink-400 mt-1">* 이메일/알림톡을 비활성화해도 서비스 이용에는 제한이 없습니다.</p>
        </div>
      </div>
    </>
  )
}

function ToggleRow({
  icon,
  label,
  desc,
  enabled,
  onToggle,
  disabled,
}: {
  icon: React.ReactNode
  label: string
  desc: string
  enabled: boolean
  onToggle: () => void
  disabled: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-ink-200 hover:border-primary/30 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5 shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-p14 font-semibold text-ink-700">{label}</p>
          <p className="text-p13 text-ink-400 mt-0.5 leading-relaxed">{desc}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        disabled={disabled}
        className={`shrink-0 relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
          enabled ? 'bg-primary' : 'bg-ink-300'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}
