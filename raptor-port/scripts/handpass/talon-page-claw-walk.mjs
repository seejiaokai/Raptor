// The loading claw over a slow page, on the BUILT app ([TALON-CLAW-PAGES], D1607, D1610, D1611). The walk's script,
// written as assertions of the right behaviour (a PASS means correct). Serves dist/ with Vite's preview and signs in;
// a page's separate download is held back where a case needs the claw to stand, and every frame from the press is
// recorded: the claw's presence, its fade, where it stands, whether the top bar is still there to press.
// Cases (phone = his iPhone's 402 x 874; desktop = 1536 x 864):
//   A  the Leave War from the ☰ menu on a phone, slow: the claw from the tap in the page area under the top bar, the bar
//      in view and pressable, drawing; fading the frame the page arrives; nothing left  (Chromium, WebKit)
//   T  the Tracker the same  (Chromium, WebKit)
//   B  at his iPhone's speed, nothing held: the claw never veils the page longer than its fade once it has arrived
//   C  he leaves for Inputs before the page arrives: the claw goes at once, and never comes back over Inputs
//   D  a second visit (the page kept from the first): no claw, the Leave War and the Tracker
//   E  less motion: the claw still and whole, removed at once
//   F  a desktop: the hidden pre-warm raises none; the top bar's tab raises it, in the middle; the Tracker too
//   G  a way in other than the menu: the bell's line for a member's leave opens the Leave War with the claw
//   H  a member (not the admin) gets the same claw
//   K  the phone slowed 4x while the Leave War draws its grid: the claw keeps moving (Chromium's screen frames)
//   U  the plain user's round (D1557): signed in, Leave War, a day's window opened and closed, Tracker, Inputs, back to
//      the Leave War (no claw), signed out, the page reloaded and signed in again (the claw again)
//   P  pictures: the Leave War and the Tracker, phone and desktop, the claw paused with all three claws whole
//   V  his find (3 Nov 26, his iPhone recording): the claw is SEEN from its first frames, not only there — the screen's own
//      frames read for the claw's drawn pixels in the first 0.1 s after it is put up (ONLY_V=1 runs V alone)
//   npm run build && node scripts/handpass/talon-page-claw-walk.mjs [out dir]
import { chromium, webkit } from '@playwright/test'
import { preview } from 'vite'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '../..')
const OUT = process.argv[2] || join(ROOT, 'docs/img/handpass/2026-11-03-talon-pages/walk-build')
mkdirSync(OUT, { recursive: true })
const PORT = 4295, URL = `http://localhost:${PORT}/`
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const PHONE = { viewport: { width: 402, height: 874 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
const DESK = { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 }
const PAGE = {
  leavewar: { chunk: /LeaveWarPage/, drawn: '#page-leavewar table.mx tbody tr', kids: 0 },
  tracker: { chunk: /TrackerPage/, drawn: '#page-tracker #board', kids: 20 },
}
let fails = 0
const check = (ok, what) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${what}`); if (!ok) fails++ }

const server = await preview({ root: ROOT, preview: { port: PORT, strictPort: true, open: false }, logLevel: 'silent' })
const browsers = { chromium: await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}), webkit: await webkit.launch() }

async function signIn(engine, size, opts = {}) {
  const sz = engine === 'webkit' ? { ...size, isMobile: undefined } : size   // WebKit on Windows takes no isMobile
  const ctx = opts.ctx || await browsers[engine].newContext({ ...sz, reducedMotion: opts.still ? 'reduce' : 'no-preference' })
  const page = opts.page || await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(String(e)))
  let release = () => {}
  if (opts.hold) {
    const held = new Promise(r => { release = r })
    await page.route(u => PAGE[opts.hold].chunk.test(u.pathname), async r => { await held; await r.continue() })
  }
  if (!opts.page) await page.goto(URL + (opts.keep ? '' : '?fresh=1'))
  await page.fill('#luser', opts.who || 'ad'); await page.fill('#lpass', opts.who === 'us' ? 'us' : 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(300)
  return { ctx, page, errs, release: () => release() }
}

// every frame from the press: the claw (present, its opacity, gone), the page drawn
const RECORD = ({ drawn, kids }) => {
  const w = window
  w.__cw = []
  let t0 = null
  document.addEventListener('pointerdown', () => { if (t0 == null) t0 = performance.now() }, { capture: true, once: true })
  const loop = () => {
    if (t0 != null) {
      const c = document.querySelector('.pgclaw')
      const el = document.querySelector(drawn)
      w.__cw.push({ t: Math.round(performance.now() - t0), claw: !!c, op: c ? Number(getComputedStyle(c).opacity) : 0,
        gone: !!c && c.classList.contains('gone'), drawn: !!el && el.querySelectorAll('*').length >= kids })
    }
    if (w.__cw.length < 3000) requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
}
const isDrawn = (page, which) => page.waitForFunction(({ drawn, kids }) => { const el = document.querySelector(drawn); return !!el && el.querySelectorAll('*').length >= kids }, PAGE[which], { timeout: 30000 })
async function openFromMenu(page, which) {
  await page.click('#burger'); await page.waitForSelector('#drawer.open'); await page.waitForTimeout(350)
  await page.evaluate(RECORD, PAGE[which] || { drawn: '#page-' + which + '.on', kids: 0 })
  await page.click(`#drawerNav a[data-page="${which}"]`)
}
const rec = page => page.evaluate(() => window.__cw)
const clawState = page => page.evaluate(() => {
  const c = document.querySelector('.pgclaw'); if (!c) return null
  const bar = document.querySelector('.topbar').getBoundingClientRect(), r = c.getBoundingClientRect(), mk = c.querySelector('.mk').getBoundingClientRect()
  const hit = document.elementFromPoint(20, bar.top + bar.height / 2)
  return { op: Number(getComputedStyle(c).opacity), top: r.top, barFoot: bar.bottom, barTop: bar.top, mkx: mk.left + mk.width / 2,
    mky: mk.top + mk.height / 2, mkw: mk.width, vh: innerHeight, vw: innerWidth, bar: !!hit && !!hit.closest('.topbar') }
})
async function drawingOverARound(page) {
  const looks = new Set()
  for (let i = 0; i < 18; i++) { looks.add(await page.evaluate(() => [0, 1, 2].map(k => getComputedStyle(document.querySelector('.pgclaw .pw' + k)).transform).join('|'))); await page.waitForTimeout(100) }
  return looks.size
}

async function slowOpen(engine, which, tag) {
  const { ctx, page, errs, release } = await signIn(engine, PHONE, { hold: which })
  await openFromMenu(page, which)
  await page.waitForTimeout(120)
  const s = await clawState(page)
  check(!!s && s.op === 1, `${tag}: 0.12 s after the tap the claw already shows (opacity ${s && s.op})`)
  if (!s) { release(); await ctx.close(); return }   // no claw at all: the rest of the case has nothing to look at
  await page.waitForTimeout(500)
  await page.screenshot({ path: join(OUT, `${tag}-phone-claw.png`) })
  const m = await clawState(page)
  check(Math.abs(m.top - m.barFoot) <= 1 && m.barTop === 0, `${tag}: it starts at the top bar's foot (${Math.round(m.top)} / ${Math.round(m.barFoot)}), the bar in view`)
  check(Math.abs(m.mkx - m.vw / 2) <= 1 && Math.abs(m.mky - (m.barFoot + m.vh) / 2) <= 1 && m.mkw === 72, `${tag}: the 72px claw stands in the middle of the page area (${Math.round(m.mkx)}, ${Math.round(m.mky)})`)
  check(m.bar, `${tag}: the top bar is on top and pressable while the claw shows`)
  const n = await drawingOverARound(page)
  check(n >= 5, `${tag}: the claw is drawing (${n} different looks of its three claws over one round)`)
  release()
  await isDrawn(page, which)
  await page.waitForTimeout(500)
  const fr = await rec(page)
  const drawnAt = fr.find(f => f.drawn)?.t, goneAt = fr.find(f => f.gone)?.t, lastClaw = [...fr].reverse().find(f => f.claw)?.t
  check(goneAt != null && drawnAt != null && Math.abs(goneAt - drawnAt) <= 34, `${tag}: it starts to fade the frame the page arrives (fade ${goneAt} ms, page ${drawnAt} ms after the tap)`)
  check(lastClaw != null && lastClaw - goneAt <= 300, `${tag}: and is gone within the 0.2 s fade (last seen ${lastClaw} ms)`)
  check(!(await page.$('.pgclaw')), `${tag}: nothing of the claw is left on the page`)
  await page.screenshot({ path: join(OUT, `${tag}-phone-page.png`) })
  check(errs.length === 0, `${tag}: no page error (${errs.join(' | ') || 'none'})`)
  await ctx.close()
}
// V — his find (3 Nov 26): on his iPhone the tap was followed by a dark page with only a speck of claw for 0.1–0.2 s — the
// claw "showed" (there, fully opaque) while drawing almost nothing, which every check above passed. What a person sees is
// the claw's drawn pixels: the screen's own frames (Chromium's screencast), the claw's box read in each, against the whole
// claw's pixels; the first frames after it is put up must already carry a clear part of it (the order §7.11, lesson 22).
async function clawSeenEarly(which) {
  const { ctx, page, release } = await signIn('chromium', { ...PHONE, deviceScaleFactor: 2 }, { hold: which })
  const cdp = await ctx.newCDPSession(page)
  const frames = []
  cdp.on('Page.screencastFrame', e => { frames.push({ data: e.data, t: e.metadata.timestamp * 1000 }); cdp.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {}) })
  await page.click('#burger'); await page.waitForSelector('#drawer.open'); await page.waitForTimeout(350)
  // the moment the claw is put on the page, on the wall clock the screencast stamps its frames with
  await page.evaluate(() => { new MutationObserver((m, o) => { if (document.querySelector('.pgclaw')) { window.__up = performance.timeOrigin + performance.now(); o.disconnect() } }).observe(document.body, { childList: true }) })
  await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 })
  await page.waitForTimeout(150)
  await page.click(`#drawerNav a[data-page="${which}"]`)
  await page.waitForTimeout(1500)
  await cdp.send('Page.stopScreencast')
  const up = await page.evaluate(() => window.__up)
  const box = await page.evaluate(() => { const m = document.querySelector('.pgclaw .mk').getBoundingClientRect(); return { x: m.left - 6, y: m.top - 6, w: m.width + 12 } })
  // the whole claw, paused with all three whole, for the count to measure against
  await page.evaluate(() => { for (const a of document.querySelector('.pgclaw').getAnimations({ subtree: true })) { a.pause(); a.currentTime = 1200 } })
  await page.waitForTimeout(80)
  const whole = (await page.screenshot()).toString('base64')
  release(); await ctx.close()
  const early = frames.filter(f => f.t >= up && f.t <= up + 100)
  const viewer = await browsers.chromium.newPage()
  const counts = await viewer.evaluate(async ({ list, box }) => {
    const load = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s })
    const c = document.createElement('canvas'); const n = Math.round(box.w * 2); c.width = n; c.height = n
    const g = c.getContext('2d', { willReadFrequently: true })
    const out = []
    for (const s of list) {
      const img = await load(s); const k = img.width / 402
      g.clearRect(0, 0, n, n); g.drawImage(img, box.x * k, box.y * k, box.w * k, box.w * k, 0, 0, n, n)
      const d = g.getImageData(0, 0, n, n).data; let px = 0
      for (let i = 0; i < d.length; i += 4) if (d[i + 2] > 150 && d[i + 1] > 120 && d[i] < 140) px++
      out.push(px)
    }
    return out
  }, { list: [whole, ...early.map(f => f.data)], box })
  await viewer.close()
  const [all, ...firsts] = counts
  const share = firsts.map(px => Math.round(100 * px / Math.max(1, all)))
  writeFileSync(join(OUT, `V-${which}-first-frame.png`), Buffer.from(early[0]?.data || whole, 'base64'))
  check(firsts.length > 0 && share[0] >= 6, `V-${which}: the first frame after the claw is put up already shows a clear part of it (${share.join('% / ')}% of the whole claw's pixels, frame by frame over the first 0.1 s; at least 6% wanted)`)
}
for (const which of ['leavewar', 'tracker']) await clawSeenEarly(which)
// W — his D1612: from the menu and the top bar the claw is up in a frame of its own BEFORE the page switches, so the screen's
// big repaint happens under a claw already drawn (his recording of 21:52: one blank frame on the Leave War before it)
async function clawBeforeSwitch(which, size, from) {
  const { ctx, page, release } = await signIn('chromium', size, { hold: which })
  if (from === 'menu') { await page.click('#burger'); await page.waitForSelector('#drawer.open'); await page.waitForTimeout(350) }
  await page.evaluate(p => { window.__w = []; const loop = () => { window.__w.push({ claw: !!document.querySelector('.pgclaw'), on: !!document.querySelector('#page-' + p + '.on') }); if (window.__w.length < 120) requestAnimationFrame(loop) }; requestAnimationFrame(loop) }, which)
  await page.click(from === 'menu' ? `#drawerNav a[data-page="${which}"]` : `#topnav a[data-page="${which}"]`)
  await page.waitForTimeout(800)
  const fr = await page.evaluate(() => window.__w)
  const firstClaw = fr.findIndex(f => f.claw), firstOn = fr.findIndex(f => f.on)
  check(firstClaw >= 0 && firstOn > firstClaw, `W-${which}-${from}: the claw is up ${firstOn - firstClaw} frame(s) before the page switches (claw at frame ${firstClaw}, page at ${firstOn})`)
  check(await page.evaluate(() => document.querySelectorAll('.pgclaw').length) === 1, `W-${which}-${from}: one claw, the page's placeholder took it over`)
  release(); await isDrawn(page, which); await page.waitForTimeout(400)
  check(!(await page.$('.pgclaw')), `W-${which}-${from}: and it goes once the page arrives`)
  await ctx.close()
}
for (const which of ['leavewar', 'tracker']) { await clawBeforeSwitch(which, PHONE, 'menu'); await clawBeforeSwitch(which, DESK, 'top bar') }
if (process.env.ONLY_V) { await browsers.chromium.close(); await browsers.webkit.close(); await new Promise(r => server.httpServer.close(r)); console.log(fails ? `${fails} FAILED` : 'all passed'); process.exit(fails ? 1 : 0) }

