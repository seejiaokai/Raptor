// Walker A, scenario 8: phone — a cell low on screen: the grid scrolls it above the window (A5). Also the window's own measures at 402 wide.
// usage: node lw-m3-walk-a8.mjs <chromium|webkit>
import * as L from './lw-m3-walk-a-lib.mjs'
const engine = process.argv[2] || 'chromium'
const tag = `s8-ph${engine === 'webkit' ? '-wk' : ''}`
console.log('lw-m3-walk-a8 v1', engine, tag)
const w = await L.newCtx('phone', engine)
const P = w.page, ID = `8 phone/${engine}`
await L.signInPlain(w, 'admin')
const ISO = '2026-02-24'
const who = 'fantom'   // Diesel, OPS P CAT D — far down the list
await L.reachCell(w, who, ISO)
const rowOf = id => P.evaluate(i => { const e = document.querySelector(`[data-testid="cell-${i}"]`); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), vh: innerHeight, sy: Math.round(scrollY) } }, id)
for (const target of [560, 700, 820]) {
  await L.closeWinIfOpen(w)
  await L.reachCell(w, who, ISO)
  // bring the cell to the wanted height with the page's own scroll
  await P.evaluate(i => { const e = document.querySelector(`[data-testid="cell-${i}"]`); const sc = e.closest('.mx-wrap'); if (sc) { const r = e.getBoundingClientRect(), s = sc.getBoundingClientRect(); sc.scrollLeft += (r.left + r.width / 2) - (s.left + s.width / 2) } }, `${who}-${ISO}`); await P.waitForTimeout(400)
  const r0 = await rowOf(`${who}-${ISO}`)
  await P.evaluate(d => window.scrollBy(0, d), r0.top - target); await P.waitForTimeout(500)
  const r1 = await rowOf(`${who}-${ISO}`)
  console.log(`target ${target}: cell at ${r1.top}-${r1.bottom} scrollY ${r1.sy}`)
  await L.shot(w, `${tag}-t${target}-0-before`)
  // the cell must be in view for the finger; tap its centre exactly where it is
  const x = (r1.left + r1.right) / 2, y = (r1.top + r1.bottom) / 2
  await L.finger(w, x, y, 0, `${tag}-t${target}-1-tap-q`)
  await P.waitForTimeout(700)
  const win = await L.winGeom(P)
  const r2 = await rowOf(`${who}-${ISO}`)
  await L.shot(w, `${tag}-t${target}-2-open`)
  const above = win && r2 && r2.bottom <= win.win.y && r2.top >= 0
  console.log(`  window ${JSON.stringify(win?.win)} cell now ${JSON.stringify(r2)} above window: ${above}`)
  L.rec(`${ID} cell at y=${target}`, 'phone', win && above ? 'PASS' : 'FAIL', `cell was at ${r1.top}-${r1.bottom}; after the tap the window's top is ${win?.win.y} and the cell is at ${r2?.top}-${r2?.bottom} (page scrolled ${r1.sy} -> ${r2?.sy}); cell wholly above the window and on screen: ${above}`, [`${tag}-t${target}-0-before`, `${tag}-t${target}-1-tap-q`, `${tag}-t${target}-2-open`])
}
// the window's own measures (the last one is open): rows, the tick and ✕
const g = await L.winGeom(P)
const tick = g.tick.find(t => t.id === 'bid-approve-tick'), x = g.items['bid-cancel']
const inVp = b => b && b.x >= 0 && b.r <= g.vp[0] && b.y >= 0 && b.b <= g.vp[1]
const overlap = tick && x && !(tick.box.r <= x.x || x.r <= tick.box.x) && !(tick.box.b <= x.y || x.b <= tick.box.y)
console.log('tick', JSON.stringify(tick?.box), '✕', JSON.stringify(x), 'both on screen', inVp(tick?.box) && inVp(x), 'overlap', overlap)
const rows = g.rows.filter(r => /bidsheet-row|bid-doc-row|bid-rmk-row|bidsheet-hd/.test(r.cls + r.tid)).map(r => `${r.t.slice(0, 22)}=${r.h}px`)
console.log('row heights', rows.join(' | '))
console.log('window', JSON.stringify(g.win), 'viewport', g.vp, 'leave button size', JSON.stringify(g.items['bid-LL']))
// is the tick's / ✕'s hit area a thumb's? the label's box beside the tick
const lab = g.items['bid-approve-tick-label']
L.rec(`${ID} window measures`, 'phone', inVp(tick?.box) && inVp(x) && !overlap ? 'PASS' : 'FAIL', `tick box ${JSON.stringify(tick?.box)} (label ${JSON.stringify(lab)}), ✕ ${JSON.stringify(x)} — both on screen: ${inVp(tick?.box) && inVp(x)}, overlapping: ${overlap}; rows: ${rows.join(', ')}; window ${g.win.w}x${g.win.h} at y ${g.win.y} in a ${g.vp[0]}x${g.vp[1]} screen`, [`${tag}-t820-2-open`])
console.log('ERRORS', JSON.stringify(w.errs))
await L.closeBrowser()
