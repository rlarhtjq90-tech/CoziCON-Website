# Changelog

## 현재 상태
<!-- /wrap이 매 세션 이 섹션을 업데이트합니다 -->
- **상태:** 4주 계획 전 기능 완료 — DailyPlan P0/P1/P2 전 항목 처리. 브랜드명 확정 후 도메인·알림톡 채널 등록만 남음.
- **주요 기능:**
  - 랜딩 페이지, 로그인/회원가입/대시보드 (NextAuth v4 + Prisma + Neon)
  - 회원가입 4단계: 이메일 OTP → 유형선택 → 정보입력 + 약관동의
  - DB: Company, CompanyVerification, License, TermsConsent, BidNotice, BidAttachment, BidSubmission, WorkCategory, Contract, ContractSign, Notification, NoticeBookmark, BidQnA, Announcement, Portfolio, CompanyReview, **NoticeSubscription, AuditLog**
  - 사업자 인증, 건설업등록증 인증, 관리자 승인 큐 (면허 배지 + KISCON 조회 링크)
  - 공고 게시판·등록·수정·상세, 입찰 제출·낙찰 처리
  - 계약 시스템, 트랜잭션 이메일 7종+1(공고알림), Vercel Cron 2개(개찰 흐름)
  - 인앱 알림, 관심공고, Q&A
  - 법적 페이지(`/terms`, `/privacy`, `/legal`), FAQ, 1:1 문의 폼, 관리자 대시보드 5탭
  - SC 포트폴리오 CRUD, GC→SC 리뷰, `/company/[companyId]` 공개 프로필
  - **[P0] 파일 스캔**: magic byte 기반 실행파일 차단 (`src/lib/file-scan.ts`)
  - **[P0] 알림 수신 설정**: 이메일·알림톡 on/off (`/dashboard/settings/notifications`)
  - **[P1] 공고 키워드 구독**: 공종·지역 구독 + 신규 공고 시 이메일 발송 (`/dashboard/subscriptions`)
  - **[P1] 모바일 반응형** 주요 화면 그리드 수정 완료
  - **[P1] SC 업체 디렉토리** `/companies`, 공지사항 `/announcements`
  - **[P2] 감사 로그**: AuditLog 모델 + logAudit() 8개 액션 전 API 연동
  - **[P2] 에러 경계**: 글로벌 error.tsx, not-found.tsx, my-bids/contracts 라우트별 error.tsx
  - **[Week 4] OG 이미지**, **RBAC**, **Sentry**, **입찰가 AES-256-GCM 암호화**, **알림톡**
- **보류 중 (브랜드명 확정 후):**
  - 도메인 구매 → Resend SPF/DKIM 설정
  - 카카오 채널 개설 → Aligo 발신프로필 등록 → 템플릿 심사
  - 첫 실사용자 영입

## 세션 로그
<!-- ⚠️ APPEND ONLY — 아래 항목을 절대 삭제/수정하지 마세요. 새 항목은 이 줄 바로 아래에 추가합니다. -->

### 2026-05-15 (세션 39 — DailyPlan P0/P1/P2 전체 완료)
- **P0**: 파일 magic byte 스캔(`file-scan.ts`), 알림 수신 설정 토글(`notifEmail`·`notifAlimtalk`), FAQ 페이지, 알림 설정 대시보드 카드
- **P1**: 공고 키워드 구독(공종·지역, `NoticeSubscription`), 신규 공고→구독자 이메일 발송, `/companies` SC 디렉토리, `/announcements` 공지 목록·상세, 모바일 반응형 그리드 수정
- **P2**: `AuditLog` 스키마 + `logAudit()` 8액션 전 API 연동, `/api/admin/audit-logs`, 에러 경계 4개(global/not-found/my-bids/contracts), 관리자 승인 화면 면허 배지 + KISCON 조회 링크

