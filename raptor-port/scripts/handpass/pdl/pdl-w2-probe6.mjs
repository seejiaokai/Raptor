/* pdl-w2-probe6 v1 — ALL AVAIL on a ground row: how to place and how to open its count */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/w2/probe6')
console.log('pdl-w2-probe6 v1')
const P = await import('./pdl-w2-lib.mjs')
const { X, L, sleep } = P
const FX = await import('../rcf/rcf-w2-fx.mjs')
const w = await X.world('desktop')
const { page } = w
await P.toWeek(page, '2026-07-27')
await L.board(page, 1); await sleep(400)
await P.flight(w, 1, { to: '1200', ld: '1300', who: w.ID('Ranger') })
const g = await P.ground(w, 1, { prog: 'BRIEFING', str: '1430', end: '1500', who: null })
console.log('ground', JSON.stringify(g))
const from = page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first()
console.log('roster puck', await from.count())
await from.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
const to = page.locator(`#schedBoard [data-fill="g:1.${g.ri}.+"]:visible`).first()
await to.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
console.log('to', await to.count(), await to.boundingBox(), await from.boundingBox())
await page.screenshot({ path: process.env.HP_SHOTS + '/pre-drag.png' })
console.log('toast', await FX.dragBox(page, from, to))
console.log('ground', await page.evaluate(() => JSON.stringify(window.DAYS[1].ground)))
await page.screenshot({ path: process.env.HP_SHOTS + '/post-drag.png' })
console.log(await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-person="allavail"]')].filter(e => e.offsetWidth).map(e => e.outerHTML.slice(0, 600))))
const chip = await page.evaluate(() => { const r = document.querySelector('#schedBoard .puck.allavail.sm')?.closest('.sb-grow, tr, .grow, div'); const c = [...document.querySelectorAll('#schedBoard [data-fill="g:1.0.+"], #schedBoard .gcell')].map(e => e.outerHTML.slice(0, 900)); return c })
console.log(JSON.stringify(chip))
await w.browser.close()
