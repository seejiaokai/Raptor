import { open, fileInput, shot, toWeek, errs, browser, toWeekDay } from './or-J-lib.mjs'
const { ctx, page } = await open({ fresh: true })
await toWeek(page)
await page.locator('button.wk[data-wk="20/07/2026"]:visible').first().click(); await page.waitForTimeout(1200)
console.log(await page.evaluate(() => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][0]; return [...d.querySelectorAll('.seat[data-slot]')].filter(s => /^\d+\.\d+\.\d+\.\d+\.[pw]$/.test(s.dataset.slot)).map(s => s.dataset.slot + ':' + (s.querySelector('.puck .nm')?.textContent || '(empty)')).join(' ') }))
console.log(await page.evaluate(() => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][0]; return [...d.querySelectorAll('.wave')].map(w => w.innerText.replace(/\s+/g, ' ').slice(0, 200)).join('\n--\n') }))
await ctx.close(); await browser.close()
