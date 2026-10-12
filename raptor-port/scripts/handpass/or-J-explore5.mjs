import { open, shot, errs, browser } from './or-J-lib.mjs'
const { ctx, page } = await open({ fresh: true })
await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(500)
await page.locator('#inMedBtn').click(); await page.waitForTimeout(700)
await shot(page, 'x-med')
console.log(await page.evaluate(() => [...document.querySelectorAll('#page-inputs button, #page-inputs [data-testid]')].filter(b=>b.offsetParent).map(b => b.id + '|' + (b.dataset.testid||'') + '|' + b.textContent.trim().replace(/\s+/g,' ').slice(0,40)).join('\n')))
await ctx.close(); await browser.close()
