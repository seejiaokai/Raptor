/* probe 7: inputs types, the role badge, week chips, next week, exports, Leave War, Saturday (own world, thrown away) */
import * as A from './ins-a-lib.mjs'
const { L, W } = A
const { browser, p, errors } = await A.world()
const log = (k, v) => console.log(`## ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`.slice(0, 2600))
const step = async (k, f) => { try { log(k, await f()) } catch (e) { log(k + ' ERR', String(e).slice(0, 300)) } }
await step('pages', () => p.evaluate(() => [...document.querySelectorAll('[id^="page-"]')].map(e => e.id)))
await step('nav', () => p.evaluate(() => [...document.querySelectorAll('nav button, .nav button, header [data-go], [data-page]')].filter(e => e.offsetParent !== null).map(e => (e.dataset.go || e.dataset.page || e.id) + ':' + e.innerText.trim()).slice(0, 20)))
await L.go(p, 'inputs')
await step('inType', () => p.evaluate(() => [...document.querySelectorAll('#inType option')].map(o => o.value + ':' + o.text)))
await step('inPerson', () => p.evaluate(() => document.querySelectorAll('#inPerson option').length))
await step('badge', async () => { await p.locator('#roleBadge').click(); await L.sleep(400); const r = await p.evaluate(() => [...document.querySelectorAll('button, [role=menuitem]')].filter(e => e.offsetParent !== null && /member|view|switch/i.test(e.innerText)).map(e => (e.id || e.className) + ':' + e.innerText.trim().slice(0, 50))); await A.pic(p, 'probe7-badge'); await p.keyboard.press('Escape'); return r })
await A.toEdit(p)
await step('week2', async () => { await p.locator('button.wk[data-wk="20/07/2026"]:visible').first().click(); await L.sleep(900); const r = await p.evaluate(() => ({ wk: window.CURWEEK, days: window.DAYS.map(d => d.dt + ':' + (d.waves || []).reduce((n, w) => n + w.formations.reduce((m, f) => m + f.aircraft.length, 0), 0)) })); const i = await A.insNow(p); return { r, title: i.title, sum: A.sum(i).slice(0, 300), days: A.sec(i, /By day/i) } })
await step('back', async () => { await p.locator('button.wk[data-wk="13/07/2026"]:visible').first().click(); await L.sleep(900); return p.evaluate(() => window.CURWEEK) })
await step('weekcal', async () => { await p.locator('button.wk-cal:visible').first().click(); await L.sleep(500); const r = await p.evaluate(() => { const m = [...document.querySelectorAll('.modal:not([hidden]), .pop:not([hidden]), [id*=weekCal], [class*=weekcal], [class*=wkcal]')].filter(e => e.offsetParent !== null).map(e => (e.id || e.className) + ' :: ' + e.innerText.replace(/\s+/g, ' ').slice(0, 200)); return m }); await A.pic(p, 'probe7-weekcal'); await p.keyboard.press('Escape'); return r })
await step('weekcal dom', () => p.evaluate(() => [...document.querySelectorAll('[data-cal], [data-wkpick], [data-wcday]')].filter(e => e.offsetParent !== null).slice(0, 6).map(e => e.outerHTML.slice(0, 120))))
await step('sat', () => p.evaluate(() => { const d = window.DAYS[5]; return JSON.stringify({ dw: d.dutywaves, g: d.ground, a: d.allhands }).slice(0, 600) }))
await step('exports', () => p.evaluate(() => ['exportSched', 'exportPdf'].map(i => { const e = document.getElementById(i); return i + ':' + (e ? e.title : 'absent') })))
await L.go(p, 'leavewar'); await L.sleep(800)
await A.pic(p, 'probe7-leavewar')
await step('leavewar', () => p.evaluate(() => { const pg = document.querySelector('#page-leavewar'); return { len: pg.innerText.length, head: pg.innerText.replace(/\s+/g, ' ').slice(0, 500), btns: [...pg.querySelectorAll('button')].filter(e => e.offsetParent !== null).map(e => e.innerText.trim().slice(0, 18)).filter(Boolean).slice(0, 30) } }))
console.log('errors', errors)
await browser.close()
