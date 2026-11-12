/* rcsb-w1-probe5 v1 — W1 dumps the Common Programme row's markup. */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4193'
process.env.HP_SHOTS ||= resolve(HERE, '../../../../docs/img/handpass/2026-11-13-rules-check-small-batch/w1/probe')
console.log('rcsb-w1-probe5 v1')
const C = await import('./rcsb-w1-common.mjs')
const { R, X, L, sleep, j } = C
const w = await R.world('pc')
const { page } = w
await L.board(page, 5)
await page.locator('#schedBoard [data-padd="5"]:visible').first().click(); await sleep(700)
const html = await page.evaluate(() => { const e = document.querySelector('#schedBoard [data-bfld="ap:5.0.end"]'); const r = e.parentElement.parentElement; return r.outerHTML.replace(/\s+/g, ' ').slice(0, 2500) })
console.log(html)
await w.browser.close()
