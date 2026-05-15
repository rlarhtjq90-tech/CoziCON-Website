import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import ProfileClient from '@/app/company/profile/ProfileClient'

export default async function SettingsProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      company: {
        include: { licenses: { where: { isActive: true } } },
      },
    },
  })

  if (!user?.company) redirect('/dashboard/settings/account')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-t5 font-bold text-ink-700">회사 정보</h1>
        <p className="mt-1 text-p14 text-ink-400">회사 정보를 관리하고 수정하세요.</p>
      </div>
      <ProfileClient company={user.company as Parameters<typeof ProfileClient>[0]['company']} />
    </div>
  )
}
