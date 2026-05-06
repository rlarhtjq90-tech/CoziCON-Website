# 교훈 기록 (Lessons Learned)

코딩 및 전략 교훈. /wrap 세션에서 기록됩니다.
#coding 태그 항목은 SessionStart 시 자동 주입됩니다.
반복 패턴은 /wrap HITL 승급을 통해 적절한 vehicle로 적용됩니다.

## Deployment

### Vercel 빌드 실패 시 로컬 성공해도 의심할 것 — 새 의존성이 원인일 수 있음 #coding #vercel
로컬 `next build`가 통과해도 Vercel 빌드는 실패할 수 있음. 새 npm 패키지 추가 직후 실패하면 해당 패키지의 Vercel 환경 호환성을 먼저 확인. `npx vercel inspect <deployment-id> --logs` (Vercel CLI 로그인 필요) 또는 Vercel 대시보드 Build Logs 탭이 가장 빠른 진단 경로.

### claude-in-chrome MCP는 `claude --chrome`로 시작한 세션에서만 활성화 #coding #tooling
Chrome에 Claude 확장이 설치돼 있어도, Claude Code 세션이 `--chrome` 플래그 없이 시작됐으면 `claude-in-chrome` MCP 서버가 주입되지 않음. Chrome 자동화가 필요하면 세션 시작 시 `claude --chrome`을 사용하거나, CDP(remote-debugging-port) 방식으로 대체.

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

### Chrome CDP 시작 시 기존 프로세스 종료 + 임시 프로필 필수 #coding #browser-automation
기존 Chrome이 살아있으면 `--remote-debugging-port` 플래그가 무시되고 기존 인스턴스로 합류되어 CDP 포트가 안 열림.
`Stop-Process -Name chrome -Force` 후 `--user-data-dir=임시경로`로 신규 인스턴스를 강제 생성해야 함.
또한 Playwright connectOverCDP는 `localhost` 대신 `127.0.0.1`을 써야 Windows IPv6 ECONNREFUSED를 피할 수 있음.

### Claude in Chrome 브라우저 도구는 Claude Desktop 전용, CLI 미지원 #coding #browser-automation
Claude in Chrome 확장(v1.0.69)은 Anthropic bridge(`wss://bridge.claudeusercontent.com`)를 통해 Claude Desktop 앱과 연결됨.
CLI(터미널) 세션에서는 MCP 브라우저 도구(browser_screenshot 등)가 주입되지 않음.
CLI에서 Chrome 자동화가 필요하면 Playwright CDP 또는 커스텀 Chrome 확장(manifest v3 + scripting API)으로 대체해야 함.

### 로그인 세션이 필요한 사이트 자동화는 CDP로 기존 Chrome에 붙는 것이 최선 #coding #browser-automation
Playwright로 새 브라우저 인스턴스를 열면 쿠키/세션이 없어 로그인부터 자동화해야 함.
`chromium.connectOverCDP('http://localhost:9222')`로 `chrome.exe --remote-debugging-port=9222`로 실행된 기존 브라우저에 붙으면 사람이 로그인한 세션을 그대로 재사용 가능.
사전에 Chrome을 `--remote-debugging-port=9222` 플래그로 시작해둬야 함.

### hidden 필드는 Playwright fill/click 대신 JS 직접 주입으로 처리 #coding #browser-automation
Playwright의 `fill()`, `click()`, `selectOption()`은 요소가 visible해야 동작하며 hidden/invisible 필드에서 TimeoutError 발생.
`page.evaluate()`로 `element.value = val; element.dispatchEvent(new Event('input', {bubbles:true}))`를 주입하면 visibility 체크 없이 값 설정 가능.
React/Vue 등 프레임워크 이벤트 시스템도 bubbles:true 이벤트를 dispatch해야 상태가 반영됨.

## Auth

### 로컬 NextAuth 셋업 시 NEXTAUTH_SECRET 누락 → ?error=Configuration #coding #next-auth
`.env.local`에 `NEXTAUTH_SECRET`이 없으면 로그인 시 `/api/auth/error?error=Configuration`으로 리다이렉트되며 로그인 자체가 불가능함.
로컬 셋업 체크리스트에 `NEXTAUTH_SECRET`(임의 문자열 가능)과 `NEXTAUTH_URL=http://localhost:{port}`를 반드시 포함해야 함.

## Tooling

### PowerShell에서 URL 내 & 문자는 백틱으로 이스케이프 필요 #coding #windows #tooling
PowerShell은 `&`를 명령 연결자로 해석해 `sslmode=require&channel_binding=require` 같은 URL이 잘못 파싱됨.
`$env:DATABASE_URL="...&sslmode=require"` 설정 시 `&` 앞에 백틱(`` ` ``)을 붙여야 함 (`` `& ``).

## Next.js / React

