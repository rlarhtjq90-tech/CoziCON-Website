'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BarChart3, Clock, FileText, Users, Megaphone,
  CheckCircle2, XCircle, Building2, AlertCircle,
  Eye, EyeOff, Pin, Trash2, Plus, ChevronDown,
  Shield, TrendingUp, Gavel, FileSignature,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type Stats = {
  users: { total: number; active: number; pending: number; rejected: number }
  notices: { open: number; total: number }
  bids: { total: number; accepted: number; rate: number }
  contracts: { active: number }
}

type PendingUser = {
  id: string
  email: string | null
  createdAt: string
  company: { name: string; bizNo: string; type: string; bizDocUrl: string | null } | null
  licenses: { licenseType: string; licenseNo: string | null }[]
}

type AdminNotice = {
  id: string
  title: string
  status: string
  isHidden: boolean
  deadline: string
  createdAt: string
  company: { name: string }
  _count: { submissions: number }
}

type AdminMember = {
  id: string
  email: string | null
  name: string | null
  status: string
  userType: string | null
  createdAt: string
  company: { name: string; bizNo: string } | null
}

type Announcement = {
  id: string
  title: string
  content: string
  isPinned: boolean
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

type Props = {
  stats: Stats
  pendingUsers: PendingUser[]
  notices: AdminNotice[]
  members: AdminMember[]
  announcements: Announcement[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
  GENERAL_CONTRACTOR: '종합건설사',
  SPECIALTY_CONTRACTOR: '전문건설사',
}
const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  ACTIVE:    { label: '정상', color: 'bg-emerald-50 text-emerald-600' },
  PENDING:   { label: '대기', color: 'bg-amber-50 text-amber-600' },
  REJECTED:  { label: '반려', color: 'bg-red-50 text-red-500' },
  SUSPENDED: { label: '정지', color: 'bg-ink-100 text-ink-400' },
}
const NOTICE_STATUS: Record<string, { label: string; color: string }> = {
  DRAFT:     { label: '초안', color: 'bg-ink-100 text-ink-400' },
  OPEN:      { label: '모집중', color: 'bg-emerald-50 text-emerald-600' },
  CLOSED:    { label: '마감', color: 'bg-amber-50 text-amber-600' },
  OPENED:    { label: '개찰됨', color: 'bg-blue-50 text-blue-600' },
  CANCELLED: { label: '취소', color: 'bg-red-50 text-red-400' },
}

// ─── Stats Tab ───────────────────────────────────────────────────────────────

function StatsTab({ stats }: { stats: Stats }) {
  const cards = [
    { label: '전체 가입자', value: stats.users.total, sub: '명', Icon: Users, color: 'text-primary bg-primary/10' },
    { label: '활성 회원', value: stats.users.active, sub: '명', Icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
    { label: '승인 대기', value: stats.users.pending, sub: '명', Icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: '활성 공고', value: stats.notices.open, sub: '건', Icon: FileText, color: 'text-blue-600 bg-blue-50' },
    { label: '총 입찰', value: stats.bids.total, sub: '건', Icon: Gavel, color: 'text-purple-600 bg-purple-50' },
    { label: '낙찰', value: stats.bids.accepted, sub: '건', Icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
    { label: '낙찰률', value: stats.bids.rate, sub: '%', Icon: BarChart3, color: 'text-primary bg-primary/10' },
    { label: '진행 계약', value: stats.contracts.active, sub: '건', Icon: FileSignature, color: 'text-blue-600 bg-blue-50' },
  ]

  return (
    <div>
      <h2 className="text-t6 font-bold text-ink-700 mb-6">플랫폼 통계</h2>
      <div className="grid grid-cols-2 tablet:grid-cols-4 gap-4">
        {cards.map(({ label, value, sub, Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-card-md">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-p13 text-ink-400 mb-1">{label}</p>
            <p className="text-t4 font-bold text-ink-800 leading-none">
              {value.toLocaleString()}
              <span className="text-p14 font-normal text-ink-400 ml-1">{sub}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Approval Tab ─────────────────────────────────────────────────────────────

function ApprovalTab({ initialUsers }: { initialUsers: PendingUser[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [processing, setProcessing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  async function approve(userId: string) {
    setProcessing(userId); setError(null)
    const res = await fetch('/api/admin/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) })
    if (res.ok) setUsers(prev => prev.filter(u => u.id !== userId))
    else setError('승인 처리에 실패했습니다.')
    setProcessing(null)
  }

  async function reject(userId: string) {
    setProcessing(userId); setError(null)
    const res = await fetch('/api/admin/reject', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, reason }) })
    if (res.ok) { setUsers(prev => prev.filter(u => u.id !== userId)); setRejectId(null); setReason('') }
    else setError('반려 처리에 실패했습니다.')
    setProcessing(null)
  }

  return (
    <div>
      <h2 className="text-t6 font-bold text-ink-700 mb-2">승인 대기</h2>
      <p className="text-p14 text-ink-400 mb-6">{users.length}건 대기 중</p>

      {error && (
        <div className="mb-4 flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-p14 text-red-600">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />{error}
        </div>
      )}

      {users.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-card-md">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <p className="text-p16 text-ink-500">대기 중인 승인 요청이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map(user => (
            <div key={user.id} className="bg-white rounded-2xl p-6 shadow-card-md">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-p15 font-semibold text-ink-700">{user.company?.name ?? '-'}</p>
                    <span className="px-2 py-0.5 bg-brand-slate-100 text-ink-500 text-p12 rounded">
                      {TYPE_LABEL[user.company?.type ?? ''] ?? user.company?.type}
                    </span>
                  </div>
                  <p className="text-p13 text-ink-400 mt-0.5">{user.company?.bizNo} · {user.email}</p>
                  <p className="text-p12 text-ink-300 mt-0.5">신청일: {new Date(user.createdAt).toLocaleDateString('ko-KR')}</p>
                  {user.company?.bizDocUrl && (
                    <a href={user.company.bizDocUrl} target="_blank" rel="noopener noreferrer"
                      className="text-p12 text-primary hover:underline mt-0.5 inline-block">
                      첨부 서류 보기 →
                    </a>
                  )}
                  {user.licenses.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {user.licenses.map((l, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-p12 rounded-full">
                          {l.licenseType}{l.licenseNo ? ` · ${l.licenseNo}` : ''}
                        </span>
                      ))}
                    </div>
                  )}
                  <a
                    href={`https://www.kiscon.net/intro.asp`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-p12 text-ink-400 hover:text-primary hover:underline mt-1 inline-block"
                  >
                    KISCON 면허 조회 →
                  </a>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => approve(user.id)} disabled={processing === user.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white text-p13 font-semibold rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50">
                    <CheckCircle2 className="w-4 h-4" />승인
                  </button>
                  <button onClick={() => setRejectId(user.id)} disabled={processing === user.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white text-p13 font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50">
                    <XCircle className="w-4 h-4" />반려
                  </button>
                </div>
              </div>

              {rejectId === user.id && (
                <div className="mt-4 pt-4 border-t border-ink-200">
                  <label className="block text-p13 font-medium text-ink-600 mb-1.5">반려 사유 (선택)</label>
                  <textarea
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    rows={2}
                    placeholder="예: 건설업등록증 유효기간 만료"
                    className="w-full px-3 py-2 border border-ink-300 rounded-lg text-p14 text-ink-700 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 resize-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => reject(user.id)} disabled={processing === user.id}
                      className="px-4 py-2 bg-red-500 text-white text-p13 font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50">
                      반려 확정
                    </button>
                    <button onClick={() => { setRejectId(null); setReason('') }}
                      className="px-4 py-2 text-p13 text-ink-500 hover:text-ink-700 transition-colors">
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Notices Tab ─────────────────────────────────────────────────────────────

function NoticesTab({ initialNotices }: { initialNotices: AdminNotice[] }) {
  const [notices, setNotices] = useState(initialNotices)
  const [processing, setProcessing] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'hidden'>('all')

  async function toggleHidden(id: string, current: boolean) {
    setProcessing(id)
    const res = await fetch(`/api/admin/notices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isHidden: !current }),
    })
    if (res.ok) setNotices(prev => prev.map(n => n.id === id ? { ...n, isHidden: !current } : n))
    setProcessing(null)
  }

  const filtered = filter === 'hidden' ? notices.filter(n => n.isHidden) : notices

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-t6 font-bold text-ink-700 mb-1">공고 관리</h2>
          <p className="text-p14 text-ink-400">총 {notices.length}건 / 비공개 {notices.filter(n => n.isHidden).length}건</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'hidden'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-p13 font-medium transition-colors ${filter === f ? 'bg-primary text-white' : 'bg-white border border-ink-200 text-ink-600 hover:border-primary'}`}>
              {f === 'all' ? '전체' : '비공개'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-ink-200 p-12 text-center">
          <p className="text-p14 text-ink-400">해당하는 공고가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(n => {
            const st = NOTICE_STATUS[n.status] ?? NOTICE_STATUS.DRAFT
            return (
              <div key={n.id}
                className={`bg-white rounded-xl border p-5 flex items-center gap-4 transition-opacity ${n.isHidden ? 'opacity-60 border-ink-200' : 'border-ink-200'}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-p12 font-medium px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                    {n.isHidden && <span className="text-p12 font-medium px-2 py-0.5 rounded-full bg-ink-100 text-ink-400">비공개</span>}
                    <span className="text-p12 text-ink-300">{n._count.submissions}건 입찰</span>
                  </div>
                  <p className="text-p14 font-semibold text-ink-700 truncate">{n.title}</p>
                  <p className="text-p13 text-ink-400 mt-0.5">
                    {n.company.name} · 마감 {new Date(n.deadline).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/notices/${n.id}`} target="_blank"
                    className="p-2 text-ink-400 hover:text-primary transition-colors rounded-lg hover:bg-brand-slate-100">
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button onClick={() => toggleHidden(n.id, n.isHidden)} disabled={processing === n.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-p13 font-medium transition-colors disabled:opacity-50 ${n.isHidden ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-ink-100 text-ink-500 hover:bg-ink-200'}`}>
                    {n.isHidden ? <><Eye className="w-3.5 h-3.5" />공개 복원</> : <><EyeOff className="w-3.5 h-3.5" />비공개</>}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Members Tab ─────────────────────────────────────────────────────────────

function MembersTab({ initialMembers }: { initialMembers: AdminMember[] }) {
  const [members, setMembers] = useState(initialMembers)
  const [processing, setProcessing] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  async function changeStatus(id: string, status: string) {
    setProcessing(id)
    const res = await fetch(`/api/admin/members/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) setMembers(prev => prev.map(m => m.id === id ? { ...m, status } : m))
    setProcessing(null)
  }

  const filtered = members.filter(m => {
    const matchStatus = statusFilter === 'all' || m.status === statusFilter
    const matchSearch = !search || (m.email ?? '').includes(search) || (m.company?.name ?? '').includes(search)
    return matchStatus && matchSearch
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-t6 font-bold text-ink-700 mb-1">회원 관리</h2>
          <p className="text-p14 text-ink-400">총 {members.length}명</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="이메일 또는 회사명 검색"
          className="flex-1 px-4 py-2.5 border border-ink-300 rounded-lg text-p14 text-ink-700 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
        <div className="flex gap-2">
          {['all', 'ACTIVE', 'PENDING', 'REJECTED', 'SUSPENDED'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-p13 font-medium transition-colors whitespace-nowrap ${statusFilter === s ? 'bg-primary text-white' : 'bg-white border border-ink-200 text-ink-600 hover:border-primary'}`}>
              {s === 'all' ? '전체' : STATUS_LABEL[s]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-ink-200 p-12 text-center">
            <p className="text-p14 text-ink-400">해당하는 회원이 없습니다.</p>
          </div>
        ) : filtered.map(m => {
          const st = STATUS_LABEL[m.status] ?? STATUS_LABEL.PENDING
          return (
            <div key={m.id} className="bg-white rounded-xl border border-ink-200 p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-p14 font-semibold text-ink-700 truncate">{m.company?.name ?? '(회사 미등록)'}</p>
                  {m.userType && <span className="text-p12 px-1.5 py-0.5 bg-brand-slate-100 text-ink-500 rounded">{TYPE_LABEL[m.userType] ?? m.userType}</span>}
                  <span className={`text-p12 font-medium px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                </div>
                <p className="text-p13 text-ink-400">{m.email} · {new Date(m.createdAt).toLocaleDateString('ko-KR')} 가입</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                {m.status !== 'ACTIVE' && (
                  <button onClick={() => changeStatus(m.id, 'ACTIVE')} disabled={processing === m.id}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-p13 font-medium hover:bg-emerald-100 transition-colors disabled:opacity-50">
                    활성화
                  </button>
                )}
                {m.status === 'ACTIVE' && (
                  <button onClick={() => changeStatus(m.id, 'SUSPENDED')} disabled={processing === m.id}
                    className="px-3 py-1.5 bg-ink-100 text-ink-500 rounded-lg text-p13 font-medium hover:bg-ink-200 transition-colors disabled:opacity-50">
                    정지
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Announcements Tab ───────────────────────────────────────────────────────

function AnnouncementsTab({ initialList }: { initialList: Announcement[] }) {
  const [list, setList] = useState(initialList)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', isPinned: false })
  const [submitting, setSubmitting] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  async function create() {
    if (!form.title || !form.content) return
    setSubmitting(true)
    const res = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const item = await res.json()
      setList(prev => [item, ...prev])
      setForm({ title: '', content: '', isPinned: false })
      setShowForm(false)
    }
    setSubmitting(false)
  }

  async function togglePin(id: string, current: boolean) {
    const res = await fetch(`/api/admin/announcements/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPinned: !current }),
    })
    if (res.ok) setList(prev => prev.map(a => a.id === id ? { ...a, isPinned: !current } : a))
  }

  async function remove(id: string) {
    if (!confirm('공지사항을 삭제하시겠습니까?')) return
    const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' })
    if (res.ok) setList(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-t6 font-bold text-ink-700 mb-1">공지사항</h2>
          <p className="text-p14 text-ink-400">총 {list.length}건</p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-p14 font-medium hover:bg-primary-600 transition-colors">
          <Plus className="w-4 h-4" />공지 작성
        </button>
      </div>

      {showForm && (
        <div className="bg-brand-slate-100 rounded-2xl p-6 mb-6 border border-ink-200">
          <h3 className="text-p16 font-semibold text-ink-700 mb-4">새 공지사항</h3>
          <div className="space-y-3">
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="공지 제목" className="w-full px-4 py-2.5 border border-ink-300 rounded-lg text-p14 text-ink-700 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              rows={4} placeholder="공지 내용을 입력하세요."
              className="w-full px-4 py-2.5 border border-ink-300 rounded-lg text-p14 text-ink-700 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPinned} onChange={e => setForm(p => ({ ...p, isPinned: e.target.checked }))} className="w-4 h-4 accent-primary" />
              <span className="text-p14 text-ink-600">상단 고정</span>
            </label>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={create} disabled={submitting || !form.title || !form.content}
              className="px-5 py-2 bg-primary text-white rounded-lg text-p14 font-medium hover:bg-primary-600 transition-colors disabled:opacity-50">
              {submitting ? '등록 중...' : '등록'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 text-p14 text-ink-500 hover:text-ink-700 transition-colors">
              취소
            </button>
          </div>
        </div>
      )}

      {list.length === 0 ? (
        <div className="bg-white rounded-xl border border-ink-200 p-12 text-center">
          <Megaphone className="w-10 h-10 text-ink-200 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-p14 text-ink-400">등록된 공지사항이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map(a => (
            <div key={a.id} className="bg-white rounded-xl border border-ink-200 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4">
                {a.isPinned && <Pin className="w-4 h-4 text-primary shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-p14 font-semibold text-ink-700 truncate">{a.title}</p>
                  <p className="text-p12 text-ink-400 mt-0.5">{new Date(a.createdAt).toLocaleDateString('ko-KR')}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => togglePin(a.id, a.isPinned)}
                    className={`p-1.5 rounded-lg transition-colors ${a.isPinned ? 'text-primary bg-primary/10' : 'text-ink-400 hover:text-primary hover:bg-brand-slate-100'}`}>
                    <Pin className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(a.id)}
                    className="p-1.5 rounded-lg text-ink-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                    className="p-1.5 rounded-lg text-ink-400 hover:text-ink-600 hover:bg-brand-slate-100 transition-colors">
                    <ChevronDown className={`w-4 h-4 transition-transform ${expanded === a.id ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
              {expanded === a.id && (
                <div className="px-5 pb-4 border-t border-ink-200 pt-4">
                  <p className="text-p14 text-ink-500 whitespace-pre-wrap leading-relaxed">{a.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const TABS = [
  { id: 'stats',         label: '통계',      Icon: BarChart3  },
  { id: 'approval',      label: '승인 대기',  Icon: Clock      },
  { id: 'notices',       label: '공고 관리',  Icon: FileText   },
  { id: 'members',       label: '회원 관리',  Icon: Users      },
  { id: 'announcements', label: '공지사항',   Icon: Megaphone  },
] as const

type TabId = typeof TABS[number]['id']

export default function AdminDashboard({ stats, pendingUsers, notices, members, announcements }: Props) {
  const [tab, setTab] = useState<TabId>('stats')

  return (
    <div className="min-h-screen bg-brand-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-ink-200 shadow-sm">
        <div className="container-content flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <a href="/" className="text-t6 font-bold text-primary tracking-tight">CastBid</a>
            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 text-p12 font-semibold rounded">
              <Shield className="w-3 h-3" />관리자
            </span>
          </div>
          <Link href="/dashboard" className="text-p14 text-ink-400 hover:text-primary transition-colors">
            대시보드
          </Link>
        </div>
      </header>

      {/* Tab Bar */}
      <div className="bg-white border-b border-ink-200 sticky top-0 z-10">
        <div className="container-content">
          <nav className="flex gap-1 overflow-x-auto">
            {TABS.map(({ id, label, Icon }) => {
              const badge = id === 'approval' && pendingUsers.length > 0 ? pendingUsers.length : null
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-2 px-4 py-4 text-p14 font-medium border-b-2 transition-colors whitespace-nowrap ${
                    tab === id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-ink-500 hover:text-ink-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {badge && (
                    <span className="min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="container-content py-10">
        {tab === 'stats' && <StatsTab stats={stats} />}
        {tab === 'approval' && <ApprovalTab initialUsers={pendingUsers} />}
        {tab === 'notices' && <NoticesTab initialNotices={notices} />}
        {tab === 'members' && <MembersTab initialMembers={members} />}
        {tab === 'announcements' && <AnnouncementsTab initialList={announcements} />}
      </main>
    </div>
  )
}
