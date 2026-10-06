/* S35 — SC MAIN 07:00–13:00: its typed B does not become its OIL start, nor does the flight padding */
import * as D from './ows-D-lib.mjs'
const { world, sleep, A, R, W, L, P, judge, oilOf, dayState, pend, SAT, ISO } = D
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)
const sc = await R.addStandby(p, SAT, 'sc')
const s1 = await R.seat(p, SAT, sc.gi, 0, 0, 'p', 'bane')
const fx = await p.evaluate(i => { const f = window.DAYS[i].waves[0].formations[0]; return `${f.cs} ${f.to}-${f.ld} br "${f.br}" p "${f.aircraft[0].p}"` }, SAT)
const pub = await A.publishNew(p, SAT); await A.closeBoard(p)
const o1 = await oilOf(p, 'bane', ISO[SAT], 'S35-pub')
judge('S35.1', 'SC wave through + Wave → SC; Ranger seated on the first (MAIN) jet 07:00–13:00 through the crew list; four sign-offs, Publish day', [
  ['seated', s1.took, fx],
  ['published ORIG', pub.head && pub.head.tag === 'ORIG', pub.head && pub.head.tag],
  ['Leave War cell HO', o1.letters === 'HO', o1.cell.text],
  ['tracker worked 07:00–13:00', /07:00.13:00/.test(o1.row), o1.row.slice(0, 220)],
], o1.pics)
const base = o1.bal

async function setBrief(v) {
  await A.toBoard(p, SAT)
  await W.boardText(p, `ff:${SAT}.0.0.br`, v)
  await A.closeBoard(p)
}
for (const v of ['06:00', '08:00']) {
  await setBrief(v)
  const brv = await p.evaluate(i => window.DAYS[i].waves[0].formations[0].br, SAT)
  const d = await dayState(p, SAT, 'S35-B' + v.slice(0, 2))
  const o = await oilOf(p, 'bane', ISO[SAT], 'S35-B' + v.slice(0, 2))
  judge('S35.B' + v.slice(0, 2), `typed the SC line's B box ${v} on the working copy of the published day`, [
    ['the box holds ' + v, brv === v, brv],
    ['Leave War still HO', o.letters === 'HO', o.cell.text],
    ['tracker still worked 07:00–13:00', /07:00.13:00/.test(o.row), o.row.slice(0, 220)],
    ['balance unchanged', o.bal === base, { was: base, now: o.bal }],
    ['no "OIL on this day" line in To go out', !/OIL on this day/.test(d.list), d.list.slice(0, 300)],
  ], [...d.pics, ...o.pics])
  console.log(`   pending chip "${d.head.pending}" list "${d.list.slice(0, 250)}"`)
}
/* now Logic lead and debrief */
await D.A.logicSet(p, 'reportLead', '2h30')
await A.logicSet(p, 'debrief', '2h30')
const lg = await A.logicGet(p)
const d3 = await dayState(p, SAT, 'S35-logic')
const o3 = await oilOf(p, 'bane', ISO[SAT], 'S35-logic')
judge('S35.L', 'Logic: Nominal report before T/O 3h → 2h30 and Flight debrief after land 2h → 2h30 (the SC line is on the day, B typed 08:00)', [
  ['values changed', lg.reportLead === 150 && lg.debrief === 150, lg],
  ['Leave War still HO', o3.letters === 'HO', o3.cell.text],
  ['tracker still worked 07:00–13:00', /07:00.13:00/.test(o3.row), o3.row.slice(0, 220)],
  ['balance unchanged', o3.bal === base, { was: base, now: o3.bal }],
  ['no "OIL on this day" line (no OIL-record change)', !/OIL on this day/.test(d3.list), d3.list.slice(0, 300)],
], [...d3.pics, ...o3.pics])
console.log(`   pending chip "${d3.head.pending}" signs ${D.signsOf(d3.head)} list "${d3.list.slice(0, 300)}"`)

/* amendment: the SC man still earns the written 07:00–13:00 */
const am = await A.publishAm(p, SAT); await A.closeBoard(p)
const o4 = await oilOf(p, 'bane', ISO[SAT], 'S35-al')
judge('S35.AL', 'the four sign again and Publish AL: still HO, written window', [
  ['AL1', am.head && /AL\s*1/.test(am.head.tag), am.head && am.head.tag],
  ['Leave War HO', o4.letters === 'HO', o4.cell.text],
  ['tracker worked 07:00–13:00', /07:00.13:00/.test(o4.row), o4.row.slice(0, 220)],
  ['balance unchanged', o4.bal === base, { was: base, now: o4.bal }],
], o4.pics)
console.log('ERRORS', JSON.stringify(D.cleanErr(errors)))
D.savePart('ows-D-s35', { errors: D.cleanErr(errors), pics: D.pics.saved })
await browser.close()