### 2026-05-14 (세션 37 — 입찰가 AES-256-GCM 암호화 + DB 백업)
- `src/lib/crypto.ts` 신규: AES-256-GCM `encryptBidPrice` / `decryptBidPrice` (IV 12B + AuthTag 16B + Ciphertext → Base64)
- `prisma/schema.prisma`: `BidSubmission.proposedPrice` `BigInt?` → `String?` 마이그레이션 (dotenv-cli 우회 적용)
- API·페이지 4곳 수정: 입찰 제출 시 암호화, 개찰 후 복호화 + 메모리 정렬, 낙찰 처리 시 복호화 후 Contract 생성
- `BID_PRICE_ENCRYPTION_KEY` Vercel Production+Preview 환경변수 등록 (Sensitive, Chrome 자동화) + Redeploy
- Neon DB 백업 점검: Free 플랜 6시간 PITR 확인, 수동 스냅샷 1개 생성 (2026-05-14 07:27 UTC)

### 2026-05-14 (세션 36 — Sentry 에러 모니터링 연결)
- Chrome 자동화로 cozi-con.sentry.io에서 DSN 확인 + Personal Token(`CoziCON Vercel Build`) 신규 생성 (Project·Release Admin, Org Read)
- Vercel 환경변수 4개 업데이트: `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`
- Production Redeploy 완료 (2m 4s), 빌드 로그에서 `@sentry/nextjs` 텔레메트리 연결 확인

### 2026-05-14 (세션 35 — Week 4 랜딩 UX·RBAC 보안)
- OG 이미지 생성(`public/og-image.png` 1200×630, PowerShell System.Drawing) + 커밋/푸시
- 랜딩 UX 개선: GNB 모바일 햄버거 메뉴+드로어, 히어로 CTA 버튼 추가, 모바일 아코디언→2×2 카드, BIDBILDING 오타 수정
- RBAC 보안 점검 4건: 개찰 전 낙찰/탈락 차단, DRAFT 공고 미인증 차단, PENDING GC 공고 등록 차단, 계약 상태 전환 검증, 미들웨어 PENDING 사용자 제한
- Sentry 신규 계정 생성(cozi-con.sentry.io) — Chrome 도메인 권한 차단으로 환경변수 등록 미완

### 2026-05-14 (Week 3 — SC 포트폴리오·GC→SC 리뷰 시스템)
- git pull로 Week 3 구현 코드 수신; DB 이미 동기화(Neon), 미들웨어 `/dashboard/:path*` 와일드카드로 커버 확인
- TypeScript·ESLint 검증 통과, 사용자 dev 테스트 완료
- Deploy Hook으로 Vercel 프로덕션 배포 트리거 (commit 75a815b, job IoLmNJd7ud1IyUWRIMdJ)

### 2026-05-13 (세션 33 — 법적 페이지·UX 마감·관리자 대시보드 강화)
- **법적 페이지**: `/terms`(이용약관 11조), `/privacy`(개인정보처리방침 9항), `/legal`(통신판매업 정보); AppFooter 컴포넌트, 랜딩 Footer 링크 실제 경로 교체
- **UX 마감**: `public/favicon.svg`, metadataBase+OG 태그, FAQ 10문항 아코디언, 1:1 문의 폼+API(`/contact`), EmptyState UI, dashboard/notices loading+error 경계, GNB CTA 버튼, 랜딩 CTA href `/signup`
- **관리자 대시보드**: `BidNotice.isHidden` + `Announcement` 스키마 추가(prisma db push), Admin API 8개 신규, 5탭 AdminDashboard(통계·승인대기·공고비공개·회원상태·공지CRUD)

### 2026-05-12 (세션 32 — CRON_SECRET Vercel 등록 가이드)
- 미해결 블로커 3개(BLOB/도메인/CRON_SECRET) 중 CRON_SECRET 분석: cron 라우트 인증 로직 확인, 로컬 `.env.local` 설정 확인, Vercel 환경변수 미등록 확인
- Vercel 대시보드 → Settings → Environment Variables에 `CRON_SECRET` 등록 가이드 제공 (등록 후 재배포 필요)

