import Link from 'next/link'
import { Bell } from 'lucide-react'
import { prisma } from '@/lib/db'
import LogoutButton from '@/app/dashboard/LogoutButton'

type Props = {
  userId: string
  userEmail: string
}

export default async function AppHeader({ userId, userEmail }: Props) {
  const unreadCount = await prisma.notification.count({
    where: { userId, read: false },
  })

  return (
    <header className="bg-white border-b border-ink-200 shadow-sm">
      <div className="container-content flex items-center justify-between h-16">
        <a href="/" className="text-t6 font-bold text-primary tracking-tight">CastBid</a>
        <div className="flex items-center gap-4">
          <span className="text-p14 text-ink-500 hidden sm:block">{userEmail}</span>
          <Link href="/notifications" className="relative p-1.5 text-ink-400 hover:text-primary transition-colors">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
