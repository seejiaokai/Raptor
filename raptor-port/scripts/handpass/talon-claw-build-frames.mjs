// The loading claw on the BUILT app ([TALON-LOADING-CLAW], D1591, D1605; on every start, no wait, D1615) — the walk's script, written as assertions of
// the right behaviour (a PASS means correct). Serves dist/ with Vite's preview, slows the app's code (its scripts held
// back by DELAY ms, so the claw has time to show), and records the claw every frame from the page's first moment:
// whether it shows, its fade, and how far each claw's window has slid. Cases, in Chromium and WebKit (the iPhone's engine):
//   A  a slow load on a phone: shown from its first frame, 0.2 s into its round (the left claw mostly drawn, the middle
//      begun, the right not yet), then the right along its line; gone once the app is up, the sign-in usable at once
//      B  the same in WebKit        C  less motion asked for: the claw still and whole, removed at once
//   D  a quick load (D1615): shown from its first frame, gone with the sign-in
//   Q  the first frame the screen draws of the page already carries a clear part of the claw — its pixels counted in the
//      screen's own frames (the order §7.11, lesson 22)
//   E  the plain user's round: signed in, the top bar reading "142 TALON", nothing of the claw left; a reload, the claw again
//   F  the app cannot start (its saved data from a newer version): the message shows, never under the claw
//   G  a desktop: the claw in the middle      K  the page busy 1.5 s: the claw keeps moving (Chromium)
//   P  pictures of the drawing, paused at fixed moments, in both engines      I  the claw whole matches the logo
//   npm run build && node scripts/handpass/talon-claw-build-frames.mjs [out dir]
import { chromium, webkit } from '@playwright/test'
import { preview } from 'vite'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '../..')
const OUT = process.argv[2] || join(ROOT, 'docs/img/handpass/2026-11-03-talon/walk')
mkdirSync(OUT, { recursive: true })
const PORT = 4292, URL = `http://localhost:${PORT}/`, DELAY = 2600
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const LEN = [67.18, 75.57, 56.29]   // each window's slide: its claw's length plus 2px (index.html)
let fails = 0
const check = (ok, what) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${what}`); if (!ok) fails++ }

/* every frame, from before the page is parsed: the claw's state, and when the app's first screen appeared */
const RECORD = () => {
  window.__bc = []; let seen = false
  const tick = () => {
    const el = document.getElementById('bootclaw')
    const app = !!document.querySelector('#luser, #vWeek .day, .bootfail')
    if (el) {
      seen = true
      const cs = getComputedStyle(el), g = el.querySelector('.cs')
      // how far each window still has to slide (px): the length of its slide, read off its turned frame
      const ms = [0, 1, 2].map(i => { const w = document.getElementById('bc-w' + i); if (!w) return null; const m = new DOMMatrix(getComputedStyle(w).transform); return Math.round(Math.hypot(m.e, m.f) * 100) / 100 })
      const op = +cs.opacity, gone = el.classList.contains('gone')
      window.__bc.push({ t: Math.round(performance.now()), vis: op > 0.5 && !gone ? 'visible' : 'hidden', op, gone, gop: g ? +getComputedStyle(g).opacity : null, ms, app })
    } else if (seen) { window.__bc.push({ t: Math.round(performance.now()), removed: true, app }); return }
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

const server = await preview({ root: ROOT, preview: { port: PORT, strictPort: true, open: false }, logLevel: 'silent' })
const browsers = { chromium: await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}), webkit: await webkit.launch() }

async function open(engine, { phone = true, delay = DELAY, motion = 'no-preference', init } = {}) {
  const ctx = await browsers[engine].newContext({ viewport: phone ? { width: 390, height: 844 } : { width: 1536, height: 864 }, deviceScaleFactor: 2, reducedMotion: motion })
  const page = await ctx.newPage()
  const errs = []; page.on('pageerror', e => errs.push(e.message))
  await page.addInitScript(RECORD)
  if (init) await page.addInitScript(init)
  if (delay) await page.route('**/assets/*.js', async r => { await new Promise(res => setTimeout(res, delay)); await r.continue() })
  return { ctx, page, errs }
}
const shots = async (page, name, times) => {
  for (const t of times) {
    await page.waitForFunction(t => performance.now() >= t, t, { timeout: 15000 })
    /* named by the moment the picture was taken, not the moment asked for: WebKit's Windows build takes a second or
       more over a picture (3 Nov 26), so a picture asked for at 250 ms can show 1.4 s */
    const buf = await page.screenshot()
    const at = Math.round(await page.evaluate(() => performance.now()))
    writeFileSync(join(OUT, `${name}-${String(at).padStart(4, '0')}ms.png`), buf)
  }
}
/* when (ms) each claw's window first slides past 5% of its claw, and the first moment the claw was visible */
const read = rec => {
  const vis = rec.filter(r => !r.removed && r.vis === 'visible')
  const start = [0, 1, 2].map(i => rec.find(r => r.ms && r.ms[i] != null && r.ms[i] < LEN[i] * 0.95 && r.vis === 'visible')?.t ?? null)
  const appAt = rec.find(r => r.app)?.t ?? null
  const goneAt = rec.find(r => r.gone)?.t ?? null
  const removedAt = rec.find(r => r.removed)?.t ?? null
  return { firstVisible: vis[0]?.t ?? null, start, appAt, goneAt, removedAt }
}

async function slowLoad(engine, tag) {
  { // the pictures, in a run of their own: a screenshot stalls a browser's frames (186 ms in Chromium, 3 Nov 26)
    const { ctx, page } = await open(engine)
    await page.goto(URL + '?fresh=1', { waitUntil: 'commit' })
    await shots(page, `${tag}-phone`, [250, 450, 650, 850, 1100, 1500, 2000])
    await ctx.close()
  }
  const { ctx, page, errs } = await open(engine)
  await page.goto(URL + '?fresh=1', { waitUntil: 'commit' })
  await page.waitForSelector('#luser', { state: 'visible', timeout: 20000 })
  await page.waitForFunction(() => !document.getElementById('bootclaw'), null, { timeout: 5000 }).catch(() => {})
  await page.screenshot({ path: join(OUT, `${tag}-phone-app.png`) })
  const rec = await page.evaluate(() => window.__bc)
  const r = read(rec)
  writeFileSync(join(OUT, `${tag}-record.json`), JSON.stringify({ summary: r, rec }, null, 1))
  const first = rec.find(x => !x.removed)
  check(first && first.vis === 'visible', `${tag}: shown from the first frame, no wait (D1615 — the first frame at ${first?.t} ms ${first?.vis})`)
  /* 0.2 s into its round (D1615, as the page claw): the left claw (0–0.42 s) about two-thirds drawn, the middle (from 0.16 s)
     just begun, the right (from 0.32 s) not yet — so left ahead of middle ahead of right, and the right starts about
     0.12 s after the claw first shows */
  const drawn = first && first.ms ? first.ms.map((v, i) => Math.round((1 - v / LEN[i]) * 100)) : [0, 0, 0]
  check(drawn[0] >= 40 && drawn[0] > drawn[1] && drawn[1] >= drawn[2] && drawn[2] < 5, `${tag}: its first frame 0.2 s into the round — left, middle, right drawn ${drawn.join('% / ')}%`)
  const right = r.start[2] != null && r.firstVisible != null ? r.start[2] - r.firstVisible : null
  check(right != null && right > 40 && right < 260, `${tag}: then the right claw starts about 0.12 s later (${right} ms)`)
  check(r.goneAt != null && r.appAt != null && r.goneAt - r.appAt < 250, `${tag}: fading starts as the app appears (app ${r.appAt} ms, fade ${r.goneAt} ms)`)
  check(r.removedAt != null && r.removedAt - r.goneAt < 400, `${tag}: gone from the page ${r.removedAt - r.goneAt} ms after its fade began`)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  check(await page.locator('.lb-word').innerText() === 'TALON', `${tag}: the sign-in reads TALON, and its boxes take typing at once`)
  check(!errs.length, `${tag}: no page errors${errs.length ? ' — ' + errs.join(' | ') : ''}`)
  await ctx.close()
}

await slowLoad('chromium', 'A-chromium')
await slowLoad('webkit', 'B-webkit')

{ // C — less motion
  const { ctx, page } = await open('chromium', { motion: 'reduce' })
  await page.goto(URL + '?fresh=1', { waitUntil: 'commit' })
  await shots(page, 'C-still', [600, 1400])
  await page.waitForSelector('#luser', { state: 'visible', timeout: 20000 })
  const rec = await page.evaluate(() => window.__bc)
  const shown = rec.filter(x => !x.removed && x.vis === 'visible' && !x.app)
  check(shown.length > 0 && shown.every(x => x.ms.every(v => v === 0) && x.gop === 1), `C: with less motion the claw stands whole and still (${shown.length} frames checked)`)
  check(!rec.some(x => x.gone && !x.removed), 'C: and is removed at once, with no fade')
  await ctx.close()
}

{ // D — a quick load (D1615, his "Always"): the claw on every start, from its first frame, gone with the sign-in
  const { ctx, page } = await open('chromium', { delay: 0 })
  await page.goto(URL + '?fresh=1', { waitUntil: 'commit' })
  await page.waitForSelector('#luser', { state: 'visible', timeout: 20000 })
  await page.waitForTimeout(400)
  const rec = await page.evaluate(() => window.__bc)
  const r = read(rec), first = rec.find(x => !x.removed)
  check(first && first.vis === 'visible' && r.removedAt != null, `D: a quick load — the claw shown from the first frame (${first?.t} ms), the app up at ${r.appAt} ms, the claw gone at ${r.removedAt} ms`)
  await ctx.close()
}

{ // Q — what the first frame DRAWS (the order §7.11, lesson 22): the screen's own frames (Chromium's screencast) from
  //     before the page is asked for; the first frame showing the page (its dark, where the blank tab was white) must
  //     already carry a clear part of the claw, its pixels counted in the claw's box against the whole claw's
  const ctx = await browsers.chromium.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  await page.route('**/assets/*.js', async r => { await new Promise(res => setTimeout(res, 8000)); await r.continue() })
  const cdp = await ctx.newCDPSession(page)
  const frames = []
  cdp.on('Page.screencastFrame', e => { frames.push({ data: e.data, t: e.metadata.timestamp * 1000 }); cdp.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {}) })
  await page.setContent('<body style="margin:0;background:#fff"></body>')
  await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 })
  await page.waitForTimeout(200)
  await page.goto(URL + '?fresh=1', { waitUntil: 'commit' })
  await page.waitForSelector('#bootclaw .mk', { state: 'attached' })
  await page.waitForTimeout(900)
  await cdp.send('Page.stopScreencast')
  const box = await page.evaluate(() => { const m = document.querySelector('#bootclaw .mk').getBoundingClientRect(); return { x: m.left - 6, y: m.top - 6, w: m.width + 12 } })
  await page.evaluate(() => { for (const a of document.getAnimations()) { a.pause(); a.currentTime = 1000 } })
  await page.waitForTimeout(80)
  const whole = (await page.screenshot()).toString('base64')
  await ctx.close()
  const viewer = await browsers.chromium.newPage()
  const res = await viewer.evaluate(async ({ list, box }) => {
    const load = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s })
    const n = Math.round(box.w * 2), c = document.createElement('canvas'); c.width = n; c.height = n
    const g = c.getContext('2d', { willReadFrequently: true })
    const out = []
    for (const s of list) {
      const img = await load(s), k = img.width / 390
      g.clearRect(0, 0, n, n); g.drawImage(img, 4 * k, 4 * k, 1, 1, 0, 0, 1, 1)
      const corner = g.getImageData(0, 0, 1, 1).data
      g.clearRect(0, 0, n, n); g.drawImage(img, box.x * k, box.y * k, box.w * k, box.w * k, 0, 0, n, n)
      const d = g.getImageData(0, 0, n, n).data; let px = 0
      for (let i = 0; i < d.length; i += 4) if (d[i + 2] > 150 && d[i + 1] > 120 && d[i] < 140) px++
      out.push({ dark: corner[0] < 40 && corner[1] < 40 && corner[2] < 40, px })
    }
    return out
  }, { list: [whole, ...frames.map(f => f.data)], box })
  await viewer.close()
  const [all, ...each] = res
  const i = each.findIndex(x => x.dark)
  const share = i < 0 ? null : each.slice(i, i + 4).map(x => Math.round(100 * x.px / Math.max(1, all.px)))
  if (i >= 0) writeFileSync(join(OUT, 'Q-first-frame.png'), Buffer.from(frames[i].data, 'base64'))
  check(share != null && share[0] >= 6, `Q: the first frame showing the page already draws a clear part of the claw (${share ? share.join('% / ') : 'no page frame'}% of the whole claw's pixels, the first four frames; at least 6% wanted)`)
}

