'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2,
  Bell,
  BellRing,
  FolderOpen,
  Lock,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  visible: boolean
}

interface Props {
  userType: string | null
  hasCompany: boolean
}

export default function SettingsSidebar({ userType, hasCompany }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isSC = userType === 'SPECIALTY_CONTRACTOR'

  const navItems: NavItem[] = [
    {
      href: '/dashboard/settings/profile',
      label: '회사 정보',
      icon: <Building2 className="w-4 h-4" />,
      visible: hasCompany,
    },
    {
      href: '/dashboard/settings/notifications',
      label: '알림 수신',
      icon: <Bell className="w-4 h-4" />,
      visible: true,
    },
    {
      href: '/dashboard/settings/subscriptions',
      label: '키워드 구독',
      icon: <BellRing className="w-4 h-4" />,
      visible: isSC,
    },
    {
      href: '/dashboard/settings/portfolio',
      label: '포트폴리오',
      icon: <FolderOpen className="w-4 h-4" />,
      visible: isSC && hasCompany,
    },
    {
      href: '/dashboard/settings/account',
      label: '계정 보안',
      icon: <Lock className="w-4 h-4" />,
      visible: true,
    },
  ].filter((item) => item.visible)

  const active = navItems.find((item) => pathname.startsWith(item.href))

  return (
    <>
      {/* 모바일: 드롭다운 */}
      <div className="md:hidden mb-4">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-ink-200 rounded-xl text-p14 font-semibold text-ink-700"
        >
          <span className="flex items-center gap-2">
            {active?.icon}
            {active?.label ?? '설정'}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${mobileOpen ? 'rotate-180' : ''}`} />
        </button>
        {mobileOpen && (
          <div className="mt-1 bg-white border border-ink-200 rounded-xl overflow-hidden shadow-card-md">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-p14 font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-ink-600 hover:bg-brand-slate-50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* 데스크탑: 사이드바 */}
      <aside className="hidden md:block w-52 shrink-0">
        <div className="bg-white rounded-2xl shadow-card-md overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <p className="text-p12 font-semibold text-ink-400 uppercase tracking-wider px-2">설정</p>
          </div>
          <nav className="p-2 space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-p14 font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-ink-600 hover:bg-brand-slate-50 hover:text-ink-800'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}
