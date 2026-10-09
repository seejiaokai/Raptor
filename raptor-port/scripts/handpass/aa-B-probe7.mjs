import { world, fileInput, pic, sleep, tid, go, openBoard, dump, openNew } from './aa-B-lib.mjs'
const w = await world('desk')
const { page } = w
w.tag = 'p7'
await openNew(page, '2026-07-18')
await page.selectOption('#inpEditType', 'Duty')
await page.selectOption('#inpEditPerson', 'allavail')
await page.fill('#inpEditRmk', 'p7')
await page.locator('#inpEditSave').click(); await sleep(400)
await pic(w, 'oilq')
console.log(await page.evaluate(() => document.querySelector('[data-testid="oilconf"]').outerHTML.slice(0, 3000)))
await w.browser.close()
