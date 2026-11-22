// frf-w3-calib — the painted-mark reads, calibrated: the same read on the board's ordinary box (must say solid / a ▾) and
// on the held box (dotted / none)
import * as L from './frf-w3-lib.mjs'
console.log('frf-w3-calib v1')
for (const k of ['desktop', 'phone']) {
  const sz = L.SIZES[k], { b, p } = await L.open(sz); await L.login(p, 'ad')
  await p.evaluate(() => { const w = window; w.fileInput({ type: 'Training', allday: false, s: 480, e: 1020, date: 'Jul 18', yr: 2026, remarks: '', acc: 'g', people: [{ p: 'bane' }], iid: 'w3-cal' }); w.afterSchedMutate() })
  await L.openBoard(p)
  const read = sel => p.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); if (!e) return null; const c = getComputedStyle(e), a = getComputedStyle(e, '::after'); return { border: c.borderTopStyle, after: a.content } }, sel)
  const ordinary = await read('#schedBoard label.sgn')
  await L.pickSign(p, 'board', 'cur', 0)
  const held = await read('[data-testid="odl-held"] .sgn')
  console.log(k, 'ordinary board box', JSON.stringify(ordinary), '| held box', JSON.stringify(held))
  await L.done(b)
}