for (const engine of process.env.ONLY_AT ? ['chromium'] : ['chromium', 'webkit']) { await slowOpen(engine, 'leavewar', `A-${engine}`); await slowOpen(engine, 'tracker', `T-${engine}`) }
// the break test (the order §9): ONLY_AT=1 runs A and T in Chromium alone, on a build with the claw taken out — both must fail
if (process.env.ONLY_AT) { await browsers.chromium.close(); await browsers.webkit.close(); await new Promise(r => server.httpServer.close(r)); console.log(fails ? `${fails} FAILED` : 'all passed'); process.exit(fails ? 1 : 0) }

for (const which of ['leavewar', 'tracker']) { // B — his iPhone's speed, nothing held
  const { ctx, page } = await signIn('chromium', PHONE)
  await openFromMenu(page, which)
  await isDrawn(page, which)
  await page.waitForTimeout(500)
  const fr = await rec(page)
  const drawnAt = fr.find(f => f.drawn)?.t, last = [...fr].reverse().find(f => f.claw)?.t
  check(last == null || last - drawnAt <= 250, `B-${which}: at his iPhone's speed the page drew ${drawnAt} ms after the tap; the claw was last on screen at ${last ?? 'never'} ms (never longer than its 0.2 s fade over the page)`)
  check(!(await page.$('.pgclaw')), `B-${which}: nothing of the claw is left`)
  await ctx.close()
}

