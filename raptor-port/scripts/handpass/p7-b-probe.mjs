/* [DB-READINESS] phase 7 walk — walker B — a look at the board's own controls before the walk (reads only). */
import { boot, world } from './p6-lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await world(L)
const DI = 1
await W.boardOn(p, DI)
const out = await p.evaluate((di) => {
  const b = document.querySelector('#schedBoard')
  const strip = h => h.replace(/\s+/g, ' ').slice(0, 6000)
  const sims = [...b.querySelectorAll('*')].filter(e => /sim/i.test(e.className || '') && e.querySelector('[data-slot^="s:"],[data-fill^="s:"]'))
  const top = sims[0]
  const attrs = new Set()
  for (const e of b.querySelectorAll('*')) for (const a of e.attributes) if (a.name.startsWith('data-')) attrs.add(a.name)
  return {
    simsModel: JSON.parse(JSON.stringify(window.DAYS[di].sims)),
    simw: JSON.parse(JSON.stringify(window.SIMW ? window.SIMW[di] : null)),
    ground: JSON.parse(JSON.stringify(window.DAYS[di].ground)),
    simsHtml: top ? strip(top.outerHTML) : null,
    simsCls: sims.slice(0, 6).map(e => e.tagName + '.' + e.className),
    attrs: [...attrs].sort(),
    roster: [...b.querySelectorAll('#sbRoster .rpuck')].slice(0, 80).map(e => e.dataset.person + ':' + (e.innerText || '').trim()),
    people: Object.entries(window.PEOPLE).map(([id, v]) => `${id}:${v.cs}:${v.role || v.cat || v.type || ''}`),
  }
}, DI)
console.log(JSON.stringify(out, null, 1))
await L.shot(p, 'probe-board-tue')
console.log('errors', errors)
await browser.close()
