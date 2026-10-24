// lw-q3-duties — his D1317 (24 Oct 26, "can u relook into the colours used for the normal duty and other commitments
// for e.g fly with etc. seems like the grey background and the white words dont have much contrast"): the Inputs
// calendar's duty and other-commitment bars redrawn three ways, every other bar in set C (his D1316), on the real page
// at a desktop (1440) and his iPhone's size (402). Each picture names its option on itself (D1222).
//   R  round 1's slate as drawn (the look he found faint), for comparison;
//   1  OUTLINED (recommended): a dark bar, a light edge, light words — an absence is a filled bar, a duty an outlined one,
//      so the form says "away" or "still in the manning" before the colour does (lesson 49's second sign);
//   2  DARK SLATE, a slate stripe at the left: a filled bar, darker, its colour on its edge (lesson 51);
//   3  LIGHT SLATE, dark words: the bar light enough to carry dark words.
// Usage: PORT=4174 node scripts/handpass/lw-q3-duties.mjs
import * as L from './lw-declutter-lib.mjs'
import path from 'node:path'
import { writeFileSync } from 'node:fs'
console.log('lw-q3-duties v1')
const OUT = path.resolve('docs/img/handpass/2026-10-24-lw-declutter')
/* set C (D1316) per kind, and the leaves as built (round 1's map) */
const BLUE = '138,150,255'
const KIND = { LL: '242,200,110', OL: '226,146,38', OIL: '226,96,196', CCL: BLUE, FCL: BLUE, PL: BLUE, CL: BLUE, EL: BLUE,
  OD: '128,142,160', CSE: '160,100,240', CRS: '160,100,240', B: '238,82,82', C: '238,82,82', 'ATT B': '238,82,82', 'ATT C': '238,82,82', OML: '238,82,82', HL: '238,82,82', UPCHIT: '238,82,82' }
const DUTY = '150,166,190'
const paint = (P, mode) => P.evaluate(({ KIND, DUTY, mode }) => {
  let n = 0, d = 0
  for (const b of document.querySelectorAll('.ib-bar')) {
    const t = (b.getAttribute('title') || b.textContent || '').split(' · ')[1]?.trim().toUpperCase() || ''
    const k = Object.keys(KIND).find(c => t === c || t.startsWith(c + ' '))
    b.style.borderLeft = ''
    if (k) {
      const od = k === 'OD'
      b.style.background = `rgba(${KIND[k]},${od ? .58 : .40})`; b.style.color = '#fff'; b.style.boxShadow = `inset 0 0 0 1px rgba(${KIND[k]},.9)`; n++
      continue
    }
    if (!b.classList.contains('amb')) continue
    d++
    if (mode === 'R') { b.style.background = `rgba(${DUTY},.40)`; b.style.color = '#fff'; b.style.boxShadow = `inset 0 0 0 1px rgba(${DUTY},.9)` }
    if (mode === '1') { b.style.background = 'rgba(232,237,242,.05)'; b.style.color = '#E8EDF2'; b.style.boxShadow = 'inset 0 0 0 1.5px rgba(200,212,228,.78)' }
    if (mode === '2') { b.style.background = 'rgba(96,112,138,.42)'; b.style.color = '#F2F5F8'; b.style.boxShadow = 'inset 3px 0 0 0 rgba(176,192,216,1)' }
    if (mode === '3') { b.style.background = 'rgb(182,196,216)'; b.style.color = '#10141A'; b.style.boxShadow = 'inset 0 0 0 1px rgb(210,220,234)' }
  }
  return { n, d }
}, { KIND, DUTY, mode })
const label = (P, text, x, y, w) => P.evaluate(({ text, x, y, w }) => {
  document.querySelectorAll('.mock-lab').forEach(e => e.remove())
  const d = document.createElement('div'); d.className = 'mock-lab'; d.textContent = text
  Object.assign(d.style, { position: 'fixed', left: x + 'px', top: y + 'px', width: w + 'px', zIndex: 99999, background: '#0b3b46', color: '#bff3ff', border: '1px solid #38c6e4', borderRadius: '7px', padding: '4px 8px', font: '600 11px system-ui, sans-serif', pointerEvents: 'none' })
  document.body.appendChild(d)
}, { text, x, y, w })
const NAMES = { R: 'Round 1 as drawn: a slate bar, white words', 1: '1 (recommended): duties outlined, a dark bar, light words; absences filled', 2: '2: a darker slate bar, its colour on a left edge', 3: '3: a light slate bar, dark words' }
const geo = {}
for (const size of ['desk', 'phone']) {
  const w = await L.newCtx(size); const P = w.page
  await L.signInPlain(w, 'admin')
  await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(900)
  /* July, as round 1 drew it (three months back from October) */
  for (let i = 0; i < 3; i++) { await P.locator('#page-inputs button', { hasText: '‹' }).first().click(); await P.waitForTimeout(300) }
  await P.waitForTimeout(400)
  const clip = size === 'desk' ? { x: 0, y: 150, width: 1440, height: 560 } : await P.evaluate(() => { const g = document.querySelector('#page-inputs .ib-bar')?.closest('table, .ic-grid, .ib-month, [class*="cal"]'); const r = (g || document.body).getBoundingClientRect(); return { x: 0, y: Math.max(0, r.top - 8), width: innerWidth, height: Math.min(innerHeight - Math.max(0, r.top - 8), 620) } })
  for (const mode of ['R', '1', '2', '3']) {
    const c = await paint(P, mode)
    await label(P, NAMES[mode], size === 'desk' ? 760 : 12, size === 'desk' ? 152 : clip.y + 4, size === 'desk' ? 400 : 300)
    const name = `q3d-${mode}-${size}`
    await P.screenshot({ path: path.join(OUT, name + '.png'), clip, scale: 'device' })
    geo[name] = c
    console.log(name, JSON.stringify(c))
  }
  console.log(size, 'errors', JSON.stringify(w.errs))
  await w.ctx.close()
}
writeFileSync(path.join(OUT, 'q3d-geometry.json'), JSON.stringify(geo, null, 1))
await L.closeBrowser()