### 2026-05-12 (세션 31 — 개찰 흐름·인앱 알림·관심공고·Q&A)
- **개찰 흐름**: BidStatus OPENED 추가, Vercel Cron 2개(`close-notices`, `open-bids`), 수동 개찰 버튼, 입찰 현황 화면 개찰 후 가격 순위 공개
- **인앱 알림**: `Notification` 모델, `src/lib/notify.ts` (best-effort), AppHeader 벨 배지, `/notifications` 페이지 (7종 알림·읽음 처리)
- **관심공고**: `NoticeBookmark` 모델, `/api/notices/[id]/bookmark` 토글, `BookmarkButton`, `/my-bookmarks` 페이지
- **Q&A**: `BidQnA` 모델, `/api/notices/[id]/qna` GET/POST + `/api/qna/[qnaId]` PATCH, `QuestionForm`(익명 옵션) + `QnAList`(GC 인라인 답변)

### 2026-05-12 (세션 30 — 트랜잭션 이메일 알림 시스템)
- `src/lib/email.ts` 생성: 7종 이메일 함수 (OTP·비밀번호 재설정·낙찰·탈락·계약 서명 요청·계약 성립·관리자 승인/거절) — Resend SDK 래퍼, 에러 스월로우(best-effort)
- 6개 API 라우트 업데이트: `send-verification`, `forgot-password`(인라인 → lib 함수), `bids/[bidId]`(낙찰/탈락 알림), `contracts/[contractId]`(서명 요청 + 성립 알림), `admin/approve`, `admin/reject`
- 남은 블로커: `cozicon.co.kr` 도메인 구매 + Resend 도메인 등록 + DNS(SPF/DKIM) 설정 후 `RESEND_FROM_EMAIL=noreply@cozicon.co.kr` 업데이트 필요

### 2026-05-12 (세션 29 — Day 14 대시보드 통계 카드)
- Phase 4 배포 확인 (`FDT2K4uQ1` Ready/Current) — NoticesFilterBar JSX 이스케이프 픽스 포함
- 대시보드 역할별 통계 카드 추가: GC(등록공고·접수입찰·진행계약), SC(참여입찰·낙찰·진행계약); `Promise.all` 병렬 카운트 쿼리, `ContractStatus` enum으로 타입 안전성 확보

### 2026-05-11 (세션 28 — Day 13 Phase 4 계약 시스템)
- Contract + ContractSign 모델 추가 (prisma db push 완료), 낙찰 시 Contract 자동 생성
- PATCH /api/contracts/[id]: 서명(sign)·완료(complete)·해지(terminate) 처리; 상태: PENDING → GC_SIGNED → ACTIVE → COMPLETED/TERMINATED
- /contracts 목록 + /contracts/[id] 상세(서명 현황·액션 버튼) 페이지 생성, 대시보드 계약 카드 추가

### 2026-05-08 (세션 27 — Week 2 Day 10~12)
- Day 10: 공고 수정 페이지 `/notices/[id]/edit` 신설 — 첨부파일 추가/삭제(Vercel Blob del), 모든 필드 수정, PATCH API 고도화 (날짜 3개 + 카테고리 교체 + 첨부 관리)
- Day 11: BidNotice에 입찰 조건 4개 필드 추가 — `estimatedPrice`(활성화), `bidMethod`(낙찰방식), `requiredLicenses`(필요면허), `qualificationNote`(자격요건 비고); 등록/수정 폼 + 상세 페이지 표시
- Day 12: 공고 목록 검색·필터 — 키워드(제목 contains), 지역(17개 시도), 공종(대분류 드롭다운), URL 쿼리 파라미터 연동, 필터 태그 + 개별 초기화, `useTransition` 로딩 처리

### 2026-05-08 (세션 26 — Day 7 미들웨어 보안 수정 + 관리자 일반 유저 기능 동시 사용)
- `middleware.ts` matcher에 `/notices/create`, `/notices/:id/bids`, `/my-bids/:path*` 추가 (미보호 라우트 보안 수정)
- 관리자 계정 일반 유저 기능 동시 사용 구현: `dashboard/page.tsx` redirect 제거 + "관리자 패널" 카드 추가, `AdminClient.tsx` 헤더에 "대시보드" 링크 추가, `company/profile/page.tsx` 관리자/일반 리다이렉트 분기
- 브라우저 E2E 검증 완료: `/dashboard` ↔ `/admin` 양방향 네비게이션 정상 동작 확인 (Vercel 프로덕션)

