import * as L from './or-C-lib.mjs'
const { browser, page: p, errs } = await L.openWorld()
const mt = (await L.fileInput(p, { type: 'Meeting', people: ['Ranger', 'Hex'], from: '2026-07-15', to: '2026-07-15', timed: ['09:00', '10:00'], title: 'Range brief' }))[0]
await L.goEdit(p)
console.log(JSON.stringify(await p.evaluate(() => window.DAYS[2].waves.map((w, gi) => ({ gi, label: w.label, kind: w.kind, f: w.formations.map((f, li) => ({ li, cs: f.cs, to: f.to, ld: f.ld, ac: f.aircraft.map((a, ai) => `${a.p ? window.PEOPLE[a.p]?.cs : '-'}/${a.w ? window.PEOPLE[a.w]?.cs : '-'}`) })) })))))
console.log(JSON.stringify(await p.evaluate(() => window.DAYS[2].ground.map(g => g.prog + '|' + g.str + '|' + g.end + '|' + (g.src ? 'input' : 'own')))))
const seats = await p.evaluate(() => [...document.querySelectorAll('#eWeek .day:not(.peek)')[2].querySelectorAll('[data-slot]')].filter(e => /^\d+\.\d+\.\d+\.\d+\.[pw]$/.test(e.getAttribute('data-slot'))).slice(0, 14).map(e => e.getAttribute('data-slot') + ' ' + (e.innerText || '').trim().slice(0, 12)))
console.log(JSON.stringify(seats))
await browser.close()
