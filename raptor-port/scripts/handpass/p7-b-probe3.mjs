/* [DB-READINESS] phase 7 walk — walker B — probe 3: every day's sim rows (the model and the seats the board draws),
   reads only. */
import { boot, world } from './p6-lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await world(L)
for (let di = 0; di < 7; di++) {
  await W.boardOn(p, di)
  const o = await p.evaluate(d => ({
    sims: JSON.parse(JSON.stringify(window.DAYS[d].sims)),
    slots: [...document.querySelectorAll('#schedBoard [data-slot^="s:"], #schedBoard [data-fill^="s:"]')].map(e => (e.dataset.slot || e.dataset.fill) + (e.classList.contains('empty') ? '(empty)' : '')),
    signed: !!window.dayApproved && window.dayApproved(d),
    stored: Object.keys(localStorage).filter(k => k.startsWith('raptor:weeks/')).slice(0, 20),
  }), di)
  console.log('DAY', di, JSON.stringify(o))
}
await W.boardOff(p)
await L.go(p, 'editsched')
console.log('week sim slots', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#eWeek [data-slot^="s:"], #eWeek [data-fill^="s:"]')].map(e => (e.dataset.slot || e.dataset.fill) + (e.classList.contains('empty') ? '(empty)' : '')))))
console.log('rows', JSON.stringify(Object.keys(await L.rows(p)).filter(k => !k.startsWith('changes/')).slice(0, 80)))
console.log('errors', errors)
await browser.close()
