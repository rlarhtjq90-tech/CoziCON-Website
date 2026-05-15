'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Inbox, X } from 'lucide-react'

interface Post {
  id: string
  category: string
  title: string
  viewCount: number
  createdAt: string
  author: { name: string | null; email: string }
}

const CATEGORIES = ['전체', '공지', '일반', '자료'] as const
type Category = (typeof CATEGORIES)[number]

const categoryColor: Record<string, string> = {
  공지: 'bg-red-50 text-red-600 border-red-200',
  일반: 'bg-sky-50 text-sky-600 border-sky-200',
  자료: 'bg-emerald-50 text-emerald-600 border-emerald-200',
}

interface Props {
  userId: string
}

export default function NoticeBoardClient({ userId }: Props) {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [q, setQ] = useState('')
  const [inputQ, setInputQ] = useState('')
  const [category, setCategory] = useState<Category>('전체')
  const [loading, setLoading] = useState(true)

  // 글 작성 모달
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', category: '일반' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (q) params.set('q', q)
      if (category !== '전체') params.set('category', category)
      const res = await fetch(`/api/company/posts?${params}`)
      const data = await res.json()
      if (res.ok) {
        setPosts(data.posts)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      }
    } finally {
      setLoading(false)
    }
  }, [page, q, category])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    setQ(inputQ)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!form.title.trim() || !form.content.trim()) {
      setFormError('제목과 내용을 모두 입력하세요.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/company/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setFormError(data.error ?? '오류가 발생했습니다.'); return }
      setModalOpen(false)
      setForm({ title: '', content: '', category: '일반' })
      setPage(1)
      fetchPosts()
    } finally {
      setSubmitting(false)
    }
  }

  function formatDate(iso: string) {
    const d = new Date(iso)
    return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              value={inputQ}
              onChange={(e) => setInputQ(e.target.value)}
              placeholder="제목 검색"
              className="pl-9 pr-4 py-2 border border-ink-200 rounded-lg text-p14 text-ink-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors w-56"
            />
          </div>
          {inputQ && (
            <button type="button" onClick={() => { setInputQ(''); setQ(''); setPage(1) }}>
              <X className="w-4 h-4 text-ink-400 hover:text-ink-700" />
            </button>
          )}
        </form>

        <button
          onClick={() => { setModalOpen(true); setFormError('') }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-p14 font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          글 작성
        </button>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-1.5 mb-4">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => { setCategory(c); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-p13 font-medium border transition-colors ${
              category === c
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-ink-500 border-ink-200 hover:border-primary hover:text-primary'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-2xl shadow-card-md overflow-hidden">
        {/* 헤더 행 */}
        <div className="grid grid-cols-[80px_1fr_100px_80px] px-5 py-3 bg-brand-slate-50 border-b border-ink-100">
          <span className="text-p12 font-semibold text-ink-400">구분</span>
          <span className="text-p12 font-semibold text-ink-400">제목</span>
          <span className="text-p12 font-semibold text-ink-400 text-center">작성자</span>
          <span className="text-p12 font-semibold text-ink-400 text-right">날짜</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-ink-300">
            <Inbox className="w-10 h-10" />
            <p className="text-p14">게시글이 없습니다</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              onClick={() => router.push(`/dashboard/notice-board/${post.id}`)}
              className="grid grid-cols-[80px_1fr_100px_80px] px-5 py-3.5 border-b border-ink-50 hover:bg-brand-slate-50 cursor-pointer transition-colors last:border-0"
            >
              <div className="flex items-center">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-p11 font-semibold border ${
                    categoryColor[post.category] ?? 'bg-ink-50 text-ink-500 border-ink-200'
                  }`}
                >
                  {post.category}
                </span>
              </div>
              <p className="text-p14 text-ink-700 font-medium truncate pr-4 flex items-center">{post.title}</p>
              <p className="text-p13 text-ink-400 text-center flex items-center justify-center truncate">
                {post.author.name ?? post.author.email.split('@')[0]}
              </p>
              <p className="text-p13 text-ink-400 text-right flex items-center justify-end">{formatDate(post.createdAt)}</p>
            </div>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-ink-200 text-ink-500 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-p14"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-p14 font-medium transition-colors border ${
                p === page
                  ? 'bg-primary text-white border-primary'
                  : 'border-ink-200 text-ink-500 hover:border-primary hover:text-primary'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-ink-200 text-ink-500 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-p14"
          >
            ›
          </button>
        </div>
      )}

      {total > 0 && (
        <p className="text-center text-p13 text-ink-400 mt-2">총 {total}개</p>
      )}

      {/* 글 작성 모달 */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
              <h2 className="text-p16 font-bold text-ink-700">글 작성</h2>
              <button onClick={() => setModalOpen(false)} className="text-ink-400 hover:text-ink-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-p13 font-medium text-ink-500 mb-1.5">카테고리</label>
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
              </div>
              <div>
                <label className="block text-p13 font-medium text-ink-500 mb-1.5">제목</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="제목을 입력하세요"
                  className="w-full px-3 py-2.5 border border-ink-200 rounded-lg text-p14 text-ink-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-p13 font-medium text-ink-500 mb-1.5">내용</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="내용을 입력하세요"
                  rows={6}
                  className="w-full px-3 py-2.5 border border-ink-200 rounded-lg text-p14 text-ink-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                />
              </div>
              {formError && (
                <p className="text-p13 text-red-600">{formError}</p>
              )}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-brand-slate-100 text-ink-600 text-p14 font-semibold rounded-xl hover:bg-brand-slate-200 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-primary text-white text-p14 font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {submitting ? '등록 중…' : '등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
