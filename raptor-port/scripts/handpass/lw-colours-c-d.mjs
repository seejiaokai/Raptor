// His D1309 (24 Oct 26 — "the colours for OIL vs other leaves vs OD has not much distinct difference"): two new sets drawn
// on the real Legend at his iPhone's size, cut to its colour rows (D1222), and on the June grid where an OIL taken and an
// FO stand. C — the kinds spread round the colour wheel (medical red, OIL taken magenta, course purple, overseas duty solid
// slate); D — OIL taken a lime beside FO / HO's green, medical rose kept. The build served at 4311. Usage: node lw-colours-c-d.mjs
import * as L from './lw-m3-follow-lib.mjs'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
const OUT = path.resolve('docs/img/handpass/2026-10-24-lw-round1')
mkdirSync(OUT, { recursive: true })
const SETS = {
  c: { label: 'Drawn in (C): medical red · OIL taken magenta · course purple · overseas duty solid slate',
    css: `.mock-oil-taken { --h: 226, 96, 196 !important; --ink: #FFDDF4 !important; --fill: .34 !important; }
.c.k-med, .tchip.lv.k-med { --h: 238, 82, 82 !important; --ink: #FFD6D6 !important; --fill: .30 !important; }
.c.k-cse, .tchip.lv.k-cse { --h: 160, 100, 240 !important; --ink: #EBDDFF !important; --fill: .36 !important; }
.c.k-od, .tchip.lv.k-od { --h: 128, 142, 160 !important; --ink: #F2F5F8 !important; --fill: .58 !important; }` },
  d: { label: 'Drawn in (D): OIL taken lime beside FO / HO green · course violet · overseas duty solid slate',
    css: `.mock-oil-taken { --h: 186, 214, 72 !important; --ink: #F3FFD2 !important; --fill: .30 !important; }
.c.k-cse, .tchip.lv.k-cse { --h: 206, 120, 238 !important; --ink: #F6E2FF !important; }
.c.k-od, .tchip.lv.k-od { --h: 128, 142, 160 !important; --ink: #F2F5F8 !important; --fill: .58 !important; }` },
}
const label = (P, text, y) => P.evaluate(({ text, y }) => {
  document.querySelectorAll('.mock-lab').forEach(e => e.remove())
  const d = document.createElement('div'); d.className = 'mock-lab'; d.textContent = text
  Object.assign(d.style, { position: 'fixed', left: '96px', right: '14px', top: y + 'px', zIndex: 99999, background: '#0b3b46', color: '#bff3ff', border: '1px solid #38c6e4', borderRadius: '7px', padding: '4px 8px', font: '600 11px system-ui, sans-serif', pointerEvents: 'none' })
  document.body.appendChild(d)
}, { text, y })
const markOil = P => P.evaluate(() => { for (const b of document.querySelectorAll('.c.k-oil, .tchip.lv.k-oil')) if (/^OIL/.test(b.textContent.trim())) b.classList.add('mock-oil-taken') })
const splitOilRow = P => P.evaluate(() => {
  const row = [...document.querySelectorAll('[data-testid="legend"] .leg-row')].find(r => /Off in lieu/.test(r.textContent)); if (!row) return
  row.querySelector('.leg-t').textContent = 'OIL taken: time off spent'
  const given = row.cloneNode(true); const b = given.querySelector('.c'); b.classList.remove('mock-oil-taken'); b.textContent = 'FO'
  given.querySelector('.leg-t').textContent = 'OIL given: FO a day, HO half a day'
  row.after(given)
})
for (const [key, set] of Object.entries(SETS)) {
  const w = await L.newCtx('phone'); const P = w.page
  await L.signInPlain(w, 'admin')
  await L.press(w, '[data-testid="legend-open"]'); await P.waitForTimeout(500)
  await P.addStyleTag({ content: set.css }); await markOil(P); await splitOilRow(P); await P.waitForTimeout(150)
  const clip = await P.evaluate(() => {
    const rows = [...document.querySelectorAll('[data-testid="legend"] .leg-row')]
    const first = rows[0].getBoundingClientRect(), med = rows.find(r => /Medical/.test(r.textContent)).getBoundingClientRect()
    return { x: 0, y: Math.max(0, Math.floor(first.top) - 46), width: 402, height: Math.ceil(med.bottom - first.top) + 56 }
  })
  await label(P, set.label, clip.y + 4)
  await P.screenshot({ path: path.join(OUT, `legend-${key}.png`), scale: 'device', clip })
  await w.ctx.close()
}
await L.closeBrowser()
console.log('done')
