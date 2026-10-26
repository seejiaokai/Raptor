/* [INP-OIL-CHIP-PHONE] — what the Inputs page shows today, and where the OIL chip is (a probe, 21 Oct 26) */
console.log('lk-probe-inputs v3')
const { go, shot } = await import('./lib.mjs')
const { openAt } = await import('./lk-lib.mjs')
const { browser, page } = await openAt({ width: 390, height: 844 })
await go(page, 'inputs')
await page.waitForTimeout(600)
await page.click('#inListBtn'); await page.waitForTimeout(600)
const info = await page.evaluate(() => ({
  range: document.querySelector('#inRangeBtn')?.textContent,
  roil: document.querySelectorAll('.roil').length,
  roilVisible: [...document.querySelectorAll('.roil')].filter(c => c.offsetWidth).map(c => {
    const tr = c.closest('tr'); return (tr ? tr.innerText.replace(/\s+/g, ' ').slice(0, 80) : '(no tr)') + ' | ' + c.textContent
  }),
  tables: [...document.querySelectorAll('table')].map(t => t.className + ':' + t.offsetWidth),
}))
console.log(JSON.stringify(info, null, 1))
await shot(page, 'probe-inputs-390')
await browser.close()
