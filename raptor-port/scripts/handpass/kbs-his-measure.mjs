// HIS ?kbdebug RECORDINGS, 25 OCT 26 10:10 · 10:18 · 10:30 — a box tapped in a window on his iPhone, the keys up, the screen
// panned: the form pushed down inside its window, an empty band under the title, the box under the keys. His iPhone gives
// every box's place from the top of the VISIBLE screen once it has panned, and the layout's height as what is left below
// that top (684 − 184 = 500); Chromium measures from the layout's top. Here Chromium is made to measure as his phone did —
// every box less the pan, the layout's height less the pan — and the picture is what his screen shows: the slice of the
// page from the pan down, as tall as the visible screen, the keys under it.
// Cases: A the input window from an Inputs calendar day (OL), B from a SANS calendar day (SANS Availability), C the Tracker's
// All events → Edit → Name, D the Leave War's one-day bid window → Remarks. CLASSIC=1: no pan, Chromium's own measure.
// Usage (from raptor-port/, a preview of the build served): node scripts/handpass/kbs-his-measure.mjs [PORT=4180] [ONLY=A,B,C,D]
import { chromium } from 'playwright'
import { existsSync, mkdirSync } from 'node:fs'
const PORT = process.env.PORT || '4180', ONLY = (process.env.ONLY || 'A,B,C,D').split(',')
const OUT = 'docs/img/handpass/2026-10-25-kbs-his-measure'
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const LAY = 684, W = 402
/* his numbers, case by case, off his readout */
const CASES = { A: { pan: 184, vh: 393 }, B: { pan: 164, vh: 390 }, C: { pan: 294, vh: 390 }, D: { pan: 150, vh: 393 } }
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
let bad = 0
for (const k of ONLY) {
  const { pan: PAN0, vh: VH } = CASES[k]
  const PAN = process.env.CLASSIC ? 0 : PAN0
  const ctx = await b.newContext({ viewport: { width: W, height: LAY }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(String(e)))
  await page.addInitScript(() => {
    class FakeVV extends EventTarget { width = innerWidth; height = innerHeight; offsetTop = 0; offsetLeft = 0; pageTop = 0; pageLeft = 0; scale = 1 }
    const f = new FakeVV()
    Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => f })
    window.__vv = f
  })
  await page.goto(`http://localhost:${PORT}/`)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  /* the stand-in screen at the page's own size, as his phone's is before the keys */
  await page.evaluate(() => { const v = window.__vv; v.height = innerHeight; v.width = innerWidth; v.dispatchEvent(new Event('resize')) })
  const tapAt = async sel => { const l = page.locator(sel).first(); await l.scrollIntoViewIfNeeded(); const q = await l.boundingBox(); await page.touchscreen.tap(q.x + q.width / 2, q.y + Math.min(q.height / 2, 8)) }
  let win, box
  if (k === 'A' || k === 'B') {
    await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(600)
    if (k === 'A') { await page.click('#inCalBtn'); await page.waitForTimeout(300); await tapAt('[data-icday] >> nth=10'); await page.locator('[data-testid="win-inputsday"]').waitFor(); await page.locator('#icPopAdd').click() }
    else { await page.click('#inSansMode'); await page.waitForTimeout(300); await tapAt('[data-icday] >> nth=10'); await page.locator('[data-testid="sd-add"]').click() }
    win = '[data-testid="win-inputedit"]'; box = '#inpEditRmk'
  } else if (k === 'C') {
    await page.evaluate(() => window.go('tracker')); await page.waitForTimeout(1500)
    await page.locator('#showAllTab:visible, #showAllBtn:visible').first().click()
    await page.locator('#showAllPanel.on').waitFor()
    /* ST-12's Edit, as in his recording */
    const row = page.locator('#showAllPanel .sarow', { hasText: 'ST-12' }).first()
    await row.scrollIntoViewIfNeeded(); await row.locator('.sedit').click()
    win = '#showAllPanel'; box = '#showAllPanel .saedit input'
  } else {
    await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(1500)
    await tapAt('[data-testid="cell-slipway-2026-10-28"]')
    await page.locator('[data-testid="bid-picker"]').waitFor()
    win = '[data-testid="bid-picker"]'; box = '[data-testid="bid-remarks"]'
  }
  await page.locator(win).first().waitFor(); await page.waitForTimeout(600)
  await page.screenshot({ path: `${OUT}/${k}-1-before.png` })
  await tapAt(box)
  /* the keys, then his phone's own pan a frame or two later, as his readout shows them */
  await page.evaluate(h => { const v = window.__vv; v.height = h; v.dispatchEvent(new Event('resize')) }, VH)
  await page.waitForTimeout(60)
  await page.evaluate(p => {
    const w = window
    if (!w.__his) {
      w.__his = { pan: 0 }
      const real = Element.prototype.getBoundingClientRect
      Element.prototype.getBoundingClientRect = function () { const r = real.call(this); return new DOMRect(r.x, r.y - w.__his.pan, r.width, r.height) }
      const d = Object.getOwnPropertyDescriptor(window, 'innerHeight') || Object.getOwnPropertyDescriptor(Window.prototype, 'innerHeight')
      Object.defineProperty(window, 'innerHeight', { configurable: true, get: () => d.get.call(window) - w.__his.pan })
    }
    w.__his.pan = p
    const v = w.__vv; v.offsetTop = p; v.pageTop = p; v.dispatchEvent(new Event('scroll'))
  }, PAN)
  await page.waitForTimeout(500)
  const g = await page.evaluate(([win, box]) => {
    const w = document.querySelector(win), x = document.querySelector(box)
    const R = e => { const q = e.getBoundingClientRect(); return [Math.round(q.top), Math.round(q.bottom)] }
    const inner = [...w.querySelectorAll('*')].filter(e => e.style.translate || e.dataset.kblift || e.dataset.kbcap != null).map(e => e.id || e.className.toString().slice(0, 24))
    const foot = w.querySelector('.airpop-foot, .saedit-btns, .bp-foot, [data-testid="bid-actions"]')
    return { focused: document.activeElement === x, win: R(w), box: R(x), foot: foot ? R(foot) : null, held: w.dataset.kbcap != null, lift: w.dataset.kblift || 0, inner }
  }, [win, box])
  /* what his screen shows: the page from the pan down, as tall as the visible screen (the keys under it) */
  await page.screenshot({ path: `${OUT}/${k}-2-his-screen${process.env.CLASSIC ? '-classic' : ''}.png`, clip: { x: 0, y: PAN, width: W, height: VH } })
  const ok = g.focused && g.inner.length === 0 && g.box[0] >= 0 && g.box[1] <= VH - 8 + 1 && g.win[0] >= -1 && (!g.foot || g.box[1] <= g.foot[0] + 1 || k === 'D')
  if (!ok) bad++
  console.log(k, ok ? 'OK ' : 'BAD', JSON.stringify(g), 'visible 0–' + VH, errs.length ? 'errors ' + errs.join(' | ') : '')
  await ctx.close()
}
await b.close()
process.exit(bad ? 1 : 0)
