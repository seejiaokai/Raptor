/* pdl-w1-probe4 v1 — selectors for S5: View-only week arrows, pending count button, changes window close, Reset buttons */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/w1/probe')
console.log('pdl-w1-probe4 v1')
const P = await import('./pdl-w1-lib.mjs')
const { X, L, sleep } = P
const w = await X.world('desktop')
const { page } = w
await L.go(page, 'viewsched'); await sleep(600)
console.log('view arrows', await page.evaluate(() => [...document.querySelectorAll('#page-viewsched button, #vWeek button, .wk-arrow, [class*=arrow], [data-wkstep], [data-daystep]')].filter(b => b.offsetWidth || b.offsetHeight).slice(0, 30).map(b => b.tagName + '#' + b.id + '.' + String(b.className).slice(0, 30) + '|' + [...b.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',') + '|' + b.innerText.trim().slice(0, 15)).join('\n')))
console.log('week buttons', await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetWidth && /^[‹›<>]$|Jul \d\d/.test(b.innerText.trim())).map(b => b.id + '.' + b.className + '|' + [...b.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',') + '|' + b.innerText.trim()).join('\n')))
await L.go(page, 'editsched'); await sleep(600)
console.log('dpend', await page.evaluate(() => [...document.querySelectorAll('#eWeek .dpend')].slice(0, 2).map(b => b.tagName + '.' + b.className + '|' + [...b.attributes].map(a => a.name + '=' + a.value).join(',') + '|' + b.innerText.trim())))
await w.browser.close()
