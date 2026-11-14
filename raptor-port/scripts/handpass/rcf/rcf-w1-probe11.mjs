/* rcf-w1 probe 11 — where is the OIL Earn button on Saturday's board */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
const KIND = process.argv[2] || 'desktop'
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w1/probe11-' + KIND)
console.log('rcf-w1-probe11 v1', KIND)
const X = await import('./rcf-w1-lib.mjs')
const { L, sleep } = X
const w = await X.world(KIND)
const { page } = w
await L.board(page, 5)
console.log(await page.evaluate(() => [...document.querySelectorAll('[data-oilmode], #sbOil')].map(e => e.tagName + '#' + e.id + ' ' + e.outerHTML.slice(0, 80) + ' vis=' + (e.offsetWidth > 0) + ' in=' + (e.closest('#schedBoard') ? 'board' : 'page')).join('\n')))
console.log(await page.evaluate(() => 'OILDAY=' + window.OILDAY + ' SBDAY=' + window.SBDAY))
console.log(await page.evaluate(() => [...document.querySelectorAll('#schedBoard .daybar, #schedBoard [class*=daybar]')].map(e => e.className + ' :: ' + e.innerText.replace(/\s+/g, ' ')).join('\n')))
await X.pic(page, 'board')
await w.browser.close()
