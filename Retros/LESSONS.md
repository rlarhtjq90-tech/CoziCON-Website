# 교훈 기록 (Lessons Learned)

코딩 및 전략 교훈. /wrap 세션에서 기록됩니다.
#coding 태그 항목은 SessionStart 시 자동 주입됩니다.
반복 패턴은 /wrap HITL 승급을 통해 적절한 vehicle로 적용됩니다.

## Deployment

### NEXTAUTH_URL은 실제 배포 URL 확인 후 즉시 설정 #coding #next-auth
Vercel 프로젝트가 새로 생성되거나 이름이 바뀌면 배포 URL이 달라짐.
NEXTAUTH_URL을 구 URL로 방치하면 로그인 요청이 전부 실패함.
배포 직후 Vercel Deployments 탭에서 실제 URL을 확인하고 환경변수를 즉시 업데이트해야 함.

### npm install 시 메이저 버전 명시 필수 (Prisma 등) #coding #tooling
`npm install prisma`로 설치하면 최신 메이저(현재 v7)가 설치되어 schema 포맷이 완전히 바뀔 수 있음.
안정적인 Next.js 14 환경에서는 `prisma@5`처럼 메이저 버전을 고정해서 설치해야 함.

### Vercel CLI 한글 계정명 버그 #coding #vercel
Vercel CLI v52에서 계정명에 한글 등 비ASCII 문자가 포함되면 HTTP 헤더 인코딩 오류 발생.
`git push`로 GitHub 연동 자동 배포를 트리거하거나, Vercel REST API + 개인 토큰으로 우회.

## Email

### Resend 무료 플랜은 샌드박스 — 본인 계정 이메일로만 발송 가능 #coding #email
Resend에서 도메인 인증 없이 `onboarding@resend.dev`를 발신 주소로 쓰면 샌드박스 모드.
샌드박스에서는 Resend 가입 계정 이메일 외에는 수신 불가 → 실사용 불가.
도메인 없는 환경에서 모든 이메일로 발송하려면 Gmail/Naver SMTP(nodemailer)를 써야 함.

### Gmail 앱 비밀번호 공백 제거는 붙여넣기 후 공백만 지울 것 #coding #email
앱 비밀번호(`wlju dofm niyp zxzp`)를 직접 타이핑하면 오타 위험이 있음.
반드시 원본을 복사 후 공백만 제거(`wljudofmniypzxzp`)해서 Vercel에 입력해야 함.

### catch 블록에 반드시 에러 로깅 추가 #coding #debugging
`catch { return 500 }` 패턴은 Vercel Function Logs에서 실제 원인을 숨김.
`catch (err) { console.error(err) }` 한 줄만 추가해도 원인 진단 속도가 크게 빨라짐.

### Gmail SMTP 앱 비밀번호는 2단계 인증 활성화 후에만 발급 가능 #coding #email
Google 계정 → myaccount.google.com/apppasswords 에서 앱 비밀번호 발급.
2단계 인증이 꺼져 있으면 앱 비밀번호 메뉴 자체가 노출되지 않음.
nodemailer 설정 시 `pass`에는 일반 비밀번호가 아닌 16자리 앱 비밀번호를 사용해야 함.

## Browser Automation

### Vercel 환경변수 추가 버튼은 텍스트 매칭 클릭이 좌표보다 안정적 #coding #tooling
Vercel 환경변수 페이지에 "Link Shared Variable"과 "Add Environment Variable" 버튼이 인접해 있어 좌표 클릭 시 오작동.
`Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Add Environment Variable')?.click()` 패턴이 안정적.

### Vercel 환경변수 Key 필드에 .env 일괄 붙여넣기는 마지막 줄만 key로 파싱됨 #coding #vercel
Vercel의 "paste .env contents in Key input" 기능은 전체 파일을 파싱하지 못하고 마지막 줄이 key가 되는 버그 있음.
React controlled input에는 `Object.getOwnPropertyDescriptor(el.__proto__, 'value').set`으로 네이티브 setter를 호출해야 React 상태가 업데이트됨.

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
