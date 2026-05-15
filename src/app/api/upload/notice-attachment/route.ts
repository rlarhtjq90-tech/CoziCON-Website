import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { put } from '@vercel/blob'
import { scanFile } from '@/lib/file-scan'

export const maxDuration = 30

const MAX_SIZE = 20 * 1024 * 1024 // 20MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/haansofthwp',
  'application/x-hwp',
  'image/jpeg',
  'image/png',
  'image/webp',
]
const ALLOWED_EXT = ['pdf', 'doc', 'docx', 'hwp', 'jpg', 'jpeg', 'png', 'webp']

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: '파일을 선택해주세요.' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!ALLOWED_EXT.includes(ext) && !ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'PDF, DOC, DOCX, HWP, 이미지 파일만 업로드 가능합니다.' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: '파일 크기는 20MB 이하여야 합니다.' }, { status: 400 })
  }

  const scan = await scanFile(file)
  if (!scan.safe) {
    return NextResponse.json({ error: scan.reason ?? '허용되지 않는 파일입니다.' }, { status: 400 })
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({
      url: `__mock__/${file.name}`,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      skipped: true,
    })
  }

  try {
    const filename = `notice-attachments/${session.user.id}-${Date.now()}-${file.name}`
    const blob = await put(filename, file, { access: 'public' })
    return NextResponse.json({
      url: blob.url,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    })
  } catch (err) {
    console.error('[upload/notice-attachment] error:', err)
    return NextResponse.json({ error: '파일 업로드에 실패했습니다.' }, { status: 500 })
  }
}
