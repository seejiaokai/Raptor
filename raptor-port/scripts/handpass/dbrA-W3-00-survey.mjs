/* W3 survey — a fresh desktop world: the first boot's rows by collection, its one `boot` batch, and what the Leave War
   holds (its periods, stages, bidding windows, who is on the grid, the demo's records) so the walk picks real days. */
import { fileURLToPath } from 'node:url'
const ROOT0 = fileURLToPath(new URL('../../', import.meta.url)).split('\\').join('/').replace(/\/$/, '')
process.env.HP_OUT ||= `${ROOT0}/docs/handpass/parts/dbrA-W3-00-survey.json`
const W = await import('./dbrA-W3-lib.mjs')
const { L, lwOpen, warPick, stageNow, pic } = W

const browser = await L.launch()
const ctx = await L.context(browser)
const errors = []
const page = await W.newPage(ctx, errors, 'A')
await L.signIn(page, 'a')
await L.settle(page)
const r0 = await L.rows(page)
const byCol = {}
for (const k of Object.keys(r0)) { const c = k.split('/')[0]; byCol[c] = (byCol[c] || 0) + 1 }
const batches = Object.keys(r0).filter(k => k.startsWith('changes/')).map(k => { try { const b = JSON.parse(r0[k]); return { key: k, type: b.type, n: (b.items || []).length } } catch { return { key: k, bad: true } } })
console.log('rows by collection', byCol)
console.log('batches', batches)
L.check('first boot wrote ONE change-log batch, of type boot', batches.length === 1 && batches[0].type === 'boot', batches)
const lwKeys = Object.keys(r0).filter(k => k.startsWith('leavewar/'))
const lwKinds = {}
for (const k of lwKeys) { const c = k.slice(9).split(':')[0]; lwKinds[c] = (lwKinds[c] || 0) + 1 }
console.log('leavewar rows by kind', lwKinds)
const wars = lwKeys.filter(k => k.startsWith('leavewar/war:')).map(k => { const w = JSON.parse(r0[k]); return { key: k, id: w.id, name: w.name, stage: w.stage, start: w.start, end: w.end, bidFrom: w.bidFrom, bidTo: w.bidTo, ord: w.ord, days: Array.isArray(w.days) ? w.days.length : typeof w.days } })
console.log('wars', JSON.stringify(wars, null, 1))
const settingsLike = lwKeys.filter(k => !/^leavewar\/(war|rec|ledger|opening|profile):/.test(k))
console.log('settings-like', settingsLike)

await lwOpen(page)
const wp = await warPick(page)
console.log('picker', wp, 'stage', await stageNow(page))
const people = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="person-"]')].map(e => ({ id: e.getAttribute('data-testid').slice(7), t: (e.innerText || '').replace(/\s+/g, ' ').trim() })))
console.log('people on grid', people.length, JSON.stringify(people.slice(0, 60)))
const months = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="month-"]')].map(e => e.getAttribute('data-testid')))
console.log('months', months)
const viewer = await page.evaluate(() => ({ cur: window.CURPAGE, me: (window.PEOPLE && Object.entries(window.PEOPLE).filter(([, v]) => /ranger|saber/i.test(v.cs || '')).map(([k, v]) => [k, v.cs])) }))
console.log('viewer', viewer)
/* the demo's records: per (pid,date) how many, and the kinds */
const recs = {}
for (const k of lwKeys.filter(k => k.startsWith('leavewar/rec:'))) {
  const o = JSON.parse(r0[k]); const a = `${o.pid}@${o.date}`
  ;(recs[a] ||= []).push(`${o.kind}:${o.code}${o.state ? '/' + o.state : ''}${o.oil ? '/' + o.oil : ''}#${o.ord}`)
}
const multi = Object.entries(recs).filter(([, v]) => v.length > 1)
console.log('rec addresses', Object.keys(recs).length, 'with 2+ records', multi.length, JSON.stringify(multi.slice(0, 10)))
console.log('sample recs', JSON.stringify(Object.entries(recs).slice(0, 25)))
const ledger = lwKeys.filter(k => k.startsWith('leavewar/ledger:')).slice(0, 5).map(k => r0[k])
console.log('ledger sample', ledger)
await pic(page, 'S0-war-on-open')
L.check('no console errors on the survey', !errors.length, errors)
L.save({ byCol, batches, lwKinds, wars, settingsLike, picker: wp, people, months })
await browser.close()
