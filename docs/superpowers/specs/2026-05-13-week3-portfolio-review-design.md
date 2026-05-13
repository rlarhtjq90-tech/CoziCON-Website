# Week 3 설계 — SC 포트폴리오 + GC→SC 리뷰

**작성일:** 2026-05-13
**브랜치:** main
**범위:** Week 3 Phase A — 완료 계약 이후 흐름 완성

---

## 1. 목표

전문건설사(SC)가 시공 실적을 포트폴리오로 등록하고, 종합건설사(GC)가 계약 이후 SC를 평가할 수 있는 시스템을 구축한다. SC의 공개 프로필 페이지를 "명함" 역할로 강화해, GC가 입찰자 검토 시 포트폴리오·리뷰를 한 곳에서 확인할 수 있게 한다.

---

## 2. 사용자 흐름

```
[SC]
대시보드 → "내 포트폴리오 관리" 카드
  → /dashboard/portfolio
  → 실적 추가/수정/삭제 (공사명·발주처·기간·금액·공종·PDF)

[GC]
입찰 현황 → SC 회사명 클릭
  → /company/[companyId]?tab=portfolio   (포트폴리오 확인)
  → /company/[companyId]?tab=reviews     (리뷰 확인)

계약 상세 /contracts/[id]
  → 계약 ACTIVE 이상 + 리뷰 미작성이면 "리뷰 남기기" 버튼 표시
  → 별점(1~5) + 코멘트 인라인 폼 → 제출
```

---

## 3. DB 스키마

### 3-1. 신규 모델

```prisma
model Portfolio {
  id           String    @id @default(cuid())
  companyId    String
  title        String                    // 공사명
  client       String                    // 발주처
  startDate    DateTime
  endDate      DateTime
  amount       BigInt?                   // 공사금액 (원)
  workCategory String                    // 공종 (예: "토목공사업")
  description  String?   @db.Text
  docUrl       String?                   // 준공서류 PDF (Vercel Blob)
  createdAt    DateTime  @default(now())

  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
}

model CompanyReview {
  id                String   @id @default(cuid())
  contractId        String   @unique        // 계약당 1개 리뷰
  reviewerCompanyId String                  // GC companyId
  targetCompanyId   String                  // SC companyId
  rating            Int                     // 1~5
  comment           String?  @db.Text
  createdAt         DateTime @default(now())

  contract        Contract @relation(fields: [contractId], references: [id])
  reviewerCompany Company  @relation("ReviewsGiven",    fields: [reviewerCompanyId], references: [id])
  targetCompany   Company  @relation("ReviewsReceived", fields: [targetCompanyId],   references: [id])
}
```

### 3-2. 기존 모델 수정

**Company** — 관계 3개 추가:
```prisma
portfolios      Portfolio[]
reviewsGiven    CompanyReview[] @relation("ReviewsGiven")
reviewsReceived CompanyReview[] @relation("ReviewsReceived")
```

**Contract** — 관계 1개 추가:
```prisma
review CompanyReview?
```

---

## 4. API 설계

### 포트폴리오 (SC 인증 필요)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/portfolio` | 내 포트폴리오 목록 |
| POST | `/api/portfolio` | 새 실적 등록 |
| PATCH | `/api/portfolio/[id]` | 수정 (본인 소유 확인) |
| DELETE | `/api/portfolio/[id]` | 삭제 (본인 소유 확인) |

### 공개 프로필 (로그인 필요, 타입 무관)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/company/[companyId]` | 기본정보 + 면허 |
| GET | `/api/company/[companyId]/portfolio` | 포트폴리오 목록 |
| GET | `/api/company/[companyId]/reviews` | 리뷰 목록 (평균·개수 포함) |
| POST | `/api/company/[companyId]/reviews` | 리뷰 작성 (GC only) |

