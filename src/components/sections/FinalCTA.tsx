export default function FinalCTA() {
  return (
    <section className="bg-white section-py" id="contact">
      <div className="container-content">
        <div className="rounded-3xl bg-gradient-dark-cta px-8 py-16 laptop:py-20 flex flex-col items-center text-center">
          {/* Badge */}
          <span className="badge bg-white/10 text-white">
            지금 바로 시작하세요
          </span>

          {/* Headline */}
          <h2 className="text-t3 tablet:text-t2 font-bold text-white mt-4 max-w-2xl">
            CoziCON으로 더 스마트한
            <br />
            건설 입찰을 경험하세요
          </h2>

          {/* Sub Copy */}
          <p className="text-p18 text-primary-200 max-w-lg mt-4 leading-relaxed">
            종합건설사와 전문건설사 모두 무료로 시작할 수 있습니다.
            <br className="hidden tablet:block" />
            지금 바로 가입하고 첫 번째 공사를 등록하거나 입찰에 참여하세요.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col tablet:flex-row gap-4 mt-10">
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-full bg-white text-primary-500 px-8 py-4 text-p16 font-semibold shadow-card-md hover:bg-primary-100 transition-colors"
            >
              종합건설사로 시작하기
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-full border-2 border-white/40 text-white px-8 py-4 text-p16 font-semibold hover:border-white/80 hover:bg-white/10 transition-all"
            >
              전문건설사로 시작하기
            </a>
          </div>

          {/* Fine Print */}
          <p className="text-p13 text-primary-300 mt-6">
            신용카드 불필요 · 계약 없음 · 언제든지 탈퇴 가능
          </p>
        </div>
      </div>
    </section>
  )
}
