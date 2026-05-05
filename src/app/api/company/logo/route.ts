import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { put } from '@vercel/blob'

export const maxDuration = 30

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true },
  })
  if (!user?.companyId) {
    return NextResponse.json({ error: '회사 정보가 없습니다.' }, { status: 400 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: '파일을 선택해주세요.' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'JPG, PNG, WEBP 파일만 업로드 가능합니다.' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: '파일 크기는 5MB 이하여야 합니다.' }, { status: 400 })
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ url: null, skipped: true })
  }

  try {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const filename = `company-logo/${user.companyId}-${Date.now()}.${ext}`
    const blob = await put(filename, file, { access: 'public' })

    await prisma.company.update({
      where: { id: user.companyId },
      data: { logoUrl: blob.url },
    })

    return NextResponse.json({ url: blob.url })
  } catch (err) {
    console.error('[company/logo] error:', err)
    return NextResponse.json({ error: '파일 업로드에 실패했습니다.' }, { status: 500 })
  }
}
