'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowLeft, Paperclip, X, Loader2, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'

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
type ExistingAttachment = { id: string; fileName: string; fileUrl: string; fileSize: number | null; mimeType: string | null }
type NewAttachment = {
  fileName: string; fileUrl: string; fileSize: number; mimeType: string
  uploading?: boolean; error?: string
}
type NoticeInput = {
  id: string
  title: string
  workTypes: string[]
  regions: string[]
  deadline: Date
  openingAt: Date | null
  constructionStart: Date | null
  constructionEnd: Date | null
  estimatedPrice: bigint | null
  bidMethod: string | null
  requiredLicenses: string[]
  qualificationNote: string | null
  description: string | null
  status: string
  attachments: ExistingAttachment[]
  categories: { category: { id: string } }[]
}

const REGIONS = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주']

const BID_METHODS = ['최저가낙찰제', '적격심사제', '협상에 의한 계약', '수의계약']

const LICENSE_OPTIONS = [
  { group: '종합건설업', items: ['토목공사업', '건축공사업', '토목건축공사업', '산업환경설비공사업', '조경공사업'] },
  { group: '전문건설업', items: ['실내건축공사업', '철근콘크리트공사업', '포장공사업', '상하수도설비공사업', '기계설비공사업', '도장공사업', '소방시설공사업', '전기공사업', '정보통신공사업', '조경식재공사업', '가스시설시공업'] },
]

