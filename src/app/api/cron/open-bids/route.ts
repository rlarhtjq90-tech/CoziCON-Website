import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  // openingAt이 지난 CLOSED 공고 → OPENED
  const result = await prisma.bidNotice.updateMany({
    where: { status: 'CLOSED', openingAt: { lt: now } },
    data: { status: 'OPENED' },
  })

  return NextResponse.json({ opened: result.count, at: now.toISOString() })
}
