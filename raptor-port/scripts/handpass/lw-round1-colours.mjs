// Round 1 of the Leave War's questions in his order (D1301): THE COLOURS (D1291, D1304, [INPUT-COLOURS]; the HO star; his
// colleague's colours as ideas only). Each picture is the real app on the branch's build (4311), TODAY beside the
// RECOMMENDATION (one stylesheet laid over the real page, named on the picture), cut to what the question is about (D1222).
// Usage: node lw-round1-colours.mjs
import * as L from './lw-m3-follow-lib.mjs'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
const OUT = path.resolve('docs/img/handpass/2026-10-24-lw-round1')
mkdirSync(OUT, { recursive: true })
const shot = (P, name, clip) => P.screenshot({ path: path.join(OUT, name + '.png'), scale: 'device', ...(clip ? { clip } : {}) })
const label = (P, text, x = 12, y = 12, w = 330) => P.evaluate(({ text, x, y, w }) => {
  document.querySelectorAll('.mock-lab').forEach(e => e.remove())
  const d = document.createElement('div'); d.className = 'mock-lab'; d.textContent = text
  Object.assign(d.style, { position: 'fixed', left: x + 'px', top: y + 'px', width: w + 'px', zIndex: 99999, background: '#0b3b46', color: '#bff3ff', border: '1px solid #38c6e4', borderRadius: '7px', padding: '4px 8px', font: '600 11px system-ui, sans-serif', pointerEvents: 'none' })
  document.body.appendChild(d)
}, { text, x, y, w })
const unlabel = P => P.evaluate(() => document.querySelectorAll('.mock-lab').forEach(e => e.remove()))

/* THE RECOMMENDATION, value for value, on matrix.css's one map (the bid windows' buttons take the same map, D1183):
   Q1 — an OIL taken wears the other leave's periwinkle; FO / HO keep the green (D1291).
   Q2 — the other leave keeps its periwinkle (the cyan "filed on the Inputs page" edge stays clear of it); the course moves
        from lilac to a warmer violet, so the two blues-and-purples part; an overseas duty becomes a warm stone, filled —
        no longer the cool grey a refused box wears. */
const HUE = { oilTaken: '138, 150, 255', cse: '206, 120, 238', od: '200, 178, 146' }
const PROPOSED = `
.mock-oil-taken { --h: ${HUE.oilTaken} !important; --ink: #DCE0FF !important; --fill: .32 !important; }
.c.k-cse, .tchip.lv.k-cse { --h: ${HUE.cse} !important; --ink: #F6E2FF !important; }
.c.k-od, .tchip.lv.k-od { --h: ${HUE.od} !important; --ink: #F6EEE2 !important; --fill: .40 !important; }`
const markOil = P => P.evaluate(() => { let n = 0; for (const b of document.querySelectorAll('.c.k-oil, .tchip.lv.k-oil')) if (/^OIL/.test(b.textContent.trim())) { b.classList.add('mock-oil-taken'); n++ } return n })

