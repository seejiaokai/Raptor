import * as H from './cal-A-lib2.mjs'
const { tid, sleep, eq } = H
const SIZE = process.env.SIZE || 'desk'
const w = await H.world(SIZE)
const D = '2026-07-20' // Monday
const o = {}
await H.warOpen(w)
// Available P := pilots of CAT C (five of them in the demo), so a half-day leave can leave 4.5
await w.press(tid(w.page, 'fly-name-avail-p')); await tid(w.page, 'counter-form').waitFor(); await sleep(400)
await w.press(tid(w.page, 'cf-cat-C')); await sleep(250)
await w.press(tid(w.page, 'cf-cat-B')); await sleep(250)
o.preview = (await tid(w.page, 'cform-preview').innerText()).replace(/\s+/g, ' ').trim()
await w.press(tid(w.page, 'cform-save')); await sleep(900)
await H.warJump(w, D)
o.availWholeDay = await H.warText(w, D)
// one of them (Gambit, "bruise") on AM leave that day, through the one-day sheet
await H.placeLeave(w, 'bruise', D, 'LL', 'am')
o.cellBruise = await w.page.evaluate(d => (document.querySelector(`[data-testid="cell-bruise-${d}"]`) || {}).innerText, D)
await H.typeReq(w, 'p', D, 6)
o.warBeforeSans = await H.warText(w, D)
o.workBeforeSans = await H.warWork(w, 'p', D)
await H.warWorkClose(w)
await H.openSans(w)
const f = await H.sansFile(w, D, 'Zenith', { f: true })
o.filed = f
await H.sansClose(w)
await H.warOpen(w)
await H.warJump(w, D)
o.war = await H.warText(w, D)
o.work = await H.warWork(w, 'p', D)
const p0 = await H.pic(w, 'p104-war-working')
await H.warWorkClose(w)
await H.openSans(w); await H.sansGoto(w, D)
o.sansCell = await H.sansCell(w, D)
await H.sansOpen(w, D)
o.sansDay = await H.sansDayRead(w)
const p1 = await H.pic(w, 'p104-sans-day')
o.bridge = (await H.bridge(w, D)).a
H.judge('P1-04', `${SIZE}: Available P defined as CAT B and C pilots; one of them (Gambit) given AM leave on Mon 20 Jul through the one-day sheet; Required P 6 typed; one SANS pilot (Zenith) Fly commitment filed through "+ Commitment"; read on the Leave War row, working box, SANS month cell and opened day`, [
  [`whole-day Available P before the leave is 5 (five pilots of CAT B or C free that day)`, o.availWholeDay.availP === '5', o.availWholeDay],
  [`Gambit's cell shows the AM leave`, /LL/.test(o.cellBruise || ''), o.cellBruise],
  [`Leave War Available P cell reads 4.5 and Required P 6`, o.war.availP === '4.5' && o.war.reqP === '6', o.war],
  [`working box: Required 6, Available 4.5, SANS 1, Still needed 1 (6 - 4.5 - 1 = 0.5 shown as 1)`, /Required 6 Available 4\.5 SANS committed to fly 1 Still needed 1$/.test(o.work), o.work],
  [`SANS month cell need reads 1 pilot`, /^1 /.test(o.sansCell.need) && /Still needed: 1 pilots/.test(o.sansCell.label), [o.sansCell.need, o.sansCell.label]],
  [`SANS opened day: Required 6, Available 4.5, committed 1, Still needed 1 — same as the Leave War`, o.sansDay.req[0] === '6' && o.sansDay.avail[0] === '4.5' && o.sansDay.sans[0] === '1' && o.sansDay.need[0] === '1', o.sansDay],
  [`the SANS filing went through`, !o.filed.stillOpen, o.filed],
  ['no console or page errors', w.errors.length === 0, w.errors],
], [p0, p1])
H.savePart('P1-04-' + SIZE, { out: o })
await H.closeAll(w)