{ // E — the plain user's round: through the claw, sign in, the schedule, sign out, and a reload (a reload always
  //     comes back to the sign-in: the app keeps no sign-in across one), the claw again
  const { ctx, page } = await open('chromium')
  await page.goto(URL, { waitUntil: 'commit' })
  await page.waitForSelector('#luser', { state: 'visible', timeout: 20000 })
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(400)
  await page.screenshot({ path: join(OUT, 'E-signedin-app.png') })
  check((await page.locator('.topbar .tx .v').first().innerText()).trim() === 'TALON', 'E: signed in, the top bar reads 142 TALON')
  check(await page.evaluate(() => !document.getElementById('bootclaw')), 'E: and nothing of the claw is left on the page')
  await page.reload({ waitUntil: 'commit' })
  await shots(page, 'E-reload', [900])
  await page.waitForSelector('#luser', { state: 'visible', timeout: 20000 })
  await page.waitForFunction(() => !document.getElementById('bootclaw'), null, { timeout: 5000 }).catch(() => {})
  const r = read(await page.evaluate(() => window.__bc))
  check(r.firstVisible != null && r.removedAt != null, `E: a reload shows the claw again (${r.firstVisible} ms), gone with the sign-in (${r.removedAt} ms)`)
  await ctx.close()
}

