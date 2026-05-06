# HANDOFF
**agent:** claude | **project:** CoziCON-Website | **branch:** main | **commit:** 13d3fc0
**created:** 2026-05-06 | **status:** active

## Context
Phase 1(신원 인증 체계) 구현 완료 + 프로덕션 배포까지 완료. 다음은 Phase 2(입찰공고 시스템) 진입.

## Immediate Next Steps
- [ ] Phase 2 설계: 공고 DB 스키마 (`BidNotice`, `BidAttachment`) 설계
- [ ] 공고 작성 페이지 `/notices/create` 구현 (제목, 공종, 지역, 예가, 마감일, 첨부파일)
- [ ] 공고 게시판 `/notices` 구현 (목록, 정렬, 필터)
- [ ] NTS API 15초 타임아웃 원인 조사 (Vercel Function 로그 확인)
- [ ] `/company/profile` E2E 검증 (실제 사업자 인증 완료 계정으로 테스트)

## Active Files
- prisma/schema.prisma
- src/app/api/ (신규 라우트 추가 예정)

## Current State / Blockers
- NTS API 타임아웃: `DOMException [TimeoutError]` — Vercel Function에서 15초 초과. 원인 미해결.
- `/company/profile`: 코드 완성, DB 반영됨. 실제 사업자 인증 계정 없어 UI 미검증.
