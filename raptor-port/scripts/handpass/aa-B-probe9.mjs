import { world, fileInput, pic, sleep, tid, go, openBoard, oilOn } from './aa-B-lib.mjs'
import { openInputs } from './lib.mjs'
const w = await world('desk')
const { page } = w
w.tag = 'p9'
const f = await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', rmk: 'p9', s: '09:00', e: '12:00', oil: 'yes' })
const g = await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'dice', rmk: 'p9named', s: '09:00', e: '12:00', oil: 'yes' })
await openBoard(page, 5)
console.log('rows', await openInputs(page, 5))
await sleep(500)
await pic(w, 'personal')
console.log(await page.evaluate(() => { const p = document.querySelector('#schedBoard .pinp'); return p ? p.outerHTML.slice(0, 5000) : 'none' }))
await w.browser.close()
