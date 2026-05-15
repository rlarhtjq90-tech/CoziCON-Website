import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import PasswordChangeForm from './PasswordChangeForm'

export default async function ChangePasswordPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-brand-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="text-t6 font-bold text-primary tracking-tight">
            CastBid
          </Link>
          <p className="mt-2 text-p14 text-ink-500">비밀번호를 변경합니다</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card-md p-8">
          <h1 className="text-t6 font-bold text-ink-700 mb-6">비밀번호 변경</h1>
          <PasswordChangeForm />
          <p className="mt-6 text-center text-p14 text-ink-500">
            <Link href="/dashboard" className="text-primary font-medium hover:underline">
              대시보드로 돌아가기
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
