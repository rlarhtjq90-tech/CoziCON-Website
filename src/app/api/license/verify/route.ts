import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface LicenseItem {
  licenseType: string
  licenseNo: string
  issuedAt: string | null
}

interface VerifyLicenseRequest {
  selectedLicenses: LicenseItem[]
  licenseDocUrl?: string | null
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  if (!session.user.companyId) {
    return NextResponse.json({ error: '사업자 인증을 먼저 완료해주세요.' }, { status: 400 })
  }

  let body: VerifyLicenseRequest
  try { body = await req.json() }
  catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const { selectedLicenses, licenseDocUrl } = body

  if (!Array.isArray(selectedLicenses)) {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  try {
    // 기존 면허 비활성화 후 새로 저장
    await prisma.$transaction(async (tx) => {
      await tx.license.updateMany({
        where: { companyId: session.user.companyId! },
        data: { isActive: false },
      })

      if (selectedLicenses.length > 0) {
        await tx.license.createMany({
          data: selectedLicenses.map((l) => ({
            companyId: session.user.companyId!,
            licenseType: l.licenseType,
            licenseNo: l.licenseNo || null,
            issuedAt: l.issuedAt ? new Date(l.issuedAt) : null,
            isActive: true,
          })),
        })
      }

      // 건설업등록증 URL이 있으면 Company에 저장
      if (licenseDocUrl) {
        await tx.company.update({
          where: { id: session.user.companyId! },
          data: { bizDocUrl: licenseDocUrl },
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[license/verify] error:', err)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
