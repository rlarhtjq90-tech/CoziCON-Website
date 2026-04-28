# Changelog

## 현재 상태
<!-- /wrap이 매 세션 이 섹션을 업데이트합니다 -->
- **상태:** 개발 중 — Vercel 배포 완료, KISCON API 키 미설정 (Mock 데이터로 동작)
- **주요 기능:**
  - 랜딩 페이지 전체 섹션 (WorkType, SignupStart, Process, DualAudience, VerifySection, Features, Statistics, FinalCTA)
  - SignupStart: 종합건설사/전문건설사 선택 → 사업자번호 입력 → KISCON 건설면허 조회 → 인증 완료
  - /api/verify-license: 국토교통부 공공데이터포털 KISCON API 연동 (Mock 폴백 포함)
- **알려진 이슈:** CONSTRUCTION_API_KEY 미설정 — data.go.kr에서 API 키 발급 후 Vercel 환경변수 등록 필요

## 세션 로그
<!-- ⚠️ APPEND ONLY — 아래 항목을 절대 삭제/수정하지 마세요. 새 항목은 이 줄 바로 아래에 추가합니다. -->

### 2026-04-28 (세션 2)
- 버튼 명칭 변경: 발주사→원청사→종합건설사, 수주사→하도급사→전문건설사
- SignupStart 섹션 신규 생성: 입찰 프로세스 위, 종합/전문건설사 선택 + 슬라이드다운 폼
- KISCON 건설면허 인증 연동: 사업자번호 입력 → /api/verify-license → 면허 목록 표시 → 인증 완료
- 배포 URL 확인: https://cozi-con-website-lvsh.vercel.app/

### 2026-04-28
- GitHub에서 CoziCON-Website 클론 및 로컬 환경 구축
- Node.js v20.19.1 portable 설치 및 npm 의존성 설치 (388 패키지)
- Claude Code용 Vercel 플러그인 설치 (`vercel-plugin@vercel`) — 재시작 후 적용