### 파일 업로드

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/upload/portfolio-doc` | PDF → Vercel Blob, URL 반환 |

### 권한 규칙

- **포트폴리오 CUD**: 세션 + SC 타입 + 본인 companyId 소유
- **리뷰 POST**: 세션 + GC 타입 + contractId의 gcCompanyId = 내 회사 + 계약 status ≠ PENDING + CompanyReview 미존재
- **리뷰 rating**: 1 이상 5 이하 정수 검증

---

## 5. 페이지 & 컴포넌트

### 5-1. `/company/[companyId]` — 공개 프로필 (신규)

Server Component. `searchParams.tab` 으로 활성 탭 결정 (기본: `info`).

```
CompanyPublicPage (Server)
├── CompanyHeader          — 회사명·타입 배지·지역·면허 목록
├── TabBar                 — info | portfolio | reviews (링크 기반)
├── [tab=info]   CompanyInfoSection    — 사업자번호·대표자·연락처·건설능력
├── [tab=portfolio] PortfolioList      — 카드: 공사명·발주처·기간·금액·PDF 링크
│                   EmptyState         — "등록된 실적이 없습니다"
└── [tab=reviews]   ReviewSummary      — 평균 별점·리뷰 수
                    ReviewList         — 리뷰 카드 (작성사·날짜·별점·코멘트)
                    ReviewForm         — GC + ACTIVE 계약 + 미작성인 경우만 렌더
```

### 5-2. `/dashboard/portfolio` — SC 포트폴리오 관리 (신규)

```
PortfolioManagePage (Server → Client)
├── 헤더: "내 포트폴리오" + "새 실적 추가" 버튼
├── PortfolioCardList      — 실적 카드 (수정·삭제 버튼)
└── PortfolioFormModal     — 추가/수정 공용 모달
     ├── 공사명 (필수)
     ├── 발주처 (필수)
     ├── 공사 기간 (startDate ~ endDate)
     ├── 공사금액 (선택, 숫자)
     ├── 공종 (텍스트 입력)
     ├── 공사 개요 (textarea, 선택)
     └── 준공서류 PDF 업로드 (Vercel Blob, 선택)
```

### 5-3. `/contracts/[id]` 수정

기존 계약 상세 페이지 하단에 **리뷰 섹션** 추가:
- 조건: `session.user`의 companyType = GC + 계약 status ∈ {ACTIVE, COMPLETED, TERMINATED} + `contract.review === null`
- 조건 충족 시: 별점 선택(★☆ 인터랙티브) + 코멘트 textarea + 제출 버튼
- 이미 작성한 경우: 내가 남긴 리뷰 카드 표시 (수정 불가)

### 5-4. 대시보드 카드 추가

SC 대시보드에 "내 포트폴리오 관리" 카드 추가 (`/dashboard/portfolio` 링크).

---

## 6. 파일 변경 목록

| 파일 | 작업 |
|------|------|
| `prisma/schema.prisma` | Portfolio, CompanyReview 모델 추가; Company·Contract 관계 추가 |
| `src/app/company/[companyId]/page.tsx` | 신규 — 공개 프로필 (Server) |
| `src/app/company/[companyId]/CompanyPublicClient.tsx` | 신규 — 탭·리뷰폼 Client Component |
| `src/app/dashboard/portfolio/page.tsx` | 신규 — 포트폴리오 관리 |
| `src/app/dashboard/portfolio/PortfolioClient.tsx` | 신규 — CRUD Client Component |
| `src/app/api/portfolio/route.ts` | 신규 — GET, POST |
| `src/app/api/portfolio/[id]/route.ts` | 신규 — PATCH, DELETE |
| `src/app/api/company/[companyId]/route.ts` | 신규 — 공개 프로필 GET |
| `src/app/api/company/[companyId]/portfolio/route.ts` | 신규 — 공개 포트폴리오 GET |
| `src/app/api/company/[companyId]/reviews/route.ts` | 신규 — 리뷰 GET, POST |
| `src/app/api/upload/portfolio-doc/route.ts` | 신규 — PDF Blob 업로드 |
| `src/app/contracts/[id]/page.tsx` | 수정 — 리뷰 섹션 추가 |
| `src/app/dashboard/page.tsx` | 수정 — SC 포트폴리오 카드 추가 |
| `src/middleware.ts` | 수정 — `/dashboard/portfolio` 보호 라우트 추가 |

---

## 7. 에러 처리

- 포트폴리오 PDF 업로드 실패: 업로드 없이 저장 허용 (docUrl = null)
- 리뷰 중복 작성: API에서 409 반환, 클라이언트에서 "이미 작성한 리뷰가 있습니다" 표시
- 타인 포트폴리오 수정 시도: 403 반환
- 존재하지 않는 companyId: 404 반환, notFound() 처리

---

## 8. 미포함 (YAGNI)

- SC → GC 역방향 리뷰
- 리뷰 수정/삭제
- 포트폴리오 공개/비공개 토글
- 리뷰 신고 기능
- 포트폴리오 이미지 갤러리 (Blob 미설정 상태이므로 PDF만)
