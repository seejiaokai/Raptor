// lw-more-look — his D1319 / D1320 (24 Oct 26, "Can u make the way to open the ... more clearer? Also Grant OIL is
// green"): round 3's window (lw-declutter-mock.mjs) on a pending bid, at his iPhone's size, two ways —
//   A  the ⋯ as a BUTTON in the title bar: a bordered box, as the window's other buttons are, its menu under it;
//   B  a "More" fold at the window's foot, the grid card's Manning button look (a border and its ▸ / ▾), opening a row;
// each closed and open, set C in place (the OIL leave button magenta, D1316); "Grant OIL" in the green of OIL given (the FO / HO box's own map, matrix.css .k-oil: 70,196,108),
// Post out and Post in in their hatched look as today. Usage: PORT=4174 node scripts/handpass/lw-more-look.mjs
import * as L from './lw-declutter-lib.mjs'
import { transform, reorder } from './lw-declutter-mock.mjs'
import path from 'node:path'
console.log('lw-more-look v2 — set C in place: the OIL leave button magenta (D1316)')
const OUT = path.resolve('docs/img/handpass/2026-10-24-lw-declutter')
const CSS = `.bidsheet-hd .mock-more { border: 1px solid var(--edge-2) !important; border-radius: 8px !important; background: var(--panel-2) !important;
  min-width: 34px; height: 26px; padding: 0 8px !important; display: inline-flex !important; align-items: center; justify-content: center; font-size: 16px !important; color: var(--ink) !important; align-self: center; }
.bidsheet .tchip.lv.k-oil { --h: 226, 96, 196 !important; --ink: #FFDDF4 !important; --fill: .34 !important; }
.bidsheet .mock-oilbtn { background: rgba(70,196,108,.38) !important; color: #DDF8E6 !important; border: 1px solid rgba(70,196,108,.9) !important; background-image: none !important; }
.bidsheet .mock-menu2 { position: absolute; z-index: 5; display: grid; gap: 6px; padding: 8px; background: var(--panel); border: 1px solid var(--edge-2); border-radius: 10px; }
.bidsheet .mock-fold { display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--edge-2); border-radius: 8px; padding: 4px 10px; background: var(--panel-2); color: var(--ink); font-weight: 600; font-size: 12px; }
.bidsheet .mock-foot { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 6px; padding-top: 8px; border-top: 1px solid var(--edge); }`
const items = `<button type="button" class="dchip po mock-oilbtn">Grant OIL</button><button type="button" class="dchip po">Post out</button><button type="button" class="dchip po">Post in</button>`
const style = P => P.evaluate(css => { let s = document.getElementById('mock-more'); if (!s) { s = document.createElement('style'); s.id = 'mock-more'; document.head.appendChild(s) } s.textContent = css }, CSS)
const shot = async (P, name) => {
  await P.waitForTimeout(200)
  const c = await P.evaluate(() => { const s = document.querySelector('.bidsheet').getBoundingClientRect(); const m = document.querySelector('.mock-menu2'); const b = m ? Math.max(s.bottom, m.getBoundingClientRect().bottom) : s.bottom; return { x: s.left - 4, y: Math.max(0, s.top - 4), width: s.width + 8, height: b - s.top + 8 } })
  console.log(name, 'h', Math.round(c.height - 8))
  await P.screenshot({ path: path.join(OUT, name + '.png'), clip: c, scale: 'device' })
}
const w = await L.newCtx('phone'); const P = w.page
await L.signInPlain(w, 'admin')
const who = await P.evaluate(() => Object.entries(window.PEOPLE || {}).find(([, v]) => v.cs === 'Drifter')?.[0])
const DAY = '2026-11-03'
await L.openCellR(w, who, DAY)
await L.press(w, L.T('bid-approve-tick')); await P.waitForTimeout(150)
await L.press(w, L.T('bid-LL')); await P.waitForTimeout(500); await L.closeAny(w)

/* A — the ⋯ a button */
await L.openCellR(w, who, DAY)
await transform(P, { p: 'bid', admin: true, lit: 'LL' }); await reorder(P, 'bid'); await style(P)
const fits = await P.evaluate(() => { const hd = document.querySelector('.bidsheet-hd'); const kids = [...hd.children].filter(e => e.getBoundingClientRect().height); const tops = k => new Set(kids.map(e => Math.round((e.getBoundingClientRect().top + e.getBoundingClientRect().height / 2) / 10))).size
  const x = hd.querySelector('.x').getBoundingClientRect(), r = hd.getBoundingClientRect(); const a = { lines: tops(), xInside: x.right <= r.right + 1 }
  document.querySelector('.bidsheet').style.letterSpacing = '0.9px'; const x2 = hd.querySelector('.x').getBoundingClientRect(); const b = { lines: tops(), xInside: x2.right <= r.right + 1 }; document.querySelector('.bidsheet').style.letterSpacing = ''
  return { normal: a, wider: b } })
console.log('A title', JSON.stringify(fits))
await shot(P, 'more-a-closed')
await P.evaluate(items => {
  const s = document.querySelector('.bidsheet'), sr = s.getBoundingClientRect(), r = s.querySelector('.mock-more').getBoundingClientRect()
  if (getComputedStyle(s).position === 'static') s.style.position = 'relative'
  const m = document.createElement('div'); m.className = 'mock-menu2'; m.innerHTML = items; s.appendChild(m)
  m.style.left = (r.right - sr.left - m.getBoundingClientRect().width) + 'px'; m.style.top = (r.bottom - sr.top + 4) + 'px'
}, items)
await shot(P, 'more-a-open')
await L.closeAny(w)

/* B — a "More" fold at the foot */
await L.openCellR(w, who, DAY)
await transform(P, { p: 'bid', admin: true, lit: 'LL' }); await reorder(P, 'bid'); await style(P)
await P.evaluate(() => document.querySelector('.bidsheet-hd .mock-more')?.remove())
await P.evaluate(() => { const f = document.createElement('div'); f.className = 'mock-foot mock-new'; f.innerHTML = '<button type="button" class="mock-fold">More <span aria-hidden="true">▸</span></button>'; document.querySelector('.bidsheet').appendChild(f) })
await shot(P, 'more-b-closed')
await P.evaluate(items => { const f = document.querySelector('.mock-foot'); f.innerHTML = '<button type="button" class="mock-fold">More <span aria-hidden="true">▾</span></button>' + items }, items)
await shot(P, 'more-b-open')
await L.closeAny(w)
console.log('errors', JSON.stringify(w.errs))
await L.closeBrowser()
