import { prisma } from '@/lib/db'

interface NotifPrefs {
  notifEmail: boolean
  notifAlimtalk: boolean
}

export async function getUserNotifPrefs(userId: string): Promise<NotifPrefs> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notifEmail: true, notifAlimtalk: true },
    })
    return user ?? { notifEmail: true, notifAlimtalk: true }
  } catch {
    return { notifEmail: true, notifAlimtalk: true }
  }
}
