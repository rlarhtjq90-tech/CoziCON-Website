import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/layout/AppFooter'
import CompanyPublicClient from './CompanyPublicClient'

type Props = {
  params: Promise<{ companyId: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function CompanyPublicPage({ params, searchParams }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { companyId } = await params
  const { tab = 'info' } = await searchParams

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true, userType: true },
  })

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      licenses: { where: { isActive: true } },
    },
  })
  if (!company) notFound()

  const portfolios = await prisma.portfolio.findMany({
    where: { companyId },
    orderBy: { startDate: 'desc' },
  })

  const reviews = await prisma.companyReview.findMany({
    where: { targetCompanyId: companyId },
    include: { reviewerCompany: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const avgRating = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : null

  let reviewableContractId: string | null = null
  if (user?.userType === 'GENERAL_CONTRACTOR' && user.companyId) {
    const contract = await prisma.contract.findFirst({
      where: {
        gcCompanyId: user.companyId,
        scCompanyId: companyId,
        status: { not: 'PENDING' },
        review: null,
      },
      select: { id: true },
    })
    reviewableContractId = contract?.id ?? null
  }

  return (
    <div className="min-h-screen bg-brand-slate-100 flex flex-col">
      <AppHeader userId={session.user.id} userEmail={session.user.email ?? ''} companyName={session.user.companyName ?? null} />
      <main className="container-content py-10 flex-1">
        <CompanyPublicClient
          company={{
            ...company,
            licenses: company.licenses,
          }}
          portfolios={portfolios.map(p => ({
            ...p,
            amount: p.amount ? Number(p.amount) : null,
            startDate: p.startDate.toISOString(),
            endDate: p.endDate.toISOString(),
            createdAt: p.createdAt.toISOString(),
          }))}
          reviews={reviews.map(r => ({
            ...r,
            createdAt: r.createdAt.toISOString(),
          }))}
          avgRating={avgRating}
          initialTab={tab}
          reviewableContractId={reviewableContractId}
          viewerCompanyId={user?.companyId ?? null}
        />
      </main>
      <AppFooter />
    </div>
  )
}
