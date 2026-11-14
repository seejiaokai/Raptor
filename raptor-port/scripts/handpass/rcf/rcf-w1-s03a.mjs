/* rcf-w1 S03/S12/S13 step A — exploratory: an AVALON wave, an AVALON-template desk, a named man on the desk and on an overlapping
   sortie in another wave; reads the structure, the warnings, OIL Earn before the wave flies. usage: [desktop|phone] [avalon|bb] */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
const KIND = process.argv[2] || 'desktop'
const WK = process.argv[3] || 'avalon'
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w1/s03a-' + KIND + '-' + WK)
console.log('rcf-w1-s03a v1', KIND, WK)
const X = await import('./rcf-w1-lib.mjs')
const { L, W4, sleep, norm } = X
const w = await X.world(KIND)
const { page } = w
const SAT = 5
const ranger = w.ID('Ranger')
await L.board(page, SAT)
const gA = await X.addWave(w, SAT, WK)
console.log('wave dump', await page.evaluate(g => JSON.stringify(window.DAYS[5].waves[g]).slice(0, 900), gA))
await X.press(w, '[data-dwadd="5"]')
console.log('block menu', await page.evaluate(() => [...document.querySelectorAll('.wavemenu [data-blktpl]')].map(b => b.getAttribute('data-blktpl') + '=' + b.innerText.replace(/\n/g, ' ')).join(' ; ')))
await X.press(w, `.wavemenu [data-blktpl="${WK}"]`, { scope: 'page' })
await sleep(600)
console.log('duty blocks', await page.evaluate(() => JSON.stringify(window.DAYS[5].dutywaves.map(b => ({ label: b.label, sa: b.sa, rows: b.rows.map(r => r.role + '|' + r.str + '-' + r.end + '|' + r.id) })))))
await X.pic(page, 'built')
await w.browser.close()
