import Link from 'next/link'
import { FileSearch } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-slate-100 flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-ink-200 p-12 max-w-md w-full text-center shadow-card-md">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <FileSearch className="w-8 h-8 text-primary" />
        </div>
        <p className="text-p13 font-semibold text-primary mb-2">404</p>
        <h1 className="text-t5 font-bold text-ink-700 mb-3">페이지를 찾을 수 없습니다</h1>
        <p className="text-p14 text-ink-500 mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="px-6 py-2.5 bg-primary text-white rounded-lg text-p14 font-medium hover:bg-primary-600 transition-colors"
          >
            대시보드로
          </Link>
          <Link
            href="/"
            className="px-6 py-2.5 border border-ink-200 text-ink-600 rounded-lg text-p14 font-medium hover:bg-brand-slate-100 transition-colors"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  )
}
