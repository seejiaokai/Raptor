/* rcf-w1 probe 4 — the Leave War person window: its words and closers */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
const KIND = process.argv[2] || 'desktop'
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w1/probe4-' + KIND)
console.log('rcf-w1-probe4 v1', KIND)
const X = await import('./rcf-w1-lib.mjs')
const { L, W4, sleep } = X
const w = await X.world(KIND)
const { page } = w
await W4.lwOpen(page, '2026-07-17')
const p = page.locator('[data-testid="person-razer"]:visible').first()
await p.scrollIntoViewIfNeeded()
if (w.phone) await p.tap(); else await p.click()
await sleep(700)
console.log(await page.evaluate(() => { const e = document.querySelector('[data-testid="person-window"]'); return e ? e.innerText.replace(/\n+/g, ' | ').slice(0, 700) + '\n' + [...e.querySelectorAll('button')].map(b => (b.getAttribute('data-testid') || '') + '=' + b.innerText.trim().slice(0, 14) + '/' + b.title).join(' ; ') : 'NO WINDOW' }))
console.log(await page.evaluate(() => [...document.querySelectorAll('[data-testid^="pw-"], [data-testid^="pfig"], [data-testid^="person-"]')].map(e => e.getAttribute('data-testid')).slice(0, 60).join(' ')))
await X.pic(page, 'personwin')
await w.browser.close()
