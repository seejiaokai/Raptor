/* rcf-w1 S18 step A — build Friday: SDO desk retimed 08:00-16:00 (Bolt), a flying line with no times (Ranger); read the
   board's warnings; publish; read the Leave War credit. Desktop exploratory run (prints everything it reads). */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w1/s18a')
console.log('rcf-w1-s18a v1')
const X = await import('./rcf-w1-lib.mjs')
const { L, W4, check, note, norm, sleep } = X
const w = await X.world('desktop')
const { page } = w
const FRI = 4, ISO = X.ISO[FRI]
const bolt = w.ID('Bolt'), ranger = w.ID('Ranger')
console.log('ids', bolt, ranger)
await L.board(page, FRI)
await X.typeIn(w, '[data-bfld="dr:4.0.0.str"]', '08:00')
await X.typeIn(w, '[data-bfld="dr:4.0.0.end"]', '16:00')
console.log('duty', await page.evaluate(() => JSON.stringify(window.DAYS[4].dutywaves[0].rows.map(r => [r.role, r.str, r.end, r.id]))))
const gi = await X.addWave(w, FRI, '')
console.log('wave idx', gi)
await X.typeIn(w, `[data-bfld="ff:4.${gi}.0.cs"]`, 'VIPER')
console.log('seat', await X.seat(w, `[data-slot="4.${gi}.0.0.p"]`, ranger))
await page.keyboard.press('Escape')
console.log('wave', await page.evaluate(g => JSON.stringify(window.DAYS[4].waves[g]), gi))
console.log('board warn', JSON.stringify(await X.boardWarn(page), null, 1))
await X.pic(page, 'a1-board')
const sp = await X.signAndPublish(w, FRI)
console.log('publish', JSON.stringify(sp))
console.log('board warn after', JSON.stringify(await X.boardWarn(page), null, 1))
await X.pic(page, 'a2-after-publish')
await L.closeBoard(page)
const b0 = await X.lwBox(w, bolt, ISO)
console.log('Bolt war box', JSON.stringify(b0), JSON.stringify(await X.lwOil(w, bolt, ISO)))
const r0 = await X.lwBox(w, ranger, ISO)
console.log('Ranger war box', JSON.stringify(r0))
console.log('errors', w.errors)
await w.browser.close()
