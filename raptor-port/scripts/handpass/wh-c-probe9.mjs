/* walker C — probe 9: the board's duty panel on Sunday 19 Jul — a new duty row's markup, arming its seat, the crew list.
   Explores with the app's own controls on a throw-away world. */
import * as C from './wh-c-lib.mjs'
const { H } = C, { L, W } = H
const { browser, p, errors } = await H.world({ who: 'a' })
await L.go(p, 'editsched')
await W.boardOn(p, 6); await L.sleep(500)
const add = p.locator('#schedBoard [data-dradd="6.0"]').first()
await add.evaluate(e => e.scrollIntoView({ block: 'center' })); await add.click(); await L.sleep(500)
console.log('NEW ROW', await p.evaluate(() => { const r = document.querySelector('#schedBoard [data-move="mv:d.6.0.1"]'); return r ? r.outerHTML : 'no row' }))
const seat = p.locator('#schedBoard [data-move="mv:d.6.0.1"] .ppl').first()
await seat.click(); await L.sleep(300)
console.log('ARM', JSON.stringify(await p.evaluate(() => window.ARM)), 'roster', await p.locator('#sbRoster .rpuck[data-person="bane"]:visible').count())
await H.pic(p, 'probe9-armed')
const pk = p.locator('#sbRoster .rpuck[data-person="bane"]:visible').first()
await pk.evaluate(e => e.scrollIntoView({ block: 'center' })); await pk.click(); await L.sleep(500)
console.log('ROW AFTER', await p.evaluate(() => { const r = document.querySelector('#schedBoard [data-move="mv:d.6.0.1"]'); return r ? r.outerHTML.slice(0, 900) : 'no row' }))
await H.pic(p, 'probe9-after-put')
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
