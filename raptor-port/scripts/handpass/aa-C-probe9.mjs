const C = await import('./aa-C-lib.mjs')
const { world, shot, sleep, go } = C
const w = await world(); const { page } = w
await go(page, 'leavewar'); await sleep(1200)
await page.locator('[data-testid="settings-open"]').click(); await sleep(500)
await page.locator('[data-testid="settings-days"]').click(); await sleep(800)
await page.locator('[data-testid="days-tab-holidays"]').click(); await sleep(500)
console.log('list', await page.evaluate(() => document.querySelector('[data-testid="days-part-holidays"]').innerText.replace(/\s+/g, ' ').slice(0, 400)))
await page.locator('[data-testid="hol-add"]').click(); await sleep(500)
await shot(page, 'probe9-holform')
console.log(await page.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => e.offsetParent).map(e => e.dataset.testid).filter(t => /hol/i.test(t)).slice(0, 60)))
await w.browser.close()
