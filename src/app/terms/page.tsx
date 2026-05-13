import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '이용약관 | CoziCON',
}

const SECTIONS = [
  {
    title: '제1조 (목적)',
    content: `이 약관은 주식회사 CoziCON(이하 "회사")이 운영하는 건설 입찰 플랫폼 CoziCON(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리·의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.`,
  },
  {
    title: '제2조 (정의)',
    content: `① "서비스"란 회사가 제공하는 건설공사 입찰 중개 플랫폼 및 이에 부수되는 일체의 서비스를 의미합니다.
② "회원"이란 이 약관에 동의하고 회사와 이용계약을 체결한 자를 말합니다.
③ "종합건설사"란 건설산업기본법상 종합건설업 면허를 보유하고, 공사를 발주하기 위해 서비스를 이용하는 법인 또는 개인을 말합니다.
④ "전문건설사"란 건설산업기본법상 전문건설업 면허를 보유하고, 입찰에 참여하기 위해 서비스를 이용하는 법인 또는 개인을 말합니다.
⑤ "입찰공고"란 종합건설사가 서비스를 통해 게시하는 공사 발주 정보를 말합니다.`,
  },
  {
    title: '제3조 (약관의 효력 및 변경)',
    content: `① 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.
② 회사는 관련 법령을 위배하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 최소 7일 전(이용자에게 불리한 변경의 경우 30일 전) 서비스 내 공지합니다.
③ 이용자가 변경 약관의 적용일 이후에도 서비스를 계속 이용할 경우 변경 약관에 동의한 것으로 봅니다.`,
  },
  {
    title: '제4조 (이용계약의 체결)',
    content: `① 이용계약은 이용자가 약관의 내용에 동의하고 회원가입을 신청하면, 회사가 이를 승낙함으로써 체결됩니다.
② 회사는 다음 각 호에 해당하는 신청에 대해 승낙을 거부하거나 사후에 이용계약을 해지할 수 있습니다.
1. 실명이 아니거나 타인의 정보를 도용한 경우
2. 허위 정보를 기재하거나 회사가 요구하는 정보를 제공하지 않은 경우
3. 이전에 이용약관 위반으로 서비스 이용이 제한된 이력이 있는 경우
4. 관련 법령에 위반되거나 사회질서에 반하는 목적으로 신청한 경우`,
  },
  {
    title: '제5조 (서비스 이용 자격)',
    content: `① 서비스를 통해 입찰공고를 게시하거나 입찰에 참여하려는 회원은 관련 법령에 따른 건설업 등록·면허를 보유해야 하며, 사업자등록증 및 건설업등록증 등 회사가 요구하는 서류를 제출하여 인증을 완료하여야 합니다.
② 관리자 승인이 완료되기 전까지는 서비스의 핵심 기능(공고 게시, 입찰 참여)을 이용할 수 없습니다.
③ 면허 유효기간 만료 또는 행정처분으로 면허가 취소·정지된 경우, 이를 즉시 회사에 통보하여야 합니다.`,
  },
  {
    title: '제6조 (회원의 의무)',
    content: `① 회원은 관계 법령, 이 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항을 준수하여야 합니다.
② 회원은 다음 각 호에 해당하는 행위를 하여서는 안 됩니다.
1. 타인의 정보 도용 및 허위 정보 등록
2. 회사의 지식재산권 침해
3. 서비스 운영을 방해하거나 안정적 운영을 저해하는 행위
4. 입찰 가격 담합 또는 공정거래법에 위반되는 행위
5. 기타 관계 법령에 위반되는 행위
③ 회원은 계정 정보(아이디·비밀번호)를 타인에게 양도·대여하거나 공유하여서는 안 됩니다.`,
  },
  {
    title: '제7조 (서비스의 제공 및 중단)',
    content: `① 회사는 특별한 사유가 없는 한 연중무휴·1일 24시간 서비스를 제공합니다.
② 다음 각 호의 경우 서비스 제공을 일시 중단할 수 있습니다.
1. 시스템 정기 점검, 증설 또는 교체
2. 천재지변, 국가비상사태, 정전 등 불가항력적 사유
3. 전기통신사업법에 규정된 기간통신사업자가 서비스를 중단한 경우
③ 회사는 서비스 중단 시 사전에 공지하며, 부득이한 경우 사후에 공지할 수 있습니다.`,
  },
  {
    title: '제8조 (입찰 관련 책임)',
    content: `① 서비스는 종합건설사와 전문건설사 간의 거래를 중개하는 플랫폼으로, 실제 계약의 당사자는 회원 간입니다.
② 회사는 회원 간 거래에서 발생하는 분쟁, 손해에 대해 관련 법령이 정하는 범위를 초과하여 책임을 지지 않습니다.
③ 입찰금액, 공사기간 등 입찰 내용의 정확성 및 이행에 대한 책임은 해당 회원에게 있습니다.`,
  },
  {
    title: '제9조 (개인정보 보호)',
    content: `회사는 이용자의 개인정보를 중요시하며, 관련 법령이 정하는 바에 따라 개인정보를 보호합니다. 개인정보 처리에 관한 상세한 사항은 별도로 공시하는 "개인정보처리방침"에서 정합니다.`,
  },
  {
    title: '제10조 (책임 제한)',
    content: `① 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 책임을 지지 않습니다.
② 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.
③ 회사는 무료로 제공하는 서비스의 이용과 관련하여 관련 법령에 특별한 규정이 없는 한 책임을 지지 않습니다.`,
  },
  {
    title: '제11조 (분쟁 해결)',
    content: `① 서비스 이용과 관련하여 분쟁이 발생한 경우 회사와 이용자는 성실히 협의합니다.
② 협의가 이루어지지 않을 경우, 전자상거래 등에서의 소비자보호에 관한 법률 제20조에 따른 조정 신청 또는 소송을 통해 해결합니다.
③ 이 약관에 관한 소송은 회사의 본사 소재지를 관할하는 법원을 전속 관할 법원으로 합니다.`,
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-brand-slate-100">
      <header className="bg-white border-b border-ink-200">
        <div className="container-content h-16 flex items-center justify-between">
          <Link href="/" className="text-t6 font-bold text-primary tracking-tight">CoziCON</Link>
          <Link href="/dashboard" className="text-p14 text-ink-400 hover:text-primary transition-colors">
            대시보드로 돌아가기
          </Link>
        </div>
      </header>

      <main className="container-content py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-ink-200 p-8 laptop:p-12">
          <div className="mb-8 pb-8 border-b border-ink-200">
            <h1 className="text-t4 font-bold text-ink-700 mb-2">이용약관</h1>
            <p className="text-p14 text-ink-400">시행일: 2025년 1월 1일 &nbsp;|&nbsp; 최종 수정: 2025년 5월 1일</p>
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
              주식회사 CoziCON &nbsp;|&nbsp; 사업자등록번호: 000-00-00000
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
          <p>© 2025 CoziCON. All rights reserved.</p>
          <nav className="flex items-center gap-4">
            <Link href="/terms" className="text-primary font-medium">이용약관</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">개인정보처리방침</Link>
            <Link href="/legal" className="hover:text-primary transition-colors">통신판매업 정보</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
