import { open, fileInput, shot, toWeekDay, errs, browser, unavRows } from './or-J-lib.mjs'
const { ctx, page } = await open({ fresh: true })
const f = await fileInput(page, { type: 'OD', people: ['Drifter', 'Hunter'], from: '2026-07-16', to: '2026-07-16' })
console.log(JSON.stringify(f))
await toWeekDay(page, 3)
console.log(await page.evaluate(() => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][3]; return [...d.querySelectorAll('.sec-unav .pl-row')].map(r => r.outerHTML.replace(/\s+/g,' ').slice(0, 900)).filter(h => /Drifter|Hunter/.test(h)).join('\n\n') }))
await ctx.close(); await browser.close()
