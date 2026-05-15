'use client'

import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'

const NAV_LINKS = [
  { label: '서비스소개', href: '#features' },
  { label: '입찰프로세스', href: '#process' },
  { label: '이용대상', href: '#audience' },
  { label: '문의하기', href: '#contact' },
]

export default function GNB() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: session, status } = useSession()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const isAuthenticated = status === 'authenticated'
  const companyName = session?.user?.companyName

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300 ease-in-out
          ${scrolled || mobileOpen
            ? 'bg-white/95 backdrop-blur-sm shadow-card-md border-b border-ink-200'
            : 'bg-transparent border-b border-transparent'
          }
        `}
      >
        <nav className="container-content flex items-center justify-between h-12 tablet:h-16 laptop:h-[4.5rem]">

          {/* 로고 */}
          <a href="/" className="text-t6 font-bold text-primary tracking-tight">
            CastBid
          </a>

          {/* 데스크탑 네비게이션 — 스크롤 시 등장 */}
          <ul
            className={`
              hidden laptop:flex items-center gap-8
              transition-all duration-300 ease-in-out
              ${scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
            `}
          >
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-p16 font-medium text-ink-600 hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* 데스크탑 우측 영역 */}
          <div className="hidden laptop:flex items-center gap-3">
            {status === 'loading' ? (
              <div className="h-8 w-40 rounded-full bg-ink-100 animate-pulse" />
            ) : isAuthenticated ? (
              <>
                {companyName && (
                  <span className="text-p14 font-semibold text-ink-700">{companyName}</span>
                )}
                <a
                  href="/dashboard"
                  className="text-p14 font-medium text-ink-600 hover:text-primary transition-colors"
                >
                  대시보드
                </a>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="inline-flex items-center rounded-full border border-ink-300 text-ink-600 px-5 py-2 text-p14 font-medium hover:border-primary hover:text-primary transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="text-p14 font-medium text-ink-600 hover:text-primary transition-colors">
                  로그인
                </a>
                <a
                  href="/signup"
                  className="inline-flex items-center rounded-full bg-primary text-white px-5 py-2 text-p14 font-semibold shadow-btn-glow hover:bg-primary-600 transition-colors"
                >
                  무료 시작하기
                </a>
              </>
            )}
          </div>

          {/* 모바일 햄버거 버튼 */}
          <button
            className="laptop:hidden p-2 rounded-lg text-ink-600 hover:text-primary transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="메뉴 열기"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </nav>
      </header>

      {/* 모바일 드로어 */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 laptop:hidden">
          {/* 배경 딤 */}
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />

          {/* 메뉴 패널 */}
          <div className="absolute top-12 tablet:top-16 left-0 right-0 bg-white border-b border-ink-200 shadow-card-md px-6 py-6 flex flex-col gap-6">
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 text-p16 font-medium text-ink-700 hover:text-primary transition-colors border-b border-ink-100 last:border-0"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  {companyName && (
                    <p className="text-p15 font-semibold text-ink-700 text-center">{companyName}</p>
                  )}
                  <a
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex items-center justify-center rounded-full bg-primary text-white px-6 py-3 text-p15 font-semibold shadow-btn-glow hover:bg-primary-600 transition-colors"
                  >
                    대시보드
                  </a>
                  <button
                    onClick={() => { setMobileOpen(false); signOut({ callbackUrl: '/' }) }}
                    className="inline-flex items-center justify-center rounded-full border border-ink-300 text-ink-600 px-6 py-3 text-p15 font-medium hover:border-primary hover:text-primary transition-colors"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="/signup"
                    className="inline-flex items-center justify-center rounded-full bg-primary text-white px-6 py-3 text-p15 font-semibold shadow-btn-glow hover:bg-primary-600 transition-colors"
                  >
                    무료 시작하기
                  </a>
                  <a
                    href="/login"
                    className="inline-flex items-center justify-center rounded-full border border-ink-300 text-ink-600 px-6 py-3 text-p15 font-medium hover:border-primary hover:text-primary transition-colors"
                  >
                    로그인
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
