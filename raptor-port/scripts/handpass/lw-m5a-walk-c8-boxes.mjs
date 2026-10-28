// walker C, script 8 — the App bal box's size in each kind of man's window (A1's one differing part)
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/c/c8'
const { L, T, pwRead, closePw, rec } = await import('./lw-m5a-walk-c-lib.mjs')
console.log('[lw-m5a-walk-c8-boxes v1]')
L.clearOut()
const w = await L.newCtx('desk'); const P = w.page
await L.signIn(w, 'admin')
const out = []
for (const pid of ['bane', 'glass', 'spanner', 'prism', 'slipway', 'dj', 'shaft']) {
  await L.press(w, `[data-testid="row-${pid}"] .whoedit`); await P.waitForTimeout(500)
  out.push(await P.evaluate(pid => { const q = id => document.querySelector(`[data-testid="${id}"]`); const b = q('pw-LVE').getBoundingClientRect(); const c = q('pw-LVE-cf').getBoundingClientRect(); const p = q('pw-LVE-pend')?.getBoundingClientRect(); return `${pid}: value "${q('pw-LVE').value}" box w ${Math.round(b.width)} h ${Math.round(b.height)} left ${Math.round(b.left)}; cf value "${q('pw-LVE-cf').value}" w ${Math.round(c.width)}; Pending left ${p && Math.round(p.left)}` }, pid))
}
console.log(out.join('\n'))
await w.ctx.close(); await L.closeBrowser(); console.log('DONE')