/* ---- Q1 + Q2 on the Leave War, his iPhone's size: the Legend (every kind), and the grid on Fri 26 Jun (his picture) ---- */
const w = await L.newCtx('phone'); const P = w.page
await L.signInPlain(w, 'admin')
await L.press(w, '[data-testid="legend-open"]'); await P.waitForTimeout(500)
const leg = await P.evaluate(() => { const e = document.querySelector('[data-testid="legend"]'); const r = e.getBoundingClientRect(); return { x: 0, y: Math.max(0, Math.floor(r.top) - 4), width: 402, height: Math.min(874 - Math.max(0, Math.floor(r.top) - 4), Math.ceil(r.height) + 8) } })
await shot(P, 'q12-legend-today', leg)
const style = await P.addStyleTag({ content: PROPOSED }); await markOil(P)
/* the Legend's OIL row becomes two: OIL taken (blue) and FO / HO given (green) */
await P.evaluate(() => {
  const row = [...document.querySelectorAll('[data-testid="legend"] .leg-row')].find(r => /Off in lieu/.test(r.textContent))
  if (!row) return
  row.querySelector('.leg-t').textContent = 'OIL taken: time off spent'
  const given = row.cloneNode(true)
  const b = given.querySelector('.c'); b.classList.remove('mock-oil-taken'); b.textContent = 'FO'
  given.querySelector('.leg-t').textContent = 'OIL given: FO a day, HO half a day; a star, the app credited it'
  row.after(given)
})
await P.waitForTimeout(150)
await label(P, 'Drawn in: OIL taken blue · FO / HO green · course violet · overseas duty warm stone', 92, leg.y + 6, 300)
await shot(P, 'q12-legend-proposed', { ...leg, height: Math.min(874 - leg.y, leg.height + 60) })
await unlabel(P)
await style.evaluate(s => s.remove()); await P.evaluate(() => document.querySelectorAll('.mock-oil-taken').forEach(e => e.classList.remove('mock-oil-taken')))
await L.press(w, '[data-testid="legend-open"]').catch(() => {}); await P.waitForTimeout(300)
await L.closeAny(w)
if (await L.vis(P, '[data-testid="legend-scrim"]')) { await P.click('[data-testid="legend-scrim"]'); await P.waitForTimeout(300) }
/* the grid where an OIL taken and an FO stand side by side: found, not assumed */
await L.gotoMonth(w, 'JUN'); await P.waitForTimeout(800)
const found = await P.evaluate(() => {
  const cells = [...document.querySelectorAll('.mx td .c.k-oil')]
  const taken = cells.find(c => /^OIL/.test(c.textContent.trim())), given = cells.find(c => /^(FO|HO)/.test(c.textContent.trim()))
  const pick = taken && cells.find(c => /^(FO|HO)/.test(c.textContent.trim()) && Math.abs(c.getBoundingClientRect().left - taken.getBoundingClientRect().left) < 260) || given
  if (!taken || !pick) return null
  taken.scrollIntoView({ block: 'center', inline: 'center' })
  return { taken: taken.textContent.trim(), given: pick.textContent.trim() }
})
await P.waitForTimeout(500)
const box = await P.evaluate(() => {
  const cells = [...document.querySelectorAll('.mx td .c.k-oil')]
  const rs = cells.map(c => c.getBoundingClientRect()).filter(r => r.top > 120 && r.bottom < 860 && r.left > 0 && r.right < 402)
  if (!rs.length) return null
  const top = Math.min(...rs.map(r => r.top)), bot = Math.max(...rs.map(r => r.bottom))
  return { x: 0, y: Math.max(0, Math.floor(top) - 60), width: 402, height: Math.min(300, Math.ceil(bot - top) + 120) }
})
console.log('Q1 grid', JSON.stringify(found), JSON.stringify(box))
if (box) {
  await shot(P, 'q1-grid-today', box)
  const s2 = await P.addStyleTag({ content: PROPOSED }); await markOil(P); await P.waitForTimeout(150)
  await label(P, 'Drawn in: the OIL taken (Drifter) blue; the FO given (Blade) stays green', 12, box.y + 6, 300)
  await shot(P, 'q1-grid-proposed', box)
  await unlabel(P)
  await s2.evaluate(s => s.remove())
}
await w.ctx.close()

