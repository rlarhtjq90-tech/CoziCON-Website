'use client'

import { useEffect, useState } from 'react'

const NAV_LINKS = [
  { label: '서비스소개', href: '#features' },
  { label: '입찰프로세스', href: '#process' },
  { label: '이용대상', href: '#audience' },
  { label: '문의하기', href: '#contact' },
]

export default function GNB() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300 ease-in-out
        ${scrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-card-md border-b border-ink-200'
          : 'bg-transparent border-b border-transparent'
        }
      `}
    >
      <nav className="container-content flex items-center justify-between h-12 tablet:h-16 laptop:h-[4.5rem]">

        {/* 로고 — 항상 표시 */}
        <a href="/" className="text-t6 font-bold text-primary tracking-tight">
          CoziCON
        </a>

        {/* 네비게이션 — 스크롤 시 등장 */}
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

        {/* 로그인 — 스크롤 시 등장 */}
        <div
          className={`
            hidden laptop:flex items-center
            transition-all duration-300 ease-in-out
            ${scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
          `}
        >
          <a
            href="#contact"
            className="text-p14 font-medium text-ink-600 hover:text-primary transition-colors"
          >
            로그인
          </a>
        </div>

      </nav>
    </header>
  )
}
