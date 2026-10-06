import * as D from './ows-D-lib.mjs'
const { world, sleep, A, R, W, L } = D
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)
const sc = await R.addStandby(p, 5, 'sc')
console.log('SC', JSON.stringify(sc))
const info = await p.evaluate(() => {
  const w = window.DAYS[5].waves.map(w => ({ label: w.label, kind: w.kind, sa: w.sa, f: w.formations.map(f => ({ cs: f.cs, to: f.to, ld: f.ld, br: f.br, msn: f.msn, ac: f.aircraft.length })) }))
  const flds = [...document.querySelectorAll('#schedBoard [data-bfld]')].filter(e => e.offsetParent !== null).map(e => e.dataset.bfld).filter(k => /^(ff|fr|wl|it)/.test(k))
  const slots = [...document.querySelectorAll('#schedBoard [data-slot]')].filter(e => e.offsetParent !== null).map(e => e.dataset.slot).filter(k => /^5\./.test(k))
  return { w, flds, slots }
})
console.log(JSON.stringify(info, null, 1))
await D.P(p, 'probe-sc')
for (const k of ['avalon', 'bb']) { const x = await R.addStandby(p, 5, k); console.log(k, JSON.stringify(x)) }
const info2 = await p.evaluate(() => window.DAYS[5].waves.map(w => ({ label: w.label, kind: w.kind, f: w.formations.map(f => ({ cs: f.cs, to: f.to, ld: f.ld, br: f.br, msn: f.msn, ac: f.aircraft.length })) })))
console.log(JSON.stringify(info2))
const flds = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld]')].filter(e => e.offsetParent !== null).map(e => e.dataset.bfld).filter(k => /^ff/.test(k)))
console.log(flds.join(' '))
await D.P(p, 'probe-avalon-bb')
console.log('ERR', JSON.stringify(errors))
await browser.close()
