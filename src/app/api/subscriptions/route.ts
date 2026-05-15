import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const sub = await prisma.noticeSubscription.findUnique({
    where: { userId: session.user.id },
  })
  return NextResponse.json({ subscription: sub ?? null })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const body = await req.json()
  const workTypes: string[] = Array.isArray(body.workTypes) ? body.workTypes : []
  const regions: string[] = Array.isArray(body.regions) ? body.regions : []
  const active: boolean = body.active !== false

  const sub = await prisma.noticeSubscription.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, workTypes, regions, active },
    update: { workTypes, regions, active },
  })
  return NextResponse.json({ subscription: sub })
}

export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  await prisma.noticeSubscription.deleteMany({ where: { userId: session.user.id } })
  return NextResponse.json({ ok: true })
}
