# Changelog

## 현재 상태
<!-- /wrap이 매 세션 이 섹션을 업데이트합니다 -->
- **상태:** Phase 2 진입 — 입찰공고 시스템 코드 완성, UI 미검증 (개발 서버 재시작 필요)
- **주요 기능:**
  - 랜딩 페이지, 로그인/회원가입/대시보드 (NextAuth v4 + Prisma + Neon)
  - 회원가입 4단계: 이메일 OTP(Gmail SMTP) → 유형선택 → 정보입력 + 약관동의
  - 전문건설사 면허 종목 23종 다중선택 UI
  - DB: Company, CompanyVerification, License, TermsConsent, BidNotice, BidAttachment
  - 사업자 인증 `/verify-biz`, 건설업등록증 인증 `/verify-license`, 관리자 승인 큐 `/admin`
  - 회사 프로필 페이지 `/company/profile`: 조회/수정, 로고 업로드, 주력지역, 시공실적, 보유장비/인력
  - 입찰공고 게시판 `/notices` (목록/D-day 배지/예가 표시)
  - 공고 작성 `/notices/create` (공종·지역 멀티선택, 예가, 마감일, 임시저장)
  - 공고 상세 `/notices/[id]` (발주사 정보, 첨부파일, 작성자 수정 링크)
  - API: GET/POST `/api/notices`, GET/PATCH `/api/notices/[id]`
  - 대시보드에 "입찰공고" 바로가기 카드 추가
- **알려진 이슈:**
  - NTS API 15초 타임아웃 미해결 (실제 사업자 인증 시 실패 가능)
  - 로컬 로그인 에러 수정 완료(NEXTAUTH_SECRET 추가), 개발 서버 재시작 후 UI 검증 필요
  - Vercel 배포 미진행 (Phase 2 코드 프로덕션 미반영)

## 세션 로그
<!-- ⚠️ APPEND ONLY — 아래 항목을 절대 삭제/수정하지 마세요. 새 항목은 이 줄 바로 아래에 추가합니다. -->

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
