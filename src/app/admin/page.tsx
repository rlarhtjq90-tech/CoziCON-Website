import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import AdminDashboard from './AdminDashboard'

function isAdmin(email: string | null | undefined) {
  if (!email) return false
  return (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).includes(email)
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !isAdmin(session.user.email)) redirect('/')

  const [userGroups, noticeGroups, bidGroups, activeContracts, pendingUsers, allNotices, allMembers, announcements] =
    await Promise.all([
      prisma.user.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.bidNotice.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.bidSubmission.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.contract.count({ where: { status: { in: ['PENDING', 'GC_SIGNED', 'ACTIVE'] } } }),

      prisma.user.findMany({
        where: { status: 'PENDING', companyId: { not: null } },
        include: { company: true },
        orderBy: { createdAt: 'asc' },
      }),

      prisma.bidNotice.findMany({
        select: {
          id: true, title: true, status: true, isHidden: true, deadline: true, createdAt: true,
          company: { select: { name: true } },
          _count: { select: { submissions: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),

      prisma.user.findMany({
        select: {
          id: true, email: true, name: true, status: true, userType: true, createdAt: true,
          company: { select: { name: true, bizNo: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),

      prisma.announcement.findMany({
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      }),
    ])

  const userMap = Object.fromEntries(userGroups.map(g => [g.status, g._count._all]))
  const noticeMap = Object.fromEntries(noticeGroups.map(g => [g.status, g._count._all]))
  const bidMap = Object.fromEntries(bidGroups.map(g => [g.status, g._count._all]))
  const totalBids = Object.values(bidMap).reduce((a, b) => a + b, 0)
  const acceptedBids = bidMap['ACCEPTED'] ?? 0

  const stats = {
    users: {
      total: Object.values(userMap).reduce((a, b) => a + b, 0),
      active: userMap['ACTIVE'] ?? 0,
      pending: userMap['PENDING'] ?? 0,
      rejected: (userMap['REJECTED'] ?? 0) + (userMap['SUSPENDED'] ?? 0),
    },
    notices: { open: noticeMap['OPEN'] ?? 0, total: Object.values(noticeMap).reduce((a, b) => a + b, 0) },
    bids: { total: totalBids, accepted: acceptedBids, rate: totalBids > 0 ? Math.round((acceptedBids / totalBids) * 100) : 0 },
    contracts: { active: activeContracts },
  }

  return (
    <AdminDashboard
      stats={stats}
      pendingUsers={pendingUsers.map(u => ({
        id: u.id,
        email: u.email,
        createdAt: u.createdAt.toISOString(),
        company: u.company
          ? { name: u.company.name, bizNo: u.company.bizNo, type: u.company.type, bizDocUrl: u.company.bizDocUrl }
          : null,
      }))}
      notices={allNotices.map(n => ({
        ...n,
        deadline: n.deadline.toISOString(),
        createdAt: n.createdAt.toISOString(),
      }))}
      members={allMembers.map(m => ({ ...m, createdAt: m.createdAt.toISOString() }))}
      announcements={announcements.map(a => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      }))}
    />
  )
}
