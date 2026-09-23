/* w3 item 13, follow-up 3: pictures of the mid-edit wrap at 1200px (admin):
   arrange on → before the first edit → + Test → after. */
import { open, shot, save, log } from './trk-lib.mjs'
import { sleep, menuItem, dlg, box } from './trk-w3-lib.mjs'
const L = log()
const { browser, page, errors } = await open({ size: { width: 1200, height: 800 }, who: 'a' })
await menuItem(page, 'syl', 'arrangeBtn')
const b0 = await box(page, '#board'), h0 = await box(page, '#page-tracker header')
await shot(page, 'w3-13d-1200-arranging-before-edit')
await page.locator('#arrTools button', { hasText: '+ Test' }).click(); await sleep(250); await dlg(page, { value: 'WRAP-1' }); await sleep(400)
const b1 = await box(page, '#board'), h1 = await box(page, '#page-tracker header')
await shot(page, 'w3-13d-1200-arranging-after-edit')
L.ok('1200px, arranging: the first structure edit does not grow the bar or move the chart', h0.h === h1.h && b0.y === b1.y, `bar ${h0.h} → ${h1.h}px; chart top ${b0.y} → ${b1.y}; status "${await page.locator('#saveStat').innerText()}"`)
L.note('errors', errors.join(' | ') || 'none')
save('w3-13d-wrap-pictures', { rows: L.rows })
await browser.close()
