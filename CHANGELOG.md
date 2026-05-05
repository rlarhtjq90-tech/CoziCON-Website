# Changelog

## 현재 상태
<!-- /wrap이 매 세션 이 섹션을 업데이트합니다 -->
- **상태:** Day 3 구현 완료 (dev 브랜치) — Vercel 빌드 실패 중, 원인 미확인
- **주요 기능:**
  - 랜딩 페이지, 로그인/회원가입/대시보드 (NextAuth v4 + Prisma + Neon)
  - 회원가입 4단계: 이메일 OTP(Gmail SMTP) → 유형선택 → 정보입력 + 약관동의
  - 전문건설사 면허 종목 23종 다중선택 UI
  - DB: Company(businessVerified, bizDocUrl), CompanyVerification, TermsConsent
  - 사업자 인증 페이지 `/verify-biz`: 국세청 진위확인 → 사업자등록증 업로드 → Company 등록
  - 대시보드: PENDING/승인대기/정상 상태별 배너
  - JWT 세션에 userType, status, companyId 포함
- **알려진 이슈:**
  - Vercel 빌드 실패 (dev 브랜치 push 후 모든 Preview 환경 failure) — 원인 미확인
  - NTS_API_KEY 미설정 → 국세청 API 테스트 모드로 동작
  - BLOB_READ_WRITE_TOKEN 미설정 → 파일 업로드 없이 진행
  - Neon DB dev/prod 분리 미완료

## 세션 로그
<!-- ⚠️ APPEND ONLY — 아래 항목을 절대 삭제/수정하지 마세요. 새 항목은 이 줄 바로 아래에 추가합니다. -->

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
