import { world, pic, sleep, go } from './aa-B-lib.mjs'
const w = await world('desk'); w.tag = 'p18'
const { page } = w
await go(page, 'logic'); await sleep(600)
await page.getByRole('button', { name: /Edit rules/ }).click(); await sleep(600)
const cell = page.locator('.lgcell', { hasText: 'Assumed length, no end time' }).first()
await cell.scrollIntoViewIfNeeded()
console.log(await cell.evaluate(e => e.outerHTML.slice(0, 500)))
await pic(w, 'editmode')
console.log(await page.evaluate(() => [...document.querySelectorAll('.lgrule')].filter(e => /Assumed length, no end time/.test(e.innerText)).map(e => e.innerHTML.slice(0, 700))))
await w.browser.close()
