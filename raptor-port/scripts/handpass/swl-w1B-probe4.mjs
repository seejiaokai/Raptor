// swl-w1B-probe4 — walker B (chat 203): what each SANS man and a few ordinary men hold on Fri 17 – Sun 19 (read only), to pick
// men free of every other warning for the fixtures. SWLB_RUN=probe4 SZ=d node scripts/handpass/swl-w1B-probe4.mjs
import './swl-w1B-env.mjs'
const B = await import('./swl-w1B-lib.mjs')
const { T, J } = B
console.log('VERSION swl-w1B-probe4 1')
await T.run('probe4', 'd', async (p, W) => {
  const r = await p.evaluate(() => {
    const out = {}
    for (const [id, q] of Object.entries(window.PEOPLE)) {
      if (q.archived) continue
      const days = [4, 5, 6].map(i => { const hits = []; const walk = (o, at) => { if (o == null) return; if (typeof o === 'string') { if (o === id) hits.push(at); return } if (Array.isArray(o)) { o.forEach((x, n) => walk(x, at + '[' + n + ']')); return } if (typeof o === 'object') for (const k of Object.keys(o)) if (k !== 'by') walk(o[k], at + '.' + k) }; walk(window.DAYS[i], ''); return hits.length })
      const inp = (window.INPUTS || []).filter(x => JSON.stringify(x.people || x.person || x.who || '').includes('"' + id + '"') && /2026-07-1[789]|Jul 1[789]/.test(JSON.stringify([x.date, x.endDate, x.iso]))).map(x => `${x.type}${x.sans ? ' ' + JSON.stringify(x.sans) : ''} ${x.date}`)
      out[id] = `${q.cs} ${q.seat || ''} ${q.cat || ''}${q.san ? ' SANS' : ''} holds F/S/S ${days.join('/')}${inp.length ? ' inputs ' + inp.join('; ') : ''}`
    }
    return out
  })
  for (const [k, v] of Object.entries(r)) W.rec(k, 'Fri 17 – Sun 19', 'REC', v)
})
