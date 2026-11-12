/* rcf-w1 probe 8 — the "+ Block" menu on Saturday; and Saturday's content */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
const KIND = process.argv[2] || 'desktop'
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w1/probe8-' + KIND)
console.log('rcf-w1-probe8 v1', KIND)
const X = await import('./rcf-w1-lib.mjs')
const { L, W4, sleep } = X
const w = await X.world(KIND)
const { page } = w
await L.board(page, 5)
console.log(await page.evaluate(() => { const d = window.DAYS[5]; return JSON.stringify({ waves: d.waves.length, duty: d.dutywaves.map(b => [b.label, b.rows.map(r => r.role + '|' + r.str + '-' + r.end + '|' + r.id)]), ground: d.ground.length, sims: d.sims.oft.length }) }))
await X.press(w, '[data-dwadd="5"]')
await sleep(500)
await X.pic(page, 'blockmenu')
console.log(await page.evaluate(() => [...document.querySelectorAll('.wavemenu, .tplmenu, [role=menu]')].filter(e => e.offsetWidth).map(e => e.className + ' :: ' + e.innerText.replace(/\n+/g, ' | ').slice(0, 400) + ' BTN ' + [...e.querySelectorAll('button, .wm')].map(b => [...b.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',') + '=' + b.innerText.trim().slice(0, 16)).join(' ; ')).join('\n')))
await w.browser.close()
