import * as L from './it-B-lib.mjs'
const W = await L.newWorld()
const p = W.page
const ranger = await L.csId(p, 'Ranger')
const out = {}
await L.fileInput(W, { iso: '2026-07-15', type: 'Event', person: ranger, s: '09:00', e: '10:00', rmk: 'probe' })
const r = await L.recBy(p, { person: ranger, type: 'Event' })
out.rec = r
out.face0 = await L.face(p, 2)
await L.shot(p, 'probe-face0')
out.pub = await L.pubDay(W, 2)
out.face1 = await L.face(p, 2)
out.view1 = await L.viewFace(p, 2)
await L.retitle(W, r.iid, '2026-07-15', 'Sports day')
out.face2 = await L.face(p, 2)
out.togo = await L.toGoOut(p, 2)
await L.shot(p, 'probe-togo')
await L.closeTop(p)
out.view2 = await L.viewFace(p, 2)
console.log(JSON.stringify(out, null, 1))
console.log(L.ERRS)
await W.browser.close()
