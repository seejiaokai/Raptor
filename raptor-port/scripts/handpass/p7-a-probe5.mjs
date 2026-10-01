/* [DB-READINESS] phase 7 — walker A, probe 5: what a second CX press shows on a cancelled row. */
import { boot, world, fileTimed } from './p6-lib.mjs'
import * as S from './seat-lib.mjs'
import * as A from './p7-a-lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await world(L)
const iid = await fileTimed(L, p, { person: 'bane', type: 'Personal', iso: '2026-07-18', from: '10:00', to: '11:00', remarks: 'P7A' })
await W.boardOn(p, 5)
const ri = await A.rowIdx(p, 5, iid)
await A.place(S, p, 5, ri, 'extras', 'allavail')
console.log(await A.rowBtn(p, 'data-grcx', 5, ri))
const b = p.locator(`#schedBoard [data-grcx="5.${ri}"]:visible`).first()
console.log('cx button now:', await b.evaluate(e => e.outerHTML))
await b.click(); await L.sleep(600)
console.log(await p.evaluate(() => [...document.querySelectorAll('[role=dialog], .sheet, .modal, .upconf')].filter(e => e.offsetParent !== null || e.offsetWidth).map(e => e.outerHTML.slice(0, 1500))))
await L.shot(p, 'probe5-second-cx')
console.log(JSON.stringify(await A.rowOf(p, 5, iid)))
await browser.close()
