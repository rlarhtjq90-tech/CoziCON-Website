import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import AdminClient from './AdminClient'

function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim())
  return adminEmails.includes(email)
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !isAdmin(session.user.email)) redirect('/')

  const pendingUsers = await prisma.user.findMany({
    where: { status: 'PENDING', companyId: { not: null } },
    include: { company: true },
    orderBy: { createdAt: 'asc' },
  })

  const serialized = pendingUsers.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    company: u.company
      ? { name: u.company.name, bizNo: u.company.bizNo, type: u.company.type, bizDocUrl: u.company.bizDocUrl }
      : null,
  }))

  return <AdminClient initialUsers={serialized} />
}
