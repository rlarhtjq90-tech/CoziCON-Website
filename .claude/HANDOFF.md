# HANDOFF
**agent:** claude | **project:** CoziCON-Website | **branch:** dev | **commit:** 52cd1c2
**created:** 2026-05-04 | **status:** active

## Context
Day 0 인프라 세팅 완전 완료 (Sentry DSN Vercel 등록 + 재배포). Day 1 DB 스키마 설계 전 Neon dev 브랜치 분리와 국세청 API 신청만 남음.

## Immediate Next Steps
- [ ] Neon DB dev/prod 분리: neon.tech → 현재 프로젝트 → Branches → `dev` 브랜치 생성 → 연결 문자열 로컬 `.env`에 추가
- [ ] 국세청 사업자등록 진위확인 API 신청: data.go.kr 검색 "사업자등록 진위확인" → 활용신청 (1~3일 승인)
- [ ] Day 1 시작: Prisma 스키마 확장 (`companies`, `company_verifications`, `licenses`, `terms_consents`, 회원 유형 enum)

## Active Files
- `prisma/schema.prisma` — Day 1에 수정할 핵심 파일
- `.env.example` — 모든 환경변수 항목 정리됨 (참고용)

## Current State / Blockers
Sentry 완전 활성화 (DSN + Auth Token 등록, Production 재배포 완료).
배포 URL: https://cozi-con-website-2ano.vercel.app/
