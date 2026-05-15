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

### 알림·이메일 등 사이드 이펙트는 best-effort 래퍼로 격리 #coding #api-design
이메일·인앱 알림·로깅처럼 비즈니스 핵심이 아닌 사이드 이펙트가 실패하면 메인 응답이 500이 되는 문제 발생.
`src/lib/notify.ts`, `src/lib/email.ts`처럼 try/catch로 에러를 삼키고 `console.error`만 남기는 래퍼 함수로 분리할 것.
main 플로우 → 커밋 → 사이드 이펙트(best-effort) 순서를 지키면 실패해도 데이터 정합성에 영향 없음.

### 트랜잭션 이메일은 best-effort — 실패가 주요 API 응답을 막으면 안 됨 #coding #email
낙찰·계약 서명·관리자 승인 같은 API에서 이메일 발송 실패가 500을 반환하면 비즈니스 로직이 멈춤.
`send()` 함수는 에러를 catch해 `console.error`만 남기고 throw하지 않도록 래핑할 것.
이메일은 best-effort이며, 재시도·큐가 필요한 경우만 별도 처리.

### 기존 lib 파일에서 함수 임포트 전 exports 확인 필수 #coding #api-design
`src/lib/email.ts`에 `sendEmail`이 없는데도 임포트 시도 → 빌드 오류. 기존 모듈의 export 목록을 먼저 Read로 확인하거나, 새 기능을 추가해야 하면 해당 파일을 먼저 수정해야 함. 없는 함수를 있다고 가정하고 라우트를 먼저 작성하면 디버깅 시간이 늘어남.

### 이메일 발송 코드는 처음부터 lib 함수로 분리 #coding #email
라우트마다 `new Resend(...)` 인스턴스 생성과 HTML 인라인이 흩어지면 도메인·발신자 변경 시 누락 위험.
`src/lib/email.ts`에 함수로 정의하면 변경점이 한 곳에 집중되고, 라우트 코드가 단순해짐.

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

### claude-in-chrome은 localhost 및 chrome:// URL 스크린샷 불가 #coding #browser-automation
Chrome 확장 보안 정책상 `localhost`, `127.0.0.1`, `chrome://` 주소는 스크린샷/제어 불가.
로컬 개발 서버 테스트는 사용자가 직접 브라우저를 열어 확인해야 함 — 자동화 불가.

### 로그인 세션이 필요한 사이트 자동화는 CDP로 기존 Chrome에 붙는 것이 최선 #coding #browser-automation
Playwright로 새 브라우저 인스턴스를 열면 쿠키/세션이 없어 로그인부터 자동화해야 함.
`chromium.connectOverCDP('http://localhost:9222')`로 `chrome.exe --remote-debugging-port=9222`로 실행된 기존 브라우저에 붙으면 사람이 로그인한 세션을 그대로 재사용 가능.
사전에 Chrome을 `--remote-debugging-port=9222` 플래그로 시작해둬야 함.

### hidden 필드는 Playwright fill/click 대신 JS 직접 주입으로 처리 #coding #browser-automation
Playwright의 `fill()`, `click()`, `selectOption()`은 요소가 visible해야 동작하며 hidden/invisible 필드에서 TimeoutError 발생.
`page.evaluate()`로 `element.value = val; element.dispatchEvent(new Event('input', {bubbles:true}))`를 주입하면 visibility 체크 없이 값 설정 가능.
React/Vue 등 프레임워크 이벤트 시스템도 bubbles:true 이벤트를 dispatch해야 상태가 반영됨.

### textarea에서 ctrl+a + type 배치는 'a' 선행 타이핑 버그 유발 #coding #browser-automation
`browser_batch`에서 `ctrl+a`와 `type` 액션을 한 배치로 묶으면 타이밍 문제로 'a' 키가 먼저 입력되어 값 앞에 붙는 버그 발생.
`triple_click`으로 전체 선택 후 별도 배치 스텝에서 `type`으로 입력해야 정확하게 교체됨.

### Vercel 환경변수 ... 메뉴 Edit는 find() ref 클릭이 좌표보다 안정적 #coding #browser-automation
Vercel 환경변수 목록에서 `...` 드롭다운 → Edit 버튼을 좌표 기반 클릭하면 인접 항목을 잘못 클릭하거나 저장이 되지 않는 경우가 발생.
`find()` 도구로 Edit menuitem의 `ref_id`를 얻어 클릭하면 레이아웃 변화에 무관하게 정확히 동작함.

## Auth

### JWT 권한 플래그는 발급 시점에 고정 — 재로그인 전까지 갱신 불가 #coding #next-auth #auth
`isAdmin`, `role` 같은 플래그를 NextAuth JWT에 넣으면 토큰 만료 전까지 값이 바뀌지 않음.
관리자 추가/제거 시 기존 세션은 구 권한을 유지 → 재로그인이 필요.
즉각 반영이 중요하면 DB 기반 실시간 체크(`getServerSession` + DB 조회)로 보완해야 함.

