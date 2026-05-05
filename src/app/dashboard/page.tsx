import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import LogoutButton from './LogoutButton'
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react'

function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim())
  return adminEmails.includes(email)
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (isAdmin(session.user?.email)) redirect('/admin')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { company: true },
  })

  const isPending = user?.status === 'PENDING'
  const hasCompany = !!user?.company
  const isBusinessVerified = user?.company?.businessVerified ?? false

  return (
    <div className="min-h-screen bg-brand-slate-100">
      <header className="bg-white border-b border-ink-200 shadow-sm">
        <div className="container-content flex items-center justify-between h-16">
          <a href="/" className="text-t6 font-bold text-primary tracking-tight">CoziCON</a>
          <div className="flex items-center gap-4">
            <span className="text-p14 text-ink-500">{session.user?.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container-content py-12">
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

        <div className="grid gap-4 tablet:grid-cols-3">
          <div className="bg-white rounded-2xl p-6 shadow-card-md">
            <p className="text-p14 text-ink-400 font-medium">입찰 현황</p>
            <p className="mt-2 text-t5 font-bold text-ink-700">준비 중</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-card-md">
            <p className="text-p14 text-ink-400 font-medium">관심 공고</p>
            <p className="mt-2 text-t5 font-bold text-ink-700">준비 중</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-card-md">
            <p className="text-p14 text-ink-400 font-medium">면허 정보</p>
            <p className="mt-2 text-t5 font-bold text-ink-700">준비 중</p>
          </div>
        </div>
      </main>
    </div>
  )
}
