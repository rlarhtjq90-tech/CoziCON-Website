# HANDOFF
**agent:** claude | **project:** CoziCON-Website | **branch:** main | **commit:** 9d3963b
**created:** 2026-05-11 | **status:** active

## Context
Phase 1~4 모두 완료. 다음 단계는 블로커 해결(BLOB 토큰) 후 알림 시스템 또는 대시보드 통계.

## Immediate Next Steps
- [ ] Vercel Blob 스토어 생성 → `BLOB_READ_WRITE_TOKEN` `.env.local` + Vercel 환경변수 등록 (첨부파일 실제 저장 활성화)
- [ ] 알림 시스템: 낙찰·계약 서명 완료 시 Resend 이메일 발송
- [ ] 대시보드 통계 카드 (공고 수, 입찰 수, 계약 건수)
- [ ] NTS API 타임아웃 원인 조사 (Vercel Function 리전 or API 측 문제)

## Active Files
- `prisma/schema.prisma` — Contract/ContractSign 추가됨 (db push 완료)
- `src/app/contracts/` — Phase 4 계약 페이지
- `src/app/api/contracts/[contractId]/route.ts` — 계약 API

## Current State / Blockers
- 첨부파일: `BLOB_READ_WRITE_TOKEN` 미설정 → `__mock__` URL 폴백, 실제 파일 저장 안됨
- NTS API 15초 타임아웃 미해결 (사업자 인증 간헐적 실패)
- dev 서버 실행 중 `prisma generate --engine` EPERM → `--no-engine` 타입만 적용 (서버 재시작 시 자동 해결)
