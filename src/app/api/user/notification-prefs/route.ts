import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { notifEmail: true, notifAlimtalk: true },
  })
  if (!user) return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 })

  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const body = await req.json()
  const data: { notifEmail?: boolean; notifAlimtalk?: boolean } = {}
  if (typeof body.notifEmail === 'boolean') data.notifEmail = body.notifEmail
  if (typeof body.notifAlimtalk === 'boolean') data.notifAlimtalk = body.notifAlimtalk

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: '변경할 설정이 없습니다.' }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: { notifEmail: true, notifAlimtalk: true },
  })
  return NextResponse.json(updated)
}
