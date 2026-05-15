import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/layout/AppFooter'
import PortfolioClient from './PortfolioClient'
import { ArrowLeft } from 'lucide-react'

export default async function PortfolioManagePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { userType: true, companyId: true },
  })

  if (user?.userType !== 'SPECIALTY_CONTRACTOR' || !user.companyId) {
    redirect('/dashboard')
  }

  const portfolios = await prisma.portfolio.findMany({
    where: { companyId: user.companyId },
    orderBy: { startDate: 'desc' },
  })

  return (
    <div className="min-h-screen bg-brand-slate-100 flex flex-col">
      <AppHeader userId={session.user.id} userEmail={session.user.email ?? ''} companyName={session.user.companyName ?? null} />
      <main className="container-content py-10 flex-1">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-p14 text-ink-400 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            대시보드로
          </Link>
        </div>
        <div className="mb-6">
          <h1 className="text-t4 font-bold text-ink-700">내 포트폴리오</h1>
          <p className="mt-1 text-p15 text-ink-400">시공 실적을 등록하면 공개 프로필에 표시됩니다.</p>
        </div>
        <PortfolioClient
          initialPortfolios={portfolios.map(p => ({
            ...p,
            amount: p.amount ? Number(p.amount) : null,
            startDate: p.startDate.toISOString(),
            endDate: p.endDate.toISOString(),
            createdAt: p.createdAt.toISOString(),
          }))}
        />
      </main>
      <AppFooter />
    </div>
  )
}
