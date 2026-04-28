import { CheckCircle2 } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'

const AUDIENCES = [
  {
    tag: '종합건설사',
    tagStyle: 'bg-primary-100 text-primary-500',
    headline: '믿을 수 있는 전문건설사를\n빠르게 찾으세요',
    points: [
      '공종별 검증된 전문건설사 풀',
      '입찰 비교 대시보드 제공',
      '계약·세금계산서 자동화',
      '공사 이력 및 평점 시스템',
    ],
    cta: '원청사로 시작하기',
    cardBg: 'bg-white border border-ink-200',
    ctaStyle:
      'bg-primary text-white shadow-btn-glow hover:bg-primary-600',
    textColor: 'text-ink-700',
    descColor: 'text-ink-500',
    checkColor: 'text-primary-400',
  },
  {
    tag: '전문건설사',
    tagStyle: 'bg-gradient-blue45 text-white',
    headline: '내 역량에 맞는 공사를\n경쟁력 있게 수주하세요',
    points: [
      '전국 공사 발주 실시간 알림',
      '간편한 전자 입찰서 제출',
      '낙찰 후 계약 원스톱 처리',
      '실적 포트폴리오 자동 누적',
    ],
    cta: '하도급사로 시작하기',
    cardBg: 'bg-gradient-blue56',
    ctaStyle: 'bg-white text-primary hover:bg-primary-100',
    textColor: 'text-white',
    descColor: 'text-primary-200',
    checkColor: 'text-primary-300',
  },
]

export default function DualAudience() {
  return (
    <section className="section-py" style={{ background: '#f3f6fc' }} id="audience">
      <div className="container-content">
        <div className="flex justify-center">
          <SectionHeader
            badge="이용 대상"
            headline="발주사와 수주사 모두를 위한 플랫폼"
            description="CoziCON은 건설 생태계의 두 축을 하나로 연결합니다."
          />
        </div>

        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6 mt-12 max-w-4xl mx-auto">
          {AUDIENCES.map((aud) => (
            <article
              key={aud.tag}
              className={`rounded-3xl p-8 laptop:p-10 flex flex-col gap-6 shadow-card-md ${aud.cardBg}`}
            >
              {/* Tag */}
              <span className={`badge w-fit ${aud.tagStyle}`}>{aud.tag}</span>

              {/* Headline */}
              <h3
                className={`text-t4 font-bold whitespace-pre-line ${aud.textColor}`}
              >
                {aud.headline}
              </h3>

              {/* Points */}
              <ul className="flex flex-col gap-3">
                {aud.points.map((pt) => (
                  <li key={pt} className={`flex items-start gap-3 text-p16 ${aud.descColor}`}>
                    <CheckCircle2
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${aud.checkColor}`}
                    />
                    {pt}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="#contact"
                className={`mt-auto inline-flex items-center justify-center rounded-full px-6 py-3 text-p16 font-semibold transition-colors ${aud.ctaStyle}`}
              >
                {aud.cta}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
