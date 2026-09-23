/* w3 item 5, follow-up: after a logout with the Details bubble up (phone), the
   sign-in card covers it — but it is still switched on underneath. What does
   the NEXT person see once they sign in?
   The bubble takes no pointer (pointer-events:none, by design), so a hit test
   passes straight through it — what counts is whether it is drawn, and the
   picture. */
import { open, shot, save, log, reveal, login, PHONE } from './trk-lib.mjs'
import { sleep, ball, bubble } from './trk-w3-lib.mjs'

const L = log()
const tapSel = async (page, sel) => { const b = await page.locator(sel).first().boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await sleep(450) }
const { browser, page, errors } = await open({ size: PHONE, who: 'a', touch: true })
await tapSel(page, '#detailsBtn')
await reveal(page, 'ACG-02'); const b = await ball(page, 'ACG-02').boundingBox()
await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await sleep(450)
L.note('admin: bubble up on ACG-02', JSON.stringify(await bubble(page)))
await tapSel(page, '#burger'); await sleep(250)
await page.locator('#drawerLogout').scrollIntoViewIfNeeded(); await tapSel(page, '#drawerLogout')
await page.waitForSelector('#luser'); await sleep(400)
L.note('sign-in screen: the bubble is still switched on (the sign-in screen is drawn over it — picture)', JSON.stringify(await bubble(page)))
await shot(page, 'w3-05b-signin-screen')
await login(page, 'u')
await sleep(500)
const bb = await bubble(page)
L.ok('member signs in: the admin\'s Tracker bubble is NOT floating over their first page', !bb.shown, `page ${await page.evaluate(() => window.CURPAGE)} · ${JSON.stringify(bb)}`)
await shot(page, 'w3-05b-member-first-page')
L.note('errors', errors.join(' | ') || 'none')
save('w3-05b-bubble-login', { rows: L.rows })
await browser.close()
