# Week 3 — SC 포트폴리오 + GC→SC 리뷰 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** SC가 시공 실적 포트폴리오를 등록하고, GC가 계약 이후 SC를 평가할 수 있는 시스템 구축 — `/company/[companyId]` 공개 프로필로 통합

**Architecture:** Prisma에 Portfolio·CompanyReview 모델 추가 → REST API 9개 신규 → Server Component 기반 공개 프로필 페이지 + Client Component(탭·폼) 분리. 기존 notice-attachment 업로드 패턴을 포트폴리오 PDF 업로드에 재사용.

**Tech Stack:** Next.js 14 App Router, Prisma 5 (Neon PostgreSQL), NextAuth v4, Vercel Blob (`@vercel/blob`), TypeScript, Tailwind CSS

---

## 파일 목록

| 작업 | 파일 |
|------|------|
| 수정 | `prisma/schema.prisma` |
| 신규 | `src/app/api/portfolio/route.ts` |
| 신규 | `src/app/api/portfolio/[id]/route.ts` |
| 신규 | `src/app/api/upload/portfolio-doc/route.ts` |
| 신규 | `src/app/api/company/[companyId]/route.ts` |
| 신규 | `src/app/api/company/[companyId]/portfolio/route.ts` |
| 신규 | `src/app/api/company/[companyId]/reviews/route.ts` |
| 신규 | `src/app/company/[companyId]/page.tsx` |
| 신규 | `src/app/company/[companyId]/CompanyPublicClient.tsx` |
| 신규 | `src/app/dashboard/portfolio/page.tsx` |
| 신규 | `src/app/dashboard/portfolio/PortfolioClient.tsx` |
| 수정 | `src/app/contracts/[id]/page.tsx` |
| 수정 | `src/app/dashboard/page.tsx` |
| 수정 | `src/middleware.ts` |

---

## Task 1: DB 스키마 추가

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Portfolio 모델 추가**

`prisma/schema.prisma` 끝에 추가:

```prisma
// =============================================
// SC 포트폴리오 (시공 실적)
// =============================================

model Portfolio {
  id           String    @id @default(cuid())
  companyId    String
  title        String
  client       String
  startDate    DateTime
  endDate      DateTime
  amount       BigInt?
  workCategory String
  description  String?   @db.Text
  docUrl       String?
  createdAt    DateTime  @default(now())

  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
}

// =============================================
// GC → SC 리뷰
// =============================================

model CompanyReview {
  id                String   @id @default(cuid())
  contractId        String   @unique
  reviewerCompanyId String
  targetCompanyId   String
  rating            Int
  comment           String?  @db.Text
  createdAt         DateTime @default(now())

  contract        Contract @relation(fields: [contractId], references: [id])
  reviewerCompany Company  @relation("ReviewsGiven",    fields: [reviewerCompanyId], references: [id])
  targetCompany   Company  @relation("ReviewsReceived", fields: [targetCompanyId],   references: [id])
}
```

- [ ] **Step 2: Company 모델에 관계 3개 추가**

`prisma/schema.prisma`의 `model Company` 내 `contractsAsSC` 줄 아래에 추가:

```prisma
  portfolios      Portfolio[]
  reviewsGiven    CompanyReview[] @relation("ReviewsGiven")
  reviewsReceived CompanyReview[] @relation("ReviewsReceived")
```

- [ ] **Step 3: Contract 모델에 관계 추가**

`model Contract` 내 `signs ContractSign[]` 줄 아래에 추가:

```prisma
  review CompanyReview?
```

- [ ] **Step 4: DB 반영**

```bash
npx prisma db push --accept-data-loss
```

Expected: `Your database is now in sync with your Prisma schema.`

- [ ] **Step 5: Prisma Client 재생성 확인**

```bash
npx prisma generate
```

- [ ] **Step 6: 커밋**

```bash
git add prisma/schema.prisma
git commit -m "feat(schema): Portfolio·CompanyReview 모델 추가"
```

---

## Task 2: 포트폴리오 PDF 업로드 API

**Files:**
- Create: `src/app/api/upload/portfolio-doc/route.ts`

- [ ] **Step 1: 파일 생성**

```typescript
// src/app/api/upload/portfolio-doc/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { put } from '@vercel/blob'

export const maxDuration = 30

const MAX_SIZE = 20 * 1024 * 1024 // 20MB

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: '파일을 선택해주세요.' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (ext !== 'pdf') {
    return NextResponse.json({ error: 'PDF 파일만 업로드 가능합니다.' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: '파일 크기는 20MB 이하여야 합니다.' }, { status: 400 })
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({
      url: `__mock__/${file.name}`,
      fileName: file.name,
      skipped: true,
    })
  }

  try {
    const filename = `portfolio-docs/${session.user.id}-${Date.now()}-${file.name}`
    const blob = await put(filename, file, { access: 'public' })
    return NextResponse.json({ url: blob.url, fileName: file.name })
  } catch (err) {
    console.error('[upload/portfolio-doc]', err)
    return NextResponse.json({ error: '파일 업로드에 실패했습니다.' }, { status: 500 })
  }
}
```

