import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// 공종 대분류 + 중분류 계층 반환
export async function GET() {
  const parents = await prisma.workCategory.findMany({
    where: { parentId: null },
    include: {
      children: {
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json({ categories: parents })
}
