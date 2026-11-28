// sns-w1B-probe — walker B's first look at the frozen build (chat 179): the bundle served, the seed's SANS men, Ipman's id.
import './sns-w1B-env.mjs'
const Z = await import('./swd-w14a-lib.mjs')
const { T, L } = Z
L.SIZES.d.opts.viewport = { width: 1536, height: 1000 }
const html = await (await fetch(process.env.W2_URL)).text()
console.log('BUNDLE', (html.match(/index-[^"]*\.js/) || [])[0])
await T.run('probe', process.env.SZ || 'd', async (p, W) => {
  const ppl = await p.evaluate(() => Object.entries(window.PEOPLE).map(([k, q]) => ({ k, cs: q.cs, seat: q.seat, san: !!q.san, sanFrom: q.sanFrom || null, archived: !!q.archived })))
  console.log('PEOPLE', JSON.stringify(ppl.filter(x => x.san || /ipman|ranger|bane/i.test(x.cs + x.k))))
  console.log('WEEK', await L.weekOf(p))
  const sansIn = await p.evaluate(() => (window.INPUTS || []).filter(r => /SANS/i.test(String(r.type))).map(r => ({ iid: r.iid, who: JSON.stringify(r.people || r.person), date: r.date, end: r.endDate })))
  console.log('SANS INPUTS', JSON.stringify(sansIn))
  const holdsI = await T.holds(p, 'ipman')
  console.log('IPMAN HOLDS', holdsI)
  console.log('RANGER HOLDS', await T.holds(p, 'bane'))
  console.log('bridge', await p.evaluate(() => typeof window.slotBar + ' ' + typeof window.slotRules))
})
