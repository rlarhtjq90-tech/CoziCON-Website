# HANDOFF
**agent:** claude | **project:** CoziCON-Website | **branch:** main | **commit:** ab36d37
**created:** 2026-05-03 | **status:** active

## Context
NEXTAUTH_URL 환경변수 수정 + 재배포 완료. 로그인 흐름은 복구됐으나 Gmail SMTP 환경변수가 미설정 상태라 이메일 OTP 발송이 불가능함. 다음 세션에서 Gmail 설정 후 대시보드 기능 개발 시작 예정.

## Immediate Next Steps
- [ ] Vercel 대시보드에서 `GMAIL_USER`, `GMAIL_APP_PASSWORD` 추가 후 재배포
- [ ] /signup 페이지에서 실제 이메일로 OTP 수신 테스트
- [ ] 대시보드 3개 카드 기능 구현 (입찰 현황 / 관심 공고 / 면허 정보)
- [ ] Prisma 스키마 확장 (Announcement, Bid, LicenseInfo, SavedAnnouncement)
- [ ] 가비아에서 cozicon.co.kr 도메인 구매 후 Vercel 연결 (장기 과제)

## Active Files
- `src/app/api/auth/send-verification/route.ts` — Gmail SMTP 발송 로직
- `src/app/signup/page.tsx` — 3단계 OTP 인증 UI
- `src/app/dashboard/page.tsx` — 대시보드 (기능 미구현 카드 3개)
- `prisma/schema.prisma` — DB 스키마 (확장 필요)

## Current State / Blockers
GMAIL_USER, GMAIL_APP_PASSWORD 미설정 → 이메일 발송 불가.
앱 비밀번호 발급: https://myaccount.google.com/apppasswords (2단계 인증 켜져 있어야 함)
배포 URL: https://cozi-con-website-lvsh.vercel.app/
