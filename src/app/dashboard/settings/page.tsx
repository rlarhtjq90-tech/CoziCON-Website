import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import PasswordChangeForm from './PasswordChangeForm'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const hasPassword = !session.user.isAdmin // OAuth-only users have no password
  // Note: we rely on the API to reject OAuth accounts; just show the form regardless

  return (
    <div className="min-h-screen bg-brand-slate-100">
      <header className="bg-white border-b border-ink-200 shadow-sm">
        <div className="container-content flex items-center h-16">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-p14 text-ink-500 hover:text-ink-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            대시보드
          </Link>
        </div>
      </header>

      <main className="container-content py-12">
        <h1 className="text-t4 font-bold text-ink-700 mb-8">계정 설정</h1>

        <div className="bg-white rounded-2xl p-8 shadow-card-md">
          <h2 className="text-t6 font-semibold text-ink-700 mb-1">비밀번호 변경</h2>
          <p className="text-p14 text-ink-400 mb-6">현재 비밀번호를 확인한 후 새 비밀번호로 변경합니다.</p>
          <PasswordChangeForm />
        </div>
      </main>
    </div>
  )
}
