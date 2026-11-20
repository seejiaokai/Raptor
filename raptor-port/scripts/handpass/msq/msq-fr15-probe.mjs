/* msq-fr15-probe v2 — storage key prefixes */
process.env.MSQ_DIST = 'C:/Users/User/projects/Raptor-msq/raptor-port/dist'
process.env.MSQ_BUNDLE = 'index-DNo44IiD.js'
process.env.MSQ_WHO = 'probe'
process.env.MSQ_RUN = 'p1'
process.env.MSQ_IMGDIR = '2026-11-20-multi-sqn-b1-fixread15'
const X = await import('./msq-lib.mjs')
const w = await X.open({ phone: false, user: 'ad' })
const p = w.page
const ks = await p.evaluate(() => Object.keys(localStorage))
const pre = {}
for (const k of ks) { const m = k.replace(/^raptor:/, '').split(/[:\/@]/)[0]; pre[m] = (pre[m] || 0) + 1 }
console.log(JSON.stringify(pre))
console.log(ks.filter(k => !/leavewar|people|inputs/.test(k)).join('\n'))
await X.fin(w)
