import { world, fileInput, pic, sleep, tid, go, openBoard, dump } from './aa-B-lib.mjs'
import { publish, lwCell, signState } from './lib.mjs'
const w = await world('desk')
const { page } = w
w.tag = 'p3'
const r = await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', rmk: 'p3', oil: 'yes' })
await openBoard(page, 5)
console.log('sign', JSON.stringify(await signState(page, 5)))
console.log('pub', JSON.stringify(await publish(page, 5)))
await pic(w, 'published')
console.log('facts', JSON.stringify(await page.evaluate(() => { try { const f = window.lwDayFacts('2026-07-18'); return typeof f === 'object' ? JSON.stringify(f).slice(0, 1500) : String(f) } catch (e) { return 'ERR ' + e.message } })))
console.log('cells', JSON.stringify(await lwCell(page, ['dice', 'shaft', 'slash', 'stiff'], '2026-07-18')))
await pic(w, 'lw')
console.log(w.errors)
await w.browser.close()