{ // C — leaving before it arrives
  const { ctx, page, release } = await signIn('chromium', PHONE, { hold: 'leavewar' })
  await openFromMenu(page, 'leavewar')
  await page.waitForTimeout(800)
  await page.click('#burger'); await page.waitForSelector('#drawer.open'); await page.waitForTimeout(300)
  await page.click('#drawerNav a[data-page="inputs"]')
  await page.waitForTimeout(60)
  check(!(await page.$('.pgclaw')), 'C: leaving for Inputs before the Leave War arrives takes the claw away at once')
  await page.waitForSelector('#page-inputs.on h1')
  release()
  await page.waitForTimeout(1500)
  check(!(await page.$('.pgclaw')) && await page.evaluate(() => document.getElementById('page-inputs').classList.contains('on')), 'C: and when the Leave War arrives later, hidden, no claw comes back over Inputs')
  await page.screenshot({ path: join(OUT, 'C-inputs-after.png') })
  await ctx.close()
}

{ // D — a second visit
  const { ctx, page } = await signIn('chromium', PHONE)
  for (const which of ['leavewar', 'tracker']) {
    await openFromMenu(page, which)
    await isDrawn(page, which)
    await page.click('#burger'); await page.waitForSelector('#drawer.open'); await page.waitForTimeout(300)
    await page.click('#drawerNav a[data-page="inputs"]'); await page.waitForSelector('#page-inputs.on h1')
    await openFromMenu(page, which)
    await page.waitForTimeout(900)
    const fr = await rec(page)
    check(fr.every(f => !f.claw), `D-${which}: a second visit, the page kept from the first, raises no claw (${fr.filter(f => f.claw).length} frames with one)`)
  }
  await ctx.close()
}

