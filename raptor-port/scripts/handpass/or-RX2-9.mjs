// RX2-9: "By" passes to the admin who deletes / swaps out whoever filed an input. node or-RX2-9.mjs <a|b>
import { open, shot, errs, browser, saveRes, fileInput, toWeek, toast, toastMark, toastsSince, unavailRows, calRead, inputsOf, sleep, signOut, signIn, deleteUser, csId, dayCardText, toMonth, openDay, closeDay, listText } from './or-RX2-lib.mjs'
import { drag2 } from './or-B-lib2.mjs'
const WHICH = process.argv[2]
const R = {}
const ISO = '2026-07-15', DI = 2
const { ctx, page: p } = await open('us', 'us', { fresh: false })
const byOf = () => p.evaluate(() => window.INPUTS.filter(r => /Jul 15/.test(r.date) && (r.type === 'Training' || r.type === 'OD') && ((r.people || []).length > 1)).map(r => ({ iid: r.iid, type: r.type, title: r.title || '', by: r.by, byCs: window.PEOPLE[r.by]?.cs || r.by, modBy: r.modBy, modByCs: window.PEOPLE[r.modBy]?.cs || r.modBy, people: (r.people || []).map(e => window.PEOPLE[e.p]?.cs || e.p) })))
const card = async tag => { await toMonth(p, ISO); await openDay(p, ISO); const c = (await dayCardText(p)).filter(t => /Hex/.test(t)); await shot(p, tag); await closeDay(p); return c }
if (WHICH === 'a') {
  R.filed = await fileInput(p, { type: 'Training', people: ['Ranger', 'Hex', 'Hunter'], from: ISO, to: ISO, timed: ['10:00', '11:00'], title: 'RX2 brief' })
  R.toast = await toast(p)
  R.before = await byOf()
  R.cardBefore = await card('rx2-9a-1-card-before')
  await signOut(p); await signIn(p, 'ad', 'a')
  R.del = await deleteUser(p, 'Ranger')
  await shot(p, 'rx2-9a-2-after-delete')
  R.after = await byOf()
  R.cardAfter = await card('rx2-9a-3-card-after')
  R.list = (await listText(p)).filter(t => /RX2 brief/.test(t))
  await toWeek(p)
  R.weekRow = await p.evaluate(di => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; return [...d.querySelectorAll('.sec-grnd .pl-row')].map(r => r.innerText.replace(/\s+/g, ' ').trim()).filter(t => /RX2 brief/i.test(t)) }, DI)
} else {
  R.filed = await fileInput(p, { type: 'OD', people: ['Ranger', 'Hex'], from: ISO, to: ISO })
  R.toast = await toast(p)
  R.before = await byOf()
  R.cardBefore = await card('rx2-9b-1-card-before')
  await signOut(p); await signIn(p, 'ad', 'a')
  await toWeek(p)
  const day = p.locator('#eWeek .day:not(.peek)').nth(DI)
  const rangerPuck = day.locator('.sec-unav .pl-row').filter({ has: p.locator('.puck', { hasText: 'Ranger' }) }).first().locator('.puck').first()
  R.unavBefore = (await unavailRows(p, '#eWeek', DI)).filter(t => /Ranger|Hex/.test(t))
  await rangerPuck.scrollIntoViewIfNeeded(); await sleep(300)
  const src = p.locator(`#eRoster .rpuck[data-person="${await csId(p, 'Anvil')}"]:visible`).first()
  await src.scrollIntoViewIfNeeded().catch(() => {})
  const m = await toastMark(p)
  await drag2(p, src, rangerPuck)
  R.dropToast = await toastsSince(p, m)
  await shot(p, 'rx2-9b-2-after-drop')
  R.unavAfter = (await unavailRows(p, '#eWeek', DI)).filter(t => /Anvil|Ranger|Hex/.test(t))
  R.after = await byOf()
  R.cardAfter = await card('rx2-9b-3-card-after')
}
R.errs = errs.slice()
saveRes('RX2-9' + WHICH, R)
console.log(JSON.stringify(R, null, 1))
await ctx.close(); await browser.close()
