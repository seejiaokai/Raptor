/* walker A — S08 (W1 reproduced) + H-01 (Undo / Redo / Reset of a Logic change). Desktop or phone (HP_PHONE=1). */
import * as A from './ows-A-lib.mjs'
const { signFell, signStand, world, judge, row, savePart, pic, sleep, W, S, oilOf, dayState, faceOf, lgRead, satLine, logicSet, logicReset, undo, redo, signsWords, say, spansOf } = A
const PH = !!process.env.HP_PHONE
const T = PH ? 'S08ph' : 'S08'
const { browser, p, errors } = await world()
const SAT = 5

const w = await satLine(p)
const pub = await A.publishNew(p, SAT); await A.closeBoard(p)
const o0 = await oilOf(p, 'bane', A.SAT, T + '-a')
const d0 = await dayState(p, SAT, T + '-a')
judge(T + '.1', 'Ranger on Saturday VIPER 10:00–11:15, no in-time; four signed; published', [
  ['seated', w.got[0] === 'bane', w.got],
  ['ORIG', pub.head && pub.head.tag === 'ORIG', pub.head && pub.head.tag],
  ['cell FO', o0.letters === 'FO', o0.cell.text],
  ['worked 07:00–13:15', spansOf(o0.row).includes('07:00–13:15'), o0.row.slice(0, 160)],
  ['nothing pending', d0.pend === '0', d0.head.pending],
  ['four sign-offs standing (no Not-yet-signed chip)', signStand(d0.head), signsWords(d0.head)],
], [...o0.pics, ...d0.pics])
console.log('S08.1 detail', say(o0, d0))

const set = await logicSet(p, 'reportLead', '2h30')
const lg = await lgRead(p)
const picLg = await pic(p, T + '-b-logic')
const d1 = await dayState(p, SAT, T + '-b')
const o1 = await oilOf(p, 'bane', A.SAT, T + '-b')
const f1 = await faceOf(p, SAT, 'bane', T + '-b')
const al1 = d1.al
judge(T + '.2', 'Logic: Nominal report before T/O 3h → 2h30 (Edit rules → box → Tab); then Saturday, the Leave War, View-only Sched', [
  ['value is 2h30 (150)', lg.lead === 150, { set, lg }],
  ['cell still FO', o1.letters === 'FO', o1.cell.text],
  ['worked still 07:00–13:15', spansOf(o1.row).includes('07:00–13:15'), o1.row.slice(0, 160)],
  ['balance unmoved', o1.bal === o0.bal, [o0.bal, o1.bal]],
  ['1 pending', d1.pend === '1', d1.head.pending],
  ['sign-offs fell (Not yet signed chip)', signFell(d1.head), signsWords(d1.head)],
  ['list: OIL on this day · Logic values changed since it was published', /OIL on this day/.test(d1.list) && /Logic values changed since it was published/.test(d1.list), d1.list.slice(0, 200)],
  ['sub-line Logic · Nominal report before T/O 3h → 2h30', /Nominal report before T\/O\s+3h\s*→\s*2h30/.test(d1.list), d1.list.slice(0, 400)],
  ['man line Ranger · OIL full day · 07:00–13:15 → half day · 07:30–13:15', /Ranger/.test(d1.list) && /full day/.test(d1.list) && /07:00.13:15/.test(d1.list) && /half day/.test(d1.list) && /07:30.13:15/.test(d1.list), d1.list.slice(0, 400)],
  ['published face keeps FO green edge', f1.edge === 'FO edge', f1.face],
], [picLg, ...d1.pics, ...o1.pics, f1.pic])
console.log('S08.2 detail', say(o1, d1), '| al:', al1, '| face', JSON.stringify(f1.face))

await logicSet(p, 'reportLead', '3h')
const lg2 = await lgRead(p)
const d2 = await dayState(p, SAT, T + '-c')
const o2 = await oilOf(p, 'bane', A.SAT, T + '-c')
judge(T + '.3', 'Logic put back 2h30 → 3h', [
  ['value 3h (180)', lg2.lead === 180, lg2],
  ['nothing pending, list cleared', d2.pend === '0' && !d2.list, { chip: d2.head.pending, list: d2.list }],
  ['four sign-offs stand again', signStand(d2.head), signsWords(d2.head)],
  ['cell FO, 07:00–13:15, balance same', o2.letters === 'FO' && spansOf(o2.row).includes('07:00–13:15') && o2.bal === o0.bal, say(o2)],
], [...d2.pics, ...o2.pics])
console.log('S08.3 detail', say(o2, d2))

/* ---- H-01: Undo / Redo of a Logic change through the top bar ---- */
await logicSet(p, 'reportLead', '2h30')
const d3 = await dayState(p, SAT, 'H01-a', { list: false })
await A.L.go(p, 'logic'); await sleep(400)
const picLgA = await pic(p, 'H01-b-logic-before-undo')
const u = await undo(p)
await sleep(500)
const lgU = await lgRead(p)
const picLgU = await pic(p, 'H01-c-after-undo')
const dU = await dayState(p, SAT, 'H01-c')
judge('H-01.1', 'lead 3h → 2h30 (pending), then the top bar\'s Undo', [
  ['before Undo: 1 pending', d3.pend === '1', d3.head.pending],
  ['Undo was pressable', !!(u && u.pressed), u],
  ['value is 3h again', lgU.lead === 180, lgU],
  ['nothing pending', dU.pend === '0', dU.head.pending],
  ['sign-offs back', signStand(dU.head), signsWords(dU.head)],
], [picLgA, picLgU, ...dU.pics])
console.log('H-01.1 detail', JSON.stringify({ u, lgU, pend: dU.pend, signs: signsWords(dU.head) }))
const r = await redo(p)
await sleep(500)
const lgR = await lgRead(p)
const dR = await dayState(p, SAT, 'H01-d')
judge('H-01.2', 'the top bar\'s Redo', [
  ['Redo pressable', !!(r && r.pressed), r],
  ['value 2h30 again', lgR.lead === 150, lgR],
  ['1 pending again', dR.pend === '1', dR.head.pending],
  ['sign-offs fell', signFell(dR.head), signsWords(dR.head)],
], dR.pics)
console.log('H-01.2 detail', JSON.stringify({ r, lgR, pend: dR.pend, list: dR.list.slice(0, 200) }))
/* Reset to standard */
const rs = await logicReset(p)
const lgS = await lgRead(p)
const picRs = await pic(p, 'H01-e-after-reset')
const dS = await dayState(p, SAT, 'H01-e')
judge('H-01.3', 'Logic page "Reset to standard" after the change', [
  ['Reset pressed', /pressed/.test(rs), rs],
  ['values 180/120/361', lgS.lead === 180 && lgS.debrief === 120 && lgS.full === 361, lgS],
  ['nothing pending, sign-offs stand', dS.pend === '0' && signStand(dS.head), { pend: dS.head.pending, signs: signsWords(dS.head) }],
], [picRs, ...dS.pics])
console.log('H-01.3 detail', JSON.stringify({ rs, lgS, pend: dS.pend, signs: signsWords(dS.head) }))
console.log('ERRORS', JSON.stringify(errors))
savePart(T, { errors })
await browser.close()
