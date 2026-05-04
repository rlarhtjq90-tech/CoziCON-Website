# HANDOFF
**agent:** claude | **project:** CoziCON-Website | **branch:** dev | **commit:** 52cd1c2
**created:** 2026-05-04 | **status:** active

## Context
Day 0 진행 중. 국세청 API 신청 폼 자동 입력 완료 (버튼 클릭만 남음), Claude in Chrome 페어링 완료. 새 세션에서 --chrome 브라우저 도구 활성화 확인 필요.

## Immediate Next Steps
- [ ] Chrome에서 data.go.kr 로그인 → `node apply-cdp.js` 재실행 → 화면에서 "활용신청" 버튼 클릭 → API 키 수령 후 `.env.local`에 `NTS_API_KEY` 추가 (자동승인)
- [ ] Neon DB dev/prod 분리: neon.tech → 현재 프로젝트 → Branches → `dev` 브랜치 생성 → 로컬 `.env.local` DATABASE_URL 업데이트
- [ ] Supabase Storage: supabase.com 프로젝트 생성 + `uploads` 버킷 + `.env.local` SUPABASE_* 추가
- [ ] Day 1 시작: Prisma 스키마 확장 (companies, company_verifications, licenses, terms_consents, 회원유형 enum)

## Active Files
- `CoziCON-Website/.env.example` — 전체 환경변수 템플릿 참고
- `C:\Users\PC\Desktop\halfdone\projects\brand-website\apply-cdp.js` — 국세청 API 폼 자동 입력 스크립트
- `CoziCON-Website/prisma/schema.prisma` — Day 1 확장 대상

## Current State / Blockers
국세청 폼 완전 입력됨. Chrome --remote-debugging-port=9222 실행 후 `node apply-cdp.js` → 스크린샷 확인 후 버튼 클릭. Claude in Chrome 확장(ID: fcoeoabgfenejglbffodgkkbkcdhcgfn)은 Anthropic 브리지 방식이라 새 세션 시작 후 도구 목록에 browser 도구 추가 여부 확인 필요.
배포 URL: https://cozi-con-website-2ano.vercel.app/
