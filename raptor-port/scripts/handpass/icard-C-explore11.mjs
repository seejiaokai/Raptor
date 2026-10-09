import * as L from './icard-C-lib.mjs'
const { sleep } = L
const w = await L.world('phone', 'ad')
const p = w.page
await L.fileNew(w, { iso: '2026-07-22', type: 'Duty', several: ['Ace', 'Ranger', 'Saber'], s: '09:00', e: '12:00' })
console.log(JSON.stringify(await L.recAll(p, { type: 'Duty', date: 'Jul 22' })))
console.log('hol err', await L.declareHoliday(w, '2026-07-22', 'Test holiday', 'TH'))
await L.closeWins(p)
await L.switchUser(w, 'us')
console.log('bell dot?', await p.evaluate(() => { const b = document.getElementById('notifyBell'); return b ? b.className + '|' + b.innerHTML.slice(0, 200) : null }))
await p.locator('#notifyBell').tap(); await sleep(600)
await L.pic(w, 'x11-bell')
console.log(await p.evaluate(() => [...document.querySelectorAll('.floatwin, .airpop, #notifyPop, .notifwin')].filter(e => e.offsetParent).map(e => e.className + ' :: ' + e.innerText.replace(/\s+/g, ' ').slice(0, 600))))
console.log(await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent && /OIL|Answer|Yes|No/i.test(b.innerText)).map(b => (b.id || b.dataset.testid || b.className) + ':' + b.innerText.trim().slice(0, 40))))
await w.browser.close()
