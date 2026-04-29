'use client'

import { signOut } from 'next-auth/react'

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="text-p14 font-medium text-ink-600 hover:text-primary transition-colors"
    >
      로그아웃
    </button>
  )
}
