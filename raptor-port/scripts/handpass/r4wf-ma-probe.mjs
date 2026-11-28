// r4wf-ma-probe — what Wed 15 Jul's Board holds with the shared leave 08:00–17:00 (walker A's look before the scenarios)
import * as A from './r4wf-ma-lib.mjs'
const { L, J, sleep } = A
console.log('r4wf-ma-probe v1', A.TAG)
const w = await A.world(); const p = w.page
const outlaw = await A.idOf(p, 'Outlaw'); console.log('outlaw id', outlaw)
const iid = await A.fixture(w, [L.RANGER, L.HEX], { from: '08:00', to: '17:00' })
await A.openBoard(w)
console.log('sections', J(await A.secs(p)))
console.log('ground rmks', J(await p.evaluate(() => [...document.querySelectorAll('#sbBoard > [data-secmove$=".ground"] [data-bfld]')].map(e => e.getAttribute('data-bfld') + '=' + e.value + (e.getBoundingClientRect().width > 0 ? '' : '(hidden)')))))
console.log('unav', J(await A.screen(p)))
console.log('store', J(await A.store(p)))
console.log('PI', J(await p.evaluate(() => { const s = document.querySelector('#sbBoard > [data-secmove$=".inputs"]'); return s ? s.innerText.replace(/\s+/g, ' ').slice(0, 200) : null })))
console.log('undo btn', J(await p.evaluate(() => { const b = document.querySelector('#sbUndo'); const r = b?.getBoundingClientRect(); return b ? [b.tagName, b.textContent.trim(), Math.round(r.x), Math.round(r.y), r.width] : null })))
// a tap on Undo with the caret in Hex's start (nothing to undo yet beyond nothing) — does the caret stay?
const hs = await A.boxSel(p, 'Hex', 'str'); await A.tapBox(w, hs)
console.log('caret after tapping Hex start', await A.caret(p))
console.log('undo state', await A.undoState(p))
const r = await A.keepPress(w, '#sbUndo')
console.log('Undo tap with caret in Hex start:', J(r))
await A.pic(w, 'probe', ['body'])
await A.fin('probe')
