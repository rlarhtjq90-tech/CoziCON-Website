# HANDOFF
**agent:** claude | **project:** CoziCON-Website | **branch:** dev | **commit:** 57db2b3
**created:** 2026-05-06 | **status:** active

## Context
NTS 사업자등록정보 진위확인 API가 승인된 키와 올바른 요청 형식(b_no+start_dt)으로도 15초 내 응답하지 않아 실사 검증이 불가능한 상태. 현재 타임아웃 시 테스트 통과 처리로 폴백 중.

## Immediate Next Steps
- [ ] data.go.kr 마이페이지 → 오픈API 활용신청 목록에서 NTS 사업자등록정보 진위확인 API 활용기간 확인 (만료 여부)
- [ ] 타임아웃 해소 후 실사 검증 재시도 (사업자번호 823-87-01344, 개업일자 20181215)
- [ ] Vercel `ADMIN_EMAILS=rlarhtjq90@gmail.com` 환경변수 등록
- [ ] E2E 전체 플로우 검증 (verify-biz → verify-license → /admin 승인)
- [ ] Day 5: 회사 프로필 페이지 구현

## Active Files
- src/app/api/verify-biz/route.ts
- src/app/verify-biz/page.tsx

## Current State / Blockers
NTS API 타임아웃: `DOMException [TimeoutError]`, Vercel Execution Duration 15.58s/20s. data.go.kr 로그인 필요 — 사용자가 직접 활용기간 확인해야 함.
실제 Vercel 프로젝트: `cozi-con-website-2ano` (cozi-con-website 아님).
