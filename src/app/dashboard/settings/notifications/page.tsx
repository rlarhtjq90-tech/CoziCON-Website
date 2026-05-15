import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import NotificationPrefsClient from './NotificationPrefsClient'

export default async function NotificationSettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { notifEmail: true, notifAlimtalk: true },
  })

  const initial = {
    notifEmail: user?.notifEmail ?? true,
    notifAlimtalk: user?.notifAlimtalk ?? true,
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-t5 font-bold text-ink-700">알림 수신</h1>
        <p className="mt-1 text-p14 text-ink-400">알림 수신 채널을 설정하세요.</p>
      </div>
      <NotificationPrefsClient initial={initial} />
    </div>
  )
}
