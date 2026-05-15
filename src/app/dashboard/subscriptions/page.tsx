import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/layout/AppFooter'
import SubscriptionClient from './SubscriptionClient'

export default async function SubscriptionsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const sub = await prisma.noticeSubscription.findUnique({
    where: { userId: session.user.id },
    select: { workTypes: true, regions: true, active: true },
  })

  return (
    <div className="min-h-screen bg-brand-slate-100 flex flex-col">
      <AppHeader userId={session.user.id} userEmail={session.user.email ?? ''} companyName={session.user.companyName ?? null} />
      <main className="flex-1 container-content py-8 max-w-2xl">
        <SubscriptionClient initial={sub ?? null} />
      </main>
      <AppFooter />
    </div>
  )
}
