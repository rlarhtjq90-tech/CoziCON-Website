import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2, Phone, MapPin, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: '통신판매업 정보 | CastBid',
}

const BIZ_INFO = [
  { label: '상호', value: 'CastBid' },
  { label: '대표자', value: '홍길동' },
  { label: '사업자등록번호', value: '000-00-00000' },
  { label: '통신판매업 신고번호', value: '제2025-서울강남-00000호' },
  { label: '사업장 주소', value: '서울특별시 강남구 테헤란로 000' },
  { label: '고객센터', value: '1600-0000 (평일 09:00 – 18:00)' },
  { label: '이메일', value: 'support@CastBid.co.kr' },
  { label: '호스팅 사업자', value: 'Vercel Inc.' },
]

const BID_POLICY = [
  {
    title: '1. 입찰 공고 게시 원칙',
    content: `① 종합건설사는 실제 공사 발주 목적의 입찰공고만 게시할 수 있습니다.
② 허위 공고 또는 투기적 목적의 공고는 즉시 삭제되며, 해당 회원의 이용이 제한됩니다.
③ 공고 내용은 건설산업기본법 및 공정거래 관련 법령을 준수하여야 합니다.`,
  },
  {
    title: '2. 입찰 참여 원칙',
    content: `① 전문건설사는 보유 면허 범위 내의 공종에만 입찰할 수 있습니다.
② 마감 시각 이후의 입찰은 시스템에서 자동 차단됩니다.
③ 입찰가 담합 등 불공정 행위가 적발될 경우 회원 자격이 영구 정지됩니다.`,
  },
  {
    title: '3. 개찰 및 낙찰',
    content: `① 개찰은 공고에 명시된 개찰일시에 진행되며, 입찰 참여사의 입찰가가 공개됩니다.
② 낙찰자 선정권은 종합건설사에 있으며, 회사는 낙찰 결과에 관여하지 않습니다.
③ 낙찰 결과는 모든 참여사에게 이메일 및 인앱 알림으로 통보됩니다.`,
  },
  {
    title: '4. 분쟁 조정',
    content: `① 입찰 과정에서 발생한 분쟁은 우선 당사자 간 협의로 해결합니다.
② 협의 불성립 시 전자상거래 분쟁조정위원회 또는 대한상사중재원에 조정을 신청할 수 있습니다.
③ 회사는 중립적 입장에서 관련 기록을 제공하는 방식으로 분쟁 해결을 지원합니다.`,
  },
]

export default function LegalPage() {
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

      <main className="container-content py-12 space-y-6">
        {/* 통신판매업 정보 */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-ink-200 p-8 laptop:p-12">
          <div className="mb-8 pb-8 border-b border-ink-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
              <h1 className="text-t4 font-bold text-ink-700">통신판매업 사업자 정보</h1>
            </div>
            <p className="text-p14 text-ink-400">전자상거래 등에서의 소비자보호에 관한 법률 제13조에 따라 공시합니다.</p>
          </div>

          <dl className="grid gap-4">
            {BIZ_INFO.map(({ label, value }) => (
              <div key={label} className="grid grid-cols-[8rem_1fr] gap-4 py-3 border-b border-ink-200 last:border-0">
                <dt className="text-p14 font-medium text-ink-600">{label}</dt>
                <dd className="text-p14 text-ink-500">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* 입찰 운영 정책 */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-ink-200 p-8 laptop:p-12">
          <div className="mb-8 pb-8 border-b border-ink-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-t4 font-bold text-ink-700">입찰 운영 정책</h2>
            </div>
            <p className="text-p14 text-ink-400">시행일: 2025년 1월 1일 &nbsp;|&nbsp; 최종 수정: 2025년 5월 1일</p>
          </div>

          <div className="space-y-8">
            {BID_POLICY.map((section) => (
              <section key={section.title}>
                <h3 className="text-p16 font-semibold text-ink-700 mb-3">{section.title}</h3>
                <p className="text-p14 text-ink-500 leading-relaxed whitespace-pre-line">{section.content}</p>
              </section>
            ))}
          </div>
        </div>

        {/* 연락처 카드 */}
        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-ink-200 p-6 flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-p14 font-semibold text-ink-700">고객센터</p>
              <p className="text-p14 text-primary font-bold mt-1">1600-0000</p>
              <p className="text-p13 text-ink-400 mt-0.5">평일 09:00 – 18:00 (주말·공휴일 휴무)</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-ink-200 p-6 flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-p14 font-semibold text-ink-700">사업장 주소</p>
              <p className="text-p14 text-ink-500 mt-1">서울특별시 강남구</p>
              <p className="text-p14 text-ink-500">테헤란로 000</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-ink-200 bg-white mt-4">
        <div className="container-content py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-p13 text-ink-400">
          <p>© 2025 CastBid. All rights reserved.</p>
          <nav className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-primary transition-colors">이용약관</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">개인정보처리방침</Link>
            <Link href="/legal" className="text-primary font-medium">통신판매업 정보</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
