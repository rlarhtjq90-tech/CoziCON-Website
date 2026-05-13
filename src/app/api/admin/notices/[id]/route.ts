import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

function isAdmin(email: string | null | undefined) {
  if (!email) return false
  return (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).includes(email)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 })
  }

  const { id } = await params
  const { isHidden } = await req.json()

  if (typeof isHidden !== 'boolean') {
    return NextResponse.json({ error: '잘못된 요청' }, { status: 400 })
  }

  try {
    await prisma.bidNotice.update({ where: { id }, data: { isHidden } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '공고를 찾을 수 없습니다.' }, { status: 404 })
  }
}
