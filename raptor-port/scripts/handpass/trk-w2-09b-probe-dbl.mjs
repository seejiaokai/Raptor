/* [HUMAN-RETEST] Tracker — walker w2: why did a double-click not open the ball editor? */
import { open, shot, reveal, DESK } from './trk-lib.mjs'
import { sleep, centreOf } from './trk-w2-lib.mjs'
const { browser, page, errors } = await open({ size: DESK, who: 'a' })
await page.click('#sylMenuBtn'); await page.waitForSelector('#arrangeBtn', { state: 'visible' }); await page.click('#arrangeBtn'); await sleep(450)
const bb = await page.locator('#flowSvg .ball[data-id="ACG-04"]').first().boundingBox()
const c0 = await centreOf(page, 'ACG-04')
const hit0 = await page.evaluate(({ x, y }) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '.' + (e.getAttribute('class') || '') + ' in ' + ((e.closest('.ball') || {}).dataset || {}).id : null }, c0)
console.log('arrange on; ACG-04 box', JSON.stringify(bb), 'centre', JSON.stringify(c0), 'hit', hit0)
await shot(page, 'w2-11-probe-arrange')
const ok = await reveal(page, 'ACG-04'); const c1 = await centreOf(page, 'ACG-04')
const hit1 = await page.evaluate(({ x, y }) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '.' + (e.getAttribute('class') || '') + ' in ' + ((e.closest('.ball') || {}).dataset || {}).id : null }, c1)
console.log('after reveal', ok, JSON.stringify(c1), 'hit', hit1)
await page.mouse.dblclick(c1.x, c1.y); await sleep(500)
console.log('editor open?', await page.locator('#editModal').isVisible().catch(() => false))
await shot(page, 'w2-11-probe-dbl')
console.log('errors', errors)
await browser.close()
