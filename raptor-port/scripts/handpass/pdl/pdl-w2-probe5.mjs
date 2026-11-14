/* pdl-w2-probe5 v1 — the Insights window: how it opens and what it holds */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/w2/probe5')
console.log('pdl-w2-probe5 v1')
const P = await import('./pdl-w2-lib.mjs')
const { X, L, sleep } = P
const w = await X.world('desktop')
const { page } = w
await P.toWeek(page, '2026-07-27')
await L.board(page, 1); await sleep(400)
await P.flight(w, 1, { to: '1200', ld: '1300', who: w.ID('Ranger') })
await P.ground(w, 1, { str: '1530', end: '1600', who: w.ID('Ranger') })
await L.closeBoard(page)
await L.go(page, 'editsched'); await sleep(500)
const b = page.locator('button:visible', { hasText: /^Insights$/ }).first()
console.log('insights btn', await b.count(), await b.evaluate(e => [...e.attributes].map(a => a.name + '=' + a.value).join(';')))
await b.click(); await sleep(1200)
await page.screenshot({ path: process.env.HP_SHOTS + '/insights.png' })
const t = await page.evaluate(() => { const m = [...document.querySelectorAll('[role=dialog], .modal, .win, [id*=nsight]')].filter(e => e.offsetWidth); return m.map(e => e.id + '|' + e.className + '|' + e.innerText.replace(/\s+/g, ' ').slice(0, 1500)) })
console.log(JSON.stringify(t, null, 1))
await w.browser.close()