{ // H — a phone-like slow load (CPU 4x, a phone's 4G, nothing held back): how far the claw has drawn in the first
  //     frame it shows. Recorded for the evidence sheet; the phone's own first paint decides it.
  const { ctx, page } = await open('chromium', { delay: 0 })
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 40, downloadThroughput: 9e6 / 8, uploadThroughput: 3e6 / 8 })
  await page.goto(URL + '?fresh=1', { waitUntil: 'commit' })
  await page.waitForSelector('#luser', { state: 'visible', timeout: 30000 })
  const rec = await page.evaluate(() => window.__bc)
  const first = rec.find(r => !r.removed && r.vis === 'visible')
  const r = read(rec)
  const drawn = first ? first.ms.map((v, i) => Math.round((1 - v / LEN[i]) * 100)) : null
  writeFileSync(join(OUT, 'H-phonelike-record.json'), JSON.stringify({ summary: r, first, rec }, null, 1))
  console.log(`INFO  H: phone-like load — first frame at ${rec.find(x => !x.removed)?.t} ms, claw first shown at ${r.firstVisible} ms, drawn then ${drawn && drawn.join('% / ')}%, app up at ${r.appAt} ms`)
  /* not a check: a frame is only recorded when the page is free, so this says how far the claw had run meanwhile; that it runs while the page is busy is case K */
  await ctx.close()
}

