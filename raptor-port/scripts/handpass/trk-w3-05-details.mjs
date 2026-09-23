/* w3 item 5 — Details mode and its bubble (R69; Fable #10).
   ⓘ on → the hint "Details mode — … Marking is off." with Turn off; a tap on a
   ball → its bubble, and no grading. Then does the bubble go away when you:
   switch the phone to the Info tab; go to another Raptor tab (Leave War); log
   out? Fable predicted, from the code, that it floats on over all three. */
import { open, shot, save, log, reveal, login, toTracker, DESK, PHONE } from './trk-lib.mjs'
import { sleep, ball, bubble, halves } from './trk-w3-lib.mjs'

const L = log()
const tapSel = async (page, sel) => { const b = await page.locator(sel).first().boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await sleep(450) }
const tapBallT = async (page, id) => { await reveal(page, id); const b = await ball(page, id).boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await sleep(450) }
const drawerTo = async (page, id) => { await tapSel(page, '#burger'); await sleep(250); await tapSel(page, `#drawerNav a[data-page="${id}"]`); await page.waitForFunction(p => window.CURPAGE === p, id); await sleep(400) }

/* ---------------- phone ---------------- */
{
  const { browser, page, errors } = await open({ size: PHONE, who: 'a', touch: true })
  await tapSel(page, '#detailsBtn')
  const hint = await page.locator('#detailsHint').innerText().catch(() => '')
  L.ok('phone: ⓘ on → the hint says Details mode and "Marking is off.", with Turn off', /Details mode/.test(hint) && /Marking is off\./.test(hint) && (await page.locator('#detailsHintOff').isVisible()), hint.replace(/\s+/g, ' '))
  await shot(page, 'w3-05-phone-details-on')
  await tapBallT(page, 'ST-01')
  let bb = await bubble(page)
  L.ok('phone: a tap on ST-01 shows its bubble', bb.shown, bb.text || '')
  L.ok('phone: …and does not open grading', !(await page.locator('#pop').isVisible().catch(() => false)), '')
  await shot(page, 'w3-05-phone-bubble')
  /* 1. the Info tab */
  await tapSel(page, '#viewtabs [data-view="info"]')
  bb = await bubble(page)
  L.ok('phone: switching to the Info tab puts the bubble away', !bb.shown, JSON.stringify(bb) + ' ' + JSON.stringify(await halves(page)))
  await shot(page, 'w3-05-phone-info-tab')
  /* 2. another Raptor tab */
  await tapSel(page, '#viewtabs [data-view="flow"]')
  await tapBallT(page, 'ACG-01')
  L.note('phone: bubble back up on ACG-01', JSON.stringify(await bubble(page)))
  await drawerTo(page, 'leavewar')
  bb = await bubble(page)
  L.ok('phone: going to Leave War puts the bubble away', !bb.shown, JSON.stringify(bb))
  await shot(page, 'w3-05-phone-leavewar')
  /* 3. log out */
  await drawerTo(page, 'tracker')
  L.note('phone: back on the Tracker — Details mode still on?', (await page.locator('#detailsHint').isVisible().catch(() => false)) ? 'yes (hint shown)' : 'no')
  L.note('phone: …and the bubble on return', JSON.stringify(await bubble(page)))
  await tapBallT(page, 'ACG-02')
  L.note('phone: bubble up on ACG-02', JSON.stringify(await bubble(page)))
  await tapSel(page, '#burger'); await sleep(250)
  await page.locator('#drawerLogout').scrollIntoViewIfNeeded(); await tapSel(page, '#drawerLogout')
  await page.waitForSelector('#luser'); await sleep(400)
  bb = await bubble(page)
  L.ok('phone: logging out puts the bubble away (not over the sign-in card)', !bb.shown, JSON.stringify(bb))
  await shot(page, 'w3-05-phone-logout')
  /* Turn off, on a fresh sign-in */
  await login(page, 'a'); await toTracker(page)
  L.note('phone: after logout → login, Details mode', (await page.locator('#detailsHint').isVisible().catch(() => false)) ? 'STILL ON (known F10 — carries across a login)' : 'off')
  if (await page.locator('#detailsHintOff').isVisible().catch(() => false)) {
    await tapSel(page, '#detailsHintOff')
    L.ok('phone: Turn off switches Details mode off (hint gone, ⓘ unlit)', !(await page.locator('#detailsHint').isVisible().catch(() => false)) && !(await page.locator('#detailsBtn.primary').count()), '')
    await tapBallT(page, 'ST-01')
    L.ok('phone: …and a tap grades again (the pop-up opens)', await page.locator('#pop').isVisible().catch(() => false), '')
  }
  L.note('phone errors', errors.join(' | ') || 'none')
  await browser.close()
}

/* ---------------- desktop ---------------- */
{
  const { browser, page, errors } = await open({ size: DESK, who: 'a' })
  await page.click('#detailsBtn'); await sleep(300)
  await reveal(page, 'ST-01')
  const b = await ball(page, 'ST-01').boundingBox()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await sleep(350)
  L.ok('desk: hovering a ball in Details mode shows the bubble', (await bubble(page)).shown, (await bubble(page)).text || '')
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(350)
  L.ok('desk: clicking it keeps the bubble and opens no grading', (await bubble(page)).shown && !(await page.locator('#pop').isVisible().catch(() => false)), '')
  await shot(page, 'w3-05-desk-bubble')
  await page.click('#topnav a[data-page="leavewar"]'); await page.waitForFunction(() => window.CURPAGE === 'leavewar'); await sleep(400)
  L.ok('desk: on Leave War the bubble is gone', !(await bubble(page)).shown, JSON.stringify(await bubble(page)))
  /* the keyboard route: a click on the ball, then Leave War by keyboard (the pointer never leaves the ball) */
  await page.click('#topnav a[data-page="tracker"]'); await page.waitForFunction(() => window.CURPAGE === 'tracker'); await sleep(500)
  await reveal(page, 'ST-01'); const b2 = await ball(page, 'ST-01').boundingBox()
  await page.mouse.click(b2.x + b2.width / 2, b2.y + b2.height / 2); await sleep(350)
  L.note('desk: bubble up again', JSON.stringify(await bubble(page)))
  await page.focus('#topnav a[data-page="leavewar"]'); await page.keyboard.press('Enter'); await page.waitForFunction(() => window.CURPAGE === 'leavewar'); await sleep(400)
  const kb = await bubble(page)
  L.ok('desk: leaving by KEYBOARD with the pointer still on the ball — the bubble is gone on Leave War', !kb.shown, JSON.stringify(kb))
  await shot(page, 'w3-05-desk-leavewar-keyboard')
  /* leaving the Tracker gives a LONG page its scrolling back (item 4's promise, on a page taller than the window) */
  await page.click('#topnav a[data-page="logic"]'); await page.waitForFunction(() => window.CURPAGE === 'logic'); await sleep(400)
  await page.mouse.move(700, 600); await page.mouse.wheel(0, 900); await sleep(300)
  const sy = await page.evaluate(() => ({ y: Math.round(window.scrollY), sh: document.documentElement.scrollHeight, trOn: document.body.classList.contains('tr-on') }))
  L.ok('desk: after the Tracker, the (long) Logic page scrolls with the wheel', sy.y > 0 && !sy.trOn, JSON.stringify(sy))
  L.note('desk errors', errors.join(' | ') || 'none')
  await browser.close()
}
save('w3-05-details', { rows: L.rows })
