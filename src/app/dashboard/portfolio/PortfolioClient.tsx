'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, FileText, X } from 'lucide-react'

type PortfolioItem = {
  id: string
  title: string
  client: string
  startDate: string
  endDate: string
  amount: number | null
  workCategory: string
  description: string | null
  docUrl: string | null
  createdAt: string
}

type FormData = {
  title: string
  client: string
  startDate: string
  endDate: string
  amount: string
  workCategory: string
  description: string
  docUrl: string
  docFileName: string
}

const EMPTY_FORM: FormData = {
  title: '', client: '', startDate: '', endDate: '',
  amount: '', workCategory: '', description: '', docUrl: '', docFileName: '',
}

function formatAmount(n: number | null) {
  if (!n) return '—'
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억원`
  if (n >= 10_000) return `${Math.round(n / 10_000)}만원`
  return `${n.toLocaleString()}원`
}

export default function PortfolioClient({ initialPortfolios }: { initialPortfolios: PortfolioItem[] }) {
  const [portfolios, setPortfolios] = useState(initialPortfolios)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function openAdd() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError('')
    setShowModal(true)
  }

  function openEdit(p: PortfolioItem) {
    setEditingId(p.id)
    setForm({
      title: p.title,
      client: p.client,
      startDate: p.startDate.slice(0, 10),
      endDate: p.endDate.slice(0, 10),
      amount: p.amount ? String(p.amount) : '',
      workCategory: p.workCategory,
      description: p.description ?? '',
      docUrl: p.docUrl ?? '',
      docFileName: p.docUrl ? p.docUrl.split('/').pop() ?? '' : '',
    })
    setError('')
    setShowModal(true)
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload/portfolio-doc', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setForm(f => ({ ...f, docUrl: data.url, docFileName: file.name }))
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드 실패')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const body = {
        title: form.title,
        client: form.client,
        startDate: form.startDate,
        endDate: form.endDate,
        amount: form.amount ? Number(form.amount) : undefined,
        workCategory: form.workCategory,
        description: form.description || undefined,
        docUrl: form.docUrl || undefined,
      }
      const url = editingId ? `/api/portfolio/${editingId}` : '/api/portfolio'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (editingId) {
        setPortfolios(ps => ps.map(p => p.id === editingId ? {
          ...data.portfolio,
          amount: data.portfolio.amount ? Number(data.portfolio.amount) : null,
          startDate: data.portfolio.startDate,
          endDate: data.portfolio.endDate,
          createdAt: data.portfolio.createdAt,
        } : p))
      } else {
        setPortfolios(ps => [{
          ...data.portfolio,
          amount: data.portfolio.amount ? Number(data.portfolio.amount) : null,
          startDate: data.portfolio.startDate,
          endDate: data.portfolio.endDate,
          createdAt: data.portfolio.createdAt,
        }, ...ps])
      }
      setShowModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 실패')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('이 실적을 삭제하시겠습니까?')) return
    const res = await fetch(`/api/portfolio/${id}`, { method: 'DELETE' })
    if (res.ok) setPortfolios(ps => ps.filter(p => p.id !== id))
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-p14 font-semibold rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          새 실적 추가
        </button>
      </div>

      {portfolios.length === 0 ? (
        <div className="text-center py-16 text-ink-400">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-p15">등록된 시공 실적이 없습니다.</p>
          <p className="text-p13 mt-1">실적을 추가하면 공개 프로필에 표시됩니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {portfolios.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-ink-200 p-5 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-p15 font-semibold text-ink-700">{p.title}</p>
                <p className="text-p13 text-ink-400 mt-1">
                  {p.client} · {p.workCategory} · {formatAmount(p.amount)}
                </p>
                <p className="text-p13 text-ink-400">
                  {p.startDate.slice(0, 10)} ~ {p.endDate.slice(0, 10)}
                </p>
                {p.docUrl && !p.docUrl.startsWith('__mock__') && (
                  <a
                    href={p.docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-p13 text-primary mt-1 hover:underline"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    준공서류 보기
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openEdit(p)} className="p-2 text-ink-400 hover:text-primary transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-2 text-ink-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-p16 font-bold text-ink-700">
                {editingId ? '실적 수정' : '새 실적 추가'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-ink-400 hover:text-ink-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-p13 font-medium text-ink-600 mb-1">공사명 *</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-ink-200 rounded-lg px-3 py-2 text-p14 focus:outline-none focus:border-primary"
                  placeholder="예: OO빌딩 토목공사"
                />
              </div>
              <div>
                <label className="block text-p13 font-medium text-ink-600 mb-1">발주처 *</label>
                <input
                  required
                  value={form.client}
                  onChange={e => setForm(f => ({ ...f, client: e.target.value }))}
                  className="w-full border border-ink-200 rounded-lg px-3 py-2 text-p14 focus:outline-none focus:border-primary"
                  placeholder="예: (주)OO건설"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-p13 font-medium text-ink-600 mb-1">시작일 *</label>
                  <input
                    required
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full border border-ink-200 rounded-lg px-3 py-2 text-p14 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-p13 font-medium text-ink-600 mb-1">완료일 *</label>
                  <input
                    required
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full border border-ink-200 rounded-lg px-3 py-2 text-p14 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-p13 font-medium text-ink-600 mb-1">공사금액 (원)</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="w-full border border-ink-200 rounded-lg px-3 py-2 text-p14 focus:outline-none focus:border-primary"
                    placeholder="예: 500000000"
                  />
                </div>
                <div>
                  <label className="block text-p13 font-medium text-ink-600 mb-1">공종 *</label>
                  <input
                    required
                    value={form.workCategory}
                    onChange={e => setForm(f => ({ ...f, workCategory: e.target.value }))}
                    className="w-full border border-ink-200 rounded-lg px-3 py-2 text-p14 focus:outline-none focus:border-primary"
                    placeholder="예: 토목공사업"
                  />
                </div>
              </div>
              <div>
                <label className="block text-p13 font-medium text-ink-600 mb-1">공사 개요</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-ink-200 rounded-lg px-3 py-2 text-p14 focus:outline-none focus:border-primary resize-none"
                  placeholder="공사 개요를 간략히 입력해주세요."
                />
              </div>
              <div>
                <label className="block text-p13 font-medium text-ink-600 mb-1">준공서류 (PDF)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="w-full text-p13 text-ink-500"
                />
                {form.docFileName && (
                  <p className="text-p12 text-primary mt-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    {form.docFileName}
                  </p>
                )}
              </div>

              {error && <p className="text-p13 text-red-500">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-ink-200 text-p14 font-medium text-ink-600 rounded-lg hover:bg-ink-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 py-2.5 bg-primary text-white text-p14 font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
                >
                  {saving ? '저장 중...' : editingId ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
