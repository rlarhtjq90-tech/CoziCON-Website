'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'

const FAQS = [
  {
    q: 'CoziCON은 무료로 사용할 수 있나요?',
    a: '네, 현재 CoziCON은 종합건설사·전문건설사 모두 무료로 가입하고 이용할 수 있습니다. 향후 고급 분석·우선 노출 등 유료 기능이 추가될 수 있으나, 핵심 입찰 기능은 무료로 유지됩니다.',
  },
  {
    q: '이용하려면 어떤 자격이 필요한가요?',
    a: '사업자등록증과 건설산업기본법에 따른 건설업 면허(종합건설업 또는 전문건설업 등록증)가 필요합니다. 가입 후 서류를 업로드하면 관리자 확인을 거쳐 서비스가 활성화됩니다.',
  },
  {
    q: '사업자 인증 완료까지 얼마나 걸리나요?',
    a: '일반적으로 서류 제출 후 영업일 기준 1~2일 내에 처리됩니다. 서류가 미비하거나 추가 확인이 필요한 경우 이메일로 안내해 드립니다.',
  },
  {
    q: '입찰에 참여하면 경쟁사 입찰가를 볼 수 있나요?',
    a: '아니요. 마감 전까지는 본인의 입찰 내용만 확인할 수 있으며, 종합건설사도 마감 전에는 입찰가를 볼 수 없습니다. 개찰 일시 이후에만 모든 참여사의 입찰가가 공개됩니다.',
  },
  {
    q: '낙찰 후 계약은 어떻게 진행되나요?',
    a: '낙찰 확정 즉시 플랫폼 내 계약 시스템이 활성화됩니다. 종합건설사와 전문건설사 양측이 전자서명을 완료하면 계약이 성립됩니다. 별도의 종이 계약서 없이 진행됩니다.',
  },
  {
    q: '입찰 마감 후 입찰을 취소할 수 있나요?',
    a: '마감 시각 이전에는 입찰 수정·철회가 가능합니다. 마감 이후에는 시스템에서 변경이 차단되며, 개찰·낙찰 과정이 진행됩니다.',
  },
  {
    q: '지명 입찰(특정 업체만 참여)은 어떻게 설정하나요?',
    a: '공고 작성 시 "입찰방식"에서 "지명 입찰"을 선택한 후, 초대할 전문건설사를 검색해 지정할 수 있습니다. 지명된 업체에게는 초대 알림이 발송됩니다.',
  },
  {
    q: '첨부파일(도면, 시방서 등) 용량 제한이 있나요?',
    a: '파일 1개당 최대 100MB, 공고 1건당 최대 10개 파일을 첨부할 수 있습니다. DWG, PDF, HWP, Excel 등 주요 건설 도서 형식을 모두 지원합니다.',
  },
  {
    q: '낙찰 결과는 어떤 방식으로 통보되나요?',
    a: '낙찰·탈락 결과가 확정되는 즉시 이메일과 플랫폼 내 알림으로 동시에 발송됩니다. 알림 설정에서 수신 방법을 조정할 수 있습니다.',
  },
  {
    q: '거래 과정에서 분쟁이 발생하면 어떻게 해결하나요?',
    a: '플랫폼에 기록된 입찰 내역, Q&A, 계약서 등을 근거로 당사자 간 협의를 먼저 권장합니다. 협의가 어려운 경우, 전자상거래 분쟁조정위원회 또는 대한상사중재원에 조정을 신청할 수 있으며, CoziCON은 관련 기록을 제공하는 방식으로 지원합니다.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="bg-white section-py" id="faq">
      <div className="container-content">
        <div className="flex justify-center">
          <SectionHeader
            badge="자주 묻는 질문"
            headline="궁금한 점을 해결하세요"
            description="더 궁금한 사항은 1:1 문의로 언제든지 연락주세요."
          />
        </div>

        <div className="max-w-2xl mx-auto mt-12 space-y-2">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="border border-ink-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === idx ? null : idx)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-brand-slate-100 transition-colors"
                aria-expanded={open === idx}
              >
                <span className="text-p16 font-semibold text-ink-700">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-ink-400 shrink-0 transition-transform duration-200 ${open === idx ? 'rotate-180' : ''}`}
                />
              </button>
              {open === idx && (
                <div className="px-6 pb-5 text-p14 text-ink-500 leading-relaxed border-t border-ink-200 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <a
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-ink-200 text-ink-600 px-6 py-3 text-p14 font-medium hover:border-primary hover:text-primary transition-colors"
          >
            더 궁금한 점이 있으신가요? 1:1 문의하기 →
          </a>
        </div>
      </div>
    </section>
  )
}
