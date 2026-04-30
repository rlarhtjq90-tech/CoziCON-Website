# HANDOFF
**agent:** claude | **project:** CoziCON-Website | **branch:** main | **commit:** e0b417f
**created:** 2026-04-30 | **status:** active

## Context
인증 시스템 배포 완료됐으나 로그인 에러 미해결, 커스텀 도메인 cozicon.co.kr 연결도 미완료 상태.

## Immediate Next Steps
- [ ] Vercel 환경변수에서 NEXTAUTH_URL을 `https://cozi-con-website-2ano.vercel.app` 으로 수정 → Redeploy
- [ ] /signup → /login → /dashboard 플로우 전체 테스트
- [ ] 가비아(gabia.com)에서 `cozicon.co.kr` 도메인 구매
- [ ] 구매 후 Vercel Settings → Domains → `cozicon.co.kr` 추가 → DNS 설정
- [ ] data.go.kr 국토교통부_건설업등록정보서비스 승인 후 면허 조회 API 정식 연동

## Active Files
- `src/app/login/page.tsx`
- `src/app/signup/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/lib/auth.ts`
- `prisma/schema.prisma`

## Current State / Blockers
1. 로그인 에러: NEXTAUTH_URL=구 주소 → Vercel 환경변수에서 수정만 하면 해결
2. 도메인: cozicon.co.kr 미구매 상태 — 가비아에서 구매 후 Vercel에 추가
Vercel CLI는 한글 계정명 버그로 사용 불가 — 모든 설정은 Vercel 대시보드에서 직접 진행.
