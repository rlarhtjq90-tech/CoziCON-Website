'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Upload, FileText, CheckCircle2, AlertCircle,
  RefreshCw, Building2, HardHat, X, ShieldCheck,
} from 'lucide-react'
import type { VerifyResponse, LicenseItem, LicenseType } from '@/app/api/verify-license/route'

// ── Types ──────────────────────────────────────────────────────────────────

type Step = 'idle' | 'uploading' | 'ocr_reading' | 'ocr_confirm' | 'verifying' | 'success' | 'error'

interface TabState {
  step: Step
  file: File | null
  previewUrl: string | null
  bizno: string
  result: VerifyResponse | null
  errorMsg: string
}

const INITIAL_STATE: TabState = {
  step: 'idle', file: null, previewUrl: null, bizno: '', result: null, errorMsg: '',
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatBizno(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 10)
  if (d.length <= 3) return d
  if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`
}

function cleanBizno(v: string) { return v.replace(/-/g, '') }

const ACCEPT = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_SIZE = 10 * 1024 * 1024

function validateFile(file: File): string | null {
  if (!ACCEPT.includes(file.type)) return 'JPG, PNG, WebP, PDF 파일만 업로드할 수 있습니다.'
  if (file.size > MAX_SIZE) return '파일 크기는 10MB 이하여야 합니다.'
  return null
}

// ── Left panel copy per tab ────────────────────────────────────────────────

const PANEL = {
  general: {
    role: '발주사 (종합건설사)',
    licenseLabel: '종합건설면허',
    headline: '종합건설면허 보유 여부를\n즉시 확인하세요',
    desc: '사업자등록증 사진 한 장만 업로드하면 국토교통부 데이터와 연동하여 종합건설면허 보유 여부를 자동으로 검증합니다.',
    points: ['국토교통부 건설업등록정보 연동', '면허 종류·번호·등록일 즉시 확인', '위변조 없는 공공데이터 기반 검증'],
  },
  specialty: {
    role: '수주사 (전문건설사)',
    licenseLabel: '전문건설면허',
    headline: '전문건설면허 보유 여부를\n즉시 확인하세요',
    desc: '사업자등록증 사진 한 장만 업로드하면 국토교통부 데이터와 연동하여 전문건설면허 보유 여부를 자동으로 검증합니다.',
    points: ['국토교통부 건설업등록정보 연동', '면허 공종·번호·등록일 즉시 확인', '위변조 없는 공공데이터 기반 검증'],
  },
}

// ── Sub-components ─────────────────────────────────────────────────────────

function OcrAnimation() {
  return (
    <div className="flex flex-col items-center gap-6 py-10">
      <div className="relative w-16 h-16">
        <svg className="animate-spin w-16 h-16 text-primary-500" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4"
            strokeLinecap="round" strokeDasharray="44 132" className="opacity-80" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <FileText className="w-6 h-6 text-primary-400" />
        </div>
      </div>
      <div className="flex flex-col gap-2 w-48">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-2.5 rounded-full bg-brand-slate-200 overflow-hidden">
            <div className="h-full rounded-full bg-primary-400 animate-pulse"
              style={{ animationDelay: `${i * 0.25}s`, width: `${70 - i * 15}%` }} />
          </div>
        ))}
      </div>
      <p className="text-p14 text-ink-400 animate-pulse">사업자등록번호 인식 중…</p>
    </div>
  )
}

function SkeletonLoader() {
  return (
    <div className="space-y-3 py-4 animate-pulse">
      <div className="h-5 bg-brand-slate-200 rounded-lg w-1/3" />
      <div className="h-4 bg-brand-slate-200 rounded-lg w-2/3" />
      <div className="h-4 bg-brand-slate-200 rounded-lg w-1/2" />
      <div className="h-4 bg-brand-slate-200 rounded-lg w-3/5" />
    </div>
  )
}

function LicenseCard({ item }: { item: LicenseItem }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-brand-slate-100 bg-brand-slate-50 px-4 py-3">
      <CheckCircle2 className="mt-0.5 w-4 h-4 shrink-0 text-emerald-500" />
      <div className="min-w-0">
        <p className="text-p14 font-semibold text-ink-700 truncate">{item.bizCategory}</p>
        <p className="text-p13 text-ink-400 mt-0.5">면허번호 {item.licenseNo} · 등록 {item.registeredAt}</p>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function VerifySection() {
  const [activeTab, setActiveTab] = useState<LicenseType>('general')
  const [state, setState] = useState<TabState>(INITIAL_STATE)
  const [isDragOver, setIsDragOver] = useState(false)

  const ocrTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const uploadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const clearTimers = useCallback(() => {
    if (ocrTimerRef.current)    clearTimeout(ocrTimerRef.current)
    if (uploadTimerRef.current) clearTimeout(uploadTimerRef.current)
    ocrTimerRef.current = uploadTimerRef.current = null
  }, [])

  useEffect(() => () => clearTimers(), [clearTimers])

  const switchTab = (tab: LicenseType) => {
    clearTimers()
    if (state.previewUrl) URL.revokeObjectURL(state.previewUrl)
    setState(INITIAL_STATE)
    setActiveTab(tab)
    setIsDragOver(false)
  }

  const reset = () => {
    clearTimers()
    if (state.previewUrl) URL.revokeObjectURL(state.previewUrl)
    setState(INITIAL_STATE)
    setIsDragOver(false)
  }

  const processFile = useCallback((file: File) => {
    const err = validateFile(file)
    if (err) { setState((s) => ({ ...s, step: 'error', errorMsg: err })); return }
    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    setState((s) => ({ ...s, step: 'uploading', file, previewUrl }))
    uploadTimerRef.current = setTimeout(() => {
      setState((s) => ({ ...s, step: 'ocr_reading' }))
      ocrTimerRef.current = setTimeout(() => {
        setState((s) => ({ ...s, step: 'ocr_confirm', bizno: '' }))
      }, 1800)
    }, 300)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const isBiznoComplete = cleanBizno(state.bizno).length === 10

  const handleVerify = async () => {
    if (!isBiznoComplete) return
    setState((s) => ({ ...s, step: 'verifying' }))
    try {
      const res  = await fetch('/api/verify-license', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ bizno: cleanBizno(state.bizno), licenseType: activeTab }),
      })
      const data = await res.json()
      if (data.success) setState((s) => ({ ...s, step: 'success', result: data as VerifyResponse }))
      else              setState((s) => ({ ...s, step: 'error', errorMsg: data.message }))
    } catch {
      setState((s) => ({ ...s, step: 'error', errorMsg: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }))
    }
  }

  const panel = PANEL[activeTab]

  return (
    <section className="section-py relative overflow-hidden" style={{ background: '#f3f6fc' }} id="verify">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full opacity-[0.07]"
        style={{ background: 'radial-gradient(circle, #1a2dff 0%, transparent 70%)' }} />
      <div className="pointer-events-none absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-[0.05]"
        style={{ background: 'radial-gradient(circle, #1a2dff 0%, transparent 70%)' }} />

      <div className="container-content relative">

        {/* ── Two-column layout ──────────────────────────────────── */}
        <div className="grid grid-cols-1 laptop:grid-cols-2 gap-12 laptop:gap-16 items-center">

          {/* Left: Explanation */}
          <div className="flex flex-col gap-6">
            {/* Badge */}
            <span className="badge bg-primary-100 text-primary-500 w-fit">건설업 면허 인증</span>

            {/* Headline */}
            <h2 className="text-t3 laptop:text-t2 font-bold text-ink-700 whitespace-pre-line leading-tight">
              {panel.headline}
            </h2>

            {/* Description */}
            <p className="text-p18 text-ink-500 leading-relaxed">{panel.desc}</p>

            {/* Points */}
            <ul className="flex flex-col gap-3 mt-2">
              {panel.points.map((pt) => (
                <li key={pt} className="flex items-center gap-3 text-p16 text-ink-600">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary-500" />
                  </span>
                  {pt}
                </li>
              ))}
            </ul>

            {/* Trust badge */}
            <div className="flex items-center gap-2 mt-2 rounded-xl bg-white border border-brand-slate-200 px-4 py-3 w-fit shadow-card-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="text-p14 text-ink-500">
                국토교통부 <span className="font-semibold text-ink-700">공공데이터</span> 기반 실시간 검증
              </span>
            </div>
          </div>

          {/* Right: Verification Card */}
          <div className="rounded-3xl border border-brand-slate-200 bg-white shadow-card-lg overflow-hidden">

            {/* Tabs */}
            <div className="grid grid-cols-2 border-b border-brand-slate-200">
              {(['general', 'specialty'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => switchTab(tab)}
                  className={[
                    'flex items-center justify-center gap-2 py-4 text-p14 font-semibold transition-colors',
                    activeTab === tab
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-ink-400 hover:bg-brand-slate-100',
                  ].join(' ')}
                >
                  {tab === 'general'
                    ? <><Building2 className="w-4 h-4" />종합건설사</>
                    : <><HardHat  className="w-4 h-4" />전문건설사</>}
                </button>
              ))}
            </div>

            {/* Card Body */}
            <div className="p-6 tablet:p-8">

              {/* idle */}
              {state.step === 'idle' && (
                <>
                  <p className="text-p14 text-ink-500 mb-5 text-center">
                    <span className="font-semibold text-ink-700">{panel.role}</span>의 사업자등록증을 업로드하면
                    <br /><span className="text-primary-500 font-semibold">{panel.licenseLabel}</span> 보유 여부를 자동 확인합니다.
                  </p>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={[
                      'cursor-pointer rounded-2xl border-2 border-dashed p-10 flex flex-col items-center gap-3 transition-all',
                      isDragOver
                        ? 'border-primary-400 bg-primary-50 scale-[1.01]'
                        : 'border-brand-slate-200 hover:border-primary-300 hover:bg-brand-slate-50',
                    ].join(' ')}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center">
                      <Upload className="w-7 h-7 text-primary-500" />
                    </div>
                    <p className="text-p15 font-semibold text-ink-700">파일을 드래그하거나 클릭하여 업로드</p>
                    <p className="text-p13 text-ink-400">JPG · PNG · WebP · PDF · 최대 10MB</p>
                  </div>
                  <input ref={fileInputRef} type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    className="hidden" onChange={handleFileChange} />
                </>
              )}

              {/* uploading */}
              {state.step === 'uploading' && (
                <div className="flex flex-col items-center gap-4 py-6">
                  <div className="flex items-center gap-3 rounded-xl bg-brand-slate-50 border border-brand-slate-200 px-5 py-3 w-full">
                    <FileText className="w-5 h-5 text-primary-400 shrink-0" />
                    <span className="text-p14 text-ink-700 truncate">{state.file?.name}</span>
                    <svg className="ml-auto w-4 h-4 text-primary-500 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"
                        strokeLinecap="round" strokeDasharray="16 48" />
                    </svg>
                  </div>
                  <p className="text-p13 text-ink-400">파일 업로드 중…</p>
                </div>
              )}

              {/* ocr_reading */}
              {state.step === 'ocr_reading' && <OcrAnimation />}

              {/* ocr_confirm */}
              {state.step === 'ocr_confirm' && (
                <div className="space-y-5">
                  {state.previewUrl ? (
                    <div className="rounded-xl overflow-hidden border border-brand-slate-200 max-h-40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={state.previewUrl} alt="사업자등록증 미리보기"
                        className="w-full object-contain max-h-40" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 rounded-xl bg-brand-slate-50 border border-brand-slate-200 px-4 py-3">
                      <FileText className="w-5 h-5 text-primary-400 shrink-0" />
                      <span className="text-p14 text-ink-600 truncate">{state.file?.name}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-p13 font-semibold text-ink-600 mb-1.5">
                      사업자등록번호 확인
                    </label>
                    <div className="relative">
                      <input
                        type="text" inputMode="numeric" placeholder="000-00-00000"
                        value={state.bizno}
                        onChange={(e) => setState((s) => ({ ...s, bizno: formatBizno(e.target.value) }))}
                        className={[
                          'w-full rounded-xl border px-4 py-3 text-p15 font-mono outline-none transition-all',
                          isBiznoComplete
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-800 focus:border-emerald-500'
                            : 'border-brand-slate-200 bg-white text-ink-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-100',
                        ].join(' ')}
                      />
                      {isBiznoComplete && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                      )}
                    </div>
                    <p className="text-p12 text-ink-400 mt-1.5">OCR로 인식된 번호를 확인하거나 직접 입력하세요.</p>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={reset}
                      className="flex items-center gap-1.5 rounded-xl border border-brand-slate-200 px-4 py-3 text-p14 text-ink-500 hover:bg-brand-slate-50 transition-colors">
                      <RefreshCw className="w-4 h-4" />다시 업로드
                    </button>
                    <button onClick={handleVerify} disabled={!isBiznoComplete}
                      className={[
                        'flex-1 rounded-xl px-4 py-3 text-p14 font-semibold transition-colors',
                        isBiznoComplete
                          ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-btn-glow'
                          : 'bg-brand-slate-100 text-ink-400 cursor-not-allowed',
                      ].join(' ')}>
                      {panel.licenseLabel} 조회
                    </button>
                  </div>
                </div>
              )}

              {/* verifying */}
              {state.step === 'verifying' && (
                <div className="space-y-4 py-2">
                  <p className="text-p14 text-ink-400 text-center animate-pulse mb-4">
                    {panel.licenseLabel} 조회 중…
                  </p>
                  <SkeletonLoader />
                </div>
              )}

              {/* success */}
              {state.step === 'success' && state.result && (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <p className="text-p16 font-bold text-ink-900">
                          {state.result.items[0]?.companyName ?? '확인 완료'}
                        </p>
                      </div>
                      <p className="text-p13 text-ink-400 ml-7">
                        {state.result.bizno.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3')}
                      </p>
                    </div>
                    {state.result.isMock && (
                      <span className="shrink-0 rounded-full bg-amber-100 text-amber-700 text-p12 font-semibold px-2.5 py-1" title="실제 API 연동 전 샘플 데이터입니다">
                        샘플 데이터
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-p13 font-semibold text-ink-500">
                      {panel.licenseLabel} {state.result.items.length}건 확인됨
                    </p>
                    {state.result.items.map((item) => (
                      <LicenseCard key={item.licenseNo} item={item} />
                    ))}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <a href="#contact"
                      className="flex-1 text-center rounded-xl bg-primary-500 text-white px-4 py-3 text-p14 font-semibold hover:bg-primary-600 shadow-btn-glow transition-colors">
                      파트너로 등록하기 →
                    </a>
                    <button onClick={reset}
                      className="rounded-xl border border-brand-slate-200 px-4 py-3 text-ink-500 hover:bg-brand-slate-50 transition-colors"
                      title="처음부터">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* error */}
              {state.step === 'error' && (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertCircle className="w-7 h-7 text-red-500" />
                  </div>
                  <p className="text-p15 font-semibold text-ink-800">조회에 실패했습니다</p>
                  <p className="text-p14 text-ink-500 max-w-xs">{state.errorMsg}</p>
                  <button onClick={reset}
                    className="flex items-center gap-2 rounded-xl bg-primary-500 text-white px-6 py-3 text-p14 font-semibold hover:bg-primary-600 transition-colors shadow-btn-glow">
                    <RefreshCw className="w-4 h-4" />처음부터 다시 시도
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
