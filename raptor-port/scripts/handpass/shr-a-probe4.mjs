// shr-a-probe4 — walker A's look (no assertions): after Ranger's Unavailable puck is pressed, every drawn copy of Outlaw's
// name on the Board, its box and what lies at its middle.
import { L, J, sleep, world, openBoard, fixture, pressAt, idOf, TAG } from './shr-a-lib.mjs'
console.log('shr-a-probe4 v1', TAG)
const w = await world(); const p = w.page
const o = await idOf(p, 'Outlaw')
await fixture(w); await openBoard(w)
const row = await p.evaluate(() => [...document.querySelectorAll('#sbBoard > [data-secmove$=".unav"] [data-inprow]')].find(r => r.querySelector('.seat [data-person="bane"]')).getAttribute('data-inprow'))
await pressAt(w, `#schedBoard [data-inprow="${row}"] .seat [data-person="bane"]`)
await sleep(600)
const list = await p.evaluate(o => [...document.querySelectorAll(`[data-person="${o}"]`)].map(e => { const r = e.getBoundingClientRect(); const m = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return `${e.tagName}.${e.className} in ${e.parentElement?.className} / ${e.parentElement?.parentElement?.className} / ${e.closest('[id]')?.id} box ${[r.left, r.top, r.width, r.height].map(Math.round)} mid=${m === e || e.contains(m) ? 'ITSELF' : m ? m.tagName + '.' + m.className : 'none'}` }), o)
console.log(J(list, null, 1))
await p.screenshot({ path: `${L.OUT}/after-puck.png` })
await L.finish()
