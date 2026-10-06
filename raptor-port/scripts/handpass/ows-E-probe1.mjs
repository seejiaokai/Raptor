/* walker E — probe: the shape of an SC wave on the board */
import * as D from './ows-D-lib.mjs'
const { world, sleep, A, R, W, L, P, SAT } = D
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)
const sc = await R.addStandby(p, SAT, 'sc')
console.log('sc', JSON.stringify(sc))
const dump = await p.evaluate(i => JSON.stringify(window.DAYS[i].waves.map(w => ({ label: w.label, kind: w.kind, sa: w.sa, f: w.formations.map(f => ({ cs: f.cs, to: f.to, ld: f.ld, br: f.br, ac: f.aircraft.map(a => ({ p: a.p, w: a.w, role: a.role })) })) }))), SAT)
console.log(dump)
const boxes = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld]')].filter(e => e.offsetParent !== null).map(e => e.dataset.bfld + '=' + e.value))
console.log(JSON.stringify(boxes))
const slots = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-slot]')].filter(e => e.offsetParent !== null).map(e => e.dataset.slot))
console.log(JSON.stringify(slots))
await P(p, 'probe-sc')
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
