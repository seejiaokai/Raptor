// Re-walk A6x — why the second prime bid's cell is covered (diagnosis).
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/a'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L } = A
const { T, shot, txt, vis } = L
console.log('[lw-m4-rw-a6x v1]')
const w = await L.newCtx('desk')
const P = w.page
await L.signIn(w, 'admin')
await L.openCell(w, 'dice', '2026-01-15')
await shot(w, 'a6x-0-window')
console.log('placed', await L.placeLeave(w, 'LL'))
await P.waitForTimeout(600)
await shot(w, 'a6x-1-after-first')
const c = await P.evaluate(() => { const e = document.querySelector('[data-testid="cell-glass-2026-01-15"]'); if (!e) return 'no cell'; const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { r: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], over: h ? h.tagName + '.' + String(h.className).slice(0, 40) + '#' + (h.dataset.testid || '') : null, vh: innerHeight, vw: innerWidth } })
console.log(JSON.stringify(c))
await w.ctx.close(); await L.closeBrowser()
