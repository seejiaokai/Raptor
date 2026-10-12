import { open, errs, browser } from './or-J-lib.mjs'
const { ctx, page } = await open({ fresh: true })
console.log(await page.evaluate(() => JSON.stringify(window.INPUTS.filter(r => r.person === 'slipway' || (r.people||[]).some(e => e.p === 'slipway')).map(r => ({ type: r.type, date: r.date, to: r.to })))))
console.log(await page.evaluate(() => JSON.stringify(window.INPUTS.filter(r => r.person === 'rocky' || (r.people||[]).some(e => e.p === 'rocky')).map(r => ({ type: r.type, date: r.date, to: r.to })))))
await ctx.close(); await browser.close()
