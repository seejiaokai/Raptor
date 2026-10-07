/* walker C — S05: off-screen week and second demo week. A flight 10:00–11:15 (no in-time) published on Sat 18 Jul (Ranger) and Sat 25 Jul (Saber);
   the lead 180 → 150 changed while the SECOND week is on screen; both weeks revisited and reloaded; then ONLY 25 July is amended. */
import * as C from './ows-C-lib.mjs'
const { S, L, W, world, judge, pic, sleep, SAT } = C
const SAT2 = '2026-07-25'
const { browser, p, errors } = await world()
const di = C.SATI
await C.expiryForever(p)
async function gotoWeek(wk) {
  await W.boardOff(p).catch(() => {})
  if ((await p.evaluate(() => window.CURPAGE)) !== 'editsched') await L.go(p, 'editsched')
  await p.locator(`#weekSegE [data-wk="${wk}"]:visible`).first().click(); await sleep(900)
  return p.evaluate(() => (document.querySelector('#weekSegE .on') || {}).innerText || '?')
}
const wk1 = await gotoWeek('13/07/2026')
const w1 = await C.flyWave(p, di, { cs: 'VIPER', to: '10:00', ld: '11:15', p1: 'bane' })
const pub1 = await C.pubOrig(p, di)
const wk2 = await gotoWeek('20/07/2026')
const w2 = await C.flyWave(p, di, { cs: 'COBRA', to: '10:00', ld: '11:15', p1: 'stiff' })
const pub2 = await C.pubOrig(p, di)
const a1 = await C.oilOf(p, 'bane', SAT, 'S05-1-18Jul')
const a2 = await C.oilOf(p, 'stiff', SAT2, 'S05-1-25Jul')
console.log('A1', C.say(a1)); console.log('A2', C.say(a2))
judge('S05.a', 'two weeks: Sat 18 Jul flight 10:00–11:15 (Ranger) and Sat 25 Jul flight 10:00–11:15 (Saber), no in-time, each signed and published', [
  ['week 1 / 2 selected', true, { wk1, wk2 }],
  ['both seated and ORIG', w1.got[0] === 'bane' && w2.got[0] === 'stiff' && pub1.head.tag === 'ORIG' && pub2.head.tag === 'ORIG', { got: [w1.got, w2.got], tags: [pub1.head.tag, pub2.head.tag] }],
  ['18 Jul: FO, 07:00–13:15', a1.letters === 'FO' && /07:00.13:15/.test(a1.row), { cell: a1.cell.text, row: a1.row.slice(0, 200), bal: a1.bal }],
  ['25 Jul: FO, 07:00–13:15 (a covered date)', a2.letters === 'FO' && /07:00.13:15/.test(a2.row), { cell: a2.cell.text, row: a2.row.slice(0, 200), bal: a2.bal }],
], [...a1.pics, ...a2.pics])

