const C = await import('./aa-C-lib.mjs')
const { world, shot, sleep, go } = C
const w = await world({ width: 390, height: 844, mobile: true }); const { page } = w
await go(page, 'admin'); await sleep(600)
await page.getByText('Sign-in and roster').first().click(); await sleep(800)
await shot(page, 'probe12-users')
console.log(await page.evaluate(() => ({ g: !!document.querySelector('#admGuestView'), vis: document.querySelector('#admGuestView') ? document.querySelector('#admGuestView').offsetParent !== null : null, hamb: [...document.querySelectorAll('.topbar button, header button')].slice(0, 6).map(b => b.id + '|' + b.className + '|' + (b.getAttribute('aria-label') || '')) })))
await w.browser.close()
