// sss-w1A-probe2 — how Edit Schedule's week draws a sim row's places (their keys), and what a press on one arms.
// Run from raptor-port/: SSSA_RUN=probe2 SZ=d node scripts/handpass/sss-w1A-probe2.mjs
import './sss-w1A-env.mjs'
const X = await import('./sss-w1A-lib.mjs')
const { L, J, run } = X
const SZ = process.env.SZ || 'd'
console.log(`VERSION sss-w1A-probe2 1 · ${SZ}`)
await run('PR2', SZ, async (p, W) => {
  const o = await X.addSimRow(p, W, 4, 'oft', 'PRB2 OFT')
  await L.closeBoard(p, W); await L.go(p, 'editsched')
  const z = await p.evaluate(ri => [...document.querySelectorAll('#eWeek [data-slot^="s:4"], #eWeek [data-fill^="s:4"], #eWeek [data-slot*="oft"], #eWeek [data-fill*="oft"]')].map(e => (e.dataset.slot ? 'slot=' + e.dataset.slot : 'fill=' + e.dataset.fill) + ' w' + Math.round(e.getBoundingClientRect().width)), o.ri)
  W.rec('wk-zones', 'the week\'s sim places on Fri 17', null, J(z))
  const any = await p.evaluate(() => [...new Set([...document.querySelectorAll('#eWeek [data-slot], #eWeek [data-fill]')].map(e => (e.dataset.slot || e.dataset.fill).replace(/\d+/g, 'N')))])
  W.rec('wk-kinds', 'every kind of place key in the week', null, J(any))
  await W.pic(p, 'week')
})
process.exit(0)
