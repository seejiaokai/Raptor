/* phase 6 (c) check — a fresh world's ground rows and landed requests, read (not a walk step) */
import { world } from './p6-lib.mjs'
const L = await import('./dbrA-lib.mjs')
const { browser, p } = await world(L)
const out = await p.evaluate(() => window.DAYS.map((d, di) => (d.ground || []).map((r, ri) => `${di}.${ri} ${r.prog}|${r.str}-${r.end}|${r.who}|src=${r.src ? (window.INPUTS.find(x => x.iid === r.src) || {}).type + ':' + r.src.slice(-4) : '-'}`)))
console.log(JSON.stringify(out, null, 1))
console.log('acc g:', await p.evaluate(() => window.INPUTS.filter(x => x.acc === 'g').map(x => `${x.type} ${x.date} ${x.person} ${x.iid.slice(-4)}`).join(' ; ')))
await browser.close()
