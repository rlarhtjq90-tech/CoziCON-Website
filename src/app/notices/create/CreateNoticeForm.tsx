'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowLeft, Paperclip, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

// SSR 비활성화로 마크다운 에디터 로드
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 border border-ink-200 rounded-lg bg-ink-50 flex items-center justify-center text-p14 text-ink-400">
      에디터 로딩 중...
    </div>
  ),
})

type Child = { id: string; name: string; code: string }
type Category = { id: string; name: string; code: string; children: Child[] }
type AttachmentItem = {
  fileName: string; fileUrl: string; fileSize: number; mimeType: string
  uploading?: boolean; error?: string
}

const REGIONS = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주']

const BID_METHODS = ['최저가낙찰제', '적격심사제', '협상에 의한 계약', '수의계약']

const LICENSE_OPTIONS = [
  { group: '종합건설업', items: ['토목공사업', '건축공사업', '토목건축공사업', '산업환경설비공사업', '조경공사업'] },
  { group: '전문건설업', items: ['실내건축공사업', '철근콘크리트공사업', '포장공사업', '상하수도설비공사업', '기계설비공사업', '도장공사업', '소방시설공사업', '전기공사업', '정보통신공사업', '조경식재공사업', '가스시설시공업'] },
]

function DateTimeInput({ label, value, onChange, min, required, hint }: {
  label: string; value: string; onChange: (v: string) => void
  min?: string; required?: boolean; hint?: string
}) {
  return (
    <div>
      <label className="block text-p14 font-medium text-ink-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
        {hint && <span className="ml-1 text-p13 text-ink-400 font-normal">{hint}</span>}
      </label>
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        required={required}
        className="w-full px-3 py-2.5 border border-ink-200 rounded-lg text-p15 focus:outline-none focus:border-primary"
      />
    </div>
  )
}

