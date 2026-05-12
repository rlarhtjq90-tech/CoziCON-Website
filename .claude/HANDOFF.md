# HANDOFF
**agent:** claude | **project:** CoziCON-Website | **branch:** main | **commit:** 02254f8
**created:** 2026-05-12 | **status:** active

## Context
핵심 플랫폼 기능(개찰·알림·북마크·Q&A) 완성. 남은 작업은 운영 준비(도메인·Blob) + 관리자 대시보드 강화 + UX 마감.

## Immediate Next Steps
- [ ] **관리자 대시보드 강화**: `/admin` 통계 카드 (총 가입자·활성 공고·입찰 참여율), 공고 모니터링(비공개 처리), 공지사항/FAQ 작성
- [ ] **Vercel Cron `CRON_SECRET`** 환경변수 등록 (Vercel 대시보드 → Settings → Environment Variables)
- [ ] **도메인 + 이메일**: `cozicon.co.kr` 구매 → Resend 도메인 등록 + DNS(SPF/DKIM) → `RESEND_FROM_EMAIL=noreply@cozicon.co.kr` Vercel 환경변수 업데이트
- [ ] **Vercel Blob**: 스토어 생성 → `BLOB_READ_WRITE_TOKEN` 등록 (첨부파일 실제 저장)
- [ ] **UX 마감**: 빈 상태·로딩·에러 화면, 모바일 반응형, 파비콘/OG 이미지

## Active Files
- src/app/api/cron/close-notices/route.ts
- src/app/api/cron/open-bids/route.ts
- src/lib/notify.ts
- src/app/admin/page.tsx (다음 강화 대상)

## Current State / Blockers
코드 완성·커밋·푸시 완료. 이메일(샌드박스 제한)·첨부파일(Blob 미설정)·Cron 인증(CRON_SECRET 미설정) 세 가지가 인프라 블로커. 코드 변경 불필요, 환경변수·도메인 설정만 필요.
