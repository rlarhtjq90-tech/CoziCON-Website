import { InteractiveImageAccordion } from '@/components/ui/interactive-image-accordion'

export default function WorkTypeSection() {
  return (
    <section className="pt-16 pb-16 laptop:pt-24 laptop:pb-24 bg-white overflow-hidden" id="work-types">
      <div className="container-content">
        <div className="flex flex-col laptop:flex-row items-center gap-12 laptop:gap-16">

          {/* Left: Text */}
          <div className="w-full laptop:w-[420px] flex-shrink-0 flex flex-col gap-6 text-center laptop:text-left items-center laptop:items-start">
            <span className="badge bg-primary-100 text-primary-500">공종별 입찰</span>

            <h2 className="text-t3 laptop:text-t2 font-bold text-ink-700 leading-tight">
              모든 공종의 입찰을
              <br />
              한 곳에서 관리하세요
            </h2>

            <p className="text-p18 text-ink-500 leading-relaxed max-w-sm">
              토목·건축·인테리어·설비·조경까지,
              다양한 공종의 발주·수주를
              CoziCON 플랫폼 하나로 해결합니다.
            </p>

            <ul className="flex flex-col gap-2.5 text-left">
              {[
                '공종별 전문건설사 자동 매칭',
                '발주사 검증 면허 실시간 확인',
                '입찰 마감·알림 자동화',
              ].map((pt) => (
                <li key={pt} className="flex items-center gap-2.5 text-p15 text-ink-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                  {pt}
                </li>
              ))}
            </ul>

            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-full bg-primary-500 text-white px-8 py-3.5 text-p16 font-semibold shadow-btn-glow hover:bg-primary-600 transition-colors mt-2"
            >
              무료로 시작하기 →
            </a>
          </div>

          {/* Right: Accordion */}
          <div className="w-full laptop:flex-1 min-w-0">
            <InteractiveImageAccordion />
          </div>

        </div>
      </div>
    </section>
  )
}
