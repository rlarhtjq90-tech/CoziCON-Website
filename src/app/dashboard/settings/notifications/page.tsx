import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/layout/AppFooter'
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
    <div className="min-h-screen bg-brand-slate-100 flex flex-col">
      <AppHeader userId={session.user.id} userEmail={session.user.email ?? ''} />
      <main className="flex-1 container-content py-8 max-w-2xl">
        <NotificationPrefsClient initial={initial} />
      </main>
      <AppFooter />
    </div>
  )
}
