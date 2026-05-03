# HANDOFF
**agent:** claude | **project:** CoziCON-Website | **branch:** dev | **commit:** 52cd1c2
**created:** 2026-05-03 | **status:** active

## Context
건설 입찰 플랫폼 4주 계획의 Day 0 인프라 세팅이 완료됐고, Day 1 (DB 스키마 설계)을 시작하기 전에 외부 서비스 등록 3가지가 남아 있음.

## Immediate Next Steps
- [ ] Sentry DSN 등록: https://cozi-con.sentry.io/settings/projects/javascript-nextjs/keys/ → DSN 복사 → Vercel 환경변수 `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` 추가
- [ ] Neon DB dev/prod 분리: neon.tech → 현재 프로젝트 → Branches → `dev` 브랜치 생성 → 연결 문자열 로컬 `.env`에 추가
- [ ] 국세청 사업자등록 진위확인 API 신청: data.go.kr 검색 "사업자등록 진위확인" → 활용신청 (1~3일 승인)
- [ ] Day 1 시작: Prisma 스키마 확장 (`companies`, `company_verifications`, `licenses`, `terms_consents`, 회원 유형 enum)

## Active Files
- `prisma/schema.prisma` — Day 1에 수정할 핵심 파일
- `.env.example` — 모든 환경변수 항목 정리됨 (참고용)
- `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` — Sentry 설정 (DSN 등록 후 활성화)

## Current State / Blockers
Sentry DSN 없이 빌드는 되지만 에러 캡처는 안 됨. Day 1은 외부 서비스 없이 바로 시작 가능. `dev` 브랜치에서 작업 중.
배포 URL: https://cozi-con-website-2ano.vercel.app/
