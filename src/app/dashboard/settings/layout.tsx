import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/layout/AppFooter'
import SettingsSidebar from './SettingsSidebar'
import { ArrowLeft } from 'lucide-react'

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      userType: true,
      status: true,
      companyId: true,
      company: { select: { name: true } },
    },
  })

  const hasCompany = !!user?.companyId

  return (
    <div className="min-h-screen bg-brand-slate-100 flex flex-col">
      <AppHeader
        userId={session.user.id}
        userEmail={session.user.email ?? ''}
        companyName={user?.company?.name ?? null}
      />

      <main className="container-content py-8 flex-1 w-full">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-p14 text-ink-400 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            대시보드
          </Link>
        </div>

        <div className="flex gap-6 items-start">
          <SettingsSidebar
            userType={user?.userType ?? null}
            hasCompany={hasCompany}
          />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </main>

      <AppFooter />
    </div>
  )
}
