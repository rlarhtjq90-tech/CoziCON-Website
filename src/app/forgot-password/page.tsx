'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Timer, CheckCircle2 } from 'lucide-react'

type Step = 'email' | 'code' | 'password' | 'done'

const stepOrder: Exclude<Step, 'done'>[] = ['email', 'code', 'password']
const stepLabels: Record<Exclude<Step, 'done'>, string> = {
  email: '이메일 확인',
  code: '인증번호 입력',
  password: '새 비밀번호',
}

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [timer, setTimer] = useState(0)
  const [sending, setSending] = useState(false)
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

  async function handleSend() {
    setError('')
    setSending(true)
    const res = await fetch('/api/auth/forgot-password', {
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

  function handleCodeNext() {
    if (code.length !== 6) { setError('6자리 인증번호를 입력해주세요.'); return }
    if (timer === 0) { setError('인증번호가 만료됐습니다. 재발송 후 다시 시도하세요.'); return }
    setError('')
    if (intervalRef.current) clearInterval(intervalRef.current)
    setStep('password')
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (newPassword.length < 8) { setError('비밀번호는 8자 이상이어야 합니다.'); return }
    if (newPassword !== confirmPassword) { setError('비밀번호가 일치하지 않습니다.'); return }
    setSubmitting(true)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (!res.ok) {
      setError(data.error ?? '비밀번호 변경에 실패했습니다.')
      if (data.error?.includes('인증번호')) setStep('code')
      return
    }
    setStep('done')
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-brand-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="text-t6 font-bold text-primary tracking-tight">CastBid</Link>
          </div>
          <div className="bg-white rounded-2xl shadow-card-md p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-t6 font-bold text-ink-700 mb-2">비밀번호가 변경됐습니다</h1>
            <p className="text-p14 text-ink-500 mb-6">새 비밀번호로 로그인해주세요.</p>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 bg-primary text-white font-semibold text-p16 rounded-lg hover:bg-primary-600 transition-colors"
            >
              로그인하러 가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentIdx = stepOrder.indexOf(step as Exclude<Step, 'done'>)

  return (
    <div className="min-h-screen bg-brand-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-t6 font-bold text-primary tracking-tight">CastBid</Link>
          <p className="mt-2 text-p14 text-ink-500">비밀번호를 재설정합니다</p>
        </div>

        {/* 진행 단계 */}
        <div className="flex items-center justify-between mb-6 px-2">
          {stepOrder.map((s, idx) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-p12 font-bold transition-colors ${
                  idx < currentIdx ? 'bg-emerald-500 text-white'
                    : idx === currentIdx ? 'bg-primary text-white'
                    : 'bg-ink-200 text-ink-400'
                }`}>
                  {idx < currentIdx ? '✓' : idx + 1}
                </div>
                <span className={`mt-1 text-p11 whitespace-nowrap ${idx === currentIdx ? 'text-primary font-semibold' : 'text-ink-400'}`}>
                  {stepLabels[s]}
                </span>
              </div>
              {idx < stepOrder.length - 1 && (
                <div className={`w-16 h-0.5 mx-1 mb-4 transition-colors ${idx < currentIdx ? 'bg-emerald-400' : 'bg-ink-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-card-md p-8">
          <h1 className="text-t6 font-bold text-ink-700 mb-6">비밀번호 찾기</h1>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-p14 text-red-600">
              {error}
            </div>
          )}

          {/* Step 1: 이메일 입력 */}
          {step === 'email' && (
            <div className="space-y-4">
              <p className="text-p14 text-ink-500">가입 시 사용한 이메일을 입력하면 인증번호를 보내드립니다.</p>
              <div>
                <label className="block text-p14 font-medium text-ink-600 mb-1.5">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && email && handleSend()}
                  placeholder="example@email.com"
                  required
                  className="w-full px-4 py-3 border border-ink-300 rounded-lg text-p14 text-ink-700 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={handleSend}
                disabled={!email || sending}
                className="w-full py-3 bg-primary text-white font-semibold text-p16 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sending ? '발송 중...' : '인증번호 발송'}
              </button>
            </div>
          )}

          {/* Step 2: 인증번호 입력 */}
          {step === 'code' && (
            <div className="space-y-4">
              <div>
                <label className="block text-p14 font-medium text-ink-600 mb-1.5">이메일</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="flex-1 px-4 py-3 border border-ink-300 rounded-lg text-p14 text-ink-400 bg-brand-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => { setStep('email'); setCode(''); setError(''); setTimer(0) }}
                    className="shrink-0 px-4 py-3 border border-ink-300 text-ink-500 text-p14 rounded-lg hover:bg-brand-slate-100 transition-colors"
                  >
                    변경
                  </button>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-p14 font-medium text-ink-600">인증번호 (6자리)</label>
                  <span className={`flex items-center gap-1 text-p13 font-semibold ${timer === 0 ? 'text-red-500' : 'text-primary'}`}>
                    <Timer className="w-3.5 h-3.5" />
                    {timer > 0 ? formatTimer(timer) : '만료됨'}
                  </span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && code.length === 6 && timer > 0 && handleCodeNext()}
                  disabled={timer === 0}
                  placeholder="123456"
                  className="w-full px-4 py-3 border border-ink-300 rounded-lg text-p14 text-ink-700 placeholder-ink-400 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors disabled:bg-brand-slate-100 disabled:text-ink-400"
                />
              </div>
              {timer === 0 && (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending}
                  className="w-full py-2.5 border border-primary text-primary text-p14 font-semibold rounded-lg hover:bg-primary-100 transition-colors disabled:opacity-50"
                >
                  {sending ? '발송 중...' : '인증코드 재발송'}
                </button>
              )}
              <p className="flex items-center gap-1.5 text-p13 text-ink-400">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                {email}로 발송된 6자리 번호를 입력하세요.
              </p>
              <button
                type="button"
                onClick={handleCodeNext}
                disabled={code.length !== 6 || timer === 0}
                className="w-full py-3 bg-primary text-white font-semibold text-p16 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          )}

          {/* Step 3: 새 비밀번호 */}
          {step === 'password' && (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-p14 font-medium text-ink-600 mb-1.5">새 비밀번호</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError('') }}
                  placeholder="8자 이상 입력하세요"
                  required
                  className="w-full px-4 py-3 border border-ink-300 rounded-lg text-p14 text-ink-700 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-p14 font-medium text-ink-600 mb-1.5">새 비밀번호 확인</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                  className="w-full px-4 py-3 border border-ink-300 rounded-lg text-p14 text-ink-700 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-primary text-white font-semibold text-p16 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? '변경 중...' : '비밀번호 변경'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-p14 text-ink-500">
            <Link href="/login" className="text-primary font-medium hover:underline">
              로그인으로 돌아가기
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
