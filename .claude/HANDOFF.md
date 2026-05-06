# HANDOFF
**agent:** claude | **project:** CoziCON-Website | **branch:** main | **commit:** 520c80a
**created:** 2026-05-06 | **status:** active

## Context
Phase 2(입찰공고 시스템) 코드 구현 완료. 개발 서버 재시작 후 UI 검증 + Vercel 배포가 남아있음.

## Immediate Next Steps
- [ ] 개발 서버 재시작(`npm run dev`) 후 로컬 로그인 → `/notices` → `/notices/create` UI 검증
- [ ] GitHub 푸시 → Vercel 자동 배포 (Phase 2 프로덕션 반영)
- [ ] 공고 첨부파일 업로드 기능 구현 (`/api/notices/[id]/attachments`, Supabase Storage 연동)
- [ ] NTS API 15초 타임아웃 원인 조사 (Vercel Function 로그 확인)
- [ ] `/company/profile` E2E 검증 (실제 사업자 인증 완료 계정으로 테스트)

## Active Files
- src/app/notices/page.tsx
- src/app/notices/create/page.tsx
- src/app/notices/[id]/page.tsx
- src/app/api/notices/route.ts
- src/app/api/notices/[id]/route.ts
- prisma/schema.prisma

## Current State / Blockers
- 로컬 dev 서버: NEXTAUTH_SECRET 추가 완료, 재시작 필요 (Ctrl+C → `npm run dev`)
- Vercel 배포 미진행 — 현재 프로덕션은 Phase 1까지만 반영
- 첨부파일 업로드 UI는 `/notices/create`에 미구현 (Phase 2.5 예정)
