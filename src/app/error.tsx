'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[global error]', error)
  }, [error])

  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen bg-brand-slate-100 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl border border-ink-200 p-10 max-w-md w-full text-center shadow-card-md">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <h1 className="text-t6 font-bold text-ink-700 mb-2">오류가 발생했습니다</h1>
            <p className="text-p14 text-ink-500 mb-6">예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={reset}
                className="px-6 py-2.5 bg-primary text-white rounded-lg text-p14 font-medium hover:bg-primary-600 transition-colors"
              >
                다시 시도
              </button>
              <a
                href="/"
                className="px-6 py-2.5 border border-ink-200 text-ink-600 rounded-lg text-p14 font-medium hover:bg-brand-slate-100 transition-colors"
              >
                홈으로
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