function toLocalDatetime(d: Date | null) {
  if (!d) return ''
  return new Date(d.getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}
function toLocalDate(d: Date | null) {
  if (!d) return ''
  return new Date(d.getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

function DateTimeInput({ label, value, onChange, min, hint }: {
  label: string; value: string; onChange: (v: string) => void; min?: string; hint?: string
}) {
  return (
    <div>
      <label className="block text-p14 font-medium text-ink-700 mb-1.5">
        {label}
        {hint && <span className="ml-1 text-p13 text-ink-400 font-normal">{hint}</span>}
      </label>
      <input
        type="datetime-local" value={value} onChange={(e) => onChange(e.target.value)} min={min}
        className="w-full px-3 py-2.5 border border-ink-200 rounded-lg text-p15 focus:outline-none focus:border-primary"
      />
    </div>
  )
}

export default function EditNoticeForm({ notice, categories }: { notice: NoticeInput; categories: Category[] }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState(notice.title)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    notice.categories.map((c) => c.category.id)
  )
  const [regions, setRegions] = useState<string[]>(notice.regions)
  const [deadline, setDeadline] = useState(toLocalDatetime(notice.deadline))
  const [openingAt, setOpeningAt] = useState(toLocalDatetime(notice.openingAt))
  const [constructionStart, setConstructionStart] = useState(toLocalDate(notice.constructionStart))
  const [constructionEnd, setConstructionEnd] = useState(toLocalDate(notice.constructionEnd))
  const [estimatedPrice, setEstimatedPrice] = useState(
    notice.estimatedPrice != null ? Number(notice.estimatedPrice).toLocaleString() : ''
  )
  const [bidMethod, setBidMethod] = useState(notice.bidMethod ?? '')
  const [requiredLicenses, setRequiredLicenses] = useState<string[]>(notice.requiredLicenses)
  const [qualificationNote, setQualificationNote] = useState(notice.qualificationNote ?? '')
  const [description, setDescription] = useState<string | undefined>(notice.description ?? '')
  const [status, setStatus] = useState(notice.status)

  // 기존 첨부파일 (삭제 마킹)
  const [existingAttachments, setExistingAttachments] = useState<ExistingAttachment[]>(notice.attachments)
  const [attachmentIdsToDelete, setAttachmentIdsToDelete] = useState<string[]>([])
  // 새로 추가할 첨부파일
  const [newAttachments, setNewAttachments] = useState<NewAttachment[]>([])
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

  function markDeleteExisting(id: string) {
    setAttachmentIdsToDelete((prev) => [...prev, id])
    setExistingAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    for (const file of files) {
      const placeholder: NewAttachment = { fileName: file.name, fileUrl: '', fileSize: file.size, mimeType: file.type, uploading: true }
      setNewAttachments((prev) => [...prev, placeholder])
      const formData = new FormData()
      formData.append('file', file)
      try {
        const res = await fetch('/api/upload/notice-attachment', { method: 'POST', body: formData })
        const data = await res.json()
        if (!res.ok) {
          setNewAttachments((prev) => prev.map((a) => a.fileName === file.name && a.uploading ? { ...a, uploading: false, error: data.error ?? '업로드 실패' } : a))
        } else {
          setNewAttachments((prev) => prev.map((a) => a.fileName === file.name && a.uploading
            ? { fileName: data.fileName, fileUrl: data.url, fileSize: data.fileSize, mimeType: data.mimeType, uploading: false }
            : a
          ))
        }
      } catch {
        setNewAttachments((prev) => prev.map((a) => a.fileName === file.name && a.uploading ? { ...a, uploading: false, error: '업로드 실패' } : a))
      }
    }
    e.target.value = ''
  }

  const selectedNames = categories
    .flatMap((p) => p.children)
    .filter((c) => selectedCategoryIds.includes(c.id))
    .map((c) => c.name)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (selectedCategoryIds.length === 0) { setError('공종을 1개 이상 선택해주세요.'); return }
    if (newAttachments.some((a) => a.uploading)) { setError('파일 업로드가 완료될 때까지 기다려주세요.'); return }
    if (newAttachments.some((a) => a.error)) { setError('업로드 실패한 파일을 제거 후 다시 시도해주세요.'); return }
    if (openingAt && deadline && new Date(openingAt) < new Date(deadline)) {
      setError('개찰일시는 마감일시 이후여야 합니다.'); return
    }
    if (constructionStart && constructionEnd && new Date(constructionEnd) < new Date(constructionStart)) {
      setError('준공예정일은 착공예정일 이후여야 합니다.'); return
    }
    setLoading(true)
    const res = await fetch(`/api/notices/${notice.id}`, {
      method: 'PATCH',
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
        status,
        attachmentsToAdd: newAttachments
          .filter((a) => a.fileUrl && !a.fileUrl.startsWith('__mock__'))
          .map((a) => ({ fileName: a.fileName, fileUrl: a.fileUrl, fileSize: a.fileSize, mimeType: a.mimeType })),
        attachmentIdsToDelete,
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? '오류가 발생했습니다.'); return }
    router.push(`/notices/${notice.id}`)
    router.refresh()
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
          <Link href={`/notices/${notice.id}`} className="flex items-center gap-1.5 text-p14 text-ink-400 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />공고 상세로
          </Link>
        </div>
        <div className="mb-6">
          <h1 className="text-t4 font-bold text-ink-700">공고 수정</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-ink-200 p-8 space-y-6">

          {/* 제목 */}
          <div>
            <label className="block text-p14 font-medium text-ink-700 mb-1.5">
              공고 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
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
            <DateTimeInput label="마감일시" value={deadline} onChange={setDeadline} min={nowLocal} />
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
              {estimatedPrice && <p className="mt-1 text-p13 text-ink-400">{estimatedPrice}원</p>}
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

          {/* 공고 내용 */}
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
          </div>

          {/* 첨부파일 */}
          <div>
            <label className="block text-p14 font-medium text-ink-700 mb-1.5">
              첨부파일 <span className="ml-1 text-p13 text-ink-400 font-normal">PDF, DOC, DOCX, HWP, 이미지 · 최대 20MB</span>
            </label>

            {/* 기존 첨부파일 */}
            {existingAttachments.length > 0 && (
              <div className="mb-2 space-y-1.5">
                {existingAttachments.map((att) => (
                  <div key={att.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-ink-200 bg-brand-slate-100 text-p14">
                    <Paperclip className="w-4 h-4 text-ink-400 shrink-0" />
                    <a href={att.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="flex-1 truncate text-ink-600 hover:text-primary hover:underline"
                    >
                      {att.fileName}
                    </a>
                    {att.fileSize && (
                      <span className="text-p13 text-ink-400 shrink-0">{(att.fileSize / 1024).toFixed(0)}KB</span>
                    )}
                    <button type="button" onClick={() => markDeleteExisting(att.id)}
                      className="shrink-0 text-ink-300 hover:text-red-500 transition-colors" title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 새 첨부파일 */}
            {newAttachments.length > 0 && (
              <div className="mb-2 space-y-1.5">
                {newAttachments.map((att, idx) => (
                  <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-p14 ${att.error ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
                    {att.uploading ? <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" /> : <Paperclip className="w-4 h-4 text-ink-400 shrink-0" />}
                    <span className="flex-1 truncate text-ink-600">{att.fileName}</span>
                    {att.error ? <span className="text-p13 text-red-500 shrink-0">{att.error}</span>
                      : !att.uploading ? <span className="text-p13 text-ink-400 shrink-0">{(att.fileSize / 1024).toFixed(0)}KB</span> : null}
                    <button type="button" onClick={() => setNewAttachments((prev) => prev.filter((_, i) => i !== idx))}
                      className="shrink-0 text-ink-300 hover:text-ink-500"
                    >
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
              <Paperclip className="w-4 h-4" />파일 추가
            </button>
          </div>

          {/* 상태 */}
          <div>
            <label className="block text-p14 font-medium text-ink-700 mb-1.5">공고 상태</label>
            <div className="flex gap-3">
              {(['DRAFT', 'OPEN', 'CLOSED', 'CANCELLED'] as const).map((s) => {
                const labels = { DRAFT: '임시저장', OPEN: '모집중', CLOSED: '마감', CANCELLED: '취소' }
                return (
                  <button key={s} type="button" onClick={() => setStatus(s)}
                    className={`px-4 py-2 rounded-lg text-p14 border transition-colors ${
                      status === s ? 'bg-primary text-white border-primary' : 'bg-white text-ink-500 border-ink-200 hover:border-primary'
                    }`}
                  >
                    {labels[s]}
                  </button>
                )
              })}
            </div>
          </div>

          {error && <p className="text-p14 text-red-500">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href={`/notices/${notice.id}`} className="px-4 py-2 border border-ink-200 rounded-lg text-p14 text-ink-500 hover:bg-ink-50 transition-colors">
              취소
            </Link>
            <button type="submit" disabled={loading}
              className="px-6 py-2 bg-primary text-white rounded-lg text-p14 font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? '저장 중...' : '수정 완료'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
