const WebSocket = require('ws')

// 포트 9222 탭 목록에서 page 탭 자동 선택
const http = require('http')

function getJson(port) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${port}/json/list`, (res) => {
      let data = ''
      res.on('data', d => data += d)
      res.on('end', () => resolve(JSON.parse(data)))
    }).on('error', reject)
  })
}

async function main() {
  const tabs = await getJson(9222)
  const pageTab = tabs.find(t => t.type === 'page' && !t.url.startsWith('chrome-extension'))
  if (!pageTab) { console.log('page 탭 없음'); process.exit(1) }

  console.log('탭 선택:', pageTab.id, pageTab.url)

  const ws = new WebSocket(pageTab.webSocketDebuggerUrl)
  let msgId = 1

  function send(method, params = {}) {
    const id = msgId++
    ws.send(JSON.stringify({ id, method, params }))
    return id
  }

  function waitForId(id, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout ' + id)), timeout)
      const handler = (data) => {
        const msg = JSON.parse(data)
        if (msg.id === id) {
          clearTimeout(timer)
          ws.off('message', handler)
          resolve(msg.result)
        }
      }
      ws.on('message', handler)
    })
  }

  function waitForEvent(event, timeout = 15000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('event timeout: ' + event)), timeout)
      const handler = (data) => {
        const msg = JSON.parse(data)
        if (msg.method === event) {
          clearTimeout(timer)
          ws.off('message', handler)
          resolve(msg.params)
        }
      }
      ws.on('message', handler)
    })
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

  function evaluate(expr) {
    const id = send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })
    return waitForId(id).then(r => r?.result?.value)
  }

  ws.on('open', async () => {
    send('Page.enable')
    send('Runtime.enable')

    // Vercel 배포 페이지로 이동
    const TARGET = 'https://vercel.com/rlarhtjq90-techs-projects/cozi-con-website-2ano/deployments'
    console.log('이동 중:', TARGET)
    send('Page.navigate', { url: TARGET })

    try {
      await waitForEvent('Page.loadEventFired', 15000)
    } catch {
      console.log('load timeout, 계속 진행')
    }
    await sleep(4000)

    const currentUrl = await evaluate('location.href')
    const title = await evaluate('document.title')
    console.log('현재 URL:', currentUrl)
    console.log('페이지 제목:', title)

    if (currentUrl.includes('login')) {
      console.log('\n⚠️  Vercel 로그인 필요 — Chrome 창에서 로그인 후 Enter 입력하세요')
      await new Promise(r => process.stdin.once('data', r))

      send('Page.navigate', { url: TARGET })
      await waitForEvent('Page.loadEventFired', 15000).catch(() => {})
      await sleep(4000)
      console.log('재방문 URL:', await evaluate('location.href'))
    }

    // 실패한 배포 링크 추출
    const deployLinks = await evaluate(`
      JSON.stringify(
        Array.from(document.querySelectorAll('a')).filter(a => {
          const href = a.href || ''
          return href.includes('/deployments/') && href.split('/').length > 6
        }).slice(0, 5).map(a => ({ href: a.href, text: (a.innerText||'').trim().slice(0,60) }))
      )
    `)
    const links = JSON.parse(deployLinks || '[]')
    console.log('\n=== 배포 링크 ===')
    links.forEach((l, i) => console.log(i, l.text.slice(0,50), '->', l.href))

    if (!links[0]) { ws.close(); return }

    // 첫 번째 배포(최신)로 이동
    const deployUrl = links[0].href
    console.log('\n배포 상세 이동:', deployUrl)
    send('Page.navigate', { url: deployUrl })
    await waitForEvent('Page.loadEventFired', 15000).catch(() => {})
    await sleep(5000)

    // 빌드 로그 탭 클릭 시도
    await evaluate(`
      const btns = Array.from(document.querySelectorAll('button, a, [role="tab"]'))
      const logBtn = btns.find(b => /build|log/i.test(b.innerText))
      if (logBtn) logBtn.click()
    `)
    await sleep(2000)

    // 에러 라인 추출
    const errorLines = await evaluate(`
      const text = document.body.innerText
      const lines = text.split('\\n')
      JSON.stringify(
        lines.filter(l =>
          /error|Error|failed|Failed|Cannot find|Module not found|npm ERR|SyntaxError|TypeError/i.test(l) &&
          !l.includes('node_modules/.bin') &&
          l.trim().length > 5
        ).slice(0, 40)
      )
    `)

    const errors = JSON.parse(errorLines || '[]')
    console.log('\n=== 빌드 에러 라인 ===')
    if (errors.length === 0) {
      // 전체 텍스트 일부 출력
      const pageText = await evaluate(`document.body.innerText.slice(0, 3000)`)
      console.log(pageText)
    } else {
      errors.forEach(l => console.log(' >', l.trim()))
    }

    ws.close()
  })

  ws.on('error', err => console.error('WS error:', err.message))
}

main().catch(console.error)
