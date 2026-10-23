// lw-colours-look v1 — his question "what do you suggest for the colours I chose for each input?" (24 Oct 26): the Leave War's
// Legend at his iPhone's size and the Inputs calendar on a desktop, TODAY (real) and PROPOSED (one stylesheet laid over the
// real page, named on the picture). Serve the build on 4301 first. Usage: node lw-colours-look.mjs
import * as L from './lw-m3-rewalk-lib.mjs'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
console.log('lw-colours-look v1')
const OUT = path.resolve('docs/img/handpass/2026-10-24-lw-colours')
mkdirSync(OUT, { recursive: true })
const label = (P, text) => P.evaluate(text => {
  document.querySelectorAll('.mock-lab').forEach(e => e.remove())
  const d = document.createElement('div'); d.className = 'mock-lab'; d.textContent = text
  Object.assign(d.style, { position: 'fixed', left: '12px', bottom: '12px', maxWidth: '360px', zIndex: 99999, background: '#0b3b46', color: '#bff3ff', border: '1px solid #38c6e4', borderRadius: '7px', padding: '5px 9px', font: '600 11px system-ui, sans-serif', pointerEvents: 'none' })
  document.body.appendChild(d)
}, text)
/* THE PROPOSAL, value for value (matrix.css's one map; the Inputs calendar's bars take the same kinds):
   OIL taken → the other leave's blue, FO / HO keep the green (D1291); the other leave a truer blue, further from the
   course's lilac; an overseas duty a cool slate with a stronger fill, so it no longer reads as a refused (grey) box. */
const PROPOSED = `
.c.k-care, .tchip.lv.k-care { --h: 96, 156, 250 !important; --ink: #DCEBFF !important; }
.mock-oil-taken { --h: 96, 156, 250 !important; --ink: #DCEBFF !important; }
.c.k-od, .tchip.lv.k-od { --h: 120, 160, 190 !important; --ink: #E4F0F8 !important; --fill: .40 !important; }`
const markOil = P => P.evaluate(() => { let n = 0; for (const b of document.querySelectorAll('.c.k-oil, .tchip.lv.k-oil')) if (b.textContent.trim().startsWith('OIL')) { b.classList.add('mock-oil-taken'); n++ } return n })

/* 1 · the Legend on a phone */
const w = await L.newCtx('phone'); const P = w.page
await L.signInPlain(w, 'admin')
await L.press(w, '[data-testid="legend-open"]'); await P.waitForTimeout(500)
const leg = await P.evaluate(() => { const e = document.querySelector('[data-testid="legend"]'); const r = e.getBoundingClientRect(); return { x: 0, y: Math.max(0, Math.floor(r.top) - 4), width: 402, height: Math.min(874 - Math.max(0, Math.floor(r.top) - 4), Math.ceil(r.height) + 8) } })
await P.screenshot({ path: path.join(OUT, 'legend-today.png'), scale: 'device', clip: leg })
await P.addStyleTag({ content: PROPOSED }); const n1 = await markOil(P); await P.waitForTimeout(150)
await label(P, 'Drawn in: OIL taken blue (FO / HO stay green) · other leave a truer blue · overseas duty slate, filled')
await P.screenshot({ path: path.join(OUT, 'legend-proposed.png'), scale: 'device', clip: leg })
console.log('legend', JSON.stringify(leg), 'oil marked', n1)
await w.ctx.close()

/* 2 · the Inputs calendar on a desktop, July: its bars wear only red (absence) and amber (duty) today */
const d = await L.newCtx('desktop'); const Q = d.page
await L.signInPlain(d, 'admin')
await Q.evaluate(() => window.go('inputs')); await Q.waitForTimeout(800)
for (let i = 0; i < 3; i++) { await Q.locator('#page-inputs button', { hasText: '‹' }).first().click(); await Q.waitForTimeout(300) }
const clip = { x: 0, y: 120, width: 1440, height: 560 }
await Q.screenshot({ path: path.join(OUT, 'inputs-cal-today.png'), clip })
/* proposed: each bar takes its kind's colour from the Leave War's map, by its type code (the words after " · ") */
const n2 = await Q.evaluate(() => {
  const H = { LL: '242,200,110', OL: '226,146,38', OIL: '96,156,250', CCL: '96,156,250', FCL: '96,156,250', PL: '96,156,250', CL: '96,156,250', EL: '96,156,250', OD: '120,160,190', CSE: '184,142,240', B: '236,104,140', C: '236,104,140', OML: '236,104,140', HL: '236,104,140', 'ATT B': '236,104,140', 'ATT C': '236,104,140' }
  let n = 0
  for (const b of document.querySelectorAll('.ib-bar')) {
    const t = (b.getAttribute('title') || b.textContent || '').split(' · ')[1]?.trim() || ''
    const k = Object.keys(H).find(c => t === c || t.startsWith(c + ' '))
    if (!k) continue
    b.style.background = `rgba(${H[k]},.42)`; b.style.color = '#fff'; b.style.boxShadow = `inset 0 0 0 1px rgba(${H[k]},.9)`; n++
  }
  return n
})
await label(Q, 'Drawn in: each leave and absence bar wears its Leave War colour (duties keep the amber) — one colour per kind on both pages')
await Q.screenshot({ path: path.join(OUT, 'inputs-cal-proposed.png'), clip })
console.log('inputs bars recoloured', n2, 'errors', JSON.stringify([...d.errs]))
await L.closeBrowser()
