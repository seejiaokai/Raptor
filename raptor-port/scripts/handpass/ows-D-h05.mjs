/* H-05 — OIL Earn mode on the WORKING copy of a published Saturday after a Logic change (S08's fixture) */
import * as D from './ows-D-lib.mjs'
import * as F from './ows-D-fix.mjs'
const { world, sleep, A, R, W, L, P, judge, pend, ISO } = D
const SAT = 5
const log = (...a) => console.log('>>', ...a)
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(300)
const w = await D.flyingWave(p, SAT, { cs: 'VIPER', to: '10:00', ld: '11:15', p1: 'bane' })
const pub = await A.publishNew(p, SAT); await A.closeBoard(p)
const o0 = await D.oilOf(p, 'bane', ISO[SAT], 'H05-orig')
const set = await A.logicSet(p, 'reportLead', '2h30')
const d1 = await D.dayState(p, SAT, 'H05-logic')
/* the mode on the working copy */
await A.toBoard(p, SAT); await D.oilMode(p, true)
const key = await F.itemKey(p, 'VIPER')
const fig1 = await F.figOf(p, 'bane')
const picMode = await P(p, 'H05-mode-working')
/* the published face (View-only Sched) */
await D.oilMode(p, false); await A.closeBoard(p)
const face1 = await D.face(p, SAT, 'bane')
/* switch him off, then on again, reading To go out each time */
await A.toBoard(p, SAT); await D.oilMode(p, true)
const t1 = await F.tapPuck(p, 'bane', key)
const fig2 = await F.figOf(p, 'bane')
await D.oilMode(p, false); await A.closeBoard(p)
const dOff = await D.dayState(p, SAT, 'H05-off')
await A.toBoard(p, SAT); await D.oilMode(p, true)
const t2 = await F.tapPuck(p, 'bane', key)
const fig3 = await F.figOf(p, 'bane')
await D.oilMode(p, false); await A.closeBoard(p)
const dOn = await D.dayState(p, SAT, 'H05-on-again')
const o1 = await D.oilOf(p, 'bane', ISO[SAT], 'H05-after')
const hasDec = s => /What this day earns/i.test(s), hasLogic = s => /Logic values changed/.test(s)
judge('H-05', 'S08 fixture (Ranger, flight 10:00–11:15, no in-time) published = FO 07:00–13:15; Logic "Nominal report before T/O" 3h → 2h30; OIL Earn on the WORKING copy; the published face in View-only Sched; his puck off and on again', [
  ['published FO 07:00–13:15', o0.letters === 'FO' && /07:00.13:15/.test(o0.row), `${o0.cell.text} | ${o0.row.slice(0, 140)}`],
  ['the Logic change reads pending with the man named full day → half day', pend(d1.head) === '1' && /full day/.test(d1.list) && /half day/.test(d1.list), { chip: d1.head.pending, list: d1.list.slice(0, 260) }],
  ['OIL Earn on the working copy: his figure is HO (what WOULD go out)', /HO/.test(fig1.join(' ')) && !/FO/.test(fig1.join(' ')), fig1],
  ['View-only Sched: the published face still wears the FULL-day (FO) edge', (face1.pucks || []).some(x => /fo/.test(x)) && !(face1.pucks || []).some(x => /ho/.test(x)), face1],
  ['him off: the To go out list has the What-this-day-earns line AND the Logic line', hasDec(dOff.list) && hasLogic(dOff.list), dOff.list.slice(0, 340)],
  ['him back on: the Logic line stands alone (the earns line is gone)', !hasDec(dOn.list) && hasLogic(dOn.list), dOn.list.slice(0, 340)],
  ['the published credit never moved (FO 07:00–13:15)', o1.letters === 'FO' && /07:00.13:15/.test(o1.row), `${o1.cell.text} | ${o1.row.slice(0, 140)}`],
], [picMode, face1.pic, ...d1.pics, ...dOff.pics, ...dOn.pics, ...o1.pics])
log('figures: working', JSON.stringify(fig1), '| him off', JSON.stringify(fig2), t1, '| back on', JSON.stringify(fig3), t2)
log('To go out while off:', dOff.list.slice(0, 400), '| back on:', dOn.list.slice(0, 400))
console.log('ERRORS', JSON.stringify(D.cleanErr(errors)))
D.savePart('ows-D-h05', { errors: D.cleanErr(errors), pics: D.pics.saved })
await browser.close()
