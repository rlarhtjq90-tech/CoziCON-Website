import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import LogoutButton from '@/app/dashboard/LogoutButton'
import ProfileClient from './ProfileClient'
import { ArrowLeft } from 'lucide-react'

export default async function CompanyProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      company: {
        include: { licenses: { where: { isActive: true } } },
      },
    },
  })

  if (!user?.company) {
    const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim())
    redirect(adminEmails.includes(session.user?.email ?? '') ? '/admin' : '/dashboard')
  }

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
        <div className="mb-6 flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-p14 text-ink-400 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            대시보드로
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-t4 font-bold text-ink-700">회사 프로필</h1>
          <p className="mt-1 text-p15 text-ink-400">회사 정보를 관리하고 수정하세요.</p>
        </div>

        <ProfileClient company={user.company as Parameters<typeof ProfileClient>[0]['company']} />
      </main>
    </div>
  )
}
