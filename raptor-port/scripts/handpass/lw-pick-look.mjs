// lw-pick-look v4 — the pictures put to him for [LW-PICK-HELD-MARK] (his D1289, D1290 and his two questions, 24 Oct 26), drawn
// on the real build of claude/lw-m3-placing-leave at his iPhone's size (402×874, 3x). Each question: TODAY (real, as the app
// draws it) and PROPOSED (one named transform on the real page, labelled "drawn in" on the picture). Usage: node lw-pick-look.mjs
// Served build: http://localhost:4301 (the M3 re-walk helpers' address). Letters are the test browser's, not his iPhone's: the
// day line in Q3's option A is the line that would wrap first with wider letters (drawn at 1.14x too — Q3c).
import * as L from './lw-m3-rewalk-lib.mjs'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
console.log('lw-pick-look v4')
const OUT = path.resolve('docs/img/handpass/2026-10-24-lw-pick-look')
mkdirSync(OUT, { recursive: true })
const shot = (P, name, clip) => P.screenshot({ path: path.join(OUT, name + '.png'), scale: 'device', ...(clip ? { clip } : {}) })
const DAY = '2026-11-02'

/* a "drawn in" label on the picture, fixed where the change is (D1222) */
const label = (P, text, x, y, w = 250) => P.evaluate(({ text, x, y, w }) => {
  document.querySelectorAll('.mock-lab').forEach(e => e.remove())
  const d = document.createElement('div'); d.className = 'mock-lab'; d.textContent = text
  Object.assign(d.style, { position: 'fixed', left: x + 'px', top: y + 'px', width: w + 'px', zIndex: 99999, background: '#0b3b46', color: '#bff3ff', border: '1px solid #38c6e4', borderRadius: '7px', padding: '4px 8px', font: '600 11px system-ui, sans-serif', pointerEvents: 'none' })
  document.body.appendChild(d)
}, { text, x, y, w })
const unlabel = P => P.evaluate(() => document.querySelectorAll('.mock-lab').forEach(e => e.remove()))
const cellTd = (who, iso) => `[data-testid="cell-${who}-${iso}"]`
const mark = (P, who, iso, on = true) => P.evaluate(({ s, on }) => { const e = document.querySelector(s); const td = e && (e.closest('td') || e); if (td) td.classList.toggle('selcell', on); return !!(td && td.classList.contains('selcell')) === on }, { s: cellTd(who, iso), on })
const win = P => P.evaluate(() => { const e = document.querySelector('.bidsheet'); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), h: Math.round(r.height), bottom: Math.round(r.bottom) } })

const w = await L.newCtx('phone')
const P = w.page
await L.signInPlain(w, 'admin')
const ids = await P.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE || {}).map(([k, v]) => [v.cs, k])))

/* ---- Q1: the tapped day keeps the cyan selection mark (D1289) ---- */
await L.openCellR(w, ids.Drifter, DAY)
let g = await win(P)
const c1 = await P.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } }, cellTd(ids.Drifter, DAY))
console.log('Q1 window', JSON.stringify(g), 'cell', JSON.stringify(c1))
await shot(P, 'q1-today')
if (!(await mark(P, ids.Drifter, DAY))) throw new Error('Q1: the mark did not land')
await label(P, 'Drawn in: the day you tapped keeps the cyan selection mark until the window closes', 12, Math.max(70, c1.y - 46), 300)
if (!(await P.evaluate(s => document.querySelector(s).closest('td').classList.contains('selcell'), cellTd(ids.Drifter, DAY)))) throw new Error('Q1: mark lost')
await shot(P, 'q1-proposed')
await unlabel(P); await mark(P, ids.Drifter, DAY, false)
await L.closeWinIfOpen(w)

/* ---- Q2: on a phone the window never hides what was picked (D1290). The one-day window already scrolls the tapped day
   above itself (M3's red-team fix A5 — Matrix.tsx, shown as Q2a); a DRAG-SELECTION's window does not: Q2b today, Q2c proposed. */