{ // F — the app cannot start
  const ahead = () => { try { localStorage.setItem('raptor:settings/schema', JSON.stringify({ stage: 99, dataFormatVersion: 99, initialized: true, appliedAt: '', minClient: 99 })) } catch {} }
  const { ctx, page } = await open('chromium', { init: ahead })
  await page.goto(URL, { waitUntil: 'commit' })
  await page.waitForSelector('.bootfail', { state: 'visible', timeout: 20000 })
  await page.waitForFunction(() => !document.getElementById('bootclaw'), null, { timeout: 5000 }).catch(() => {})
  await page.screenshot({ path: join(OUT, 'F-bootfail.png') })
  const h = await page.locator('.bootfail h1').innerText()
  check(h === 'TALON has been updated', `F: the failure message reads "${h}"`)
  check(await page.evaluate(() => !document.getElementById('bootclaw')), 'F: and the claw is gone, nothing over the message')
  await ctx.close()
}

{ // G — a desktop
  const { ctx, page } = await open('chromium', { phone: false })
  await page.goto(URL + '?fresh=1', { waitUntil: 'commit' })
  await shots(page, 'G-desktop', [1100])
  const b = await page.locator('#bootclaw .mk').boundingBox()
  check(b && Math.abs(b.x + b.width / 2 - 768) < 2 && Math.abs(b.y + b.height / 2 - 432) < 2 && Math.round(b.width) === 72, `G: on a desktop the claw sits in the middle, 72px (${b && [Math.round(b.x), Math.round(b.y), Math.round(b.width)].join(', ')})`)
  await ctx.close()
}

