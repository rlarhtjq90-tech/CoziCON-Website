# HANDOFF
**agent:** claude | **project:** CoziCON-Website | **branch:** dev | **commit:** 52cd1c2
**created:** 2026-05-04 | **status:** active

## Context
Day 0 인프라 세팅 중. 국세청 API 신청 완료(처리상태: 신청/자동승인 대기). cozicon-automator Chrome 확장 제작 완료, Chrome 로드 필요. Claude in Chrome은 CLI 미지원 확인됨.

## Immediate Next Steps
- [ ] chrome://extensions → cozicon-automator 로드 (`C:\Users\PC\Desktop\halfdone\projects\brand-website\cozicon-automator`)
- [ ] data.go.kr 마이페이지에서 국세청 API 승인 확인 → NTS_API_KEY Vercel 환경변수 등록
- [ ] Neon DB dev 브랜치 생성 → dev DATABASE_URL을 .env.local + Vercel Preview 등록
- [ ] Supabase 프로젝트 생성 → SUPABASE_URL / ANON_KEY / SERVICE_ROLE_KEY Vercel 등록
- [ ] Prisma migrate dev (dev DB 스키마 적용) → Day 1 스키마 확장 시작

## Active Files
- `C:\Users\PC\Desktop\halfdone\projects\brand-website\cozicon-automator\` — Chrome 확장 (미로드)
- `CoziCON-Website\.env.local` — CONSTRUCTION_API_KEY만 있음
- `CoziCON-Website\.env.example` — 전체 필요 환경변수 목록
- `CoziCON-Website/prisma/schema.prisma` — Day 1 확장 대상

## Current State / Blockers
- Claude in Chrome 브라우저 도구는 CLI 미지원 (Claude Desktop 전용 확인됨)
- Chrome CDP 실행 시 기존 Chrome 완전 종료 후 임시 프로필로 실행 필요
- Neon dev URL, Supabase 키는 사용자 직접 발급 필요
- 배포 URL: https://cozi-con-website-2ano.vercel.app
