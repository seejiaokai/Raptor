import { world, done, log, rec, sleep, SAT, SAT_DI } from './on-B-lib.mjs'
const w = await world('p844')
const { page, tid, press } = w
await w.toMonth(); await w.openDay(SAT)
await press(page.locator('#icPopAdd'))
await page.waitForSelector('#inpEditPop #inpEditType')
log('types', await page.evaluate(() => [...document.querySelectorAll('#inpEditPop #inpEditType option')].map(o => o.value + '|' + o.textContent.trim())))
await done(w); process.exit(0)
