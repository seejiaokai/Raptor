import { world, usualSat, groundNow, goBoard, drag, puckSel, frameBoard, toast, undoState, SAT_DI } from './on-A-lib.mjs'
const W = await world({ tag: 'A11', fresh: false })
const { page, tid, press, shot, errors } = W
const iid = await usualSat(W)
const getBar = async () => { await frameBoard(page); await drag(page, page.locator(puckSel(1)), page.locator(puckSel(0))); await press(tid('oilconf-cancel')); await page.waitForTimeout(700); return await tid('oilbar').count() }
const bar = () => tid('oilbar').count()
console.log('1 bar up', await getBar())
// (a) next week and back
const nxt = page.locator('#sbDays [data-sbweek="1"], #sbDays [data-sbweek="next"], #sbDays [data-sbweek]').last()
console.log('week chips', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#sbDays [data-sbweek]')].map(e => e.getAttribute('data-sbweek') + '|' + e.textContent.trim()))))
await nxt.click(); await page.waitForTimeout(800)
console.log('a) after next week: bar', await bar(), 'week title', await page.evaluate(() => (document.querySelector('.sb-title') || {}).textContent))
await shot('A11-1-next-week')
await page.locator('#sbDays [data-sbweek]').first().click(); await page.waitForTimeout(800)
console.log('a) back: bar', await bar(), 'day', await page.evaluate(() => window.SBDAY), 'ground', JSON.stringify(await groundNow(page)))
// make sure on Saturday with the board for the next attempt
await page.locator(`#sbDays [data-sbday="${SAT_DI}"], #sbDays .sb-daytab`).nth(0).evaluate(() => {}).catch(() => {})
console.log('day now', await page.evaluate(() => window.SBDAY))
if ((await page.evaluate(() => window.SBDAY)) !== SAT_DI) { await page.locator('#sbDays').getByText('Sat 18').first().click(); await page.waitForTimeout(600) }
// (b) other page and back
console.log('2 bar up', await getBar())
await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(700)
console.log('b) on Inputs: bar', await bar(), 'CURPAGE', await page.evaluate(() => window.CURPAGE))
await shot('A11-2-inputs-page')
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(800)
console.log('b) back on editsched: bar', await bar(), 'board open', await page.evaluate(() => window.SBDAY))
if ((await page.evaluate(() => window.SBDAY)) == null) await goBoard(W)
// (c) sign out and in
console.log('3 bar up', await getBar())
await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /^Logout$/i.test(x.textContent.trim())); if (b) b.click(); else window.__nolog = true }); await page.waitForTimeout(800)
console.log('c) after logout: bar', await bar(), 'login card', await page.locator('#loginForm').isVisible().catch(() => false))
await shot('A11-3-after-logout')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(800)
console.log('c) after sign in: bar', await bar(), 'CURPAGE', await page.evaluate(() => window.CURPAGE), 'ground', JSON.stringify(await groundNow(page)))
await shot('A11-4-after-signin')
// (d) 30 seconds
await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
await goBoard(W)
console.log('4 bar up', await getBar())
await page.waitForTimeout(30000)
console.log('d) after 30 s idle: bar', await bar(), 'text', await tid('oilbar-text').innerText().catch(() => 'NO'))
await shot('A11-5-after-30s')
console.log('errors', JSON.stringify(errors))
await W.ctx.close(); process.exit(0)
