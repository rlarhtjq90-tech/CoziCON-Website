import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { sendAdminApprovalEmail } from '@/lib/email'
import { createNotification } from '@/lib/notify'
import { logAudit, getClientIp } from '@/lib/audit'

function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim())
  return adminEmails.includes(email)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  let body: { userId: string }
  try { body = await req.json() }
  catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  if (!body.userId || typeof body.userId !== 'string') {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  try {
    const user = await prisma.user.update({
      where: { id: body.userId },
      data: { status: 'ACTIVE' },
      select: { email: true, name: true },
    })
    await Promise.all([
      user.email ? sendAdminApprovalEmail(user.email, { userName: user.name ?? user.email }) : null,
      createNotification(body.userId, 'ADMIN_APPROVED', '회원 승인 완료', '관리자가 회원 승인을 완료했습니다. 이제 모든 기능을 이용하실 수 있습니다.', '/dashboard'),
      logAudit({ userId: session.user.id, action: 'ADMIN_APPROVE', targetId: body.userId, ip: getClientIp(req) }),
    ])
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: '존재하지 않는 사용자입니다.' }, { status: 404 })
    }
    console.error('[admin/approve] error:', err)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
