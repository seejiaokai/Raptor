// r4wf-mb-probe2 — walker B: the Unavailable rows and the last section of each day of the week of 13 Jul (reads only).
import { L, J, sleep, world } from './r4wf-mb-lib.mjs'
console.log('r4wf-mb-probe2 v1')
const w = await world(); const p = w.page
await L.go(p, 'editsched')
for (const d of [0, 1, 2, 3, 4, 5, 6]) {
  await p.evaluate(d => window.openScheduler(d), d); await sleep(900)
  console.log(d, J(await p.evaluate(() => ({ head: document.querySelector('#schedBoard')?.innerText.slice(0, 40).replace(/\s+/g, ' '), secs: [...document.querySelectorAll('#sbBoard > [data-secmove]')].map(s => s.getAttribute('data-secmove')).join(','), unav: [...document.querySelectorAll('#sbBoard > [data-secmove$=".unav"] [data-inprow]')].map(r => (r.querySelector('.inpedit')?.textContent.trim() || '?') + ' ' + [...r.querySelectorAll('.seat [data-person] .nm')].map(e => e.textContent.trim()).join('+')) }))))
  await p.evaluate(() => document.querySelector('#sbDone')?.click()); await sleep(600)
}
await L.finish()
