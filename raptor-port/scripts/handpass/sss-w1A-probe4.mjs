// sss-w1A-probe4 — a seated name carried from SC AM MAIN over a timed flight's seat (both on screen), with chat 179's proved
// drag helper; then the same with sss-w1A-lib's edge drag; positions logged. Run from raptor-port/:
//   SSSA_RUN=probe4 SZ=d node scripts/handpass/sss-w1A-probe4.mjs
import './sss-w1A-env.mjs'
const X = await import('./sss-w1A-lib.mjs')
const { L, W5, J, run, sleep, addLine } = X
const SZ = process.env.SZ || 'd'
console.log(`VERSION sss-w1A-probe4 1 · ${SZ}`)
await run('PR4', SZ, async (p, W) => {
  const s = await addLine(p, W, 4, { kind: 'SC' })
  const t = await addLine(p, W, 4, { cs: 'PR4T', to: '21:00', ld: '22:00' })
  const kS = `4.${s.wi}.0.0.p`, kS2 = `4.${s.wi}.1.0.p`, kT = `4.${t.wi}.0.0.p`
  /* Ace (no crew rest on Fri 17 morning) on SC PM MAIN 1 */
  await X.armAt(p, W, 4, `[data-slot="${kS2}"]`, 'pr4-ace'); await X.pickNow(p, W, 'dj', 'pr4-ace')
  W.rec('a0', 'Ace on SC PM MAIN 1', null, await X.holdsAt(p, kS2))
  await L.openBoard(p, W, 4)
  const pz = () => p.locator(`#schedBoard [data-slot="${kS2}"] .puck:visible`).first()
  const d = await X.dragPath(p, W, pz(), [p.locator(`#schedBoard [data-slot="${kT}"]:visible`).first(), p.locator(`#schedBoard [data-slot="${kS2}"]:visible`).first()], 'pr4-dp', 'last')
  W.rec('dp', 'chat 179 dragPath: over the flight seat, back onto his own seat', null, J({ s1: X.hoverSay(d.seen[0] && d.seen[0].hover), s2: X.hoverSay(d.seen[1] && d.seen[1].hover), at: d.seen.map(x => x.at), seat: await X.holdsAt(p, kS2), note: d.note }))
  const e = await X.dragVia(p, W, pz(), [p.locator(`#schedBoard [data-slot="${kT}"]:visible`).first(), p.locator(`#schedBoard [data-slot="${kS2}"]:visible`).first()], 'pr4-dv', 'last')
  W.rec('dv', 'sss dragVia: the same', null, J({ s1: X.hoverSay(e.seen[0] && e.seen[0].hover), s2: X.hoverSay(e.seen[1] && e.seen[1].hover), at: e.seen.map(x => x.at), seat: await X.holdsAt(p, kS2), note: e.note }))
})
process.exit(0)
