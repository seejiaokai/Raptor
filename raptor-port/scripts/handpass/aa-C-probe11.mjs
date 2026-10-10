const C = await import('./aa-C-lib.mjs')
const { world, shot, sleep, go } = C
const w = await world(); const { page } = w
await go(page, 'logic'); await sleep(800)
await page.getByRole('button', { name: /Edit rules/ }).click(); await sleep(500)
const s = page.locator('input[placeholder*="earch" i]').first()
await s.fill('OIL'); await sleep(600)
await shot(page, 'probe11-logic2')
console.log(await page.evaluate(() => [...document.querySelectorAll('input, [data-testid]')].filter(e => e.offsetParent).map(e => e.tagName + '|' + (e.dataset.testid || '') + '|' + e.id + '|' + (e.dataset.rule || e.dataset.key || '') + '|' + (e.value || '')).slice(0, 30)))
await w.browser.close()
