// bell190 walker A — exploration 3: where the crew list stands against Wednesday's ground rows; one drag from the crew list
import * as L from './bell190-a-lib.mjs'
console.log('bell190-a-explore3 v1')
const w = await L.newWorld('desk')
await L.signIn(w, 'ad')
const iid = await L.fileInput(w, L.WED, { type: 'Training', people: [L.ID.Tally], from: '09:00', to: '11:00' })
await L.go(w.page, 'editsched')
const p = w.page
await p.evaluate(() => document.querySelector('[data-fill="g:2.2.+"]').scrollIntoView({ block: 'center', inline: 'center' }))
await L.sleep(500)
const geo = await p.evaluate(() => {
  const r = e => { if (!e) return null; const b = e.getBoundingClientRect(); return { l: Math.round(b.left), t: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height), pos: getComputedStyle(e).position } }
  return { add: r(document.querySelector('#eWeek [data-fill="g:2.2.+"]')), roster: r(document.querySelector('#eRoster')), rosterParent: r(document.querySelector('#eRoster')?.parentElement), rangerR: r(document.querySelector('#eRoster .rpuck[data-person="bane"]')), sx: scrollX, sy: scrollY, eweek: r(document.querySelector('#eWeek')), scrollers: [...document.querySelectorAll('*')].filter(e => (e.scrollWidth > e.clientWidth + 5 && /auto|scroll/.test(getComputedStyle(e).overflowX))).map(e => (e.id || e.className).toString().slice(0, 30)) }
})
console.log(L.J(geo, null, 1))
await L.shot(w, 'explore3-before')
const n0 = await L.allNotices(p)
const r = await L.drag(w, '#eRoster .rpuck[data-person="bane"]', '#eWeek [data-fill="g:2.2.+"]', 'explore3')
console.log('drag', L.J(r), 'toast', await L.toast(p))
console.log(L.J(await L.groundDump(p, 2), null, 1))
console.log('rec', L.J(await L.rec(p, iid)))
console.log('new notices', L.newSince(n0, await L.allNotices(p)).map(n => JSON.stringify(n)).join('\n'))
await L.shot(w, 'explore3-after')
console.log('errs', w.errs)
await L.closeAll()
