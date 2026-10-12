import { launch, world, bye, FRI, THU } from './on-D-lib.mjs'
const browser = await launch()
const w = await world(browser, { tag: 'P5' }); const { page, tid } = w
await w.toMonth(); await w.openDay(THU)
await w.press(page.locator('#icPopAdd'))
await page.waitForSelector('#inpEditPop #inpEditType')
await page.selectOption('#inpEditPop #inpEditType', 'Training')
console.log(await page.evaluate(() => [...document.querySelectorAll('#inpEditPop [id],#inpEditPop [data-testid]')].filter(e => e.offsetParent).map(e => (e.id || e.getAttribute('data-testid')) + ':' + (e.innerText || e.value || '').replace(/\s+/g, ' ').slice(0, 40)).join(' | ')))
await w.shot('probe5b')
await bye(w); await browser.close()
