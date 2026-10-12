import * as L from './or-F-lib.mjs'
const { page, ctx } = await L.open()
await L.signAndPublish(page, 2)
await L.fileInput(page, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: '2026-07-15', to: '2026-07-15', timed: ['14:00', '15:00'], title: L.TITLE })
await L.toWeek(page)
const di = 2
await page.locator(`[data-planmenu="${di}"]`).first().scrollIntoViewIfNeeded()
await page.locator(`[data-planmenu="${di}"]`).first().click(); await page.waitForTimeout(500)
console.log('MENU', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.wavemenu button')].map(b => b.innerText.replace(/\s+/g, ' ')))))
await page.locator('.wavemenu button', { hasText: /^Original/ }).first().click(); await page.waitForTimeout(900)
console.log('BAR', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.dprev-bar, .dprev-bar *')].filter(e => e.children.length === 0).map(e => e.className + ': ' + e.innerText.replace(/\s+/g, ' ')))))
console.log('BTNS', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#eWeek button')].filter(b => b.offsetParent && /discard|load|keep/i.test(b.innerText)).map(b => b.className + ': ' + b.innerText.replace(/\s+/g, ' ')))))
await L.shotHead(page, 'explore-look', di, 260)
await ctx.close(); await L.browser.close()
