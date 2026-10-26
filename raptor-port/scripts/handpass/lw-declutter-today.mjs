// lw-declutter-today — the bid windows AS BUILT, for round 3 of D1301 (his D1311, "reduce clutter"), at his iPhone's size
// (402x874, 3x). Five states: an admin on an empty day; on his own pending bid; on an approved leave; a member on an
// empty open day; the drag-selection window. Each picture is the window alone, with its rows' heights logged.
// Usage: PORT=4174 node scripts/handpass/lw-declutter-today.mjs   (the build of claude/lw-m3-placing-leave served there)
import * as L from './lw-declutter-lib.mjs'
import path from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
const OUT = path.resolve('docs/img/handpass/2026-10-24-lw-declutter')
mkdirSync(OUT, { recursive: true })
const win = P => P.evaluate(() => { const e = document.querySelector('.bidsheet'); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.floor(r.left) - 4, y: Math.max(0, Math.floor(r.top) - 4), width: Math.ceil(r.width) + 8, height: Math.ceil(r.height) + 8 } })
const rows = P => P.evaluate(() => [...document.querySelectorAll('.bidsheet > *')].map(e => ({ cls: String(e.className).slice(0, 30), h: Math.round(e.getBoundingClientRect().height), t: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 70) })))
const geo = {}
async function take(w, name) {
  const P = w.page
  await P.waitForTimeout(300)
  const b = await win(P)
  if (!b) throw new Error(name + ': no window open')
  geo[name] = { box: b, rows: await rows(P) }
  console.log(name, 'window h', b.height - 8, JSON.stringify(geo[name].rows))
  await P.screenshot({ path: path.join(OUT, name + '.png'), clip: b, scale: 'device' })
}
const D_EMPTY = '2026-11-02', D_PEND = '2026-11-03', D_APPR = '2026-11-04'

const w = await L.newCtx('phone')
const P = w.page
await L.signInPlain(w, 'admin')
const ids = await P.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE || {}).map(([k, v]) => [v.cs, k])))
const who = ids.Drifter
/* 1. an empty day, admin */
await L.openCellR(w, who, D_EMPTY)
await take(w, 'today-admin-empty')
await L.closeWinIfOpen(w)
/* 2. a pending bid: "Approve what I enter" unticked, LL placed */
await L.openCellR(w, who, D_PEND)
await L.press(w, L.T('bid-approve-tick')); await P.waitForTimeout(200)
await L.press(w, L.T('bid-LL')); await P.waitForTimeout(500)
await L.closeAny(w)
await L.openCellR(w, who, D_PEND)
await take(w, 'today-admin-pending')
await L.closeWinIfOpen(w)
/* 3. an approved leave: ticked, LL placed */
await L.openCellR(w, who, D_APPR)
await L.press(w, L.T('bid-LL')); await P.waitForTimeout(500)
await L.closeAny(w)
await L.openCellR(w, who, D_APPR)
await take(w, 'today-admin-approved')
await L.closeAny(w)
/* 5. the drag-selection window: three days of an empty run */
await P.evaluate(() => window.scrollTo(0, 60)); await P.waitForTimeout(300)
const days = ['2026-11-09', '2026-11-10', '2026-11-11']
await L.reachCell(w, who, days[0])
await P.locator(L.T(L.cellId(who, days[0]))).evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
await P.waitForTimeout(300)
const pts = await P.evaluate(({ id, days }) => days.map(d => { const r = document.querySelector(`[data-testid="cell-${id}-${d}"]`).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }), { id: who, days })
await L.holdDrag(w, pts, 420)
await P.waitForTimeout(500)
await take(w, 'today-admin-select')
await L.closeAny(w)
await w.ctx.close()

/* 4. a member (Ranger) on an empty open day of his own */
const m = await L.newCtx('phone')
await L.signInPlain(m, 'member')
const mid = await m.page.evaluate(() => Object.entries(window.PEOPLE || {}).find(([, v]) => v.cs === 'Ranger')?.[0])
const open = await m.page.evaluate(() => (window.lwOpenDates?.() || null))
console.log('member', mid, 'open dates hint', JSON.stringify(open)?.slice(0, 120))
await L.openCellR(m, mid, '2026-12-07')
await take(m, 'today-member-empty')
await L.closeAny(m)
console.log('errors', JSON.stringify([...w.errs, ...m.errs]))
writeFileSync(path.join(OUT, 'today-geometry.json'), JSON.stringify(geo, null, 1))
await L.closeBrowser()
