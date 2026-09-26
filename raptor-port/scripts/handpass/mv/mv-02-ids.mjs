/* the demo's callsigns and the ids the grid draws them by (read only) */
const M = await import('./mv-lib.mjs')
const { browser, page } = await M.openMv('a')
await M.lwOpen(page, '2026-01-05')
const ids = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="person-"]')].map(e => `${e.getAttribute('data-testid').slice(7)}=${(e.innerText || '').trim()}`))
console.log(ids.join('  '))
await browser.close()
