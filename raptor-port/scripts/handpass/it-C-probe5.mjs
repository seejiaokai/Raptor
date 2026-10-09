import * as C from './it-C-lib.mjs'
const w = await C.world('desk', 'ad', { fresh: false })
const p = w.page
const sb = await C.pid(p, 'Saber')
await C.fileNew(w, { iso: '2026-07-21', type: 'Event', person: sb, title: 'Saber briefing', s: '10:00', e: '11:00', rmk: 'sab1' })
await C.switchUser(w, 'us')
await C.go(p, 'inputs')
await C.month(p, 2026, 7)
await C.pic(w, 'probe5-member-month')
console.log(await p.evaluate(() => ({ filt: !!document.querySelector('#inFPerson'), fb: !!document.querySelector('#inFiltersBtn'), vis: document.querySelector('#inFPerson') && document.querySelector('#inFPerson').offsetParent !== null, val: document.querySelector('#inFPerson') && document.querySelector('#inFPerson').value, opts: document.querySelector('#inFPerson') ? [...document.querySelector('#inFPerson').options].map(o => o.value + ':' + o.text).slice(0, 8) : null })))
await w.browser.close()
