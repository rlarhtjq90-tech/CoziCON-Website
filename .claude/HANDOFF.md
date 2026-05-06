# HANDOFF
**agent:** claude | **project:** CoziCON-Website | **branch:** main | **commit:** 4cc1456
**created:** 2026-05-06 | **status:** active

## Context
비밀번호 찾기 기능(4개 파일) 구현 완료. Chrome 확장 보안 제한으로 localhost 접속 스크린샷 불가 — 브라우저 E2E 테스트 및 Vercel 배포가 남아 있음.

## Immediate Next Steps
- [ ] 로컬 `npm run dev` → `http://localhost:3001/login` 에서 "비밀번호 찾기" 링크 확인
- [ ] `/forgot-password` 3단계 플로우 직접 테스트 (실제 이메일로 OTP 수신 확인)
- [ ] git commit + push → Vercel 자동 배포 후 프로덕션 테스트
- [ ] (이전) `BLOB_READ_WRITE_TOKEN` Vercel 환경변수 확인 (첨부파일 저장)
- [ ] (이전) NTS API 15초 타임아웃 해결

## Active Files
- `src/app/login/page.tsx` — "비밀번호 찾기" 링크 추가됨
- `src/app/forgot-password/page.tsx` — 3단계 UI
- `src/app/api/auth/forgot-password/route.ts` — OTP 발송 (pw-reset: prefix)
- `src/app/api/auth/reset-password/route.ts` — 비밀번호 변경

## Current State / Blockers
dev 서버가 백그라운드 기동 중 (포트 3001 LISTENING). Chrome 확장은 localhost 스크린샷 불가 — 사용자가 직접 `http://localhost:3001/login` 열어서 테스트 필요. 커밋/푸시는 아직 미완.
