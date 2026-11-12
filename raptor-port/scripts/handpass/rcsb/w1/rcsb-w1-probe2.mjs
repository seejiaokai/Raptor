/* rcsb-w1-probe2 v1 — W1 finds the Balances row, the pending list, the version menu and View-only face. Nothing asserted. */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4193'
process.env.HP_SHOTS ||= resolve(HERE, '../../../../docs/img/handpass/2026-11-13-rules-check-small-batch/w1/probe')
console.log('rcsb-w1-probe2 v1', process.env.HP_SHOTS)
const R = await import('../rcsb-lib.mjs')
const { X, L, sleep } = R
const w = await R.world('pc')
const { page } = w
const SAT = 5, ISO = X.ISO[SAT]
const ranger = w.ID('Ranger')
const j = o => JSON.stringify(o)
await L.board(page, SAT)
const gF = await X.addWave(w, SAT, '')
await X.typeIn(w, `[data-bfld="ff:5.${gF}.0.to"]`, '10:00'); await X.typeIn(w, `[data-bfld="ff:5.${gF}.0.ld"]`, '10:30')
await X.seatPhoneAware(w, `[data-slot="5.${gF}.0.0.p"]`, ranger)
await X.signAndPublish(w, SAT)
await L.closeBoard(page)
// edit week head — picture it and dump the Saturday day card's head HTML
await L.go(page, 'editsched'); await sleep(600)
const hd = await page.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="5"]'); const h = d.querySelector('.day-head') || d; return h.outerHTML.replace(/\s+/g, ' ').slice(0, 2500) })
console.log('headHTML', hd)
await X.pic(page, 'e-head', '#eWeek .day[data-day="5"]')
const sg = await R.setLogic(w, 'oilFullMin', '5h', 'p-logic')
console.log('logic', j(sg))
await L.go(page, 'editsched'); await sleep(600)
console.log('head after', j(await L.head(page, SAT)))
await X.pic(page, 'e-head-after', '#eWeek .day[data-day="5"]')
const pend = page.locator('#eWeek .day[data-day="5"] .dpend:visible').first()
console.log('pend count', await pend.count())
if (await pend.count()) { await pend.click(); await sleep(700) }
await page.screenshot({ path: process.env.HP_SHOTS + '/p-pend.png' })
const op = await page.evaluate(() => [...document.querySelectorAll('.popover, .pop, [role=dialog], .dpop, .dlist, [data-pendlist], .modal')].filter(e => e.offsetWidth).map(e => e.className + ' :: ' + e.innerText.replace(/\s+/g, ' ').slice(0, 500)))
console.log('pendlist', j(op))
await page.keyboard.press('Escape'); await sleep(300)
// version menu
console.log('lookAt', await L.lookAt(page, SAT, /Original/))
await sleep(600)
await page.screenshot({ path: process.env.HP_SHOTS + '/p-look.png' })
console.log('head look', j(await L.head(page, SAT)))
// Balances
await X.W4.lwOpen(page, ISO)
await page.locator('[data-testid="lw-tab-balances"]').click(); await sleep(900)
await page.screenshot({ path: process.env.HP_SHOTS + '/p-bal.png' })
const bt = await page.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => e.offsetWidth && /bal|oil/i.test(e.getAttribute('data-testid'))).map(e => e.getAttribute('data-testid') + ' :: ' + e.innerText.replace(/\s+/g, ' ').slice(0, 80)).slice(0, 60))
console.log('balances', j(bt))
// view-only
await L.go(page, 'viewsched'); await sleep(600)
await X.pic(page, 'v-sat', '#vWeek .day[data-day="5"]')
console.log('view', await page.evaluate(() => document.querySelector('#vWeek .day[data-day="5"]').innerText.replace(/\s+/g, ' ').slice(0, 600)))
R.finish(w, 'probe2')
await w.browser.close()
