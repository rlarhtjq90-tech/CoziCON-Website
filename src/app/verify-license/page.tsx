import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import VerifyLicenseClient from './VerifyLicenseClient'

export default async function VerifyLicensePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (!session.user.companyId) redirect('/verify-biz')

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
  })
  if (!company) redirect('/verify-biz')

  return (
    <VerifyLicenseClient
      bizNo={company.bizNo}
      userType={session.user.userType ?? ''}
    />
  )
}