- [ ] **Step 2: 동작 확인**

dev 서버(`npm run dev`)에서:
```bash
curl -X POST http://localhost:3000/api/upload/portfolio-doc \
  -F "file=@test.pdf" \
  -H "Cookie: next-auth.session-token=..."
```
BLOB_READ_WRITE_TOKEN 미설정 시 `{"url":"__mock__/test.pdf","skipped":true}` 반환 확인.

- [ ] **Step 3: 커밋**

```bash
git add src/app/api/upload/portfolio-doc/route.ts
git commit -m "feat(api): 포트폴리오 PDF 업로드 엔드포인트"
```

---

## Task 3: 포트폴리오 CRUD API

**Files:**
- Create: `src/app/api/portfolio/route.ts`
- Create: `src/app/api/portfolio/[id]/route.ts`

- [ ] **Step 1: GET·POST /api/portfolio 생성**

```typescript
// src/app/api/portfolio/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true, userType: true },
  })
  if (!user?.companyId) {
    return NextResponse.json({ portfolios: [] })
  }

  const portfolios = await prisma.portfolio.findMany({
    where: { companyId: user.companyId },
    orderBy: { startDate: 'desc' },
  })

  return NextResponse.json({ portfolios })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true, userType: true },
  })

  if (user?.userType !== 'SPECIALTY_CONTRACTOR') {
    return NextResponse.json({ error: '전문건설사만 포트폴리오를 등록할 수 있습니다.' }, { status: 403 })
  }
  if (!user.companyId) {
    return NextResponse.json({ error: '회사 정보가 없습니다.' }, { status: 400 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const { title, client, startDate, endDate, amount, workCategory, description, docUrl } = body as {
    title: string
    client: string
    startDate: string
    endDate: string
    amount?: number
    workCategory: string
    description?: string
    docUrl?: string
  }

  if (!title || !client || !startDate || !endDate || !workCategory) {
    return NextResponse.json({ error: '필수 항목을 모두 입력해주세요.' }, { status: 400 })
  }

  const portfolio = await prisma.portfolio.create({
    data: {
      companyId: user.companyId,
      title,
      client,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      amount: amount ? BigInt(Math.round(amount)) : null,
      workCategory,
      description: description ?? null,
      docUrl: docUrl ?? null,
    },
  })

  return NextResponse.json({ portfolio }, { status: 201 })
}
```

- [ ] **Step 2: PATCH·DELETE /api/portfolio/[id] 생성**

```typescript
// src/app/api/portfolio/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

type Props = { params: Promise<{ id: string }> }

async function getOwnedPortfolio(portfolioId: string, userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { companyId: true, userType: true },
  })
  if (!user?.companyId || user.userType !== 'SPECIALTY_CONTRACTOR') return null

  const portfolio = await prisma.portfolio.findUnique({ where: { id: portfolioId } })
  if (!portfolio || portfolio.companyId !== user.companyId) return null
  return portfolio
}

export async function PATCH(req: NextRequest, { params }: Props): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { id } = await params
  const portfolio = await getOwnedPortfolio(id, session.user.id)
  if (!portfolio) {
    return NextResponse.json({ error: '포트폴리오를 찾을 수 없습니다.' }, { status: 404 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const { title, client, startDate, endDate, amount, workCategory, description, docUrl } = body as {
    title?: string; client?: string; startDate?: string; endDate?: string
    amount?: number; workCategory?: string; description?: string; docUrl?: string
  }

  const updated = await prisma.portfolio.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(client && { client }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
      ...(workCategory && { workCategory }),
      amount: amount !== undefined ? BigInt(Math.round(amount)) : portfolio.amount,
      description: description ?? portfolio.description,
      docUrl: docUrl ?? portfolio.docUrl,
    },
  })

  return NextResponse.json({ portfolio: updated })
}

export async function DELETE(_req: NextRequest, { params }: Props): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { id } = await params
  const portfolio = await getOwnedPortfolio(id, session.user.id)
  if (!portfolio) {
    return NextResponse.json({ error: '포트폴리오를 찾을 수 없습니다.' }, { status: 404 })
  }

  await prisma.portfolio.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 3: 커밋**

```bash
git add src/app/api/portfolio/
git commit -m "feat(api): 포트폴리오 CRUD API (GET·POST·PATCH·DELETE)"
```

---

## Task 4: 공개 프로필 API

**Files:**
- Create: `src/app/api/company/[companyId]/route.ts`
- Create: `src/app/api/company/[companyId]/portfolio/route.ts`
- Create: `src/app/api/company/[companyId]/reviews/route.ts`

- [ ] **Step 1: 공개 기본정보 GET**

```typescript
// src/app/api/company/[companyId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

type Props = { params: Promise<{ companyId: string }> }

