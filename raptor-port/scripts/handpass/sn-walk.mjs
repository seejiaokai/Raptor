/* THE SAVE NOTE WALK ([LW-FIGSEL-FLAKE], 28 Sep 26) — the "Saving…" note floats under the top bar instead of taking room
   in its row. Every page the top bar is drawn on, at 1366 and 1440 desktop and a 390 phone: a real change is made, and
   every frame until the save lands is sampled — the bar's height and every control's place (nothing may move), and the
   note (seen, on screen, on top). A picture is taken while the note is up. Then the "Not saved — Retry" state, held by a
   browser that refuses to store (the storage failing is the real route to it), pictured on the busiest page, and its
   Retry pressed once storage is back.
   Written as assertions of the RIGHT behaviour (bug-check order §5): a PASS means correct; re-running it is the re-walk.
   HP_URL (a local build), HP_SHOTS (the picture folder). */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'

const BASE = process.env.HP_URL || 'http://localhost:4202'
const OUT = process.env.HP_SHOTS || 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-28-lw-figsel-flake'
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const rows = []
let fails = 0
const ok = (cond, what) => { rows.push(`${cond ? 'PASS' : 'FAIL'} · ${what}`); if (!cond) fails++ }

const PAGES = ['editsched', 'viewsched', 'inputs', 'quals', 'logic', 'leavewar', 'tracker', 'help', 'admin']
for (const [label, vp] of [['1366', { width: 1366, height: 800 }], ['1440', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
  const phone = label === 'phone'
  const ctx = await browser.newContext({ viewport: vp, ...(phone ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  await page.goto(BASE + '/')   // the browser's own store, as deployed (?fresh=1 keeps it in memory, where nothing can fail to save)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(400)
  for (const pg of PAGES) {
    await page.evaluate(p => window.go(p), pg)
    await page.waitForFunction(p => window.CURPAGE === p, pg)
    await page.waitForTimeout(pg === 'leavewar' || pg === 'tracker' ? 900 : 300)
    await page.waitForFunction(() => !document.querySelector('.topbar > .savestat'))
    /* the sampler runs every frame from the change until the save lands; the picture is taken the moment the note is up */
    const watch = page.evaluate(() => new Promise(done => {
      const bar = document.querySelector('.topbar')
      const snap = () => `h${Math.round(bar.getBoundingClientRect().height)} ` + [...bar.querySelectorAll('button, .nav a')]
        .filter(b => b.offsetParent).map(b => { const r = b.getBoundingClientRect(); return `${Math.round(r.left)},${Math.round(r.top)}` }).join(' ')
      const first = snap(); let moved = 0, seen = false, onTop = false, box = null, frames = 0, gap = null
      const tick = () => {
        const n = document.querySelector('.topbar > .savestat')
        if (n) {
          seen = true; window.__noteUp = true
          const pe = n.style.pointerEvents; n.style.pointerEvents = 'auto'
          const r = n.getBoundingClientRect(), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
          n.style.pointerEvents = pe
          if (r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth && hit && n.contains(hit)) onTop = true
          box = `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}×${Math.round(r.height)}`
          gap = Math.round(r.top - bar.getBoundingClientRect().bottom)
        }
        if (snap() !== first) moved++
        if (++frames > 240 || (seen && !n)) { window.__noteUp = false; done({ seen, moved, onTop, box, gap }) } else requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
      const w = window
      const cur = w.DAYS[1].waves[0].formations[0].aircraft[0].p
      w.fillSlot('1.0.0.0.p', cur === 'casper' ? 'bane' : 'casper'); w.afterSchedMutate()
    }))
    await page.waitForFunction(() => window.__noteUp === true, null, { timeout: 3000 }).catch(() => {})
    const shot = `${OUT}/${label}-${pg}.png`
    await page.screenshot({ path: shot })
    const r = await watch
    ok(r.seen, `${label} · ${pg}: the note came up (${r.box}, ${r.gap}px under the bar)`)
    ok(r.moved === 0, `${label} · ${pg}: nothing in the top bar moved while it was up (${r.moved} frames moved)`)
    ok(r.onTop, `${label} · ${pg}: the note sat on screen, on top`)
  }
  ok(!errors.length, `${label}: no console errors${errors.length ? ' — ' + errors.slice(0, 3).join(' | ') : ''}`)

  /* NOT SAVED — the browser refuses to store: the note stays, says so and offers Retry; a press on Retry once storage is
     back saves and takes the note down */
  if (label !== '1440') {
    await page.evaluate(p => window.go(p), 'editsched'); await page.waitForTimeout(400)
    await page.evaluate(() => {
      const real = Storage.prototype.setItem
      window.__realSet = real
      Storage.prototype.setItem = function () { throw new DOMException('full', 'QuotaExceededError') }
      const w = window, cur = w.DAYS[1].waves[0].formations[0].aircraft[0].p
      w.fillSlot('1.0.0.0.p', cur === 'casper' ? 'bane' : 'casper'); w.afterSchedMutate()
    })
    const failed = await page.waitForSelector('.topbar > .savestat.failed', { timeout: 5000 }).then(() => true).catch(() => false)
    ok(failed, `${label} · editsched: a refused save shows "Not saved — Retry" under the bar`)
    await page.screenshot({ path: `${OUT}/${label}-editsched-not-saved.png` })
    const btn = await page.evaluate(() => {
      const n = document.querySelector('.topbar > .savestat.failed'), b = n && n.querySelector('button'); if (!b) return null
      const r = b.getBoundingClientRect(), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      /* …and a press on the note's WORDS reaches what lies under them (the week's search box, on the edit week) */
      const w = n.getBoundingClientRect(), under = document.elementFromPoint(w.left + 12, w.top + w.height / 2)
      return { onTop: !!hit && b.contains(hit), through: !!under && !n.contains(under), under: under ? under.tagName + (under.id ? '#' + under.id : '') : '' }
    })
    ok(!!btn && btn.onTop, `${label} · editsched: its Retry takes a press`)
    ok(!!btn && btn.through, `${label} · editsched: a press on its words reaches what is under them (${btn && btn.under})`)
    /* storage back and Retry pressed in one go — left alone, the postman's own backoff would retry within a second and the
       note would go before the press (the walk's first run) */
    const b = await page.locator('.topbar > .savestat.failed button').boundingBox()
    await page.evaluate(() => { Storage.prototype.setItem = window.__realSet })
    if (b) await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
    const gone = await page.waitForFunction(() => !document.querySelector('.topbar > .savestat'), null, { timeout: 5000 }).then(() => true).catch(() => false)
    ok(gone, `${label} · editsched: Retry saved it and the note went`)
  }
  await ctx.close()
}
await browser.close()
console.log(rows.join('\n'))
console.log(fails ? `\n${fails} FAIL` : '\nALL PASS')
process.exit(fails ? 1 : 0)
