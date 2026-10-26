// SHOW › AND THE ROWS, READ IN THE PAGE (the M3 build's re-walk of W1 8): with the bubble up and the Manning rows scrolled
// into view, what the page's own "in view" reading sees for each Manning row. Usage (from raptor-port/, a preview served):
//   node scripts/handpass/lw-m3b-showprobe.mjs
process.env.LW_PORT ||= '4180'
process.env.LW_OUT ||= '2026-10-25-lw-m3-build/host'
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
console.log('lw-m3b-showprobe v3')
const w = await M.start('phone')
const P = w.page
const ids = await M.ids(P)
const D2 = '2026-12-16'
const f = await M.f1(w, D2)
console.log('fixture', f.req, f.cell.text)
await M.foldRows(w)
await L.openCellR(w, ids.Drifter, D2); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
await M.setSwitch(w, false)
await M.setManningView(w, false)
await L.press(w, T('bid-LL')); await P.waitForTimeout(700)
const read = () => P.evaluate(() => {
  const rows = [...document.querySelectorAll('tbody.counts tr')]
  const out = rows.slice(0, 4).map(r => {
    const b = r.getBoundingClientRect()
    const x = (Math.max(b.left, 0) + Math.min(b.right, innerWidth)) / 2, y = b.top + b.height / 2
    const hit = document.elementFromPoint(x, y)
    return { top: Math.round(b.top), bottom: Math.round(b.bottom), left: Math.round(b.left), w: Math.round(b.width), hit: hit ? (hit.tagName + '.' + String(hit.className).slice(0, 30) + ' ' + (hit.closest('[data-testid]')?.getAttribute('data-testid') || '') + ' tbody=' + (hit.closest('tbody, thead')?.className || hit.closest('tbody, thead')?.tagName || '')) : null, inRow: !!hit && r.contains(hit), vv: window.visualViewport ? [window.visualViewport.offsetTop, window.visualViewport.height] : null }
  })
  const show = document.querySelector('[data-testid="manning-bubble-show"]')
  return { scrollY: window.scrollY, nrows: rows.length, rows: out, show: !!show }
})
console.log('after the bid', JSON.stringify(await read()))
await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(500)
console.log('scrolled to the top', JSON.stringify(await read()))
for (const y of [150, 300, 450]) { await P.evaluate(y => window.scrollTo(0, y), y); await P.waitForTimeout(500); console.log('scrolled to', y, JSON.stringify(await read())) }
for (let i = 0; i < 4; i++) { await M.fingerScroll(w, 300); await P.waitForTimeout(600); const r = await read(); console.log('finger scroll up', i + 1, 'scrollY', r.scrollY, 'show', r.show, 'row tops', r.rows.map(x => x.top + ':' + x.inRow).join(' ')) }
await L.closeBrowser()
