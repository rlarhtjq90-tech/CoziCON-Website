import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import LogoutButton from '@/app/dashboard/LogoutButton'
import { ArrowLeft, Paperclip, MapPin, Wrench, Building2, Users, MessageSquare } from 'lucide-react'
import BidForm from './BidForm'
import BookmarkButton from './BookmarkButton'

type Params = { params: Promise<{ id: string }> }

export default async function NoticeDetailPage({ params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { id } = await params

  const [notice, user] = await Promise.all([
    prisma.bidNotice.findUnique({
      where: { id },
      include: {
        company: { select: { name: true, address: true, phone: true } },
        attachments: true,
        _count: { select: { submissions: true } },
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true, status: true, companyId: true },
    }),
  ])

  const isBookmarked = !!(await prisma.noticeBookmark.findUnique({
    where: { userId_noticeId: { userId: session.user.id, noticeId: id } },
  }))

  if (!notice) notFound()

  const deadline = notice.deadline
  const diff = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const deadlineLabel = deadline.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })

  const isOwner = notice.authorId === session.user.id
  const isContractor = user?.userType === 'SPECIALTY_CONTRACTOR'
  const isOpen = notice.status === 'OPEN' && diff >= 0
  const isOpened = notice.status === 'OPENED'

  // 이미 입찰했는지 확인
  const mySubmission = user?.companyId && isContractor
    ? await prisma.bidSubmission.findUnique({
        where: { noticeId_companyId: { noticeId: id, companyId: user.companyId } },
      })
    : null

  return (
    <div className="min-h-screen bg-brand-slate-100">
      <header className="bg-white border-b border-ink-200 shadow-sm">
        <div className="container-content flex items-center justify-between h-16">
          <a href="/" className="text-t6 font-bold text-primary tracking-tight">CoziCON</a>
          <div className="flex items-center gap-4">
            <span className="text-p14 text-ink-500">{session.user?.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container-content py-10 max-w-3xl">
        <div className="mb-6">
          <Link href="/notices" className="flex items-center gap-1.5 text-p14 text-ink-400 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            공고 목록으로
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-ink-200 p-8">
          {/* 상태 배지 */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-p13 font-medium px-2.5 py-0.5 rounded-full ${
              notice.status === 'OPEN'   ? 'bg-green-50 text-green-600' :
              notice.status === 'CLOSED' ? 'bg-yellow-50 text-yellow-600' :
              notice.status === 'OPENED' ? 'bg-blue-50 text-brand-blue' :
              notice.status === 'DRAFT'  ? 'bg-ink-100 text-ink-400' :
              'bg-red-50 text-red-500'
            }`}>
              {notice.status === 'OPEN'   ? '모집중' :
               notice.status === 'CLOSED' ? '개찰 대기' :
               notice.status === 'OPENED' ? '개찰됨' :
               notice.status === 'DRAFT'  ? '임시저장' : '취소'}
            </span>
            {diff > 0 && notice.status === 'OPEN' && (
              <span className={`text-p13 font-medium px-2.5 py-0.5 rounded-full ${diff <= 3 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-brand-blue'}`}>
                D-{diff}
              </span>
            )}
          </div>

          <div className="flex items-start justify-between gap-4 mb-6">
            <h1 className="text-t4 font-bold text-ink-700">{notice.title}</h1>
            <BookmarkButton noticeId={notice.id} initialBookmarked={isBookmarked} />
          </div>

          {/* 핵심 정보 */}
          <div className="mb-8 flex flex-wrap gap-3">
            <div className="bg-brand-slate-100 rounded-lg p-4">
              <p className="text-p13 text-ink-400 mb-1">입찰 마감일시</p>
              <p className="text-p16 font-semibold text-ink-700">{deadlineLabel}</p>
            </div>
            {notice.openingAt && (
              <div className="bg-brand-slate-100 rounded-lg p-4">
                <p className="text-p13 text-ink-400 mb-1">개찰 일시</p>
                <p className="text-p16 font-semibold text-ink-700">
                  {notice.openingAt.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
            {(notice.constructionStart || notice.constructionEnd) && (
              <div className="bg-brand-slate-100 rounded-lg p-4">
                <p className="text-p13 text-ink-400 mb-1">공사기간</p>
                <p className="text-p16 font-semibold text-ink-700">
                  {notice.constructionStart
                    ? notice.constructionStart.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
                    : '미정'}
                  {' ~ '}
                  {notice.constructionEnd
                    ? notice.constructionEnd.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
                    : '미정'}
                </p>
              </div>
            )}
            {notice.estimatedPrice != null && (
              <div className="bg-brand-slate-100 rounded-lg p-4">
                <p className="text-p13 text-ink-400 mb-1">예정가격</p>
                <p className="text-p16 font-semibold text-ink-700">{Number(notice.estimatedPrice).toLocaleString()}원</p>
              </div>
            )}
          </div>

          {/* 입찰 조건 */}
          {(notice.bidMethod || notice.requiredLicenses.length > 0 || notice.qualificationNote) && (
            <div className="mb-8 border border-ink-100 rounded-lg p-5 space-y-3">
              <h2 className="text-p15 font-semibold text-ink-700">입찰 조건</h2>
              {notice.bidMethod && (
                <div className="flex items-center gap-3 text-p15">
                  <span className="text-ink-400 text-p13 w-20 shrink-0">낙찰방식</span>
                  <span className="px-2.5 py-0.5 bg-blue-50 text-brand-blue text-p13 rounded-full">{notice.bidMethod}</span>
                </div>
              )}
              {notice.requiredLicenses.length > 0 && (
                <div className="flex items-start gap-3 text-p15">
                  <span className="text-ink-400 text-p13 w-20 shrink-0 mt-0.5">필요 면허</span>
                  <div className="flex flex-wrap gap-1.5">
                    {notice.requiredLicenses.map((l) => (
                      <span key={l} className="px-2.5 py-0.5 bg-ink-100 text-ink-600 text-p13 rounded-full">{l}</span>
                    ))}
                  </div>
                </div>
              )}
              {notice.qualificationNote && (
                <div className="flex items-start gap-3 text-p15">
                  <span className="text-ink-400 text-p13 w-20 shrink-0 mt-0.5">자격요건</span>
                  <p className="text-ink-600 text-p14 whitespace-pre-wrap">{notice.qualificationNote}</p>
                </div>
              )}
            </div>
          )}

          {/* 상세 정보 */}
          <div className="space-y-3 mb-8 text-p15">
            <div className="flex items-start gap-3">
              <Wrench className="w-4 h-4 text-ink-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-ink-400 text-p13 block mb-1">공종</span>
                <div className="flex flex-wrap gap-1.5">
                  {notice.workTypes.map((wt) => (
                    <span key={wt} className="px-2 py-0.5 bg-blue-50 text-brand-blue text-p13 rounded-full">{wt}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-ink-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-ink-400 text-p13 block mb-1">지역</span>
                <div className="flex flex-wrap gap-1.5">
                  {notice.regions.map((r) => (
                    <span key={r} className="px-2 py-0.5 bg-ink-100 text-ink-600 text-p13 rounded-full">{r}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="w-4 h-4 text-ink-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-ink-400 text-p13 block mb-1">종합건설사</span>
                <p className="text-ink-700">{notice.company.name}</p>
                {notice.company.address && <p className="text-p13 text-ink-400">{notice.company.address}</p>}
                {notice.company.phone && <p className="text-p13 text-ink-400">{notice.company.phone}</p>}
              </div>
            </div>
          </div>

          {/* 공고 내용 */}
          {notice.description && (
            <div className="mb-8">
              <h2 className="text-p15 font-semibold text-ink-700 mb-3">공고 내용</h2>
              <div className="bg-brand-slate-100 rounded-lg p-4 text-p15 text-ink-600 whitespace-pre-wrap">
                {notice.description}
              </div>
            </div>
          )}

          {/* 첨부파일 */}
          {notice.attachments.length > 0 && (
            <div className="mb-8">
              <h2 className="text-p15 font-semibold text-ink-700 mb-3">첨부파일</h2>
              <div className="space-y-2">
                {notice.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 border border-ink-200 rounded-lg text-p14 text-ink-600 hover:border-primary hover:text-primary transition-colors"
                  >
                    <Paperclip className="w-4 h-4 shrink-0" />
                    <span className="truncate">{att.fileName}</span>
                    {att.fileSize && (
                      <span className="text-p13 text-ink-400 ml-auto shrink-0">
                        {(att.fileSize / 1024).toFixed(0)}KB
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-ink-100 pt-6 space-y-4">
            {/* 발주사: 수정 + 입찰 현황 + Q&A */}
            {isOwner && (
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/notices/${notice.id}/bids`}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-brand-blue rounded-lg text-p14 font-medium hover:bg-blue-100 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  입찰 현황 ({notice._count.submissions}건)
                </Link>
                <Link
                  href={`/notices/${notice.id}/qna`}
                  className="flex items-center gap-2 px-4 py-2 border border-ink-200 rounded-lg text-p14 text-ink-500 hover:bg-ink-50 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Q&amp;A
                </Link>
                <Link
                  href={`/notices/${notice.id}/edit`}
                  className="ml-auto px-4 py-2 border border-ink-200 rounded-lg text-p14 text-ink-500 hover:bg-ink-50 transition-colors"
                >
                  공고 수정
                </Link>
              </div>
            )}

            {/* 건설사: Q&A 링크 */}
            {isContractor && (
              <Link
                href={`/notices/${notice.id}/qna`}
                className="flex items-center gap-2 px-4 py-2 border border-ink-200 rounded-lg text-p14 text-ink-500 hover:bg-ink-50 transition-colors w-fit"
              >
                <MessageSquare className="w-4 h-4" />
                Q&amp;A 보기
              </Link>
            )}

            {/* 건설사: 입찰하기 폼 */}
            {isContractor && isOpen && (
              <BidForm
                noticeId={notice.id}
                alreadySubmitted={!!mySubmission}
                submittedAt={mySubmission?.createdAt?.toISOString() ?? null}
              />
            )}

            {/* 건설사: 개찰 결과 */}
            {isContractor && isOpened && mySubmission && (
              <div className={`rounded-lg px-5 py-4 text-p15 font-medium text-center ${
                mySubmission.status === 'ACCEPTED' ? 'bg-green-50 text-green-700' :
                mySubmission.status === 'REJECTED' ? 'bg-ink-100 text-ink-400' :
                'bg-blue-50 text-brand-blue'
              }`}>
                {mySubmission.status === 'ACCEPTED' ? '🎉 낙찰되었습니다!' :
                 mySubmission.status === 'REJECTED' ? '이번 입찰에서 탈락하였습니다.' :
                 '개찰이 완료되었습니다. 결과를 기다려주세요.'}
              </div>
            )}

            {/* 건설사 + 마감 (개찰 전) */}
            {isContractor && !isOpen && !isOpened && (
              <p className="text-p14 text-ink-400 text-center py-2">마감된 공고입니다.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
