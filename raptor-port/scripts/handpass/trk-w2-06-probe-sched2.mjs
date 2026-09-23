/* [HUMAN-RETEST] Tracker — walker w2: read-only — the typeable boxes on Edit Schedule. */
import { open, toPage, DESK } from './trk-lib.mjs'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const { browser, page } = await open({ size: DESK, who: 'a', tracker: false })
await toPage(page, 'editsched'); await sleep(800)
const boxes = await page.evaluate(() => [...document.querySelectorAll('input, textarea, [contenteditable="true"]')].filter(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && r.top > 60 && r.top < innerHeight && cs.visibility !== 'hidden' && !e.closest('#page-tracker') }).slice(0, 25).map(e => ({ tag: e.tagName, type: e.type || '', k: e.dataset.k || '', ph: e.placeholder || '', id: e.id, val: (e.value || e.textContent || '').slice(0, 30), cls: String(e.className).slice(0, 50), box: (() => { const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] })() })))
console.log(JSON.stringify(boxes, null, 0).replace(/\},\{/g, '},\n{'))
await browser.close()
