/* W6 — read-only survey, part 2: the SXO manning row (who counts in it, its lines), and the next week's days. */
process.env.AB_WHO = 'rewalk/w6'
const L = await import('./ab-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { browser, page, errors } = await openHi({ width: 1440, height: 900, who: 'a', dpr: 1 })
await L.lwOpen(page, '2026-07-21')
console.log('counts 21 Jul', await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-testid^="count-"][data-testid$="-2026-07-21"]')].map(e => [e.getAttribute('data-testid'), e.innerText.trim() + ' ' + e.className + ' ' + e.title]))))
for (const r of ['sxo', 'sets', 'ip']) {
  await page.locator(`[data-testid="manning-info-${r}"]`).first().click(); await page.waitForTimeout(500)
  console.log(r, await page.evaluate(() => (document.querySelector('[data-testid="manning-sheet"]') || {}).innerText?.replace(/\s+/g, ' ')))
  await page.locator('[data-testid="manning-info-close"]').click(); await page.waitForTimeout(300)
}
console.log('sxo people', await page.evaluate(() => Object.entries(window.PEOPLE).filter(([k, p]) => p.sxo || (p.q || '').toUpperCase() === 'SXO' || p.xsxo).map(([k, p]) => `${k}=${p.cs} seat=${p.seat} q=${p.q} san=${!!p.san} arch=${!!p.archived}`)))
console.log('people keys sample', await page.evaluate(() => Object.keys(Object.values(window.PEOPLE)[3])))
/* next week */
await L.go(page, 'editsched')
console.log('week chips', await page.evaluate(() => [...document.querySelectorAll('[data-wk]')].filter(e => e.offsetWidth).map(e => e.dataset.wk + ':' + e.innerText)))
console.log('errors', errors)
await browser.close()
