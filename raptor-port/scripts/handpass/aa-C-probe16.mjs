const C = await import('./aa-C-lib.mjs')
const { world, shot, sleep, go } = C
const w = await world(); const { page } = w
await go(page, 'editsched'); await sleep(500)
await page.locator('.wk-cal:visible').first().click(); await sleep(700)
console.log(await page.evaluate(() => { const t = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && /Tap any day/.test(e.textContent)); let n = t, out = []; for (let i = 0; i < 6 && n; i++, n = n.parentElement) out.push(n.tagName + '|' + n.className + '|' + (n.getAttribute('role') || '') + '|' + (n.id || '') + '|' + (n.dataset.testid || '')); return out }))
await w.browser.close()
