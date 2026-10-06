/* walker C — S01: duty 06:00–06:30 + flight 12:00–13:00 with IN TIME 10:00; the tracker prints BOTH worked periods; then debrief 150 and an amendment */
import * as C from './ows-C-lib.mjs'
const { S, L, W, world, judge, pic, sleep, SAT } = C
const { browser, p, errors } = await world()
const di = C.SATI
const out = {}
out.forever = await C.expiryForever(p)
const b0 = await C.oilOf(p, 'bane', SAT, 'S01-0-before', { pics: false })
console.log('B0', b0.bal, '|', b0.cell.text)
await L.go(p, 'editsched'); await sleep(400)
const duty = await C.dutyRow(p, di, 'Test desk', '06:00', '06:30', 'bane')
const w = await C.flyWave(p, di, { cs: 'VIPER', to: '12:00', ld: '13:00', p1: 'bane' })
const its = await C.inTime(p, di, w.wi, 'IN TIME 10:00')
const pre = await C.dayState(p, di, 'S01-1-pre', { list: false })
const pub = await C.pubOrig(p, di)
console.log('duty', JSON.stringify(duty), 'wave', JSON.stringify(w), 'its', JSON.stringify(its), 'pub', JSON.stringify(pub.head))
const o1 = await C.oilOf(p, 'bane', SAT, 'S01-1')
const d1 = await C.dayState(p, di, 'S01-1')
console.log('O1', C.say(o1, d1))
judge('S01.a', 'Saturday: duty desk row "Test desk" 06:00–06:30 (+ Row), flying wave VIPER 12:00–13:00 (+ Wave), "+ In-time / Rally" typed IN TIME 10:00, Ranger in both; four signed, Published', [
  ['seated in the duty row and the wave', duty.took === true && w.got[0] === 'bane', { duty: duty.took, got: w.got }],
  ['published as ORIG', pub.head && pub.head.tag === 'ORIG', pub.head && pub.head.tag],
  ['Leave War: a full day (FO), balance B+1', o1.letters === 'FO', { cell: o1.cell.text, b0: b0.bal, bal: o1.bal }],
  ['tracker prints BOTH worked periods 06:00–06:30 and 10:00–15:00', /06:00.06:30/.test(o1.row) && /10:00.15:00/.test(o1.row), o1.row.slice(0, 260)],
], o1.pics)
/* the day's sheet and the tracker agree */
console.log('SHEET1', JSON.stringify(o1.sheet))
const lg = await C.logic(p)
console.log('LOGIC', JSON.stringify(lg))
const set = await S.logicSet(p, 'debrief', '2h30')
const o2 = await C.oilOf(p, 'bane', SAT, 'S01-2')
const d2 = await C.dayState(p, di, 'S01-2')
console.log('O2', C.say(o2, d2))
judge('S01.b', 'Logic → Flight debrief after land 2h → 2h30 (paid record must hold)', [
  ['the value changed', set.after && /2h30|2h 30|150/.test(set.after), set],
  ['Leave War still FO and tracker still 06:00–06:30, 10:00–15:00 (not 15:30)', o2.letters === 'FO' && /10:00.15:00/.test(o2.row) && !/15:30/.test(o2.row), o2.row.slice(0, 260)],
  ['the day reads 1 pending', C.pendOf(d2.head) === '1', d2.head.pending],
  ['the four sign-offs fell', d2.signsEmpty, d2.head.signs],
  ['the To go out line names Debrief and Ranger 06:00–06:30, 10:00–15:00 → …15:30', /Flight debrief/i.test(d2.list) && /Ranger/.test(d2.list), d2.list.slice(0, 400)],
], [...o2.pics, ...d2.pics])
const am = await C.pubAL(p, di)
const o3 = await C.oilOf(p, 'bane', SAT, 'S01-3')
const d3 = await C.dayState(p, di, 'S01-3')
console.log('O3', C.say(o3, d3))
judge('S01.c', 'sign again and publish the amendment (Publish AL)', [
  ['went out as AL1', am.head && /AL\s*1/.test(am.head.tag), am.head && am.head.tag],
  ['Leave War still FO', o3.letters === 'FO', o3.cell.text],
  ['tracker prints 06:00–06:30 and 10:00–15:30', /06:00.06:30/.test(o3.row) && /10:00.15:30/.test(o3.row), o3.row.slice(0, 260)],
  ['balance still B+1 (no second credit)', o3.bal === o1.bal, { o1: o1.bal, o3: o3.bal }],
  ['nothing pending', C.pendOf(d3.head) === '0', d3.head.pending],
], [...o3.pics, ...d3.pics])
await C.finish(browser, errors, 'ows-C-s01')
