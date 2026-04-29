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
