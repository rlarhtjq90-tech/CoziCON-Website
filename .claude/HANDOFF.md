# HANDOFF
**agent:** claude | **project:** CoziCON-Website | **branch:** dev | **commit:** 88646db
**created:** 2026-05-05 09:30 | **status:** active

## Context
Day 2 가입 플로우 분기 코드 구현 완료. `.env.local` Gmail 자격증명이 플레이스홀더라 OTP 이메일 발송이 실패하여 end-to-end 테스트를 완료하지 못함.

## Immediate Next Steps
- [ ] `.env.local`에 실제 `GMAIL_USER`와 `GMAIL_APP_PASSWORD` 입력 후 OTP 발송 테스트
- [ ] `/signup` 4스텝 플로우 end-to-end 테스트 (종합/전문건설사 각각 가입 완료 확인)
- [ ] Day 2 완료 커밋 후 Day 3 시작: 사업자등록증 업로드 + 국세청 API 연동

## Active Files
- `src/app/signup/page.tsx` — 4스텝 가입 UI (email→OTP→유형→폼)
- `src/app/api/auth/register/route.ts` — userType, status, TermsConsent 저장
- `src/app/api/auth/send-verification/route.ts` — Gmail OTP 발송 (GMAIL_* env 필요)
- `prisma/schema.prisma` — UserStatus enum + User.status 추가됨

## Current State / Blockers
Gmail SMTP 인증 실패: `535 Username and Password not accepted`
→ `.env.local`의 `GMAIL_USER`와 `GMAIL_APP_PASSWORD`가 플레이스홀더 값
→ 실제 Gmail 앱 비밀번호로 교체 필요 (Google 계정 → 보안 → 2단계인증 → 앱 비밀번호)
