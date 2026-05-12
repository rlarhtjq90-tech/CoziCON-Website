import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  const result = await prisma.bidNotice.updateMany({
    where: { status: 'OPEN', deadline: { lt: now } },
    data: { status: 'CLOSED' },
  })

  return NextResponse.json({ closed: result.count, at: now.toISOString() })
}
