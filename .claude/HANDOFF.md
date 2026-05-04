# HANDOFF
**agent:** claude | **project:** CoziCON-Website | **branch:** dev | **commit:** 52cd1c2
**created:** 2026-05-04 | **status:** active

## Context
Day 0 인프라 세팅 중. 국세청 API 신청 완료(자동승인 대기). claude --chrome 방식(Claude in Chrome 확장)으로 MLIT API 신청 자동화 방법 확립. Chrome 확장 설치만 남음.

## Immediate Next Steps
- [ ] "Claude in Chrome" 확장 Chrome 웹스토어에서 설치 → `claude --chrome` 으로 browser-task.md 실행해 MLIT API 신청
- [ ] data.go.kr 마이페이지에서 국세청 API 승인 확인 → NTS_API_KEY Vercel 환경변수 등록
- [ ] Neon DB dev 브랜치 생성 → dev DATABASE_URL을 .env.local + Vercel Preview 등록
- [ ] Supabase 프로젝트 생성 → SUPABASE_URL / ANON_KEY / SERVICE_ROLE_KEY Vercel 등록
- [ ] Prisma migrate dev (dev DB 스키마 적용) → Day 1 스키마 확장 시작

## Active Files
- `C:\Users\PC\Desktop\halfdone\projects\brand-website\browser-task.md` — claude --chrome 실행 태스크
- `C:\Users\PC\Desktop\halfdone\projects\brand-website\cozicon-automator\` — Chrome 확장 (로드 필요)
- `CoziCON-Website\.env.local` — CONSTRUCTION_API_KEY만 있음
- `CoziCON-Website/prisma/schema.prisma` — Day 1 확장 대상

## Current State / Blockers
- claude --chrome 사용 전 "Claude in Chrome" 확장 설치 필요 (Chrome 웹스토어)
- NTS_API_KEY, Neon dev URL, Supabase 키는 사용자 직접 발급 필요
- 배포 URL: https://cozi-con-website-2ano.vercel.app
