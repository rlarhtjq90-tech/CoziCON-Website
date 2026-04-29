# HANDOFF
**agent:** claude | **project:** CoziCON-Website | **branch:** main | **commit:** 1c5e129
**created:** 2026-04-29 | **status:** active

## Context
NextAuth + Prisma + Neon 인증 시스템 구현 완료 후 배포했으나, NEXTAUTH_URL이 구 프로젝트 주소로 설정되어 로그인 에러 발생 중. URL 수정 후 재배포하면 해결된다.

## Immediate Next Steps
- [ ] Vercel 환경변수에서 NEXTAUTH_URL을 `https://cozi-con-website-2ano.vercel.app` 으로 수정
- [ ] 수정 후 Vercel에서 Redeploy 트리거 (또는 빈 커밋 push)
- [ ] /signup → /login → /dashboard 플로우 전체 테스트
- [ ] data.go.kr 국토교통부_건설업등록정보서비스 승인 후 면허 조회 API 정식 연동

## Active Files
- `src/app/login/page.tsx`
- `src/app/signup/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/lib/auth.ts`
- `prisma/schema.prisma`

## Current State / Blockers
NEXTAUTH_URL=https://cozi-con-website-lvsh.vercel.app 으로 설정되어 있으나 실제 프로젝트는 cozi-con-website-2ano.
Vercel 대시보드 Settings → Environment Variables 에서 NEXTAUTH_URL 값만 수정하면 해결.
Vercel CLI는 한글 계정명(김고섭) 버그로 직접 사용 불가 — 대시보드에서 직접 수정 필요.
