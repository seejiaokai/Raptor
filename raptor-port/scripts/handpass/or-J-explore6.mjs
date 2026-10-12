import { open, fileInput, shot, toWeekDay, errs, browser, lwOpen } from './or-J-lib.mjs'
const { ctx, page } = await open({ fresh: true })
await lwOpen(page)
await page.locator('[data-testid="oil-tracker"]').click(); await page.waitForTimeout(1000)
console.log(await page.evaluate(() => { const rows = [...document.querySelectorAll('[data-testid^="oil-row"], [data-testid*="oilrow"], .otr, tr')].slice(0,3).map(e => e.outerHTML.slice(0,300)); const tids = [...new Set([...document.querySelectorAll('[data-testid]')].map(e => e.dataset.testid.replace(/[0-9a-z]{4,}$/, '')))].slice(0,40); return JSON.stringify({ rows, tids }) }))
await ctx.close(); await browser.close()
