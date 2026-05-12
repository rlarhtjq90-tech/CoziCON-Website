import { prisma } from '@/lib/db'

export type NotificationType =
  | 'BID_AWARDED'
  | 'BID_REJECTED'
  | 'NEW_BID'
  | 'CONTRACT_SIGN_REQUEST'
  | 'CONTRACT_ACTIVE'
  | 'ADMIN_APPROVED'
  | 'ADMIN_REJECTED'

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  link?: string,
) {
  try {
    await prisma.notification.create({ data: { userId, type, title, body, link: link ?? null } })
  } catch {
    // best-effort — 알림 실패가 메인 플로우를 막지 않도록
  }
}