### Anti-enumeration 패턴 구간엔 서버 로그를 남겨야 디버깅 가능 #coding #auth #debugging
"미가입 이메일 → silent success" 보안 패턴은 프론트에서 실패 원인을 숨겨 디버깅이 불가능함.
`console.log('[forgot-password] user:', !!user, 'password:', !!user?.password)` 한 줄로
Vercel Function Log에서 실제 DB 상태를 즉시 확인할 수 있음 — 보안은 유지하면서 서버 로그만 남길 것.

### 같은 테이블 재활용 시 prefix로 용도 구분 — DB 마이그레이션 없음 #coding #prisma #auth
`VerificationToken` 같은 범용 토큰 테이블을 회원가입(`email`)과 비밀번호 재설정(`pw-reset:email`)에 함께 쓸 때 identifier에 prefix를 붙이면 충돌 없이 DB 변경 없이 기능 추가 가능.
새 용도마다 별도 모델 추가하는 것보다 빠르며, prefix를 상수로 관리하면 실수도 방지됨.

### 로컬 NextAuth 셋업 시 NEXTAUTH_SECRET 누락 → ?error=Configuration #coding #next-auth
`.env.local`에 `NEXTAUTH_SECRET`이 없으면 로그인 시 `/api/auth/error?error=Configuration`으로 리다이렉트되며 로그인 자체가 불가능함.
로컬 셋업 체크리스트에 `NEXTAUTH_SECRET`(임의 문자열 가능)과 `NEXTAUTH_URL=http://localhost:{port}`를 반드시 포함해야 함.

## Tooling

### PowerShell에서 URL 내 & 문자는 백틱으로 이스케이프 필요 #coding #windows #tooling
PowerShell은 `&`를 명령 연결자로 해석해 `sslmode=require&channel_binding=require` 같은 URL이 잘못 파싱됨.
`$env:DATABASE_URL="...&sslmode=require"` 설정 시 `&` 앞에 백틱(`` ` ``)을 붙여야 함 (`` `& ``).

## Next.js / React

### App Router 목록 필터는 URL searchParams + 서버 Prisma 쿼리 조합이 최선 #coding #next-js
클라이언트 상태로 필터를 관리하면 URL 공유·북마크·SSR이 모두 별도 구현 필요.
`searchParams` prop을 받아 Prisma `where` 절에 바로 전달하면 공짜로 해결됨.
클라이언트 컴포넌트는 `router.push()`로 URL만 업데이트하고 렌더링은 서버에 맡길 것.

### Server → Client 경계에서 Prisma DateTime 필드는 명시적으로 직렬화할 것 #coding #next-js #prisma
`{ ...prismaRecord }` 스프레드로 Server Component에서 Client Component에 전달하면 `createdAt`, `updatedAt` 등 Date 객체가 직렬화 오류를 일으킴.
필요한 필드만 명시적으로 선택하고 `.toISOString()` 변환 후 전달해야 함. TypeScript는 이 오류를 컴파일 타임에 잡지 못함.

## DB / Prisma

### Prisma BigInt 필드는 API 경계에서 Number로 변환 필요 #coding #prisma #next-js
`BigInt`는 `JSON.stringify`가 지원하지 않아 API 응답에 포함되면 런타임 에러 발생.
프론트에서 전송 시 `Number(value)`로 변환 후 전송, 서버에서 수신 시 `BigInt(value)`로 복원.
Prisma 응답을 그대로 NextResponse.json()에 넣으면 BigInt 필드가 있을 때 에러가 나므로
응답 전 직렬화 단계 추가 또는 `estimatedPrice: Number(notice.estimatedPrice)` 명시적 변환 필요.

### `@updatedAt` 추가 시 `@default(now())`도 함께 써야 함 #coding #prisma #vercel
기존 행이 있는 테이블에 `@updatedAt`만 추가하면 `prisma db push`가 실패 — 기존 행의 null 처리 불가.
`updatedAt DateTime @default(now()) @updatedAt` 형태로 항상 세트로 써야 함. 로컬 빌드가 정상이어도 Vercel 배포 시 블로커가 될 수 있음.

### Windows에서 `npm install` 후 브랜치 전환 전 `package-lock.json` 복원 필요 #coding #git #windows
`npm install`을 실행하면 `package-lock.json`이 로컬에서 변경됨. 이 상태에서 `git checkout`을 시도하면 "Your local changes would be overwritten" 오류로 전환 실패.
브랜치 전환 전에 `git restore package-lock.json`으로 먼저 되돌려야 함.

