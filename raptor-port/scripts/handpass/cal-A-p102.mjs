import * as H from './cal-A-lib2.mjs'
const { tid, sleep, eq } = H
const SIZE = process.env.SIZE || 'desk'
const w = await H.world(SIZE)
const D = '2026-07-13'
const o = {}
await H.warOpen(w)
o.base = await H.warText(w, D)           // before any figure
await H.warJump(w, D)
o.baseText = await H.warText(w, D)
const availP0 = +o.baseText.availP, availW0 = +o.baseText.availW
o.sansF0 = (await H.bridge(w, D)).a
// Required P two higher than Available P, this day only
await H.typeReq(w, 'p', D, availP0 + 2)
await H.typeReq(w, 'w', D, availW0 + 2)
o.before = await H.warText(w, D)
o.workBefore = await H.warWork(w, 'p', D)
const p0 = await H.pic(w, 'p102-war-before')
await H.warWorkClose(w)
await H.openSans(w); await H.sansGoto(w, D)
o.sansCellBefore = await H.sansCell(w, D)
await H.sansOpen(w, D)
o.sansDayBefore = await H.sansDayRead(w)
const p1 = await H.pic(w, 'p102-sans-before')
await H.sansClose(w)
// open Available P's definition and exclude the OCU category
await H.warOpen(w)
await w.press(tid(w.page, 'fly-name-avail-p')); await tid(w.page, 'counter-form').waitFor(); await sleep(400)
o.previewBefore = (await tid(w.page, 'cform-preview').innerText()).replace(/\s+/g, ' ').trim()
await w.press(tid(w.page, 'cf-catmode')); await sleep(200)
await w.press(tid(w.page, 'cf-cat-OCU')); await sleep(300)
o.previewAfter = (await tid(w.page, 'cform-preview').innerText()).replace(/\s+/g, ' ').trim()
o.catmodeText = (await tid(w.page, 'cf-catmode').innerText()).trim()
const p2 = await H.pic(w, 'p102-definition-form')
await w.press(tid(w.page, 'cform-save')); await sleep(900)
await H.warJump(w, D)
o.after = await H.warText(w, D)
o.workAfter = await H.warWork(w, 'p', D)
const p3 = await H.pic(w, 'p102-war-after')
await H.warWorkClose(w)
o.workAfterW = await H.warWork(w, 'w', D)
await H.warWorkClose(w)
await H.openSans(w); await H.sansGoto(w, D)
o.sansCellAfter = await H.sansCell(w, D)
await H.sansOpen(w, D)
o.sansDayAfter = await H.sansDayRead(w)
const p4 = await H.pic(w, 'p102-sans-after')
o.bridgeAfter = (await H.bridge(w, D)).a

const drop = +o.before.availP - +o.after.availP
H.judge('P1-02', `${SIZE}: Mon 13 Jul 26: Required P typed as Available P + 2; Available P's definition changed to CAT is not OCU through its name button and the counter form; read on the Leave War row, working box, SANS month and opened day`, [
  [`before: Available P ${o.before.availP}, Required P ${o.before.reqP}, still needed ${o.sansDayBefore.need[0]} on the SANS day (Required = Available + 2 so need 2)`, +o.before.reqP === +o.before.availP + 2 && o.sansDayBefore.need[0] === '2' && /Still needed 2/.test(o.workBefore), o.workBefore],
  [`the form's live preview changed on picking the exclusion (first-day count)`, o.previewBefore !== o.previewAfter, [o.previewBefore, o.previewAfter, o.catmodeText]],
  [`Available P fell by the number of OCU pilots the demo counted that day (scenario says one; demo's OCU group has 3 available) on the Leave War row`, drop >= 1, `fell by ${drop}: ${o.before.availP} to ${o.after.availP}`],
  [`still needed rose from 2 to 2 + the fall on the working box`, new RegExp('Still needed ' + (2 + drop) + '$').test(o.workAfter), o.workAfter],
  [`SANS month cell and opened day agree: Available ${o.sansDayAfter.avail[0]}, need ${o.sansDayAfter.need[0]}, cell need "${o.sansCellAfter.need}"`, o.sansDayAfter.avail[0] === o.after.availP && o.sansDayAfter.need[0] === String(2 + drop) && o.sansCellAfter.need.startsWith(String(2 + drop) + ' '), [o.sansDayAfter.avail, o.sansDayAfter.need, o.sansCellAfter.need]],
  [`W side did not move (Available W ${o.before.availW} -> ${o.after.availW}, need W unchanged ${o.sansDayAfter.need[1]})`, o.before.availW === o.after.availW && o.sansDayAfter.need[1] === o.sansDayBefore.need[1], [o.sansDayBefore.need, o.sansDayAfter.need]],
  ['no console or page errors', w.errors.length === 0, w.errors],
], [p0, p1, p2, p3, p4])
H.savePart('P1-02-' + SIZE, { out: o })
await H.closeAll(w)
