import * as C from './it-C-lib.mjs'
const w = await C.world('desk', 'ad', { fresh: false })
const p = w.page
const sb = await C.pid(p, 'Saber'), rg = await C.pid(p, 'Ranger')
console.log(sb, rg)
console.log(JSON.stringify(await C.fileNew(w, { iso: '2026-07-21', type: 'Event', person: sb, title: 'Saber briefing', s: '10:00', e: '11:00', rmk: 'sab1' })))
console.log(JSON.stringify(await C.recBy(p, { remarks: 'sab1' })))
console.log(await C.setMemberFiling(w, true))
await C.switchUser(w, 'us')
const r = await C.recBy(p, { remarks: 'sab1' })
await C.openSaved(w, '2026-07-21', r.iid)
console.log(JSON.stringify(await C.winInfo(p), null, 1))
await C.pic(w, 'probe4-ro')
await w.browser.close()