export default function CreateNoticeForm({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [deadline, setDeadline] = useState('')
  const [openingAt, setOpeningAt] = useState('')
  const [constructionStart, setConstructionStart] = useState('')
  const [constructionEnd, setConstructionEnd] = useState('')
  const [estimatedPrice, setEstimatedPrice] = useState('')
  const [bidMethod, setBidMethod] = useState('')
  const [requiredLicenses, setRequiredLicenses] = useState<string[]>([])
  const [qualificationNote, setQualificationNote] = useState('')
  const [description, setDescription] = useState<string | undefined>('')
  const [asDraft, setAsDraft] = useState(false)
  const [attachments, setAttachments] = useState<AttachmentItem[]>([])
  const [expandedParents, setExpandedParents] = useState<string[]>(categories.map((c) => c.id))

  const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)

  function toggleCategoryId(id: string) {
    setSelectedCategoryIds((prev) => prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id])
  }
  function toggleParent(id: string) {
    setExpandedParents((prev) => prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id])
  }
  function toggleRegion(r: string) {
    setRegions((prev) => prev.includes(r) ? prev.filter((v) => v !== r) : [...prev, r])
  }
  function toggleLicense(l: string) {
    setRequiredLicenses((prev) => prev.includes(l) ? prev.filter((v) => v !== l) : [...prev, l])
  }

  const selectedNames = categories
    .flatMap((p) => p.children)
    .filter((c) => selectedCategoryIds.includes(c.id))
    .map((c) => c.name)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    for (const file of files) {
      const placeholder: AttachmentItem = { fileName: file.name, fileUrl: '', fileSize: file.size, mimeType: file.type, uploading: true }
      setAttachments((prev) => [...prev, placeholder])
      const formData = new FormData()
      formData.append('file', file)
      try {
        const res = await fetch('/api/upload/notice-attachment', { method: 'POST', body: formData })
        const data = await res.json()
        if (!res.ok) {
          setAttachments((prev) => prev.map((a) => a.fileName === file.name && a.uploading ? { ...a, uploading: false, error: data.error ?? '업로드 실패' } : a))
        } else {
          setAttachments((prev) => prev.map((a) => a.fileName === file.name && a.uploading
            ? { fileName: data.fileName, fileUrl: data.url, fileSize: data.fileSize, mimeType: data.mimeType, uploading: false }
            : a
          ))
        }
      } catch {
        setAttachments((prev) => prev.map((a) => a.fileName === file.name && a.uploading ? { ...a, uploading: false, error: '업로드 실패' } : a))
      }
    }
    e.target.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (selectedCategoryIds.length === 0) { setError('공종을 1개 이상 선택해주세요.'); return }
    if (attachments.some((a) => a.uploading)) { setError('파일 업로드가 완료될 때까지 기다려주세요.'); return }
    if (attachments.some((a) => a.error)) { setError('업로드 실패한 파일을 제거 후 다시 시도해주세요.'); return }
    if (openingAt && deadline && new Date(openingAt) < new Date(deadline)) {
      setError('개찰일시는 마감일시 이후여야 합니다.'); return
    }
    if (constructionStart && constructionEnd && new Date(constructionEnd) < new Date(constructionStart)) {
      setError('준공예정일은 착공예정일 이후여야 합니다.'); return
    }
    setLoading(true)
    const res = await fetch('/api/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        workTypes: selectedNames,
        categoryIds: selectedCategoryIds,
        regions,
        deadline,
        openingAt: openingAt || null,
        constructionStart: constructionStart || null,
        constructionEnd: constructionEnd || null,
        estimatedPrice: estimatedPrice ? Number(estimatedPrice.replace(/,/g, '')) : null,
        bidMethod: bidMethod || null,
        requiredLicenses,
        qualificationNote: qualificationNote || null,
        description: description ?? '',
        status: asDraft ? 'DRAFT' : 'OPEN',
        attachments: attachments
          .filter((a) => a.fileUrl && !a.fileUrl.startsWith('__mock__'))
          .map((a) => ({ fileName: a.fileName, fileUrl: a.fileUrl, fileSize: a.fileSize, mimeType: a.mimeType })),
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? '오류가 발생했습니다.'); return }
    router.push('/notices')
  }

  return (
    <div className="min-h-screen bg-brand-slate-100">
      <header className="bg-white border-b border-ink-200 shadow-sm">
        <div className="container-content flex items-center justify-between h-16">
          <a href="/" className="text-t6 font-bold text-primary tracking-tight">CoziCON</a>
        </div>
      </header>

      <main className="container-content py-10 max-w-2xl">
        <div className="mb-6">
          <Link href="/notices" className="flex items-center gap-1.5 text-p14 text-ink-400 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />공고 목록으로
          </Link>
        </div>
        <div className="mb-6">
          <h1 className="text-t4 font-bold text-ink-700">공고 등록</h1>
          <p className="mt-1 text-p15 text-ink-400">입찰 공고를 작성하세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-ink-200 p-8 space-y-6">

          {/* 제목 */}
          <div>
            <label className="block text-p14 font-medium text-ink-700 mb-1.5">
              공고 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="예) 2026년 도로 보수공사 입찰 공고"
              className="w-full px-3 py-2.5 border border-ink-200 rounded-lg text-p15 focus:outline-none focus:border-primary"
              required
            />
          </div>

          {/* 공종 */}
          <div>
            <label className="block text-p14 font-medium text-ink-700 mb-2">
              공종 <span className="text-red-500">*</span>
              {selectedCategoryIds.length > 0 && (
                <span className="ml-2 text-p12 text-primary font-normal">{selectedCategoryIds.length}개 선택됨</span>
              )}
            </label>
            <div className="border border-ink-200 rounded-xl divide-y divide-ink-100 overflow-hidden">
              {categories.map((parent) => {
                const isOpen = expandedParents.includes(parent.id)
                const selectedInGroup = parent.children.filter((c) => selectedCategoryIds.includes(c.id)).length
                return (
                  <div key={parent.id}>
                    <button type="button" onClick={() => toggleParent(parent.id)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-ink-50 hover:bg-ink-100 transition-colors text-left"
                    >
                      <span className="text-p14 font-semibold text-ink-700">
                        {parent.name}
                        {selectedInGroup > 0 && <span className="ml-2 text-p12 text-primary font-normal">{selectedInGroup}개</span>}
                      </span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-ink-400" /> : <ChevronDown className="w-4 h-4 text-ink-400" />}
                    </button>
                    {isOpen && (
                      <div className="px-4 py-3 flex flex-wrap gap-2">
                        {parent.children.map((child) => {
                          const checked = selectedCategoryIds.includes(child.id)
                          return (
                            <button key={child.id} type="button" onClick={() => toggleCategoryId(child.id)}
                              className={`px-3 py-1.5 rounded-full text-p13 border transition-colors ${
                                checked ? 'bg-primary text-white border-primary' : 'bg-white text-ink-500 border-ink-200 hover:border-primary hover:text-primary'
                              }`}
                            >
                              {child.name}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 지역 */}
          <div>
            <label className="block text-p14 font-medium text-ink-700 mb-1.5">
              지역 <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((r) => (
                <button key={r} type="button" onClick={() => toggleRegion(r)}
                  className={`px-3 py-1.5 rounded-full text-p13 border transition-colors ${
                    regions.includes(r) ? 'bg-primary text-white border-primary' : 'bg-white text-ink-500 border-ink-200 hover:border-primary'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* 마감일시 / 개찰일시 */}
          <div className="grid grid-cols-2 gap-4">
            <DateTimeInput label="마감일시" value={deadline} onChange={setDeadline} min={nowLocal} required />
            <DateTimeInput label="개찰일시" value={openingAt} onChange={setOpeningAt} min={deadline || nowLocal} hint="(선택)" />
          </div>

          {/* 공사기간 */}
          <div>
            <label className="block text-p14 font-medium text-ink-700 mb-2">공사기간 <span className="text-p13 text-ink-400 font-normal">(선택)</span></label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-p13 text-ink-400 mb-1">착공 예정일</p>
                <input type="date" value={constructionStart} onChange={(e) => setConstructionStart(e.target.value)}
                  className="w-full px-3 py-2.5 border border-ink-200 rounded-lg text-p15 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <p className="text-p13 text-ink-400 mb-1">준공 예정일</p>
                <input type="date" value={constructionEnd} onChange={(e) => setConstructionEnd(e.target.value)}
                  min={constructionStart}
                  className="w-full px-3 py-2.5 border border-ink-200 rounded-lg text-p15 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* 입찰 조건 */}
          <div className="border-t border-ink-100 pt-6 space-y-5">
            <h2 className="text-p15 font-semibold text-ink-700">입찰 조건 <span className="text-p13 text-ink-400 font-normal">(선택)</span></h2>

            {/* 예정가격 */}
            <div>
              <label className="block text-p14 font-medium text-ink-700 mb-1.5">예정가격 (원)</label>
              <input
                type="text"
                value={estimatedPrice}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '')
                  setEstimatedPrice(raw ? Number(raw).toLocaleString() : '')
                }}
                placeholder="예) 450,000,000"
                className="w-full px-3 py-2.5 border border-ink-200 rounded-lg text-p15 focus:outline-none focus:border-primary"
              />
              {estimatedPrice && (
                <p className="mt-1 text-p13 text-ink-400">{estimatedPrice}원</p>
              )}
            </div>

            {/* 낙찰방식 */}
            <div>
              <label className="block text-p14 font-medium text-ink-700 mb-2">낙찰방식</label>
              <div className="flex flex-wrap gap-2">
                {BID_METHODS.map((m) => (
                  <button key={m} type="button" onClick={() => setBidMethod(bidMethod === m ? '' : m)}
                    className={`px-3 py-1.5 rounded-full text-p13 border transition-colors ${
                      bidMethod === m ? 'bg-primary text-white border-primary' : 'bg-white text-ink-500 border-ink-200 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* 필요 면허 */}
            <div>
              <label className="block text-p14 font-medium text-ink-700 mb-2">
                필요 면허
                {requiredLicenses.length > 0 && <span className="ml-2 text-p12 text-primary font-normal">{requiredLicenses.length}개 선택</span>}
              </label>
              <div className="space-y-3">
                {LICENSE_OPTIONS.map((group) => (
                  <div key={group.group}>
                    <p className="text-p13 text-ink-400 mb-1.5">{group.group}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((l) => (
                        <button key={l} type="button" onClick={() => toggleLicense(l)}
                          className={`px-3 py-1.5 rounded-full text-p13 border transition-colors ${
                            requiredLicenses.includes(l) ? 'bg-primary text-white border-primary' : 'bg-white text-ink-500 border-ink-200 hover:border-primary hover:text-primary'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 자격요건 비고 */}
            <div>
              <label className="block text-p14 font-medium text-ink-700 mb-1.5">자격요건 비고</label>
              <textarea
                value={qualificationNote}
                onChange={(e) => setQualificationNote(e.target.value)}
                placeholder="예) 시공능력평가액 50억 이상, 최근 3년간 동종 공사 실적 보유"
                rows={3}
                className="w-full px-3 py-2.5 border border-ink-200 rounded-lg text-p15 focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>

          {/* 공고 내용 — 마크다운 에디터 */}
          <div data-color-mode="light">
            <label className="block text-p14 font-medium text-ink-700 mb-1.5">공고 내용</label>
            <MDEditor
              value={description}
              onChange={setDescription}
              height={280}
              preview="edit"
              hideToolbar={false}
              style={{ borderRadius: '0.5rem', overflow: 'hidden' }}
            />
            <p className="mt-1 text-p12 text-ink-400">마크다운 문법을 사용할 수 있습니다. 우측 눈 아이콘으로 미리보기 가능.</p>
          </div>

          {/* 첨부파일 */}
          <div>
            <label className="block text-p14 font-medium text-ink-700 mb-1.5">
              첨부파일 <span className="ml-1 text-p13 text-ink-400 font-normal">PDF, DOC, DOCX, HWP, 이미지 · 최대 20MB</span>
            </label>
            {attachments.length > 0 && (
              <div className="mb-2 space-y-1.5">
                {attachments.map((att, idx) => (
                  <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-p14 ${att.error ? 'border-red-200 bg-red-50' : 'border-ink-200 bg-brand-slate-100'}`}>
                    {att.uploading ? <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" /> : <Paperclip className="w-4 h-4 text-ink-400 shrink-0" />}
                    <span className="flex-1 truncate text-ink-600">{att.fileName}</span>
                    {att.error ? <span className="text-p13 text-red-500 shrink-0">{att.error}</span>
                      : !att.uploading ? <span className="text-p13 text-ink-400 shrink-0">{(att.fileSize / 1024).toFixed(0)}KB</span> : null}
                    <button type="button" onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))} className="shrink-0 text-ink-300 hover:text-ink-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.hwp,.jpg,.jpeg,.png,.webp" onChange={handleFileChange} className="hidden" />
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border border-dashed border-ink-300 rounded-lg text-p14 text-ink-400 hover:border-primary hover:text-primary transition-colors"
            >
              <Paperclip className="w-4 h-4" />파일 첨부
            </button>
          </div>

          {error && <p className="text-p14 text-red-500">{error}</p>}

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-p14 text-ink-500 cursor-pointer">
              <input type="checkbox" checked={asDraft} onChange={(e) => setAsDraft(e.target.checked)} className="rounded" />
              임시저장으로 등록
            </label>
            <div className="flex gap-3">
              <Link href="/notices" className="px-4 py-2 border border-ink-200 rounded-lg text-p14 text-ink-500 hover:bg-ink-50 transition-colors">취소</Link>
              <button type="submit" disabled={loading}
                className="px-6 py-2 bg-primary text-white rounded-lg text-p14 font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {loading ? '등록 중...' : asDraft ? '임시저장' : '공고 등록'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
