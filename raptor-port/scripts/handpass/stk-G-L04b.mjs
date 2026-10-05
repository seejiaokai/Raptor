/* L-04 side probe — the same person on a blank line with NO reporting line at all: does Insights still say NaN? */
import * as G from './stk-G-lib.mjs'
import { put } from './lib.mjs'
const w = await G.world(); const p = w.p; const D = 5
const ID = await p.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, v]) => [v.cs, k])))
await G.boardOn(p, D)
await G.addWave(p, D)
console.log('seat', await put(p, `[data-slot="${D}.0.0.0.p"]`, [ID.Reaper]))
await G.insightsOpen(p)
const t = await G.insightsRead(p)
console.log('REAPER-NO-INTIME-LINE', JSON.stringify(t.rows.filter(x => /Reaper/.test(x))), 'NaN anywhere:', /NaN/.test(t.text))
await G.pic(p, 'L04b-insights-blank-line-no-intime')
console.log(JSON.stringify(await G.warnLines(p, D)))
console.log('errors', w.errors)
await w.browser.close()
