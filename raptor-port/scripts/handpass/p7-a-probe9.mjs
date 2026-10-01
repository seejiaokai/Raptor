/* [DB-READINESS] phase 7 — walker A, probe 9: the editor's re-date as a person does it (two clicks on the new date:
   the first makes a range from the old date, the second a single day) — what the request and its row then hold. */
import { boot, world, fileTimed } from './p6-lib.mjs'
import * as A from './p7-a-lib.mjs'
const { L, W } = await boot()
const W2 = await import('./dbrA-W2-lib.mjs')
const { browser, p, errors } = await world(L)
const iid = await fileTimed(L, p, { person: 'bane', type: 'Personal', iso: '2026-07-18', from: '10:00', to: '11:00', remarks: 'P7 probe9' })
console.log('before:', JSON.stringify(await A.reqOf(p, iid)))
await W2.openEdit(p, iid)
const read = async () => (await p.locator('#inBody tr.ined .rc-read').first().innerText()).trim()
const rm = async () => p.locator('#inBody tr.ined [data-ed="remarks"]').inputValue()
console.log('editor on opening: dates "' + await read() + '" remarks "' + await rm() + '"')
await p.locator('#inedCal [data-cal="2026-07-19"]').first().click(); await L.sleep(200)
console.log('after click 1 on 19 Jul: dates "' + await read() + '" remarks "' + await rm() + '"')
await p.locator('#inedCal [data-cal="2026-07-19"]').first().click(); await L.sleep(200)
console.log('after click 2 on 19 Jul: dates "' + await read() + '" remarks "' + await rm() + '"')
await L.shot(p, 'A10x-editor-after-two-clicks')
await p.locator('#inBody tr.ined [data-save]').first().click(); await L.sleep(700)
console.log('saved:', JSON.stringify(await A.reqOf(p, iid)))
console.log('Inputs line:', await W2.rowText(p, iid))
console.log('rows:', JSON.stringify(await p.evaluate(i => window.DAYS.map((d, k) => (d.ground || []).filter(r => r.src === i).map(r => ({ day: k, rmks: r.rmks }))).flat(), iid)))
console.log('errors', JSON.stringify(errors))
await browser.close()
