// The loading claw over a slow page, on the BUILT app ([TALON-CLAW-PAGES], D1607, D1610 — tried first on the Leave War).
// The walk's script, written as assertions of the right behaviour (a PASS means correct). Serves dist/ with Vite's
// preview, signs in as the admin at his iPhone's size, opens the Leave War from the ☰ menu with its separate download
// held back by HOLD ms (so the claw has time to show), and records every frame from the tap: the claw's presence, its
// fade, where it stands, and whether the top bar is still there to press. Cases:
//   A  a slow open on a phone: nothing for 0.3 s, then the claw in the page area under the top bar, the bar in view and
//      pressable, the claw drawing; once the page arrives it fades over it and goes; the page drawn  (Chromium, WebKit)
//   B  a quick open (nothing held): the claw never seen
//   C  he leaves for Inputs before the page arrives: the claw goes at once, Inputs is drawn
//   D  a second visit (the page kept from the first): no claw
//   E  less motion asked for: the claw still and whole, removed at once when the page arrives
//   F  a desktop before its pre-warm, and the desktop's hidden pre-warm itself: the claw only while the page is on screen
//   K  the phone slowed 4x while the page draws its grid: the claw keeps moving (Chromium's screen frames)
//   P  pictures: phone and desktop, the claw over the page area, paused with all three claws whole
//   npm run build && node scripts/handpass/talon-page-claw-walk.mjs [out dir]
import { chromium, webkit } from '@playwright/test'
import { preview } from 'vite'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '../..')
const OUT = process.argv[2] || join(ROOT, 'docs/img/handpass/2026-11-03-talon-pages/walk')
mkdirSync(OUT, { recursive: true })
const PORT = 4295, URL = `http://localhost:${PORT}/`, HOLD = 1600
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const PHONE = { viewport: { width: 402, height: 874 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
const DESK = { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 }
let fails = 0
const check = (ok, what) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${what}`); if (!ok) fails++ }

const server = await preview({ root: ROOT, preview: { port: PORT, strictPort: true, open: false }, logLevel: 'silent' })
const browsers = { chromium: await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}), webkit: await webkit.launch() }

async function signIn(engine, size, opts = {}) {
  const webkitPhone = engine === 'webkit' ? { ...size, isMobile: undefined } : size   // WebKit on Windows takes no isMobile
  const ctx = await browsers[engine].newContext({ ...webkitPhone, reducedMotion: opts.still ? 'reduce' : 'no-preference' })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(String(e)))
  let release = () => {}
  if (opts.hold) {
    const held = new Promise(r => { release = r })
    await page.route(u => /LeaveWarPage/.test(u.pathname), async r => { await held; await r.continue() })
  }
  await page.goto(URL + '?fresh=1' + (opts.query ? '&' + opts.query : ''))
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(300)
  return { ctx, page, errs, release: () => release() }
}

// every frame from the tap: the claw (present, its opacity, gone), the top bar's foot, the page drawn
const RECORD = () => {
  const w = window
  w.__cw = []
  const t0 = performance.now()
  const loop = () => {
    const c = document.querySelector('.pgclaw')
    const bar = document.querySelector('.topbar')
    const r = c && c.getBoundingClientRect()
    const w0 = c && c.querySelector('.pw0')
    w.__cw.push({
      t: Math.round(performance.now() - t0),
      claw: !!c, op: c ? Number(getComputedStyle(c).opacity) : 0, gone: !!c && c.classList.contains('gone'),
      top: r ? Math.round(r.top) : null, barFoot: bar ? Math.round(bar.getBoundingClientRect().bottom) : null,
      slide: w0 ? getComputedStyle(w0).transform : null,
      drawn: !!document.querySelector('#page-leavewar table.mx tbody tr'),
    })
    if (w.__cw.length < 2000) requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
}
async function openFromMenu(page, which = 'leavewar') {
  await page.click('#burger'); await page.waitForSelector('#drawer.open'); await page.waitForTimeout(350)
  await page.evaluate(RECORD)
  await page.click(`#drawerNav a[data-page="${which}"]`)
}
const rec = page => page.evaluate(() => window.__cw)

for (const engine of ['chromium', 'webkit']) { // A
  const { ctx, page, errs, release } = await signIn(engine, PHONE, { hold: true })
  await openFromMenu(page)
  await page.waitForTimeout(150)
  const early = await page.evaluate(() => { const c = document.querySelector('.pgclaw'); return c ? Number(getComputedStyle(c).opacity) : -1 })
  check(early === 0, `A-${engine}: 0.15 s after the tap the claw is not yet seen (opacity ${early})`)
  await page.waitForTimeout(650)
  await page.screenshot({ path: join(OUT, `A-${engine}-phone-claw.png`) })
  const mid = await page.evaluate(() => {
    const c = document.querySelector('.pgclaw'), bar = document.querySelector('.topbar').getBoundingClientRect()
    const r = c.getBoundingClientRect(), mk = c.querySelector('.mk').getBoundingClientRect()
    const atBurger = document.elementFromPoint(20, bar.top + bar.height / 2)
    return { op: Number(getComputedStyle(c).opacity), top: r.top, bottom: r.bottom, barFoot: bar.bottom, barTop: bar.top,
      mkx: mk.left + mk.width / 2, mky: mk.top + mk.height / 2, mkw: mk.width, burger: !!atBurger && !!atBurger.closest('#burger') }
  })
  check(mid.op === 1, `A-${engine}: 0.8 s after the tap the claw shows (opacity ${mid.op})`)
  check(Math.abs(mid.top - mid.barFoot) <= 1 && mid.barTop === 0, `A-${engine}: it starts at the top bar's foot (${Math.round(mid.top)} / ${Math.round(mid.barFoot)}), the bar in view`)
  check(Math.abs(mid.mkx - 201) <= 1 && Math.abs(mid.mky - (mid.barFoot + 874) / 2) <= 1 && mid.mkw === 72, `A-${engine}: the 72px claw stands in the middle of the page area (${Math.round(mid.mkx)}, ${Math.round(mid.mky)})`)
  check(mid.burger, `A-${engine}: the top bar's ☰ is on top and pressable while the claw shows`)
  // a whole round, looked at every 0.1 s (two looks 0.12 s apart once fell inside the 0.55 s hold, when nothing moves)
  const looks = new Set()
  for (let i = 0; i < 18; i++) { looks.add(await page.evaluate(() => [0, 1, 2].map(k => getComputedStyle(document.querySelector('.pgclaw .pw' + k)).transform).join('|'))); await page.waitForTimeout(100) }
  check(looks.size >= 5, `A-${engine}: the claw is drawing (${looks.size} different looks of its three claws over one round)`)
  release()
  await page.waitForSelector('#page-leavewar table.mx tbody tr', { timeout: 30000 })
  await page.waitForTimeout(500)
  const fr = await rec(page)
  const drawnAt = fr.find(f => f.drawn)?.t
  const goneAt = fr.find(f => f.gone)?.t
  const lastClaw = [...fr].reverse().find(f => f.claw)?.t
  check(goneAt != null && drawnAt != null && goneAt <= drawnAt + 34, `A-${engine}: it starts to fade the frame the page arrives (fade ${goneAt} ms, page ${drawnAt} ms after the tap)`)
  check(lastClaw != null && lastClaw - goneAt <= 300, `A-${engine}: and is gone within the 0.2 s fade (last seen ${lastClaw} ms)`)
  check(!(await page.$('.pgclaw')), `A-${engine}: nothing of the claw is left on the page`)
  await page.screenshot({ path: join(OUT, `A-${engine}-phone-page.png`) })
  check(errs.length === 0, `A-${engine}: no page error (${errs.join(' | ') || 'none'})`)
  await ctx.close()
}

{ // B — a quick open
  const { ctx, page } = await signIn('chromium', PHONE)
  await openFromMenu(page)
  await page.waitForSelector('#page-leavewar table.mx tbody tr', { timeout: 30000 })
  await page.waitForTimeout(400)
  const fr = await rec(page)
  // the Leave War is never quicker than the 0.3 s wait on a first open (about 0.45 s here at his iPhone's speed), so the
  // claw shows briefly: measured and reported (a design point for him), and never in its first 0.3 s
  const drawnAt = fr.find(f => f.drawn)?.t, seen = fr.filter(f => f.op > 0.05)
  check(seen.every(f => f.t >= 290), `B: at his iPhone's speed (page drawn ${drawnAt} ms after the tap) nothing shows in the first 0.3 s; seen from ${seen[0]?.t ?? '-'} to ${seen.at(-1)?.t ?? '-'} ms, fading from the page's arrival`)
  await ctx.close()
}

{ // N — the test switch ?pageclaw=now: the claw from the tap, no 0.3 s wait
  const { ctx, page, release } = await signIn('chromium', PHONE, { hold: true, query: 'pageclaw=now' })
  await openFromMenu(page)
  await page.waitForTimeout(120)
  const n = await page.evaluate(() => { const c = document.querySelector('.pgclaw'); return c ? { op: Number(getComputedStyle(c).opacity), now: c.classList.contains('now') } : null })
  await page.screenshot({ path: join(OUT, 'N-now-0.12s.png') })
  check(!!n && n.now && n.op === 1, `N: with ?pageclaw=now the claw shows 0.12 s after the tap (opacity ${n && n.op})`)
  release()
  await page.waitForSelector('#page-leavewar table.mx tbody tr', { timeout: 30000 })
  await page.waitForTimeout(400)
  check(!(await page.$('.pgclaw')), 'N: and goes once the page arrives')
  await ctx.close()
}

{ // C — leaving before it arrives
  const { ctx, page, release } = await signIn('chromium', PHONE, { hold: true })
  await openFromMenu(page)
  await page.waitForTimeout(800)
  await page.click('#burger'); await page.waitForSelector('#drawer.open'); await page.waitForTimeout(300)
  await page.click('#drawerNav a[data-page="inputs"]')
  await page.waitForTimeout(60)
  check(!(await page.$('.pgclaw')), 'C: leaving for Inputs before the Leave War arrives takes the claw away at once')
  await page.waitForSelector('#page-inputs.on h1')
  release()
  await page.waitForTimeout(1500)
  check(!(await page.$('.pgclaw')) && await page.evaluate(() => document.getElementById('page-inputs').classList.contains('on')), 'C: and when the Leave War arrives later, hidden, no claw comes back over Inputs')
  await ctx.close()
}

{ // D — a second visit
  const { ctx, page } = await signIn('chromium', PHONE)
  await openFromMenu(page)
  await page.waitForSelector('#page-leavewar table.mx tbody tr', { timeout: 30000 })
  await page.click('#burger'); await page.waitForSelector('#drawer.open'); await page.waitForTimeout(300)
  await page.click('#drawerNav a[data-page="inputs"]'); await page.waitForSelector('#page-inputs.on h1')
  await openFromMenu(page)
  await page.waitForTimeout(900)
  const fr = await rec(page)
  check(fr.every(f => !f.claw), `D: a second visit, the page kept from the first, raises no claw (${fr.filter(f => f.claw).length} frames with one)`)
  await ctx.close()
}

{ // E — less motion
  const { ctx, page, release } = await signIn('chromium', PHONE, { hold: true, still: true })
  await openFromMenu(page)
  await page.waitForTimeout(800)
  const st = await page.evaluate(() => {
    const c = document.querySelector('.pgclaw')
    return { op: Number(getComputedStyle(c).opacity), running: c.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length,
      ws: [0, 1, 2].map(i => getComputedStyle(c.querySelector('.pw' + i)).transform) }
  })
  await page.screenshot({ path: join(OUT, 'E-still.png') })
  check(st.op === 1 && st.running === 0, `E: less motion: the claw shows still (${st.running} animations running)`)
  release()
  await page.waitForSelector('#page-leavewar table.mx tbody tr', { timeout: 30000 })
  const fr = await rec(page)
  const drawnAt = fr.find(f => f.drawn)?.t
  check(!fr.some(f => f.gone) && fr.filter(f => f.t > drawnAt + 20).every(f => !f.claw), `E: and is removed at once, no fade, when the page arrives`)
  await ctx.close()
}

{ // F — a desktop: on screen it shows; the hidden pre-warm raises none
  const { ctx, page, release } = await signIn('chromium', DESK, { hold: true })
  await page.evaluate(RECORD)
  await page.waitForTimeout(3500)   // past the 2 s quiet gap: the pre-warm mounts the Leave War hidden, its download held
  const pre = await page.evaluate(() => ({ claw: !!document.querySelector('.pgclaw'), doze: document.getElementById('page-leavewar').className }))
  check(!pre.claw, `F: the desktop's hidden pre-warm raises no claw (the Leave War "${pre.doze}")`)
  await page.click('#topnav a[data-page="leavewar"]')
  await page.waitForTimeout(800)
  const on = await page.evaluate(() => { const c = document.querySelector('.pgclaw'); const m = c && c.querySelector('.mk').getBoundingClientRect(); return c ? { op: Number(getComputedStyle(c).opacity), x: m.left + 36, y: m.top + 36, top: c.getBoundingClientRect().top, bar: document.querySelector('.topbar').getBoundingClientRect().bottom } : null })
  await page.screenshot({ path: join(OUT, 'F-desktop-claw.png') })
  check(!!on && on.op === 1 && Math.abs(on.top - on.bar) <= 1 && Math.abs(on.x - 768) <= 1, `F: opened while still arriving, it shows on the desktop under the top bar, in the middle (${on && Math.round(on.x)}, ${on && Math.round(on.y)})`)
  release()
  await page.waitForSelector('#page-leavewar table.mx tbody tr', { timeout: 30000 })
  await page.waitForTimeout(400)
  check(!(await page.$('.pgclaw')), 'F: and goes once the page arrives')
  await ctx.close()
}

{ // K — the phone slowed 4x while the page draws its grid: the claw keeps moving (screen frames, Chromium)
  const { ctx, page, release } = await signIn('chromium', PHONE, { hold: true })
  const cdp = await ctx.newCDPSession(page)
  const frames = []
  cdp.on('Page.screencastFrame', e => { frames.push({ data: e.data, t: e.metadata.timestamp * 1000 }); cdp.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {}) })
  await openFromMenu(page)
  await page.waitForSelector('.pgclaw')
  // start the busy stretch as a new round begins (0.3 s wait + one 1.77 s round), so a drawing falls inside it
  await page.waitForTimeout(2030)
  const box = await page.evaluate(() => { const m = document.querySelector('.pgclaw .mk').getBoundingClientRect(); return { x: m.left, y: m.top } })
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 })
  const t0 = Date.now()
  release()
  await page.waitForSelector('#page-leavewar table.mx tbody tr', { timeout: 60000 })
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

for (const [name, size] of [['phone', PHONE], ['desktop', DESK]]) { // P — pictures, every claw whole
  const { ctx, page, release } = await signIn('chromium', { ...size, deviceScaleFactor: 2 }, { hold: true })
  if (size.isMobile) await openFromMenu(page); else { await page.evaluate(RECORD); await page.click('#topnav a[data-page="leavewar"]') }
  await page.waitForTimeout(600)
  await page.evaluate(() => { for (const a of document.querySelector('.pgclaw').getAnimations({ subtree: true })) { a.pause(); a.currentTime = 1500 } })
  await page.waitForTimeout(80)
  await page.screenshot({ path: join(OUT, `P-${name}-claw-whole.png`) })
  release()
  await page.waitForSelector('#page-leavewar table.mx tbody tr', { timeout: 30000 })
  await page.waitForTimeout(900)
  await page.screenshot({ path: join(OUT, `P-${name}-page.png`) })
  await ctx.close()
}

await browsers.chromium.close(); await browsers.webkit.close()
await new Promise(r => server.httpServer.close(r))
console.log(fails ? `${fails} FAILED` : 'all passed')
process.exit(fails ? 1 : 0)
