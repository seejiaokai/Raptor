/* walker E — E10 and E11 (continuing): an SC shift re-timed 01:00–07:00 with B 23:00 (the evening before), then a Logic change */
import * as E from './ows-E-lib.mjs'
const { world, sleep, A, R, W, L, P, judge, row, say, look, sum, setB, lineOf, scWave, oilOf, SAT, SATI, FRII } = E
const K = E.R   /* stk-B-lib's ff is re-exported by rbl-D-lib */
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)

/* ---------- E10 ---------- */
const w = await scWave(p, SAT, 0, 'bane')
await K.ff(p, SAT, w.gi, 0, 'to', '01:00')
await K.ff(p, SAT, w.gi, 0, 'ld', '07:00')
const held = await setB(p, SAT, w.gi, 0, '23:00')
const lineA = await lineOf(p, SAT, w.gi, 0)
const pub = await A.publishNew(p, SAT); await A.closeBoard(p)
const e10 = await look(p, 'bane', SATI, SAT, 'E10')
const fri = await oilOf(p, 'bane', FRII, 'E10-fri')
say('E10', lineA, sum(e10), 'FRIDAY cell', JSON.stringify(fri.cell), 'tracker', fri.row.slice(0, 200))
judge('E10', 'Saturday SC; AM shift re-timed 01:00–07:00 (start / end boxes), B 23:00, Ranger first MAIN; four sign-offs, Publish', [
  ['line as typed', /01:00-07:00 B "23:00"/.test(lineA) && w.took === true && held.stored === '23:00', lineA],
  ['published ORIG', pub.head && pub.head.tag === 'ORIG', pub.head && pub.head.tag],
  ['Saturday Leave War FO', e10.cell === 'FO', e10.cellText],
  ['tracker worked 00:00–07:00', e10.times.join(',') === '00:00–07:00', e10.times],
  ['Friday 17 Jul: nothing for Ranger (cell empty, no 17 Jul in the tracker)', fri.letters === '(empty)' && !/17 Jul/.test(fri.row), { cell: fri.cell, row: fri.row.slice(0, 160) }],
], [...e10.pics, ...fri.pics])

/* ---------- E11 ---------- */
const set1 = await E.A.logicSet(p, 'reportLead', '0h30')
const lg1 = await E.A.logicGet(p)
const pLg = await P(p, 'E11-logic-0h30')
const e11a = await look(p, 'bane', SATI, SAT, 'E11-0h30')
say('E11 a', set1, JSON.stringify(lg1), sum(e11a))
row('E11.box', 'RECORD what the Logic box accepted when typed 0h30 (Edit rules → Nominal report before T/O)', `box reads "${set1}", the stored value ${lg1.reportLead} minutes, text "${lg1.reportText}"`, 'RECORDED', [pLg])
judge('E11.a', 'Logic: Nominal report before T/O 3h → 0h30; back to Saturday and the Leave War (day was published with its four sign-offs empty)', [
  ['Leave War holds FO', e11a.cell === 'FO', e11a.cellText],
  ['tracker holds 00:00–07:00', e11a.times.join(',') === '00:00–07:00', e11a.times],
  ['the Saturday reads 1 pending', e11a.pend === '1', e11a.pendTxt],
  ['four sign-offs empty', e11a.signs === 'all four empty', e11a.signs],
  ['To go out carries "OIL on this day · Logic values changed since it was published"', /OIL on this day/.test(e11a.list) && /Logic values changed since it was published/.test(e11a.list), e11a.list.slice(0, 400)],
  ['…names the value and Ranger', /Nominal report before T\/O/.test(e11a.list) && /Ranger/.test(e11a.list), e11a.list.slice(0, 400)],
], e11a.pics)
row('E11.list', 'RECORD the To go out words (0h30)', e11a.list, 'RECORDED', e11a.pics)

/* put the value back, signs not signed */
const set2 = await E.A.logicSet(p, 'reportLead', '3h')
const e11b = await look(p, 'bane', SATI, SAT, 'E11-back-unsigned')
say('E11 b', set2, sum(e11b))
judge('E11.b', 'value back to 3h (sign-offs were never signed since the publish)', [
  ['pending clears', e11b.pend === '0', e11b.pendTxt],
  ['Leave War FO, 00:00–07:00', e11b.cell === 'FO' && e11b.times.join(',') === '00:00–07:00', { c: e11b.cell, t: e11b.times }],
  ['sign-offs: still empty (nothing to return)', e11b.signs === 'all four empty', e11b.signs],
], e11b.pics)

/* sign the four on the published day, then change the value again: the sign-offs must fall and return */
await A.toBoard(p, SAT)
const sg = await W.signDay(p, SAT)
const hs = await W.head(p, SAT); await A.closeBoard(p)
const e11c = await look(p, 'bane', SATI, SAT, 'E11-signed')
say('E11 c signed', JSON.stringify(sg), sum(e11c))
const set3 = await E.A.logicSet(p, 'reportLead', '0h30')
const e11d = await look(p, 'bane', SATI, SAT, 'E11-signed-0h30')
say('E11 d', set3, sum(e11d))
const set4 = await E.A.logicSet(p, 'reportLead', '3h')
const e11e = await look(p, 'bane', SATI, SAT, 'E11-signed-back')
say('E11 e', set4, sum(e11e))
judge('E11.c', 'I SIGNED the four on the published Saturday first (nothing pending), then 3h → 0h30, then back to 3h', [
  ['signed: four standing, nothing pending', e11c.signs === 'all four standing' && e11c.pend === '0', { signs: e11c.signs, pend: e11c.pendTxt, picked: sg }],
  ['0h30: 1 pending, sign-offs fell', e11d.pend === '1' && e11d.signs === 'all four empty', { pend: e11d.pendTxt, signs: e11d.signs }],
  ['0h30: Leave War holds FO 00:00–07:00', e11d.cell === 'FO' && e11d.times.join(',') === '00:00–07:00', { c: e11d.cell, t: e11d.times }],
  ['back to 3h: pending clears, sign-offs return', e11e.pend === '0' && e11e.signs === 'all four standing', { pend: e11e.pendTxt, signs: e11e.signs }],
], [...e11c.pics, ...e11d.pics, ...e11e.pics])
const errs = E.cleanErr(errors)
console.log('ERRORS', JSON.stringify(errs))
A.savePart('ows-E-s4', { errors: errs, pics: E.pics.saved })
await browser.close()
