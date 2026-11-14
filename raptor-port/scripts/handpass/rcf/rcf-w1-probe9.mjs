/* rcf-w1 probe 9 — an SC Shift block on Saturday: its rows, boxes, the R / B fields */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
const KIND = process.argv[2] || 'desktop'
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w1/probe9-' + KIND)
console.log('rcf-w1-probe9 v1', KIND)
const X = await import('./rcf-w1-lib.mjs')
const { L, W4, sleep } = X
const w = await X.world(KIND)
const { page } = w
await L.board(page, 5)
await X.press(w, '[data-dwadd="5"]')
await X.press(w, '.wavemenu [data-blktpl="sc"]', { scope: 'page' })
await sleep(600)
console.log(await page.evaluate(() => JSON.stringify(window.DAYS[5].dutywaves[1], null, 0)))
console.log(await page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.duty [data-bfld], #schedBoard .sb-panel.duty [data-fill], #schedBoard .sb-panel.duty button')].filter(e => e.offsetWidth).map(e => e.tagName + ':' + [...e.attributes].filter(a => a.name.startsWith('data-') || a.name === 'placeholder' || a.name === 'title').map(a => a.name + '=' + a.value.slice(0, 40)).join(',') + ':' + ((e.value ?? e.innerText) || '').toString().slice(0, 14)).join('\n')))
await X.pic(page, 'sc-block')
await w.browser.close()
