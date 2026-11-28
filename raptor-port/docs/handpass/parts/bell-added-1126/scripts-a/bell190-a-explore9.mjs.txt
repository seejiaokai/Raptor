// bell190 walker A — exploration 9: the Leave War's grid — its month strip, Tally's cells
import * as L from './bell190-a-lib.mjs'
console.log('bell190-a-explore9 v1')
const w = await L.newWorld('desk')
await L.signIn(w, 'ad')
const p = w.page
await L.go(p, 'leavewar'); await L.sleep(2500)
console.log('months', L.J(await p.evaluate(() => [...document.querySelectorAll('[data-testid^="month-"]')].map(e => e.getAttribute('data-testid') + '|' + (e.textContent || '').trim()).slice(0, 20))))
console.log('cells', L.J(await p.evaluate(() => [...document.querySelectorAll('[data-testid^="cell-"]')].slice(0, 6).map(e => e.getAttribute('data-testid')))))
console.log('tally cells', L.J(await p.evaluate(() => [...document.querySelectorAll('[data-testid^="cell-nick"]')].slice(0, 4).map(e => e.getAttribute('data-testid')))))
console.log('tabs', L.J(await p.evaluate(() => [...document.querySelectorAll('[data-testid^="lw-tab"]')].map(e => e.getAttribute('data-testid')))))
await L.shot(w, 'explore9-war')
await L.closeAll()
