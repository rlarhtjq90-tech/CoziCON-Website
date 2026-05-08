import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import EditNoticeForm from './EditNoticeForm'

type Params = { params: Promise<{ id: string }> }

export default async function EditNoticePage({ params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { id } = await params

  const [notice, categories] = await Promise.all([
    prisma.bidNotice.findUnique({
      where: { id },
      include: {
        attachments: true,
        categories: { include: { category: true } },
      },
    }),
    prisma.workCategory.findMany({
      where: { parentId: null },
      include: { children: { orderBy: { order: 'asc' } } },
      orderBy: { order: 'asc' },
    }),
  ])

  if (!notice) notFound()
  if (notice.authorId !== session.user.id) redirect(`/notices/${id}`)

  return <EditNoticeForm notice={notice} categories={categories} />
}