await P.evaluate(() => window.scrollTo(0, 60)); await P.waitForTimeout(300)
const lowRow = await P.evaluate(day => {
  const cells = [...document.querySelectorAll(`[data-testid$="-${day}"][data-testid^="cell-"]`)]
  const c = cells.find(e => { const r = e.getBoundingClientRect(); return r.top > 660 && r.bottom < 800 })
  return c ? c.getAttribute('data-testid').slice(5, -(day.length + 1)) : null
}, DAY)
if (!lowRow) throw new Error('Q2: no row low on the screen')
const cs = await P.evaluate(id => window.PEOPLE[id].cs, lowRow)
const before = await P.evaluate(s => Math.round(document.querySelector(s).getBoundingClientRect().top), cellTd(lowRow, DAY))
await L.press(w, cellTd(lowRow, DAY)); await P.waitForTimeout(450)
g = await win(P)
const after1 = await P.evaluate(s => Math.round(document.querySelector(s).getBoundingClientRect().bottom), cellTd(lowRow, DAY))
console.log('Q2a one-day', cs, 'cell top before', before, 'cell bottom after', after1, 'window top', g.top)
await label(P, `Today (real): ${cs}'s day was low on the screen; the window scrolled it just above itself — built in M3`, 12, Math.max(70, after1 - 70), 300)
await shot(P, 'q2a-oneday-today')
await unlabel(P); await L.closeWinIfOpen(w)
await P.evaluate(() => window.scrollTo(0, 60)); await P.waitForTimeout(300)
const days = ['2026-11-02', '2026-11-03', '2026-11-04']
const pts = await P.evaluate(({ id, days }) => days.map(d => { const r = document.querySelector(`[data-testid="cell-${id}-${d}"]`).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }), { id: lowRow, days })
await L.holdDrag(w, [pts[0], pts[1], pts[2]], 420)
await P.waitForTimeout(500)
const sel = await P.evaluate(() => { const e = document.querySelector('.bidsheet'); const r = e && e.getBoundingClientRect(); return { open: !!e, top: r ? Math.round(r.top) : null, picked: document.querySelectorAll('td.selcell').length } })
const pb = await P.evaluate(s => Math.round(document.querySelector(s).getBoundingClientRect().bottom), cellTd(lowRow, days[0]))
console.log('Q2b selection', JSON.stringify(sel), 'picked row bottom', pb, 'covered', pb > sel.top)
await label(P, `Today (real): three days of ${cs} picked by a drag — the window opens over them`, 12, 80, 300)
await shot(P, 'q2b-select-today')
const need = pb - (sel.top - 10)
await unlabel(P)
await P.evaluate(n => window.scrollBy(0, n), need); await P.waitForTimeout(400)
const pc = await P.evaluate(s => Math.round(document.querySelector(s).getBoundingClientRect().bottom), cellTd(lowRow, days[0]))
for (const d of days) await mark(P, lowRow, d)
console.log('Q2c scrolled', need, 'row bottom now', pc)
await label(P, `Drawn in: the grid scrolled ${need}px by itself, so the picked days stand just above the window`, 12, Math.max(70, pc - 70), 300)
await shot(P, 'q2c-select-proposed')
await unlabel(P); await L.closeWinIfOpen(w)
await P.evaluate(() => window.scrollTo(0, 60)); await P.waitForTimeout(300)

/* ---- Q3: a shorter one-day window ---- */
for (let i = 0; i < 3 && await P.evaluate(() => !!document.querySelector('.bidsheet')); i++) { await P.evaluate(() => document.querySelector('.bidsheet [data-testid="bid-cancel"], .bidsheet .x')?.click()); await P.waitForTimeout(300) }
if (await P.evaluate(() => !!document.querySelector('.bidsheet'))) throw new Error('Q3: a window is still open')
await L.openCellR(w, ids.Drifter, DAY)
const h0 = (await win(P)).h
const boxOf = s => P.evaluate(s => { const e = document.querySelector('.bidsheet'); const r = e.getBoundingClientRect(); return { x: Math.floor(r.left) - 4, y: Math.floor(r.top) - 4, width: Math.ceil(r.width) + 8, height: Math.ceil(r.height) + 8 } })
await shot(P, 'q3-today', await boxOf())
const css = (id, text) => P.evaluate(({ id, text }) => { let s = document.getElementById(id); if (!s) { s = document.createElement('style'); s.id = id; document.head.appendChild(s) } s.textContent = text }, { id, text })
/* A — the day line on one line, out of its own box: its two parts side by side, nothing removed */
await css('mockA', `.bidsheet .bidsheet-dayline{grid-template-columns:max-content max-content 1fr!important;border:0!important;background:none!important;padding:0 2px!important;margin:0 0 6px!important;align-items:baseline}
.bidsheet .bidsheet-dayline .dl-calm{grid-column:auto!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}`)
await P.waitForTimeout(150)
const hA = (await win(P)).h
const wrapA = await P.evaluate(() => { const e = document.querySelector('.bidsheet-dayline'); return Math.round(e.getBoundingClientRect().height) })
await shot(P, 'q3-a', await boxOf())
/* B — A, and Remarks moved beside Document as a "+ Remarks" chip that opens the box in its place (a chip cloned from Duration's) */
const hasB = await P.evaluate(() => {
  const doc = document.querySelector('[data-testid="bid-doc-row"]'), rmk = document.querySelector('[data-testid="bid-rmk-row"]')
  const chip = document.querySelector('[data-testid="portion-am"]')
  if (!doc || !rmk || !chip) return false
  const c = chip.cloneNode(true); c.classList.remove('on'); c.removeAttribute('data-testid'); c.textContent = '+ Remarks'; c.classList.add('mock-new')
  doc.querySelector('.docfield').after(c); doc.style.gap = '8px'; rmk.style.display = 'none'
  doc.querySelector('.lab').textContent = 'Document'
  return true
})
await P.waitForTimeout(150)
const hB = (await win(P)).h
await shot(P, 'q3-b', await boxOf())
/* C — the same as A, with the letters a seventh wider (his iPhone's are wider than the test browser's) */
await P.evaluate(() => { const d = document.querySelector('.bidsheet-dayline'); d.style.letterSpacing = '0.9px' })
await P.waitForTimeout(100)
const wrapC = await P.evaluate(() => { const c = document.querySelector('.bidsheet-dayline .dl-calm'); return { clipped: c.scrollWidth > c.clientWidth, h: Math.round(document.querySelector('.bidsheet-dayline').getBoundingClientRect().height) } })
await shot(P, 'q3-c-wide', await boxOf())
console.log('Q3 heights today', h0, 'A', hA, '(day line', wrapA, ') B', hB, 'wider letters', JSON.stringify(wrapC))
await L.closeWinIfOpen(w)
await w.ctx.close()
const w4 = await L.newCtx('phone'); const P4 = w4.page
await L.signInPlain(w4, 'admin')