{ // E — less motion
  const { ctx, page, release } = await signIn('chromium', PHONE, { hold: 'leavewar', still: true })
  await openFromMenu(page, 'leavewar')
  await page.waitForTimeout(500)
  const st = await page.evaluate(() => { const c = document.querySelector('.pgclaw'); return { op: Number(getComputedStyle(c).opacity), running: c.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length } })
  await page.screenshot({ path: join(OUT, 'E-still.png') })
  check(st.op === 1 && st.running === 0, `E: less motion: the claw shows still and whole (${st.running} animations running)`)
  release()
  await isDrawn(page, 'leavewar')
  const fr = await rec(page)
  const drawnAt = fr.find(f => f.drawn)?.t
  check(!fr.some(f => f.gone) && fr.filter(f => f.t > drawnAt + 20).every(f => !f.claw), 'E: and is removed at once, no fade, when the page arrives')
  await ctx.close()
}

{ // F — a desktop
  const { ctx, page, release } = await signIn('chromium', DESK, { hold: 'leavewar' })
  await page.waitForTimeout(3500)   // past the 2 s quiet gap: the pre-warm mounts the Leave War hidden, its download held
  const pre = await page.evaluate(() => ({ claw: !!document.querySelector('.pgclaw'), cls: document.getElementById('page-leavewar').className }))
  check(!pre.claw, `F: the desktop's hidden pre-warm raises no claw (the Leave War "${pre.cls}")`)
  await page.evaluate(RECORD, PAGE.leavewar)
  await page.click('#topnav a[data-page="leavewar"]')
  await page.waitForTimeout(500)
  const on = await clawState(page)
  await page.screenshot({ path: join(OUT, 'F-desktop-leavewar-claw.png') })
  check(!!on && on.op === 1 && Math.abs(on.top - on.barFoot) <= 1 && Math.abs(on.mkx - 768) <= 1, `F: the top bar's tab, the Leave War still arriving: the claw under the top bar, in the middle (${on && Math.round(on.mkx)}, ${on && Math.round(on.mky)})`)
  release()
  await isDrawn(page, 'leavewar')
  await page.waitForTimeout(400)
  check(!(await page.$('.pgclaw')), 'F: and goes once the page arrives')
  await ctx.close()
  const t = await signIn('chromium', DESK, { hold: 'tracker' })
  await t.page.evaluate(RECORD, PAGE.tracker)
  await t.page.click('#topnav a[data-page="tracker"]')
  await t.page.waitForTimeout(500)
  const ton = await clawState(t.page)
  await t.page.screenshot({ path: join(OUT, 'F-desktop-tracker-claw.png') })
  check(!!ton && ton.op === 1 && Math.abs(ton.mkx - 768) <= 1, 'F: the Tracker\'s tab on a desktop: the same claw in the middle')
  t.release()
  await isDrawn(t.page, 'tracker')
  await t.page.waitForTimeout(400)
  check(!(await t.page.$('.pgclaw')), 'F: and goes once the Tracker arrives')
  await t.ctx.close()
}

