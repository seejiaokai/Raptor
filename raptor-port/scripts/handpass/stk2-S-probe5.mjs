import * as X from './stk2-Q-fx.mjs'
import * as F from './stk2-Q-flib.mjs'
const { browser, p, errors } = await F.open('desk', 'a')
const all = await p.evaluate(() => { const o = []; window.DAYS.forEach((d, di) => d.waves.forEach((w, gi) => w.formations.forEach((f, fi) => { if (f.aircraft.length >= 2) o.push([di, gi, fi, f.cs, f.msn, f.aircraft.map(a => (a.p || '') + '/' + (a.w || '') + '/' + (a.rmks || '')).join(' ; ')].join('|')) }))); return o })
console.log(all.join('\n'))
await F.go(p, 'editsched')
const keys = await p.evaluate(() => [...document.querySelectorAll('#eWeek [data-txt^="fr:0.0.0."]')].map(e => e.dataset.txt + ' vis=' + (e.offsetParent !== null)))
console.log(keys)
await browser.close()
