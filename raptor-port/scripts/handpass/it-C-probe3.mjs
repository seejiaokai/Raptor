import * as C from './it-C-lib.mjs'
const w = await C.world('desk', 'ad')
const p = w.page
const rg = await C.pid(p, 'Ranger')
await C.scShift(w, 4, rg)
console.log('base', JSON.stringify(await C.warnAll(p, 4)))
const r = await C.fileNew(w, { iso: '2026-07-17', type: 'Event', person: rg, s: '10:00', e: '11:00', rmk: 'ctl' })
console.log('saved', JSON.stringify(r), JSON.stringify(await C.recBy(p, { remarks: 'ctl' })))
console.log('after', JSON.stringify(await C.warnAll(p, 4), null, 1))
await C.openBoard(w, 4)
console.log(JSON.stringify((await C.warnLines(p)).slice(0, 8)))
await C.pic(w, 'probe3')
await w.browser.close()
