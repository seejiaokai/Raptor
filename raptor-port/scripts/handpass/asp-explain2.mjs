// The comparison picture for his question of 22 Nov 26 ("he shouldn't be automatically in all available"): Hex posted
// out as SANS from Wed 15 Jul and NOT planned on Sat 18 Jul — Saturday holds only an ALL AVAIL event. Read: is he in the
// event's crowd, "+ SANS" off / on / off again. Desktop only. Run from raptor-port/ on a served build:
//   W2_URL=http://localhost:4393/ W2_OUT=docs/img/handpass/2026-11-22-allavail-sans-posted/explain node scripts/handpass/asp-explain2.mjs
import * as L from './asp-w2-lib.mjs'
const { J, HEX, brief } = L
const SAT = 5
const sz = L.SIZES.d, W = L.mk('n', sz)
const { b, p } = await L.world(sz, W)
try {
  await L.signIn(p, 'ad', 'a')
  console.log('today', await L.today(p))
  const po = await L.postOut(p, W, HEX, '2026-07-15', 'n-01')
  console.log('posting', J({ line: po.line, after: po.after }))
  await L.openBoard(p, W, SAT)
  const a = await L.progRow(p, W, SAT, 'SQN EVENT', '10:00', '17:00')
  console.log('event', J(a.row))
  await L.closeBoard(p, W)
  const rs = await L.bothWays(p, W, SAT, a.row.rid, 'n-03')
  rs.forEach((r, i) => console.log(['off', 'on', 'off2'][i], brief(r), r.pic))
} catch (e) {
  console.log('ERR', String(e && e.message || e).slice(0, 400), await W.pic(p, 'ERR').catch(() => ''))
}
console.log('errors', W.errs.length, W.errs.slice(0, 5).join(' || '))
await b.close()
