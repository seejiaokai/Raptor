/* [HUMAN-RETEST] Tracker — walker w2: read-only look at Edit Schedule after a
   Tracker mark — what its Undo says, what its Edit history lists, and which
   text boxes a person could type a small schedule edit into. */
import { open, shot, toPage, DESK } from './trk-lib.mjs'
import { sleep, tapBall } from './trk-w2-lib.mjs'

const { browser, page, errors } = await open({ size: DESK, who: 'a' })
await tapBall(page, 'ST-06'); await page.locator('#pop button', { hasText: 'DCO' }).click(); await sleep(500)
await toPage(page, 'editsched'); await sleep(600)
const u = await page.evaluate(() => { const b = document.getElementById('undoBtn'), r = document.getElementById('redoBtn'); return { undo: b && { off: b.disabled, t: b.title }, redo: r && { off: r.disabled, t: r.title } } })
console.log('Edit Schedule undo/redo after a Tracker mark:', JSON.stringify(u))
const boxes = await page.evaluate(() => [...document.querySelectorAll('#vWeek input, #vWeek textarea, #vWeek [contenteditable="true"]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top > 0 && r.top < innerHeight }).slice(0, 12).map(e => ({ tag: e.tagName, k: e.dataset.k || e.getAttribute('data-k') || '', ph: e.placeholder || '', id: e.id, cls: String(e.className).slice(0, 40), box: (() => { const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] })() })))
console.log('typeable boxes on screen:', JSON.stringify(boxes, null, 1))
await page.click('#histBtn').catch(e => console.log('no histBtn', e.message)); await sleep(500)
const hist = await page.evaluate(() => { const m = document.querySelector('.sheet, [role=dialog], .modal'); return m ? m.innerText.replace(/\s+/g, ' ').slice(0, 800) : '(no sheet)' })
console.log('Edit history:', hist)
await shot(page, 'w2-08-editsched-history-after-tracker-mark')
console.log('errors', errors)
await browser.close()