{ // G — the bell: a member's leave decided by the admin, then the member taps the bell's line on a new visit
  const ctx = await browsers.chromium.newContext(PHONE)   // one browser, its saved data kept between the two visits
  const a = await signIn('chromium', PHONE, { ctx, keep: true, who: 'ad' })
  await openFromMenu(a.page, 'leavewar')
  await isDrawn(a.page, 'leavewar')
  await a.page.click('#page-leavewar >> text=Approvals').catch(() => {})
  await a.page.waitForTimeout(700)
  const decided = await a.page.evaluate(() => {
    const btns = [...document.querySelectorAll('#page-leavewar button')].filter(b => /^Approve$/.test((b.textContent || '').trim()))
    for (const b of btns) { let r = b.parentElement; for (let i = 0; i < 6 && r; i++, r = r.parentElement) if (/Ranger/.test(r.textContent || '') && r.textContent.length < 400) { b.click(); return true } }
    return false
  })
  await a.page.waitForTimeout(500)
  await a.page.click('#burger'); await a.page.waitForSelector('#drawer.open'); await a.page.waitForTimeout(300)
  await a.page.click('#drawerLogout'); await a.page.waitForSelector('#luser')
  await a.page.close()
  // a new visit for the member: the war's code fetched afresh (routing turns the cache off), its download held
  const m = await signIn('chromium', PHONE, { ctx, keep: true, who: 'us', hold: 'leavewar' })
  let tapped = false
  if (decided) {
    await m.page.click('.topbar .bellbtn'); await m.page.waitForTimeout(400)
    const line = await m.page.$('.bl-line:has-text("Your leave")') || await m.page.$('.bl-line')
    if (line) { await m.page.evaluate(RECORD, PAGE.leavewar); await line.click(); tapped = true }
  }
  if (tapped) {
    await m.page.waitForTimeout(400)
    const s = await clawState(m.page)
    await m.page.screenshot({ path: join(OUT, 'G-bell-claw.png') })
    check(!!s && s.op === 1 && await m.page.evaluate(() => document.getElementById('page-leavewar').classList.contains('on')), 'G: the bell\'s line for his leave opens the Leave War with the claw')
    m.release()
    await isDrawn(m.page, 'leavewar'); await m.page.waitForTimeout(400)
    check(!(await m.page.$('.pgclaw')), 'G: and it goes once the war arrives')
  } else {
    check(false, `G: the bell's line could not be reached (a bid of Ranger's approved: ${decided}) — the walk must reach it or say why`)
    m.release()
  }
  await ctx.close()
}

