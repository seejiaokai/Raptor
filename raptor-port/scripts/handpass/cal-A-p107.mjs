import * as H from './cal-A-lib2.mjs'
const { tid, sleep, eq } = H
const SIZE = process.env.SIZE || 'desk'
const w = await H.world(SIZE)
const o = {}
const SAT = '2026-07-18', PH = '2026-07-15', OFF = '2026-07-16'
await H.warOpen(w)
await H.typeReq(w, 'p', '2026-07-13', 8, { run: true })       // the July run
o.runBefore = [await H.warText(w, '2026-07-14'), await H.warText(w, SAT)]
// Saturday to day flying through the Calendar month
await H.calOpenFromWar(w)
await H.calSet(w, SAT, 'day')
o.calSat = await H.calRead(w, SAT)
const pCal = await H.pic(w, 'p107-cal-sat-day')
await H.calClose(w)
await H.warJump(w, SAT)
o.satAfterClass = await H.warText(w, SAT)
o.satAfterClassFacts = (await H.bridge(w, SAT)).a
await H.typeReq(w, 'p', SAT, 5)
o.satTyped = await H.warText(w, SAT)
o.satTypedFacts = (await H.bridge(w, SAT)).a
const p0 = await H.pic(w, 'p107-war-sat-typed')
// a PH and an Off day, then a figure typed straight into each
await H.calOpenFromWar(w)
o.addPH = await H.holAdd(w, { kind: 'ph', from: PH })
o.addOff = await H.holAdd(w, { kind: 'off', from: OFF })
await H.calClose(w)
o.phBefore = await H.warText(w, PH); o.offBefore = await H.warText(w, OFF)
await H.typeReq(w, 'p', PH, 5)
await H.typeReq(w, 'p', OFF, 5)
o.phTyped = await H.warText(w, PH); o.offTyped = await H.warText(w, OFF)
o.neighbours = [await H.warText(w, '2026-07-13'), await H.warText(w, '2026-07-14'), await H.warText(w, '2026-07-17'), await H.warText(w, '2026-07-20')]
o.facts = { ph: (await H.bridge(w, PH)), off: (await H.bridge(w, OFF)) }
await H.warJump(w, PH)
const p1 = await H.pic(w, 'p107-war-ph-off-typed')
await H.openSans(w); await H.sansGoto(w, SAT)
o.sans = { sat: await H.sansCell(w, SAT), ph: await H.sansCell(w, PH), off: await H.sansCell(w, OFF) }
const p2 = await H.pic(w, 'p107-sans-month')
await H.calOpenFromSans(w, SAT)
o.cal = { sat: await H.calRead(w, SAT), ph: await H.calRead(w, PH), off: await H.calRead(w, OFF) }
const p3 = await H.pic(w, 'p107-calendar')
await H.calClose(w)
H.judge('P1-07', `${SIZE}: Required P 8 run from Mon 13 Jul; Sat 18 set to day flying in Calendar, Required read, then 5 typed straight into its cell; then a public holiday (Wed 15) and an Off day (Thu 16) added in Calendar > Holidays and 5 typed into each`, [
  ['before: Tue 14 inherits 8 from the run and Sat 18 is a dash', o.runBefore[0].reqP === '8' && o.runBefore[1].reqP === '–', o.runBefore.map(x => x.reqP)],
  ['Sat 18 set to day flying: Calendar shows D lit for it', o.calSat.lit === 'D', o.calSat],
  ['flying class alone did not import the run: Sat 18 Required still a dash, class day, no figure', o.satAfterClass.reqP === '–' && o.satAfterClassFacts.cls === 'day' && o.satAfterClassFacts.req.p === null, [o.satAfterClass.reqP, o.satAfterClassFacts.cls, o.satAfterClassFacts.req.p]],
  ['5 typed on Sat 18 shows 5 on the Leave War and the figure is the date\'s own (not from the run)', o.satTyped.reqP === '5' && o.satTypedFacts.reqFrom.p === 'date', [o.satTyped.reqP, o.satTypedFacts.reqFrom.p]],
  ['PH and Off day: run does not reach them (dashes) before typing', o.phBefore.reqP === '–' && o.offBefore.reqP === '–', [o.phBefore.reqP, o.offBefore.reqP]],
  ['5 typed straight into the PH day and the Off day is kept (cells read 5)', o.phTyped.reqP === '5' && o.offTyped.reqP === '5', [o.phTyped.reqP, o.offTyped.reqP]],
  ['PH and OFF keep their tags on the Calendar and the SANS month', o.cal.ph.tag === 'PH' && o.cal.off.tag === 'OFF' && o.sans.ph.tag === 'PH' && o.sans.off.tag === 'OFF', [o.cal.ph.tag, o.cal.off.tag, o.sans.ph.tag, o.sans.off.tag]],
  ['the run neighbours are untouched (13, 14, 17, 20 still read 8)', o.neighbours.every(x => x.reqP === '8'), o.neighbours.map(x => x.reqP)],
  ['SANS month shows a still-needed figure on Sat 18, PH and Off once a figure is typed', [o.sans.sat, o.sans.ph, o.sans.off].every(c => /Still needed: \d+ pilots/.test(c.label)), [o.sans.sat.label.slice(0, 60), o.sans.ph.label.slice(0, 60), o.sans.off.label.slice(0, 60)]],
  ['no console or page errors', w.errors.length === 0, w.errors],
], [pCal, p0, p1, p2, p3])
H.savePart('P1-07-' + SIZE, { out: o })
await H.closeAll(w)
