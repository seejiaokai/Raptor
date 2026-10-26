// Speed line (§E): the grid's node count before and after the panel; a cell tap to the bid window up and a heading tap to the
// panel up (three runs each, the median); one bid placed - how many cells' markup the page touched.
// usage: node lw-m3-walk-c11.mjs <desk|phone>   (Chromium; phone = CDP touch)
import * as L from './lw-m3-walk-c-lib.mjs'
const size = process.argv[2] || 'desk'
const P = `speed-${size}-`
console.log('lw-m3-walk-c11 v1', size)
L.clearPrefix(P)
const w = await L.newCtx(size, 'chromium')
await L.signIn(w, 'admin')
const { page } = w
await L.gotoMonth(w, 'JUL'); await page.waitForTimeout(1500)
await page.evaluate(() => {
  window.__t = {}
  // t0: the lift (touchend / pointerup / click, whichever comes first after a press); t1: the target is in the page; t2: two frames later (painted)
  window.__arm = (name, sel) => {
    const rec = { t0: null, t1: null, t2: null }; window.__t[name] = rec
    const start = () => { if (rec.t0 === null) rec.t0 = performance.now() }
    for (const ev of ['pointerup', 'click']) document.addEventListener(ev, start, { capture: true, once: true })
    const mo = new MutationObserver(() => {
      if (rec.t1 !== null) return
      const e = document.querySelector(sel)
      if (e && e.getBoundingClientRect().height > 0) { rec.t1 = performance.now(); mo.disconnect(); requestAnimationFrame(() => requestAnimationFrame(() => { rec.t2 = performance.now() })) }
    })
    mo.observe(document.body, { childList: true, subtree: true, attributes: true })
  }
})
const med = a => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)]
const n0 = await L.nodes(page)
const out = { nodesBefore: n0 }
const runs = { panel: [], panelPaint: [], window: [], windowPaint: [] }
for (let i = 0; i < 3; i++) {
  await page.evaluate(() => window.__arm('panel', '[data-testid="lwday-body"]'))
  await L.press(w, L.T('head-2026-07-15')); await page.waitForTimeout(900)
  const r = await page.evaluate(() => window.__t.panel)
  runs.panel.push(+(r.t1 - r.t0).toFixed(1)); runs.panelPaint.push(+(r.t2 - r.t0).toFixed(1))
  if (i === 0) { out.nodesWithPanel = await L.nodes(page); await L.shot(w, P + '01-panel-open') }
  await L.press(w, L.T('win-lwday-x')); await page.waitForTimeout(500)
}
out.nodesAfterPanelClosed = await L.nodes(page)
for (let i = 0; i < 3; i++) {
  await page.evaluate(() => window.__arm('win', '[data-testid="bid-picker"]'))
  await L.press(w, L.T(L.cellId('stiff', '2026-07-20'))); await page.waitForTimeout(900)
  const r = await page.evaluate(() => window.__t.win)
  runs.window.push(+(r.t1 - r.t0).toFixed(1)); runs.windowPaint.push(+(r.t2 - r.t0).toFixed(1))
  if (i === 0) { out.nodesWithWindow = await L.nodes(page); await L.shot(w, P + '02-window-open') }
  await L.press(w, L.T('bid-cancel')); await page.waitForTimeout(500)
}
// one bid placed through the controls: which cells did the page touch?
await L.press(w, L.T(L.cellId('stiff', '2026-07-20'))); await page.waitForTimeout(700)
await page.evaluate(() => {
  window.__touched = new Set(); window.__recs = 0
  const root = document.querySelector('#page-leavewar')
  window.__mo = new MutationObserver(ms => { for (const m of ms) { window.__recs++; let n = m.target; while (n && n !== root && !(n.nodeName === 'TD')) n = n.parentNode; if (n && n.nodeName === 'TD') window.__touched.add(n.dataset.testid || n.className) } })
  window.__mo.observe(root, { childList: true, subtree: true, attributes: true, characterData: true })
})
await page.evaluate(() => window.__arm('bid', '[data-testid="bid-picker"]'))
await L.press(w, L.T('bid-LL')); await page.waitForTimeout(900)
out.tappedAgainBelowZero = false
if (await L.vis(page, L.T('bid-picker'))) { out.noteAfterFirstTap = await L.txt(page, L.T('bid-picker') + ' .note.warn'); await L.press(w, L.T('bid-LL')); out.tappedAgainBelowZero = true; await page.waitForTimeout(1500) }
out.oneBid = await page.evaluate(() => { window.__mo.disconnect(); const t = [...window.__touched]; return { mutationRecords: window.__recs, cellsTouched: t.length, sample: t.slice(0, 6), cellsOfThatRow: t.filter(x => /^cell-stiff-/.test(x)).length, cellsOtherRows: t.filter(x => !/^cell-stiff-/.test(x)).length } })
out.cellAfterBid = await L.cellInfo(page, 'stiff', '2026-07-20')
out.nodesAfterBid = await L.nodes(page)
await L.shot(w, P + '03-after-bid')
out.runs = runs
out.medians = { heading_to_panel_in_page_ms: med(runs.panel), heading_to_panel_painted_ms: med(runs.panelPaint), cell_to_window_in_page_ms: med(runs.window), cell_to_window_painted_ms: med(runs.windowPaint) }
console.log(JSON.stringify(out, null, 1))
console.log('errors', JSON.stringify(w.errs))
await L.closeBrowser()
