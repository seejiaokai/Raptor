/* p7 walker C — probe 4: a ground row's name box once its man is taken off; the sim seats; the Common Programme fill. */
import { boot, world } from './p6-lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await world(L)
const DI = 1
await W.boardOn(p, DI)
const dump = sel => p.evaluate(s => [...document.querySelectorAll(s)].filter(e => e.offsetParent !== null).map(e => e.outerHTML.slice(0, 500)), sel)
console.log('ground row 1 before', await p.evaluate(() => { const e = document.querySelector('#schedBoard [data-slot="g:1.1"]'); const r = e.closest('.sb-arow, .sb-row, tr, .row') || e.parentElement.parentElement; return r.outerHTML.slice(0, 1500) }))
const pk = p.locator(`#schedBoard [data-slot="g:1.1"] .puck:visible`).first()
await pk.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(150); await pk.click({ button: 'right' }); await L.sleep(600)
console.log('ground now', JSON.stringify(await p.evaluate(() => window.DAYS[1].ground)))
console.log('g slots/fills now', await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-slot^="g:1"], #schedBoard [data-fill^="g:1"]')].map(e => (e.dataset.slot || 'fill:' + e.dataset.fill) + (e.offsetParent !== null ? '' : ' (hidden)') + ' :: ' + e.outerHTML.slice(0, 160))))
await L.shot(p, 'probe4-ground')
console.log('sim seats', await dump('#schedBoard [data-slot^="s:1.amt"], #schedBoard [data-fill^="s:1.amt"]'))
console.log('cp', await dump('#schedBoard [data-fill^="a:1"]'))
console.log('errors', errors)
await browser.close()