/* ---- Q3: the Inputs calendar on a desktop, July: every absence the app's error red, every duty its warning amber today ---- */
const d = await L.newCtx('desk'); const Q = d.page
await L.signInPlain(d, 'admin')
await Q.evaluate(() => window.go('inputs')); await Q.waitForTimeout(800)
for (let i = 0; i < 3; i++) { await Q.locator('#page-inputs button', { hasText: '‹' }).first().click(); await Q.waitForTimeout(300) }
const clip = { x: 0, y: 150, width: 1440, height: 560 }
await Q.screenshot({ path: path.join(OUT, 'q3-inputs-today.png'), clip })
const n3 = await Q.evaluate(HUE => {
  const blue = '138,150,255'
  const H = { LL: '242,200,110', OL: '226,146,38', OIL: blue, CCL: blue, FCL: blue, PL: blue, CL: blue, EL: blue, OD: HUE.od.replace(/ /g, ''), CSE: HUE.cse.replace(/ /g, ''), CRS: HUE.cse.replace(/ /g, ''), B: '236,104,140', C: '236,104,140', 'ATT B': '236,104,140', 'ATT C': '236,104,140', OML: '236,104,140', HL: '236,104,140', UPCHIT: '236,104,140' }
  const DUTY = '150,166,190'
  let n = 0
  for (const b of document.querySelectorAll('.ib-bar')) {
    const t = (b.getAttribute('title') || b.textContent || '').split(' · ')[1]?.trim().toUpperCase() || ''
    const k = Object.keys(H).find(c => t === c || t.startsWith(c + ' '))
    const rgb = k ? H[k] : (b.classList.contains('amb') ? DUTY : null)
    if (!rgb) continue
    b.style.background = `rgba(${rgb},.40)`; b.style.color = '#fff'; b.style.boxShadow = `inset 0 0 0 1px rgba(${rgb},.9)`; n++
  }
  return n
}, HUE)
await label(Q, 'Drawn in: each bar wears its kind\'s Leave War colour; duties and other commitments a slate of their own', 760, 152, 400)
await Q.screenshot({ path: path.join(OUT, 'q3-inputs-proposed.png'), clip })
console.log('Q3 bars recoloured', n3)
await d.ctx.close()

/* ---- Q4: the HO star — the app's star (an OIL the published schedule earned, not one given by hand) ---- */
const h = await L.newCtx('phone'); const H = h.page
await L.signInPlain(h, 'admin')
await L.gotoMonth(h, 'NOV'); await H.waitForTimeout(600)
const drawStar = (big) => H.evaluate(big => {
  document.querySelectorAll('.mock-star').forEach(e => e.remove())
  const day = '2026-11-10'
  const td = id => { const c = document.querySelector(`[data-testid="cell-${id}-${day}"]`); return c && (c.closest('td') || c) }
  /* four rows on screen, one under another, with nothing on the day */
  const ids = [...document.querySelectorAll(`[data-testid$="-${day}"][data-testid^="cell-"]`)].filter(c => { const r = c.getBoundingClientRect(); return r.top > 300 && r.bottom < 800 && !c.closest('td').querySelector('.c') }).slice(0, 4).map(c => c.getAttribute('data-testid').slice(5, -(day.length + 1)))
  const put = (id, html) => { const t = td(id); if (!t) return; t.classList.add('hasc'); t.insertAdjacentHTML('beforeend', html) }
  const fs = big ? 'style="font-size:8.6px"' : ''
  /* A — today: the star a letter after HO */
  put(ids[0], `<span class="c k-oil s-a top mock-star" ${fs}>HO*</span>`)
  put(ids[1], `<span class="c k-oil s-a top mock-star" ${fs}>HO*</span><span class="c k-ll s-a bot mock-star">LL</span>`)
  /* B — the star a small mark in the box's top-right corner, the letters kept to HO */
  const mark = '<i style="position:absolute;top:1px;right:1px;width:3px;height:3px;border-radius:50%;background:#DDF8E6"></i>'
  put(ids[2], `<span class="c k-oil s-a top mock-star" ${fs}>HO${mark}</span>`)
  put(ids[3], `<span class="c k-oil s-a top mock-star" ${fs}>HO${mark}</span><span class="c k-ll s-a bot mock-star">LL</span>`)
  const r = td(ids[0]).getBoundingClientRect()
  return { y: Math.max(0, Math.round(r.top) - 50), fit: [...document.querySelectorAll('.mock-star')].map(e => e.scrollWidth <= e.clientWidth) }
}, big)
const s1 = await drawStar(false)
await label(H, 'Rows 1–2: today, "HO*"  ·  rows 3–4: drawn in, "HO" with the star as a dot on its corner', 12, s1.y + 4, 360)
await shot(H, 'q4-star', { x: 0, y: s1.y, width: 402, height: 190 })
const s2 = await drawStar(true)
await label(H, 'The same with an iPhone\'s wider letters (about 1.14×)', 12, s2.y + 4, 360)
await shot(H, 'q4-star-wide', { x: 0, y: s2.y, width: 402, height: 190 })
console.log('Q4 fits (normal, wide)', JSON.stringify(s1.fit), JSON.stringify(s2.fit))
await L.closeBrowser()
