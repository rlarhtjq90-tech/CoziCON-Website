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

  const members = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      userType: true,
      createdAt: true,
      company: { select: { name: true, bizNo: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return NextResponse.json(
    members.map(m => ({ ...m, createdAt: m.createdAt.toISOString() }))
  )
}
