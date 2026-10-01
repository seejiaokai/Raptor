/* [DB-READINESS] phase 7 — walker A, probe 1: how a Personal request lands and what its row looks like on the board.
   Read-only on the app; fixtures through the Inputs page's own form. */
import { boot, world, fileTimed, fileRange } from './p6-lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await world(L)
await W.toastSpy(p)
const out = {}
await L.go(p, 'inputs')
out.types = await p.evaluate(() => [...document.querySelectorAll('#inType option')].map(o => o.value + '|' + o.textContent.trim()))
out.persons = await p.evaluate(() => [...document.querySelectorAll('#inPerson option')].map(o => o.value + '|' + o.textContent.trim()).slice(0, 60))
out.people = await p.evaluate(() => Object.entries(window.PEOPLE).map(([k, v]) => `${k}:${v.cs}:${v.seat || ''}:${v.cat || ''}`).join(' '))
const iid = await fileTimed(L, p, { person: 'bane', type: 'Personal', iso: '2026-07-14', from: '10:00', to: '11:00', remarks: 'P7A A1' })
out.iid = iid
out.req = await p.evaluate(i => window.INPUTS.find(x => x.iid === i), iid)
out.toasts = await W.toasts(p)
out.ground1 = await p.evaluate(() => window.DAYS[1].ground)
await L.shot(p, 'probe1-inputs-after-file')
await W.boardOn(p, 1)
out.board = await p.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  const g = [...b.querySelectorAll('[data-slot^="g:1."], [data-fill^="g:1."]')].map(e => ({ slot: e.dataset.slot || null, fill: e.dataset.fill || null, vis: e.offsetParent !== null, html: e.outerHTML.slice(0, 260) }))
  const pinp = b.querySelector('.pinp')
  return { g, pinp: pinp ? pinp.innerText.slice(0, 400) : null, accb: [...b.querySelectorAll('.accb')].map(e => e.outerHTML.slice(0, 200)),
    roster: [...b.querySelectorAll('#sbRoster .rpuck')].slice(0, 6).map(e => e.dataset.person), ph: [...b.querySelectorAll('#sbRoster .rpuck[data-person="all"], #sbRoster .rpuck[data-person="allavail"]')].map(e => ({ p: e.dataset.person, vis: e.offsetParent !== null })) }
})
await L.shot(p, 'probe1-board-tue')
const iid2 = await fileRange(L, p, { person: 'bane', type: 'Personal', fromIso: '2026-07-18', toIso: '2026-07-18', remarks: 'P7A A2' })
out.iid2 = iid2
out.req2 = await p.evaluate(i => window.INPUTS.find(x => x.iid === i), iid2)
out.ground5 = await p.evaluate(() => window.DAYS[5].ground)
out.toasts2 = await W.toasts(p)
out.errors = errors
console.log(JSON.stringify(out, null, 1))
await browser.close()
