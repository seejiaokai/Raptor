import { open, browser, errs, csId, sleep, shot, lwCells } from './or-G-lib.mjs'
const { ctx, page } = await open()
const T = await csId(page, 'Tally'), R = await csId(page, 'Ranger'), D = await csId(page, 'Drifter')
console.log(await page.evaluate(([T, R]) => JSON.stringify({ T: window.PEOPLE[T], R: window.PEOPLE[R] }), [T, R]))
await page.evaluate(() => window.go('leavewar')); await sleep(1500)
console.log(await page.evaluate(() => [...document.querySelectorAll('[data-testid^="name-"], [data-testid^="row-"]')].slice(0, 100).map(e => e.getAttribute('data-testid')).join(' ')))
console.log(await page.evaluate(() => { const t = document.body.innerText; const i = t.indexOf('Tally'); return i >= 0 ? t.slice(Math.max(0, i - 80), i + 120).replace(/\s+/g, ' ') : 'Tally not on the Leave War page text' }))
await shot(page, 'x4-lw')
await ctx.close(); await browser.close()
