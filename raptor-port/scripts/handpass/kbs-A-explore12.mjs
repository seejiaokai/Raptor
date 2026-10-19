import { open, go, version, shot, tapBox, bringLow } from './kbs-A-lib.mjs'
version('explore12b')
const { browser, page } = await open()
await go(page, 'quals')
await tapBox(page, page.locator('#qEdit')); await page.waitForTimeout(800)
await shot(page, 'explore12-edit')
console.log(await page.evaluate(() => { const i = [...document.querySelectorAll('#page-quals input, #page-quals textarea, #page-quals [contenteditable=true], #page-quals select')].filter(e => e.getBoundingClientRect().width > 0); return [i.length, i.slice(0, 8).map(e => `${e.tagName}.${e.className} ${e.type} top=${Math.round(e.getBoundingClientRect().top)} left=${Math.round(e.getBoundingClientRect().left)} w=${Math.round(e.getBoundingClientRect().width)}`), i.slice(-3).map(e => `${e.tagName}.${e.className} ${e.type} top=${Math.round(e.getBoundingClientRect().top)}`)] }))
await browser.close()
