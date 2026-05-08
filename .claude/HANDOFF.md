# HANDOFF
**agent:** claude | **project:** CoziCON-Website | **branch:** main | **commit:** 6c4fb04
**created:** 2026-05-08 | **status:** active

## Context
Week 2 Day 8~12 완료. 공고 시스템 고도화(수정 페이지, 입찰 조건, 검색 필터)까지 마쳤으며,
다음 단계는 Phase 4 계약 시스템 또는 알림 시스템 중 선택.

## Immediate Next Steps
- [ ] Vercel Blob 스토어 생성 → `BLOB_READ_WRITE_TOKEN` `.env.local` + Vercel 환경변수 등록 (첨부파일 실제 저장 활성화)
- [ ] Phase 4 계약 시스템: 낙찰 처리 후 Contract 모델 생성 + 계약서 PDF 생성 플로우
- [ ] 알림 시스템: 입찰 마감 임박(D-3) + 낙찰 결과 Resend 이메일 발송
- [ ] Resend 도메인 인증: 직접 소유 도메인 생기면 `resend.com/domains`에서 SPF/DKIM 설정

## Active Files
- src/app/notices/page.tsx
- src/app/notices/create/CreateNoticeForm.tsx
- src/app/notices/[id]/edit/EditNoticeForm.tsx
- prisma/schema.prisma

## Current State / Blockers
- 첨부파일: `BLOB_READ_WRITE_TOKEN` 미설정 → `__mock__/filename` URL 폴백, 실제 파일 저장 안됨
- NTS API 15초 타임아웃 미해결 (사업자 인증 간헐적 실패)
- Prisma generate EPERM: dev 서버 실행 중 발생 (Windows 알려진 이슈) → Vercel 배포 시 자동 해결
