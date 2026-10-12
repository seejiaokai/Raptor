// RX2-3: who sees the "OIL?" sign. Ranger files Thu 16 Jul Training; Saber drags Hex on; Saber makes Thu a public holiday.
import { open, shot, errs, browser, saveRes, toMonth, openDay, closeDay, dayCardText, sleep, toast, toastMark, toastsSince, become, signOut, signIn, bellRead, fileInput, toWeek, csId, inputsOf } from './or-RX2-lib.mjs'
import { declareHoliday, oilSigns, brief, oilSheet, cancelOil } from './or-RX2-fix.mjs'
import { drag2, rosterPuckOf } from './or-B-lib2.mjs'
import { bellState, bellPress, bellList } from './or-RX2-lib.mjs'
/* tap the bell; record what it did (a question, or the list); answer nothing — Cancel a question */
async function tapBell(p, tag) {
  const o = { before: await bellState(p) }
  const t0 = await toast(p)
  await bellPress(p)
  o.oilQuestion = await oilSheet(p)
  o.list = await bellList(p)
  o.after = await bellState(p)
  o.toastNow = await toast(p)
  await shot(p, tag)
  if (o.oilQuestion) { o.cancelled = await cancelOil(p); o.afterCancel = await bellState(p); o.afterCancelInput = await brief(p, window__iid)
    await bellPress(p); o.secondTapQuestion = await oilSheet(p); o.secondTapList = await bellList(p); await shot(p, tag + '-2nd-tap'); if (o.secondTapQuestion) await cancelOil(p); else if (o.secondTapList) await bellPress(p) }
  else if (o.list) await bellPress(p)
  return o
}
let window__iid = null
const R = {}
const ISO = '2026-07-16', DI = 3
const { ctx, page: p } = await open('us', 'us', { fresh: false })
R.file = await fileInput(p, { type: 'Training', from: ISO, to: ISO, timed: ['09:00', '12:00'], title: 'Thu drill', oil: 'yes' })
const iid = R.file[0]?.iid; window__iid = iid
R.afterFile = iid ? await brief(p, iid) : 'NOT FILED'
R.sheetAtFile = await oilSheet(p)
await shot(p, 'rx2-3-1-ranger-filed')
process.on('exit', () => console.log('PARTIAL ' + JSON.stringify(R)))
if (!iid) { saveRes('RX2-3', R); console.log(JSON.stringify(R, null, 1)); await browser.close(); process.exit(0) }
// Saber: Hex onto "+ add"
await signOut(p); await signIn(p, 'ad', 'a')
await toWeek(p)
const day = p.locator('#eWeek .day:not(.peek)').nth(DI)
const row = day.locator('.sec-grnd .pl-row', { hasText: 'Thu drill' }).first()
await row.scrollIntoViewIfNeeded(); await sleep(300)
R.rowBefore = await row.innerText().then(t => t.replace(/\s+/g, ' '))
const src = p.locator(`#eRoster .rpuck[data-person="${await csId(p, 'Hex')}"]:visible`).first()
await src.scrollIntoViewIfNeeded().catch(() => {})
const sb = await src.boundingBox(), db = await row.locator('.addz').first().boundingBox()
const m = await toastMark(p)
await p.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2); await p.mouse.down(); await p.mouse.move(sb.x + sb.width / 2 + 6, sb.y + sb.height / 2 + 6, { steps: 3 })
await p.mouse.move(db.x + db.width / 2, db.y + db.height / 2, { steps: 16 }); await sleep(150); await p.mouse.move(db.x + db.width / 2 + 1, db.y + db.height / 2 + 1); await sleep(150); await p.mouse.up(); await sleep(700)
R.joinToast = await toastsSince(p, m)
R.joinQuestion = await oilSheet(p)
await shot(p, 'rx2-3-2-hex-joined')
R.afterJoin = await brief(p, iid)
if (R.joinQuestion) { await cancelOil(p); R.afterJoinCancel = await brief(p, iid) }
// Saber: Thu 16 Jul a public holiday
R.holiday = await declareHoliday(p, ISO, 'RX2 holiday')
await sleep(500)
R.afterHoliday = await brief(p, iid)
R.questionAfterHoliday = await oilSheet(p)
R.toastAfterHoliday = await toast(p)
await shot(p, 'rx2-3-3-after-holiday')
if (R.questionAfterHoliday) { R.cancelledAfterHoliday = await cancelOil(p); R.afterHolidayCancel = await brief(p, iid); await shot(p, 'rx2-3-3b-after-cancel') }
// who sees what
R.saber = await oilSigns(p, iid, ISO)
await shot(p, 'rx2-3-4-saber-list')
await openDay(p, ISO).catch(() => {}); await shot(p, 'rx2-3-4b-saber-day'); await closeDay(p).catch(() => {})
R.saberBell = await tapBell(p, 'rx2-3-5-saber-bell')
const who = {}
for (const [cs, tag] of [['Ranger', 'ranger'], ['Hex', 'hex']]) {
  if (cs === 'Ranger') { await signOut(p); await signIn(p, 'us', 'us') } else await become(p, cs, 'member')
  const o = await oilSigns(p, iid, ISO)
  await openDay(p, ISO).catch(() => {}); await shot(p, `rx2-3-6-${tag}-day`); await closeDay(p).catch(() => {})
  await p.evaluate(() => window.go('inputs')); await sleep(300)
  if (await p.locator('#inListBtn[aria-pressed="false"]').count()) await p.locator('#inListBtn').click()
  await sleep(500)
  await shot(p, `rx2-3-6-${tag}-list`)
  o.bell = await tapBell(p, `rx2-3-7-${tag}-bell`)
  who[cs] = o
}
R.who = who
R.errs = errs.slice()
saveRes('RX2-3', R)
console.log(JSON.stringify(R, null, 1))
await ctx.close(); await browser.close()
