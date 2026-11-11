/* rcf-w1 probe 5 — the window the war's PH opens (oilday) on desktop / phone */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
const KIND = process.argv[2] || 'desktop'
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w1/probe5-' + KIND)
console.log('rcf-w1-probe5 v1', KIND)
const X = await import('./rcf-w1-lib.mjs')
const { L, W4, sleep } = X
const w = await X.world(KIND)
const { page } = w
const e = await X.lwEvent(w, '2026-07-17', 'PH')
console.log(JSON.stringify(e))
await X.pic(page, 'after-ph')
console.log(await page.evaluate(() => { const e = document.querySelector('[data-testid="win-oilday"]'); return e ? (e.offsetWidth ? 'VISIBLE ' : 'hidden ') + e.innerText.replace(/\n+/g, ' | ').slice(0, 500) + '\n' + [...e.querySelectorAll('button')].map(b => (b.getAttribute('data-testid') || '') + '=' + b.innerText.trim().slice(0, 14) + '/' + b.title).join(' ; ') : 'NO oilday WINDOW' }))
await w.browser.close()
