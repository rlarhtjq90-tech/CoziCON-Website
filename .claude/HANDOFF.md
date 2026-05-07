# HANDOFF
**agent:** claude | **project:** CoziCON-Website | **branch:** main | **commit:** 3044a50
**created:** 2026-05-07 | **status:** active

## Context
세션 25: Resend 이메일 발송 디버깅 완료. `RESEND_FROM_EMAIL` 환경변수 이중 래핑 버그 수정(422→200), 샌드박스 제한으로 소유자 이메일만 수신 가능 확인. UI 버그(발송 실패 시에도 Step 2로 이동) 수정 완료 — 현재 프로덕션 배포.

## Immediate Next Steps
- [ ] Resend 도메인 인증: 직접 소유한 도메인이 생기면 `resend.com/domains`에서 DNS 설정 (SPF/DKIM)
- [ ] 그 전까지 소유자 이메일(`rlarhtjq90@gmail.com`)로만 이메일 기능 테스트 가능
- [ ] NTS API 15초 타임아웃 원인 조사 및 해결 (Vercel Function 타임아웃 연장 또는 폴링 방식 전환)
- [ ] Day 7: 통합 시나리오 직접 실행 (가입→사업자인증→관리자승인→로그인→프로필→비밀번호변경)

## Active Files
- `src/app/api/auth/forgot-password/route.ts` — Resend 에러 처리 추가
- `src/app/api/auth/send-verification/route.ts` — Resend 에러 처리 추가

## Current State / Blockers
- Resend 샌드박스(`onboarding@resend.dev`): 소유자 이메일(`rlarhtjq90@gmail.com`)만 수신 가능
- 미가입 이메일 forgot-password 시 Step 2로 이동하는 것은 anti-enumeration 의도된 동작
- NTS API 15초 타임아웃 미해결
