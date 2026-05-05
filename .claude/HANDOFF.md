# HANDOFF
**agent:** claude | **project:** CoziCON-Website | **branch:** dev | **commit:** 9adf910
**created:** 2026-05-05 11:30 | **status:** active

## Context
Day 3 사업자 인증 기능을 구현하고 dev 브랜치에 push했으나 Vercel Preview 빌드가 전부 failure 상태. 로컬 빌드는 정상이나 Vercel 측 오류 원인 미확인.

## Immediate Next Steps
- [ ] Vercel 빌드 실패 원인 파악 — Vercel 대시보드 Build Logs 직접 확인 (`dpl_961nF9E9mEzHuBXyUFbtufjTqRV7`)
- [ ] 빌드 수정 후 재배포 → `/verify-biz` 페이지 E2E 테스트
- [ ] Vercel 환경변수 추가: `NTS_API_KEY` (국세청), `BLOB_READ_WRITE_TOKEN` (Vercel Blob)
- [ ] Day 4: 건설업등록증 업로드 + 관리자 승인 큐 페이지

## Active Files
- `src/app/verify-biz/page.tsx`
- `src/app/api/verify-biz/route.ts`
- `src/app/api/upload/biz-doc/route.ts`
- `src/app/api/company/setup/route.ts`
- `prisma/schema.prisma`

## Current State / Blockers
Vercel 빌드 모두 failure. 로컬 `next build`는 성공. `@vercel/blob` 추가가 유일한 새 의존성.
Vercel 대시보드 → Build Logs 탭 → 빨간 줄 확인 필요.
CLI: `npx vercel login` 후 `npx vercel inspect dpl_961nF9E9mEzHuBXyUFbtufjTqRV7 --logs`
