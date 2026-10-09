import * as C from './it-C-lib.mjs'
const w = await C.world('desk', 'ad', { fresh: false })
const p = w.page
const sb = await C.pid(p, 'Saber')
await C.fileNew(w, { iso: '2026-07-21', type: 'Event', person: sb, title: 'Saber briefing', s: '10:00', e: '11:00', rmk: 'sab1' })
const r = await C.recBy(p, { remarks: 'sab1' })
await C.switchUser(w, 'us')
await C.openSaved(w, '2026-07-21', r.iid)
console.log(JSON.stringify(await C.winInfo(p), null, 1))
await C.pic(w, 'probe6-ro')
await w.browser.close()
