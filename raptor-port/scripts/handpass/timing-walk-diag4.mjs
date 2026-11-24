/* W3's FAIL, looked into (chat 164): which stored keys differ between a session with the switch and one without */
import { serve, browserOf, fresh, DESK, signIn, outsideTime, openBy, sleep } from './timing-walk-lib.mjs'
const srv = await serve(); const cr = await browserOf()
const keysOf = async q => {
  const { ctx, page } = await fresh(cr, DESK)
  await page.goto(srv.base + '/' + q); await signIn(page); await outsideTime(page, 'viewsched')
  for (const p of ['inputs', 'quals']) { await openBy(page, p); await outsideTime(page, p) }
  await sleep(1500)
  const k = await page.evaluate(() => Object.keys(localStorage).sort())
  await ctx.close(); return k
}
/* by kind of entry: the demo mints fresh record numbers each session, so the name after the last "/" is left out and
   the entries of each kind counted */
const kinds = ks => { const m = {}; for (const k of ks) { const f = k.replace(/\/[^/]*$/, '/*'); m[f] = (m[f] || 0) + 1 } return JSON.stringify(Object.entries(m).sort()) }
const a = await keysOf(''), a2 = await keysOf(''), b = await keysOf('?timing')
console.log('KINDS without = without again:', kinds(a) === kinds(a2), '| without = with the switch:', kinds(a) === kinds(b), '| entries', a.length, a2.length, b.length)
const only = (x, y) => x.filter(k => !y.includes(k))
console.log('two runs WITHOUT the switch differ by:', only(a, a2).length, only(a2, a).length, only(a, a2).slice(0, 4), only(a2, a).slice(0, 4))
console.log('only without:', only(a, b).slice(0, 6), only(a, b).length)
console.log('only with:', only(b, a).slice(0, 6), only(b, a).length)
await cr.close(); await srv.close()
