// lw-round2-odcrs — round 2 of D1301: an overseas duty (OD), a course (CSE) and the unforeseen absence (UNA, D1303)
// filed on the Leave War (D1299), drawn with his answers in place (D1318: filed straight, no approval, any date, a member
// may file them, no document) — in the round 3 window (lw-declutter-mock.mjs), set C's colours (D1316), at his iPhone's
// size. The three buttons are a row of their own under the leaves, always FILLED (they stand at once, as an approved
// leave does), with no balance figure (nothing is spent). UNA is a new kind: drawn in a lime of its own (lesson 49 — no
// two kinds share a colour), his to rule.
// Pictures: an admin's empty day; a member's open day (his leave buttons hollow, the three filled); a member's CLOSED day
// (today a note only — with D1318 the three may still be filed there). Usage: PORT=4174 node scripts/handpass/lw-round2-odcrs.mjs
import * as L from './lw-declutter-lib.mjs'
import { transform, reorder } from './lw-declutter-mock.mjs'
import path from 'node:path'
console.log('lw-round2-odcrs v1')
const OUT = path.resolve('docs/img/handpass/2026-10-24-lw-declutter')
const SETC = `.bidsheet .tchip.lv.k-oil.mock-taken { --h: 226, 96, 196 !important; --ink: #FFDDF4 !important; --fill: .34 !important; }
.bidsheet .tchip.lv.k-cse { --h: 160, 100, 240 !important; --ink: #EBDDFF !important; --fill: .36 !important; }
.bidsheet .tchip.lv.k-od { --h: 128, 142, 160 !important; --ink: #F2F5F8 !important; --fill: .58 !important; }
.bidsheet .tchip.lv.mock-una { --h: 186, 214, 72 !important; --ink: #F3FFD2 !important; --fill: .34 !important; }
.bidsheet .mock-odrow { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; flex: 1 1 100%; margin-top: 2px; }`
/* the row of three, cloned from the window's own CCL button (its size, its look), recoloured by kind, filled, no figure */
const addRow = (P, after) => P.evaluate(({ css, after }) => {
  let st = document.getElementById('mock-r2'); if (!st) { st = document.createElement('style'); st.id = 'mock-r2'; document.head.appendChild(st) } st.textContent = css
  const s = document.querySelector('.bidsheet')
  s.querySelectorAll('.tchip.lv.k-oil').forEach(b => b.classList.add('mock-taken'))
  const model = s.querySelector('[data-testid$="-CCL"]')
  const row = document.createElement('div'); row.className = 'mock-odrow mock-new'
  for (const [code, cls, title] of [['CSE', 'k-cse', 'Course'], ['OD', 'k-od', 'Overseas duty'], ['UNA', 'mock-una', 'Unavailable — an unforeseen absence']]) {
    let b
    if (model) { b = model.cloneNode(true); b.removeAttribute('data-testid'); b.className = b.className.replace(/\bk-\S+/g, '').replace(/\bs-w\b/, 's-a').replace(/\blv-dim\b/, '') + ' ' + cls }
    else { b = document.createElement('button'); b.className = 'tchip lv s-a ' + cls }
    if (!b.classList.contains('s-a')) b.classList.add('s-a')
    b.innerHTML = `<span class="lv-code">${code}</span>`; b.title = title
    row.appendChild(b)
  }
  const anchor = after ? s.querySelector(after) : s.querySelector('[data-testid="bid-leave-grid"]')
  ;(anchor.closest('.bidsheet-row') || anchor).after(row)
  return !!model
}, { css: SETC, after })
const winClip = P => P.evaluate(() => { const r = document.querySelector('.bidsheet').getBoundingClientRect(); return { x: r.left - 4, y: Math.max(0, r.top - 4), width: r.width + 8, height: r.height + 8 } })
const take = async (P, name) => { await P.waitForTimeout(250); const c = await winClip(P); console.log(name, 'h', Math.round(c.height - 8)); await P.screenshot({ path: path.join(OUT, name + '.png'), clip: c, scale: 'device' }) }

/* 1. an admin's empty day */
const w = await L.newCtx('phone'); const P = w.page
await L.signInPlain(w, 'admin')
const who = await P.evaluate(() => Object.entries(window.PEOPLE || {}).find(([, v]) => v.cs === 'Drifter')?.[0])
await L.openCellR(w, who, '2026-11-02')
await transform(P, { p: 'bid', admin: true }); await reorder(P, 'bid')
await addRow(P)
await take(P, 'r2-admin-empty')
await L.closeAny(w)
console.log('errors', JSON.stringify(w.errs))
await w.ctx.close()

/* 2. a member's open day (Ranger, his "today" 15 Feb 26) */
const m = await L.newCtx('phone'); const M = m.page
await L.signInPlain(m, 'member', '2026-02-15')
await L.openCellR(m, 'bane', '2026-02-20')
await transform(M, { p: 'bid', admin: false }); await reorder(M, 'bid')
await addRow(M)
await take(M, 'r2-member-open')
await L.closeAny(m)
await m.ctx.close()

/* 3. a member's closed day (his real today): today a note only; drawn with the three under it */
const c = await L.newCtx('phone'); const C = c.page
await L.signInPlain(c, 'member')
await L.openCellR(c, 'bane', '2026-12-07')
await take(C, 'r2-member-closed-today')
await addRow(C, '.cn-note')
await take(C, 'r2-member-closed')
console.log('errors', JSON.stringify([...m.errs, ...c.errs]))
await L.closeBrowser()