{ // H — a member
  const { ctx, page, release } = await signIn('chromium', PHONE, { hold: 'leavewar', who: 'us' })
  await openFromMenu(page, 'leavewar')
  await page.waitForTimeout(400)
  const s = await clawState(page)
  await page.screenshot({ path: join(OUT, 'H-member-claw.png') })
  check(!!s && s.op === 1 && s.bar, 'H: a member (Ranger) gets the same claw, the top bar pressable')
  release()
  await isDrawn(page, 'leavewar'); await page.waitForTimeout(400)
  check(!(await page.$('.pgclaw')), 'H: and it goes once the war arrives')
  await ctx.close()
}

{ // K — the phone slowed 4x while the page draws its grid
  const { ctx, page, release } = await signIn('chromium', PHONE, { hold: 'leavewar' })
  const cdp = await ctx.newCDPSession(page)
  const frames = []
  cdp.on('Page.screencastFrame', e => { frames.push({ data: e.data, t: e.metadata.timestamp * 1000 }); cdp.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {}) })
  await openFromMenu(page, 'leavewar')
  await page.waitForSelector('.pgclaw')
  await page.waitForTimeout(1730)   // start the busy stretch as a new round begins, so a drawing falls inside it
  const box = await page.evaluate(() => { const m = document.querySelector('.pgclaw .mk').getBoundingClientRect(); return { x: m.left, y: m.top } })
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 })
  const t0 = Date.now()
  release()
  await page.waitForSelector(PAGE.leavewar.drawn, { timeout: 60000 })
  const t1 = Date.now()
  await page.waitForTimeout(300)
  await cdp.send('Page.stopScreencast')
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 })
  await ctx.close()
  const inside = frames.filter(f => f.t > t0 && f.t < t1)
  const viewer = await browsers.chromium.newPage()
  const res = await viewer.evaluate(async ({ list, box }) => {
    const load = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s })
    const c = document.createElement('canvas'); c.width = 72; c.height = 72; const g = c.getContext('2d', { willReadFrequently: true })
    let prev = null, changes = 0
    for (const s of list) {
      const img = await load(s); g.clearRect(0, 0, 72, 72)
      const k = img.width / 402; g.drawImage(img, box.x * k, box.y * k, 72 * k, 72 * k, 0, 0, 72, 72)
      const d = g.getImageData(0, 0, 72, 72).data
      if (prev) { let n = 0; for (let i = 0; i < d.length; i += 4) n += Math.abs(d[i + 1] - prev[i + 1]) > 24 ? 1 : 0; if (n > 4) changes++ }
      prev = d
    }
    return { changes }
  }, { list: inside.map(f => f.data), box })
  await viewer.close()
  inside.slice(0, 4).forEach((f, i) => writeFileSync(join(OUT, `K-busy-${i}.png`), Buffer.from(f.data, 'base64')))
  check(inside.length >= 6 && res.changes >= 4, `K: with the phone slowed 4x, from the download's arrival to the page drawn (${t1 - t0} ms), the screen kept drawing and the claw kept moving (${inside.length} frames, ${res.changes} changed)`)
}

