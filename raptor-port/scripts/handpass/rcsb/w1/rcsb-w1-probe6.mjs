/* rcsb-w1-probe6 v1 — W1 finds how the ALL AVAIL window opens on a programme row. */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4193'
process.env.HP_SHOTS ||= resolve(HERE, '../../../../docs/img/handpass/2026-11-13-rules-check-small-batch/w1/probe')
console.log('rcsb-w1-probe6 v1')
const C = await import('./rcsb-w1-common.mjs')
const { R, X, L, sleep, j } = C
const w = await R.world('pc')
const { page } = w
await L.board(page, 5)
await page.locator('#schedBoard [data-padd="5"]:visible').first().click(); await sleep(700)
await X.typeIn(w, '[data-bfld="ap:5.0.prog"]', 'Briefing')
await X.typeIn(w, '[data-bfld="ap:5.0.str"]', '09:00')
console.log('seat', await X.seatPhoneAware(w, '[data-fill="a:5.0.+"]', 'allavail'))
const html = await page.evaluate(() => { const r = document.querySelector('#schedBoard .sb-arow .ppl'); return r.outerHTML.replace(/\s+/g, ' ').slice(0, 1500) })
console.log('ppl html', html)
await page.screenshot({ path: process.env.HP_SHOTS + '/p6-row.png' })
// try the count chip
const chip = page.locator('#schedBoard .sb-arow .ppl .puck.allavail, #schedBoard .sb-arow .ppl [data-person="allavail"]').first()
const bb = await chip.boundingBox(); console.log('chip box', j(bb))
await chip.click({ position: { x: Math.max(2, bb.width - 8), y: bb.height / 2 } }); await sleep(900)
const vis = () => page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => e.offsetWidth && getComputedStyle(e).position === 'fixed' && e.innerText && e.innerText.length > 20 && e.innerText.length < 900).map(e => e.className + ' :: ' + e.innerText.replace(/\s+/g, ' ').slice(0, 500)).slice(0, 6))
console.log('after chip-click fixed', j(await vis()))
await page.screenshot({ path: process.env.HP_SHOTS + '/p6-after-chip.png' })
await page.keyboard.press('Escape'); await sleep(400)
// OIL earn mode text
await X.press(w, '#sbOil', {}); await sleep(800)
const t = await page.evaluate(() => { const r = document.querySelector('#schedBoard .sb-arow'); return r ? r.innerText.replace(/\s+/g, ' ') + ' | ' + [...r.querySelectorAll('[title]')].map(e => e.title).join(' || ') : '' })
console.log('row in OIL mode', t)
await page.screenshot({ path: process.env.HP_SHOTS + '/p6-oil.png' })
await w.browser.close()