### Server → Client 경계에서 Prisma DateTime 필드는 명시적으로 직렬화할 것 #coding #next-js #prisma
`{ ...prismaRecord }` 스프레드로 Server Component에서 Client Component에 전달하면 `createdAt`, `updatedAt` 등 Date 객체가 직렬화 오류를 일으킴.
필요한 필드만 명시적으로 선택하고 `.toISOString()` 변환 후 전달해야 함. TypeScript는 이 오류를 컴파일 타임에 잡지 못함.

## DB / Prisma

### `@updatedAt` 추가 시 `@default(now())`도 함께 써야 함 #coding #prisma #vercel
기존 행이 있는 테이블에 `@updatedAt`만 추가하면 `prisma db push`가 실패 — 기존 행의 null 처리 불가.
`updatedAt DateTime @default(now()) @updatedAt` 형태로 항상 세트로 써야 함. 로컬 빌드가 정상이어도 Vercel 배포 시 블로커가 될 수 있음.

### Windows에서 `npm install` 후 브랜치 전환 전 `package-lock.json` 복원 필요 #coding #git #windows
`npm install`을 실행하면 `package-lock.json`이 로컬에서 변경됨. 이 상태에서 `git checkout`을 시도하면 "Your local changes would be overwritten" 오류로 전환 실패.
브랜치 전환 전에 `git restore package-lock.json`으로 먼저 되돌려야 함.

### Windows dev 서버 실행 중 `prisma generate`는 EPERM으로 실패 #coding #prisma #windows
`prisma db push`나 `prisma generate`는 내부적으로 query_engine-windows.dll.node를 rename함.
dev 서버가 해당 DLL을 점유 중이면 EPERM 발생 — "Jest worker encountered 2 child process exceptions" 에러로 나타남.
반드시 dev 서버를 완전 종료한 뒤 `npx prisma generate`를 단독 실행하고, 이후 서버를 재시작해야 함.

### `prisma migrate dev`는 비대화형 환경에서 실패 → `prisma db push` 사용 #coding #prisma
Claude Code Bash 툴은 TTY가 없는 비대화형 환경이라 `prisma migrate dev`가 `Error: non-interactive` 로 실패함.
개발 중 빠른 스키마 적용엔 `prisma db push`를 사용. 마이그레이션 파일이 필요하면 사용자가 터미널에서 직접 실행.

### 로컬 Node 스크립트는 `.env.local`을 자동 로드하지 않음 #coding #prisma #next-js
Next.js dev 서버는 `.env.local` → `.env` 순으로 로드하지만, 독립 `node` 스크립트는 Prisma가 `.env`만 읽음.
서버와 스크립트의 DB 쿼리 결과가 다르게 보이는 원인이 될 수 있음. 스크립트에서 `.env.local`을 읽으려면 수동 파싱 필요.

## Deployment

### Vercel 프로젝트명은 자동 생성 suffix 포함 전체명으로 확인할 것 #coding #vercel
Vercel은 동일 이름 프로젝트 충돌 시 `-xxxx` suffix를 붙여 새 프로젝트를 생성함 (예: `cozi-con-website-2ano`).
Vercel CLI나 GitHub Deployments 탭에서 보이는 짧은 이름과 실제 프로젝트명이 다를 수 있음.
빌드 로그 확인 전에 반드시 Vercel 대시보드에서 실제 프로젝트명(URL 포함)을 먼저 확인해야 함.

## External API

### 국세청 NTS validate API는 start_dt 없으면 항상 REQUEST_DATA_MALFORMED #coding #external-api #nts
`/api/nts-businessman/v1/validate`에 `b_no`와 `p_nm`만 보내면 HTTP 500 `REQUEST_DATA_MALFORMED` 반환.
공식 문서에 optional로 표기된 `start_dt`(개업일자, YYYYMMDD)가 사실상 required임.
폼에서 개업일자를 입력받거나, 더미 `start_dt`를 포함해야 요청이 통과됨.

### 공공API에 한글을 JSON으로 보내도 서버에서 깨지면 해당 필드를 제외할 것 #coding #external-api
국세청 NTS API `p_nm`(대표자명)에 UTF-8 한글을 보내도 응답에서 `������`로 반환되어 매칭이 항상 `valid: "02"`.
encoding/charset 변환 시도(EUC-KR, Unicode escape 등)가 모두 실패할 경우,
해당 필드를 제거하고 다른 식별자 조합(`b_no + start_dt`)으로 진위확인 범위를 좁히는 것이 가장 실용적.

### Vercel Function Log External APIs 섹션으로 서버사이드 외부 API 타임아웃 진단 #coding #vercel #debugging
Vercel Function Log의 "External APIs" 섹션은 함수에서 호출한 외부 HTTP 요청의 URL과 응답 시간을 보여줌.
`DOMException [TimeoutError]`와 Execution Duration이 `maxDuration`에 근접하면 외부 API 무응답이 원인.
로컬에서 재현이 어려운 서버사이드 타임아웃 문제는 이 섹션으로 가장 빠르게 진단 가능.

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
