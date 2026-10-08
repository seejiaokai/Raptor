import * as H from './cal-A-lib2.mjs'
const { tid, sleep } = H
const SIZE = process.env.SIZE || 'side'
const w = await H.world(SIZE)
const reach = sel => w.page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { l: Math.round(r.left), t: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), onScreen: r.bottom > 0 && r.top < innerHeight, hit: !!hit && (hit === e || e.contains(hit)), hitIs: hit ? (hit.id || hit.className || hit.tagName).toString().slice(0, 40) : null } }, sel)
await H.openSans(w); await H.sansGoto(w, '2026-07-14')
const o = {}
o.before = { undo: await reach('#undoBtn'), redo: await reach('#redoBtn') }
await H.sansOpen(w, '2026-07-14')
o.dayOpen = { undo: await reach('#undoBtn'), redo: await reach('#redoBtn'), win: await w.page.evaluate(() => { const r = document.querySelector('[data-testid="win-sansday"]').getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)] }) }
await H.pic(w, 'sizes3-day-over-bar')
await H.calOpenFromSans(w, '2026-07-14')
o.calOpen = { undo: await reach('#undoBtn'), redo: await reach('#redoBtn'), win: await w.page.evaluate(() => { const r = document.querySelector('[data-testid="win-days"]').getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)] }) }
await H.pic(w, 'sizes3-cal-over-bar')
console.log(SIZE, JSON.stringify(o))
await H.closeAll(w)
