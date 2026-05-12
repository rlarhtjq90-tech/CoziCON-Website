# HANDOFF
**agent:** claude | **project:** CoziCON-Website | **branch:** main | **commit:** 852ae8c
**created:** 2026-05-12 | **status:** active

## Context
Phase 1~4 + 대시보드 통계 카드(Day 14)까지 완료. 다음은 알림 시스템 또는 Blob 실제 저장 활성화.

## Immediate Next Steps
- [ ] 알림 시스템: 낙찰·계약 서명 완료 시 Resend 이메일 발송
- [ ] Vercel Blob 스토어 생성 → `BLOB_READ_WRITE_TOKEN` 환경변수 등록 (첨부파일 실제 저장)
- [ ] NTS API 타임아웃 원인 조사 (Vercel Function 리전 or API 측 문제)

## Active Files
- `src/app/dashboard/page.tsx` — 통계 카드 추가 완료

## Current State / Blockers
- BLOB_READ_WRITE_TOKEN 미설정 → 첨부파일 __mock__ URL 폴백 (실제 저장 안됨)
- 이메일 미수신: 도메인 SPF/DKIM 미설정 (Resend 발송은 됨, 수신 서버 차단)
- NTS API 15초 타임아웃 미해결