{ // K — the page's own work held up for 1.5 s, as a phone's is while the app's code starts: the claw must keep moving.
  //     A screenshot waits for the busy page itself, so the proof is the screen's own frames as the browser draws them
  //     (its screencast, each frame stamped with the time it was drawn), read back in a page of their own: frames keep
  //     arriving during the busy 1.5 s, and the claw in them changes. Chromium only: WebKit's Windows build draws
  //     everything on the page's own thread, as an iPhone does not (it runs sliding and fading apart from the page).
  const ctx = await browsers.chromium.newContext({ viewport: { width: 390, height: 844 } })
  const page = await ctx.newPage()
  await page.route('**/assets/*.js', async r => { await new Promise(res => setTimeout(res, 6000)); await r.continue() })
  const cdp = await ctx.newCDPSession(page)
  const frames = []
  cdp.on('Page.screencastFrame', e => { frames.push({ data: e.data, t: e.metadata.timestamp * 1000 }); cdp.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {}) })
  await page.goto(URL + '?fresh=1', { waitUntil: 'commit' })
  await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 })
  await page.waitForFunction(() => performance.now() > 700)
  await page.evaluate(() => { setTimeout(() => { window.__busy = [Date.now()]; const end = performance.now() + 1500; while (performance.now() < end) { /* busy */ } window.__busy.push(Date.now()) }, 0) })
  await page.waitForTimeout(2600)
  const [b0, b1] = await page.evaluate(() => window.__busy)
  await cdp.send('Page.stopScreencast')
  await ctx.close()
  const inside = frames.filter(f => f.t > b0 + 50 && f.t < b1 - 50)
  const viewer = await browsers.chromium.newPage()
  const res = await viewer.evaluate(async list => {
    const load = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s })
    const c = document.createElement('canvas'); c.width = 72; c.height = 72; const g = c.getContext('2d', { willReadFrequently: true })
    const seen = new Set(); let prev = null, changes = 0
    for (const s of list) {
      const img = await load(s); g.clearRect(0, 0, 72, 72)
      const k = img.width / 390; g.drawImage(img, 159 * k, 386 * k, 72 * k, 72 * k, 0, 0, 72, 72)
      const d = g.getImageData(0, 0, 72, 72).data
      let sig = 0; for (let i = 1; i < d.length; i += 16) sig = (sig * 31 + (d[i] >> 3)) | 0
      seen.add(sig)
      if (prev) { let n = 0; for (let i = 0; i < d.length; i += 4) n += Math.abs(d[i + 1] - prev[i + 1]) > 24 ? 1 : 0; if (n > 4) changes++ }
      prev = d
    }
    return { distinct: seen.size, changes }
  }, inside.map(f => f.data))
  await viewer.close()
  inside.slice(0, 6).forEach((f, i) => writeFileSync(join(OUT, `K-busy-${i}.png`), Buffer.from(f.data, 'base64')))
  check(inside.length >= 10 && res.changes >= 8, `K: with the page busy for ${b1 - b0} ms the claw keeps moving (${inside.length} frames drawn meanwhile, ${res.changes} of them changed, ${res.distinct} different)`)
}

