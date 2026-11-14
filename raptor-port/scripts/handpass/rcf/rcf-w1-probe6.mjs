/* rcf-w1 probe 6 — the Calendar window from the board (#sbCal): its Holidays list and controls; and where else a Calendar opens */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
const KIND = process.argv[2] || 'desktop'
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w1/probe6-' + KIND)
console.log('rcf-w1-probe6 v1', KIND)
const X = await import('./rcf-w1-lib.mjs')
const { L, W4, sleep } = X
const w = await X.world(KIND)
const { page } = w
await L.board(page, 4)
await X.press(w, '#sbCal')
await sleep(700)
await X.pic(page, 'cal-open')
console.log(await page.evaluate(() => { const els = [...document.querySelectorAll('[role=dialog], .floatwin, .calwin, #calWin, .holwin')].filter(e => e.offsetWidth); return els.map(e => e.tagName + '#' + e.id + '.' + e.className + ' tid=' + e.getAttribute('data-testid') + ' :: ' + e.innerText.replace(/\n+/g, ' | ').slice(0, 600) + '\n   BTN: ' + [...e.querySelectorAll('button,[data-hol],input')].map(b => (b.getAttribute('data-testid') || b.id || '') + '[' + [...b.attributes].filter(a => a.name.startsWith('data-') && a.name != 'data-testid').map(a => a.name + '=' + a.value).join(',') + ']=' + (b.innerText || b.value || b.placeholder || '').trim().slice(0, 14)).join(' ; ')).join('\n') }))
await w.browser.close()
