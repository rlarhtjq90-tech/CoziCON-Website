# HANDOFF
**agent:** claude | **project:** CoziCON-Website | **branch:** main | **commit:** 2158fa8
**created:** 2026-05-12 | **status:** active

## Context
이메일 알림 코드는 완료됐으나 `RESEND_FROM_EMAIL`이 `onboarding@resend.dev` 샌드박스 상태라 기업 메일 수신 불가. 커스텀 도메인 등록이 필요하다.

## Immediate Next Steps
- [ ] cozicon.co.kr 도메인 구매 (가비아 or 후이즈)
- [ ] resend.com/domains → Add Domain → `cozicon.co.kr` 등록 + DNS(SPF/DKIM/DMARC) 추가 후 Verify
- [ ] Vercel 환경변수 `RESEND_FROM_EMAIL` → `noreply@cozicon.co.kr` 로 업데이트 후 재배포
- [ ] Vercel Blob 스토어 생성 → `BLOB_READ_WRITE_TOKEN` 등록 (첨부파일 실제 저장)
- [ ] (선택) admin/reject UI에 반려 사유 입력 필드 추가 (`reason` 파라미터 이미 지원)

## Active Files
- src/lib/email.ts
- src/app/api/admin/reject/route.ts

## Current State / Blockers
이메일 코드 완성, TS 타입 체크 통과. 샌드박스 제한으로 owner 이메일 외 수신 불가. 도메인 구매 + Resend 등록이 유일한 블로커.
