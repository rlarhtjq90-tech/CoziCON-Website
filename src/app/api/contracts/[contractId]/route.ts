import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { sendContractSignRequestEmail, sendContractActiveEmail } from '@/lib/email'
import { createNotification } from '@/lib/notify'
import { logAudit, getClientIp } from '@/lib/audit'

type RouteContext = { params: Promise<{ contractId: string }> }

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })

  const { contractId } = await params
  const { action } = await req.json()

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true },
  })
  if (!user?.companyId) return NextResponse.json({ error: '회사 정보 없음' }, { status: 403 })

  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: { notice: { select: { title: true } } },
  })
  if (!contract) return NextResponse.json({ error: '계약을 찾을 수 없습니다.' }, { status: 404 })

  const isGC = contract.gcCompanyId === user.companyId
  const isSC = contract.scCompanyId === user.companyId
  if (!isGC && !isSC) return NextResponse.json({ error: '권한 없음' }, { status: 403 })

  if (action === 'sign') {
    const role = isGC ? 'GC' : 'SC'
    await prisma.contractSign.upsert({
      where: { contractId_role: { contractId, role } },
      create: { contractId, userId: session.user.id, role },
      update: { signedAt: new Date() },
    })

    const now = new Date()
    let nextStatus = contract.status

    if (role === 'GC') {
      await prisma.contract.update({ where: { id: contractId }, data: { gcSignedAt: now } })
      if (contract.scSignedAt) nextStatus = 'ACTIVE'
      else nextStatus = 'GC_SIGNED'
    } else {
      await prisma.contract.update({ where: { id: contractId }, data: { scSignedAt: now } })
      if (contract.gcSignedAt) nextStatus = 'ACTIVE'
    }

    const updated = await prisma.contract.update({
      where: { id: contractId },
      data: { status: nextStatus },
    })

    const noticeTitle = contract.notice.title
    logAudit({ userId: session.user.id, action: 'CONTRACT_SIGN', targetId: contractId, detail: { role, nextStatus }, ip: getClientIp(req) }).catch(() => {})

    if (nextStatus === 'ACTIVE') {
      const [gcUser, scUser] = await Promise.all([
        prisma.user.findFirst({ where: { companyId: contract.gcCompanyId }, select: { id: true, email: true, name: true } }),
        prisma.user.findFirst({ where: { companyId: contract.scCompanyId }, select: { id: true, email: true, name: true } }),
      ])
      await Promise.all([
        gcUser?.email ? sendContractActiveEmail(gcUser.email, { userName: gcUser.name ?? gcUser.email, noticeTitle, contractId }) : null,
        scUser?.email ? sendContractActiveEmail(scUser.email, { userName: scUser.name ?? scUser.email, noticeTitle, contractId }) : null,
        gcUser ? createNotification(gcUser.id, 'CONTRACT_ACTIVE', '계약이 성립되었습니다', `${noticeTitle} 공고 계약이 양측 서명으로 확정되었습니다.`, `/contracts/${contractId}`) : null,
        scUser ? createNotification(scUser.id, 'CONTRACT_ACTIVE', '계약이 성립되었습니다', `${noticeTitle} 공고 계약이 양측 서명으로 확정되었습니다.`, `/contracts/${contractId}`) : null,
      ])
    } else if (nextStatus === 'GC_SIGNED') {
      const scUser = await prisma.user.findFirst({
        where: { companyId: contract.scCompanyId },
        select: { id: true, email: true, name: true },
      })
      await Promise.all([
        scUser?.email ? sendContractSignRequestEmail(scUser.email, { userName: scUser.name ?? scUser.email, noticeTitle, contractId, signerRole: 'GC' }) : null,
        scUser ? createNotification(scUser.id, 'CONTRACT_SIGN_REQUEST', '계약 서명이 요청되었습니다', `${noticeTitle} 공고 계약에 서명이 필요합니다.`, `/contracts/${contractId}`) : null,
      ])
    }

    return NextResponse.json({ id: updated.id, status: updated.status })
  }

  if (action === 'complete' || action === 'terminate') {
    if (!isGC) return NextResponse.json({ error: '발주사만 변경 가능합니다.' }, { status: 403 })
    if (!['ACTIVE', 'GC_SIGNED'].includes(contract.status)) {
      return NextResponse.json({ error: '진행 중인 계약만 완료/해지할 수 있습니다.' }, { status: 400 })
    }
    const newStatus = action === 'complete' ? 'COMPLETED' : 'TERMINATED'
    const updated = await prisma.contract.update({
      where: { id: contractId },
      data: { status: newStatus },
    })
    return NextResponse.json({ id: updated.id, status: updated.status })
  }

  return NextResponse.json({ error: '유효하지 않은 액션' }, { status: 400 })
}
