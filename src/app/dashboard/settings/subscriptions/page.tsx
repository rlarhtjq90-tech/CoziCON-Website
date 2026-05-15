import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import SubscriptionClient from '@/app/dashboard/subscriptions/SubscriptionClient'

export default async function SettingsSubscriptionsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const sub = await prisma.noticeSubscription.findUnique({
    where: { userId: session.user.id },
    select: { workTypes: true, regions: true, active: true },
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-t5 font-bold text-ink-700">키워드 구독</h1>
        <p className="mt-1 text-p14 text-ink-400">공종·지역 키워드를 설정하면 새 공고를 알려드립니다.</p>
      </div>
      <SubscriptionClient initial={sub ?? null} />
    </div>
  )
}
