# HANDOFF
**agent:** claude | **project:** CoziCON-Website | **branch:** dev | **commit:** 42d9e5b
**created:** 2026-05-06 | **status:** active

## Context
Day 5 회사 프로필 페이지 코드 구현 완료. Prisma generate EPERM으로 dev 서버가 에러 상태 — 서버 재시작 후 브라우저 테스트 필요.

## Immediate Next Steps
- [ ] dev 서버 중지 → `npx prisma generate` 실행 → dev 서버 재시작
- [ ] `http://localhost:3000/login` 로그인 → `/dashboard` → "회사 프로필" 카드 클릭 확인
- [ ] `/company/profile` 에서 정보 수정(주소, 연락처, 주력지역 등) → 저장 동작 확인
- [ ] 로고 업로드 버튼 동작 확인 (BLOB_READ_WRITE_TOKEN 없으면 skipped 처리)
- [ ] 이상 없으면 dev → main 머지 + Vercel 배포

## Active Files
- src/app/company/profile/ProfileClient.tsx
- src/app/company/profile/page.tsx
- src/app/api/company/profile/route.ts
- src/app/api/company/logo/route.ts
- src/app/dashboard/page.tsx
- prisma/schema.prisma

## Current State / Blockers
Error: Jest worker encountered 2 child process exceptions, exceeding retry limit
원인: dev 서버 실행 중 prisma db push의 generate 단계에서 query_engine-windows.dll.node 파일이 잠겨 rename 실패 (EPERM).
해결: dev 서버 완전 종료 후 npx prisma generate 단독 실행.
