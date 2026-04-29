# HANDOFF
**agent:** claude | **project:** CoziCON-Website | **branch:** main | **commit:** 79e3b7d
**created:** 2026-04-29 12:30 | **status:** active

## Context
면허 조회 기능의 실제 API 연동이 미완성. KISCON ConAdminInfoSvc1은 사업자번호 직접 조회가 불가능한 공시 목록 API임을 확인했고, GongsiReg + bizno 필터링 워크어라운드를 배포했으나 정확도 한계 존재.

## Immediate Next Steps
- [ ] data.go.kr에서 **국토교통부_건설업등록정보서비스(종합/전문)** 활용신청 → 승인 후 코드 반영
  - 종합: `https://apis.data.go.kr/1613000/ConstBizInforService/getConstBizList` (파라미터: `bizno`)
  - 전문: `https://apis.data.go.kr/1613000/ConstSpecBizInforService/getConstSpecBizList` (파라미터: `bizno`)
- [ ] GongsiReg 워크어라운드 실 테스트 (실제 사업자번호로 isMock: false 나오는지 확인)
- [ ] 국토교통부 서비스 승인 후 route.ts를 원래 ConstBizInforService 방식으로 복구

## Active Files
- `src/app/api/verify-license/route.ts` — API 라우트 (GongsiReg 워크어라운드 구현체)
- `vercel.json` — Vercel 서울 리전(icn1) 설정

## Current State / Blockers
배포 URL: https://cozi-con-website-lvsh.vercel.app/
진단 URL: https://cozi-con-website-lvsh.vercel.app/api/verify-license
CONSTRUCTION_API_KEY: Vercel 환경변수 등록됨 (64자, 1fe3ab...8ddc)
GongsiReg 연결은 성공하나 bizno 필터링 특성상 결과 누락 가능성 있음
Vercel CLI: 한글 계정명 버그로 직접 사용 불가 → git push로 배포 우회
