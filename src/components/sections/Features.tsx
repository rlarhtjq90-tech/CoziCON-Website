import { Zap, Shield, FileCheck, BarChart3 } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import type { LucideIcon } from 'lucide-react'

interface Feature {
  Icon: LucideIcon
  title: string
  desc: string
  iconBg: string
  iconColor: string
}

const FEATURES: Feature[] = [
  {
    Icon: Zap,
    title: '실시간 입찰 알림',
    desc: '새 공사가 등록되면 관련 공종의 전문건설사에게 즉시 알림을 발송합니다. 기회를 놓치지 마세요.',
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-400',
  },
  {
    Icon: Shield,
    title: '업체 신뢰도 검증',
    desc: '사업자 등록증, 건설업 면허, 실적 서류를 자동으로 검증합니다. 미검증 업체와의 거래 리스크를 줄입니다.',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-500',
  },
  {
    Icon: FileCheck,
    title: '전자 계약 자동화',
    desc: '낙찰 확정 즉시 표준 건설 하도급 계약서가 자동 생성됩니다. 도장 없이 전자서명으로 체결하세요.',
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-500',
  },
  {
    Icon: BarChart3,
    title: '입찰가 분석 대시보드',
    desc: '과거 낙찰 데이터와 시장 단가를 기반으로 적정 입찰가를 추천합니다. 데이터 기반으로 전략을 수립하세요.',
    iconBg: 'bg-brand-slate-100',
    iconColor: 'text-primary-400',
  },
]

export default function Features() {
  return (
    <section className="bg-white section-py" id="features">
      <div className="container-content">
        <div className="flex justify-center">
          <SectionHeader
            badge="핵심 기능"
            headline="입찰 과정의 모든 불편함을 해결합니다"
            description="전화, 팩스, 발품 없이 플랫폼 하나로 건설 입찰을 완성하세요."
          />
        </div>

        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-5 mt-12">
          {FEATURES.map((feat) => (
            <div
              key={feat.title}
              className="rounded-2xl p-6 laptop:p-8 bg-brand-slate-100 flex flex-col gap-4 shadow-card-sm
                         hover:shadow-card-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${feat.iconBg}`}
              >
                <feat.Icon className={`w-6 h-6 ${feat.iconColor}`} />
              </div>
              <h3 className="text-t7 font-bold text-ink-700">{feat.title}</h3>
              <p className="text-p14 text-ink-500 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
