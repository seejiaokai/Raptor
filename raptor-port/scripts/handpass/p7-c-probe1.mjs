/* p7 walker C — probe 1: what the board of a flying weekday offers (seats, crew list, placeholders). Reads only. */
import { boot, world } from './p6-lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await world(L)
const DI = +(process.env.DI || 1)
await W.boardOn(p, DI)
const info = await p.evaluate(di => {
  const b = document.querySelector('#schedBoard')
  const slots = [...b.querySelectorAll('[data-slot]')].filter(e => e.offsetParent !== null).map(e => e.dataset.slot)
  const fills = [...b.querySelectorAll('[data-fill]')].filter(e => e.offsetParent !== null).map(e => e.dataset.fill)
  const cock = slots.filter(s => /^\d+\.\d+\.\d+\.\d+\.[pw]$/.test(s))
  const ros = [...document.querySelectorAll('#sbRoster .rpuck')].filter(e => e.offsetParent !== null).map(e => e.dataset.person)
  const ph = [...document.querySelectorAll('#sbRoster [data-person="all"], #sbRoster [data-person="allavail"]')].map(e => ({ p: e.dataset.person, cls: e.className, vis: e.offsetParent !== null, txt: e.innerText, drag: e.getAttribute('draggable'), html: e.outerHTML.slice(0, 300) }))
  const d = window.DAYS[di]
  return { cock, emptyCock: cock.filter(k => { const h = b.querySelector(`[data-slot="${k}"]`); return !h.querySelector('[data-person]') }),
    otherSlots: slots.filter(s => !/^\d+\.\d+\.\d+\.\d+\.[pw]$/.test(s)).slice(0, 80), fills: fills.slice(0, 60), nRos: ros.length, ros: ros.slice(0, 12), ph,
    waves: d.waves.map(w => ({ label: w.label, kind: w.kind, f: w.formations.map(f => ({ cs: f.cs, ac: f.aircraft.map(a => [a.p, a.w]) })) })),
    ground: d.ground, sims: d.sims, bar: [...b.querySelectorAll('button')].filter(e => e.offsetParent !== null).map(e => (e.id || '') + ':' + (e.innerText || '').trim().slice(0, 20)).slice(0, 60),
    cockHtml: b.querySelector(`[data-slot="${cock[0]}"]`)?.outerHTML.slice(0, 400), bridge: Object.keys(window).filter(k => /^[A-Z]{3,}$/.test(k) || /^(go|openScheduler|histSnap|loadWeek|dayCurVer)$/.test(k)).slice(0, 80) }
}, DI)
console.log(JSON.stringify(info, null, 1))
await L.shot(p, 'probe1-board-d' + DI)
console.log('errors', errors)
await browser.close()
