# HANDOFF
**agent:** claude | **project:** CoziCON-Website | **branch:** main | **commit:** 2e6a540
**created:** 2026-05-06 | **status:** active

## Context
Phase 3 입찰 제출 시스템과 첨부파일 업로드까지 구현 완료. 다음은 Vercel Blob 토큰 확인 및 중간 우선순위 작업 진행.

## Immediate Next Steps
- [ ] Vercel 대시보드 → cozi-con-website-2ano → Settings → Environment Variables → `BLOB_READ_WRITE_TOKEN` 존재 여부 확인 (없으면 Storage → Blob 스토어 생성)
- [ ] NTS API 15초 타임아웃 해결 (Vercel Function 로그 확인 → maxDuration 증가 또는 background job 전환)
- [ ] 입찰 알림 구현 (입찰 접수/낙찰 시 이메일 알림)
- [ ] Phase 4 기능 정의 (계약서 / 프로젝트 관리 등)

## Active Files
- `src/app/api/upload/notice-attachment/route.ts`
- `src/app/api/notices/route.ts`
- `src/app/notices/create/page.tsx`

## Current State / Blockers
`BLOB_READ_WRITE_TOKEN` 미설정 시 첨부파일이 mock URL(`__mock__/파일명`)로 저장됨 — 실제 파일 미저장. Vercel Blob 스토어 생성 후 토큰 주입 필요. Vercel MCP OAuth 인증 미완료(한글 사용자명 CLI 버그로 CLI 로그인 불가).
