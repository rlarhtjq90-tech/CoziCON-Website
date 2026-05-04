# Changelog

## 현재 상태
<!-- /wrap이 매 세션 이 섹션을 업데이트합니다 -->
- **상태:** Day 0 진행 중 — 국세청 API 신청 폼 자동 입력 완료 (버튼 클릭 대기), Claude in Chrome 페어링 완료
- **주요 기능:**
  - 랜딩 페이지: 공종별 입찰 → 프로세스 → 대상별 소개 → 핵심 기능 → 통계 → CTA
  - FinalCTA "종합/전문건설사로 시작하기" → /login 연결
  - 로그인/회원가입/대시보드 (NextAuth v4 + Prisma + Neon)
  - 이메일 OTP 인증 회원가입 (3단계, 3분 타이머, Gmail SMTP) — Gmail 정상 작동 확인
  - @sentry/nextjs 설치 + DSN/AUTH_TOKEN/ORG/PROJECT Vercel 환경변수 등록 완료
  - Playwright CDP + JS 직접 주입 기반 Chrome 자동화 스크립트 구축
- **알려진 이슈:**
  - 국세청 API 신청 폼 입력 완료 — Chrome에서 "활용신청" 버튼 클릭 필요 (자동승인)
  - Claude Code 재시작 후 Claude in Chrome 확장 연동 확인 필요
  - Neon DB dev/prod 분리 미완료
  - Supabase Storage 미생성

## 세션 로그
<!-- ⚠️ APPEND ONLY — 아래 항목을 절대 삭제/수정하지 마세요. 새 항목은 이 줄 바로 아래에 추가합니다. -->

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
