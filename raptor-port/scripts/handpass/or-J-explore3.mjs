import { open, fileInput, shot, errs, browser } from './or-J-lib.mjs'
const { ctx, page } = await open({ fresh: true })
await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(1200)
await page.locator('[data-testid="month-jul"], [data-testid="month-JUL"]').first().click(); await page.waitForTimeout(1000)
console.log(await page.evaluate(() => { const ids = [...new Set([...document.querySelectorAll('[data-testid^="cell-"]')].map(c=>c.dataset.testid.split('-')[1]))]; const all = Object.keys(window.PEOPLE).filter(k=>!['allavail','all'].includes(k)); return 'missing: ' + all.filter(k=>!ids.includes(k)).map(k=>k+':'+window.PEOPLE[k].cs+(window.PEOPLE[k].san?'(san)':'')).join(', ') }))
await ctx.close(); await browser.close()
