import { open, go, version, shot, tapBox } from './kbs-A-lib.mjs'
version('explore7')
const { browser, page } = await open()
await go(page, 'inputs')
await tapBox(page, page.locator('button.intab', { hasText: 'SANS' }))
await page.waitForTimeout(700)
for (let i = 0; i < 3; i++) { await page.locator('#page-inputs button.abtn', { hasText: '‹' }).first().tap(); await page.waitForTimeout(400) }
console.log(await page.evaluate(() => [...document.querySelectorAll('#page-inputs button, #page-inputs [data-testid]')].filter(e => e.getBoundingClientRect().width > 0).slice(0, 25).map(e => `${e.tagName}.${String(e.className).slice(0,20)} "${e.textContent.trim().slice(0,15)}" tid=${e.getAttribute('data-testid')} top=${Math.round(e.getBoundingClientRect().top)}`)))
console.log(await page.evaluate(() => document.querySelector('[data-testid^="sc-"], [data-icday], [data-scday]') && document.querySelector('[data-icday],[data-scday],[data-testid^=sc-day]').outerHTML.slice(0, 200)))
await shot(page, 'explore7-sans')
await browser.close()
