import { world, fileInput, pic, sleep, tid, go, openBoard, oilOn } from './aa-B-lib.mjs'
const w = await world('desk')
const { page } = w
w.tag = 'p8'
const f = await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', rmk: 'p8', s: '09:00', e: '12:00', oil: 'no' })
await openBoard(page, 5)
const html = await page.evaluate(() => { const r = [...document.querySelectorAll('#schedBoard .sb-arow')].find(e => /p8/.test(e.innerHTML)); return r ? r.outerHTML : 'none' })
console.log(html.slice(0, 4500))
await pic(w, 'row')
await w.browser.close()