/* ---- Q4: the bubble after a bid that turns a row red ---- */
const foot = (P4, mode) => P4.evaluate(mode => {
  document.querySelectorAll('.mock-foot').forEach(e => e.remove())
  const d = document.createElement('div'); d.className = 'mn-foot mock-foot'; d.setAttribute('role', 'status')
  const show = '<button type="button" class="mn-show">Show ›</button>'
  if (mode === 'today') { d.innerHTML = '<span>This bid turns Available P red, 1A amber.</span>' + show }
  else {
    const red = 'rgba(240,85,95,.75)'
    d.style.borderColor = red; d.style.background = '#2c1215'; d.style.color = '#F6A3A9'
    const line = (n, a, b, c) => `<span style="color:${c}">${n}</span><span style="color:${c};font-variant-numeric:tabular-nums">${b == null ? a : a + ' → ' + b}</span>`
    const rows = mode === 'fromto'
      ? line('Available P', 21, 20, '#F0555F') + line('1A', 4, 3, '#E5A83B')
      : line('Available P', 20, null, '#F0555F') + line('1A', 3, null, '#E5A83B')
    d.innerHTML = `<span style="display:grid;grid-template-columns:max-content max-content;column-gap:14px;row-gap:2px;font-weight:600">${rows}</span>` + show
    d.querySelector('.mn-show').style.color = '#F6A3A9'
  }
  (document.querySelector('#page-leavewar') || document.body).appendChild(d); return true
}, mode)
await L.gotoMonth(w4, 'JUN'); await P4.waitForTimeout(500)
for (const m of ['today', 'fromto', 'now']) {
  await foot(P4, m)
  if (m !== 'today') await label(P4, m === 'fromto' ? 'Drawn in: red when any row turns red; each row on its own line, from → to (example figures)' : 'Drawn in: red when any row turns red; each row on its own line, the figure after the bid only (example figures)', 12, 660, 300)
  else await unlabel(P4)
  if (!(await P4.evaluate(() => !!document.querySelector('.mock-foot')))) throw new Error('Q4: the bubble did not land')
  await shot(P4, 'q4-' + m, { x: 0, y: 560, width: 402, height: 314 })
}
/* ---- Q5: OIL taken (leave spent) and FO / HO (OIL given) no longer share the green (D1291) — Fri 26 Jun, as his picture ---- */
await P4.evaluate(() => document.querySelectorAll('.mock-foot').forEach(e => e.remove())); await unlabel(P4)
const oilCell = await P4.evaluate(() => [...document.querySelectorAll('.mx td .c')].some(e => e.textContent.trim() === 'OIL'))
if (!oilCell) throw new Error('Q5: no OIL box in June')
await P4.waitForTimeout(400)
const area = { y: 560 }
const clip5 = { x: 0, y: area.y, width: 402, height: 330 }
await shot(P4, 'q5-today', clip5)
const recolour = (P, mode) => P.evaluate(mode => {
  for (const b of document.querySelectorAll('.mx td .c')) {
    const t = b.textContent.trim()
    if (t !== 'OIL') continue
    if (mode === 'a') { b.classList.remove('k-oil'); b.classList.add('k-care') }
    else { b.style.setProperty('--h', '64, 200, 190'); b.style.setProperty('--ink', '#D8FBF7') }
  }
  return [...document.querySelectorAll('.mx td .c')].filter(b => b.textContent.trim() === 'OIL').length
}, mode)
const nA = await recolour(P4, 'a')
await label(P4, 'Drawn in, A: OIL taken wears the other leave\'s blue; FO / HO keep the green (OIL given)', 12, area.y + 4, 300)
await shot(P4, 'q5-a', clip5)
await P4.evaluate(() => { for (const b of document.querySelectorAll('.mx td .c.k-care')) if (b.textContent.trim() === 'OIL') { b.classList.remove('k-care'); b.classList.add('k-oil') } })
await recolour(P4, 'b')
await label(P4, 'Drawn in, B: OIL taken a teal of its own (a new colour); FO / HO keep the green', 12, area.y + 4, 300)
await shot(P4, 'q5-b', clip5)
console.log('Q5 OIL boxes recoloured', nA)
console.log('errors', JSON.stringify([...w.errs, ...w4.errs]))
await L.closeBrowser()
