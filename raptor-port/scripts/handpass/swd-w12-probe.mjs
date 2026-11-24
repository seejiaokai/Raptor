// swd-w12-probe — read each man's own demo days; try the staging helpers once (post, plan, delete, sim, tick) and read the
// bell after each, so the walk's EXPECTED days are written from what the world holds. Run: SZ=d node scripts/handpass/swd-w12-probe.mjs
process.env.W12_RUN ||= 'probe'
import './swd-w12-env.mjs'
const Z = await import('./swd-w12-lib.mjs')
const { T, L, RANGER, HEX, CASPER, D, WK1, WK2, bell, sayB, asR, asS, post, plan, planSim, unplan, tick, scene } = Z
console.log('VERSION swd-w12-probe 1')
await T.run('probe', process.env.SZ || 'd', scene(async (p, W) => {
  for (const id of [RANGER, HEX, CASPER]) W.rec('holds-' + id, `what ${id} holds, week of 13 Jul (read)`, null, await T.holds(p, id))
  await T.gotoWeek(p, W, WK2)
  for (const id of [RANGER, HEX, CASPER]) W.rec('holds2-' + id, `what ${id} holds, week of 20 Jul (read)`, null, await T.holds(p, id))
  await T.gotoWeek(p, W, WK1)
  await post(p, W, RANGER, D[17], 'p1')
  await plan(p, W, 18, 'p2')
  await asR(p, W)
  let b = await bell(p, W, 'p3'); W.rec('p3', 'Ranger bell after post + Sat 18', null, sayB(b), b.pic)
  await asS(p, W)
  await planSim(p, W, 19, 'oft', 'p4')
  await asR(p, W)
  b = await bell(p, W, 'p5'); W.rec('p5', 'Ranger bell after + Sun 19 OFT', null, sayB(b), b.pic)
  await asS(p, W)
  await unplan(p, W, 18, 'p6')
  await asR(p, W)
  b = await bell(p, W, 'p7'); W.rec('p7', 'Ranger bell after Sat 18 deleted', null, sayB(b), b.pic)
  await asS(p, W)
  await L.qualsTick(p, W, CASPER, 'p8')
  W.rec('p8', 'casper record after tick (read)', null, L.J(await T.rec(p, CASPER)))
  await L.signOut(p, W); await L.signIn(p, 'outlaw', 'x').catch(e => W.rec('p9e', 'outlaw sign-in', null, e.message))
  b = await bell(p, W, 'p9'); W.rec('p9', 'Casper (outlaw) bell after his SANS tick', null, sayB(b), b.pic)
}))
process.exit(0)
