// bell190-b scenario group 7 (desktop): a note's pucks on a day opened on the calendar — RECORD [F33, A43]; an input
// dragged to another day on the month is not an "add" [F34].
import * as L from './bell190-b-lib.mjs'
console.log('bell190-b-s7 v1')
const P = 'b-s7'
L.clearPics(P)
const { b, page, errs } = await L.launch('desk')
const log = (...a) => console.log(...a)
const ID = L.ID
log('saber:', await L.as.saber(page))
await L.makeMoxie(page)
await L.goInputs(page)
const plan = () => page.evaluate(() => { try { return JSON.stringify(window.PLAN).slice(0, 0) } catch { return '' } })
// 7a: a note with words, Ranger and Moxie put on it
await L.openDay(page, '2026-07-15')
let before = await L.notices(page)
await page.click('#icAddPuck'); await page.waitForTimeout(250)
await page.keyboard.type('B7a brief the new guy')
await page.click('#icNewNotePpl'); await page.waitForSelector('#icPickOk', { timeout: 5000 })
await page.click(`[data-pickp="${ID.Ranger}"]`); await page.click(`[data-pickp="${ID.Moxie}"]`)
await L.pic(page, `${P}-7a-picker`)
await page.click('#icPickOk'); await page.waitForTimeout(600)
await L.pic(page, `${P}-7a-note`)
log('[7a] the day now:', (await page.locator('#page-inputs').innerText()).replace(/\s+/g, ' ').match(/B7a[^]{0,80}/)?.[0])
log('[7a] new notices:\n    ' + (L.fmt(L.newNotices(await L.notices(page), before)) || 'none'))
// 7a2: a note of people only (Hex), no words
before = await L.notices(page)
await page.click('#icAddPuck'); await page.waitForTimeout(250)
await page.click('#icNewNotePpl'); await page.waitForSelector('#icPickOk', { timeout: 5000 }).catch(() => log('[7a2] no picker for a note with no words'))
if (await page.locator('#icPickOk').count()) {
  await page.click(`[data-pickp="${ID.Hex}"]`); await page.click('#icPickOk'); await page.waitForTimeout(600)
}
await L.pic(page, `${P}-7a2-note`)
log('[7a2] new notices:\n    ' + (L.fmt(L.newNotices(await L.notices(page), before)) || 'none'))
await L.closeDay(page)
// 7b: a shared Training for Ranger and Moxie on Wed 15 Jul, dragged on the month to Thu 16 Jul
await L.goInputs(page)
const r = await L.file(page, { from: 'list', type: 'Training', title: 'B7b Move', people: [ID.Ranger, ID.Moxie], date: '2026-07-15' })
const iid = r.rows[0].iid
await L.goInputs(page)
await L.toMonth(page, 2026, 7)
const bar = page.locator(`#inpCal .ib-bar[data-iid="${iid}"]`).first()
await bar.scrollIntoViewIfNeeded()
const bb = await bar.boundingBox()
const tc = await page.locator('#inpCal [data-icday="2026-07-16"]').boundingBox()
log('[7b] bar', JSON.stringify(bb), ' target cell', JSON.stringify(tc))
before = await L.notices(page)
const sx = bb.x + bb.width / 2, sy = bb.y + bb.height / 2
await page.mouse.move(sx, sy); await page.mouse.down()
await page.mouse.move(sx + 6, sy + 2, { steps: 3 })
await page.mouse.move(tc.x + tc.width / 2, tc.y + tc.height * 0.6, { steps: 12 })
await L.pic(page, `${P}-7b-dragging`)
await page.mouse.up(); await page.waitForTimeout(700)
await L.pic(page, `${P}-7b-dropped`)
if (await page.locator(L.WIN).count()) { log('[7b] a window opened after the drop:', (await page.locator(L.WIN).innerText()).replace(/\s+/g, ' ').slice(0, 120)); await L.closeWin(page) }
log('[7b] the input now', JSON.stringify(await L.input(page, iid)))
log('[7b] new notices:\n    ' + (L.fmt(L.newNotices(await L.notices(page), before)) || 'none'))
await L.signOut(page)
for (const [who, fn] of [['ranger', L.as.ranger], ['moxie', L.as.moxie], ['hex', L.as.hex]]) {
  log(who + ':', await fn(page))
  const rb = await L.readBell(page, `${P}-${who}-bell`)
  log(who.toUpperCase() + ' bell:', L.bellText(rb), JSON.stringify(rb.lit))
  if (who === 'ranger') { const t = await L.tapLine(page, 'B7b Move', `${P}-ranger-tap-7b`); log('RANGER tap 7b ->', JSON.stringify(t)); await L.closeWin(page) }
  await L.signOut(page)
}
log('errors', JSON.stringify(errs))
await b.close()
