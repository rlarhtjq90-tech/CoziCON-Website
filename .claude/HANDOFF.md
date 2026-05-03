# HANDOFF
**agent:** claude | **project:** CoziCON-Website | **branch:** main | **commit:** 639630a
**created:** 2026-05-03 | **status:** active

## Context
Gmail SMTP 코드 수정 및 Vercel 환경변수 등록 완료. 단, 앱 비밀번호 입력 시 오타로 인해 이메일 발송이 아직 실패 중. Vercel에서 GMAIL_APP_PASSWORD 값 수정 후 Redeploy 하면 이메일 OTP가 작동할 것으로 예상.

## Immediate Next Steps
- [ ] Vercel `GMAIL_APP_PASSWORD` 값을 `wljudofmniypzxzp`로 수정 후 Redeploy
- [ ] /signup 페이지에서 실제 이메일 OTP 수신 테스트
- [ ] 대시보드 3개 카드 기능 구현 (입찰 현황 / 관심 공고 / 면허 정보)
- [ ] Prisma 스키마 확장 (Announcement, Bid, LicenseInfo, SavedAnnouncement)
- [ ] cozicon.co.kr 도메인 구매 후 Vercel 연결 (장기 과제)

## Active Files
- `src/app/api/auth/send-verification/route.ts` — Gmail SMTP 발송 로직 (수정 완료)
- `src/app/signup/page.tsx` — 3단계 OTP 인증 UI
- `src/app/dashboard/page.tsx` — 대시보드 (기능 미구현 카드 3개)
- `prisma/schema.prisma` — DB 스키마 (확장 필요)

## Current State / Blockers
Vercel GMAIL_APP_PASSWORD 오타: `wljudofmniyxzxzp`(잘못됨) → `wljudofmniypzxzp`(올바름)
배포 URL: https://cozi-con-website-2ano.vercel.app/
