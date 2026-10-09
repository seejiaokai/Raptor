import * as C from './it-C-lib.mjs'
const w = await C.world('desk', 'ad')
const p = w.page
const rg = await C.pid(p, 'Ranger')
console.log('ranger', rg)
const s = await C.scShift(w, 4, rg)
console.log(JSON.stringify(s))
console.log(await p.evaluate(() => JSON.stringify(window.DAYS[4].waves)).then(x => x.slice(0, 1200)))
await C.pic(w, 'probe2-sc')
console.log(JSON.stringify(await C.warnLines(p)))
await w.browser.close()
