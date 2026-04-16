import { Youtube, Instagram, Twitter } from 'lucide-react'

const FOOTER_LINKS = {
  서비스: ['서비스 소개', '입찰 프로세스', '요금 안내', '파트너 현황'],
  고객지원: ['공지사항', 'FAQ', '1:1 문의', '사용 가이드'],
  '법적 고지': ['이용약관', '개인정보 처리방침', '입찰 운영 정책'],
}

export default function Footer() {
  return (
    <footer className="bg-brand-slate-700 text-white" id="contact">
      <div className="container-content py-12 laptop:py-16">
        <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-4 gap-10 laptop:gap-12">
          {/* Brand Column */}
          <div className="tablet:col-span-2 laptop:col-span-1">
            <div className="text-t6 font-bold text-white">CoziCON</div>
            <p className="text-p14 text-brand-slate-400 mt-2">건설 입찰 디지털화의 시작</p>
            <div className="mt-6 text-p12 text-brand-slate-400 leading-relaxed space-y-1">
              <p>(주)CoziCON &nbsp;|&nbsp; 대표: 홍길동</p>
              <p>사업자등록번호: 000-00-00000</p>
              <p>통신판매업신고: 제2024-서울-00000호</p>
              <p>서울특별시 강남구 테헤란로 000</p>
              <p className="pt-1">고객센터: 1600-0000</p>
              <p>평일 09:00 – 18:00 (주말·공휴일 휴무)</p>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-p14 font-semibold text-white mb-4">{title}</h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-p14 text-brand-slate-400 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col tablet:flex-row justify-between items-center gap-4">
          <p className="text-p13 text-brand-slate-400">
            © 2024 CoziCON. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {[
              { Icon: Youtube, label: 'YouTube' },
              { Icon: Instagram, label: 'Instagram' },
              { Icon: Twitter, label: 'Twitter' },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="text-brand-slate-400 hover:text-white transition-colors"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
