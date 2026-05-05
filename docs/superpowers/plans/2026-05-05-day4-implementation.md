# Day 4 구현 계획 — 건설업등록증 인증 + 관리자 승인 큐

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 사업자 인증 완료 후 건설업등록증(KISCON) 인증 페이지와 관리자 승인 큐를 구축한다.

**Architecture:** `/verify-biz` 완료 후 `/verify-license`로 자동 리다이렉트. `/verify-license`는 서버 컴포넌트(데이터 조회) + 클라이언트 컴포넌트(인터랙션)로 분리. `/admin`은 서버 컴포넌트가 ADMIN_EMAILS env var로 접근을 제한한다.

**Tech Stack:** Next.js 14 App Router, NextAuth v4, Prisma 5, Neon PostgreSQL, @vercel/blob, KISCON API (기존 `/api/verify-license` 재사용)

---

## 파일 목록

| 파일 | 작업 |
|------|------|
| `src/middleware.ts` | 수정 — `/verify-license`, `/admin` matcher 추가 |
| `src/app/api/license/verify/route.ts` | 신규 — 면허 DB 저장 |
| `src/app/api/admin/approve/route.ts` | 신규 — 승인 처리 |
| `src/app/api/admin/reject/route.ts` | 신규 — 반려 처리 |
| `src/app/verify-license/page.tsx` | 신규 — 서버 컴포넌트 (데이터 조회) |
| `src/app/verify-license/VerifyLicenseClient.tsx` | 신규 — 클라이언트 컴포넌트 (UI) |
| `src/app/admin/page.tsx` | 신규 — 관리자 승인 큐 |
| `src/app/verify-biz/page.tsx` | 수정 — 완료 후 리다이렉트 경로 변경 |

---

## Task 1: middleware.ts — `/verify-license`, `/admin` 보호 추가

**Files:**
- Modify: `src/middleware.ts`

- [ ] **Step 1: middleware.ts 수정**

```ts
// src/middleware.ts
export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/dashboard/:path*', '/verify-license/:path*', '/admin/:path*'],
}
```

- [ ] **Step 2: 타입 체크**

```bash
npx tsc --noEmit
```
Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add src/middleware.ts
git commit -m "feat(middleware): /verify-license, /admin 인증 보호 추가"
```

---

## Task 2: `/api/license/verify` — 면허 DB 저장

**Files:**
- Create: `src/app/api/license/verify/route.ts`

- [ ] **Step 1: 파일 생성**

```ts
// src/app/api/license/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface LicenseItem {
  licenseType: string
  licenseNo: string
  issuedAt: string | null
}

interface VerifyLicenseRequest {
  selectedLicenses: LicenseItem[]
  licenseDocUrl?: string | null
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  if (!session.user.companyId) {
    return NextResponse.json({ error: '사업자 인증을 먼저 완료해주세요.' }, { status: 400 })
  }

  let body: VerifyLicenseRequest
  try { body = await req.json() }
  catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const { selectedLicenses, licenseDocUrl } = body

