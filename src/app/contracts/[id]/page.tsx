import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import LogoutButton from '@/app/dashboard/LogoutButton'
import ContractActions from './ContractActions'
import { ArrowLeft, Building2, CheckCircle, Clock } from 'lucide-react'

type Props = { params: Promise<{ id: string }> }

const STATUS_STEPS = [
  { key: 'PENDING_OWNER', label: '계약서 작성' },
  { key: 'PENDING_CONTRACTOR', label: '발주사 서명 완료' },
  { key: 'ACTIVE', label: '건설사 서명 완료' },
  { key: 'COMPLETED', label: '공사 완료' },
]

function formatAmount(amount: bigint) {
  return Number(amount).toLocaleString('ko-KR') + '원'
}

function getStepIndex(status: string) {
  const map: Record<string, number> = {
    PENDING_OWNER: 0,
    PENDING_CONTRACTOR: 1,
    ACTIVE: 2,
    COMPLETED: 3,
    CANCELLED: -1,
  }
  return map[status] ?? 0
}

export default async function ContractDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { id } = await params
  const companyId = session.user.companyId

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      notice: { select: { id: true, title: true, workTypes: true, regions: true, description: true } },
      submission: { select: { proposedPrice: true, description: true } },
      ownerCompany: { select: { id: true, name: true, bizNo: true, ceoName: true, address: true, phone: true } },
      contractorCompany: { select: { id: true, name: true, bizNo: true, ceoName: true, address: true, phone: true } },
    },
  })

  if (!contract) notFound()

  const isOwner = contract.ownerCompanyId === companyId
  const isContractor = contract.contractorCompanyId === companyId
  if (!isOwner && !isContractor) redirect('/dashboard')

  const stepIndex = getStepIndex(contract.status)
  const STATUS_LABELS: Record<string, string> = {
    PENDING_OWNER: '발주사 서명 대기',
    PENDING_CONTRACTOR: '건설사 서명 대기',
    ACTIVE: '계약 체결 완료',
    COMPLETED: '공사 완료',
    CANCELLED: '취소',
  }

  const canSign =
    (isOwner && contract.status === 'PENDING_OWNER' && !contract.ownerSignedAt) ||
    (isContractor && contract.status === 'PENDING_CONTRACTOR' && !contract.contractorSignedAt)
  const alreadySigned = isOwner ? !!contract.ownerSignedAt : !!contract.contractorSignedAt

  return (
    <div className="min-h-screen bg-surface-subtle">
      <header className="bg-white border-b border-ink-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/contracts" className="text-ink-400 hover:text-ink-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-ink-900">계약 상세</h1>
            <p className="text-sm text-ink-400 truncate max-w-xs">{contract.notice.title}</p>
          </div>
        </div>
        <LogoutButton />
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* 진행 단계 */}
        {contract.status !== 'CANCELLED' && (
          <div className="bg-white rounded-2xl border border-ink-200 p-6">
            <h2 className="text-sm font-semibold text-ink-500 mb-4">계약 진행 현황</h2>
            <div className="flex items-center gap-0">
              {STATUS_STEPS.map((step, i) => (
                <div key={step.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      i < stepIndex ? 'bg-green-500 text-white' :
                      i === stepIndex ? 'bg-brand-blue text-white' :
                      'bg-ink-100 text-ink-400'
                    }`}>
                      {i < stepIndex ? <CheckCircle className="w-5 h-5" /> : i === stepIndex ? <Clock className="w-4 h-4" /> : i + 1}
                    </div>
                    <p className={`text-xs mt-1 text-center whitespace-nowrap ${i <= stepIndex ? 'text-ink-700 font-medium' : 'text-ink-400'}`}>
                      {step.label}
                    </p>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 -mt-5 ${i < stepIndex ? 'bg-green-400' : 'bg-ink-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 계약 기본 정보 */}
        <div className="bg-white rounded-2xl border border-ink-200 p-6 space-y-4">
          <h2 className="text-base font-bold text-ink-900">계약 정보</h2>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <dt className="text-ink-400">공고명</dt>
              <dd className="font-medium text-ink-800 mt-0.5">{contract.notice.title}</dd>
            </div>
            <div>
              <dt className="text-ink-400">계약 금액</dt>
              <dd className="font-bold text-ink-900 mt-0.5 text-base">{formatAmount(contract.contractAmount)}</dd>
            </div>
            {contract.startDate && (
              <div>
                <dt className="text-ink-400">착공일</dt>
                <dd className="font-medium text-ink-800 mt-0.5">{new Date(contract.startDate).toLocaleDateString('ko-KR')}</dd>
              </div>
            )}
            {contract.endDate && (
              <div>
                <dt className="text-ink-400">준공 예정일</dt>
                <dd className="font-medium text-ink-800 mt-0.5">{new Date(contract.endDate).toLocaleDateString('ko-KR')}</dd>
              </div>
            )}
            <div>
              <dt className="text-ink-400">공사 유형</dt>
              <dd className="font-medium text-ink-800 mt-0.5">{contract.notice.workTypes.join(', ')}</dd>
            </div>
            <div>
              <dt className="text-ink-400">지역</dt>
              <dd className="font-medium text-ink-800 mt-0.5">{contract.notice.regions.join(', ')}</dd>
            </div>
          </dl>
          {contract.terms && (
            <div className="pt-3 border-t border-ink-100">
              <p className="text-sm text-ink-400 mb-1">특약 사항</p>
              <p className="text-sm text-ink-700 whitespace-pre-wrap">{contract.terms}</p>
            </div>
          )}
        </div>

        {/* 계약 당사자 */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: '발주사', company: contract.ownerCompany, signedAt: contract.ownerSignedAt },
            { label: '건설사 (낙찰)', company: contract.contractorCompany, signedAt: contract.contractorSignedAt },
          ].map(({ label, company, signedAt }) => (
            <div key={company.id} className="bg-white rounded-2xl border border-ink-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-ink-400 uppercase tracking-wide">{label}</span>
                {signedAt ? (
                  <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" /> 서명완료
                  </span>
                ) : (
                  <span className="text-xs text-ink-400">서명 대기</span>
                )}
              </div>
              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 text-ink-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-ink-900">{company.name}</p>
                  {company.ceoName && <p className="text-ink-500 text-xs">대표: {company.ceoName}</p>}
                  {company.bizNo && <p className="text-ink-400 text-xs">사업자: {company.bizNo}</p>}
                  {company.phone && <p className="text-ink-400 text-xs">전화: {company.phone}</p>}
                </div>
              </div>
              {signedAt && (
                <p className="text-xs text-ink-400 mt-3 pt-3 border-t border-ink-100">
                  {new Date(signedAt).toLocaleString('ko-KR')} 서명
                </p>
              )}
            </div>
          ))}
        </div>

        {/* 서명 영역 */}
        <div className="bg-white rounded-2xl border border-ink-200 p-6">
          <h2 className="text-base font-bold text-ink-900 mb-4">
            {isOwner ? '발주사 서명' : '건설사 서명'}
          </h2>
          <ContractActions
            contractId={contract.id}
            canSign={canSign}
            alreadySigned={alreadySigned}
            statusLabel={STATUS_LABELS[contract.status] ?? contract.status}
          />
        </div>
      </main>
    </div>
  )
}
