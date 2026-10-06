/* exploratory: the SC wave's boxes */
import * as K from './rbl-A-lib.mjs'
const { B, W, X, MON, TUE } = K
const { browser, p, errors } = await K.fresh()
const w = await K.addStandby(p, TUE, 'sc')
console.log('wave', JSON.stringify(w))
console.log(JSON.stringify(await p.evaluate(([i, g]) => { const x = window.DAYS[i].waves[g]; return { kind: x.kind, standalone: x.standalone, formations: x.formations.map(f => ({ cs: f.cs, msn: f.msn, shift: f.shift, to: f.to, ld: f.ld, br: f.br, nac: (f.aircraft || []).length })) } }, [TUE, w.gi])))
await K.picEl(p, `#schedBoard [data-move="mv:w.${TUE}.${w.gi}"]`, 'explore5-sc', { pad: 10, maxH: 800 })
const html = await p.evaluate(([i, g]) => { const e = document.querySelector(`#schedBoard [data-move="mv:w.${i}.${g}"]`); return e.innerText.replace(/\s+/g, ' ').slice(0, 900) }, [TUE, w.gi])
console.log(html)
console.log('errors', errors)
await browser.close()
