'use client'

import { useState, useRef } from 'react'
import { Building2, HardHat, CheckCircle2, X, Loader2, AlertCircle, FileText } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import type { LicenseItem } from '@/app/api/verify-license/route'

type CompanyType = 'general' | 'specialist' | null

function formatBizno(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 10)
  if (d.length <= 3) return d
  if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`
}

export default function SignupStart() {
  const [selected, setSelected] = useState<CompanyType>(null)
  const [bizno, setBizno] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [licenses, setLicenses] = useState<LicenseItem[] | null>(null)
  const [isMock, setIsMock] = useState(false)
  const [verified, setVerified] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  const resetForm = () => {
    setBizno('')
    setError(null)
    setLicenses(null)
    setIsMock(false)
    setVerified(false)
    setLoading(false)
  }

  const handleSelect = (type: CompanyType) => {
    if (selected === type) {
      setSelected(null)
      resetForm()
      return
    }
    setSelected(type)
    resetForm()
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 300)
  }

  const handleVerify = async () => {
    if (bizno.length < 10 || loading) return
    setLoading(true)
    setError(null)
    setLicenses(null)

    const licenseType = selected === 'general' ? 'general' : 'specialty'
    try {
      const res = await fetch('/api/verify-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bizno, licenseType }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.message)
      } else {
        setLicenses(data.items)
        setIsMock(data.isMock)
      }
    } catch {
      setError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const canQuery = bizno.length >= 10 && !loading

  return (
    <section className="section-py" style={{ background: '#f3f6fc' }} id="signup">
      <div className="container-content">
        <div className="flex justify-center">
          <SectionHeader
            badge="회원가입"
            headline="어떤 유형으로 시작하시겠어요?"
            description="회원 유형을 선택하고 사업자등록번호로 건설면허를 즉시 인증하세요."
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

        {/* 슬라이드다운 인증 폼 */}
        <div
          ref={formRef}
          className={`max-w-2xl mx-auto transition-all duration-500 ease-in-out overflow-hidden ${
            selected ? 'max-h-[900px] opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'
          }`}
        >
          {verified ? (
            /* 완료 화면 */
            <div className="rounded-2xl border border-primary-200 bg-white p-10 flex flex-col items-center gap-4 text-center shadow-card-md">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-t6 font-bold text-ink-700">면허 인증이 완료되었습니다</h3>
              <p className="text-p14 text-ink-500">
                {selected === 'general' ? '종합건설사' : '전문건설사'}로 가입 신청이 접수되었습니다.
                <br />영업일 1~2일 내 최종 승인 후 안내드립니다.
              </p>
              <button
                onClick={() => { setSelected(null); resetForm() }}
                className="mt-2 text-p13 text-ink-400 hover:text-ink-600 underline transition-colors"
              >
                처음으로 돌아가기
              </button>
            </div>
          ) : (
            /* 조회 폼 */
            <div className="rounded-2xl border border-primary-200 bg-white p-8 shadow-card-md">
              {/* 폼 헤더 */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="badge bg-primary-100 text-primary-500">
                    {selected === 'general' ? '종합건설사' : '전문건설사'}
                  </span>
                  <h3 className="text-t7 font-bold text-ink-700">건설면허 인증</h3>
                  {isMock && (
                    <span className="badge bg-amber-100 text-amber-600 text-p12">테스트 데이터</span>
                  )}
                </div>
                <button
                  onClick={() => { setSelected(null); resetForm() }}
                  className="w-8 h-8 rounded-full bg-ink-200 flex items-center justify-center hover:bg-ink-300 transition-colors"
                >
                  <X className="w-4 h-4 text-ink-500" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {/* 사업자등록번호 입력 */}
                <div>
                  <label className="block text-p13 font-semibold text-ink-600 mb-1.5">
                    사업자등록번호
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="000-00-00000"
                    value={formatBizno(bizno)}
                    disabled={loading}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
                      setBizno(digits)
                      setError(null)
                      setLicenses(null)
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    className="w-full rounded-xl border border-ink-300 bg-brand-slate-100 px-4 py-3 text-p16 text-ink-700 placeholder:text-ink-400 focus:outline-none focus:border-primary-400 focus:bg-white transition-all disabled:opacity-50"
                  />
                  <p className="text-p12 text-ink-400 mt-1.5">
                    국토교통부 KISCON에 등록된 건설업 면허를 자동으로 조회합니다.
                  </p>
                </div>

                {/* 오류 메시지 */}
                {error && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-p14 text-red-700">{error}</p>
                      <button
                        onClick={() => { setError(null); setBizno('') }}
                        className="text-p13 text-red-500 hover:text-red-700 underline mt-1 transition-colors"
                      >
                        다시 입력하기
                      </button>
                    </div>
                  </div>
                )}

                {/* 면허 조회 결과 */}
                {licenses && licenses.length > 0 && (
                  <div className="rounded-xl border border-primary-200 bg-primary-100 p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary-500" />
                      <span className="text-p14 font-bold text-ink-700">{licenses[0].companyName}</span>
                      <span className="text-p12 text-ink-400 ml-auto">면허 {licenses.length}건</span>
                    </div>
                    <ul className="flex flex-col gap-2">
                      {licenses.map((item) => (
                        <li
                          key={item.licenseNo}
                          className="flex items-center gap-3 bg-white rounded-lg px-4 py-2.5"
                        >
                          <FileText className="w-4 h-4 text-primary-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-p14 font-semibold text-ink-700 truncate">{item.bizCategory}</p>
                            <p className="text-p12 text-ink-400">면허번호 {item.licenseNo} · 등록 {item.registeredAt}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 조회 / 인증 완료 버튼 */}
                {!licenses ? (
                  <button
                    onClick={handleVerify}
                    disabled={!canQuery}
                    className={`w-full rounded-full py-3.5 text-p16 font-semibold transition-all flex items-center justify-center gap-2 ${
                      canQuery
                        ? 'bg-primary-500 text-white shadow-btn-glow hover:bg-primary-600 cursor-pointer'
                        : 'bg-ink-200 text-ink-400 cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        조회 중...
                      </>
                    ) : '면허 조회하기'}
                  </button>
                ) : (
                  <button
                    onClick={() => setVerified(true)}
                    className="w-full rounded-full py-3.5 text-p16 font-semibold bg-primary-500 text-white shadow-btn-glow hover:bg-primary-600 transition-colors"
                  >
                    인증 완료하기
                  </button>
                )}

                <p className="text-p13 text-ink-400 text-center">
                  사업자등록번호는 면허 인증 목적으로만 사용됩니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
