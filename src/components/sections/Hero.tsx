export default function Hero() {
  return (
    <section className="bg-gradient-hero section-py pt-20 laptop:pt-32">
      <div className="container-content">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Eyebrow Badge */}
          <span className="badge bg-primary-100 text-primary-500 mb-6">
            건설 입찰 디지털화의 시작
          </span>

          {/* Headline */}
          <h1 className="text-t3 tablet:text-t2 laptop:text-t1 font-bold text-ink-700">
            공사 발주부터 낙찰까지
            <br />
            스마트하게,{' '}
            <span className="text-primary-500">CoziCON</span>
          </h1>

          {/* Sub Copy */}
          <p className="text-p18 text-ink-500 mt-6 max-w-xl leading-relaxed">
            종합건설사는 검증된 전문건설사에게 빠르게 발주하고,
            <br className="hidden tablet:block" />
            전문건설사는 적합한 공사를 찾아 경쟁력 있게 입찰하세요.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col tablet:flex-row gap-3 mt-10 w-full tablet:w-auto">
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-white px-8 py-3.5 text-p16 font-semibold shadow-btn-glow hover:bg-primary-600 transition-colors"
            >
              무료로 시작하기 →
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-200 text-primary px-8 py-3.5 text-p16 font-semibold hover:bg-primary-100 transition-colors"
            >
              서비스 소개 보기
            </a>
          </div>
        </div>

        {/* Trust Pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-12">
          {['✓ 무료 등록', '✓ 공정한 경쟁 입찰', '✓ 계약서 자동화'].map((pill) => (
            <span
              key={pill}
              className="flex items-center gap-1.5 bg-white rounded-full px-4 py-2 text-p14 text-ink-500 shadow-card-sm border border-ink-200"
            >
              {pill}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
