# HANDOFF
**agent:** claude | **project:** CoziCON-Website | **branch:** main | **commit:** 44a92da
**created:** 2026-04-30 | **status:** active

## Context
이메일 OTP 회원가입 구현 완료 및 Gmail SMTP 전환까지 완료. Vercel 환경변수 설정만 남은 상태로 세션 종료.

## Immediate Next Steps
- [ ] Vercel 대시보드에서 `GMAIL_USER`(발신 Gmail 주소), `GMAIL_APP_PASSWORD`(앱 비밀번호 16자리) 추가
- [ ] 추가 후 재배포 (빈 커밋 push 또는 Vercel Redeploy 버튼)
- [ ] /signup 페이지에서 타 이메일 주소로 인증코드 수신 테스트
- [ ] 가비아에서 cozicon.co.kr 도메인 구매 후 Vercel 연결 (장기 과제)
- [ ] data.go.kr 국토교통부 건설업등록정보서비스 승인 후 면허 조회 정식 연동 (장기 과제)

## Active Files
- `src/app/api/auth/send-verification/route.ts` — Gmail SMTP 발송 로직
- `src/app/signup/page.tsx` — 3단계 OTP 인증 UI

## Current State / Blockers
Vercel에 GMAIL_USER, GMAIL_APP_PASSWORD 미설정 → 이메일 발송 불가.
앱 비밀번호 발급: https://myaccount.google.com/apppasswords (2단계 인증 켜져 있어야 함)
설정 완료 후 재배포하면 Gmail, Naver, 회사메일 등 모든 이메일로 인증코드 수신 가능.
