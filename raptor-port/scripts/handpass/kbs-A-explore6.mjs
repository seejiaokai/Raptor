import { open, go, version, shot, tapBox } from './kbs-A-lib.mjs'
version('explore6')
const { browser, page } = await open()
await go(page, 'inputs')
for (let i = 0; i < 3; i++) { await page.locator('#page-inputs button.abtn', { hasText: '‹' }).first().tap(); await page.waitForTimeout(400) }
await tapBox(page, page.locator('[data-icday="2026-07-13"]'))
await page.waitForTimeout(900)
await tapBox(page, page.getByRole('button', { name: '+ Input' }))
await page.waitForTimeout(900)
await shot(page, 'explore6-newinput')
console.log(await page.evaluate(() => [...document.querySelectorAll('input,textarea,select')].filter(e => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().top > 0).map(e => `${e.tagName}#${e.id}.${String(e.className).slice(0,20)} ${e.type} top=${Math.round(e.getBoundingClientRect().top)} bot=${Math.round(e.getBoundingClientRect().bottom)}`)))
await browser.close()
