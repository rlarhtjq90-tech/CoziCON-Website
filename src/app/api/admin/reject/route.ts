import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { sendAdminRejectionEmail } from '@/lib/email'
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

  let body: { userId: string; reason?: string }
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
      data: { status: 'REJECTED' },
      select: { email: true, name: true },
    })
    await Promise.all([
      user.email ? sendAdminRejectionEmail(user.email, { userName: user.name ?? user.email, reason: body.reason }) : null,
      createNotification(body.userId, 'ADMIN_REJECTED', '회원 승인 반려', body.reason ? `반려 사유: ${body.reason}` : '회원 승인이 반려되었습니다. 서류를 확인 후 재신청해주세요.', '/dashboard'),
      logAudit({ userId: session.user.id, action: 'ADMIN_REJECT', targetId: body.userId, detail: { reason: body.reason }, ip: getClientIp(req) }),
    ])
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: '존재하지 않는 사용자입니다.' }, { status: 404 })
    }
    console.error('[admin/reject] error:', err)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
