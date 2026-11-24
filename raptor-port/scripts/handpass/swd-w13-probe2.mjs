// swd-w13-probe2 — the month's end (Fri 31 Jul – Sun 2 Aug) and the phone's doors, tried once (read only; window.* read).
process.env.W13_RUN ||= 'probe2'
import './swd-w13-env.mjs'
const M = await import('./swd-w13-lib.mjs')
const { X, T, L, RANGER, ISO, sleep } = M
const J = JSON.stringify
console.log('VERSION swd-w13-probe2 1 · size', process.env.SZ || 'd')
const SZ = process.env.SZ || 'd'
const log = (...a) => console.log('>>', ...a.map(x => typeof x === 'string' ? x : J(x)))
await T.run('probe2', SZ, async (p, W) => {
  await M.post(p, W, RANGER, ISO.a1, 'p.f1')
  log('rec', await T.rec(p, RANGER))
  await M.asR(p, W)
  let r = await M.keys(p, W, ISO[31], 2); log('keys Jul 31 +2', r.picked, r.opened, await M.winDates(p), await p.evaluate(() => (document.querySelector('[data-testid="sc-month"]') || {}).textContent))
  await W.pic(p, 'keys31')
  await X.closeInp(p, W)
  const c = await M.commitOpen(p, W, ISO.a1, 'c'); log('commit Sat 1 Aug', c.ok, c.why, await M.winDates(p))
  log('window cal controls', await p.evaluate(() => [...document.querySelectorAll('#inpEditPop button')].filter(b => !b.dataset.iso).map(b => (b.dataset.testid || '') + ':' + (b.getAttribute('aria-label') || b.textContent.trim().slice(0, 12)))))
  await W.pic(p, 'win-aug')
  await X.closeInp(p, W)
  await X.sansX(p, W)
  r = await M.drag(p, W, ISO.a1, '2026-08-03'); log('drag Aug 1→3', r.opened, r.picked, await M.winDates(p))
  await W.pic(p, 'drag-aug')
  await X.closeInp(p, W)
})
process.exit(0)
