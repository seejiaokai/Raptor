const C = await import('./aa-C-lib.mjs')
const { world, shot, sleep, go } = C
const w = await world(); const { page } = w
await go(page, 'editsched'); await sleep(500)
console.log(await page.evaluate(() => [...document.querySelectorAll('#page-editsched button, .wkbar button, .toolbar button')].filter(b => b.offsetParent && !b.closest('.day')).slice(0, 25).map(b => b.id + '|' + b.className.slice(0, 20) + '|' + (b.title || '') + '|' + (b.getAttribute('aria-label') || '') + '|' + b.innerText.trim().slice(0, 14))))
await go(page, 'inputs'); await page.locator('#inListBtn').click(); await sleep(500)
console.log(await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent && /export|print|csv/i.test(b.innerText + b.title + b.id + b.getAttribute('aria-label'))).map(b => b.id + '|' + b.title + '|' + b.innerText.trim())))
await w.browser.close()
