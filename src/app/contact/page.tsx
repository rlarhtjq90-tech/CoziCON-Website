'use client'

import type { Metadata } from 'next'
import Link from 'next/link'
import { useState } from 'react'
import { CheckCircle2, Mail, Phone } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-brand-slate-100">
      <header className="bg-white border-b border-ink-200">
        <div className="container-content h-16 flex items-center justify-between">
          <Link href="/" className="text-t6 font-bold text-primary tracking-tight">CastBid</Link>
          <div className="flex items-center gap-4 text-p14">
            <Link href="/login" className="text-ink-500 hover:text-primary transition-colors">로그인</Link>
            <Link href="/signup" className="px-4 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary-600 transition-colors">
              시작하기
            </Link>
          </div>
        </div>
      </header>

      <main className="container-content py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-t4 font-bold text-ink-700">1:1 문의</h1>
            <p className="mt-2 text-p16 text-ink-500">
              서비스 이용 중 궁금한 점이나 불편한 사항을 남겨주세요. 영업일 기준 1~2일 내에 답변드립니다.
            </p>
          </div>

          <div className="grid laptop:grid-cols-3 gap-6">
            {/* 문의 채널 */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-ink-200 p-6">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <p className="text-p14 font-semibold text-ink-700">전화 문의</p>
                <p className="text-p16 font-bold text-primary mt-1">1600-0000</p>
                <p className="text-p13 text-ink-400 mt-1">평일 09:00 – 18:00</p>
              </div>
              <div className="bg-white rounded-2xl border border-ink-200 p-6">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <p className="text-p14 font-semibold text-ink-700">이메일</p>
                <p className="text-p14 text-primary mt-1">support@CastBid.co.kr</p>
                <p className="text-p13 text-ink-400 mt-1">24시간 접수, 영업일 내 답변</p>
              </div>
            </div>

            {/* 문의 폼 */}
            <div className="laptop:col-span-2 bg-white rounded-2xl border border-ink-200 p-8">
              {status === 'done' ? (
                <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
                  <CheckCircle2 className="w-14 h-14 text-green-500" />
                  <h2 className="text-t6 font-bold text-ink-700">문의가 접수되었습니다</h2>
                  <p className="text-p14 text-ink-500">영업일 기준 1~2일 내에 입력하신 이메일로 답변드리겠습니다.</p>
                  <Link href="/" className="mt-2 text-p14 text-primary hover:underline">홈으로 돌아가기</Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-p13 font-medium text-ink-600 mb-1.5">이름 *</label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="홍길동"
                        className="w-full px-4 py-2.5 border border-ink-300 rounded-lg text-p14 text-ink-700 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-p13 font-medium text-ink-600 mb-1.5">이메일 *</label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="example@company.com"
                        className="w-full px-4 py-2.5 border border-ink-300 rounded-lg text-p14 text-ink-700 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-p13 font-medium text-ink-600 mb-1.5">회사명</label>
                    <input
                      name="company"
                      value={form.company}
                      onChange={handleChange}
                      placeholder="(주)CastBid"
                      className="w-full px-4 py-2.5 border border-ink-300 rounded-lg text-p14 text-ink-700 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-p13 font-medium text-ink-600 mb-1.5">문의 유형 *</label>
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-ink-300 rounded-lg text-p14 text-ink-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-white"
                    >
                      <option value="">유형을 선택하세요</option>
                      <option value="가입/인증">가입 및 사업자 인증</option>
                      <option value="입찰 이용">입찰 공고·입찰 이용 방법</option>
                      <option value="계약">계약 관련</option>
                      <option value="결제">결제·환불</option>
                      <option value="오류신고">오류·버그 신고</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-p13 font-medium text-ink-600 mb-1.5">문의 내용 *</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="문의하실 내용을 자세히 적어주세요."
                      className="w-full px-4 py-2.5 border border-ink-300 rounded-lg text-p14 text-ink-700 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                    />
                  </div>

                  {status === 'error' && (
                    <p className="text-p13 text-red-500">전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full py-3 bg-primary text-white font-semibold text-p16 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === 'sending' ? '전송 중...' : '문의 보내기'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-ink-200 bg-white mt-8">
        <div className="container-content py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-p13 text-ink-400">
          <p>© 2025 CastBid. All rights reserved.</p>
          <nav className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-primary transition-colors">이용약관</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">개인정보처리방침</Link>
            <Link href="/legal" className="hover:text-primary transition-colors">통신판매업 정보</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
