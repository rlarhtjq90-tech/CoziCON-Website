# 교훈 기록 (Lessons Learned)

코딩 및 전략 교훈. /wrap 세션에서 기록됩니다.
#coding 태그 항목은 SessionStart 시 자동 주입됩니다.
반복 패턴은 /wrap HITL 승급을 통해 적절한 vehicle로 적용됩니다.

## Deployment

### Vercel CLI 한글 계정명 버그 #coding #vercel
Vercel CLI v52에서 계정명에 한글 등 비ASCII 문자가 포함되면 HTTP 헤더 인코딩 오류 발생.
`git push`로 GitHub 연동 자동 배포를 트리거하거나, Vercel REST API + 개인 토큰으로 우회.

## External API

### data.go.kr 공공API URL은 변경될 수 있음 #coding #external-api
공공데이터포털의 개별 API 직접 URL(`/data/{id}/openapi.do`)은 삭제되거나 변경될 수 있음.
고정 URL 대신 사이트 검색(`키스콘 건설업체정보` 등 키워드)으로 최신 URL을 찾아야 함.

### data.go.kr API는 서비스마다 조회 방식이 완전히 다름 #coding #external-api
같은 건설업 도메인이라도 KISCON ConAdminInfoSvc1(공시 목록, 날짜+지역 조회)과
국토교통부 ConstBizInforService(사업자번호 직접 조회)는 완전히 다른 API.
활용가이드 docx의 "요청 메시지 명세"에서 입력 파라미터를 먼저 확인해야 목적에 맞는 서비스인지 알 수 있음.

### 서버 사이드 API 연동 오류는 진단 엔드포인트 노출이 가장 빠름 #coding #debugging
GET /api/[route] 진단 엔드포인트를 서버에 배포하면 환경변수 유무, 연결 상태, resultCode를
실제 Vercel 환경에서 한 번에 확인 가능. 로컬 추측보다 훨씬 빠르게 원인을 좁힐 수 있음.