for (const engine of ['chromium']) { // P — pictures of the drawing (Chromium; WebKit's Windows build cannot picture a paused frame — its timing is case B's record): every animation paused at
  //     fixed moments of the round (each animation's own time, its 0.2 s head start included — D1615), the claw pictured.
  //     The app is held back long enough for WebKit's Windows build, which takes seconds over each picture.
  const { ctx, page } = await open(engine, { delay: engine === 'webkit' ? 120000 : 8000 })
  await page.goto(URL + '?fresh=1', { waitUntil: 'commit' })
  await page.waitForSelector('#bootclaw .mk', { state: 'attached' })
  const times = [250, 380, 500, 620, 740, 860, 1000, 1300, 1950]
  const shotsP = []
  for (const t of times) {
    await page.evaluate(t => document.getAnimations().forEach(a => { a.pause(); a.currentTime = t }), t)
    await page.waitForTimeout(80)
    shotsP.push({ t, src: 'data:image/png;base64,' + (await page.locator('#bootclaw').screenshot({ clip: undefined, animations: 'allow' }).then(b => b, () => null) || Buffer.alloc(0)).toString('base64') })
  }
  await ctx.close()
  const sheet = await browsers.chromium.newPage({ viewport: { width: 1400, height: 260 }, deviceScaleFactor: 1 })
  await sheet.setContent(`<body style="margin:0;background:#0B0D10;color:#B6C0CB;font:12px sans-serif;display:flex;gap:8px;padding:10px">${shotsP.map(s => `<div style="text-align:center"><div style="width:140px;height:140px;overflow:hidden;position:relative;border:1px solid #2A313A"><img src="${s.src}" style="position:absolute;left:50%;top:50%;width:390px;transform:translate(-50%,-50%)"></div>${(s.t / 1000).toFixed(2)} s</div>`).join('')}</body>`)
  await sheet.waitForTimeout(200)
  await sheet.screenshot({ path: join(OUT, `P-${engine}-frames.png`), fullPage: true })
  await sheet.close()
}

{ // I — the claw drawn whole (less motion: it stands whole) matches the logo itself, pixel for pixel: no window cuts
  //     any part of a claw off
  const { ctx, page } = await open('chromium', { motion: 'reduce' })
  await page.goto(URL + '?fresh=1', { waitUntil: 'commit' })
  await page.waitForFunction(() => performance.now() > 500)
  const built = await page.locator('#bootclaw .mk').screenshot()
  await ctx.close()
  const ref = await browsers.chromium.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
  await ref.setContent(`<body style="margin:0;background:#0B0D10;display:grid;place-items:center;height:100vh"><div id="r" style="width:72px;height:72px;filter:drop-shadow(0 0 26px rgba(59,198,232,.55))"><svg viewBox="0 -2 60 64" width="72" height="72" style="display:block"><path fill="#3BC6E8" d="M3 8 Q4.9 38.3 24 62 Q11.5 35.8 3 8 Z M16 0 Q17.4 35.0 42 60 Q26.6 31.0 16 0 Z M31 -2 Q36.4 23.5 58 38 Q42.9 19.1 31 -2 Z"/></svg></div></body>`)
  const logo = await ref.locator('#r').screenshot()
  writeFileSync(join(OUT, 'I-built.png'), built); writeFileSync(join(OUT, 'I-logo.png'), logo)
  const diff = await ref.evaluate(async ([a, b]) => {
    const load = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s })
    const [x, y] = await Promise.all([load(a), load(b)])
    const px = img => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); return g.getImageData(0, 0, c.width, c.height).data }
    const p = px(x), q = px(y); let n = 0, max = 0
    for (let i = 0; i < p.length; i += 4) { const d = Math.abs(p[i] - q[i]) + Math.abs(p[i + 1] - q[i + 1]) + Math.abs(p[i + 2] - q[i + 2]); max = Math.max(max, d); if (d > 60) n++ }
    return { n, max, of: p.length / 4, same: x.width === y.width && x.height === y.height }
  }, [built.toString('base64'), logo.toString('base64')])
  /* claw against background differs by about 450; edge smoothing at the windows' slant by up to about 170 along one
     edge of each claw (3 Nov 26: 370 pixels, none above 166 — I-diff.png). A part cut off would show a full 450. */
  check(diff.same && diff.max < 300, `I: the whole claw matches the logo — no part of a claw missing (largest difference ${diff.max} of a possible 450; ${diff.n} edge pixels softened)`)
  await ref.close()
}

for (const b of Object.values(browsers)) await b.close()
await new Promise(r => server.httpServer.close(r))
console.log(fails ? `${fails} FAILED` : 'all passed', '— pictures in', OUT)
process.exit(fails ? 1 : 0)
