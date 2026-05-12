'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, Trophy, XCircle, FileText, CheckCircle2, ShieldCheck, ShieldX } from 'lucide-react'

type Notification = {
  id: string
  type: string
  title: string
  body: string
  link: string | null
  read: boolean
  createdAt: Date
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  BID_AWARDED:            <Trophy className="w-5 h-5 text-green-500" />,
  BID_REJECTED:           <XCircle className="w-5 h-5 text-ink-400" />,
  NEW_BID:                <FileText className="w-5 h-5 text-brand-blue" />,
  CONTRACT_SIGN_REQUEST:  <FileText className="w-5 h-5 text-yellow-500" />,
  CONTRACT_ACTIVE:        <CheckCircle2 className="w-5 h-5 text-green-500" />,
  ADMIN_APPROVED:         <ShieldCheck className="w-5 h-5 text-green-500" />,
  ADMIN_REJECTED:         <ShieldX className="w-5 h-5 text-red-500" />,
}

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '방금 전'
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  return `${days}일 전`
}

export default function NotificationList({ notifications }: { notifications: Notification[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [localRead, setLocalRead] = useState<Set<string>>(
    new Set(notifications.filter((n) => n.read).map((n) => n.id))
  )

  const unreadCount = notifications.filter((n) => !localRead.has(n.id)).length

  async function markRead(id: string) {
    if (localRead.has(id)) return
    setLocalRead((prev) => new Set(Array.from(prev).concat(id)))
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
    startTransition(() => router.refresh())
  }

  async function markAllRead() {
    setLocalRead(new Set(notifications.map((n) => n.id)))
    await fetch('/api/notifications/read-all', { method: 'PATCH' })
    startTransition(() => router.refresh())
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-ink-200 p-16 text-center">
        <Bell className="w-10 h-10 text-ink-200 mx-auto mb-3" />
        <p className="text-p15 text-ink-400">알림이 없습니다.</p>
      </div>
    )
  }

  return (
    <div>
      {unreadCount > 0 && (
        <div className="flex justify-end mb-3">
          <button
            onClick={markAllRead}
            className="text-p13 text-ink-400 hover:text-primary transition-colors"
          >
            전체 읽음 처리
          </button>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((n) => {
          const isRead = localRead.has(n.id)
          const icon = TYPE_ICON[n.type] ?? <Bell className="w-5 h-5 text-ink-400" />

          const inner = (
            <div
              className={`flex items-start gap-4 bg-white rounded-xl border p-5 transition-colors ${
                isRead ? 'border-ink-200 opacity-70' : 'border-brand-blue/30 shadow-sm'
              }`}
              onClick={() => markRead(n.id)}
            >
              <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${isRead ? 'bg-ink-100' : 'bg-blue-50'}`}>
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-p15 font-semibold ${isRead ? 'text-ink-500' : 'text-ink-700'}`}>{n.title}</p>
                  {!isRead && <span className="shrink-0 w-2 h-2 rounded-full bg-brand-blue mt-1.5" />}
                </div>
                <p className="text-p14 text-ink-500 mt-0.5">{n.body}</p>
                <p className="text-p12 text-ink-300 mt-1.5">{timeAgo(n.createdAt)}</p>
              </div>
            </div>
          )

          return n.link ? (
            <Link key={n.id} href={n.link} className="block cursor-pointer">
              {inner}
            </Link>
          ) : (
            <div key={n.id} className="cursor-pointer">
              {inner}
            </div>
          )
        })}
      </div>
    </div>
  )
}
