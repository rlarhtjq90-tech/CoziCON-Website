'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit2, Trash2, Save, X, Eye } from 'lucide-react'

interface Post {
  id: string
  category: string
  title: string
  content: string
  viewCount: number
  createdAt: string
  updatedAt: string
  author: { id: string; name: string | null; email: string }
}

interface Props {
  post: Post
  isOwner: boolean
  categoryColor: Record<string, string>
}

export default function PostDetailClient({ post: initial, isOwner, categoryColor }: Props) {
  const router = useRouter()
  const [post, setPost] = useState(initial)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ title: initial.title, content: initial.content, category: initial.category })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/company/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? '저장 실패'); return }
      setPost((p) => ({ ...p, ...data.post }))
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('이 게시글을 삭제하시겠습니까?')) return
    setDeleting(true)
    try {
      await fetch(`/api/company/posts/${post.id}`, { method: 'DELETE' })
      router.push('/dashboard/notice-board')
    } finally {
      setDeleting(false)
    }
  }

  function formatDateTime(iso: string) {
    const d = new Date(iso)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  return (
    <div className="bg-white rounded-2xl shadow-card-md overflow-hidden">
      {/* 헤더 */}
      <div className="px-6 pt-6 pb-4 border-b border-ink-100">
        {editing ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              {['공지', '일반', '자료'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, category: c }))}
                  className={`px-3 py-1.5 rounded-lg text-p13 font-medium border transition-colors ${
                    form.category === c
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-ink-500 border-ink-200 hover:border-primary hover:text-primary'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2.5 border border-ink-200 rounded-lg text-p16 font-bold text-ink-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded text-p12 font-semibold border mb-2 ${
                  categoryColor[post.category] ?? 'bg-ink-50 text-ink-500 border-ink-200'
                }`}
              >
                {post.category}
              </span>
              <h1 className="text-t5 font-bold text-ink-700">{post.title}</h1>
            </div>
            {isOwner && !editing && (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-p13 text-ink-500 border border-ink-200 rounded-lg hover:border-primary hover:text-primary transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> 수정
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-p13 text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" /> 삭제
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 mt-3 text-p13 text-ink-400">
          <span>{post.author.name ?? post.author.email.split('@')[0]}</span>
          <span>·</span>
          <span>{formatDateTime(post.createdAt)}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {post.viewCount}</span>
        </div>
      </div>

      {/* 본문 */}
      <div className="px-6 py-5">
        {editing ? (
          <textarea
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            rows={12}
            className="w-full px-3 py-2.5 border border-ink-200 rounded-lg text-p14 text-ink-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
          />
        ) : (
          <p className="text-p14 text-ink-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
        )}
      </div>

      {error && (
        <div className="px-6 pb-4 text-p13 text-red-600">{error}</div>
      )}

      {editing && (
        <div className="flex justify-end gap-2 px-6 pb-5">
          <button
            onClick={() => { setEditing(false); setForm({ title: initial.title, content: initial.content, category: initial.category }) }}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-slate-100 text-ink-600 text-p14 font-semibold rounded-xl hover:bg-brand-slate-200 transition-colors"
          >
            <X className="w-4 h-4" /> 취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-p14 font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? '저장 중…' : '저장'}
          </button>
        </div>
      )}
    </div>
  )
}
