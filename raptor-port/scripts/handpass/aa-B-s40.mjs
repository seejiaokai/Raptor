import { world, fileInput, pic, sleep, go, openBoard, oilOn, openCount, tabTo, winState, availSet, closeWin, signIn, savePart } from './aa-B-lib.mjs'
const log = []
const say = (...a) => { const s = a.join(' '); log.push(s); console.log('  ' + s) }
const out = {}
const w = await world('desk'); w.tag = 's40'
const { page } = w
const f = await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', rmk: 'S40', s: '09:00', e: '12:00', oil: 'yes' })
const iid = f.rec.iid
await openBoard(page, 5)
const rect = () => page.evaluate(() => { const e = document.querySelector('.availwin'); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } })
const selCount = () => page.evaluate(() => [...document.querySelectorAll('.puck[data-person="dice"]')].filter(e => e.classList.contains('sel') || e.classList.contains('hl') || e.classList.contains('hlsel')).length)
await openCount(page, iid); await tabTo(page, 'avail')
out.open = await rect(); say('opens at', JSON.stringify(out.open), '(default narrow width expected ~212)'); await pic(w, 'open')
// reasons readable: a puck's reason shows under the pucks when tapped
// 1. move by the six-dot grip
const g = await page.locator('.availwin .win-grip').boundingBox()
await page.mouse.move(g.x + 4, g.y + 4); await page.mouse.down()
for (let i = 1; i <= 12; i++) { await page.mouse.move(g.x + 4 - 12 * i * 12 / 12, g.y + 4 + 10 * i); await sleep(25) }
await page.mouse.up(); await sleep(300)
out.moved = await rect(); say('after dragging the grip', JSON.stringify(out.moved)); await pic(w, 'moved')
// 2. resize by the bottom-right corner
const r0 = await rect()
const handleInfo = await page.evaluate(() => { const e = document.querySelector('.availwin'); return [...e.querySelectorAll('*')].filter(x => /resiz|grip|corner/i.test(x.className)).map(x => x.className) })
say('handle-like parts', JSON.stringify(handleInfo))
for (const [label, dx] of [['wider', 160], ['much narrower', -400]]) {
  const r = await rect()
  await page.mouse.move(r.x + r.w - 3, r.y + r.h - 3); await page.mouse.down()
  for (let i = 1; i <= 10; i++) { await page.mouse.move(r.x + r.w - 3 + dx * i / 10, r.y + r.h - 3); await sleep(25) }
  await page.mouse.up(); await sleep(300)
  out['resize ' + label] = await rect(); say('resize', label, JSON.stringify(out['resize ' + label]))
}
await pic(w, 'resized')
// 3. click the schedule behind it
await page.locator('#schedBoard .sb-title, #schedBoard h1, #schedBoard .sb-sec .sb-ph').first().click({ force: true }).catch(() => {}); await sleep(400)
out.afterBehindClick = await rect(); say('window after a click on the schedule behind it:', JSON.stringify(out.afterBehindClick))
// 4. tap P, OIL Earn off: highlights everywhere
const tabs = await availSet(page); say('tabs', JSON.stringify(tabs.tabs))
const P = page.locator('.availwin [data-awp="dice"] .puck').first()
await P.scrollIntoViewIfNeeded(); await P.click(); await sleep(500)
out.tapOff = { sel: await selCount(), shown: await page.evaluate(() => (document.querySelector('.availwin .rwhy, .availwin .why, .availwin .win-why') || {}).innerText || document.querySelector('.availwin').innerText.replace(/\s+/g, ' ').slice(-200)) }
say('tap P with OIL Earn off: highlighted pucks of P elsewhere', out.tapOff.sel, '| window says:', out.tapOff.shown); await pic(w, 'tap-off')
await page.keyboard.press('Escape').catch(() => {})
// clear the selection by tapping him again
await P.click().catch(() => {}); await sleep(300); say('selection after tapping again', await selCount())
// 5. OIL Earn on: tap P there — decides earning only
await closeWin(page); await oilOn(page, true); await openCount(page, iid); await tabTo(page, 'earn')
const before = await selCount()
const seat = page.locator('.availwin .seat.oilpk[data-oilp="dice"]').first(); await seat.click(); await sleep(500)
const st = await winState(page)
out.tapOn = { P: st.seats.dice, selBefore: before, selAfter: await selCount() }
say('tap P with OIL Earn on: his switch', st.seats.dice, '| selected pucks before/after', before, out.tapOn.selAfter); await pic(w, 'tap-on')
await closeWin(page)
// 6. navigation closes it
async function opened() { await openBoard(page, 5); await oilOn(page, true); await openCount(page, iid); return !!(await rect()) }
await opened(); await page.locator('#schedBoard').getByRole('button', { name: /Done/ }).first().click(); await sleep(700)
out.navDone = !!(await rect()); say('window still open after Done (board closed)?', out.navDone)
await opened(); await page.locator('#schedBoard').getByRole('button', { name: /Done/ }).first().click(); await sleep(500); say('window after Done, before changing page:', !!(await rect())); await page.locator('a[data-page="viewsched"]').first().click(); await sleep(900)
out.navView = !!(await rect()); say('window still open after changing page to View-only Sched?', out.navView)
await go(page, 'editsched'); await opened()
await page.locator('#sbDays [data-sbweek]').first().click().catch(() => {}); await sleep(900)
out.navWeek = !!(await rect()); say('window still open after a week change?', out.navWeek)
await go(page, 'editsched'); await opened(); await page.locator('#schedBoard').getByRole('button', { name: /Done/ }).first().click(); await sleep(500)
await page.getByRole('button', { name: /Logout/ }).first().click(); await sleep(900)
const confirm = page.getByRole('button', { name: /^(Log ?out|Yes|Confirm)/ }).first(); if (await confirm.count() && await confirm.isVisible().catch(() => false)) { await confirm.click(); await sleep(800) }
out.navLogout = !!(await rect()); say('window still open after logout?', out.navLogout, '| login box:', await page.locator('#luser').count())
out.errors = w.errors
await pic(w, 'end')
await w.browser.close()
savePart('s40-run', { out, log })
