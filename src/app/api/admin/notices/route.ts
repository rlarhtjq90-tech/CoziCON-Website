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

  const notices = await prisma.bidNotice.findMany({
    select: {
      id: true,
      title: true,
      status: true,
      isHidden: true,
      deadline: true,
      createdAt: true,
      company: { select: { name: true } },
      _count: { select: { submissions: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json(
    notices.map(n => ({
      ...n,
      deadline: n.deadline.toISOString(),
      createdAt: n.createdAt.toISOString(),
    }))
  )
}
