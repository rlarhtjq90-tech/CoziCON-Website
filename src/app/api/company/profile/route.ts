import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      company: {
        include: { licenses: { where: { isActive: true } } },
      },
    },
  })

  if (!user?.company) {
    return NextResponse.json({ error: '회사 정보가 없습니다.' }, { status: 404 })
  }

  return NextResponse.json({ company: user.company })
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true },
  })
  if (!user?.companyId) {
    return NextResponse.json({ error: '회사 정보가 없습니다.' }, { status: 400 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const allowed = [
    'address', 'phone', 'fax', 'website',
    'constructionCapacity', 'mainRegions',
    'constructionRecords', 'equipmentAndStaff',
  ] as const

  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key]
  }

  try {
    const company = await prisma.company.update({
      where: { id: user.companyId },
      data,
      include: { licenses: { where: { isActive: true } } },
    })
    return NextResponse.json({ company })
  } catch (err) {
    console.error('[company/profile] error:', err)
    return NextResponse.json({ error: '저장에 실패했습니다.' }, { status: 500 })
  }
}
