'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Mail, Timer } from 'lucide-react'

type Step = 'email' | 'code' | 'form'

export default function SignupPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [verifiedCode, setVerifiedCode] = useState('')
  const [form, setForm] = useState({ name: '', password: '', confirm: '' })
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
    setStep('form')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('비밀번호가 일치하지 않습니다.'); return }
    setSubmitting(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email, password: form.password, code: verifiedCode }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (!res.ok) { setError(data.error ?? '회원가입에 실패했습니다.'); return }
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-brand-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-t6 font-bold text-primary tracking-tight">
            CoziCON
          </Link>
          <p className="mt-2 text-p14 text-ink-500">건설 입찰의 새로운 기준</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-t6 font-bold text-ink-700">회원가입</h1>
            {step === 'form' && (
              <span className="flex items-center gap-1.5 text-p13 font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                인증완료
              </span>
            )}
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-p14 text-red-600">
              {error}
            </div>
          )}

          {/* 이메일 필드 (전 단계 공통 표시) */}
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

          {/* Step 2: 인증코드 입력 */}
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

          {/* Step 3: 이름/비밀번호 입력 */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-primary text-white font-semibold text-p16 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
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
