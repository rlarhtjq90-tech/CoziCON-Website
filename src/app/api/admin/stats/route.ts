import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

function isAdmin(email: string | null | undefined) {
  if (!email) return false
  return (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).includes(email)
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 })
  }

  const [userGroups, noticeGroups, bidGroups, activeContracts] = await Promise.all([
    prisma.user.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.bidNotice.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.bidSubmission.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.contract.count({ where: { status: { in: ['PENDING', 'GC_SIGNED', 'ACTIVE'] } } }),
  ])

  const userMap = Object.fromEntries(userGroups.map(g => [g.status, g._count._all]))
  const noticeMap = Object.fromEntries(noticeGroups.map(g => [g.status, g._count._all]))
  const bidMap = Object.fromEntries(bidGroups.map(g => [g.status, g._count._all]))

  const totalBids = Object.values(bidMap).reduce((a, b) => a + b, 0)
  const acceptedBids = bidMap['ACCEPTED'] ?? 0

  return NextResponse.json({
    users: {
      total: Object.values(userMap).reduce((a, b) => a + b, 0),
      active: userMap['ACTIVE'] ?? 0,
      pending: userMap['PENDING'] ?? 0,
      rejected: (userMap['REJECTED'] ?? 0) + (userMap['SUSPENDED'] ?? 0),
    },
    notices: {
      open: noticeMap['OPEN'] ?? 0,
      total: Object.values(noticeMap).reduce((a, b) => a + b, 0),
    },
    bids: {
      total: totalBids,
      accepted: acceptedBids,
      rate: totalBids > 0 ? Math.round((acceptedBids / totalBids) * 100) : 0,
    },
    contracts: { active: activeContracts },
  })
}
