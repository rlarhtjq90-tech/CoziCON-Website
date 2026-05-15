import { Resend } from 'resend'

const APP_URL = process.env.NEXTAUTH_URL ?? 'https://www.castbid.co.kr'

function getClient() {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  if (!apiKey || !from) throw new Error('[email] RESEND_API_KEY 또는 RESEND_FROM_EMAIL 미설정')
  return { resend: new Resend(apiKey), from: `CastBid <${from}>` }
}

function layout(body: string) {
  return `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;color:#222">
  <div style="margin-bottom:24px"><span style="font-size:20px;font-weight:800;color:#1a2dff">CastBid</span></div>
  ${body}
  <hr style="border:none;border-top:1px solid #eee;margin:32px 0">
  <p style="color:#aaa;font-size:12px;line-height:1.6">본인이 요청하지 않은 경우 무시하세요.</p>
</div>`
}

function otpBox(otp: string) {
  return `<div style="background:#f3f6fc;border-radius:12px;padding:24px;text-align:center;margin:24px 0">
  <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#1a2dff">${otp}</span>
</div>`
}

function cta(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;background:#1a2dff;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;margin:16px 0">${label}</a>`
}

function infoBox(label: string, value: string, accent = '#1a2dff') {
  return `<div style="background:#f9fafb;border-left:4px solid ${accent};padding:16px;border-radius:0 8px 8px 0;margin:16px 0">
  <p style="margin:0;font-size:13px;color:#888">${label}</p>
  <p style="margin:4px 0 0;font-weight:600">${value}</p>
</div>`
}

async function send(to: string, subject: string, html: string) {
  try {
    const { resend, from } = getClient()
    const { error } = await resend.emails.send({ from, to, subject, html })
    if (error) console.error(`[email] 발송 실패 (${to}):`, error)
  } catch (err) {
    console.error(`[email] 오류 (${to}):`, err)
  }
}

export async function sendOtpEmail(to: string, otp: string) {
  await send(to, '[CastBid] 이메일 인증번호', layout(`
    <h2 style="margin-bottom:8px">이메일 인증</h2>
    <p style="color:#555">아래 인증번호를 3분 이내에 입력해주세요.</p>
    ${otpBox(otp)}
  `))
}

export async function sendPasswordResetEmail(to: string, otp: string) {
  await send(to, '[CastBid] 비밀번호 재설정 인증번호', layout(`
    <h2 style="margin-bottom:8px">비밀번호 재설정</h2>
    <p style="color:#555">아래 인증번호를 3분 이내에 입력해주세요.</p>
    ${otpBox(otp)}
  `))
}

export async function sendBidAwardEmail(to: string, data: {
  userName: string
  noticeTitle: string
  contractId: string
}) {
  await send(to, '[CastBid] 낙찰 축하 알림', layout(`
    <h2 style="margin-bottom:8px">낙찰을 축하합니다!</h2>
    <p style="color:#555"><strong>${data.userName}</strong>님의 입찰이 낙찰되었습니다.</p>
    ${infoBox('공고명', data.noticeTitle)}
    <p style="color:#555">계약서를 확인하고 서명을 진행해주세요.</p>
    ${cta(`${APP_URL}/contracts/${data.contractId}`, '계약서 확인하기')}
  `))
}

export async function sendBidRejectedEmail(to: string, data: {
  userName: string
  noticeTitle: string
}) {
  await send(to, '[CastBid] 입찰 결과 안내', layout(`
    <h2 style="margin-bottom:8px">입찰 결과 안내</h2>
    <p style="color:#555"><strong>${data.userName}</strong>님, 이번 입찰에는 선정되지 않았습니다.</p>
    ${infoBox('공고명', data.noticeTitle, '#e5e7eb')}
    <p style="color:#555">다음 기회에 더 좋은 결과가 있기를 바랍니다.</p>
    ${cta(`${APP_URL}/notices`, '다른 공고 보기')}
  `))
}

export async function sendContractSignRequestEmail(to: string, data: {
  userName: string
  noticeTitle: string
  contractId: string
  signerRole: 'GC' | 'SC'
}) {
  const who = data.signerRole === 'GC' ? '발주사' : '수주사'
  await send(to, '[CastBid] 계약 서명 요청', layout(`
    <h2 style="margin-bottom:8px">계약 서명 요청</h2>
    <p style="color:#555"><strong>${data.userName}</strong>님, ${who} 측이 서명을 완료했습니다. 귀하의 서명이 필요합니다.</p>
    ${infoBox('공고명', data.noticeTitle)}
    ${cta(`${APP_URL}/contracts/${data.contractId}`, '계약서 서명하기')}
  `))
}

export async function sendContractActiveEmail(to: string, data: {
  userName: string
  noticeTitle: string
  contractId: string
}) {
  await send(to, '[CastBid] 계약 성립 완료', layout(`
    <h2 style="margin-bottom:8px">계약이 성립되었습니다</h2>
    <p style="color:#555"><strong>${data.userName}</strong>님, 양측 서명이 완료되어 계약이 정식 성립되었습니다.</p>
    ${infoBox('공고명', data.noticeTitle, '#22c55e')}
    ${cta(`${APP_URL}/contracts/${data.contractId}`, '계약 상세 보기')}
  `))
}

export async function sendAdminApprovalEmail(to: string, data: { userName: string }) {
  await send(to, '[CastBid] 회원 승인 완료', layout(`
    <h2 style="margin-bottom:8px">회원 승인이 완료되었습니다</h2>
    <p style="color:#555"><strong>${data.userName}</strong>님의 가입 심사가 완료되었습니다. 이제 서비스를 정상적으로 이용하실 수 있습니다.</p>
    ${cta(`${APP_URL}/dashboard`, '대시보드 바로가기')}
  `))
}

export async function sendNewNoticeEmail(to: string, data: {
  userName: string
  noticeTitle: string
  noticeId: string
}) {
  await send(to, '[CastBid] 새 입찰공고 알림', layout(`
    <h2 style="margin-bottom:8px">관심 키워드 새 공고</h2>
    <p style="color:#555"><strong>${data.userName}</strong>님, 구독하신 키워드와 일치하는 공고가 등록됐습니다.</p>
    ${infoBox('공고명', data.noticeTitle)}
    ${cta(`${APP_URL}/notices/${data.noticeId}`, '공고 확인하기')}
    <p style="color:#aaa;font-size:12px">수신 거부: 대시보드 → 알림 설정에서 이메일 알림을 끌 수 있습니다.</p>
  `))
}

export async function sendAdminRejectionEmail(to: string, data: { userName: string; reason?: string }) {
  await send(to, '[CastBid] 회원 심사 반려 안내', layout(`
    <h2 style="margin-bottom:8px">회원 심사 결과 안내</h2>
    <p style="color:#555"><strong>${data.userName}</strong>님, 제출하신 서류를 검토한 결과 가입 심사가 반려되었습니다.</p>
    ${data.reason ? infoBox('반려 사유', data.reason, '#f97316') : ''}
    <p style="color:#555">서류를 수정하여 재신청하시거나 문의 이메일로 연락해주세요.</p>
  `))
}
