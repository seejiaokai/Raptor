const C = await import('./aa-C-lib.mjs')
const { world, shot, sleep, go } = C
const w = await world(); const { page } = w
await go(page, 'editsched'); await sleep(500)
await page.locator('.wk-cal:visible').first().click(); await sleep(700)
await shot(page, 'probe16-wkcal')
console.log(await page.evaluate(() => [...document.querySelectorAll('[data-testid], [data-date], [data-iso]')].filter(e => e.offsetParent).map(e => (e.dataset.testid || '') + '|' + (e.dataset.date || e.dataset.iso || '')).filter(t => /cal|date|day|month|next|prev/i.test(t)).slice(0, 30)))
await w.browser.close()
