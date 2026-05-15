import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import PortfolioClient from '@/app/dashboard/portfolio/PortfolioClient'

export default async function SettingsPortfolioPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { userType: true, companyId: true },
  })

  if (user?.userType !== 'SPECIALTY_CONTRACTOR' || !user.companyId) {
    redirect('/dashboard/settings')
  }

  const portfolios = await prisma.portfolio.findMany({
    where: { companyId: user.companyId },
    orderBy: { startDate: 'desc' },
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-t5 font-bold text-ink-700">포트폴리오</h1>
        <p className="mt-1 text-p14 text-ink-400">시공 실적을 등록하면 공개 프로필에 표시됩니다.</p>
      </div>
      <PortfolioClient
        initialPortfolios={portfolios.map((p) => ({
          ...p,
          amount: p.amount ? Number(p.amount) : null,
          startDate: p.startDate.toISOString(),
          endDate: p.endDate.toISOString(),
          createdAt: p.createdAt.toISOString(),
        }))}
      />
    </div>
  )
}
