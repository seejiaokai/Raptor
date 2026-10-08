import * as H from './cal-A-lib2.mjs'
const { tid, sleep, eq } = H
const SIZE = process.env.SIZE || 'desk'
const w = await H.world(SIZE)
const o = {}
const D = ['2026-07-20', '2026-07-21', '2026-07-22']
const RANGE = ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17', '2026-07-20', '2026-07-21', '2026-07-22', '2026-07-23']
const read = async () => { const r = {}; for (const d of RANGE) { const t = await H.warText(w, d); r[d.slice(8)] = t.reqP + '/' + t.reqW } return r }
await H.warOpen(w)
await H.typeReq(w, 'p', '2026-07-13', 8, { run: true })
await H.typeReq(w, 'w', '2026-07-13', 6, { run: true })
await H.typeReq(w, 'p', '2026-07-20', 10, { run: true })
o.afterRuns = await read()
await H.typeReq(w, 'p', '2026-07-21', 4)               // the one-day override
o.afterOverride = await read()
o.overrideFacts = (await H.bridge(w, '2026-07-21')).a
await H.warJump(w, '2026-07-21'); await H.cellIn(w, 'req-p-2026-07-21')
const p0 = await H.pic(w, 'p108-war-override')
await H.openSans(w); await H.sansGoto(w, '2026-07-20')
o.sansOverride = {}
for (const d of D) o.sansOverride[d] = await H.sansCell(w, d)
await H.sansOpen(w, '2026-07-21'); o.dayOverride = await H.sansDayRead(w)
const p1 = await H.pic(w, 'p108-sans-day-override')
await H.sansClose(w)
// clear the one-day override (an empty box)
await H.typeReq(w, 'p', '2026-07-21', '')
o.afterClear = await read()
o.clearFacts = (await H.bridge(w, '2026-07-21')).a
await H.warJump(w, '2026-07-21'); await H.cellIn(w, 'req-p-2026-07-21')
const p2 = await H.pic(w, 'p108-war-cleared')
await H.openSans(w); await H.sansGoto(w, '2026-07-20')
o.dayAfterClear = (await H.sansOpen(w, '2026-07-21'), await H.sansDayRead(w))
const p3 = await H.pic(w, 'p108-sans-day-cleared')
const wv = x => Object.keys(x).filter(k => k >= '13').map(k => x[k].split('/')[1])
H.judge('P1-08', `${SIZE}: P 8 and W 6 started on Mon 13 Jul, P 10 started on Mon 20 Jul (each "From <date> on"); P overridden to 4 on Tue 21 Jul for that day; then the override cleared by emptying the box`, [
  ['after the runs: P reads 8 on 13-17, 10 from the 20th; W reads 6 on every flying day', ['13', '14', '15', '16', '17'].every(k => o.afterRuns[k] === '8/6') && ['20', '21', '22', '23'].every(k => o.afterRuns[k] === '10/6'), o.afterRuns],
  ['after the override: 20, 21, 22 read P 10, 4, 10; W 6 throughout', o.afterOverride['20'] === '10/6' && o.afterOverride['21'] === '4/6' && o.afterOverride['22'] === '10/6' && o.afterOverride['23'] === '10/6', [o.afterOverride['20'], o.afterOverride['21'], o.afterOverride['22'], o.afterOverride['23']]],
  ['the override is the date\'s own (not the run): 21 Jul comes from "date"', o.overrideFacts.reqFrom.p === 'date' && o.overrideFacts.reqFrom.w === 'run', o.overrideFacts.reqFrom],
  ['SANS opened day for 21 Jul reads Required 4 and 6', eq(o.dayOverride.req, ['4', '6']), o.dayOverride.req],
  ['SANS month: 20 and 22 carry figures for a 10-pilot requirement, 21 for a 4', [o.sansOverride['2026-07-20'], o.sansOverride['2026-07-21'], o.sansOverride['2026-07-22']].every(c => /Still needed: \d+ pilots, \d+ WSOs/.test(c.label)), D.map(d => o.sansOverride[d].need)],
  ['clearing the override reveals P 10 on 21 Jul, W still 6', o.afterClear['21'] === '10/6' && o.clearFacts.reqFrom.p === 'run', [o.afterClear['21'], o.clearFacts.reqFrom]],
  ['Clear erased nothing else: every other date reads as it did before', RANGE.filter(d => d !== '2026-07-21').every(d => o.afterClear[d.slice(8)] === o.afterRuns[d.slice(8)]), o.afterClear],
  ['SANS opened day for 21 Jul after the clear reads Required 10 and 6', eq(o.dayAfterClear.req, ['10', '6']), o.dayAfterClear.req],
  ['no console or page errors', w.errors.length === 0, w.errors],
], [p0, p1, p2, p3])
H.savePart('P1-08-' + SIZE, { out: o })
await H.closeAll(w)
