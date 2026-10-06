import * as D from './ows-D-lib.mjs'
import * as F from './ows-D-fix.mjs'
import * as K from './stk-B-lib.mjs'
const { world, sleep, A, R, W, L, P, SAT, ISO } = D
const { browser, p, errors } = await world()
const f = await F.m38(p)
console.log('fixture', JSON.stringify({ took: f.took, its: f.its, gi: f.gi }))
const pub = await A.publishNew(p, SAT)
console.log('published', pub.head && pub.head.tag)
await D.oilMode(p, true)
console.log(JSON.stringify(await F.oilHeader(p), null, 1))
console.log(JSON.stringify((await D.switches(p)).map(s => `${s.txt}|${s.item}|${s.who}|${s.cls}|${s.title}`)))
console.log('bane figs', JSON.stringify(await F.figOf(p, 'bane')))
const pucks = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilp]')].filter(e => e.offsetParent !== null).map(e => `${e.tagName}|${e.dataset.oilp}|${e.dataset.oilitem}|${e.className}`))
console.log('oilp elements', JSON.stringify(pucks))
await D.P(p, 'probe4-mode')
console.log('ERR', JSON.stringify(errors))
await browser.close()
