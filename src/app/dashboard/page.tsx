import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { ContractStatus } from '@prisma/client'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'
import { AlertTriangle, CheckCircle2, Clock, Building2, FileText, Gavel, Settings, Shield, FileSignature, Bell } from 'lucide-react'
import AppFooter from '@/components/layout/AppFooter'

function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim())
  return adminEmails.includes(email)
}

type StatCard = { label: string; value: number; sub?: string }

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const adminUser = isAdmin(session.user?.email)

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { company: true },
  })

  const isPending = user?.status === 'PENDING'
  const hasCompany = !!user?.company
  const isBusinessVerified = user?.company?.businessVerified ?? false

  // 통계: 활성 계정만 조회
  let stats: StatCard[] = []
  if (hasCompany && !isPending && user?.company) {
    const companyId = user.company.id
    const activeStatuses: ContractStatus[] = [ContractStatus.PENDING, ContractStatus.GC_SIGNED, ContractStatus.ACTIVE]

    if (user.userType === 'GENERAL_CONTRACTOR') {
      const [noticeCount, bidCount, contractCount] = await Promise.all([
        prisma.bidNotice.count({ where: { companyId } }),
        prisma.bidSubmission.count({ where: { notice: { companyId } } }),
        prisma.contract.count({ where: { gcCompanyId: companyId, status: { in: activeStatuses } } }),
      ])
      stats = [
        { label: '등록 공고', value: noticeCount, sub: '건' },
        { label: '접수 입찰', value: bidCount, sub: '건' },
        { label: '진행 계약', value: contractCount, sub: '건' },
      ]
    } else if (user.userType === 'SPECIALTY_CONTRACTOR') {
      const [bidCount, awardedCount, contractCount] = await Promise.all([
        prisma.bidSubmission.count({ where: { companyId } }),
        prisma.bidSubmission.count({ where: { companyId, status: 'ACCEPTED' } }),
        prisma.contract.count({ where: { scCompanyId: companyId, status: { in: activeStatuses } } }),
      ])
      stats = [
        { label: '참여 입찰', value: bidCount, sub: '건' },
        { label: '낙찰', value: awardedCount, sub: '건' },
        { label: '진행 계약', value: contractCount, sub: '건' },
      ]
    }
  }

  return (
    <div className="min-h-screen bg-brand-slate-100 flex flex-col">
      <AppHeader userId={session.user.id} userEmail={session.user.email ?? ''} />

      <main className="container-content py-12 flex-1">
        {/* 사업자 인증 배너 */}
        {!hasCompany && (
          <div className="mb-6 flex items-start gap-3 px-5 py-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-p15 font-semibold text-amber-800">사업자 인증이 필요합니다</p>
              <p className="text-p13 text-amber-600 mt-0.5">서비스 이용을 위해 사업자등록번호 인증을 완료해주세요.</p>
            </div>
            <Link
              href="/verify-biz"
              className="shrink-0 px-4 py-2 bg-amber-500 text-white text-p13 font-semibold rounded-lg hover:bg-amber-600 transition-colors"
            >
              인증하기
            </Link>
          </div>
        )}

        {/* 인증 완료 & 관리자 승인 대기 배너 */}
        {hasCompany && isPending && (
          <div className="mb-6 flex items-start gap-3 px-5 py-4 bg-blue-50 border border-blue-200 rounded-xl">
            <Clock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-p15 font-semibold text-blue-800">관리자 승인 대기 중</p>
              <p className="text-p13 text-blue-600 mt-0.5">사업자 인증이 완료됐습니다. 관리자 검토 후 서비스가 활성화됩니다.</p>
            </div>
          </div>
        )}

        {/* 정상 활성 */}
        {hasCompany && !isPending && (
          <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-p14 text-emerald-700 font-medium">인증된 회원입니다. 모든 서비스를 이용할 수 있습니다.</p>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-t4 font-bold text-ink-700">
            안녕하세요, {session.user?.name ?? session.user?.email}님
          </h1>
          <p className="mt-2 text-p16 text-ink-500">CoziCON 대시보드에 오신 것을 환영합니다.</p>
        </div>

        {/* 통계 카드 */}
        {stats.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {stats.map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-6 shadow-card-md">
                <p className="text-p13 text-ink-400 font-medium mb-1">{s.label}</p>
                <p className="text-t3 font-bold text-ink-800 leading-none">
                  {s.value.toLocaleString()}
                  <span className="text-p14 font-normal text-ink-400 ml-1">{s.sub}</span>
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-4 tablet:grid-cols-3">
          {hasCompany && (
            <Link
              href="/company/profile"
              className="bg-white rounded-2xl p-6 shadow-card-md hover:shadow-card-lg transition-shadow group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <p className="text-p14 text-ink-400 font-medium">회사 프로필</p>
              </div>
              <p className="text-p15 font-semibold text-ink-700 group-hover:text-primary transition-colors">
                {user?.company?.name ?? '—'}
              </p>
              <p className="mt-1 text-p12 text-primary font-medium">정보 보기 →</p>
            </Link>
          )}
          <Link
            href="/notices"
            className="bg-white rounded-2xl p-6 shadow-card-md hover:shadow-card-lg transition-shadow group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <p className="text-p14 text-ink-400 font-medium">입찰공고</p>
            </div>
            <p className="text-p15 font-semibold text-ink-700 group-hover:text-primary transition-colors">
              공고 게시판
            </p>
            <p className="mt-1 text-p12 text-primary font-medium">바로가기 →</p>
          </Link>
          {user?.userType === 'SPECIALTY_CONTRACTOR' && (
            <Link
              href="/my-bids"
              className="bg-white rounded-2xl p-6 shadow-card-md hover:shadow-card-lg transition-shadow group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Gavel className="w-4 h-4 text-primary" />
                </div>
                <p className="text-p14 text-ink-400 font-medium">내 입찰</p>
              </div>
              <p className="text-p15 font-semibold text-ink-700 group-hover:text-primary transition-colors">
                입찰 현황
              </p>
              <p className="mt-1 text-p12 text-primary font-medium">바로가기 →</p>
            </Link>
          )}
          <Link
            href="/my-bookmarks"
            className="bg-white rounded-2xl p-6 shadow-card-md hover:shadow-card-lg transition-shadow group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center">
                <FileSignature className="w-4 h-4 text-yellow-500" />
              </div>
              <p className="text-p14 text-ink-400 font-medium">관심공고</p>
            </div>
            <p className="text-p15 font-semibold text-ink-700 group-hover:text-yellow-600 transition-colors">
              즐겨찾기
            </p>
            <p className="mt-1 text-p12 text-yellow-500 font-medium">관심 목록 →</p>
          </Link>
          {user?.userType === 'GENERAL_CONTRACTOR' && (
            <Link
              href="/notices/create"
              className="bg-white rounded-2xl p-6 shadow-card-md hover:shadow-card-lg transition-shadow group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Gavel className="w-4 h-4 text-primary" />
                </div>
                <p className="text-p14 text-ink-400 font-medium">공고 등록</p>
              </div>
              <p className="text-p15 font-semibold text-ink-700 group-hover:text-primary transition-colors">
                입찰공고 작성
              </p>
              <p className="mt-1 text-p12 text-primary font-medium">바로가기 →</p>
            </Link>
          )}
          {hasCompany && !isPending && (
            <Link
              href="/contracts"
              className="bg-white rounded-2xl p-6 shadow-card-md hover:shadow-card-lg transition-shadow group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileSignature className="w-4 h-4 text-primary" />
                </div>
                <p className="text-p14 text-ink-400 font-medium">계약</p>
              </div>
              <p className="text-p15 font-semibold text-ink-700 group-hover:text-primary transition-colors">
                계약 현황
              </p>
              <p className="mt-1 text-p12 text-primary font-medium">바로가기 →</p>
            </Link>
          )}
          {user?.userType === 'SPECIALTY_CONTRACTOR' && hasCompany && !isPending && (
            <Link
              href="/dashboard/portfolio"
              className="bg-white rounded-2xl border border-ink-200 p-6 hover:border-primary hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-p15 font-semibold text-ink-700">내 포트폴리오</h3>
              </div>
              <p className="text-p13 text-ink-400">시공 실적을 등록하고 관리하세요.</p>
            </Link>
          )}
          <Link
            href="/change-password"
            className="bg-white rounded-2xl p-6 shadow-card-md hover:shadow-card-lg transition-shadow group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-ink-100 flex items-center justify-center">
                <Settings className="w-4 h-4 text-ink-500" />
              </div>
              <p className="text-p14 text-ink-400 font-medium">계정 설정</p>
            </div>
            <p className="text-p15 font-semibold text-ink-700 group-hover:text-primary transition-colors">
              비밀번호 변경
            </p>
            <p className="mt-1 text-p12 text-primary font-medium">설정 →</p>
          </Link>
          <Link
            href="/dashboard/settings/notifications"
            className="bg-white rounded-2xl p-6 shadow-card-md hover:shadow-card-lg transition-shadow group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-ink-100 flex items-center justify-center">
                <Bell className="w-4 h-4 text-ink-500" />
              </div>
              <p className="text-p14 text-ink-400 font-medium">알림 설정</p>
            </div>
            <p className="text-p15 font-semibold text-ink-700 group-hover:text-primary transition-colors">
              이메일 · 알림톡
            </p>
            <p className="mt-1 text-p12 text-primary font-medium">수신 설정 →</p>
          </Link>
          {adminUser && (
            <Link
              href="/admin"
              className="bg-white rounded-2xl p-6 shadow-card-md hover:shadow-card-lg transition-shadow group border border-red-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-red-500" />
                </div>
                <p className="text-p14 text-ink-400 font-medium">운영 관리</p>
              </div>
              <p className="text-p15 font-semibold text-ink-700 group-hover:text-red-500 transition-colors">
                관리자 패널
              </p>
              <p className="mt-1 text-p12 text-red-400 font-medium">회원 승인 →</p>
            </Link>
          )}
        </div>
      </main>
      <AppFooter />
    </div>
  )
}
