// lw-oil-nopink — his D1322 (24 Oct 26, "is OIL pink? can we change it? like wise for the normal leave war grids input.
// Can we dont use pink"): an OIL taken in a colour that is not pink, on the Leave War grid (his iPhone's size, June — an
// OIL taken beside FO / HO, D1291's own picture) and on the Inputs calendar (a desktop, July — with Q3's outlined duties,
// D1321), every other kind in set C (D1316). Options, chosen by measured distance from every other kind's colour as the
// eye sees it on the dark grid (CIE Lab over the grid's background at the box's fill; set C's magenta stood 15 from its
// nearest kind, the leave and other leave 12.5 and 14.5 from each other):
//   A  chartreuse (170,230,40) — 24 from its nearest (FO / HO's green), the farthest of the hues tried;
//   B  ivory (240,242,245) — 17 from its nearest (the overseas duty's slate).
// Teal and sky blue were measured and left out: about 10 from the cyan edge a box filed on the Inputs page wears.
// Usage: PORT=4174 node scripts/handpass/lw-oil-nopink.mjs
import * as L from './lw-declutter-lib.mjs'
import path from 'node:path'
console.log('lw-oil-nopink v1')
const OUT = path.resolve('docs/img/handpass/2026-10-24-lw-declutter')
const OPT = { a: { rgb: '170, 230, 40', ink: '#F1FFD0', fill: .30, name: 'A: OIL taken chartreuse' }, b: { rgb: '240, 242, 245', ink: '#FFFFFF', fill: .26, name: 'B: OIL taken ivory' } }
const label = (P, text, x, y, w) => P.evaluate(({ text, x, y, w }) => {
  document.querySelectorAll('.mock-lab').forEach(e => e.remove())
  const d = document.createElement('div'); d.className = 'mock-lab'; d.textContent = text
  Object.assign(d.style, { position: 'fixed', left: x + 'px', top: y + 'px', width: w + 'px', zIndex: 99999, background: '#0b3b46', color: '#bff3ff', border: '1px solid #38c6e4', borderRadius: '7px', padding: '4px 8px', font: '600 11px system-ui, sans-serif', pointerEvents: 'none' })
  document.body.appendChild(d)
}, { text, x, y, w })
/* set C on the grid's one map (matrix.css), the OIL taken boxes marked by their code */
const gridPaint = (P, o) => P.evaluate(o => {
  let st = document.getElementById('mock-np'); if (!st) { st = document.createElement('style'); st.id = 'mock-np'; document.head.appendChild(st) }
  st.textContent = `.c.k-med { --h: 238, 82, 82 !important; --ink: #FFD6D6 !important; --fill: .30 !important; }
.c.k-cse { --h: 160, 100, 240 !important; --ink: #EBDDFF !important; --fill: .36 !important; }
.c.k-od { --h: 128, 142, 160 !important; --ink: #F2F5F8 !important; --fill: .58 !important; }
.c.mock-taken { --h: ${o.rgb} !important; --ink: ${o.ink} !important; --fill: ${o.fill} !important; }`
  let n = 0; for (const b of document.querySelectorAll('.mx td .c.k-oil')) if (/^<?OIL>?$/.test(b.textContent.trim())) { b.classList.add('mock-taken'); n++ }
  return n
}, o)

/* 1. the Leave War grid, June, on a phone */
const w = await L.newCtx('phone'); const P = w.page
await L.signInPlain(w, 'admin')
await L.gotoMonth(w, 'JUN'); await P.waitForTimeout(600)
const at = await P.evaluate(() => { const b = [...document.querySelectorAll('.mx td .c')].find(e => e.textContent.trim() === 'OIL'); if (!b) return null; b.scrollIntoView({ block: 'center', inline: 'center' }); return true })
if (!at) throw new Error('no OIL box in June')
await P.waitForTimeout(500)
const clip = await P.evaluate(() => { const b = [...document.querySelectorAll('.mx td .c')].find(e => e.textContent.trim() === 'OIL').getBoundingClientRect(); return { x: 0, y: Math.max(0, b.top - 150), width: innerWidth, height: 300 } })
for (const k of ['a', 'b']) {
  const n = await gridPaint(P, OPT[k])
  await label(P, `Drawn in, ${OPT[k].name}; FO / HO keep the green; set C for the rest`, 12, clip.y + 4, 330)
  await P.screenshot({ path: path.join(OUT, `np-grid-${k}.png`), clip, scale: 'device' })
  console.log('grid', k, 'OIL taken boxes', n)
}
await w.ctx.close()

/* 2. the Inputs calendar, July, on a desktop — the duties outlined (D1321) */
const BLUE = '138,150,255'
const d = await L.newCtx('desk'); const Q = d.page
await L.signInPlain(d, 'admin')
await Q.evaluate(() => window.go('inputs')); await Q.waitForTimeout(900)
for (let i = 0; i < 3; i++) { await Q.locator('#page-inputs button', { hasText: '‹' }).first().click(); await Q.waitForTimeout(300) }
await Q.waitForTimeout(400)
for (const k of ['a', 'b']) {
  const KIND = { LL: '242,200,110', OL: '226,146,38', OIL: OPT[k].rgb.replace(/ /g, ''), CCL: BLUE, FCL: BLUE, PL: BLUE, CL: BLUE, EL: BLUE, OD: '128,142,160', CSE: '160,100,240', CRS: '160,100,240', B: '238,82,82', C: '238,82,82', 'ATT B': '238,82,82', 'ATT C': '238,82,82', OML: '238,82,82', HL: '238,82,82', UPCHIT: '238,82,82' }
  await Q.evaluate(({ KIND }) => {
    for (const b of document.querySelectorAll('.ib-bar')) {
      const t = (b.getAttribute('title') || b.textContent || '').split(' · ')[1]?.trim().toUpperCase() || ''
      const kk = Object.keys(KIND).find(c => t === c || t.startsWith(c + ' '))
      if (kk) { b.style.background = `rgba(${KIND[kk]},${kk === 'OD' ? .58 : .40})`; b.style.color = '#fff'; b.style.boxShadow = `inset 0 0 0 1px rgba(${KIND[kk]},.9)`; continue }
      if (b.classList.contains('amb')) { b.style.background = 'rgba(232,237,242,.05)'; b.style.color = '#E8EDF2'; b.style.boxShadow = 'inset 0 0 0 1.5px rgba(200,212,228,.78)' }
    }
  }, { KIND })
  await label(Q, `Drawn in, ${OPT[k].name}; duties outlined (your pick); set C for the rest`, 760, 152, 400)
  await Q.screenshot({ path: path.join(OUT, `np-inputs-${k}.png`), clip: { x: 0, y: 150, width: 1440, height: 560 }, scale: 'device' })
}
console.log('errors', JSON.stringify([...w.errs, ...d.errs]))
await L.closeBrowser()
