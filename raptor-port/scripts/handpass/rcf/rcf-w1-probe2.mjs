/* rcf-w1 probe 2 — which people the Leave War draws, their Friday/Saturday boxes, and the people roster (read only) */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w1/probe2')
console.log('rcf-w1-probe2 v1')
const X = await import('./rcf-w1-lib.mjs')
const { L, W4 } = X
const w = await X.world('desktop')
const { page } = w
await W4.lwOpen(page, '2026-07-17')
const rows = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].map(r => r.getAttribute('data-testid').slice(4)))
console.log('war rows', rows.length, rows.map(id => id + ':' + w.CS[id]).join(' '))
console.log('people', await page.evaluate(() => Object.entries(window.PEOPLE).map(([k, p]) => `${k}:${p.cs}:${p.seat}${p.sans ? ':sans' : ''}${p.grd ? ':grd' : ''}${p.arch ? ':arch' : ''}`).join(' ')))
const hd = await X.lwHead(page, '2026-07-17')
console.log('head', JSON.stringify(hd), JSON.stringify(await X.lwHead(page, '2026-07-18')))
await X.pic(page, 'war')
await w.browser.close()
