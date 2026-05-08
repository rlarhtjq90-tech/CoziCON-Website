import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import LogoutButton from '@/app/dashboard/LogoutButton'
import { ArrowLeft, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react'

const STATUS_LABEL: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING_OWNER: { label: '발주사 서명 대기', color: 'text-yellow-700 bg-yellow-50', icon: <Clock className="w-4 h-4" /> },
  PENDING_CONTRACTOR: { label: '건설사 서명 대기', color: 'text-blue-700 bg-blue-50', icon: <Clock className="w-4 h-4" /> },
  ACTIVE: { label: '계약 체결 완료', color: 'text-green-700 bg-green-50', icon: <CheckCircle className="w-4 h-4" /> },
  COMPLETED: { label: '공사 완료', color: 'text-ink-500 bg-ink-100', icon: <CheckCircle className="w-4 h-4" /> },
  CANCELLED: { label: '취소', color: 'text-red-700 bg-red-50', icon: <AlertCircle className="w-4 h-4" /> },
}

function formatAmount(amount: bigint) {
  return Number(amount).toLocaleString('ko-KR') + '원'
}

export default async function ContractsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const companyId = session.user.companyId
  if (!companyId) redirect('/dashboard')

  const contracts = await prisma.contract.findMany({
    where: {
      OR: [{ ownerCompanyId: companyId }, { contractorCompanyId: companyId }],
    },
    include: {
      notice: { select: { id: true, title: true, workTypes: true, regions: true } },
      ownerCompany: { select: { id: true, name: true } },
      contractorCompany: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-surface-subtle">
      <header className="bg-white border-b border-ink-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-ink-400 hover:text-ink-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-ink-900">내 계약</h1>
        </div>
        <LogoutButton />
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {contracts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-ink-200 p-16 text-center">
            <FileText className="w-12 h-12 text-ink-300 mx-auto mb-4" />
            <p className="text-ink-500 text-lg font-medium">아직 계약이 없습니다.</p>
            <p className="text-ink-400 text-sm mt-1">낙찰 처리 후 계약이 자동으로 생성됩니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contracts.map((c) => {
              const isOwner = c.ownerCompanyId === companyId
              const statusInfo = STATUS_LABEL[c.status] ?? { label: c.status, color: 'text-ink-500 bg-ink-100', icon: null }
              return (
                <Link
                  key={c.id}
                  href={`/contracts/${c.id}`}
                  className="block bg-white rounded-2xl border border-ink-200 p-6 hover:border-brand-blue hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-ink-400 mb-1">{isOwner ? '발주사' : '건설사'} 입장</p>
                      <h2 className="text-base font-semibold text-ink-900 truncate">{c.notice.title}</h2>
                      <div className="flex items-center gap-3 mt-2 text-sm text-ink-500">
                        <span>{c.ownerCompany.name} → {c.contractorCompany.name}</span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-ink-700">
                        계약금액: {formatAmount(c.contractAmount)}
                      </p>
                    </div>
                    <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap ${statusInfo.color}`}>
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                  </div>
                  {(c.startDate || c.endDate) && (
                    <div className="mt-3 pt-3 border-t border-ink-100 text-xs text-ink-400">
                      {c.startDate && <span>착공: {new Date(c.startDate).toLocaleDateString('ko-KR')}</span>}
                      {c.startDate && c.endDate && <span className="mx-2">~</span>}
                      {c.endDate && <span>준공: {new Date(c.endDate).toLocaleDateString('ko-KR')}</span>}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