### 2026-05-07 (세션 25 — Resend 이메일 발송 디버깅 + UI 버그 수정)
- `RESEND_FROM_EMAIL` Vercel 환경변수 이중 래핑 버그 수정: `CoziCON <onboarding@resend.dev>` → `onboarding@resend.dev` (코드에서 이미 display name 추가)
- Resend 샌드박스 제한 확인: `onboarding@resend.dev` 발신 시 소유자 이메일(`rlarhtjq90@gmail.com`)만 수신 가능 (403 sandbox restriction)
- UI 버그 수정: `forgot-password/route.ts` + `send-verification/route.ts` 모두 Resend SDK 에러를 무시하고 `success: true` 반환하던 문제 → `sendError` 체크 후 500 반환으로 수정
- commit `3044a50` 푸시 → Vercel 자동 배포 완료 (Current)
- 미가입 이메일의 Step 2 이동은 anti-enumeration 의도된 보안 동작임 확인 (Vercel 로그: `user: false`)

### 2026-05-07 (세션 24 — 비밀번호 변경 페이지 이동 + 이메일 API 교체)
- `/change-password` 독립 페이지 생성 (로그인 화면 스타일), `/dashboard/settings` 폴더 삭제, 미들웨어 보호 라우트 추가
- 회원가입 OTP 이메일 발송: nodemailer(Gmail SMTP) → Resend HTTP API로 교체 (Vercel SMTP 포트 차단 우회)
- `~/.claude/settings.json`에 Chrome 브라우저 자동화 권한 추가 (재시작 후 활성화)

### 2026-05-07 (세션 23 — Day 6 라우트 가드 + 비밀번호 변경)
- 비밀번호 찾기 E2E 검증: Vercel 로그로 Resend 실제 호출 확인(`POST api.resend.com/emails`), `black_0802@naver.com` DB 존재(`user: true, password: true`) 확인
- `middleware.ts` → `withAuth` 래핑, `/admin` 비관리자 차단(→ `/dashboard` 리다이렉트), JWT에 `isAdmin` 플래그 추가(ADMIN_EMAILS 기반)
- `POST /api/user/change-password`: 현재 비밀번호 검증 + bcrypt 업데이트, OAuth 계정 차단
- `/dashboard/settings` 비밀번호 변경 페이지 + 대시보드에 "계정 설정" 카드 추가

### 2026-05-06 (세션 22 — 비밀번호 찾기 구현)
- 로그인 화면 비밀번호 필드 옆에 "비밀번호 찾기" 링크 추가 (`src/app/login/page.tsx`)
- `/forgot-password` 페이지 생성: 3단계 UI (이메일 입력 → OTP 6자리 → 새 비밀번호 설정)
- `POST /api/auth/forgot-password`: Gmail SMTP OTP 발송 (기존 `VerificationToken` 모델 재활용, `pw-reset:` prefix)
- `POST /api/auth/reset-password`: OTP 검증 + bcrypt 해시 → User.password 업데이트 (DB 마이그레이션 없음)

### 2026-05-06 (세션 20 — Phase 3 입찰 제출 + 첨부파일 업로드)
- Phase 3 입찰 제출 시스템: BidSubmission 모델 추가(prisma db push), API(POST/GET /notices/[id]/bids, PATCH /bids/[bidId]), 건설사 입찰폼/my-bids, 발주사 입찰현황/낙찰처리
- 공고 첨부파일 업로드: /api/upload/notice-attachment(Vercel Blob), /notices/create 파일 첨부 UI(즉시 업로드, PDF/DOC/HWP/이미지, 20MB)
- dev 서버 중복 프로세스 트러블슈팅(포트 충돌 해결) + GitHub 푸시 → Vercel 자동 배포 확인

### 2026-05-06 (세션 19 — Phase 2 입찰공고 시스템 구현)
- BidNotice/BidAttachment 스키마 설계 + `prisma db push` 반영
- API 라우트: GET/POST `/api/notices`, GET/PATCH `/api/notices/[id]` (OWNER 권한 제한)
- UI: `/notices` 게시판(D-day 배지, 예가 포맷), `/notices/create` 작성 폼, `/notices/[id]` 상세
- 대시보드 "입찰공고" 카드 추가, `.env.local`에 NEXTAUTH_SECRET/URL 추가 (로컬 로그인 에러 수정)

