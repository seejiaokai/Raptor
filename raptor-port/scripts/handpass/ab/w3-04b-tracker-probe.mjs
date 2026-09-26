/* W3 probe: the OIL tracker's row for a man with a fresh 0.5-day award — which controls it draws (read only). */
process.env.AB_WHO = 'w3'
const L = await import('./w3-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { browser, page } = await openHi({ width: 1440, height: 900, who: 'a', dpr: 1 })
await L.lwOpen(page, '2026-07-20')
await L.lwAward(page, 'mamba', '2026-07-26', '0.5', 'W3 N19 0.5')
await page.locator('[data-testid="oil-tracker"]:visible').first().click(); await page.waitForTimeout(1500)
const o = await page.evaluate(() => {
  const row = document.querySelector('[data-testid="oil-row-mamba"]')
  if (!row) return 'NO ROW'
  row.scrollIntoView({ block: 'center' })
  return { text: row.innerText.replace(/\s+/g, ' ').slice(0, 400), tids: [...row.querySelectorAll('[data-testid]')].map(e => e.getAttribute('data-testid') + ':' + (e.innerText || '').replace(/\s+/g, ' ').slice(0, 40)) }
})
console.log(JSON.stringify(o, null, 1))
await L.shot(page, 'w3-04b-tracker-mamba')
const head = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="oil-range"], [data-testid="oil-window"]')].map(e => e.getAttribute('data-testid') + ':' + (e.innerText || e.value || '').replace(/\s+/g, ' ').slice(0, 60)))
console.log(head)
await browser.close()
