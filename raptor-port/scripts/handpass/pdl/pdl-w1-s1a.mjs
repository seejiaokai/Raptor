/* pdl-w1-s1a v1 — try-out of the fixture: S1 steps 1-2 (build Mon-Thu for Vandal) and read */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/w1/probe/s1a')
console.log('pdl-w1-s1a v1', process.env.HP_SHOTS)
const P = await import('./pdl-w1-lib.mjs')
const { X, W, L, sleep, row } = P
const w = await X.world('desktop')
const { page } = w
const man = w.ID('Vandal')
console.log('man', man, w.CS[man])
await P.openBoard(w, 0)
console.log('Mon', JSON.stringify(await P.line(w, 0, { to: '18:00', ld: '19:00', who: man })))
await X.L.closeBoard(page)
await P.openBoard(w, 1)
console.log('Tue', JSON.stringify(await P.line(w, 1, { to: '12:00', ld: '13:00', who: man })))
const bt = await P.boardRead(w, 1, man)
console.log('TUE board', JSON.stringify(bt))
await page.screenshot({ path: P.SHOTS + '/tue-board.png' })
await X.L.closeBoard(page)
const st = await P.strips(w, 1, man)
console.log('TUE strips', JSON.stringify(st))
await page.screenshot({ path: P.SHOTS + '/tue-view.png' })
console.log('errors', w.errors)
await w.browser.close()
