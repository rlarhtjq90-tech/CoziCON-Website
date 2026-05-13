import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

function isAdmin(email: string | null | undefined) {
  if (!email) return false
  return (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).includes(email)
}

const ALLOWED_STATUSES = ['ACTIVE', 'SUSPENDED', 'REJECTED'] as const

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 })
  }

  const { id } = await params
  const { status } = await req.json()

  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: '잘못된 상태값' }, { status: 400 })
  }

  try {
    await prisma.user.update({ where: { id }, data: { status } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 })
  }
}