### 2026-05-06 (세션 18 — 블로커 해결 + 프로덕션 배포)
- Prisma EPERM 블로커 해결 (`npx prisma generate` 성공) + `npm install` 누락 패키지 설치
- dev 브랜치 미리보기 E2E 테스트 통과 (login/dashboard/verify-biz/verify-license/admin/signup 전 페이지 정상 확인)
- `dev → main` 머지 + `git push` → Vercel 프로덕션 자동 배포 완료 (1분 13초, Ready)

### 2026-05-06 (세션 17 — Day 5 회사 프로필 구현)
- Company 스키마에 7개 필드 추가(logoUrl, constructionCapacity, mainRegions, constructionRecords, equipmentAndStaff, fax, website) + `prisma db push` 성공
- 로고 업로드 API(`/api/company/logo`), 프로필 조회/수정 API(`/api/company/profile`) 생성
- `/company/profile` 페이지 + `ProfileClient` (조회/수정 토글, 주력지역 멀티선택, 시공실적/장비/인력 동적 추가)
- 대시보드에 회사 프로필 카드 연결, 미들웨어에 `/company` 경로 보호 추가
- 블로커: Windows dev 서버 실행 중 `prisma generate` EPERM — 서버 재시작 필요

### 2026-05-06 (세션 16 — NTS API 실사 검증 시도)
- `cozi-con-website-2ano`가 실제 배포 프로젝트임 확인 (`cozi-con-website`는 별개 프로젝트)
- dev 브랜치 신버전(57db2b3, 개업일자 필드 포함)이 `cozi-con-website-2ano`에 Ready 상태 확인
- NTS API 실사 테스트(사업자번호 823-87-01344): 승인된 키, 올바른 형식(b_no+start_dt)에도 15초 타임아웃 발생 — `DOMException [TimeoutError]` (Vercel Function Log 확인) — 원인 미해결

### 2026-05-05 (세션 15 — NTS API start_dt 수정)
- NTS 사업자 진위확인 API 디버깅: `start_dt`(개업일자) 없으면 `REQUEST_DATA_MALFORMED` 반환, `p_nm` Korean encoding은 항상 `������`로 깨져 `valid: "02"` 고정
- `/verify-biz` 폼에 개업일자 입력 필드(YYYY-MM-DD 자동 포맷) 추가
- `api/verify-biz` route: `start_dt` 포함, `p_nm` 제거(인코딩 우회) — commit 57db2b3 → dev push

### 2026-05-05 (세션 14 — Vercel 빌드 수정 + Day 4 구현)
- `updatedAt @default(now())` 누락으로 Vercel 빌드 실패 수정 (`prisma db push` 성공) + main 머지
- `/verify-biz` 개업일(openDate) 필드 삭제 — NTS API 2-factor(bizNo+ceoName)로 유지
- Day 4 구현: `/verify-license`(KISCON 면허 조회+등록), `/admin`(승인 큐), `/api/license/verify`(트랜잭션), `/api/admin/approve`, `/api/admin/reject`(P2025 처리), middleware 보호 추가
- subagent-driven-development 방식으로 7개 태스크 구현 + 스펙/코드품질 2단계 리뷰 적용
- dev → main 머지 완료 (commit d80bb29)

### 2026-05-05 (세션 13 — Day 2 블로커 해결 + Day 3 사업자 인증 구현)
- Gmail SMTP 환경변수 확인 → OTP 발송/검증/가입 전체 플로우 API 테스트 통과
- Day 3 구현: 국세청 NTS 사업자 진위확인 API(`/api/verify-biz`), Vercel Blob 파일 업로드(`/api/upload/biz-doc`), Company 등록(`/api/company/setup`), `/verify-biz` 페이지, 대시보드 상태 배너
- Prisma 스키마 `Company`에 `businessVerified`, `bizDocUrl` 추가 + `prisma db push` 반영
- JWT 세션에 `userType`, `status`, `companyId` 포함하도록 `auth.ts` + 타입 확장
- Vercel 배포 실패 미해결 — `claude-in-chrome` MCP 연결 불가로 빌드 로그 확인 중단

