/* the ?swdebug log shows on a phone (his iPhone recording of 3 Nov 26, 05:41): sign in, add ?swdebug, swipe
   Monday → Tuesday → Monday → Sunday by real touch, picture the log. Checks it prints and changes nothing. */
import { openPhone, goPage, park, fingerCdp, sleep, weekId } from './ws-walk-a-lib.mjs'
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-03-week-swipe/swdebug'
const s = await openPhone('chromium')
const { page, cdp, problems } = s
await page.goto('/?swdebug'); await page.waitForSelector('#luser')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(500)
await goPage(page, 'editsched')
await park(page, '#eWeek', 0)
const w0 = await weekId(page)
const path = (x0, x1) => Array.from({ length: 11 }, (_, i) => [x0 + (x1 - x0) * i / 10, 400, i * 25])
await fingerCdp(cdp, path(300, 100)); await sleep(900)
await fingerCdp(cdp, path(100, 300)); await sleep(900)
await fingerCdp(cdp, path(100, 300)); await sleep(1200)
const w1 = await weekId(page)
await page.screenshot({ path: OUT + '/log.png' })
const text = await page.evaluate(() => [...document.body.children].filter(d => d.style && d.style.bottom === '0px' && d.style.position === 'fixed').map(d => d.textContent).join('\n'))
console.log(JSON.stringify({ w0, w1, crossed: w0 !== w1, problems }, null, 1)); console.log(text)
await s.browser.close()
