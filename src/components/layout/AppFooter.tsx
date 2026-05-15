import Link from 'next/link'

export default function AppFooter() {
  return (
    <footer className="border-t border-ink-200 bg-white mt-auto">
      <div className="container-content py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-p13 text-ink-400">© 2025 CoziCON. All rights reserved.</p>
        <nav className="flex items-center gap-4 text-p13 text-ink-400">
          <Link href="/announcements" className="hover:text-primary transition-colors">공지사항</Link>
          <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">1:1 문의</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">이용약관</Link>
          <Link href="/privacy" className="hover:text-primary transition-colors font-medium">개인정보처리방침</Link>
          <Link href="/legal" className="hover:text-primary transition-colors">통신판매업 정보</Link>
        </nav>
      </div>
    </footer>
  )
}
