import { launch, ctxOpen, openBoard, sleep, shot, warns, dump, errors } from './sf-C-lib.mjs'
const b = await launch()
const { p } = await ctxOpen(b, {})
await p.evaluate(() => window.go('editsched')); await sleep(600)
for (const k of ['sc', 'avalon', 'bb']) { await p.evaluate(k => window.addWave(5, k), k); await sleep(500) }
await openBoard(p, 5)
const html = await p.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  const vis = e => e.offsetParent !== null
  return [...b.querySelectorAll('[data-bfld],[data-slot],[data-safly],[data-sarole]')].filter(vis).map(e => (e.dataset.bfld || e.dataset.slot || ('safly' + e.dataset.safly) || ('sarole' + e.dataset.sarole)) + (e.tagName === 'INPUT' ? '=' + e.value : '') + (e.placeholder ? ' ph=' + e.placeholder : ''))
})
console.log(html.join('\n'))
const w = await p.evaluate(() => window.DAYS[5].waves.map(w => w.kind + ':' + w.label + ':' + JSON.stringify(w.formations.map(f => ({ cs: f.cs, msn: f.msn, rl: f.rl, br: f.br, to: f.to, ld: f.ld, n: f.aircraft.length, a0: f.aircraft[0] })))))
console.log(w.join('\n'))
await b.close()
