# HANDOFF
**agent:** claude | **project:** CoziCON-Website | **branch:** main | **commit:** bdb86fd
**created:** 2026-04-28 | **status:** active

## Context
KISCON 건설면허 인증 UI와 API 라우트는 완성됐으나, 실제 국토교통부 API를 호출하려면 data.go.kr API 키가 필요하다. 현재 Mock 데이터로 동작 중.

## Immediate Next Steps
- [ ] data.go.kr 로그인 → 종합건설 API 활용신청 (https://www.data.go.kr/data/15000659/openapi.do)
- [ ] data.go.kr → 전문건설 API 활용신청 (https://www.data.go.kr/data/15000660/openapi.do)
- [ ] 마이페이지 → 오픈API → 일반 인증키(Decoding) 복사
- [ ] .env.local에 CONSTRUCTION_API_KEY=<키> 추가
- [ ] Vercel 환경변수에도 동일 키 등록 후 재배포

## Active Files
- src/components/sections/SignupStart.tsx
- src/app/api/verify-license/route.ts
- .env.local (생성 필요)

## Current State / Blockers
API 키 없음 → Mock 데이터 반환 중 (isMock: true, "테스트 데이터" 배지 표시).
배포 URL: https://cozi-con-website-lvsh.vercel.app/
Node.js: C:\Users\PC\AppData\Local\nodejs\node-v20.19.1-win-x64
