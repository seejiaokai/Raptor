/* walker C — probe 7: reads only. What each day of the week of 20 Jul warns about; Sunday 19 Jul and Monday 20 Jul's
   shape (duty blocks, first wave, where Bane / Ranger sits); the next-week preview's markup on the week of 13 Jul. */
import * as C from './wh-c-lib.mjs'
const { H } = C, { L, W } = H
const { browser, p, errors } = await H.world({ who: 'a' })
await L.go(p, 'editsched')
const dump = () => p.evaluate(() => window.WARN.byDay.map((g, di) => ({ di, date: window.DATES && window.DATES[di], n: ((g || {}).warns || []).length, warns: ((g || {}).warns || []).map((w, ix) => `${ix} ${w.sev} ${w.code} ${(w.who || []).map(i => (window.PEOPLE[i] || {}).cs || i).join('+')} — ${String(w.msg).slice(0, 110)}`) })))
console.log('WEEK 13 SUNDAY', JSON.stringify((await dump())[6], null, 1))
console.log('SUNDAY 19 shape', JSON.stringify(await p.evaluate(() => { const d = window.DAYS[6]; return { keys: Object.keys(d), duty: (d.duty || []).map(b => ({ label: b.label || b.name, rows: (b.rows || []).map(r => JSON.stringify(r).slice(0, 160)) })), gos: (d.gos || d.go || []).length } }), null, 1).slice(0, 2500))
console.log('PREVIEW', JSON.stringify(await p.evaluate(() => { const pv = [...document.querySelectorAll('#eWeek .day')].filter(e => !/^[0-6]$/.test(e.dataset.day || '') || e.classList.contains('peek') || e.classList.contains('next')); return { all: [...document.querySelectorAll('#eWeek > *, #eWeek .week > *')].map(e => e.tagName + '.' + e.className + '[' + (e.dataset.day ?? '') + ']').slice(0, 30), pv: pv.map(e => e.className + '[' + e.dataset.day + ']') } })))
console.log('TO WEEK', await C.toWeek(p, C.WK2))
const w2 = await dump()
for (const d of w2) console.log(`W2 day ${d.di} ${d.date}: ${d.n}\n   ` + d.warns.join('\n   '))
console.log('MONDAY 20 flying', JSON.stringify(await p.evaluate(() => { const d = window.DAYS[0]; const out = []; (d.gos || []).forEach((g, gi) => (g.forms || g.lines || g.f || []).forEach((f, li) => out.push(gi + '.' + li + ' ' + JSON.stringify(f).slice(0, 300)))); return { keys: Object.keys(d), sample: out.slice(0, 6), raw: JSON.stringify(d).slice(0, 1500) } }), null, 1))
console.log('BANE on Mon 20', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="0"] .puck[data-person="bane"]')].map(e => { const s = e.closest('[data-slot]'); return (s ? s.dataset.slot : '?') + ' ' + e.className }))))
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
