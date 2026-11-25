// w9 probe — a lead from the walk (to check, not a finding): S6's set-up gave Ranger the line "You're SANS from Fri 17 Jul.
// You're planned on Thu 23 Jul with nothing filed." but S7's set-up (filings on Fri 17 and Mon 20 only) gave none, though Thu
// 23 (his MEETING) is unfiled in both. Read his bell after each step of S7's set-up, desktop, real controls only.
import './sah-w9-env.mjs'
const X = await import('./sah-w9-lib.mjs')
const { L, J, R } = X
console.log('sah-w9-probe v2')
const sz = L.SIZES.d, W = L.mk('probe', sz)
const { b, p } = await L.world(sz, W)
await L.signIn(p, 'ad', 'a')
const bell = async tag => { const r = await X.bellRead(p, W, tag); console.log(tag, X.bellWords(r)) }
const po = await L.postOut(p, W, R, '2026-07-17', 'pr-po'); console.log('po', po.line)
await bell('p1-after-post')
await X.W6.gotoWeek(p, W, '2026-07-20'); console.log('week now', await p.evaluate(() => window.CURWEEK))
await bell('p1b-after-week20-opened')
if (process.env.SHORT) {
  const wv = await X.wave(p, W, '2026-07-21', 'AB1', '13:00', '14:30'); console.log('wave on Tue 21', J(wv.f))
  await L.closeBoard(p, W)
  await bell('p1c-after-an-edit-in-week20')
  await b.close(); process.exit(0)
}
const f1 = await X.file(p, W, '2026-07-17', null, ['oft'], ['09:00', '10:00'], 'probe Fri', 'pr-f1'); console.log('f17', J(f1.rec))
await bell('p2-after-17')
const f2 = await X.file(p, W, '2026-07-20', null, ['fly'], 'all', 'probe Mon', 'pr-f2'); console.log('f20', J(f2.rec))
await bell('p3-after-20')
const f3 = await X.file(p, W, '2026-07-21', null, ['fly'], 'all', 'probe Tue', 'pr-f3'); console.log('f21', J(f3.rec))
await bell('p4-after-21')
await b.close()
