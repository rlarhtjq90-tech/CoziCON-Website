# Changelog

## 현재 상태
<!-- /wrap이 매 세션 이 섹션을 업데이트합니다 -->
- **상태:** 배포 완료 — 인증 시스템 구현됨, 로그인 에러 해결 중
- **주요 기능:**
  - 랜딩 페이지 전체 섹션 구현 및 Vercel 배포
  - GNB 로그인 버튼 항상 표시, /login 페이지 연결
  - 로그인/회원가입/대시보드 페이지 (NextAuth v4 + Prisma + Neon)
  - /api/auth/[...nextauth]: NextAuth 핸들러
  - /api/auth/register: 회원가입 API (bcrypt 해시)
  - /dashboard: 로그인 필수 보호 라우트 (middleware)
  - VerifySection: 사업자번호 → 면허 조회 (KISCON GongsiReg 워크어라운드)
- **알려진 이슈:**
  - NEXTAUTH_URL이 구 프로젝트 주소로 설정 → 로그인 에러 발생 중
  - Vercel 프로젝트명: cozi-con-website-2ano (배포 URL 변경됨)
  - 해결: NEXTAUTH_URL을 https://cozi-con-website-2ano.vercel.app 으로 수정 후 재배포 필요
  - KISCON 근본 해결: data.go.kr 국토교통부_건설업등록정보서비스 별도 신청 필요

## 세션 로그
<!-- ⚠️ APPEND ONLY — 아래 항목을 절대 삭제/수정하지 마세요. 새 항목은 이 줄 바로 아래에 추가합니다. -->

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
