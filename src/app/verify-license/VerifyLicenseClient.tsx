'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, AlertCircle, Upload, X, FileText, Loader2 } from 'lucide-react'

interface LicenseItem {
  licenseType: string
  licenseNo: string
  issuedAt: string | null
}

type FetchState = 'loading' | 'success' | 'fail' | 'skipped'

export default function VerifyLicenseClient({
  bizNo,
  userType,
}: {
  bizNo: string
  userType: string
}) {
  const router = useRouter()

  const [fetchState, setFetchState] = useState<FetchState>('loading')
  const [licenses, setLicenses] = useState<LicenseItem[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const isOwner = userType === 'OWNER'
  const licenseType = userType === 'GENERAL_CONTRACTOR' ? 'general' : 'specialty'

  useEffect(() => {
    if (isOwner) { setFetchState('skipped'); return }

    fetch('/api/verify-license', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bizno: bizNo, licenseType }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.items?.length > 0) {
          const items: LicenseItem[] = data.items.map((item: { bizCategory: string; licenseNo: string; registeredAt: string }) => ({
            licenseType: item.bizCategory,
            licenseNo: item.licenseNo,
            issuedAt: item.registeredAt ?? null,
          }))
          setLicenses(items)
          setSelected(new Set(items.map((_: LicenseItem, i: number) => i)))
          setFetchState('success')
        } else {
          setFetchState('fail')
        }
      })
      .catch(() => setFetchState('fail'))
  }, [bizNo, licenseType, isOwner])

  function toggleSelect(idx: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
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
    setError('')
    setSubmitting(true)

    let licenseDocUrl: string | null = null

    if (file) {
      const fd = new FormData()
      fd.append('file', file)
      const uploadRes = await fetch('/api/upload/biz-doc', { method: 'POST', body: fd })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) { setError(uploadData.error ?? '파일 업로드 실패'); setSubmitting(false); return }
      licenseDocUrl = uploadData.url ?? null
    }

    const selectedLicenses = licenses.filter((_, i) => selected.has(i))

    const res = await fetch('/api/license/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedLicenses, licenseDocUrl }),
    })
    const data = await res.json()
    setSubmitting(false)

    if (!res.ok) { setError(data.error ?? '등록에 실패했습니다.'); return }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-brand-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="text-t6 font-bold text-primary tracking-tight">CoziCON</Link>
          <p className="mt-2 text-p14 text-ink-500">건설업등록증 인증</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-t6 font-bold text-ink-700">건설업등록증 인증</h1>
              <p className="text-p13 text-ink-400">KISCON 면허를 조회하고 등록합니다</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-p14 text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isOwner && (
              <div>
                <p className="text-p14 font-medium text-ink-600 mb-2">조회된 건설업 면허</p>

                {fetchState === 'loading' && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-brand-slate-50 rounded-lg text-p14 text-ink-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    KISCON에서 면허를 조회하는 중...
                  </div>
                )}

                {fetchState === 'fail' && (
                  <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-p14 text-amber-700">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    면허 정보를 자동으로 가져올 수 없습니다. 건설업등록증을 직접 첨부해주세요.
                  </div>
                )}

                {fetchState === 'success' && licenses.length > 0 && (
                  <div className="border border-ink-200 rounded-lg divide-y divide-ink-100">
                    {licenses.map((l, i) => (
                      <label key={i} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-brand-slate-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={selected.has(i)}
                          onChange={() => toggleSelect(i)}
                          className="w-4 h-4 accent-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-p14 font-medium text-ink-700">{l.licenseType}</p>
                          <p className="text-p12 text-ink-400">{l.licenseNo} · 등록일 {l.issuedAt ?? '-'}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-p14 font-medium text-ink-600 mb-1.5">
                건설업등록증 첨부{' '}
                <span className="text-p13 text-ink-400 font-normal">(선택, JPG·PNG·PDF 10MB 이하)</span>
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
              disabled={submitting || (fetchState === 'loading')}
              className="w-full py-3 bg-primary text-white font-semibold text-p16 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? '등록 중…' : '인증 완료'}
            </button>
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
