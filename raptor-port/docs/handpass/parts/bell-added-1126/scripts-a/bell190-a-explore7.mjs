// bell190 walker A — exploration 7: the "+ add" place's own markup, week and Board; Personal Inputs' labels on the Board
import * as L from './bell190-a-lib.mjs'
console.log('bell190-a-explore7 v1')
const w = await L.newWorld('desk')
await L.signIn(w, 'ad')
const p = w.page
const iid = await L.fileInput(w, L.WED, { type: 'Training', people: [L.ID.Tally], from: '09:00', to: '11:00' })
await L.go(p, 'editsched')
console.log('week fill html', await p.evaluate(() => document.querySelector('#eWeek [data-fill="g:2.2.+"]').outerHTML.slice(0, 900)))
await L.openBoard(w, 2)
console.log('board fill html', await p.evaluate(() => document.querySelector('#schedBoard [data-fill="g:2.2.+"]').outerHTML.slice(0, 900)))
const pi = await p.evaluate(iid => [...document.querySelectorAll(`#schedBoard [data-inpedit="${iid}"], #schedBoard [data-pitog]`)].map(e => `${e.tagName}.${String(e.className).slice(0, 30)} ${[...e.attributes].map(a => a.name + '=' + a.value).join(' ').slice(0, 120)} vis=${e.getBoundingClientRect().width > 3}`), iid)
console.log('board personal inputs', L.J(pi, null, 1))
await L.go(p, 'editsched')
const pw = await p.evaluate(iid => [...document.querySelectorAll(`#eWeek [data-inpedit="${iid}"], #eWeek [data-pitog="2"]`)].map(e => `${e.tagName}.${String(e.className).slice(0, 30)} ${[...e.attributes].map(a => a.name + '=' + a.value).join(' ').slice(0, 120)} vis=${e.getBoundingClientRect().width > 3}`), iid)
console.log('week personal inputs', L.J(pw, null, 1))
await L.closeAll()
