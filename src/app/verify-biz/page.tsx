'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, CheckCircle2, AlertCircle, Upload, X, FileText } from 'lucide-react'

type VerifyState = 'idle' | 'loading' | 'success' | 'fail'

export default function VerifyBizPage() {
  const router = useRouter()

  const [bizNo, setBizNo] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [ceoName, setCeoName] = useState('')
  const [startDt, setStartDt] = useState('')

  const [verifyState, setVerifyState] = useState<VerifyState>('idle')
  const [verifyMsg, setVerifyMsg] = useState('')
  const [isMock, setIsMock] = useState(false)

  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function formatBizNo(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 10)
    if (digits.length <= 3) return digits
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
  }

  function formatStartDt(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    if (digits.length <= 4) return digits
    if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`
  }

  async function handleVerify() {
    setError('')
    setVerifyState('loading')
    setVerifyMsg('')

    const res = await fetch('/api/verify-biz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bizNo, ceoName, startDt }),
    })
    const data = await res.json()

    if (!res.ok || !data.valid) {
      setVerifyState('fail')
      setVerifyMsg(data.error ?? '사업자 정보를 확인할 수 없습니다.')
      return
    }

    setVerifyState('success')
    setVerifyMsg(data.message)
    setIsMock(!!data.isMock)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 10 * 1024 * 1024) { setError('파일 크기는 10MB 이하여야 합니다.'); return }
    setFile(f)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (verifyState !== 'success') { setError('사업자 진위확인을 먼저 완료해주세요.'); return }

    setError('')
    setSubmitting(true)

    let bizDocUrl: string | null = null

    // 파일 업로드 (선택사항)
    if (file) {
      const fd = new FormData()
      fd.append('file', file)
      const uploadRes = await fetch('/api/upload/biz-doc', { method: 'POST', body: fd })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) { setError(uploadData.error ?? '파일 업로드 실패'); setSubmitting(false); return }
      bizDocUrl = uploadData.url ?? null
    }

    // Company 등록
    const res = await fetch('/api/company/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bizNo, companyName, ceoName, bizDocUrl, ntsVerified: true }),
    })
    const data = await res.json()
    setSubmitting(false)

    if (!res.ok) { setError(data.error ?? '등록에 실패했습니다.'); return }
    router.push('/verify-license')
  }

  const canVerify = bizNo.replace(/\D/g, '').length === 10 && ceoName.trim() && startDt.replace(/\D/g, '').length === 8

  return (
    <div className="min-h-screen bg-brand-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="text-t6 font-bold text-primary tracking-tight">CoziCON</Link>
          <p className="mt-2 text-p14 text-ink-500">사업자 인증</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-t6 font-bold text-ink-700">사업자 인증</h1>
              <p className="text-p13 text-ink-400">국세청 진위확인 후 회사를 등록합니다</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-p14 text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 사업자번호 */}
            <div>
              <label className="block text-p14 font-medium text-ink-600 mb-1.5">
                사업자등록번호 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={bizNo}
                  onChange={(e) => { setBizNo(formatBizNo(e.target.value)); setVerifyState('idle') }}
                  placeholder="000-00-00000"
                  className="flex-1 px-4 py-3 border border-ink-300 rounded-lg text-p14 text-ink-700 placeholder-ink-400 font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* 대표자명 */}
            <div>
              <label className="block text-p14 font-medium text-ink-600 mb-1.5">
                대표자명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={ceoName}
                onChange={(e) => { setCeoName(e.target.value); setVerifyState('idle') }}
                placeholder="홍길동"
                className="w-full px-4 py-3 border border-ink-300 rounded-lg text-p14 text-ink-700 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            {/* 개업일자 */}
            <div>
              <label className="block text-p14 font-medium text-ink-600 mb-1.5">
                개업일자 <span className="text-red-500">*</span>
                <span className="text-p13 text-ink-400 font-normal ml-1">(사업자등록증 기재)</span>
              </label>
              <input
                type="text"
                value={startDt}
                onChange={(e) => { setStartDt(formatStartDt(e.target.value)); setVerifyState('idle') }}
                placeholder="2018-12-15"
                className="w-full px-4 py-3 border border-ink-300 rounded-lg text-p14 text-ink-700 placeholder-ink-400 font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            {/* 진위확인 버튼 */}
            <button
              type="button"
              onClick={handleVerify}
              disabled={!canVerify || verifyState === 'loading'}
              className="w-full py-3 border-2 border-primary text-primary font-semibold text-p14 rounded-lg hover:bg-primary-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {verifyState === 'loading' ? '확인 중…' : '국세청 사업자 진위확인'}
            </button>

            {/* 확인 결과 */}
            {verifyState === 'success' && (
              <div className="flex items-start gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-p14 text-emerald-700 font-medium">{verifyMsg}</p>
                  {isMock && <p className="text-p12 text-emerald-500 mt-0.5">※ API 키 미설정 상태 — 테스트 모드</p>}
                </div>
              </div>
            )}
            {verifyState === 'fail' && (
              <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-p14 text-red-600">{verifyMsg}</p>
              </div>
            )}

            {/* 진위확인 성공 시 나머지 필드 노출 */}
            {verifyState === 'success' && (
              <>
                {/* 상호명 */}
                <div>
                  <label className="block text-p14 font-medium text-ink-600 mb-1.5">
                    상호(법인명) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="(주)한국건설"
                    required
                    className="w-full px-4 py-3 border border-ink-300 rounded-lg text-p14 text-ink-700 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>

                {/* 사업자등록증 업로드 */}
                <div>
                  <label className="block text-p14 font-medium text-ink-600 mb-1.5">
                    사업자등록증 <span className="text-p13 text-ink-400 font-normal">(선택, JPG·PNG·PDF 10MB 이하)</span>
                  </label>
                  {file ? (
                    <div className="flex items-center gap-3 px-4 py-3 border border-ink-200 rounded-lg bg-brand-slate-50">
                      <FileText className="w-4 h-4 text-ink-500 shrink-0" />
                      <span className="text-p14 text-ink-600 flex-1 truncate">{file.name}</span>
                      <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = '' }}>
                        <X className="w-4 h-4 text-ink-400 hover:text-red-500 transition-colors" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-ink-200 rounded-lg text-p14 text-ink-400 hover:border-primary hover:text-primary transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      파일 선택
                    </button>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !companyName.trim()}
                  className="w-full py-3 bg-primary text-white font-semibold text-p16 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? '등록 중…' : '사업자 인증 완료'}
                </button>
              </>
            )}
          </form>
        </div>

        <p className="mt-4 text-center text-p13 text-ink-400">
          나중에 인증하려면{' '}
          <Link href="/dashboard" className="text-primary hover:underline">대시보드로 이동</Link>
        </p>
      </div>
    </div>
  )
}
