import { chromium, launchOptions, world, openSans, shot, tid, cell } from './cal-D-lib.mjs'
const browser = await chromium.launch(launchOptions)
const { ctx, page, errors } = await world(browser, 'desk')
const info = await page.evaluate(() => {
  const P = window.PEOPLE
  return Object.keys(P).map(id => ({ id, cs: P[id].cs, san: !!P[id].san, seat: P[id].seat, arch: !!P[id].archived, del: !!P[id].deleted, pers: !!P[id].pers, special: !!P[id].special, cat: P[id].cat }))
})
console.log(JSON.stringify(info.filter(p => p.san || ['Saber', 'Ranger'].includes(p.cs))))
console.log('total', info.length)
await openSans(page, 'desk', 2026, 7)
await shot(page, 'explore-july')
const keys = await page.evaluate(() => Object.keys(window).filter(k => /^(lw|fly|set|file|go|raptor|PEOPLE|INPUTS|DAYS|CURPAGE)/.test(k)))
console.log(keys.join(','))
const d = await page.evaluate(() => { const a = window.flyAnswer('2026-07-15'); const f = window.lwDayFacts('2026-07-15'); return { a, f } })
console.log(JSON.stringify(d))
console.log(errors.join('\n'))
await ctx.close(); await browser.close()
