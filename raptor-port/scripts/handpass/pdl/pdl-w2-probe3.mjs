/* pdl-w2-probe3 v1 — build a flight on Tue 28 Jul, find the In-time button, look at warnings */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/w2/probe3')
console.log('pdl-w2-probe3 v1', process.env.HP_SHOTS)
const P = await import('./pdl-w2-lib.mjs')
const { X, L, sleep } = P
const w = await X.world('desktop')
const { page } = w
await P.toWeek(page, '2026-07-27')
const A = w.ID('Ranger')
await L.board(page, 1); await sleep(400)
const r = await P.flight(w, 1, { who: A })
console.log('flight', JSON.stringify(r))
const btns = await page.evaluate(() => [...document.querySelectorAll('#schedBoard button')].filter(b => b.offsetWidth).map(b => b.innerText.trim().replace(/\s+/g, ' ') + ' | ' + [...b.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(';')).filter(s => /in-time|IN-TIME|\+/i.test(s)))
console.log(JSON.stringify(btns, null, 1))
await page.screenshot({ path: process.env.HP_SHOTS + '/board1.png' })
console.log(JSON.stringify(await X.boardWarn(page, w)))
console.log('days', await page.evaluate(() => JSON.stringify(window.DAYS[1].waves)).then(s => s.slice(0, 1500)))
await X.press(w, '[data-itadd="1|0"]'); await sleep(500)
console.log('intimes', JSON.stringify(await page.evaluate(() => window.DAYS[1].waves[0].intimes)))
console.log(JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#schedBoard input, #schedBoard [contenteditable]')].filter(b => b.offsetWidth && /it:/.test(b.getAttribute('data-bfld')||'')).map(b => [...b.attributes].map(a=>a.name+'='+a.value).join(';')))))
await page.screenshot({ path: process.env.HP_SHOTS + '/board2.png' })
await w.browser.close()
