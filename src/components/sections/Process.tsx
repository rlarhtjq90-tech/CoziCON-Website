import { FileText, Search, BarChart2, CheckCircle2 } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import type { LucideIcon } from 'lucide-react'

interface Step {
  step: string
  Icon: LucideIcon
  title: string
  desc: string
}

const STEPS: Step[] = [
  {
    step: '01',
    Icon: FileText,
    title: '공사 등록',
    desc: '종합건설사가 공사 내역, 예산, 일정을 플랫폼에 등록합니다.',
  },
  {
    step: '02',
    Icon: Search,
    title: '입찰 참여',
    desc: '검증된 전문건설사들이 공사 내용을 확인하고 견적을 제출합니다.',
  },
  {
    step: '03',
    Icon: BarChart2,
    title: '비교 검토',
    desc: '종합건설사가 입찰가, 실적, 역량을 한눈에 비교합니다.',
  },
  {
    step: '04',
    Icon: CheckCircle2,
    title: '낙찰 확정',
    desc: '최적의 파트너를 선정하고 계약서를 플랫폼에서 바로 처리합니다.',
  },
]

export default function Process() {
  return (
    <section className="bg-white section-py" id="process">
      <div className="container-content">
        <div className="flex justify-center">
          <SectionHeader
            badge="입찰 프로세스"
            headline="4단계로 완성되는 건설 입찰"
            description="복잡한 건설 발주 과정을 디지털로 단순화했습니다."
          />
        </div>

        <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-4 gap-5 mt-12">
          {STEPS.map((step, idx) => (
            <div
              key={step.step}
              className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-brand-slate-100"
            >
              {/* Step Number */}
              <span className="text-p12 font-semibold text-primary-400 tracking-widest mb-3">
                STEP {step.step}
              </span>

              {/* Icon */}
              <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <step.Icon className="w-7 h-7 text-primary-500" />
              </div>

              <h3 className="text-t7 font-bold text-ink-700 mb-2">{step.title}</h3>
              <p className="text-p14 text-ink-500 leading-relaxed">{step.desc}</p>

              {/* Arrow connector (between cards, desktop only) */}
              {idx < STEPS.length - 1 && (
                <div className="hidden laptop:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 items-center justify-center text-ink-300 text-p18 z-10">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
