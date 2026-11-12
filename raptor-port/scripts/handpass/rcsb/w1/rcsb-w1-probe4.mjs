/* rcsb-w1-probe4 v1 — W1 finds the Common Programme row's controls and the ALL AVAIL puck. Nothing asserted. */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4193'
process.env.HP_SHOTS ||= resolve(HERE, '../../../../docs/img/handpass/2026-11-13-rules-check-small-batch/w1/probe')
console.log('rcsb-w1-probe4 v1')
const C = await import('./rcsb-w1-common.mjs')
const { R, X, L, sleep, j } = C
const w = await R.world('pc')
const { page } = w
const SAT = 5
await L.board(page, SAT)
const items = await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-addprog], #schedBoard button')].filter(e => e.offsetWidth && /Item/.test(e.innerText)).map(e => e.outerHTML.slice(0, 200)))
console.log('item buttons', j(items))
const btn = page.locator('#schedBoard button:visible', { hasText: '+ Item' }).first()
await btn.scrollIntoViewIfNeeded(); await btn.click(); await sleep(700)
const rows = await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld^="ap:"], #schedBoard [data-slot^="a:"], #schedBoard [data-bfld^="a:"]')].filter(e => e.offsetWidth).map(e => e.tagName + ' ' + (e.getAttribute('data-bfld') || '') + ' ' + (e.getAttribute('data-slot') || '') + ' ' + (e.value || e.innerText || '').slice(0, 30)))
console.log('programme fields', j(rows))
const html = await page.evaluate(() => { const h = [...document.querySelectorAll('#schedBoard *')].find(e => e.offsetWidth && /COMMON PROGRAMME/.test(e.innerText || '') && e.children.length > 2 && e.innerText.length < 400); return h ? h.outerHTML.replace(/\s+/g, ' ').slice(0, 3000) : 'none' })
console.log('prog html', html)
const slots = await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-slot]')].filter(e => e.offsetWidth).map(e => e.getAttribute('data-slot')).slice(0, 40))
console.log('slots', j(slots))
const ph = await page.evaluate(() => [...document.querySelectorAll('#schedBoard *, #sbRoster *')].filter(e => e.offsetWidth && /ALL AVAIL/i.test(e.innerText || '') && e.children.length < 3).map(e => e.tagName + '.' + e.className + ' ' + (e.dataset ? JSON.stringify(e.dataset) : '') + ' :: ' + e.innerText.slice(0, 40)).slice(0, 10))
console.log('allavail', j(ph))
await page.screenshot({ path: process.env.HP_SHOTS + '/p4-board.png' })
await w.browser.close()
