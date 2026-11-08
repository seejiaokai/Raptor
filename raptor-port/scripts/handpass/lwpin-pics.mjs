/* [LW-PIN-LAST-FRAME] (chat 14, 8 Nov 26): the pictures for his question — the real painted frames of one quick scroll
   down, at the frame's own size (headless Chromium hands its screencast over at 1x whatever the pixel density, so these
   are 1x — shown 1:1 with a tap to zoom, never scaled up), the last frame before the dates row meets the top bar and the next two after it, the pinned band
   outlined. The same gesture as lwpin-frames.mjs (a desktop wheel, a phone finger flick); a frame is the browser's own
   paint (Chromium's screencast), never a still taken at rest. Each case keeps trying, up to TRIES runs, until a run has a
   frame on each side of the meeting point.
     HP_URL=http://localhost:4381 LABEL=before node scripts/handpass/lwpin-pics.mjs
   Out: docs/img/handpass/2026-11-08-lw-pin-last-frame/pics/<LABEL>-<case>-<n>.png (n = -1 the frame before, 1 and 2
   the frames after) and <LABEL>-pics.json (each frame's scroll and how far past the meeting point it was painted). */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { chromium } from '@playwright/test'
process.env.HP_URL ||= 'http://localhost:4381'
const { BASE, login, go } = await import('./lib.mjs')
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(HERE, '../../docs/img/handpass/2026-11-08-lw-pin-last-frame/pics'); mkdirSync(OUT, { recursive: true })
const LABEL = process.env.LABEL || 'run', TRIES = +(process.env.TRIES || 5)
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean), want = k => !ONLY.length || ONLY.includes(k)
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const PIN = { lw: '[data-testid="sticky-head"]', qu: '[data-testid="qsticky-head"]' }
const ERRORS = [], META = { label: LABEL, base: BASE, at: new Date().toISOString(), cases: {} }

/* crops a frame and outlines the band — in a page of its own, so the picture is the frame's own pixels */
const cut = await (await browser.newContext()).newPage()
await cut.evaluate(() => {
  window.__cut = (d, dw, c, b) => new Promise((res, rej) => {
    const i = new Image()
    i.onload = () => {
      const s = i.naturalWidth / dw
      const k = document.createElement('canvas'); k.width = Math.round(c.w * s); k.height = Math.round(c.h * s)
      const g = k.getContext('2d'); g.drawImage(i, c.x * s, c.y * s, c.w * s, c.h * s, 0, 0, k.width, k.height)
      g.strokeStyle = '#ffb020'; g.lineWidth = 2 * s; g.setLineDash([7 * s, 4 * s])
      g.strokeRect((b.x - c.x) * s + s, (b.y - c.y) * s + s, b.w * s - 2 * s, b.h * s - 2 * s)
      res(k.toDataURL('image/png').split(',')[1])
    }
    i.onerror = rej; i.src = 'data:image/png;base64,' + d
  })
})

async function shoot(key, which, vp, touch) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: touch ? 2 : 1, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  const P = await ctx.newPage(), cdp = await ctx.newCDPSession(P)
  P.on('pageerror', e => ERRORS.push(key + ' PAGEERROR ' + e.message))
  P.on('console', m => { if (m.type() === 'error') ERRORS.push(key + ' console ' + m.text()) })
  await P.goto(BASE + '/'); await login(P, 'a')
  await P.addStyleTag({ content: '*{scroll-behavior:auto!important} .toast,.snack{display:none!important}' })
  if (which === 'lw') {
    await go(P, 'leavewar'); await P.waitForSelector('[data-testid^="month-"]'); await sleep(900)
    if (await P.locator('[data-testid="lw-tab-grid"]').count()) { await P.locator('[data-testid="lw-tab-grid"]').click(); await sleep(300) }
  } else { await go(P, 'quals'); await sleep(1200) }
  await P.evaluate(() => scrollTo(0, 0)); await sleep(700)
  const g = await P.evaluate(([which, sel]) => {
    const tb = document.querySelector('.topbar').getBoundingClientRect().bottom
    const head = which === 'lw' ? [...document.querySelectorAll('#page-leavewar tbody.mxhead')].find(h => !h.closest('.mxfixed')) : document.querySelector('#qtbl thead')
    const hr = head.getBoundingClientRect()
    return { tb, S: +(scrollY + hr.top - tb).toFixed(1), headH: hr.height }
  }, [which, PIN[which]])
  const crop = { x: 0, y: 0, w: touch ? vp.width : 900, h: Math.round(g.tb + g.headH + (touch ? 150 : 120)) }
  const band = { x: 0, y: g.tb, w: crop.w, h: g.headH }
  let got = null
  for (let t = 0; t < TRIES && !got; t++) {
    await P.evaluate(() => scrollTo(0, 0)); await sleep(700); await P.mouse.move(Math.min(700, vp.width / 2), Math.min(600, vp.height - 100))
    const frames = []
    cdp.on('Page.screencastFrame', async f => { frames.push({ data: f.data, y: f.metadata.scrollOffsetY, dw: f.metadata.deviceWidth }); try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }) } catch {} })
    await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1, maxWidth: vp.width * 2, maxHeight: vp.height * 2 }); await sleep(400)
    if (touch) {
      let y = 760
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 60, y }] })
      while (y > 260) { y -= 45; await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 60, y }] }); await sleep(16) }
      await sleep(5); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    } else for (let i = 0; i < 4; i++) { await P.mouse.wheel(0, 100); await sleep(80) }
    await sleep(900); await cdp.send('Page.stopScreencast'); cdp.removeAllListeners('Page.screencastFrame')
    // the frames in the order painted, a repeat of the same scroll dropped (the screencast re-sends a still page)
    const seq = frames.filter((f, i) => i === 0 || f.y !== frames[i - 1].y)
    const k = seq.findIndex(f => f.y >= g.S + 0.5)
    if (k > 0 && seq[k + 1]) got = { before: seq[k - 1], a1: seq[k], a2: seq[k + 1], tries: t + 1 }
  }
  if (!got) { META.cases[key] = { error: 'no run with a frame each side of the meeting point', S: g.S }; await ctx.close(); return }
  const out = { S: g.S, tb: g.tb, headH: g.headH, crop, tries: got.tries, frames: {} }
  for (const [n, f] of [['-1', got.before], ['1', got.a1], ['2', got.a2]]) {
    writeFileSync(`${OUT}/${LABEL}-${key}-${n}.png`, Buffer.from(await cut.evaluate(([d, dw, c, b]) => window.__cut(d, dw, c, b), [f.data, f.dw, crop, band]), 'base64'))
    out.frames[n] = { y: f.y, pastMeeting: +(f.y - g.S).toFixed(1) }
  }
  META.cases[key] = out
  console.log(key, JSON.stringify(out))
  await ctx.close()
}

const CASES = [['lw-ph', 'lw', { width: 402, height: 874 }, true], ['qu-ph', 'qu', { width: 402, height: 874 }, true], ['lw-pc', 'lw', { width: 1536, height: 864 }, false], ['qu-pc', 'qu', { width: 1536, height: 864 }, false]]
for (const [k, which, vp, touch] of CASES) if (want(k)) await shoot(k, which, vp, touch).catch(e => { META.cases[k] = { error: e.message }; console.log(k, 'ERROR', e.message) })
META.errors = ERRORS
writeFileSync(`${OUT}/${LABEL}-pics.json`, JSON.stringify(META, null, 1))
console.log('errors', ERRORS.length, ERRORS.slice(0, 5))
await browser.close()
