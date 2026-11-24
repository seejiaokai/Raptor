// swd-w12-lib — walker w12's helpers (the SANS reminder: S2, S7, S14, S15, S16, S17, S22, S23), 24 Nov 26, chat 156.
// Built on walker w11's passing helpers (swd-w11-lib: the bell reader, the words, the posting, the Quals tick, the SANS
// calendar read) and the recipes under them (sah-w8-lib, sah-w10-lib, asp-w2-lib, sud-w5-lib). window.* is only READ here
// (and window.go, the recipes' own page switch). Every staging step goes through the app's own controls.
import './swd-w12-env.mjs'
const K = await import('./swd-w11-lib.mjs')
export { K }
export const { X, T, L, RANGER, HEX, D, WK1, WK2, WORDS, lineIs, remIs, bell, say, sayB, readReminder, need, asR, asS, post, file, move, undoPost, tick, seen, filings, scene, sleep, warReady } = K
export const CASPER = 'casper'
export const ISO = { ...D, 21: '2026-07-21', 22: '2026-07-22', 24: '2026-07-24' }
export const DI = { 13: 0, 14: 1, 15: 2, 16: 3, 17: 4, 18: 5, 19: 6, 20: 0, 21: 1, 22: 2, 23: 3 }
export const wkOf = d => (+d >= 20 ? WK2 : WK1)

/* a Ground Programme row naming `id` (clear of the demo flights: evening hours), read back; Edit Schedule left on week 1 */
export async function plan(p, W, d, sid, o = {}) {
  const id = o.id || RANGER, name = o.name || 'W12 BRIEF', a = o.a || '22:00', b = o.b || '22:30'
  const r = await X.row(p, W, wkOf(d), DI[d], name, a, b, id)
  need(W, sid, `a Ground Programme row "${name}" ${a}–${b} naming ${id === RANGER ? 'Ranger' : id === HEX ? 'Hex' : id} on ${d} Jul (read back)`, r.ok, L.J(r.row))
  await T.gotoWeek(p, W, WK1)
  return r
}
/* a sim row (+ on OFT / AMT) naming `id`: the row made, its seat armed at "+ add", his crew puck pressed */
export async function planSim(p, W, d, kind, sid, o = {}) {
  const id = o.id || RANGER
  await T.gotoWeek(p, W, wkOf(d))
  const s = await T.W5.addSim(p, W, DI[d], kind, o.label || 'W12 SIM', o.a || '21:00', o.b || '21:45')
  await L.armAndPick(p, W, `[data-fill="s:${DI[d]}.${kind}.${s.ri}.+"]`, id, 'sim')
  const row = await p.evaluate(([i, k, n]) => { const x = window.DAYS[i].sims[k][n]; return x ? JSON.parse(JSON.stringify(x)) : null }, [DI[d], kind, s.ri])
  const ok = !!row && JSON.stringify(row).includes(`"${id}"`)
  await L.closeBoard(p, W)
  need(W, sid, `an ${kind.toUpperCase()} sim row ${o.a || '21:00'}–${o.b || '21:45'} naming ${id === RANGER ? 'Ranger' : id} on ${d} Jul (read back)`, ok, L.J(row).slice(0, 200))
  await T.gotoWeek(p, W, WK1)
  return row
}
/* the ground row named `name` on day `d` deleted by its ✕ on the Scheduler Board, then read: is the man left on that day? */
export async function unplan(p, W, d, sid, o = {}) {
  const id = o.id || RANGER, name = o.name || 'W12 BRIEF', di = DI[d]
  await T.gotoWeek(p, W, wkOf(d))
  await L.openBoard(p, W, di)
  const ri = await p.evaluate(([i, nm, id]) => window.DAYS[i].ground.findIndex(r => r.prog === nm && JSON.stringify(r.who || '').includes(id)), [di, name, id])
  if (ri < 0) { need(W, sid, `the "${name}" row on ${d} Jul found to delete`, false, 'no such row'); return }
  const n0 = await p.evaluate(i => window.DAYS[i].ground.length, di)
  await W.press(p, L.B(`[data-grdel="${di}.${ri}"]`), 'grdel'); await sleep(600)
  const n1 = await p.evaluate(i => window.DAYS[i].ground.length, di)
  const pic = await W.pic(p, sid.replace(/\./g, '-') + '-deleted')
  const left = await T.holds(p, id)
  await L.closeBoard(p, W)
  need(W, sid, `Saber deletes the "${name}" row naming ${id === RANGER ? 'Ranger' : id} on ${d} Jul by its ✕ on the Scheduler Board`, n1 === n0 - 1, `ground rows ${n0} → ${n1} · what he holds this week (read): ${left}`, pic)
  await T.gotoWeek(p, W, WK1)
  return left
}
/* the days a reminder names, as the app wrote them */
export const remDays = l => l ? ((/You're planned on (.*) with nothing filed/.exec(l.body) || [])[1] || '') : ''
/* the reminder's own line read: present, read/unread, words; and the bell button lit */
export const remSay = b => `bell lit ${b.lit} · reminder ${say(b.rem)} · other lines ${b.lines.filter(l => l !== b.rem).map(say).join(' || ') || 'none'}`
