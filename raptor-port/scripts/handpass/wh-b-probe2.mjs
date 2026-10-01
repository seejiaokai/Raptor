/* walker B — a look at the board's pucks for one man while a version is looked at (not a walk step) */
import * as B from './wh-b-lib.mjs'
const { L, W, TUE } = B
const { browser, p, errors } = await B.world()
await B.toEdit(p)
await B.pubOrig(p, TUE)
await B.look(p, TUE, /^Original/)
const dump = sel => p.evaluate(s => [...document.querySelectorAll(s)].map(e => { const path = []; let n = e; for (let i = 0; i < 7 && n; i++) { path.push((n.tagName || '') + '.' + String(n.className || '').split(' ').slice(0, 3).join('.') + (n.id ? '#' + n.id : '')); n = n.parentElement } return { cls: e.className, vis: e.offsetParent !== null, chip: (e.querySelector('.lchip') || {}).outerHTML || '', path: path.join(' < ') } }), sel)
console.log('WEEK', JSON.stringify(await dump('#eWeek .day[data-day="1"] .puck[data-person="wolf"]'), null, 1))
await W.boardOn(p, TUE); await L.sleep(600)
console.log('BOARD', JSON.stringify(await dump('#schedBoard .puck[data-person="wolf"]'), null, 1))
await B.pic(p, 'probe2-board-look')
console.log('ERR', JSON.stringify(errors))
await browser.close()
