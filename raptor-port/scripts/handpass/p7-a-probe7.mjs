/* [DB-READINESS] phase 7 — walker A, probe 7: in OIL Earn, what a TAP says on an inert puck / an inert item cell —
   the Personal row, and for comparison an ordinary ground row with a start and no end (D360), at phone width. */
import { boot, world, fileTimed, oilButton } from './p6-lib.mjs'
import * as S from './seat-lib.mjs'
import * as A from './p7-a-lib.mjs'
import { tap, type } from './lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await world(L, { phone: !!process.env.HP_PHONE })
await W.toastSpy(p)
const SAT = 5
const iid = await fileTimed(L, p, { person: 'bane', type: 'Personal', iso: '2026-07-18', from: '10:00', to: '11:00', remarks: 'P7 probe7' })
await W.boardOn(p, SAT)
await A.place(S, p, SAT, await A.rowIdx(p, SAT, iid), 'extras', 'all')
/* an ordinary ground row with a start and no end, Anvil on it */
await tap(p, `[data-gradd="${SAT}"]`)
const gi = await p.evaluate(() => window.DAYS[5].ground.length - 1)
await type(p, `[data-bfld="gr:${SAT}.${gi}.prog"]`, 'NOEND ROW')
await type(p, `[data-bfld="gr:${SAT}.${gi}.str"]`, '14:00')
console.log('named man on the no-end row:', JSON.stringify(await A.place(S, p, SAT, gi, 'extras', 'shaft')))
await oilButton(L, p); await L.sleep(5500); await W.toasts(p)
const inert = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .oilpk.inert, #schedBoard .oilitem.none')].filter(e => e.offsetParent !== null).map(e => ({ cls: e.className, title: e.getAttribute('title'), txt: (e.innerText || '').trim().slice(0, 30) })))
console.log('inert things on the board:', JSON.stringify(inert, null, 1))
const all = p.locator('#schedBoard .oilpk.inert:visible, #schedBoard .oilitem.none:visible')
const n = await all.count()
for (let i = 0; i < n; i++) {
  const e = all.nth(i)
  await e.evaluate(x => x.scrollIntoView({ block: 'center' })); await L.sleep(200)
  await W.toasts(p)
  const b = await e.boundingBox()
  await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await L.sleep(500)
  console.log(`tap on [${inert[i].txt}] (${inert[i].cls}) → toasts ${JSON.stringify(await W.toasts(p))} · on screen ${JSON.stringify(await S.toast(p))}`)
  await L.sleep(4500)
}
console.log('errors', JSON.stringify(errors))
await browser.close()
