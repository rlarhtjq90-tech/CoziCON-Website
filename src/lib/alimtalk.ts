const ALIGO_URL = 'https://kakaoapi.aligo.in/akv10/alimtalk/send/'
const APP_URL = process.env.NEXTAUTH_URL ?? 'https://www.castbid.co.kr'

interface AligoResponse {
  code: number
  message: string
}

function getConfig() {
  const apikey = process.env.ALIGO_API_KEY
  const userid = process.env.ALIGO_USER_ID
  const senderkey = process.env.ALIGO_SENDER_KEY
  const sender = process.env.ALIGO_SENDER
  if (!apikey || !userid || !senderkey || !sender) return null
  return { apikey, userid, senderkey, sender }
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '')
}

interface SendParams {
  tplCode: string
  receiver: string
  subject: string
  message: string
  button?: { name: string; linkPc: string; linkMo: string }
}

async function send(params: SendParams) {
  const config = getConfig()
  if (!config) {
    console.warn('[alimtalk] 환경변수 미설정 — 발송 건너뜀')
    return
  }

  const phone = normalizePhone(params.receiver)
  if (!phone) return

  const body = new URLSearchParams({
    apikey:     config.apikey,
    userid:     config.userid,
    senderkey:  config.senderkey,
    tpl_code:   params.tplCode,
    sender:     config.sender,
    receiver_1: phone,
    subject_1:  params.subject,
    message_1:  params.message,
  })

  if (params.button) {
    body.set('button_1', JSON.stringify({
      button: [{
        name:         params.button.name,
        linkType:     'WL',
        linkTypeName: '웹링크',
        linkPc:       params.button.linkPc,
        linkMo:       params.button.linkMo,
      }],
    }))
  }

  try {
    const res = await fetch(ALIGO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    const data: AligoResponse = await res.json()
    if (data.code !== 0) console.error(`[alimtalk] 발송 실패 (${phone}):`, data.message)
  } catch (err) {
    console.error(`[alimtalk] 오류 (${phone}):`, err)
  }
}

export async function sendBidAwardAlimtalk(phone: string, data: {
  userName: string
  noticeTitle: string
  contractId: string
}) {
  const tplCode = process.env.ALIGO_TPL_BID_AWARDED
  if (!tplCode) return
  await send({
    tplCode,
    receiver: phone,
    subject: '낙찰 안내',
    message:
      `[CastBid] 낙찰 안내\n\n` +
      `안녕하세요, ${data.userName}님.\n\n` +
      `${data.noticeTitle} 공고에 낙찰되셨습니다.\n\n` +
      `계약서를 확인하고 서명을 진행해주세요.`,
    button: {
      name:   '계약서 확인',
      linkPc: `${APP_URL}/contracts/${data.contractId}`,
      linkMo: `${APP_URL}/contracts/${data.contractId}`,
    },
  })
}

export async function sendBidRejectedAlimtalk(phone: string, data: {
  userName: string
  noticeTitle: string
}) {
  const tplCode = process.env.ALIGO_TPL_BID_REJECTED
  if (!tplCode) return
  await send({
    tplCode,
    receiver: phone,
    subject: '입찰 결과 안내',
    message:
      `[CastBid] 입찰 결과 안내\n\n` +
      `안녕하세요, ${data.userName}님.\n\n` +
      `${data.noticeTitle} 공고 입찰 결과,\n` +
      `이번에는 선정되지 않았습니다.\n\n` +
      `다음 기회에 더 좋은 결과가 있기를 바랍니다.`,
  })
}

export async function sendBidOpenedAlimtalk(phone: string, data: {
  userName: string
  noticeTitle: string
  noticeId: string
}) {
  const tplCode = process.env.ALIGO_TPL_BID_OPENED
  if (!tplCode) return
  await send({
    tplCode,
    receiver: phone,
    subject: '개찰 안내',
    message:
      `[CastBid] 개찰 안내\n\n` +
      `안녕하세요, ${data.userName}님.\n\n` +
      `${data.noticeTitle} 공고의 개찰이 완료되었습니다.\n\n` +
      `입찰 결과를 확인해주세요.`,
    button: {
      name:   '결과 확인',
      linkPc: `${APP_URL}/notices/${data.noticeId}`,
      linkMo: `${APP_URL}/notices/${data.noticeId}`,
    },
  })
}

export async function sendContractSignAlimtalk(phone: string, data: {
  userName: string
  noticeTitle: string
  contractId: string
}) {
  const tplCode = process.env.ALIGO_TPL_CONTRACT_SIGN
  if (!tplCode) return
  await send({
    tplCode,
    receiver: phone,
    subject: '계약 서명 요청',
    message:
      `[CastBid] 계약 서명 요청\n\n` +
      `안녕하세요, ${data.userName}님.\n\n` +
      `${data.noticeTitle} 계약서 서명이 필요합니다.\n\n` +
      `아래 버튼을 눌러 서명을 완료해주세요.`,
    button: {
      name:   '계약서 서명',
      linkPc: `${APP_URL}/contracts/${data.contractId}`,
      linkMo: `${APP_URL}/contracts/${data.contractId}`,
    },
  })
}
