/* pdl-w2-probe4 v2 — the in-time line's editable box */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/w2/probe4')
console.log('pdl-w2-probe4 v2')
const P = await import('./pdl-w2-lib.mjs')
const { X, L, sleep } = P
const w = await X.world('desktop')
const { page } = w
await P.toWeek(page, '2026-07-27')
await L.board(page, 1); await sleep(400)
await P.flight(w, 1, { who: w.ID('Ranger') })
await X.press(w, '[data-itadd="1|0"]'); await sleep(500)
console.log(JSON.stringify(await page.evaluate(() => window.DAYS[1].waves[0].intimes)))
const h = await page.evaluate(() => { const g = [...document.querySelectorAll('#schedBoard [data-itadd]')].find(e => e.offsetWidth); return (() => { let e = g; for (let i = 0; i < 4; i++) e = e.parentElement; return e.outerHTML.slice(0, 3500) })() })
console.log(h)
await w.browser.close()
