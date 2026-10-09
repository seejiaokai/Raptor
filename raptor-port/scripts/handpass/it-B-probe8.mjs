import * as L from './it-B-lib.mjs'
const W = await L.mk('desk')
const p = W.page
const ranger = await L.csId(p, 'Ranger')
await L.fileInput(W, { iso: '2026-07-15', type: 'Event', person: ranger, s: '09:00', e: '10:00', title: 'Sports day', rmk: 'titled one' })
const r = await L.recBy(p, { person: ranger, type: 'Event' })
await L.pubDay(W, 2)
await L.openSaved(W, r.iid, '2026-07-15')
await p.locator('#inpEditDel').click(); await L.sleep(600)
await L.shot(p, 'probe8-delete')
console.log(await p.evaluate(() => [...document.querySelectorAll('button:not([disabled])')].filter(b => b.offsetWidth && /delete|remove|yes|confirm|cancel|keep/i.test(b.innerText + b.id + (b.getAttribute('data-testid') || ''))).map(b => b.tagName + '#' + b.id + ' ' + (b.getAttribute('data-testid') || '') + ' :: ' + b.innerText.replace(/\s+/g, ' ').slice(0, 60))))
await W.browser.close()
