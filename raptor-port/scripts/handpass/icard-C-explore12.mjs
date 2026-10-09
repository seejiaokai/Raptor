import * as L from './icard-C-lib.mjs'
const { sleep } = L
const w = await L.world('phone', 'ad')
const p = w.page
await L.fileNew(w, { iso: '2026-07-18', type: 'Duty', title: 'Three on duty', several: ['Ace', 'Ranger', 'Saber'], s: '09:00', e: '12:00', oil: 'yes' })
await L.openBoard(w, 5)
await L.pic(w, 'x12-board')
console.log('SBDAY', await p.evaluate(() => window.SBDAY))
await L.oilMode(w, true)
await L.pic(w, 'x12-oilmode')
console.log(await p.evaluate(() => [...document.querySelectorAll('#schedBoard .pl-row.gr-frominput')].map(r => r.innerText.replace(/\s+/g, ' ').slice(0, 100) + ' || ' + [...r.querySelectorAll('.seat, .puck')].map(s => (s.className + '|' + (s.dataset.oilp || s.dataset.person || ''))).join(' ; '))))
console.log(await p.evaluate(() => [...document.querySelectorAll('#schedBoard .oilpk')].slice(0, 12).map(s => s.className + '|' + s.dataset.oilp + '|' + s.innerText.slice(0, 20))))
console.log(w.errors)
await w.browser.close()