/* the lead changes while the SECOND week is on screen */
await gotoWeek('20/07/2026')
const set = await S.logicSet(p, 'reportLead', '2h30')
console.log('SET', set)
async function both(tag) {
  const out = {}
  await gotoWeek('20/07/2026'); out.d2 = await C.dayState(p, di, tag + '-wk2')
  await gotoWeek('13/07/2026'); out.d1 = await C.dayState(p, di, tag + '-wk1')
  out.o1 = await C.oilOf(p, 'bane', SAT, tag + '-18Jul')
  out.o2 = await C.oilOf(p, 'stiff', SAT2, tag + '-25Jul')
  return out
}
const b = await both('S05-2')
console.log('B d1', b.d1.head.pending, b.d1.list.slice(0, 300)); console.log('B d2', b.d2.head.pending, b.d2.list.slice(0, 300))
judge('S05.b', 'Logic "Nominal report before T/O" 3h → 2h30 while week 2 is on screen; then each week and the Leave War looked at', [
  ['paid 18 Jul holds FO 07:00–13:15', b.o1.letters === 'FO' && /07:00.13:15/.test(b.o1.row), { cell: b.o1.cell.text, row: b.o1.row.slice(0, 200), bal: b.o1.bal }],
  ['paid 25 Jul holds FO 07:00–13:15', b.o2.letters === 'FO' && /07:00.13:15/.test(b.o2.row), { cell: b.o2.cell.text, row: b.o2.row.slice(0, 200), bal: b.o2.bal }],
  ['week 2 Sat reads 1 pending, signs fell, the line names Saber full day 07:00–13:15 → half day 07:30–13:15', C.pendOf(b.d2.head) === '1' && b.d2.signsEmpty && /Saber/.test(b.d2.list) && /half day/.test(b.d2.list) && /07:30.13:15/.test(b.d2.list), { chip: b.d2.head.pending, signs: b.d2.head.signs, list: b.d2.list.slice(0, 420) }],
  ['week 1 Sat (off screen when changed) reads 1 pending too, line names Ranger', C.pendOf(b.d1.head) === '1' && b.d1.signsEmpty && /Ranger/.test(b.d1.list) && /half day/.test(b.d1.list) && /07:30.13:15/.test(b.d1.list), { chip: b.d1.head.pending, signs: b.d1.head.signs, list: b.d1.list.slice(0, 420) }],
], [...b.o1.pics, ...b.o2.pics, ...b.d1.pics, ...b.d2.pics])

/* reload and revisit both */
await C.reloadAs(p, 'a'); await sleep(600)
const c = await both('S05-3')
console.log('C d1', c.d1.head.pending); console.log('C d2', c.d2.head.pending)
judge('S05.c', 'a reload, signed in again, both weeks and the Leave War revisited', [
  ['paid 18 Jul holds FO 07:00–13:15', c.o1.letters === 'FO' && /07:00.13:15/.test(c.o1.row), { cell: c.o1.cell.text, row: c.o1.row.slice(0, 200), bal: c.o1.bal }],
  ['paid 25 Jul holds FO 07:00–13:15', c.o2.letters === 'FO' && /07:00.13:15/.test(c.o2.row), { cell: c.o2.cell.text, row: c.o2.row.slice(0, 200), bal: c.o2.bal }],
  ['each day still reads 1 pending with its own line', C.pendOf(c.d1.head) === '1' && C.pendOf(c.d2.head) === '1' && /Ranger/.test(c.d1.list) && /Saber/.test(c.d2.list), { d1: c.d1.head.pending, d2: c.d2.head.pending }],
], [...c.o1.pics, ...c.o2.pics, ...c.d1.pics, ...c.d2.pics])

/* amend ONLY 25 July */
await gotoWeek('20/07/2026')
const am = await C.pubAL(p, di)
const d = await both('S05-4')
console.log('D d1', d.d1.head.pending, d.d1.head.tag); console.log('D d2', d.d2.head.pending, d.d2.head.tag)
judge('S05.d', 'amend only Sat 25 Jul (sign, Publish AL)', [
  ['25 Jul went out AL1', am.head && /AL\s*1/.test(am.head.tag), am.head && am.head.tag],
  ['25 Jul: HO, 07:30–13:15, nothing pending', d.o2.letters === 'HO' && /07:30.13:15/.test(d.o2.row) && C.pendOf(d.d2.head) === '0', { cell: d.o2.cell.text, row: d.o2.row.slice(0, 200), bal: d.o2.bal, chip: d.d2.head.pending }],
  ['18 Jul untouched: FO 07:00–13:15, tag ORIG, still 1 pending', d.o1.letters === 'FO' && /07:00.13:15/.test(d.o1.row) && d.d1.head.tag === 'ORIG' && C.pendOf(d.d1.head) === '1', { cell: d.o1.cell.text, row: d.o1.row.slice(0, 200), tag: d.d1.head.tag, chip: d.d1.head.pending }],
], [...d.o1.pics, ...d.o2.pics, ...d.d1.pics, ...d.d2.pics])
await C.finish(browser, errors, 'ows-C-s05')
