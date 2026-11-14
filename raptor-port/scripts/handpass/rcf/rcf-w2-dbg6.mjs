console.log('rcf-w2-dbg6 v1 — Inputs page')
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w2/dbg6')
const W = await import('./rcf-w2-lib.mjs')
const { L, sleep } = W
const browser = await W.launch()
const { page } = await W.world(browser)
await L.go(page, 'inputs'); await sleep(800)
console.log(await page.evaluate(() => [...document.querySelectorAll('#page-inputs button, #page-inputs select, #page-inputs input, #page-inputs [id]')].filter(e => e.getBoundingClientRect().width > 0).slice(0, 60).map(e => e.tagName + '#' + e.id + '.' + String(e.className).slice(0, 30) + ' ' + (e.innerText || e.value || '').slice(0, 25)).join('\n')))
await W.shot(page, 'inputs')
await browser.close()