  try {
    // 기존 면허 비활성화 후 새로 저장
    await prisma.license.updateMany({
      where: { companyId: session.user.companyId },
      data: { isActive: false },
    })

    if (selectedLicenses.length > 0) {
      await prisma.license.createMany({
        data: selectedLicenses.map((l) => ({
          companyId: session.user.companyId!,
          licenseType: l.licenseType,
          licenseNo: l.licenseNo || null,
          issuedAt: l.issuedAt ? new Date(l.issuedAt) : null,
          isActive: true,
        })),
      })
    }

    // 건설업등록증 URL이 있으면 Company에 저장
    if (licenseDocUrl) {
      await prisma.company.update({
        where: { id: session.user.companyId },
        data: { bizDocUrl: licenseDocUrl },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[license/verify] error:', err)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
```

- [ ] **Step 2: 타입 체크**

```bash
npx tsc --noEmit
```
Expected: 에러 없음

- [ ] **Step 3: curl 테스트 (로컬 서버 실행 후)**

```bash
# 로그인 없이 호출 → 401
curl -s -X POST http://localhost:3000/api/license/verify \
  -H "Content-Type: application/json" \
  -d '{"selectedLicenses":[]}' | jq .
```
Expected: `{"error":"로그인이 필요합니다."}`

- [ ] **Step 4: 커밋**

```bash
git add src/app/api/license/verify/route.ts
git commit -m "feat(api): /api/license/verify — 면허 DB 저장 엔드포인트"
```

---

## Task 3: `/api/admin/approve` + `/api/admin/reject` — 승인/반려 처리

**Files:**
- Create: `src/app/api/admin/approve/route.ts`
- Create: `src/app/api/admin/reject/route.ts`

- [ ] **Step 1: approve route 생성**

```ts
// src/app/api/admin/approve/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim())
  return adminEmails.includes(email)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  let body: { userId: string }
  try { body = await req.json() }
  catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  try {
    await prisma.user.update({
      where: { id: body.userId },
      data: { status: 'ACTIVE' },
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/approve] error:', err)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
```

- [ ] **Step 2: reject route 생성**

```ts
// src/app/api/admin/reject/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim())
  return adminEmails.includes(email)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  let body: { userId: string }
  try { body = await req.json() }
  catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  try {
    await prisma.user.update({
      where: { id: body.userId },
      data: { status: 'REJECTED' },
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/reject] error:', err)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
```

- [ ] **Step 3: 타입 체크**

```bash
npx tsc --noEmit
```
Expected: 에러 없음

- [ ] **Step 4: 커밋**

```bash
git add src/app/api/admin/approve/route.ts src/app/api/admin/reject/route.ts
git commit -m "feat(api): /api/admin/approve, /api/admin/reject 승인·반려 엔드포인트"
```

---

## Task 4: `/verify-license` 페이지 — 서버 + 클라이언트 컴포넌트

**Files:**
- Create: `src/app/verify-license/page.tsx`
- Create: `src/app/verify-license/VerifyLicenseClient.tsx`

- [ ] **Step 1: 서버 컴포넌트(page.tsx) 생성**

```tsx
// src/app/verify-license/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import VerifyLicenseClient from './VerifyLicenseClient'

export default async function VerifyLicensePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (!session.user.companyId) redirect('/verify-biz')

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
  })
  if (!company) redirect('/verify-biz')

  return (
    <VerifyLicenseClient
      bizNo={company.bizNo}
      userType={session.user.userType ?? ''}
    />
  )
}
```

- [ ] **Step 2: 클라이언트 컴포넌트(VerifyLicenseClient.tsx) 생성**

```tsx
// src/app/verify-license/VerifyLicenseClient.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, CheckCircle2, AlertCircle, Upload, X, FileText, Loader2 } from 'lucide-react'

interface LicenseItem {
  licenseType: string
  licenseNo: string
  issuedAt: string | null
}

type FetchState = 'loading' | 'success' | 'fail' | 'skipped'

export default function VerifyLicenseClient({
  bizNo,
  userType,
}: {
  bizNo: string
  userType: string
}) {
  const router = useRouter()

  const [fetchState, setFetchState] = useState<FetchState>('loading')
  const [licenses, setLicenses] = useState<LicenseItem[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // OWNER 타입은 면허 조회 스킵
  const isOwner = userType === 'OWNER'
  const licenseType = userType === 'GENERAL_CONTRACTOR' ? 'general' : 'specialty'

  useEffect(() => {
    if (isOwner) { setFetchState('skipped'); return }

    fetch('/api/verify-license', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bizno: bizNo, licenseType }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.items?.length > 0) {
          const items: LicenseItem[] = data.items.map((item: { bizCategory: string; licenseNo: string; registeredAt: string }) => ({
            licenseType: item.bizCategory,
            licenseNo: item.licenseNo,
            issuedAt: item.registeredAt ?? null,
          }))
          setLicenses(items)
          setSelected(new Set(items.map((_: LicenseItem, i: number) => i)))
          setFetchState('success')
        } else {
          setFetchState('fail')
        }
      })
      .catch(() => setFetchState('fail'))
  }, [bizNo, licenseType, isOwner])

  function toggleSelect(idx: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 10 * 1024 * 1024) { setError('파일 크기는 10MB 이하여야 합니다.'); return }
    setFile(f)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    let licenseDocUrl: string | null = null

    if (file) {
      const fd = new FormData()
      fd.append('file', file)
      const uploadRes = await fetch('/api/upload/biz-doc', { method: 'POST', body: fd })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) { setError(uploadData.error ?? '파일 업로드 실패'); setSubmitting(false); return }
      licenseDocUrl = uploadData.url ?? null
    }

    const selectedLicenses = licenses.filter((_, i) => selected.has(i))

    const res = await fetch('/api/license/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedLicenses, licenseDocUrl }),
    })
    const data = await res.json()
    setSubmitting(false)

    if (!res.ok) { setError(data.error ?? '등록에 실패했습니다.'); return }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-brand-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="text-t6 font-bold text-primary tracking-tight">CoziCON</Link>
          <p className="mt-2 text-p14 text-ink-500">건설업등록증 인증</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-t6 font-bold text-ink-700">건설업등록증 인증</h1>
              <p className="text-p13 text-ink-400">KISCON 면허를 조회하고 등록합니다</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-p14 text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 면허 조회 결과 */}
            {!isOwner && (
              <div>
                <p className="text-p14 font-medium text-ink-600 mb-2">조회된 건설업 면허</p>

                {fetchState === 'loading' && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-brand-slate-50 rounded-lg text-p14 text-ink-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    KISCON에서 면허를 조회하는 중...
                  </div>
                )}

                {fetchState === 'fail' && (
                  <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-p14 text-amber-700">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    면허 정보를 자동으로 가져올 수 없습니다. 건설업등록증을 직접 첨부해주세요.
                  </div>
                )}

                {fetchState === 'success' && licenses.length > 0 && (
                  <div className="border border-ink-200 rounded-lg divide-y divide-ink-100">
                    {licenses.map((l, i) => (
                      <label key={i} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-brand-slate-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={selected.has(i)}
                          onChange={() => toggleSelect(i)}
                          className="w-4 h-4 accent-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-p14 font-medium text-ink-700">{l.licenseType}</p>
                          <p className="text-p12 text-ink-400">{l.licenseNo} · 등록일 {l.issuedAt ?? '-'}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 건설업등록증 파일 업로드 */}
            <div>
              <label className="block text-p14 font-medium text-ink-600 mb-1.5">
                건설업등록증 첨부{' '}
                <span className="text-p13 text-ink-400 font-normal">(선택, JPG·PNG·PDF 10MB 이하)</span>
              </label>
              {file ? (
                <div className="flex items-center gap-3 px-4 py-3 border border-ink-200 rounded-lg bg-brand-slate-50">
                  <FileText className="w-4 h-4 text-ink-500 shrink-0" />
                  <span className="text-p14 text-ink-600 flex-1 truncate">{file.name}</span>
                  <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = '' }}>
                    <X className="w-4 h-4 text-ink-400 hover:text-red-500 transition-colors" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-ink-200 rounded-lg text-p14 text-ink-400 hover:border-primary hover:text-primary transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  파일 선택
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || (fetchState === 'loading')}
              className="w-full py-3 bg-primary text-white font-semibold text-p16 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? '등록 중…' : '인증 완료'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-p13 text-ink-400">
          나중에 인증하려면{' '}
          <Link href="/dashboard" className="text-primary hover:underline">대시보드로 이동</Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 타입 체크**

```bash
npx tsc --noEmit
```
Expected: 에러 없음

- [ ] **Step 4: 커밋**

```bash
git add src/app/verify-license/page.tsx src/app/verify-license/VerifyLicenseClient.tsx
git commit -m "feat(page): /verify-license 건설업등록증 인증 페이지"
```

---

## Task 5: `/admin` 페이지 — 관리자 승인 큐

**Files:**
- Create: `src/app/admin/page.tsx`

- [ ] **Step 1: admin 페이지 생성**

```tsx
// src/app/admin/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import AdminClient from './AdminClient'

function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim())
  return adminEmails.includes(email)
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !isAdmin(session.user.email)) redirect('/')

  const pendingUsers = await prisma.user.findMany({
    where: { status: 'PENDING', companyId: { not: null } },
    include: { company: true },
    orderBy: { createdAt: 'asc' },
  })

  return <AdminClient initialUsers={pendingUsers} />
}
```

- [ ] **Step 2: AdminClient 컴포넌트 생성**

```tsx
// src/app/admin/AdminClient.tsx
'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Building2 } from 'lucide-react'

interface User {
  id: string
  email: string
  createdAt: string   // 서버→클라이언트 직렬화 시 ISO string
  company: {
    name: string
    bizNo: string
    type: string
    bizDocUrl: string | null
  } | null
}

export default function AdminClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [processing, setProcessing] = useState<string | null>(null)

  async function handleApprove(userId: string) {
    setProcessing(userId)
    const res = await fetch('/api/admin/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== userId))
    setProcessing(null)
  }

  async function handleReject(userId: string) {
    setProcessing(userId)
    const res = await fetch('/api/admin/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== userId))
    setProcessing(null)
  }

  const typeLabel: Record<string, string> = {
    GENERAL_CONTRACTOR: '종합건설사',
    SPECIALTY_CONTRACTOR: '전문건설사',
    OWNER: '발주사',
  }

  return (
    <div className="min-h-screen bg-brand-slate-100">
      <header className="bg-white border-b border-ink-200 shadow-sm">
        <div className="container-content flex items-center h-16">
          <a href="/" className="text-t6 font-bold text-primary tracking-tight">CoziCON</a>
          <span className="ml-3 px-2 py-0.5 bg-red-100 text-red-600 text-p12 font-semibold rounded">관리자</span>
        </div>
      </header>

      <main className="container-content py-12">
        <h1 className="text-t4 font-bold text-ink-700 mb-2">승인 대기</h1>
        <p className="text-p15 text-ink-400 mb-8">{users.length}건 대기 중</p>

        {users.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-card-md">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="text-p16 text-ink-500">대기 중인 승인 요청이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="bg-white rounded-2xl p-6 shadow-card-md flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-p15 font-semibold text-ink-700">{user.company?.name ?? '-'}</p>
                    <span className="px-2 py-0.5 bg-brand-slate-100 text-ink-500 text-p12 rounded">
                      {typeLabel[user.company?.type ?? ''] ?? user.company?.type}
                    </span>
                  </div>
                  <p className="text-p13 text-ink-400 mt-0.5">
                    {user.company?.bizNo} · {user.email}
                  </p>
                  <p className="text-p12 text-ink-300 mt-0.5">
                    신청일: {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                  {user.company?.bizDocUrl && (
                    <a
                      href={user.company.bizDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-p12 text-primary hover:underline mt-0.5 inline-block"
                    >
                      첨부 서류 보기
                    </a>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleApprove(user.id)}
                    disabled={processing === user.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white text-p13 font-semibold rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    승인
                  </button>
                  <button
                    onClick={() => handleReject(user.id)}
                    disabled={processing === user.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white text-p13 font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    반려
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 3: 타입 체크**

```bash
npx tsc --noEmit
```
Expected: 에러 없음

- [ ] **Step 4: 커밋**

```bash
git add src/app/admin/page.tsx src/app/admin/AdminClient.tsx
git commit -m "feat(page): /admin 관리자 승인 큐 페이지"
```

---

## Task 6: `/verify-biz` 리다이렉트 변경

**Files:**
- Modify: `src/app/verify-biz/page.tsx:101`

- [ ] **Step 1: 리다이렉트 경로 변경**

`src/app/verify-biz/page.tsx` 101번째 줄:

```tsx
// 변경 전
router.push('/dashboard?verified=1')

// 변경 후
router.push('/verify-license')
```

- [ ] **Step 2: 타입 체크**

```bash
npx tsc --noEmit
```
Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add src/app/verify-biz/page.tsx
git commit -m "feat(verify-biz): 완료 후 /verify-license로 리다이렉트 변경"
```

---

## Task 7: 환경변수 설정 + 최종 검증

- [ ] **Step 1: `.env.local`에 ADMIN_EMAILS 추가**

```bash
# .env.local
ADMIN_EMAILS=rlarhtjq90@gmail.com
```

- [ ] **Step 2: Vercel 환경변수 등록**

Vercel 대시보드 → Settings → Environment Variables:
- `ADMIN_EMAILS` = `rlarhtjq90@gmail.com`

- [ ] **Step 3: 로컬 E2E 시나리오 확인**

```
1. 회원가입 → 로그인
2. 대시보드에서 "사업자 인증하기" 클릭
3. /verify-biz → 사업자번호 + 대표자명 입력 → 진위확인 → 인증 완료
4. /verify-license 자동 이동 확인
5. 면허 목록 조회 확인 (또는 KISCON 없을 시 안내 메시지)
6. "인증 완료" 클릭 → 대시보드 "관리자 승인 대기" 배너 확인
7. ADMIN_EMAILS 계정으로 로그인 → /admin 접근
8. 승인 버튼 클릭 → 목록에서 사라짐 확인
9. 일반 계정으로 재로그인 → 대시보드 "인증 완료" 배너 확인
```

- [ ] **Step 4: dev 브랜치 push → Vercel 배포 확인**

```bash
git push origin dev
```

- [ ] **Step 5: main 머지**

```bash
git checkout main
git merge dev --no-ff -m "feat: Day 4 — 건설업등록증 인증 + 관리자 승인 큐"
git push origin main
git checkout dev
```
