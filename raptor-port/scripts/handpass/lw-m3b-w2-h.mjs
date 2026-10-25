// W2 part H — scenario 40: the input window on a phone with the keys up (his iPhone's measure and Chromium's own), as kbs-his-measure.mjs plays it:
// an Attach's "To" box, and an Other's "Goes to" row (the keys raised by tapping Remarks, then the row read, then a Goes to button pressed).
// Each box must end clear of the keys AND of the window's own Cancel / Add (§7.11 lesson 5). The screen is 402 x 684 with the keys 291 high
// (visible 393), his pan 184 — case A of his recordings. The pictures are what his screen shows: the slice of the page from the pan down.
// Usage (from raptor-port/): node scripts/handpass/lw-m3b-w2-h.mjs
import * as H from './lw-m3b-w2-lib.mjs'
import path from 'node:path'
const { L, T, note } = H
H.clearPrefix('h-')
console.log('lw-m3b-w2-h', H.OUT)
const LAY = 684, W = 402, VH = 393, PAN = 184
const b = await L.getBrowser('chromium')
const results = []
async function run(kind, mode, boxSel = null, label = null) {
  const pan = mode === 'his' ? PAN : 0
  const ctx = await b.newContext({ viewport: { width: W, height: LAY }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
  await page.addInitScript(() => {
    class FakeVV extends EventTarget { width = innerWidth; height = innerHeight; offsetTop = 0; offsetLeft = 0; pageTop = 0; pageLeft = 0; scale = 1 }
    const f = new FakeVV()
    Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => f })
    window.__vv = f
  })
  await page.goto('http://localhost:4180/')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => { const v = window.__vv; v.height = innerHeight; v.width = innerWidth; v.dispatchEvent(new Event('resize')) })
  await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(700)
  if (!(await page.locator('[data-testid="in-new"]').isVisible().catch(() => false))) { if (await page.locator('#inMemberMode').isVisible().catch(() => false)) await page.click('#inMemberMode'); await page.waitForTimeout(400); if (!(await page.locator('[data-testid="in-new"]').isVisible().catch(() => false))) await page.click('#inListBtn'); await page.waitForTimeout(500) }
  await page.click('[data-testid="in-new"]')
  await page.locator('[data-testid="win-inputedit"]').waitFor(); await page.waitForTimeout(500)
  await page.locator('#inpEditType').selectOption(kind); await page.waitForTimeout(400)
  const BOX = boxSel || (kind === 'Attach' ? '#inpEditTo' : '#inpEditRmk')
  const tapAt = async sel => { const l = page.locator(sel).first(); await l.scrollIntoViewIfNeeded(); const q = await l.boundingBox(); await page.touchscreen.tap(q.x + q.width / 2, q.y + Math.min(q.height / 2, 8)) }
  const geo = async () => page.evaluate(([BOX, kind]) => {
    const w = document.querySelector('[data-testid="win-inputedit"]'), x = document.querySelector(BOX)
    const R = e => { if (!e) return null; const q = e.getBoundingClientRect(); return [Math.round(q.top), Math.round(q.bottom)] }
    const foot = w.querySelector('.airpop-foot')
    const head = w.querySelector('.airpop-head, .win-head, header')
    const goes = document.querySelector('[data-testid="inpEdit-goes-g"]')?.closest('.inped-f')
    const inner = [...w.querySelectorAll('*')].filter(e => e.style.translate || e.dataset.kblift || e.dataset.kbcap != null).map(e => e.id || e.className.toString().slice(0, 24))
    return { focused: document.activeElement === x, win: R(w), box: R(x), foot: foot ? R(foot) : null, head: head ? R(head) : null, goesRow: R(goes), held: w.dataset.kbcap != null, lift: w.dataset.kblift || 0, inner, bodyScroll: (() => { const bd = w.querySelector('.win-body, .airpop-body'); return bd ? [Math.round(bd.scrollTop), bd.scrollHeight, bd.clientHeight] : null })() }
  }, [BOX, kind])
  const before = await geo()
  await tapAt(BOX)
  await page.evaluate(h => { const v = window.__vv; v.height = h; v.dispatchEvent(new Event('resize')) }, VH)
  await page.waitForTimeout(60)
  if (pan) await page.evaluate(p => {
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
  }, pan)
  await page.waitForTimeout(600)
  const g = await geo()
  const name = `h-${(label || kind).toLowerCase()}-${mode}`
  await page.screenshot({ path: path.join(H.OUT, name + '-keys-up.png'), clip: { x: 0, y: pan, width: W, height: VH } })
  const clearBox = g.box && g.box[0] >= 0 && g.box[1] <= VH - 8 + 1
  const clearFoot = !g.foot || g.box[1] <= g.foot[0] + 1
  const winOk = g.win && g.win[0] >= -1
  const row = { kind: label || kind, realKind: kind, mode, pan, focused: g.focused, box: g.box, win: g.win, foot: g.foot, goesRow: g.goesRow, inner: g.inner, held: g.held, lift: g.lift, bodyScroll: g.bodyScroll, clearOfKeys: !!clearBox, clearOfFoot: !!clearFoot, windowAtTop: !!winOk }
  /* an Other: the Goes to row on the same screen, then a Goes to button pressed */
  if (kind === 'Other') {
    const gr = g.goesRow
    row.goesClearOfKeys = !!(gr && gr[0] >= 0 && gr[1] <= VH - 8 + 1)
    row.goesClearOfFoot = !!(gr && g.foot && gr[1] <= g.foot[0] + 1)
    row.headBottom = g.head ? g.head[1] : null
    row.goesUnderHeader = !!(gr && g.head && gr[0] < g.head[1] - 1)
    row.titleUnderHeader = !!(g.box && g.head && g.box[0] < g.head[1] - 1)
    await page.evaluate(() => document.querySelector('[data-testid="inpEdit-goes-u"]')?.click()); await page.waitForTimeout(500)
    const g2 = await geo()
    row.afterPress = { goesRow: g2.goesRow, win: g2.win, foot: g2.foot, box: g2.box, focused: g2.focused, line: await page.locator('[data-testid="inpEdit-goes-line"]').innerText().catch(() => null), pressed: await page.locator('[data-testid="inpEdit-goes-u"]').getAttribute('aria-pressed').catch(() => null) }
    row.windowMovedByPress = !!(g.win && g2.win && (g.win[0] !== g2.win[0] || g.win[1] !== g2.win[1]))
    await page.screenshot({ path: path.join(H.OUT, name + '-goes-pressed.png'), clip: { x: 0, y: pan, width: W, height: VH } })
  }
  row.errors = errs
  note('40-' + kind + '-' + mode, 'phone', JSON.stringify(row))
  results.push(row)
  await ctx.close()
}
for (const kind of ['Attach', 'Other']) for (const mode of ['his', 'classic']) await run(kind, mode)
for (const mode of ['his', 'classic']) await run('Other', mode, '#inpEditOwnTitle', 'OtherTitle')
const bad = results.filter(r => !(r.focused && r.clearOfKeys && r.clearOfFoot && r.windowAtTop && r.inner.length === 0 && (r.realKind !== 'Other' || (r.goesClearOfKeys && r.goesClearOfFoot))))
L.rec('40', 'phone', bad.length ? 'FAIL?' : 'PASS?', results.map(r => `${r.kind}/${r.mode}: box ${JSON.stringify(r.box)} (keys from ${VH}), foot ${JSON.stringify(r.foot)}, window top ${r.win?.[0]}, clear of keys ${r.clearOfKeys}, clear of Cancel/Add ${r.clearOfFoot}${r.realKind === 'Other' ? `, Goes to row ${JSON.stringify(r.goesRow)} clear of keys ${r.goesClearOfKeys} / of Cancel/Add ${r.goesClearOfFoot} / under the window header (bottom ${r.headBottom}) ${r.goesUnderHeader}, window moved by the press ${r.windowMovedByPress}` : ''}`).join(' · '), results.flatMap(r => [`h-${r.kind.toLowerCase()}-${r.mode}-keys-up`].concat(r.realKind === 'Other' ? [`h-${r.kind.toLowerCase()}-${r.mode}-goes-pressed`] : [])))
H.saveLog('h-run.json')
await H.closeBrowser()
console.log('RESULTS'); for (const r of L.results) console.log(r.verdict, r.id, '|', r.said)
