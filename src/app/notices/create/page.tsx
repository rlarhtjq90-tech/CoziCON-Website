import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import CreateNoticeForm from './CreateNoticeForm'

export default async function CreateNoticePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  // 카테고리 데이터 서버에서 미리 fetch
  const categories = await prisma.workCategory.findMany({
    where: { parentId: null },
    include: {
      children: { orderBy: { order: 'asc' } },
    },
    orderBy: { order: 'asc' },
  })

  return <CreateNoticeForm categories={categories} />
}