export async function GET(_req: NextRequest, { params }: Props): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { companyId } = await params

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      licenses: { where: { isActive: true }, orderBy: { createdAt: 'asc' } },
    },
  })

  if (!company) return NextResponse.json({ error: '회사를 찾을 수 없습니다.' }, { status: 404 })

  return NextResponse.json({ company })
}
```

- [ ] **Step 2: 공개 포트폴리오 GET**

```typescript
// src/app/api/company/[companyId]/portfolio/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

type Props = { params: Promise<{ companyId: string }> }

export async function GET(_req: NextRequest, { params }: Props): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { companyId } = await params

  const portfolios = await prisma.portfolio.findMany({
    where: { companyId },
    orderBy: { startDate: 'desc' },
  })

  return NextResponse.json({ portfolios })
}
```

- [ ] **Step 3: 리뷰 GET·POST**

```typescript
// src/app/api/company/[companyId]/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

type Props = { params: Promise<{ companyId: string }> }

export async function GET(_req: NextRequest, { params }: Props): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { companyId } = await params

  const reviews = await prisma.companyReview.findMany({
    where: { targetCompanyId: companyId },
    include: {
      reviewerCompany: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const avg = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : null

  return NextResponse.json({ reviews, avg, count: reviews.length })
}

export async function POST(req: NextRequest, { params }: Props): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { companyId } = await params

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true, userType: true },
  })

  if (user?.userType !== 'GENERAL_CONTRACTOR') {
    return NextResponse.json({ error: '종합건설사만 리뷰를 작성할 수 있습니다.' }, { status: 403 })
  }
  if (!user.companyId) {
    return NextResponse.json({ error: '회사 정보가 없습니다.' }, { status: 400 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const { contractId, rating, comment } = body as {
    contractId: string; rating: number; comment?: string
  }

  if (!contractId || !rating) {
    return NextResponse.json({ error: '계약 ID와 평점은 필수입니다.' }, { status: 400 })
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: '평점은 1~5 사이 정수여야 합니다.' }, { status: 400 })
  }

  // 계약 유효성 확인
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    select: { gcCompanyId: true, scCompanyId: true, status: true, review: true },
  })

  if (!contract) {
    return NextResponse.json({ error: '계약을 찾을 수 없습니다.' }, { status: 404 })
  }
  if (contract.gcCompanyId !== user.companyId) {
    return NextResponse.json({ error: '해당 계약의 발주사가 아닙니다.' }, { status: 403 })
  }
  if (contract.scCompanyId !== companyId) {
    return NextResponse.json({ error: '계약의 수주사와 대상 회사가 일치하지 않습니다.' }, { status: 400 })
  }
  if (contract.status === 'PENDING') {
    return NextResponse.json({ error: '계약 성립 이후 리뷰를 작성할 수 있습니다.' }, { status: 400 })
  }
  if (contract.review) {
    return NextResponse.json({ error: '이미 리뷰를 작성했습니다.' }, { status: 409 })
  }

  const review = await prisma.companyReview.create({
    data: {
      contractId,
      reviewerCompanyId: user.companyId,
      targetCompanyId: companyId,
      rating,
      comment: comment ?? null,
    },
  })

  return NextResponse.json({ review }, { status: 201 })
}
```

- [ ] **Step 4: 커밋**

```bash
git add src/app/api/company/
git commit -m "feat(api): 공개 프로필·포트폴리오·리뷰 API"
```

---

## Task 5: SC 포트폴리오 관리 페이지

**Files:**
- Create: `src/app/dashboard/portfolio/page.tsx`
- Create: `src/app/dashboard/portfolio/PortfolioClient.tsx`

- [ ] **Step 1: Server Page 생성**

```typescript
// src/app/dashboard/portfolio/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/layout/AppFooter'
import PortfolioClient from './PortfolioClient'
import { ArrowLeft } from 'lucide-react'

export default async function PortfolioManagePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { userType: true, companyId: true },
  })

  if (user?.userType !== 'SPECIALTY_CONTRACTOR' || !user.companyId) {
    redirect('/dashboard')
  }

  const portfolios = await prisma.portfolio.findMany({
    where: { companyId: user.companyId },
    orderBy: { startDate: 'desc' },
  })

  return (
    <div className="min-h-screen bg-brand-slate-100 flex flex-col">
      <AppHeader userId={session.user.id} userEmail={session.user.email ?? ''} />
      <main className="container-content py-10 flex-1">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-p14 text-ink-400 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            대시보드로
          </Link>
        </div>
        <div className="mb-6">
          <h1 className="text-t4 font-bold text-ink-700">내 포트폴리오</h1>
          <p className="mt-1 text-p15 text-ink-400">시공 실적을 등록하면 공개 프로필에 표시됩니다.</p>
        </div>
        <PortfolioClient
          initialPortfolios={portfolios.map(p => ({
            ...p,
            amount: p.amount ? Number(p.amount) : null,
            startDate: p.startDate.toISOString(),
            endDate: p.endDate.toISOString(),
            createdAt: p.createdAt.toISOString(),
          }))}
        />
      </main>
      <AppFooter />
    </div>
  )
}
```

- [ ] **Step 2: PortfolioClient 생성**

```typescript
// src/app/dashboard/portfolio/PortfolioClient.tsx
'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, FileText, X } from 'lucide-react'