### Windows dev 서버 실행 중 `prisma generate`는 EPERM으로 실패 — `--no-engine`으로 우회 #coding #prisma #windows
`prisma db push`나 `prisma generate`는 내부적으로 query_engine-windows.dll.node를 rename함.
dev 서버가 해당 DLL을 점유 중이면 EPERM 발생.
서버를 멈추기 어려운 상황에선 `npx prisma generate --no-engine`으로 TypeScript 타입만 생성 가능.
이 경우 엔진 바이너리는 교체되지 않으므로 새 모델 쿼리는 dev 서버 재시작 후 완전히 적용됨.

### prisma db push 후 실행 중인 dev 서버는 반드시 재시작 #coding #prisma #next-js
`prisma db push`가 `prisma generate`를 함께 실행해도, 이미 실행 중인 Next.js dev 서버는 메모리에 구버전 Prisma 클라이언트를 캐시하고 있음.
새 모델(예: `prisma.bidSubmission`)에 접근하면 런타임 에러가 발생. `prisma db push` 실행 후 dev 서버를 반드시 재시작해야 함.

### PowerShell에서 `.env.local` 수동 로드 후 `prisma db push` 실행 #coding #prisma #windows
Bash 도구(Claude Code)는 `.env.local`을 자동 로드하지 않아 `prisma db push` 실행 시 `Environment variable not found: DATABASE_URL_UNPOOLED` 오류 발생.
PowerShell에서 `Get-Content .env.local | ForEach-Object { if ($_ -match '^([^#=]+)=(.*)$') { [System.Environment]::SetEnvironmentVariable($Matches[1], $Matches[2], 'Process') } }` 후 `npx prisma db push`를 실행하면 해결됨.

### `prisma migrate dev`는 비대화형 환경에서 실패 → `prisma db push` 사용 #coding #prisma
Claude Code Bash 툴은 TTY가 없는 비대화형 환경이라 `prisma migrate dev`가 `Error: non-interactive` 로 실패함.
개발 중 빠른 스키마 적용엔 `prisma db push`를 사용. 마이그레이션 파일이 필요하면 사용자가 터미널에서 직접 실행.

### 로컬 Node 스크립트는 `.env.local`을 자동 로드하지 않음 #coding #prisma #next-js
Next.js dev 서버는 `.env.local` → `.env` 순으로 로드하지만, 독립 `node` 스크립트는 Prisma가 `.env`만 읽음.
서버와 스크립트의 DB 쿼리 결과가 다르게 보이는 원인이 될 수 있음. 스크립트에서 `.env.local`을 읽으려면 수동 파싱 필요.

## Deployment

### Vercel Hobby 빌드 상태는 대시보드로만 확인, 로컬 `next build` 백그라운드 실행 금지 #coding #vercel
Hobby 플랜은 동시 빌드 1개 제한. 이전 빌드 완료 전 새 푸시 시 Queued 상태로 1~2분 대기.
로컬에서 `npx next build`를 백그라운드로 여러 번 실행하면 출력 파일이 비거나 혼선이 생김. 빌드 결과 확인은 Vercel 대시보드 Deployments 탭으로만 할 것.

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

### Prisma enum을 `{ in: [...] }` 조건에 쓸 때 `as const` 배열은 타입 오류 #coding #prisma #typescript
`['PENDING', 'ACTIVE'] as const` 배열은 readonly여서 `ContractStatus[]`에 할당 불가. `as const` 제거도 `string[]`이 되어 불가. `ContractStatus[]` 타입을 명시하거나 `ContractStatus.PENDING` 같이 enum 멤버를 직접 배열에 넣어야 함.

### 상태 전이 API는 사이드 이펙트(자동 생성)에 멱등성 보장이 필수 #coding #prisma #api
낙찰 처리처럼 상태 변경 API가 Contract 같은 파생 레코드를 자동 생성할 때, PATCH가 두 번 호출되면 `@unique` 제약으로 P2002 에러가 발생.
사이드 이펙트 실행 전 `findUnique`로 이미 존재하는지 확인하거나, `upsert`를 쓰면 멱등성을 보장할 수 있음.

### `prisma db push`는 이미 동기화된 경우 안전 — 매 배포 전 확인 습관 권장 #coding #prisma #deployment
`prisma db push`가 "The database is already in sync with your Prisma schema."를 출력하면 아무 변경도 없음 — 멱등적으로 실행 가능.
스키마 변경이 있었는지 불확실할 때도 부담 없이 실행하면 됨. 단, `.env.local` 환경변수를 직접 인라인으로 넘겨야 Claude Code Bash 환경에서 DATABASE_URL을 인식함.