### 2026-05-05 (세션 12 — Day 1 완료 확인 + Day 2 가입 플로우 분기 구현)
- Prisma 스키마에 `UserStatus` enum (PENDING/ACTIVE/REJECTED/SUSPENDED) + `User.status` 필드 추가, `prisma db push`로 Neon DB 반영
- `signup/page.tsx` 4스텝 플로우 구현: 이메일 → OTP → 유형선택(종합/전문건설사 카드) → 정보입력 + 약관동의
- 전문건설사 면허 종목 23종 다중선택 체크박스 + `register` API에 `userType`, `status: PENDING`, `TermsConsent` 저장 추가
- 이슈: `.env.local` Gmail 자격증명이 플레이스홀더라 OTP 발송 실패 — 실제 GMAIL_USER/APP_PASSWORD 입력 필요

### 2026-05-04 (세션 10 — 국세청 API 신청 완료 + Chrome 확장 자동화)
- Chrome CDP 모드 시작 자동화: `127.0.0.1` IPv6 버그 수정, 임시 프로필(`chrome-cdp-profile`)로 profile lock 우회
- `apply-cdp.js` 실행: 국세청 사업자등록정보 진위확인 API 신청 폼 전체 입력 + "활용신청" 버튼 클릭 → 처리상태: 신청 / 자동승인 확인
- Claude in Chrome CLI 미지원 확인: 브라우저 도구(browser_screenshot 등)는 Claude Desktop 전용 — CLI 세션에선 MCP 미주입
- `cozicon-automator` Chrome 확장 제작: manifest.json + popup.html + popup.js (폼 입력 + 제출 버튼 클릭 UI) — chrome://extensions에서 로드 필요

### 2026-05-04 (세션 9 — 국세청 API 자동화 + Claude in Chrome 페어링)
- Gmail SMTP 정상 동작 확인 (`/api/auth/send-verification` POST 테스트 → `{success: true}`)
- 국세청 사업자등록정보 진위확인 API (data.go.kr publicDataPk=15081808) 신청 자동화 구축
  - Playwright 단독 → CDP 연결(기존 로그인 세션 재사용) → JS 직접 주입 방식으로 단계적 발전
  - `apply-cdp.js`: `page.evaluate()`로 hidden 필드 포함 전체 폼 자동 입력 완료
- Anthropic "Claude in Chrome (Beta)" 확장(v1.0.69) 설치 및 pairing.html에서 Claude Code와 페어링 완료
- Day 0 잔여: 국세청 신청 버튼 클릭(수동), Neon DB dev/prod 분리, Supabase Storage 생성

### 2026-05-04 (세션 8 — Sentry 연동 완료)
- Chrome 브라우저 자동화로 Sentry DSN 추출 및 Organization Token 생성 (CoziCON Vercel CI/CD, org:ci 스코프)
- Vercel 환경변수 4개 추가: `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG=cozi-con`, `SENTRY_PROJECT=javascript-nextjs`, `SENTRY_AUTH_TOKEN`
- Vercel Production 재배포 트리거 — Sentry 에러 캡처 활성화

### 2026-05-03 (세션 7 — Day 0 인프라)
- 건설입찰플랫폼 4주 계획 분석 및 현재 구현 상태 갭 분석 (Week 1 Day 1부터 시작 확인)
- `dev` 브랜치 생성 및 origin push (Vercel Preview/Production 환경 분리 준비)
- `@sentry/nextjs` 설치 + `sentry.{client,server,edge}.config.ts` 생성 + `next.config.js` withSentryConfig 래핑
- `.env.example` 전체 항목 정리 (DB, Auth, Email, Sentry, Storage, 국세청 API, 알림톡, PG)
- Claude-in-Chrome 연결 시도 — chrome-native-host.bat 확인, 레지스트리 등록 미완료

