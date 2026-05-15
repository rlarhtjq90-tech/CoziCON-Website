import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'
import NotificationList from './NotificationList'

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <div className="min-h-screen bg-brand-slate-100">
      <AppHeader userId={session.user.id} userEmail={session.user.email ?? ''} companyName={session.user.companyName ?? null} />

      <main className="container-content py-10 max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="flex items-center gap-1.5 text-p14 text-ink-400 hover:text-primary transition-colors mb-2">
              <ArrowLeft className="w-4 h-4" />
              대시보드
            </Link>
            <h1 className="text-t4 font-bold text-ink-700">알림</h1>
          </div>
        </div>

        <NotificationList notifications={notifications} />
      </main>
    </div>
  )
}
