'use client'

import { useState, useRef } from 'react'
import { Building2, HardHat, Upload, CheckCircle2, X } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'

type CompanyType = 'general' | 'specialist' | null

export default function SignupStart() {
  const [selected, setSelected] = useState<CompanyType>(null)
  const [fileName, setFileName] = useState<string>('')
  const [submitted, setSubmitted] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  const handleSelect = (type: CompanyType) => {
    if (selected === type) {
      setSelected(null)
      setFileName('')
      setSubmitted(false)
      return
    }
    setSelected(type)
    setFileName('')
    setSubmitted(false)
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 300)
  }

  return (
    <section className="section-py" style={{ background: '#f3f6fc' }} id="signup">
      <div className="container-content">
        <div className="flex justify-center">
          <SectionHeader
            badge="회원가입"
            headline="어떤 유형으로 시작하시겠어요?"
            description="회원 유형을 선택하고 사업자등록증을 업로드해 인증을 시작하세요."
          />
        </div>

        {/* 유형 선택 카드 */}
        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6 mt-12 max-w-2xl mx-auto">
          {/* 종합건설사 */}
          <button
            onClick={() => handleSelect('general')}
            className={`rounded-2xl p-8 flex flex-col items-center gap-4 border-2 transition-all duration-200 cursor-pointer text-center ${
              selected === 'general'
                ? 'border-primary-500 bg-white shadow-card-md'
                : 'border-ink-200 bg-white hover:border-primary-300 hover:shadow-card-sm'
            }`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              selected === 'general' ? 'bg-primary-500' : 'bg-primary-100'
            }`}>
              <Building2 className={`w-7 h-7 transition-colors ${
                selected === 'general' ? 'text-white' : 'text-primary-500'
              }`} />
            </div>
            <div>
              <p className="text-t7 font-bold text-ink-700">종합건설사</p>
              <p className="text-p14 text-ink-500 mt-1">공사를 발주하는 종합건설사</p>
            </div>
            <span className={`w-full inline-flex items-center justify-center rounded-full px-6 py-2.5 text-p14 font-semibold transition-colors ${
              selected === 'general'
                ? 'bg-primary-500 text-white shadow-btn-glow'
                : 'bg-primary-100 text-primary-500'
            }`}>
              종합건설사로 시작하기
            </span>
          </button>

          {/* 전문건설사 */}
          <button
            onClick={() => handleSelect('specialist')}
            className={`rounded-2xl p-8 flex flex-col items-center gap-4 border-2 transition-all duration-200 cursor-pointer text-center ${
              selected === 'specialist'
                ? 'border-primary-500 bg-white shadow-card-md'
                : 'border-ink-200 bg-white hover:border-primary-300 hover:shadow-card-sm'
            }`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              selected === 'specialist' ? 'bg-primary-500' : 'bg-primary-100'
            }`}>
              <HardHat className={`w-7 h-7 transition-colors ${
                selected === 'specialist' ? 'text-white' : 'text-primary-500'
              }`} />
            </div>
            <div>
              <p className="text-t7 font-bold text-ink-700">전문건설사</p>
              <p className="text-p14 text-ink-500 mt-1">공사를 수주하는 전문건설사</p>
            </div>
            <span className={`w-full inline-flex items-center justify-center rounded-full px-6 py-2.5 text-p14 font-semibold transition-colors ${
              selected === 'specialist'
                ? 'bg-primary-500 text-white shadow-btn-glow'
                : 'bg-primary-100 text-primary-500'
            }`}>
              전문건설사로 시작하기
            </span>
          </button>
        </div>

        {/* 슬라이드다운 사업자등록증 폼 */}
        <div
          className={`max-w-2xl mx-auto transition-all duration-500 ease-in-out overflow-hidden ${
            selected ? 'max-h-[600px] opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'
          }`}
          ref={formRef}
        >
          {submitted ? (
            <div className="rounded-2xl border border-primary-200 bg-white p-10 flex flex-col items-center gap-4 text-center shadow-card-md">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-t6 font-bold text-ink-700">인증 신청이 완료되었습니다</h3>
              <p className="text-p14 text-ink-500">
                {selected === 'general' ? '종합건설사' : '전문건설사'} 인증 검토 후 영업일 1~2일 내 안내드립니다.
              </p>
              <button
                onClick={() => { setSelected(null); setFileName(''); setSubmitted(false) }}
                className="mt-2 text-p13 text-ink-400 hover:text-ink-600 underline transition-colors"
              >
                처음으로 돌아가기
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-primary-200 bg-white p-8 shadow-card-md">
              {/* 폼 헤더 */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="badge bg-primary-100 text-primary-500">
                    {selected === 'general' ? '종합건설사' : '전문건설사'}
                  </span>
                  <h3 className="text-t7 font-bold text-ink-700">사업자등록증 업로드</h3>
                </div>
                <button
                  onClick={() => { setSelected(null); setFileName('') }}
                  className="w-8 h-8 rounded-full bg-ink-200 flex items-center justify-center hover:bg-ink-300 transition-colors"
                >
                  <X className="w-4 h-4 text-ink-500" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {/* 파일 업로드 영역 */}
                <label className={`flex flex-col items-center justify-center w-full h-44 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                  fileName
                    ? 'border-primary-400 bg-primary-100'
                    : 'border-ink-300 bg-brand-slate-100 hover:border-primary-400 hover:bg-primary-100'
                }`}>
                  {fileName ? (
                    <>
                      <CheckCircle2 className="w-8 h-8 text-primary-500 mb-2" />
                      <span className="text-p14 font-semibold text-primary-600">{fileName}</span>
                      <span className="text-p12 text-primary-400 mt-1">클릭해서 파일 변경</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-ink-400 mb-2" />
                      <span className="text-p14 font-semibold text-ink-600">파일을 드래그하거나 클릭해서 업로드</span>
                      <span className="text-p12 text-ink-400 mt-1">JPG · PNG · PDF 지원 · 최대 10MB</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
                  />
                </label>

                {/* 신청 버튼 */}
                <button
                  onClick={() => fileName && setSubmitted(true)}
                  className={`w-full rounded-full py-3.5 text-p16 font-semibold transition-all ${
                    fileName
                      ? 'bg-primary-500 text-white shadow-btn-glow hover:bg-primary-600 cursor-pointer'
                      : 'bg-ink-200 text-ink-400 cursor-not-allowed'
                  }`}
                >
                  인증 신청하기
                </button>

                <p className="text-p13 text-ink-400 text-center">
                  사업자등록증은 본인 인증 목적으로만 사용되며 안전하게 보관됩니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
