import type { Metadata } from 'next'
import Link from 'next/link'
import FAQ from '@/components/sections/FAQ'

export const metadata: Metadata = {
  title: '자주 묻는 질문 | CastBid',
  description: 'CastBid 건설 입찰 플랫폼 이용에 관한 자주 묻는 질문(FAQ)을 확인하세요.',
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-ink-200">
        <div className="container-content h-16 flex items-center justify-between">
          <Link href="/" className="text-t6 font-bold text-primary tracking-tight">CastBid</Link>
          <div className="flex items-center gap-4 text-p14">
            <Link href="/login" className="text-ink-500 hover:text-primary transition-colors">로그인</Link>
            <Link href="/signup" className="px-4 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary-600 transition-colors">
              시작하기
            </Link>
          </div>
        </div>
      </header>

      <FAQ />

      <footer className="border-t border-ink-200 bg-white">
        <div className="container-content py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-p13 text-ink-400">
          <p>© 2025 CastBid. All rights reserved.</p>
          <nav className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-primary transition-colors">이용약관</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">개인정보처리방침</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">문의하기</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
