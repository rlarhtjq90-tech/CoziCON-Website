import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import LogoutButton from '@/app/dashboard/LogoutButton'
import { ArrowLeft, FileSignature } from 'lucide-react'

function formatPrice(price: bigint | null) {
  if (!price) return '—'
  const n = Number(price)
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억원`
  if (n >= 10_000) return `${(n / 10_000).toFixed(0)}만원`
  return `${n.toLocaleString()}원`
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING:    { label: '서명 대기', color: 'bg-yellow-50 text-yellow-600' },
  GC_SIGNED:  { label: '발주사 서명', color: 'bg-blue-50 text-blue-600' },
  ACTIVE:     { label: '계약 성립', color: 'bg-green-50 text-green-600' },
  COMPLETED:  { label: '완료', color: 'bg-ink-100 text-ink-500' },
  TERMINATED: { label: '해지', color: 'bg-red-50 text-red-500' },
}

export default async function ContractsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true, userType: true },
  })
  if (!user?.companyId) redirect('/dashboard')

  const contracts = await prisma.contract.findMany({
    where: {
      OR: [
        { gcCompanyId: user.companyId },
        { scCompanyId: user.companyId },
      ],
    },
    include: {
      notice: { select: { id: true, title: true } },
      gcCompany: { select: { name: true } },
      scCompany: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const isGC = user.userType === 'GENERAL_CONTRACTOR'

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

      <main className="container-content py-10">
        <div className="mb-6">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-p14 text-ink-400 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            대시보드로
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-t4 font-bold text-ink-700">내 계약 현황</h1>
          <p className="mt-1 text-p14 text-ink-400">총 {contracts.length}건</p>
        </div>

        {contracts.length === 0 ? (
          <div className="bg-white rounded-xl border border-ink-200 p-16 text-center">
            <FileSignature className="w-10 h-10 text-ink-300 mx-auto mb-3" />
            <p className="text-p15 text-ink-400">아직 계약이 없습니다.</p>
            {isGC ? (
              <Link href="/notices" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg text-p14 font-medium hover:bg-primary/90 transition-colors">
                공고 관리
              </Link>
            ) : (
              <Link href="/notices" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg text-p14 font-medium hover:bg-primary/90 transition-colors">
                입찰 공고 보기
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {contracts.map((c) => {
              const st = STATUS_LABEL[c.status] ?? STATUS_LABEL.PENDING
              const myRole = c.gcCompanyId === user.companyId ? '발주사' : '수주사'
              const counterpart = c.gcCompanyId === user.companyId ? c.scCompany.name : c.gcCompany.name
              return (
                <Link
                  key={c.id}
                  href={`/contracts/${c.id}`}
                  className="bg-white rounded-xl border border-ink-200 p-6 hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-p16 font-semibold text-ink-700 truncate mb-1">{c.notice.title}</h2>
                      <div className="flex flex-wrap gap-3 text-p13 text-ink-500 mt-2">
                        <span>내 역할: <span className="font-medium text-ink-700">{myRole}</span></span>
                        <span>상대방: <span className="font-medium text-ink-700">{counterpart}</span></span>
                        <span>계약금액: <span className="font-medium text-ink-700">{formatPrice(c.contractAmount)}</span></span>
                      </div>
                      <p className="mt-2 text-p12 text-ink-400">
                        계약 생성: {new Date(c.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <span className={`shrink-0 text-p13 font-medium px-2.5 py-0.5 rounded-full ${st.color}`}>
                      {st.label}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
