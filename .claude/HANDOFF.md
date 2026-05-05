# HANDOFF
**agent:** claude | **project:** CoziCON-Website | **branch:** dev | **commit:** 57db2b3
**created:** 2026-05-05 | **status:** active

## Context
NTS 사업자 진위확인 API 수정 완료 (start_dt 추가, p_nm 제거). Vercel 재배포 후 실제 데이터로 검증 필요. Day 5 회사 프로필 페이지 구현 대기 중.

## Immediate Next Steps
- [ ] Vercel 재배포 완료 후 씨티이앤씨 데이터로 NTS API 실 검증: 사업자번호 `823-87-01344`, 개업일자 `2018-12-15` → `valid: "01"` 확인
- [ ] Vercel `ADMIN_EMAILS=rlarhtjq90@gmail.com,black_0802@naver.com` 환경변수 등록 (미등록 상태)
- [ ] E2E 전체 플로우 검증: 회원가입 → /verify-biz → /verify-license → /admin 승인
- [ ] Day 5 구현: 회사 프로필 페이지 (상호, 대표자, 주소, 연락처, 면허종목, 시공능력평가액, 주력지역, 시공실적, 로고 업로드)

## Active Files
- `src/app/api/verify-biz/route.ts` — start_dt 추가, p_nm 제거
- `src/app/verify-biz/page.tsx` — 개업일자 입력 필드 추가

## Current State / Blockers
NTS API p_nm Korean encoding 미해결 — 현재 b_no+start_dt만으로 진위확인 (대표자명 미검증).
씨티이앤씨: b_no=8238701344, start_dt=20181215 → valid: "01" 예상이나 배포 후 확인 필요.