### Prisma CLI는 `.env.local`을 자동으로 읽지 않는다 #coding #prisma #deployment
`npx prisma db push`는 `.env`만 읽고 `.env.local`은 무시함. Next.js가 `.env.local`을 특별 취급하는 것과 달리 Prisma CLI는 표준 dotenv만 지원.
`npx --yes dotenv-cli -e .env.local -- npx prisma db push`로 우회하거나, `DATABASE_URL`을 `.env`에도 복사해두면 됨.

### Prisma include는 관계가 선언된 모델에서만 중첩 가능 #coding #prisma #typescript
`licenses`가 `Company`에 선언돼 있으면 `User.include`에 바로 `licenses`를 넣을 수 없음 — TypeScript 컴파일 오류 발생.
`user.include: { company: { include: { licenses: ... } } }` 형태로 중첩해야 하며, 매핑 시에도 `u.company?.licenses`로 접근해야 함.
API 추가 전에 schema.prisma에서 어느 모델에 관계가 정의됐는지 먼저 확인할 것.

### Prisma Json 컬럼에 `Record<string, unknown>` 직접 전달 시 타입 오류 #coding #prisma #typescript
`prisma.model.create({ data: { detail: params.detail } })`에서 `detail`이 `Record<string, unknown>` 타입이면 `NullableJsonNullValueInput | InputJsonValue` 불일치 오류 발생.
`params.detail as Prisma.InputJsonValue | undefined`로 캐스팅하거나 data 객체에서 명시적으로 분리해서 전달해야 함. `@prisma/client`에서 `Prisma` 네임스페이스를 import해야 함.

### 암호화된 컬럼은 DB 레벨 `orderBy` 불가 — 복호화 후 메모리 정렬 #coding #prisma #security
`proposedPrice`를 AES-256-GCM으로 암호화하면 DB에는 opaque Base64 문자열이 저장되므로 Prisma `orderBy: { proposedPrice: 'asc' }`가 의미 없어짐.
복호화 후 JavaScript `Array.sort()`로 정렬해야 함. 대용량이 아니면 성능 문제 없음.

### BigInt 리터럴(`0n`)은 TypeScript `target: ES2020` 이상 필요 #coding #typescript
`0n` 같은 BigInt 리터럴은 tsconfig `target`이 ES2020 미만이면 "BigInt literals are not available when targeting lower than ES2020" 에러 발생.
`if (a < b) return -1; if (a > b) return 1;` 방식으로 우회하거나 tsconfig `target`을 ES2020으로 올리면 됨.

### Vercel CLI는 비ASCII OS 사용자명에서 인증 실패 #ops #vercel
Vercel CLI 52.x는 로그인 시 OS 사용자명을 HTTP 헤더에 포함하는데, 한글 등 비ASCII 문자가 있으면 "invalid character in header content" 에러로 인증 불가.
Chrome 브라우저 자동화(MCP)로 Vercel 대시보드를 직접 조작하여 우회 가능.

### Neon Free 플랜은 PITR 6시간, 수동 스냅샷 1개 한도 #ops #database
Neon Free 플랜 History retention은 6시간 — 6시간 이전 데이터는 복구 불가.
수동 스냅샷은 1개까지 무료로 생성 가능(Beta). 중요 마일스톤마다 스냅샷 교체 권장. 스케줄 자동 백업은 Launch 플랜($19/월) 이상 필요.

### 외부 서비스 연동 코드는 env graceful-skip 패턴으로 미리 구현해두기 #coding #strategy #external-api
카카오 채널, 발신프로필, 템플릿 심사 등 외부 승인이 필요한 서비스는 코드 구현과 계정/심사 준비가 독립적으로 진행 가능.
`getConfig()` 가 null을 반환하면 경고 로그만 찍고 skip하는 패턴으로 구현하면, 계정이 없는 상태에서도 코드를 먼저 완성하고 env만 채울 때 즉시 활성화됨.

### 카카오 채널 URL은 개설 후 변경 불가 — 브랜드명 확정 후 생성할 것 #strategy #external-api
카카오 채널은 개설 시 `pf.kakao.com/_xxxxx` 형태의 URL이 고정됨. 채널명(서비스명)은 나중에 변경 가능하지만 URL은 불변.
브랜드명 미확정 상태에서 먼저 채널을 만들면 URL에 임시 식별자가 박혀 나중에 교체 불가 — 이름 확정 후 개설할 것.

### 서버 사이드 API 연동 오류는 진단 엔드포인트 노출이 가장 빠름 #coding #debugging
GET /api/[route] 진단 엔드포인트를 서버에 배포하면 환경변수 유무, 연결 상태, resultCode를
실제 Vercel 환경에서 한 번에 확인 가능. 로컬 추측보다 훨씬 빠르게 원인을 좁힐 수 있음.
