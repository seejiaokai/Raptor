/* [HUMAN-RETEST] Tracker — walk 5: crossing a login boundary (Astra #9; the
   standing ruling that undo is per login SESSION — memory future-undo-semantics-
   multiuser — and observation #122: the host's logout recreates the guest).

   The admin marks a ball, leaves a mode on and an unsaved chart edit, and logs
   out through the top bar; the member signs in on the same browser. What does
   the member inherit? */
import { open, shot, save, log, reveal, logout, login, toTracker, DESK } from './trk-lib.mjs'

const L = log()
const sleep = ms => new Promise(r => setTimeout(r, ms))
const ball = (page, id) => page.locator(`#flowSvg .ball[data-id="${id}"]`).first()
const wedges = (page, id) => page.evaluate(id => {
  const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id)
  return g ? [...g.querySelectorAll('path.wedge')].map(p => p.getAttribute('fill')) : null
}, id)
async function tapBall(page, id) {
  await reveal(page, id)
  const b = await ball(page, id).boundingBox()
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(350)
}
const undoState = page => page.evaluate(() => { const b = document.getElementById('trUndoBtn'); return b ? { disabled: b.disabled, title: b.title } : null })

const { browser, page, errors } = await open({ size: DESK, who: 'a' })

/* PASS 1 — a mark, then log out */
const w0 = await wedges(page, 'ST-01')
await tapBall(page, 'ST-01')
await page.locator('#pop button', { hasText: 'DCO' }).click(); await sleep(500)
const w1 = await wedges(page, 'ST-01')
L.ok('admin: DCO lands on ST-01', JSON.stringify(w0) !== JSON.stringify(w1), `${JSON.stringify(w0)} → ${JSON.stringify(w1)}`)
L.note('admin: the undo arrow now', JSON.stringify(await undoState(page)))
await page.click('#detailsBtn'); await sleep(200)                                  // leave Details mode ON
L.note('admin: Details mode on?', String(await page.locator('#detailsBtn.primary').count()))
await logout(page)
await login(page, 'u'); await toTracker(page)
await shot(page, '05-member-after-admin-logout')
const u = await undoState(page)
L.ok('member: the undo arrow is EMPTY after someone else\'s session (undo is per login session)', u && u.disabled, JSON.stringify(u))
L.ok('member: Details mode did not carry over from the admin', !(await page.locator('#detailsBtn.primary').count()), (await page.locator('#detailsBtn.primary').count()) ? 'still ON' : 'off')
L.ok('member: the chart is drawn after the login (obs #122)', (await page.locator('#flowSvg .ball').count()) > 0, String(await page.locator('#flowSvg .ball').count()) + ' balls')
if (u && !u.disabled) {
  if (await page.locator('#detailsBtn.primary').count()) { await page.click('#detailsBtn'); await sleep(200) }
  await page.click('#trUndoBtn'); await sleep(500)
  const w2 = await wedges(page, 'ST-01')
  L.ok('member: pressing ↶ does NOT take back the admin\'s mark', JSON.stringify(w2) === JSON.stringify(w1), `ST-01 ${JSON.stringify(w1)} → ${JSON.stringify(w2)}`)
  await shot(page, '05-member-undid-admin-mark')
}

/* PASS 2 — an UNSAVED chart edit left open in arrange mode, then log out */
await logout(page)
await login(page, 'a'); await toTracker(page)
await page.click('#sylMenuBtn'); await page.waitForSelector('#arrangeBtn', { state: 'visible' }); await page.click('#arrangeBtn'); await sleep(400)
await reveal(page, 'ACG-02')
const bb = await ball(page, 'ACG-02').boundingBox()
await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.mouse.down()
for (let i = 1; i <= 6; i++) await page.mouse.move(bb.x + bb.width / 2 + 25 * i, bb.y + bb.height / 2); await page.mouse.up(); await sleep(300)
await page.locator('#arrTools button', { hasText: '+ Test' }).click(); await sleep(300)
if (await page.locator('#dlgModal').isVisible().catch(() => false)) { await page.fill('#dlgInput', 'UNSAVED-1'); await page.click('#dlgOk'); await sleep(400) }
L.note('admin: Save changes waiting?', String(await page.locator('#saveChanges').count()))
await logout(page)
await login(page, 'u'); await toTracker(page)
await shot(page, '05-member-after-admin-left-unsaved-edit')
L.ok('member: not dropped into the admin\'s chart-edit mode', !(await page.locator('#arrTools.on').count()), (await page.locator('#arrTools.on').count()) ? 'arrange tools ON' : 'off')
L.ok('member: no "Save changes" for someone else\'s unsaved chart edit', !(await page.locator('#saveChanges').count()), (await page.locator('#saveChanges').count()) ? 'Save changes offered' : 'none')
L.note('member: the unsaved ball "UNSAVED-1" on the chart?', String(await page.locator('#flowSvg .ball[data-id="UNSAVED-1"]').count()))

save('05-session', { rows: L.rows, errors })
console.log(`errors ${errors.length}: ${errors.slice(0, 4).join(' | ')}`)
await browser.close()
