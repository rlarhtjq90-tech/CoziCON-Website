import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import LogoutButton from '@/app/dashboard/LogoutButton'
import ContractActions from './ContractActions'
import { ArrowLeft, Building2, CalendarDays, FileText, CheckCircle2, Star } from 'lucide-react'

function formatPrice(price: bigint | null) {
  if (!price) return '—'
  const n = Number(price)
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억원`
  if (n >= 10_000) return `${(n / 10_000).toFixed(0)}만원`
  return `${n.toLocaleString()}원`
}

function formatDate(d: Date | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

const STATUS_LABEL: Record<string, { label: string; color: string; desc: string }> = {
  PENDING:    { label: '서명 대기', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', desc: '양측이 서명해야 계약이 성립됩니다.' },
  GC_SIGNED:  { label: '발주사 서명 완료', color: 'bg-blue-50 text-blue-700 border-blue-200', desc: '수주사(전문건설사) 서명을 기다리는 중입니다.' },
  ACTIVE:     { label: '계약 성립', color: 'bg-green-50 text-green-700 border-green-200', desc: '양측이 서명을 완료했습니다. 계약이 유효합니다.' },
  COMPLETED:  { label: '공사 완료', color: 'bg-ink-100 text-ink-600 border-ink-200', desc: '공사가 완료된 계약입니다.' },
  TERMINATED: { label: '계약 해지', color: 'bg-red-50 text-red-600 border-red-200', desc: '계약이 해지되었습니다.' },
}

type Props = { params: Promise<{ id: string }> }

export default async function ContractDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true, userType: true },
  })
  if (!user?.companyId) redirect('/dashboard')

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      notice: { select: { id: true, title: true, description: true, workTypes: true, regions: true } },
      gcCompany: { select: { name: true, bizNo: true } },
      scCompany: { select: { name: true, bizNo: true } },
      submission: { select: { description: true } },
      signs: { select: { role: true, signedAt: true, user: { select: { name: true, email: true } } } },
      review: true,
    },
  })

  if (!contract) notFound()

  const isGC = contract.gcCompanyId === user.companyId
  const isSC = contract.scCompanyId === user.companyId
  if (!isGC && !isSC) redirect('/contracts')

  const myRole = isGC ? 'GC' : 'SC'
  const alreadySigned = contract.signs.some((s) => s.role === myRole)

  const st = STATUS_LABEL[contract.status] ?? STATUS_LABEL.PENDING
  const gcSign = contract.signs.find((s) => s.role === 'GC')
  const scSign = contract.signs.find((s) => s.role === 'SC')

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

      <main className="container-content py-10 max-w-3xl">
        <div className="mb-6">
          <Link href="/contracts" className="flex items-center gap-1.5 text-p14 text-ink-400 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            계약 목록으로
          </Link>
        </div>

        {/* 상태 배너 */}
        <div className={`mb-6 flex items-start gap-3 px-5 py-4 rounded-xl border ${st.color}`}>
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="text-p15 font-semibold">{st.label}</p>
            <p className="text-p13 mt-0.5">{st.desc}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-ink-200 divide-y divide-ink-100">
          {/* 공고 정보 */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-primary" />
              <h2 className="text-p15 font-semibold text-ink-700">관련 공고</h2>
            </div>
            <Link href={`/notices/${contract.notice.id}`} className="text-p16 font-bold text-primary hover:underline">
              {contract.notice.title}
            </Link>
            <div className="mt-2 flex flex-wrap gap-2">
              {contract.notice.workTypes.map((w) => (
                <span key={w} className="text-p12 px-2 py-0.5 bg-primary/10 text-primary rounded-full">{w}</span>
              ))}
              {contract.notice.regions.map((r) => (
                <span key={r} className="text-p12 px-2 py-0.5 bg-ink-100 text-ink-500 rounded-full">{r}</span>
              ))}
            </div>
          </div>

          {/* 계약 당사자 */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-primary" />
              <h2 className="text-p15 font-semibold text-ink-700">계약 당사자</h2>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-p12 text-ink-400 mb-1">발주사 (종합건설사)</p>
                <p className="text-p15 font-semibold text-ink-700">{contract.gcCompany.name}</p>
                <p className="text-p12 text-ink-400">{contract.gcCompany.bizNo}</p>
                {isGC && <span className="text-p11 text-primary font-medium">← 내 회사</span>}
              </div>
              <div>
                <p className="text-p12 text-ink-400 mb-1">수주사 (전문건설사)</p>
                <p className="text-p15 font-semibold text-ink-700">{contract.scCompany.name}</p>
                <p className="text-p12 text-ink-400">{contract.scCompany.bizNo}</p>
                {isSC && <span className="text-p11 text-primary font-medium">← 내 회사</span>}
              </div>
            </div>
          </div>

          {/* 계약 내용 */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="w-4 h-4 text-primary" />
              <h2 className="text-p15 font-semibold text-ink-700">계약 내용</h2>
            </div>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-p14">
              <div>
                <dt className="text-ink-400 mb-0.5">계약금액</dt>
                <dd className="font-semibold text-ink-700">{formatPrice(contract.contractAmount)}</dd>
              </div>
              <div>
                <dt className="text-ink-400 mb-0.5">계약 생성일</dt>
                <dd className="font-semibold text-ink-700">{formatDate(contract.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-ink-400 mb-0.5">공사 시작</dt>
                <dd className="font-semibold text-ink-700">{formatDate(contract.startDate)}</dd>
              </div>
              <div>
                <dt className="text-ink-400 mb-0.5">공사 완료</dt>
                <dd className="font-semibold text-ink-700">{formatDate(contract.endDate)}</dd>
              </div>
            </dl>
            {contract.submission.description && (
              <div className="mt-4 p-4 bg-ink-50 rounded-lg">
                <p className="text-p12 text-ink-400 mb-1">입찰 제안서</p>
                <p className="text-p14 text-ink-600">{contract.submission.description}</p>
              </div>
            )}
          </div>

          {/* 서명 현황 */}
          <div className="p-6">
            <h2 className="text-p15 font-semibold text-ink-700 mb-4">서명 현황</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg border ${gcSign ? 'border-green-200 bg-green-50' : 'border-ink-200 bg-ink-50'}`}>
                <p className="text-p12 text-ink-500 mb-1">발주사</p>
                <p className="text-p14 font-semibold text-ink-700">{contract.gcCompany.name}</p>
                {gcSign ? (
                  <p className="text-p12 text-green-600 mt-1">
                    서명 완료 · {new Date(gcSign.signedAt).toLocaleDateString('ko-KR')}
                  </p>
                ) : (
                  <p className="text-p12 text-ink-400 mt-1">서명 대기 중</p>
                )}
              </div>
              <div className={`p-4 rounded-lg border ${scSign ? 'border-green-200 bg-green-50' : 'border-ink-200 bg-ink-50'}`}>
                <p className="text-p12 text-ink-500 mb-1">수주사</p>
                <p className="text-p14 font-semibold text-ink-700">{contract.scCompany.name}</p>
                {scSign ? (
                  <p className="text-p12 text-green-600 mt-1">
                    서명 완료 · {new Date(scSign.signedAt).toLocaleDateString('ko-KR')}
                  </p>
                ) : (
                  <p className="text-p12 text-ink-400 mt-1">서명 대기 중</p>
                )}
              </div>
            </div>
          </div>

          {/* 액션 */}
          <div className="p-6">
            <ContractActions
              contractId={contract.id}
              status={contract.status}
              canSign={isGC || isSC}
              alreadySigned={alreadySigned}
              isGC={isGC}
            />
          </div>
        </div>

        {/* 리뷰 섹션: GC이고 계약 ACTIVE 이상이고 리뷰 미작성인 경우 */}
        {isGC && ['ACTIVE', 'COMPLETED', 'TERMINATED'].includes(contract.status) && !contract.review && (
          <div className="mt-6 bg-white rounded-2xl border border-ink-200 p-6">
            <h3 className="text-p16 font-semibold text-ink-700 mb-1">수주사 리뷰</h3>
            <p className="text-p13 text-ink-400 mb-4">
              이 계약의 수주사({contract.scCompany.name})에 대한 평가를 남겨보세요.
            </p>
            <a
              href={`/company/${contract.scCompanyId}?tab=reviews`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-p14 font-semibold rounded-lg hover:bg-primary-600 transition-colors"
            >
              리뷰 남기기
            </a>
          </div>
        )}
        {isGC && contract.review && (
          <div className="mt-6 bg-white rounded-2xl border border-ink-200 p-6">
            <h3 className="text-p16 font-semibold text-ink-700 mb-3">내가 남긴 리뷰</h3>
            <div className="flex items-center gap-1 mb-2">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-5 h-5 ${i <= contract.review!.rating ? 'fill-amber-400 text-amber-400' : 'text-ink-200'}`} />
              ))}
            </div>
            {contract.review.comment && (
              <p className="text-p14 text-ink-600">{contract.review.comment}</p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
