import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '개인정보처리방침 | CastBid',
}

const SECTIONS = [
  {
    title: '1. 수집하는 개인정보 항목',
    content: `■ 회원가입 시
- 필수: 이메일 주소, 비밀번호, 휴대전화번호, 이름
- 선택: 직함

■ 사업자 인증 시
- 필수: 사업자등록번호, 법인명(상호), 대표자명, 개업일, 사업자등록증 사본
- 종합/전문건설사: 건설업등록번호, 면허 종목, 건설업등록증 사본

■ 서비스 이용 과정에서 자동 생성·수집되는 정보
- 접속 IP 주소, 쿠키, 접속 일시, 서비스 이용 기록`,
  },
  {
    title: '2. 개인정보 수집·이용 목적',
    content: `① 회원 관리: 회원 식별, 가입 의사 확인, 부정 이용 방지
② 서비스 제공: 입찰공고 게시·열람, 입찰 참여, 계약 중개
③ 사업자 인증: 건설업 면허 보유 여부 확인, 관리자 승인 처리
④ 고객 지원: 불만 처리, 공지사항 전달
⑤ 이메일 발송: 낙찰 결과, 계약 서명 요청 등 거래 관련 안내
⑥ 법적 의무 이행: 관련 법령에 따른 기록 보존`,
  },
  {
    title: '3. 개인정보 보유 및 이용 기간',
    content: `① 회원 탈퇴 시 지체 없이 파기합니다. 단, 관련 법령에 따라 보존이 필요한 경우 아래와 같이 보관합니다.

- 계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)
- 소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)
- 접속에 관한 기록: 3개월 (통신비밀보호법)
- 사업자 인증 서류 및 승인 내역: 5년 (건설산업기본법 관련 분쟁 대비)

② 부정 이용 방지를 위해 탈퇴 후 1년간 이메일 주소를 보관합니다.`,
  },
  {
    title: '4. 개인정보의 제3자 제공',
    content: `회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.

① 이용자가 사전에 동의한 경우
② 법령의 규정에 의거하거나, 수사 목적으로 법령이 정한 절차와 방법에 따라 수사기관이 요구한 경우
③ 입찰 진행 시 낙찰 결과를 상대방 당사자(종합건설사 ↔ 전문건설사)에게 제공하는 경우 (이름·연락처에 한함)`,
  },
  {
    title: '5. 개인정보처리 위탁',
    content: `회사는 서비스 향상을 위하여 아래와 같이 개인정보 처리를 위탁하고 있습니다.

| 수탁사 | 위탁 업무 | 보유 기간 |
|--------|-----------|-----------|
| Resend Inc. | 이메일 발송 | 위탁 계약 종료 시 |
| Vercel Inc. | 서비스 인프라 운영 | 위탁 계약 종료 시 |
| Neon Inc. | 데이터베이스 운영 | 위탁 계약 종료 시 |

위탁 계약 시 개인정보보호법 제26조에 따라 위탁 계약 내용을 문서로 체결하고, 수탁사가 개인정보를 안전하게 처리하는지 감독합니다.`,
  },
  {
    title: '6. 정보주체의 권리·의무',
    content: `이용자는 언제든지 다음의 권리를 행사할 수 있습니다.

① 개인정보 열람 요구
② 개인정보 오류 정정 요구
③ 개인정보 삭제 요구
④ 개인정보 처리 정지 요구

권리 행사는 서비스 내 [계정 설정] 메뉴 또는 아래 개인정보 보호책임자에게 서면, 이메일로 연락하면 지체 없이 처리합니다.`,
  },
  {
    title: '7. 개인정보의 파기',
    content: `① 전자적 파일 형태: 복구 불가능한 방법으로 영구 삭제
② 종이 문서(사업자등록증 사본 등): 분쇄기 또는 소각 처리

개인정보 보유기간 경과, 처리 목적 달성 등 해당 개인정보가 불필요하게 되었을 때에는 지체 없이(5일 이내) 파기합니다.`,
  },
  {
    title: '8. 개인정보의 안전성 확보 조치',
    content: `① 개인정보 암호화: 비밀번호, 사업자번호 등 민감 정보는 암호화 저장
② 접근 통제: 개인정보처리시스템에 대한 접근 권한 관리 및 비인가자 차단
③ 접속기록 보관: 최소 6개월 이상 접속 기록 보관 및 관리
④ 보안프로그램 설치: 악성 프로그램으로 인한 개인정보 유출·훼손 방지
⑤ 물리적 보호: 서버실, 자료보관실 등 물리적 접근 통제`,
  },
  {
    title: '9. 개인정보 보호책임자',
    content: `개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.

▶ 개인정보 보호책임자
- 성명: 홍길동
- 직책: 대표이사
- 연락처: privacy@CastBid.co.kr

정보주체는 개인정보보호법 제35조에 따른 개인정보의 열람 청구를 아래의 기관에 할 수 있습니다.
▶ 개인정보보호위원회: www.pipc.go.kr / 국번없이 182
▶ 한국인터넷진흥원 개인정보침해신고센터: privacy.kisa.or.kr / 국번없이 118`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-brand-slate-100">
      <header className="bg-white border-b border-ink-200">
        <div className="container-content h-16 flex items-center justify-between">
          <Link href="/" className="text-t6 font-bold text-primary tracking-tight">CastBid</Link>
          <Link href="/dashboard" className="text-p14 text-ink-400 hover:text-primary transition-colors">
            대시보드로 돌아가기
          </Link>
        </div>
      </header>

      <main className="container-content py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-ink-200 p-8 laptop:p-12">
          <div className="mb-8 pb-8 border-b border-ink-200">
            <h1 className="text-t4 font-bold text-ink-700 mb-2">개인정보처리방침</h1>
            <p className="text-p14 text-ink-400">시행일: 2025년 1월 1일 &nbsp;|&nbsp; 최종 수정: 2025년 5월 1일</p>
            <p className="text-p14 text-ink-500 mt-3 leading-relaxed">
              CastBid(이하 &quot;회사&quot;)은 개인정보보호법 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보처리방침을 수립·공개합니다.
            </p>
          </div>

          <div className="space-y-8">
            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="text-p16 font-semibold text-ink-700 mb-3">{section.title}</h2>
                <p className="text-p14 text-ink-500 leading-relaxed whitespace-pre-line">{section.content}</p>
              </section>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-ink-200">
            <p className="text-p13 text-ink-400">
              CastBid &nbsp;|&nbsp; 사업자등록번호: 000-00-00000
              &nbsp;|&nbsp; 대표: 홍길동
            </p>
            <p className="text-p13 text-ink-400 mt-1">
              서울특별시 강남구 테헤란로 000 &nbsp;|&nbsp; 고객센터: 1600-0000
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-ink-200 bg-white mt-4">
        <div className="container-content py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-p13 text-ink-400">
          <p>© 2025 CastBid. All rights reserved.</p>
          <nav className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-primary transition-colors">이용약관</Link>
            <Link href="/privacy" className="text-primary font-medium">개인정보처리방침</Link>
            <Link href="/legal" className="hover:text-primary transition-colors">통신판매업 정보</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
