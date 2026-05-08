'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Paperclip, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

type Child = { id: string; name: string; code: string }
type Category = { id: string; name: string; code: string; children: Child[] }

type AttachmentItem = {
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  uploading?: boolean
  error?: string
}

const REGIONS = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주']

export default function CreateNoticeForm({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [deadline, setDeadline] = useState('')
  const [description, setDescription] = useState('')
  const [asDraft, setAsDraft] = useState(false)
  const [attachments, setAttachments] = useState<AttachmentItem[]>([])
  const [expandedParents, setExpandedParents] = useState<string[]>(categories.map((c) => c.id))

  function toggleCategoryId(id: string) {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    )
  }

  function toggleParent(parentId: string) {
    setExpandedParents((prev) =>
      prev.includes(parentId) ? prev.filter((v) => v !== parentId) : [...prev, parentId]
    )
  }

  function toggleRegion(r: string) {
    setRegions((prev) => prev.includes(r) ? prev.filter((v) => v !== r) : [...prev, r])
  }

  // 선택된 중분류 이름 목록 (workTypes 전달용)
  const selectedNames = categories
    .flatMap((p) => p.children)
    .filter((c) => selectedCategoryIds.includes(c.id))
    .map((c) => c.name)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    for (const file of files) {
      const placeholder: AttachmentItem = {
        fileName: file.name, fileUrl: '', fileSize: file.size, mimeType: file.type, uploading: true,
      }
      setAttachments((prev) => [...prev, placeholder])

      const formData = new FormData()
      formData.append('file', file)

      try {
        const res = await fetch('/api/upload/notice-attachment', { method: 'POST', body: formData })
        const data = await res.json()
        if (!res.ok) {
          setAttachments((prev) =>
            prev.map((a) => a.fileName === file.name && a.uploading ? { ...a, uploading: false, error: data.error ?? '업로드 실패' } : a)
          )
        } else {
          setAttachments((prev) =>
            prev.map((a) => a.fileName === file.name && a.uploading
              ? { fileName: data.fileName, fileUrl: data.url, fileSize: data.fileSize, mimeType: data.mimeType, uploading: false }
              : a
            )
          )
        }
      } catch {
        setAttachments((prev) =>
          prev.map((a) => a.fileName === file.name && a.uploading ? { ...a, uploading: false, error: '업로드 실패' } : a)
        )
      }
    }
    e.target.value = ''
  }

  function removeAttachment(idx: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (selectedCategoryIds.length === 0) { setError('공종을 1개 이상 선택해주세요.'); return }
    if (attachments.some((a) => a.uploading)) { setError('파일 업로드가 완료될 때까지 기다려주세요.'); return }
    if (attachments.some((a) => a.error)) { setError('업로드 실패한 파일을 제거 후 다시 시도해주세요.'); return }

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
        description,
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
            <ArrowLeft className="w-4 h-4" />
            공고 목록으로
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
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예) 2026년 도로 보수공사 입찰 공고"
              className="w-full px-3 py-2.5 border border-ink-200 rounded-lg text-p15 focus:outline-none focus:border-primary"
              required
            />
          </div>

          {/* 공종 — 대분류/중분류 계층 선택 */}
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
                    <button
                      type="button"
                      onClick={() => toggleParent(parent.id)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-ink-50 hover:bg-ink-100 transition-colors text-left"
                    >
                      <span className="text-p14 font-semibold text-ink-700">
                        {parent.name}
                        {selectedInGroup > 0 && (
                          <span className="ml-2 text-p12 text-primary font-normal">{selectedInGroup}개</span>
                        )}
                      </span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-ink-400" /> : <ChevronDown className="w-4 h-4 text-ink-400" />}
                    </button>
                    {isOpen && (
                      <div className="px-4 py-3 flex flex-wrap gap-2">
                        {parent.children.map((child) => {
                          const checked = selectedCategoryIds.includes(child.id)
                          return (
                            <button
                              key={child.id}
                              type="button"
                              onClick={() => toggleCategoryId(child.id)}
                              className={`px-3 py-1.5 rounded-full text-p13 border transition-colors ${
                                checked
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-white text-ink-500 border-ink-200 hover:border-primary hover:text-primary'
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
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleRegion(r)}
                  className={`px-3 py-1.5 rounded-full text-p13 border transition-colors ${
                    regions.includes(r)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-ink-500 border-ink-200 hover:border-primary'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* 마감일 */}
          <div>
            <label className="block text-p14 font-medium text-ink-700 mb-1.5">
              마감일 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2.5 border border-ink-200 rounded-lg text-p15 focus:outline-none focus:border-primary"
              required
            />
          </div>

          {/* 공고 내용 */}
          <div>
            <label className="block text-p14 font-medium text-ink-700 mb-1.5">공고 내용</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="공사 개요, 입찰 조건, 제출 서류 등을 입력하세요."
              rows={6}
              className="w-full px-3 py-2.5 border border-ink-200 rounded-lg text-p15 focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* 첨부파일 */}
          <div>
            <label className="block text-p14 font-medium text-ink-700 mb-1.5">
              첨부파일
              <span className="ml-1 text-p13 text-ink-400 font-normal">PDF, DOC, DOCX, HWP, 이미지 · 최대 20MB</span>
            </label>
            {attachments.length > 0 && (
              <div className="mb-2 space-y-1.5">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-p14 ${
                      att.error ? 'border-red-200 bg-red-50' : 'border-ink-200 bg-brand-slate-100'
                    }`}
                  >
                    {att.uploading ? (
                      <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                    ) : (
                      <Paperclip className="w-4 h-4 text-ink-400 shrink-0" />
                    )}
                    <span className="flex-1 truncate text-ink-600">{att.fileName}</span>
                    {att.error ? (
                      <span className="text-p13 text-red-500 shrink-0">{att.error}</span>
                    ) : !att.uploading ? (
                      <span className="text-p13 text-ink-400 shrink-0">{(att.fileSize / 1024).toFixed(0)}KB</span>
                    ) : null}
                    <button type="button" onClick={() => removeAttachment(idx)} className="shrink-0 text-ink-300 hover:text-ink-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.hwp,.jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border border-dashed border-ink-300 rounded-lg text-p14 text-ink-400 hover:border-primary hover:text-primary transition-colors"
            >
              <Paperclip className="w-4 h-4" />
              파일 첨부
            </button>
          </div>

          {error && <p className="text-p14 text-red-500">{error}</p>}

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-p14 text-ink-500 cursor-pointer">
              <input type="checkbox" checked={asDraft} onChange={(e) => setAsDraft(e.target.checked)} className="rounded" />
              임시저장으로 등록
            </label>
            <div className="flex gap-3">
              <Link href="/notices" className="px-4 py-2 border border-ink-200 rounded-lg text-p14 text-ink-500 hover:bg-ink-50 transition-colors">
                취소
              </Link>
              <button
                type="submit"
                disabled={loading}
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