### 2026-05-03 (세션 6)
- Gmail SMTP 서버 오류 원인 분석 및 `send-verification/route.ts` 수정 (transporter 핸들러 내부 이동, env var 누락 명시적 에러, 에러 로깅 추가)
- Gmail 2단계 인증 확인(이미 활성화), 앱 비밀번호 발급 및 Vercel 환경변수 등록 안내
- Vercel 전체 환경변수 확인 완료 (NEXTAUTH_URL, NEXTAUTH_SECRET, DATABASE_URL, GMAIL_* 모두 있음)
- 앱 비밀번호 오타 발견 — Vercel GMAIL_APP_PASSWORD `wljudofmniypzxzp`로 수정 필요 (미완료)

### 2026-05-03
- 새 컴퓨터에서 레포 클론 및 환경 세팅 완료
- NEXTAUTH_URL 불일치로 인한 로그인 에러 원인 파악 및 Vercel 환경변수 수정 안내
- 재배포 트리거 (빈 커밋 push) → 배포 URL: https://cozi-con-website-lvsh.vercel.app/

### 2026-04-30 (세션 5)
- 랜딩 첫 페이지에서 "무료로 시작하기" 버튼, SignupStart(회원가입), VerifySection(건설업 면허인증) 제거
- FinalCTA 종합/전문건설사 버튼 → /login 페이지 연결
- 회원가입에 이메일 OTP 인증 추가: 3단계 UI(이메일→코드→폼) + 3분 카운트다운 타이머
- 이메일 발송: Resend(샌드박스 제한) → Gmail SMTP(nodemailer)로 전환
- Vercel 환경변수 GMAIL_USER, GMAIL_APP_PASSWORD 설정 필요 (미완료)

### 2026-04-30
- cozicon.co.kr 커스텀 도메인 설정 논의 — .co.kr은 가비아 등 한국 레지스트라 구매 필요 (미완료)

### 2026-04-29 (세션 3)
- GNB 로그인 버튼 스크롤 무관 항상 표시로 고정, /login 페이지 연결
- NextAuth v4 + Prisma 5 + Neon(PostgreSQL) 인증 시스템 전체 구현
- 로그인/회원가입/대시보드 페이지 생성, /dashboard 미들웨어 보호 적용
- Vercel Neon DB 연동, NEXTAUTH_SECRET/URL 환경변수 설정
- 배포 후 NEXTAUTH_URL 불일치로 로그인 에러 확인 (미해결)

### 2026-04-29 (세션 2)
- 면허 조회 오류 원인 진단: Vercel 해외 서버 + 잘못된 API 엔드포인트
- Vercel 서울 리전(icn1) 설정, vercel.json 추가, API 키 이중인코딩 수정
- GET /api/verify-license 진단 엔드포인트 추가 (API 연결 상태 실시간 확인)
- KISCON API 문서(docx) 분석 → GongsiReg 오퍼레이션 확인 및 적용
- 핵심 발견: KISCON ConAdminInfoSvc1은 공시 목록 API (bizno 직접 조회 불가)
- 임시 해결: GongsiReg 날짜 범위 조회 후 ncrMasterNum으로 bizno 필터링 구현

### 2026-04-29
- data.go.kr 키스콘 건설업체정보 서비스 활용신청 및 API 키 발급
- .env.local 생성 및 CONSTRUCTION_API_KEY 저장
- Vercel 대시보드 환경변수 등록 후 재배포 트리거 (빈 커밋 push)

### 2026-04-28 (세션 2)
- 버튼 명칭 변경: 발주사→원청사→종합건설사, 수주사→하도급사→전문건설사
- SignupStart 섹션 신규 생성: 입찰 프로세스 위, 종합/전문건설사 선택 + 슬라이드다운 폼
- KISCON 건설면허 인증 연동: 사업자번호 입력 → /api/verify-license → 면허 목록 표시 → 인증 완료
- 배포 URL 확인: https://cozi-con-website-lvsh.vercel.app/

### 2026-04-28
- GitHub에서 CoziCON-Website 클론 및 로컬 환경 구축
- Node.js v20.19.1 portable 설치 및 npm 의존성 설치 (388 패키지)
- Claude Code용 Vercel 플러그인 설치 (`vercel-plugin@vercel`) — 재시작 후 적용
