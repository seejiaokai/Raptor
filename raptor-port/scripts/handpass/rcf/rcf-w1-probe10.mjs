/* rcf-w1 probe 10 — the + Wave menu and an SC wave (standby shift) on Saturday */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
const KIND = process.argv[2] || 'desktop'
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w1/probe10-' + KIND)
console.log('rcf-w1-probe10 v1', KIND)
const X = await import('./rcf-w1-lib.mjs')
const { L, W4, sleep } = X
const w = await X.world(KIND)
const { page } = w
await L.board(page, 5)
await X.press(w, '[data-wvadd="5"]')
await sleep(400)
console.log(await page.evaluate(() => [...document.querySelectorAll('.wavemenu .wm, .wavemenu button')].map(b => [...b.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',') + '=' + b.innerText.replace(/\n/g, ' ').trim()).join('\n')))
await X.press(w, '.wavemenu [data-wmkind="sc"]', { scope: 'page' })
await sleep(600)
console.log(await page.evaluate(() => JSON.stringify(window.DAYS[5].waves[0])))
console.log(await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld], #schedBoard [data-slot], #schedBoard [data-wvflies], #schedBoard [data-gline]')].filter(e => e.offsetWidth && /^(ff|wl|it|st|fr|ar|at|dl)?:?5\.0|5\.0/.test(e.getAttribute('data-bfld') || e.getAttribute('data-slot') || e.getAttribute('data-gline') || '')).map(e => e.tagName + ':' + [...e.attributes].filter(a => a.name.startsWith('data-') || a.name === 'placeholder' || a.name === 'title').map(a => a.name + '=' + a.value.slice(0, 50)).join(',') + ':' + ((e.value ?? e.innerText) || '').toString().replace(/\n/g, ' ').slice(0, 14)).join('\n')))
await X.pic(page, 'sc-wave')
await w.browser.close()
