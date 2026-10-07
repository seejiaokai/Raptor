/* walker C — S02 then S17 (one world): flight 10:00–11:15, no in-time (07:00–13:15, 375, FO); lead 180 → 150 and amended (07:30–13:15, HO);
   a half-day OIL take on the Leave War; Unpublish the AL (S02, RECORDED for the words); then keep lead 150, re-sign and reissue (S17). */
import * as C from './ows-C-lib.mjs'
const { S, L, W, LW, world, judge, row, pic, sleep, SAT } = C
const { browser, p, errors } = await world()
const di = C.SATI, M = 'bane'
await C.expiryForever(p)
const b0 = await C.oilOf(p, M, SAT, 'S02-0', { pics: false, sheet: false })
console.log('B0', b0.bal)
await L.go(p, 'editsched'); await sleep(400)
const w = await C.flyWave(p, di, { cs: 'VIPER', to: '10:00', ld: '11:15', p1: M })
const pub = await C.pubOrig(p, di)
const o1 = await C.oilOf(p, M, SAT, 'S02-1')
console.log('O1', C.say(o1))
await S.logicSet(p, 'reportLead', '2h30')
const dp = await C.dayState(p, di, 'S02-2')
const am = await C.pubAL(p, di)
const o2 = await C.oilOf(p, M, SAT, 'S02-2')
console.log('O2', C.say(o2))
judge('S02.a', 'Saturday flight VIPER 10:00–11:15, Ranger, no in-time; published ORIG; Logic lead 3h → 2h30; Publish AL', [
  ['ORIG: FO, tracker 07:00–13:15', o1.letters === 'FO' && /07:00.13:15/.test(o1.row) && pub.head.tag === 'ORIG', { cell: o1.cell.text, row: o1.row.slice(0, 160), bal: o1.bal }],
  ['the lead change read 1 pending before the amendment', C.pendOf(dp.head) === '1', dp.head.pending],
  ['AL1: HO, tracker 07:30–13:15, balance B+0.5', o2.letters === 'HO' && /07:30.13:15/.test(o2.row) && /AL\s*1/.test(am.head.tag), { cell: o2.cell.text, row: o2.row.slice(0, 160), bal: o2.bal, tag: am.head.tag }],
], [...o1.pics, ...dp.pics, ...o2.pics])

/* the half-day take, through the Leave War's own sheet (a day in the period, a weekday) */
const TAKE = '2026-07-20'
await LW.lwOpen(p, TAKE)
const t0 = await LW.tapCell(p, M, TAKE)
console.log('TAPPED', t0.open, (t0.text || '').slice(0, 200))
await pic(p, 'S02-3-takesheet')
await LW.sheetPress(p, 'portion-am')
const r = await LW.sheetPress(p, 'bid-OIL')
let s = await LW.sheetNow(p); console.log('AFTER OIL BID', s.open, (s.text || '').slice(0, 400))
if (s.open === 'bid-picker' && /again/i.test(s.text || '')) { await LW.sheetPress(p, 'bid-OIL'); s = await LW.sheetNow(p); console.log('SECOND PRESS', s.open, (s.text || '').slice(0, 300)) }
await pic(p, 'S02-3-takesheet-after')
await LW.closeSheets(p)
const o3 = await C.oilOf(p, M, TAKE, 'S02-3-take', { sheet: false })
const bTake = await C.oilOf(p, M, SAT, 'S02-3', { sheet: false })
console.log('TAKE cell', JSON.stringify(o3.cell), 'bal after take', bTake.bal, 'row', bTake.row.slice(0, 260))
row('S02.take', 'Leave War: Ranger, Mon 20 Jul, whole-day button AM then "OIL" (a half-day take)', `cell "${o3.cell.text}" · balance now ${bTake.bal} (was ${o2.bal}) · tracker "${bTake.row.slice(0, 260)}"`, 'RECORDED', o3.pics)

/* S02 action: Unpublish the AL */
const un = await C.unpublish(p, di)
console.log('UNPUB', JSON.stringify(un))
const o4 = await C.oilOf(p, M, SAT, 'S02-4')
const d4 = await C.dayState(p, di, 'S02-4')
console.log('O4', C.say(o4, d4))
const amd = await C.amendments(p)
row('S02.words', 'Edit Schedule Saturday: Unpublish pressed on the AL1 (twice if it armed); the words the app spoke', `button first "${un.first}", after first press "${un.afterFirst}", second press demanded ${un.second}; spoke on the first press: ${JSON.stringify(un.firstToasts)}; on the second: ${JSON.stringify(un.secondToasts)}`, 'RECORDED', [])
judge('S02.b', 'after Unpublish of the AL: the ORIGINAL pays again', [
  ['day tag back to ORIG', d4.head.tag === 'ORIG', d4.head.tag],
  ['Leave War cell FO', o4.letters === 'FO', o4.cell.text],
  ['tracker worked 07:00–13:15', /07:00.13:15/.test(o4.row), o4.row.slice(0, 200)],
  ['balance rises to 0.5 (the take already spent 0.5): was ' + bTake.bal, o4.bal === '0.5', { was: bTake.bal, now: o4.bal }],
], [...o4.pics, ...d4.pics])
console.log('D4', d4.head.pending, d4.list.slice(0, 400), '|', JSON.stringify(amd && amd.text).slice(0, 300))
row('S02.day', 'the Saturday after the withdrawal: pending chip, To go out words, Amendments box', `tag ${d4.head.tag} · chip "${d4.head.pending}" · signs [${d4.head.signs.join('|')}] · To go out: "${d4.list.slice(0, 500)}" · Amendments: "${amd && amd.text}"`, 'RECORDED', d4.pics)

/* S17: keep lead 150, re-sign, reissue the correction */
const lg = await C.logic(p)
const am2 = await C.pubAL(p, di)
const o5 = await C.oilOf(p, M, SAT, 'S17-1')
const d5 = await C.dayState(p, di, 'S17-1')
console.log('O5', C.say(o5, d5))
judge('S17', 'S02\'s fixture: AL withdrawn, ORIGINAL payable (above); lead kept at 150 (read: ' + lg.reportLead + '); re-sign and Publish AL again', [
  ['lead is still 150 minutes', lg.reportLead === 150, lg.reportLead],
  ['reissued as AL1', /AL\s*1/.test(am2.head.tag), am2.head.tag],
  ['cell HO, tracker 07:30–13:15 (not the old 07:00)', o5.letters === 'HO' && /07:30.13:15/.test(o5.row) && !/07:00/.test(o5.row), { cell: o5.cell.text, row: o5.row.slice(0, 200) }],
  ['ONE credit: balance = (after AL, before take) 0.5 − 0.5 take = 0', o5.bal === '0' && (o5.row.match(/AUTO/g) || []).length === 1, { bal: o5.bal, autos: (o5.row.match(/AUTO/g) || []).length }],
  ['nothing pending', C.pendOf(d5.head) === '0', d5.head.pending],
], [...o5.pics, ...d5.pics])
await C.finish(browser, errors, 'ows-C-s02')
