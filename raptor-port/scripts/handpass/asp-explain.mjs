// The picture for question (p) of [FABLE-READ-FAULTS] (chat 141, 22 Nov 26): a SANS posting dated AHEAD. Hex is posted
// out as SANS from Fri 17 Jul while today is Wed 15 Jul, named on Sat 18 Jul's briefing, and Saturday holds an ALL AVAIL
// event. Read: is he in the event's crowd, "+ SANS" off / on / off again. Desktop only — the picture is for a question.
// Run from raptor-port/ on a served build:
//   W2_URL=http://localhost:4393/ W2_OUT=docs/img/handpass/2026-11-22-allavail-sans-posted/explain node scripts/handpass/asp-explain.mjs
import * as L from './asp-w2-lib.mjs'
const { J, HEX, brief } = L
const SAT = 5
const sz = L.SIZES.d, W = L.mk('p', sz)
const { b, p } = await L.world(sz, W)
try {
  await L.signIn(p, 'ad', 'a')
  console.log('today', await L.today(p))
  const po = await L.postOut(p, W, HEX, '2026-07-17', 'p-01')
  console.log('posting', J({ line: po.line, after: po.after, pic: po.pic }))
  const f = await L.mainFixture(p, W, SAT)
  console.log('fixture', f.ok, J({ g: f.g.row, a: f.a.row }))
  await L.closeBoard(p, W)
  const rs = await L.bothWays(p, W, SAT, f.a.row.rid, 'p-03')
  rs.forEach((r, i) => console.log(['off', 'on', 'off2'][i], brief(r), r.pic))
  console.log('lw', J(await L.lwCell(p, W, HEX, '2026-07-18').catch(e => String(e))))
} catch (e) {
  console.log('ERR', String(e && e.message || e).slice(0, 400), await W.pic(p, 'ERR').catch(() => ''))
}
console.log('errors', W.errs.length, W.errs.slice(0, 5).join(' || '))
await b.close()