{ // U — the plain user's round
  const { ctx, page, errs } = await signIn('chromium', PHONE, { keep: true })
  const shot = n => page.screenshot({ path: join(OUT, `U-${n}.png`) })
  await openFromMenu(page, 'leavewar')
  await page.waitForTimeout(120); await shot('1-leavewar-claw')
  await isDrawn(page, 'leavewar'); await page.waitForTimeout(700); await shot('2-leavewar')
  // a day's window on the war, opened by a tap on a day and closed by its ✕ (and, on a second open, by Escape)
  const cell = await page.$('#page-leavewar table.mx tbody tr td[data-d]') || await page.$('#page-leavewar table.mx tbody tr:nth-child(3) td:nth-child(5)')
  if (cell) {
    await cell.click(); await page.waitForTimeout(500); await shot('3-day-window')
    const opened = await page.evaluate(() => document.querySelectorAll('.lw-sheet, [role=dialog]').length)
    await page.keyboard.press('Escape'); await page.waitForTimeout(400)
    const after = await page.evaluate(() => document.querySelectorAll('.lw-sheet, [role=dialog]').length)
    check(opened > 0 && after < opened, `U: a day's window on the war opens (${opened}) and Escape closes it (${after} left)`)
  } else check(false, 'U: no day cell found to open')
  await openFromMenu(page, 'tracker')
  await page.waitForTimeout(120); await shot('4-tracker-claw')
  await isDrawn(page, 'tracker'); await page.waitForTimeout(700); await shot('5-tracker')
  await openFromMenu(page, 'inputs'); await page.waitForSelector('#page-inputs.on h1'); await page.waitForTimeout(300); await shot('6-inputs')
  await openFromMenu(page, 'leavewar'); await page.waitForTimeout(150)
  check(!(await page.$('.pgclaw')), 'U: back to the Leave War in the same visit: no claw, the page at once')
  await shot('7-leavewar-again')
  await page.click('#burger'); await page.waitForSelector('#drawer.open'); await page.waitForTimeout(300)
  await page.click('#drawerLogout'); await page.waitForSelector('#luser')
  check(!(await page.$('.pgclaw')), 'U: signed out: nothing of the claw over the sign-in')
  await page.reload(); await page.waitForSelector('#luser')
  await signIn('chromium', PHONE, { ctx, page })
  await openFromMenu(page, 'leavewar'); await page.waitForTimeout(120)
  const again = await page.evaluate(() => !!document.querySelector('.pgclaw'))
  await shot('8-after-reload-claw')
  await isDrawn(page, 'leavewar'); await page.waitForTimeout(500)
  check(again && !(await page.$('.pgclaw')), 'U: a new visit (the page reloaded, signed in again): the claw again on the first open, then gone')
  check(errs.length === 0, `U: no page error all round (${errs.join(' | ') || 'none'})`)
  await ctx.close()
}

for (const [name, size] of [['phone', PHONE], ['desktop', DESK]]) for (const which of ['leavewar', 'tracker']) { // P
  const { ctx, page, release } = await signIn('chromium', { ...size, deviceScaleFactor: 2 }, { hold: which })
  if (size.isMobile) await openFromMenu(page, which); else await page.click(`#topnav a[data-page="${which}"]`)
  await page.waitForTimeout(400)
  await page.evaluate(() => { for (const a of document.querySelector('.pgclaw').getAnimations({ subtree: true })) { a.pause(); a.currentTime = 1200 } })
  await page.waitForTimeout(80)
  await page.screenshot({ path: join(OUT, `P-${name}-${which}-claw-whole.png`) })
  release()
  await isDrawn(page, which)
  await page.waitForTimeout(900)
  await page.screenshot({ path: join(OUT, `P-${name}-${which}-page.png`) })
  await ctx.close()
}

await browsers.chromium.close(); await browsers.webkit.close()
await new Promise(r => server.httpServer.close(r))
console.log(fails ? `${fails} FAILED` : 'all passed')
process.exit(fails ? 1 : 0)