type PortfolioItem = {
  id: string
  title: string
  client: string
  startDate: string
  endDate: string
  amount: number | null
  workCategory: string
  description: string | null
  docUrl: string | null
  createdAt: string
}

type FormData = {
  title: string
  client: string
  startDate: string
  endDate: string
  amount: string
  workCategory: string
  description: string
  docUrl: string
  docFileName: string
}

const EMPTY_FORM: FormData = {
  title: '', client: '', startDate: '', endDate: '',
  amount: '', workCategory: '', description: '', docUrl: '', docFileName: '',
}

function formatAmount(n: number | null) {
  if (!n) return '—'
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억원`
  if (n >= 10_000) return `${Math.round(n / 10_000)}만원`
  return `${n.toLocaleString()}원`
}

export default function PortfolioClient({ initialPortfolios }: { initialPortfolios: PortfolioItem[] }) {
  const [portfolios, setPortfolios] = useState(initialPortfolios)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function openAdd() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError('')
    setShowModal(true)
  }

  function openEdit(p: PortfolioItem) {
    setEditingId(p.id)
    setForm({
      title: p.title,
      client: p.client,
      startDate: p.startDate.slice(0, 10),
      endDate: p.endDate.slice(0, 10),
      amount: p.amount ? String(p.amount) : '',
      workCategory: p.workCategory,
      description: p.description ?? '',
      docUrl: p.docUrl ?? '',
      docFileName: p.docUrl ? p.docUrl.split('/').pop() ?? '' : '',
    })
    setError('')
    setShowModal(true)
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload/portfolio-doc', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setForm(f => ({ ...f, docUrl: data.url, docFileName: file.name }))
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드 실패')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const body = {
        title: form.title,
        client: form.client,
        startDate: form.startDate,
        endDate: form.endDate,
        amount: form.amount ? Number(form.amount) : undefined,
        workCategory: form.workCategory,
        description: form.description || undefined,
        docUrl: form.docUrl || undefined,
      }
      const url = editingId ? `/api/portfolio/${editingId}` : '/api/portfolio'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (editingId) {
        setPortfolios(ps => ps.map(p => p.id === editingId ? {
          ...data.portfolio,
          amount: data.portfolio.amount ? Number(data.portfolio.amount) : null,
          startDate: data.portfolio.startDate,
          endDate: data.portfolio.endDate,
          createdAt: data.portfolio.createdAt,
        } : p))
      } else {
        setPortfolios(ps => [{
          ...data.portfolio,
          amount: data.portfolio.amount ? Number(data.portfolio.amount) : null,
          startDate: data.portfolio.startDate,
          endDate: data.portfolio.endDate,
          createdAt: data.portfolio.createdAt,
        }, ...ps])
      }
      setShowModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 실패')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('이 실적을 삭제하시겠습니까?')) return
    const res = await fetch(`/api/portfolio/${id}`, { method: 'DELETE' })
    if (res.ok) setPortfolios(ps => ps.filter(p => p.id !== id))
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-p14 font-semibold rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          새 실적 추가
        </button>
      </div>

      {portfolios.length === 0 ? (
        <div className="text-center py-16 text-ink-400">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-p15">등록된 시공 실적이 없습니다.</p>
          <p className="text-p13 mt-1">실적을 추가하면 공개 프로필에 표시됩니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {portfolios.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-ink-200 p-5 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-p15 font-semibold text-ink-700">{p.title}</p>
                <p className="text-p13 text-ink-400 mt-1">
                  {p.client} · {p.workCategory} · {formatAmount(p.amount)}
                </p>
                <p className="text-p13 text-ink-400">
                  {p.startDate.slice(0, 10)} ~ {p.endDate.slice(0, 10)}
                </p>
                {p.docUrl && !p.docUrl.startsWith('__mock__') && (
                  <a
                    href={p.docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-p13 text-primary mt-1 hover:underline"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    준공서류 보기
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openEdit(p)} className="p-2 text-ink-400 hover:text-primary transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-2 text-ink-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-p16 font-bold text-ink-700">
                {editingId ? '실적 수정' : '새 실적 추가'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-ink-400 hover:text-ink-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-p13 font-medium text-ink-600 mb-1">공사명 *</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-ink-200 rounded-lg px-3 py-2 text-p14 focus:outline-none focus:border-primary"
                  placeholder="예: OO빌딩 토목공사"
                />
              </div>
              <div>
                <label className="block text-p13 font-medium text-ink-600 mb-1">발주처 *</label>
                <input
                  required
                  value={form.client}
                  onChange={e => setForm(f => ({ ...f, client: e.target.value }))}
                  className="w-full border border-ink-200 rounded-lg px-3 py-2 text-p14 focus:outline-none focus:border-primary"
                  placeholder="예: (주)OO건설"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-p13 font-medium text-ink-600 mb-1">시작일 *</label>
                  <input
                    required
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full border border-ink-200 rounded-lg px-3 py-2 text-p14 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-p13 font-medium text-ink-600 mb-1">완료일 *</label>
                  <input
                    required
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full border border-ink-200 rounded-lg px-3 py-2 text-p14 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-p13 font-medium text-ink-600 mb-1">공사금액 (원)</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="w-full border border-ink-200 rounded-lg px-3 py-2 text-p14 focus:outline-none focus:border-primary"
                    placeholder="예: 500000000"
                  />
                </div>
                <div>
                  <label className="block text-p13 font-medium text-ink-600 mb-1">공종 *</label>
                  <input
                    required
                    value={form.workCategory}
                    onChange={e => setForm(f => ({ ...f, workCategory: e.target.value }))}
                    className="w-full border border-ink-200 rounded-lg px-3 py-2 text-p14 focus:outline-none focus:border-primary"
                    placeholder="예: 토목공사업"
                  />
                </div>
              </div>
              <div>
                <label className="block text-p13 font-medium text-ink-600 mb-1">공사 개요</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-ink-200 rounded-lg px-3 py-2 text-p14 focus:outline-none focus:border-primary resize-none"
                  placeholder="공사 개요를 간략히 입력해주세요."
                />
              </div>
              <div>
                <label className="block text-p13 font-medium text-ink-600 mb-1">준공서류 (PDF)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="w-full text-p13 text-ink-500"
                />
                {form.docFileName && (
                  <p className="text-p12 text-primary mt-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    {form.docFileName}
                  </p>
                )}
              </div>

              {error && <p className="text-p13 text-red-500">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-ink-200 text-p14 font-medium text-ink-600 rounded-lg hover:bg-ink-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 py-2.5 bg-primary text-white text-p14 font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
                >
                  {saving ? '저장 중...' : editingId ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: 커밋**

```bash
git add src/app/dashboard/portfolio/
git commit -m "feat(ui): SC 포트폴리오 관리 페이지 (/dashboard/portfolio)"
```

---

## Task 6: 공개 회사 프로필 페이지

**Files:**
- Create: `src/app/company/[companyId]/page.tsx`
- Create: `src/app/company/[companyId]/CompanyPublicClient.tsx`

- [ ] **Step 1: Server Page 생성**

```typescript
// src/app/company/[companyId]/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/layout/AppFooter'
import CompanyPublicClient from './CompanyPublicClient'

type Props = {
  params: Promise<{ companyId: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function CompanyPublicPage({ params, searchParams }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { companyId } = await params
  const { tab = 'info' } = await searchParams

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyId: true, userType: true },
  })

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      licenses: { where: { isActive: true } },
    },
  })
  if (!company) notFound()

  const portfolios = await prisma.portfolio.findMany({
    where: { companyId },
    orderBy: { startDate: 'desc' },
  })

  const reviews = await prisma.companyReview.findMany({
    where: { targetCompanyId: companyId },
    include: { reviewerCompany: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const avgRating = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : null

  // GC가 이 SC와 맺은 계약 중 리뷰 미작성인 것 조회
  let reviewableContractId: string | null = null
  if (user?.userType === 'GENERAL_CONTRACTOR' && user.companyId) {
    const contract = await prisma.contract.findFirst({
      where: {
        gcCompanyId: user.companyId,
        scCompanyId: companyId,
        status: { not: 'PENDING' },
        review: null,
      },
      select: { id: true },
    })
    reviewableContractId = contract?.id ?? null
  }

  return (
    <div className="min-h-screen bg-brand-slate-100 flex flex-col">
      <AppHeader userId={session.user.id} userEmail={session.user.email ?? ''} />
      <main className="container-content py-10 flex-1">
        <CompanyPublicClient
          company={{
            ...company,
            licenses: company.licenses,
          }}
          portfolios={portfolios.map(p => ({
            ...p,
            amount: p.amount ? Number(p.amount) : null,
            startDate: p.startDate.toISOString(),
            endDate: p.endDate.toISOString(),
            createdAt: p.createdAt.toISOString(),
          }))}
          reviews={reviews.map(r => ({
            ...r,
            createdAt: r.createdAt.toISOString(),
          }))}
          avgRating={avgRating}
          initialTab={tab}
          reviewableContractId={reviewableContractId}
          viewerCompanyId={user?.companyId ?? null}
        />
      </main>
      <AppFooter />
    </div>
  )
}
```

- [ ] **Step 2: CompanyPublicClient 생성**

```typescript
// src/app/company/[companyId]/CompanyPublicClient.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Star, FileText, MapPin, Phone, Globe } from 'lucide-react'

type License = { id: string; licenseType: string; licenseNo: string | null; grade: string | null }
type Company = {
  id: string; name: string; type: string; ceoName: string | null
  address: string | null; phone: string | null; website: string | null
  mainRegions: string[]; constructionCapacity: string | null
  licenses: License[]
}
type Portfolio = {
  id: string; title: string; client: string; startDate: string; endDate: string
  amount: number | null; workCategory: string; description: string | null; docUrl: string | null
}
type Review = {
  id: string; rating: number; comment: string | null; createdAt: string
  reviewerCompany: { name: string }
}

type Props = {
  company: Company
  portfolios: Portfolio[]
  reviews: Review[]
  avgRating: number | null
  initialTab: string
  reviewableContractId: string | null
  viewerCompanyId: string | null
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-ink-200'}`}
        />
      ))}
    </span>
  )
}

