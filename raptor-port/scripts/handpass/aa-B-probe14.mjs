import { world, fileInput, pic, sleep, openBoard, reload, BASE } from './aa-B-lib.mjs'
const w = await world('desk'); w.tag = 'p14'
const { page } = w
await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', rmk: 'p14', s: '09:00', e: '12:00', oil: 'yes' })
await openBoard(page, 5)
await page.goto(BASE); await sleep(2500)
console.log('url', page.url(), 'login?', await page.locator('#luser').count(), 'page', await page.evaluate(() => window.CURPAGE), 'inputs', await page.evaluate(() => window.INPUTS && window.INPUTS.filter(i => i.remarks === 'p14').length))
await pic(w, 'reloaded')
if (await page.locator('#luser').count()) { await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]'); await sleep(2500) }
console.log('after login: page', await page.evaluate(() => window.CURPAGE), 'inputs', await page.evaluate(() => window.INPUTS.filter(i => i.remarks === 'p14').length))
await pic(w, 'after-login')
await w.browser.close()
