import { open, go, version, tapBox } from './kbs-A-lib.mjs'
version('explore5d')
const { browser, page } = await open()
await go(page, 'inputs')
for (let i = 0; i < 3; i++) { await page.locator('#page-inputs button.abtn', { hasText: '‹' }).first().tap(); await page.waitForTimeout(400) }
await tapBox(page, page.locator('[data-icday="2026-07-13"]'))
await page.waitForTimeout(900)
console.log(await page.evaluate(() => { const x = [...document.querySelectorAll('[data-icday-panel], .icd, [class*=icday], [class*=ic-day]')].slice(0,3).map(e=>e.tagName+'.'+e.className); const t = [...document.querySelectorAll('*')].filter(e => (e.placeholder||e.getAttribute('data-ph')||'').toLowerCase().includes('day title')); return [x, t.map(e => e.outerHTML.slice(0,300))] }))
await browser.close()
