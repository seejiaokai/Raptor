/* [DB-READINESS] phase 7 — walker A, probe 8: what the request holds after the editor's re-date (A10's row read
   "P7 A10 till 19 Jul"), and what the editor's date line said at each click. */
import { boot, world, fileTimed } from './p6-lib.mjs'
import * as A from './p7-a-lib.mjs'
const { L, W } = await boot()
const W2 = await import('./dbrA-W2-lib.mjs')
const { browser, p, errors } = await world(L)
const iid = await fileTimed(L, p, { person: 'bane', type: 'Personal', iso: '2026-07-18', from: '10:00', to: '11:00', remarks: 'P7 probe8' })
console.log('before:', JSON.stringify(await A.reqOf(p, iid)))
await W2.openEdit(p, iid)
const read = async () => (await p.locator('#inBody tr.ined .rc-read').first().innerText()).trim()
console.log('editor date line on opening:', await read())
await p.locator('#inedCal [data-cal="2026-07-19"]').first().click(); await L.sleep(200)
console.log('after ONE click on 19 Jul:', await read())
await L.shot(p, 'probe8-editor-after-one-click')
await p.locator('#inBody tr.ined [data-save]').first().click(); await L.sleep(700)
console.log('saved:', JSON.stringify(await A.reqOf(p, iid)))
console.log('rows:', JSON.stringify(await p.evaluate(i => window.DAYS.map((d, k) => (d.ground || []).filter(r => r.src === i).map(r => ({ day: k, rmks: r.rmks, str: r.str, end: r.end }))).flat(), iid)))
console.log('errors', JSON.stringify(errors))
await browser.close()
