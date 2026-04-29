import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-brand-slate-100">
      <header className="bg-white border-b border-ink-200 shadow-sm">
        <div className="container-content flex items-center justify-between h-16">
          <a href="/" className="text-t6 font-bold text-primary tracking-tight">
            CoziCON
          </a>
          <div className="flex items-center gap-4">
            <span className="text-p14 text-ink-500">{session.user?.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container-content py-12">
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
