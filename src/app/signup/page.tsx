'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Mail, Timer, Building2, Wrench, ChevronRight } from 'lucide-react'

type Step = 'email' | 'code' | 'userType' | 'form'
type UserType = 'GENERAL_CONTRACTOR' | 'SPECIALTY_CONTRACTOR'

const SPECIALTY_LICENSES = [
  '실내건축공사업', '토공사업', '미장방수공사업', '석공사업',
  '도장공사업', '비계구조물해체공사업', '금속구조물창호온실공사업',
  '지붕판금건축물조립공사업', '철근콘크리트공사업', '기계설비공사업',
  '난방시설공사업', '상하수도설비공사업', '보링그라우팅파일공사업',
  '철도궤도공사업', '철강구조물공사업', '수중준설공사업',
  '승강기삭도공사업', '가스시설공사업', '시설물유지관리업',
  '화재소방시설공사업', '전기공사업', '정보통신공사업', '조경공사업',
]

export default function SignupPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [verifiedCode, setVerifiedCode] = useState('')
  const [userType, setUserType] = useState<UserType | null>(null)
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>([])
  const [form, setForm] = useState({ name: '', password: '', confirm: '' })
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [privacyAgreed, setPrivacyAgreed] = useState(false)
  const [timer, setTimer] = useState(0)
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (step === 'code' && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) { clearInterval(intervalRef.current!); return 0 }
          return t - 1
        })
      }, 1000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [step, timer])

  function formatTimer(sec: number) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  function toggleLicense(license: string) {
    setSelectedLicenses((prev) =>
      prev.includes(license) ? prev.filter((l) => l !== license) : [...prev, license]
    )
  }

  async function handleSend() {
    setError('')
    setSending(true)
    const res = await fetch('/api/auth/send-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    setSending(false)
    if (!res.ok) { setError(data.error ?? '발송에 실패했습니다.'); return }
    setCode('')
    setTimer(180)
    setStep('code')
  }

  async function handleVerify() {
    setError('')
    setVerifying(true)
    const res = await fetch('/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    })
    const data = await res.json()
    setVerifying(false)
    if (!res.ok) { setError(data.error ?? '인증에 실패했습니다.'); return }
    setVerifiedCode(code)
    if (intervalRef.current) clearInterval(intervalRef.current)
    setStep('userType')
  }

  function handleSelectUserType(type: UserType) {
    setUserType(type)
    setSelectedLicenses([])
    setStep('form')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('비밀번호가 일치하지 않습니다.'); return }
    if (!termsAgreed || !privacyAgreed) { setError('필수 약관에 모두 동의해주세요.'); return }
    if (userType === 'SPECIALTY_CONTRACTOR' && selectedLicenses.length === 0) {
      setError('보유 면허 종목을 1개 이상 선택해주세요.'); return
    }
    setSubmitting(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email,
        password: form.password,
        code: verifiedCode,
        userType,
        termsAgreed: true,
      }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (!res.ok) { setError(data.error ?? '회원가입에 실패했습니다.'); return }
    router.push('/login')
  }

  const stepLabels: Record<Step, string> = {
    email: '이메일 인증',
    code: '인증번호 확인',
    userType: '회원 유형 선택',
    form: '정보 입력',
  }
  const stepOrder: Step[] = ['email', 'code', 'userType', 'form']
  const currentIdx = stepOrder.indexOf(step)

  return (
    <div className="min-h-screen bg-brand-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-t6 font-bold text-primary tracking-tight">
            CastBid
          </Link>
          <p className="mt-2 text-p14 text-ink-500">건설 입찰의 새로운 기준</p>
        </div>

        {/* 진행 단계 표시 */}
        <div className="flex items-center justify-between mb-6 px-2">
          {stepOrder.map((s, idx) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-p12 font-bold transition-colors ${
                  idx < currentIdx
                    ? 'bg-emerald-500 text-white'
                    : idx === currentIdx
                    ? 'bg-primary text-white'
                    : 'bg-ink-200 text-ink-400'
                }`}>
                  {idx < currentIdx ? '✓' : idx + 1}
                </div>
                <span className={`mt-1 text-p11 whitespace-nowrap ${idx === currentIdx ? 'text-primary font-semibold' : 'text-ink-400'}`}>
                  {stepLabels[s]}
                </span>
              </div>
              {idx < stepOrder.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 mb-4 transition-colors ${idx < currentIdx ? 'bg-emerald-400' : 'bg-ink-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-card-md p-8">
          <h1 className="text-t6 font-bold text-ink-700 mb-6">
            {step === 'email' && '회원가입'}
            {step === 'code' && '이메일 인증'}
            {step === 'userType' && '회원 유형 선택'}
            {step === 'form' && '기본 정보 입력'}
          </h1>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-p14 text-red-600">
              {error}
            </div>
          )}

          {/* Step 1: 이메일 */}
          {(step === 'email' || step === 'code') && (
            <div className="mb-4">
              <label className="block text-p14 font-medium text-ink-600 mb-1.5">이메일</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  placeholder="example@email.com"
                  disabled={step !== 'email'}
                  required
                  className="flex-1 px-4 py-3 border border-ink-300 rounded-lg text-p14 text-ink-700 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors disabled:bg-brand-slate-100 disabled:text-ink-400"
                />
                {step === 'email' ? (
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!email || sending}
                    className="shrink-0 px-4 py-3 bg-primary text-white text-p14 font-semibold rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? '발송 중…' : '인증코드 발송'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setStep('email'); setCode(''); setError(''); setTimer(0) }}
                    className="shrink-0 px-4 py-3 border border-ink-300 text-ink-500 text-p14 rounded-lg hover:bg-brand-slate-100 transition-colors"
                  >
                    변경
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 2: 인증번호 */}
          {step === 'code' && (
            <div className="mb-4 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-p14 font-medium text-ink-600">인증번호 (6자리)</label>
                  <span className={`flex items-center gap-1 text-p13 font-semibold ${timer === 0 ? 'text-red-500' : 'text-primary'}`}>
                    <Timer className="w-3.5 h-3.5" />
                    {timer > 0 ? formatTimer(timer) : '만료됨'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
                    onKeyDown={(e) => e.key === 'Enter' && code.length === 6 && timer > 0 && handleVerify()}
                    disabled={timer === 0}
                    placeholder="123456"
                    className="flex-1 px-4 py-3 border border-ink-300 rounded-lg text-p14 text-ink-700 placeholder-ink-400 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors disabled:bg-brand-slate-100 disabled:text-ink-400"
                  />
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={code.length !== 6 || timer === 0 || verifying}
                    className="shrink-0 px-4 py-3 bg-primary text-white text-p14 font-semibold rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifying ? '확인 중…' : '인증 확인'}
                  </button>
                </div>
              </div>
              {timer === 0 && (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending}
                  className="w-full py-2.5 border border-primary text-primary text-p14 font-semibold rounded-lg hover:bg-primary-100 transition-colors disabled:opacity-50"
                >
                  {sending ? '발송 중…' : '인증코드 재발송'}
                </button>
              )}
              <p className="flex items-center gap-1.5 text-p13 text-ink-400">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                {email}로 발송된 6자리 번호를 입력하세요.
              </p>
            </div>
          )}

          {/* Step 3: 회원 유형 선택 */}
          {step === 'userType' && (
            <div className="space-y-3">
              <p className="text-p14 text-ink-500 mb-4">플랫폼 이용 목적에 맞는 유형을 선택해주세요.</p>
              <button
                type="button"
                onClick={() => handleSelectUserType('GENERAL_CONTRACTOR')}
                className="w-full flex items-center gap-4 p-5 border-2 border-ink-200 rounded-xl hover:border-primary hover:bg-primary-50 transition-all group text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center shrink-0 transition-colors">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-p16 font-bold text-ink-700 group-hover:text-primary">종합건설사</div>
                  <div className="text-p13 text-ink-400 mt-0.5">공사 발주 및 하도급 업체를 모집합니다</div>
                </div>
                <ChevronRight className="w-5 h-5 text-ink-300 group-hover:text-primary shrink-0" />
              </button>
              <button
                type="button"
                onClick={() => handleSelectUserType('SPECIALTY_CONTRACTOR')}
                className="w-full flex items-center gap-4 p-5 border-2 border-ink-200 rounded-xl hover:border-primary hover:bg-primary-50 transition-all group text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center shrink-0 transition-colors">
                  <Wrench className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1">
                  <div className="text-p16 font-bold text-ink-700 group-hover:text-primary">전문건설사</div>
                  <div className="text-p13 text-ink-400 mt-0.5">입찰에 참여하고 수주 기회를 얻습니다</div>
                </div>
                <ChevronRight className="w-5 h-5 text-ink-300 group-hover:text-primary shrink-0" />
              </button>
            </div>
          )}

          {/* Step 4: 기본 정보 + (전문건설사) 면허 선택 + 약관 */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 선택된 유형 표시 */}
              <div className={`flex items-center gap-3 px-4 py-3 rounded-lg ${userType === 'GENERAL_CONTRACTOR' ? 'bg-blue-50 border border-blue-200' : 'bg-orange-50 border border-orange-200'}`}>
                {userType === 'GENERAL_CONTRACTOR'
                  ? <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                  : <Wrench className="w-4 h-4 text-orange-500 shrink-0" />
                }
                <span className="text-p14 font-semibold text-ink-700">
                  {userType === 'GENERAL_CONTRACTOR' ? '종합건설사' : '전문건설사'}
                </span>
                <button
                  type="button"
                  onClick={() => setStep('userType')}
                  className="ml-auto text-p13 text-ink-400 hover:text-primary underline"
                >
                  변경
                </button>
              </div>

              <div>
                <label className="block text-p14 font-medium text-ink-600 mb-1.5">이름 (선택)</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="홍길동"
                  className="w-full px-4 py-3 border border-ink-300 rounded-lg text-p14 text-ink-700 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-p14 font-medium text-ink-600 mb-1.5">비밀번호</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="8자 이상 입력하세요"
                  required
                  className="w-full px-4 py-3 border border-ink-300 rounded-lg text-p14 text-ink-700 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-p14 font-medium text-ink-600 mb-1.5">비밀번호 확인</label>
                <input
                  type="password"
                  value={form.confirm}
                  onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                  className="w-full px-4 py-3 border border-ink-300 rounded-lg text-p14 text-ink-700 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>

              {/* 전문건설사 면허 종목 선택 */}
              {userType === 'SPECIALTY_CONTRACTOR' && (
                <div>
                  <label className="block text-p14 font-medium text-ink-600 mb-2">
                    보유 면허 종목 <span className="text-red-500">*</span>
                    <span className="ml-1 text-p13 text-ink-400 font-normal">(1개 이상 선택)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto border border-ink-200 rounded-lg p-3">
                    {SPECIALTY_LICENSES.map((license) => (
                      <label
                        key={license}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedLicenses.includes(license)}
                          onChange={() => toggleLicense(license)}
                          className="w-3.5 h-3.5 accent-primary"
                        />
                        <span className="text-p12 text-ink-600 group-hover:text-ink-800 leading-tight">{license}</span>
                      </label>
                    ))}
                  </div>
                  {selectedLicenses.length > 0 && (
                    <p className="mt-1.5 text-p12 text-primary font-medium">{selectedLicenses.length}개 선택됨</p>
                  )}
                </div>
              )}

              {/* 약관 동의 */}
              <div className="border border-ink-200 rounded-lg p-4 space-y-3 bg-brand-slate-50">
                <p className="text-p13 font-semibold text-ink-600">약관 동의</p>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-primary shrink-0"
                  />
                  <span className="text-p13 text-ink-600">
                    <span className="text-red-500 font-semibold">[필수]</span> 서비스 이용약관에 동의합니다
                  </span>
                </label>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacyAgreed}
                    onChange={(e) => setPrivacyAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-primary shrink-0"
                  />
                  <span className="text-p13 text-ink-600">
                    <span className="text-red-500 font-semibold">[필수]</span> 개인정보 처리방침에 동의합니다
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-primary text-white font-semibold text-p16 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? '가입 중...' : '회원가입 완료'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-p14 text-ink-500">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
