// Walker B: prove the OIL-bar route on desktop (and print what the bar is).
import * as L from './mgb-walk-b-lib.mjs'
console.log('mgb-walk-b-route v1')
const { page, tap, ctx } = await L.openAt('desktop', 1536, 864)
const r = await L.oilBarUp(page, tap)
L.check('ROUTE-desk', 'the OIL bar is up and nothing moved', r.up && JSON.stringify(r.before) === JSON.stringify(r.after), r)
const f = await L.barFacts(page)
L.note('ROUTE-desk', f)
await L.shot(page, 'route-desk-bar')
await ctx.close()
await L.finish('route')
process.exit(0)
