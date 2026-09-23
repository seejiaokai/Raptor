/* [HUMAN-RETEST] Tracker — walker w2: does turning on "Edit chart layout" move
   the chart when it has been scrolled? (seen while walking item 11) */
import { open, shot, reveal, DESK } from './trk-lib.mjs'
import { sleep, centreOf, tapBall, scrollOf } from './trk-w2-lib.mjs'
const { browser, page, errors } = await open({ size: DESK, who: 'a' })
for (const id of ['ACG-04', 'BFM-3']) {
  await reveal(page, id); await sleep(250)
  const before = await centreOf(page, id); const s = await scrollOf(page)
  await page.click('#sylMenuBtn'); await page.waitForSelector('#arrangeBtn', { state: 'visible' }); await page.click('#arrangeBtn'); await sleep(500)
  const on = await centreOf(page, id)
  await shot(page, 'w2-11-arrange-on-after-scroll-' + id)
  await page.click('#sylMenuBtn'); await page.waitForSelector('#arrangeBtn', { state: 'visible' }); await page.click('#arrangeBtn'); await sleep(500)
  const off = await centreOf(page, id)
  console.log(id, 'scroll', JSON.stringify(s), 'centre before', JSON.stringify(before), '→ edit on', JSON.stringify(on), '→ edit off', JSON.stringify(off))
}
/* the walk-9 order: details editor on ACG-04 (tap, Edit details, Escape), then edit mode */
await tapBall(page, 'ACG-04'); await page.click('#popEditInfo'); await sleep(300); await page.keyboard.press('Escape'); await sleep(300)
const b2 = await centreOf(page, 'ACG-04')
await page.click('#sylMenuBtn'); await page.waitForSelector('#arrangeBtn', { state: 'visible' }); await page.click('#arrangeBtn'); await sleep(500)
const o2 = await centreOf(page, 'ACG-04')
console.log('after the details editor: ACG-04', JSON.stringify(b2), '→ edit on', JSON.stringify(o2))
await shot(page, 'w2-11-arrange-on-after-details')
console.log('errors', errors)
await browser.close()
