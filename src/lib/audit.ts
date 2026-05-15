import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import type { NextRequest } from 'next/server'

export type AuditAction =
  | 'USER_LOGIN'
  | 'NOTICE_CREATE'
  | 'BID_SUBMIT'
  | 'BID_AWARD'
  | 'BID_REJECT'
  | 'CONTRACT_SIGN'
  | 'ADMIN_APPROVE'
  | 'ADMIN_REJECT'

export function getClientIp(req: NextRequest): string | undefined {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? undefined
}

export async function logAudit(params: {
  userId?: string
  action: AuditAction
  targetId?: string
  detail?: Record<string, unknown>
  ip?: string
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        targetId: params.targetId,
        detail: params.detail as Prisma.InputJsonValue | undefined,
        ip: params.ip,
      },
    })
  } catch {
    // best-effort — 감사 로그 실패가 메인 플로우를 막지 않음
  }
}
