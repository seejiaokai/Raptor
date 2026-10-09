import * as L from './icard-C-lib.mjs'
const { sleep } = L
const w = await L.world('phone', 'ad')
const p = w.page
const d = await L.editDay(w, 'Jul 20', 0)
console.log(d.week, JSON.stringify(d.head))
await L.pic(w, 'x14-wk20')
const s = await L.signAndPublish(w, 'Jul 20', 0)
console.log(JSON.stringify(s))
console.log((await L.editDay(w, 'Jul 20', 1)).week)
const v = await L.issuedDay(w, 'Jul 20', 0)
console.log(v.week, v.tag)
await w.browser.close()
