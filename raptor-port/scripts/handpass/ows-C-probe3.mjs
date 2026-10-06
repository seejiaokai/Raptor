/* walker C — probe for S03: the Common Programme row with ALL AVAIL and its window */
import * as C from './ows-C-lib.mjs'
const { S, R, L, W, world, pic, sleep } = C
const { browser, p, errors } = await world()
const di = C.SATI
await L.go(p, 'editsched'); await sleep(400)
const r = await R.addRow(p, 'prog', di, 'Briefing', '08:30', '09:00', 'allavail')
console.log('ROW', JSON.stringify(r))
const f = await R.addRow  // keep
const pk = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-person="allavail"]')].filter(e => e.offsetParent !== null).map(e => e.outerHTML.slice(0, 300)))
console.log('PUCKS', JSON.stringify(pk, null, 1))
console.log('DAY prog', JSON.stringify(await p.evaluate(i => window.DAYS[i].allhands, di)))
await pic(p, 'probe3-board')
const puck = p.locator('#schedBoard .oilcount:visible').first()
await puck.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
await puck.click(); await sleep(800)
await pic(p, 'probe3-window')
const win = await p.evaluate(() => { const w = document.querySelector('.availwin'); return w ? w.innerText.replace(/\s+/g, ' ').slice(0, 1200) : '(no window)' })
console.log('WINDOW', win)
console.log('ERR', JSON.stringify(errors))
await browser.close()