function formatAmount(n: number | null) {
  if (!n) return '—'
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억원`
  if (n >= 10_000) return `${Math.round(n / 10_000)}만원`
  return `${n.toLocaleString()}원`
}

const TYPE_LABEL: Record<string, string> = {
  GENERAL_CONTRACTOR: '종합건설사',
  SPECIALTY_CONTRACTOR: '전문건설사',
}

export default function CompanyPublicClient({
  company, portfolios, reviews, avgRating, initialTab, reviewableContractId,
}: Props) {
  const [tab, setTab] = useState(initialTab)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reviewableContractId || reviewRating === 0) return
    setSubmitting(true)
    setReviewError('')
    try {
      const res = await fetch(`/api/company/${company.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId: reviewableContractId,
          rating: reviewRating,
          comment: reviewComment || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSubmitted(true)
      router.refresh()
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : '제출 실패')
    } finally {
      setSubmitting(false)
    }
  }

  const TABS = [
    { key: 'info', label: '기본 정보' },
    { key: 'portfolio', label: `포트폴리오 (${portfolios.length})` },
    { key: 'reviews', label: `리뷰 (${reviews.length})` },
  ]

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-2xl border border-ink-200 p-6 mb-4 flex items-center gap-4">
        <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
          <Building2 className="w-7 h-7 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-t5 font-bold text-ink-700">{company.name}</h1>
            <span className="px-2 py-0.5 bg-primary-100 text-primary text-p12 font-medium rounded-full">
              {TYPE_LABEL[company.type] ?? company.type}
            </span>
          </div>
          {avgRating !== null && (
            <div className="flex items-center gap-1.5 mt-1">
              <StarDisplay rating={Math.round(avgRating)} />
              <span className="text-p13 text-ink-500">{avgRating} ({reviews.length}건)</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-white rounded-xl border border-ink-200 p-1">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 text-p14 font-medium rounded-lg transition-colors ${
              tab === t.key ? 'bg-primary text-white' : 'text-ink-500 hover:bg-ink-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: 기본 정보 */}
      {tab === 'info' && (
        <div className="bg-white rounded-2xl border border-ink-200 p-6 space-y-4">
          {company.ceoName && (
            <div><span className="text-p13 text-ink-400 w-24 inline-block">대표자</span><span className="text-p14 text-ink-700">{company.ceoName}</span></div>
          )}
          {company.address && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-ink-400 mt-0.5 shrink-0" />
              <span className="text-p14 text-ink-600">{company.address}</span>
            </div>
          )}
          {company.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-ink-400 shrink-0" />
              <span className="text-p14 text-ink-600">{company.phone}</span>
            </div>
          )}
          {company.website && (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-ink-400 shrink-0" />
              <a href={company.website} target="_blank" rel="noopener noreferrer"
                className="text-p14 text-primary hover:underline">{company.website}</a>
            </div>
          )}
          {company.mainRegions.length > 0 && (
            <div>
              <p className="text-p13 text-ink-400 mb-2">주요 지역</p>
              <div className="flex flex-wrap gap-1.5">
                {company.mainRegions.map(r => (
                  <span key={r} className="px-2.5 py-1 bg-ink-50 text-ink-600 text-p12 rounded-full">{r}</span>
                ))}
              </div>
            </div>
          )}
          {company.licenses.length > 0 && (
            <div>
              <p className="text-p13 text-ink-400 mb-2">보유 면허</p>
              <div className="space-y-1.5">
                {company.licenses.map(l => (
                  <div key={l.id} className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-primary-100 text-primary text-p12 font-medium rounded-full">{l.licenseType}</span>
                    {l.grade && <span className="text-p12 text-ink-400">{l.grade}</span>}
                    {l.licenseNo && <span className="text-p12 text-ink-400">#{l.licenseNo}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: 포트폴리오 */}
      {tab === 'portfolio' && (
        <div className="space-y-3">
          {portfolios.length === 0 ? (
            <div className="bg-white rounded-2xl border border-ink-200 p-12 text-center text-ink-400">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-p15">등록된 시공 실적이 없습니다.</p>
            </div>
          ) : portfolios.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-ink-200 p-5">
              <p className="text-p15 font-semibold text-ink-700">{p.title}</p>
              <p className="text-p13 text-ink-400 mt-1">
                {p.client} · {p.workCategory} · {formatAmount(p.amount)}
              </p>
              <p className="text-p13 text-ink-400">
                {p.startDate.slice(0, 10)} ~ {p.endDate.slice(0, 10)}
              </p>
              {p.description && <p className="text-p14 text-ink-600 mt-2">{p.description}</p>}
              {p.docUrl && !p.docUrl.startsWith('__mock__') && (
                <a
                  href={p.docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-p13 text-primary mt-2 hover:underline"
                >
                  <FileText className="w-3.5 h-3.5" />
                  준공서류 보기
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab: 리뷰 */}
      {tab === 'reviews' && (
        <div className="space-y-4">
          {/* 리뷰 작성 폼 (GC + 리뷰 가능한 계약 존재) */}
          {reviewableContractId && !submitted && (
            <div className="bg-white rounded-2xl border border-primary border-dashed p-6">
              <p className="text-p15 font-semibold text-ink-700 mb-4">리뷰 남기기</p>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <p className="text-p13 text-ink-500 mb-2">평점</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setReviewRating(i)}
                        className="p-1"
                      >
                        <Star className={`w-7 h-7 transition-colors ${
                          i <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-ink-200 hover:text-amber-300'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-p13 text-ink-500 mb-1">코멘트 (선택)</p>
                  <textarea
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    rows={3}
                    className="w-full border border-ink-200 rounded-lg px-3 py-2 text-p14 focus:outline-none focus:border-primary resize-none"
                    placeholder="시공 품질, 일정 준수, 소통 등에 대해 자유롭게 작성해주세요."
                  />
                </div>
                {reviewError && <p className="text-p13 text-red-500">{reviewError}</p>}
                <button
                  type="submit"
                  disabled={submitting || reviewRating === 0}
                  className="w-full py-2.5 bg-primary text-white text-p14 font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
                >
                  {submitting ? '제출 중...' : '리뷰 제출'}
                </button>
              </form>
            </div>
          )}
          {submitted && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-p14 text-green-700">
              리뷰가 제출됐습니다. 감사합니다!
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-ink-200 p-12 text-center text-ink-400">
              <Star className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-p15">아직 리뷰가 없습니다.</p>
            </div>
          ) : (
            <>
              {avgRating !== null && (
                <div className="bg-white rounded-xl border border-ink-200 p-4 flex items-center gap-3">
                  <span className="text-t3 font-bold text-ink-700">{avgRating}</span>
                  <div>
                    <StarDisplay rating={Math.round(avgRating)} />
                    <p className="text-p12 text-ink-400 mt-0.5">총 {reviews.length}건 리뷰</p>
                  </div>
                </div>
              )}
              {reviews.map(r => (
                <div key={r.id} className="bg-white rounded-xl border border-ink-200 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <StarDisplay rating={r.rating} />
                      <span className="text-p13 font-medium text-ink-600">{r.reviewerCompany.name}</span>
                    </div>
                    <span className="text-p12 text-ink-400">{r.createdAt.slice(0, 10)}</span>
                  </div>
                  {r.comment && <p className="text-p14 text-ink-600">{r.comment}</p>}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: 커밋**

```bash
git add src/app/company/[companyId]/
git commit -m "feat(ui): SC 공개 프로필 페이지 (/company/[companyId])"
```

---

## Task 7: 계약 상세 + 대시보드 + 미들웨어 수정

**Files:**
- Modify: `src/app/contracts/[id]/page.tsx`
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/middleware.ts`

- [ ] **Step 1: 미들웨어에 portfolio 라우트 추가**

`src/middleware.ts`의 `matcher` 배열에 추가:

```typescript
'/dashboard/portfolio/:path*',
```

- [ ] **Step 2: contracts/[id]/page.tsx에 리뷰 섹션 추가**

`page.tsx`에서 `prisma.contract.findUnique` include 부분에 `review: true` 추가:

```typescript
// 기존 include에 추가
review: true,
```

페이지 하단 반환 JSX에서 `</div>` 닫기 전 (ContractActions 아래) 추가:

```typescript
{/* 리뷰 섹션: GC이고 계약 ACTIVE 이상이고 리뷰 미작성인 경우 */}
{isGC && ['ACTIVE', 'COMPLETED', 'TERMINATED'].includes(contract.status) && !contract.review && (
  <div className="mt-6 bg-white rounded-2xl border border-ink-200 p-6">
    <h3 className="text-p16 font-semibold text-ink-700 mb-1">수주사 리뷰</h3>
    <p className="text-p13 text-ink-400 mb-4">
      이 계약의 수주사({contract.scCompany.name})에 대한 평가를 남겨보세요.
    </p>
    <a
      href={`/company/${contract.scCompanyId}?tab=reviews`}
      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-p14 font-semibold rounded-lg hover:bg-primary-600 transition-colors"
    >
      리뷰 남기기
    </a>
  </div>
)}
{isGC && contract.review && (
  <div className="mt-6 bg-white rounded-2xl border border-ink-200 p-6">
    <h3 className="text-p16 font-semibold text-ink-700 mb-3">내가 남긴 리뷰</h3>
    <div className="flex items-center gap-1 mb-2">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-5 h-5 ${i <= contract.review!.rating ? 'fill-amber-400 text-amber-400' : 'text-ink-200'}`} />
      ))}
    </div>
    {contract.review.comment && (
      <p className="text-p14 text-ink-600">{contract.review.comment}</p>
    )}
  </div>
)}
```

`Star` import 추가:
```typescript
import { ArrowLeft, Building2, CalendarDays, FileText, CheckCircle2, Star } from 'lucide-react'
```

- [ ] **Step 3: 대시보드에 SC 포트폴리오 카드 추가**

`src/app/dashboard/page.tsx`에서 SC 전용 카드 섹션 찾아서 포트폴리오 카드 추가. SC 카드 목록이 있는 부분(`userType === 'SPECIALTY_CONTRACTOR'`로 조건부 렌더링되는 영역)에 추가:

```typescript
{user?.userType === 'SPECIALTY_CONTRACTOR' && hasCompany && !isPending && (
  <Link
    href="/dashboard/portfolio"
    className="bg-white rounded-2xl border border-ink-200 p-6 hover:border-primary hover:shadow-sm transition-all"
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
        <FileText className="w-5 h-5 text-primary" />
      </div>
      <h3 className="text-p15 font-semibold text-ink-700">내 포트폴리오</h3>
    </div>
    <p className="text-p13 text-ink-400">시공 실적을 등록하고 관리하세요.</p>
  </Link>
)}
```

- [ ] **Step 4: 커밋**

```bash
git add src/middleware.ts src/app/contracts/[id]/page.tsx src/app/dashboard/page.tsx
git commit -m "feat: 계약 상세 리뷰 섹션·대시보드 포트폴리오 카드·미들웨어 업데이트"
```

---

## Task 8: 입찰 현황에서 SC 프로필 링크 연결

**Files:**
- Modify: SC 회사명이 표시되는 입찰 현황 페이지 (`src/app/notices/[id]/page.tsx` 또는 관련 Client Component)

- [ ] **Step 1: 입찰 현황 SC 이름을 링크로 변경**

`src/app/notices/[id]/page.tsx`에서 입찰자 목록을 렌더링하는 부분을 찾아 SC 회사명을 링크로 교체:

```typescript
// 기존: 텍스트로만 표시하던 부분
<span>{submission.company.name}</span>

// 변경: 공개 프로필 링크
<a
  href={`/company/${submission.companyId}`}
  className="text-primary hover:underline font-medium"
>
  {submission.company.name}
</a>
```

- [ ] **Step 2: 커밋**

```bash
git add src/app/notices/
git commit -m "feat: 입찰 현황 SC 회사명 → 공개 프로필 링크 연결"
```

---

## Task 9: 최종 배포 및 검증

- [ ] **Step 1: TypeScript 타입 체크**

```bash
npx tsc --noEmit
```

Expected: 에러 없음. 에러가 있으면 수정 후 재시도.

- [ ] **Step 2: ESLint 체크**

```bash
npx next lint --quiet
```

Expected: `✔ No ESLint warnings or errors`

- [ ] **Step 3: dev 서버에서 주요 흐름 확인**

```bash
npm run dev
```

확인 항목:
- SC 계정으로 `/dashboard/portfolio` 접근 → 포트폴리오 추가/수정/삭제
- GC 계정으로 입찰 현황 → SC 이름 클릭 → `/company/[companyId]`
- 탭 전환: 기본 정보 → 포트폴리오 → 리뷰
- GC + ACTIVE 계약 있을 때 리뷰 폼 표시
- 리뷰 제출 → 리뷰 탭에 반영

- [ ] **Step 4: GitHub 푸시 → Vercel 배포**

```bash
git push origin main
```

Vercel API로 배포 트리거 (GitHub 웹훅 미작동 시):
```bash
VERCEL_TOKEN="<REDACTED - use Deploy Hook instead>"
TEAM_ID="team_Ers8damRzOKzilbVR571GbtI"
SHA=$(git rev-parse HEAD)

curl -s -X POST "https://api.vercel.com/v13/deployments?teamId=$TEAM_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"cozi-con-website-2ano\",\"gitSource\":{\"type\":\"github\",\"repoId\":1212618947,\"ref\":\"main\",\"sha\":\"$SHA\"},\"target\":\"production\"}"
```

> ⚠️ 위 Vercel 토큰은 1시간 만료 토큰(`ci-deploy-temp`)이었으므로 만료됐을 수 있습니다. 만료 시 Vercel 대시보드에서 새 토큰 발급 후 사용하거나, Deploy Hook URL(`https://api.vercel.com/v1/integrations/deploy/prj_U1rfd9Gbu8PfGk3su8qRBiCZXzeP/YELQw8cIWJ`)로 트리거:
> ```bash
> curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_U1rfd9Gbu8PfGk3su8qRBiCZXzeP/YELQw8cIWJ"
> ```

- [ ] **Step 5: 세션 wrap-up 커밋**

```bash
git add -A
git commit -m "chore: Week 3 Phase A wrap-up (포트폴리오·리뷰 시스템)"
git push origin main
```
