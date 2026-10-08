import * as H from './cal-A-lib2.mjs'
const SIZE = process.env.SIZE || 'desk'
const w = await H.world(SIZE)
const D = '2028-01-03' // Mon, outside every period (the demo holds 2026 and 2027)
const o = {}
await H.warPeriod(w, 'y2027')
await H.typeReq(w, 'p', '2027-12-31', 8, { run: true })
await H.typeReq(w, 'w', '2027-12-31', 6, { run: true })
o.bridgeBefore = await H.bridge(w, D)
o.warBeforeDrawn = await w.page.evaluate(d => !!document.querySelector(`[data-testid="req-p-${d}"]`), D)
o.war31Dec = await H.warText(w, '2027-12-31')
const p0 = await H.pic(w, 'p101-war2027-run')
await H.openSans(w); await H.sansGoto(w, D)
o.sansCellBefore = await H.sansCell(w, D)
await H.sansOpen(w, D)
o.sansDayBefore = await H.sansDayRead(w)
const p1 = await H.pic(w, 'p101-sansday-before')
await H.calOpenFromSans(w, D)
o.calBefore = await H.calRead(w, D)
const p2 = await H.pic(w, 'p101-cal-before')
await H.calClose(w); await H.sansClose(w)
o.newSel = await H.newPeriod(w, 'JAN - DEC 28', '2028-01-01', '2028-12-31')
const p3 = await H.pic(w, 'p101-war-after-create')
await H.warJump(w, D)
o.warAfterDrawn = await w.page.evaluate(d => !!document.querySelector(`[data-testid="req-p-${d}"]`), D)
o.warAfter = await H.warText(w, D)
o.workP = await H.warWork(w, 'p', D)
const p4 = await H.pic(w, 'p101-war-working-after')
await H.warWorkClose(w)
o.workW = await H.warWork(w, 'w', D)
await H.warWorkClose(w)
await H.openSans(w); await H.sansGoto(w, D)
o.sansCellAfter = await H.sansCell(w, D)
await H.sansOpen(w, D)
o.sansDayAfter = await H.sansDayRead(w)
const p5 = await H.pic(w, 'p101-sansday-after')
await H.calOpenFromSans(w, D)
o.calAfter = await H.calRead(w, D)
const p6 = await H.pic(w, 'p101-cal-after')
await H.calClose(w); await H.sansClose(w)
await H.typeReq(w, 'p', D, 40, { run: true })
await H.typeReq(w, 'w', D, 30, { run: true })
o.warSupp = await H.warText(w, D)
o.workSupp = await H.warWork(w, 'p', D)
await H.warWorkClose(w)
await H.openSans(w); await H.sansGoto(w, D)
o.sansCellSupp = await H.sansCell(w, D)
await H.sansOpen(w, D)
o.sansDaySupp = await H.sansDayRead(w)
const p7 = await H.pic(w, 'p101-sansday-supp')

const dash = x => x === '–'
const eq = H.eq
H.judge('P1-01', `${SIZE}: Required P 8 / W 6 typed "From 31 Dec 27 on" in the 2027 period; Mon 3 Jan 28 (no period) read on the SANS month, its opened day, Calendar, Leave War; then "+" New made JAN - DEC 28, same date read again`, [
  ['before: the Leave War does not draw the date (no period)', o.warBeforeDrawn === false],
  ['before: SANS month cell need is a dash, label says no leave period covers it', dash(o.sansCellBefore.need) && /No leave period covers/.test(o.sansCellBefore.label), o.sansCellBefore.need],
  ['before: opened day Required 8 / 6, Available dashes, Still needed dashes, with the missing-period line', eq(o.sansDayBefore.req, ['8', '6']) && eq(o.sansDayBefore.avail, ['–', '–']) && eq(o.sansDayBefore.need, ['–', '–']) && /No leave period covers/.test(o.sansDayBefore.nocover || ''), o.sansDayBefore],
  ['before: Calendar shows D lit for the date, no tag', o.calBefore.lit === 'D' && !o.calBefore.tag, o.calBefore],
  ['after: new period drawn; Leave War Required 8/6, Available 28/18', o.warAfterDrawn && o.warAfter.reqP === '8' && o.warAfter.reqW === '6' && o.warAfter.availP === '28' && o.warAfter.availW === '18', o.warAfter],
  ['after: Leave War working P and W read Still needed 0', /Still needed 0/.test(o.workP) && /Still needed 0/.test(o.workW), [o.workP, o.workW]],
  ['after: SANS cell need "0 0"; opened day Available 28/18, Still needed 0/0, missing-period line gone', o.sansCellAfter.need === '0 0' && eq(o.sansDayAfter.avail, ['28', '18']) && eq(o.sansDayAfter.need, ['0', '0']) && !o.sansDayAfter.nocover, [o.sansCellAfter.need, o.sansDayAfter]],
  ['supplement: Required raised to 40/30 gives need 12/12 on Leave War working, SANS cell and opened day', /Still needed 12/.test(o.workSupp) && o.sansCellSupp.need === '12 12' && eq(o.sansDaySupp.need, ['12', '12']), [o.workSupp, o.sansCellSupp.need, o.sansDaySupp.need]],
  ['no console or page errors', w.errors.length === 0, w.errors],
], [p0, p1, p2, p3, p4, p5, p6, p7])
H.savePart('P1-01-' + SIZE, { out: o })
await H.closeAll(w)
