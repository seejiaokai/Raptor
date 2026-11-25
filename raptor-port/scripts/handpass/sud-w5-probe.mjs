// sud-w5-probe — READS only: the demo world on Wed 15 Jul 26 (Hex's own items each day, who Outlaw is, the accounts).
import './sud-w5-env.mjs'
const L = await import('./asp-w2-lib.mjs')
console.log('sud-w5-probe v2', L.URL_)
const W = L.mk('probe', L.SIZES.d)
const { b, p } = await L.world(L.SIZES.d, W)
await L.signIn(p, 'ad', 'a')
console.log('today', await L.today(p), 'week', await L.weekOf(p))
const info = await p.evaluate(() => {
  const P = window.PEOPLE
  const idOf = cs => Object.keys(P).find(k => (P[k].cs || '').toLowerCase() === cs.toLowerCase())
  const items = id => (window.DAYS || []).map((d, di) => {
    const out = []
    ;(d.waves || []).forEach((w, wi) => (w.formations || []).forEach(f => (f.aircraft || []).forEach(a => { if (a.p === id || a.w === id) out.push(`FLY ${f.cs || ''} ${f.msn || ''} T/O ${f.to} LD ${f.ld} brief ${f.brf || f.br || ''}`) })))
    const scan = (arr, kind) => Object.entries(arr || {}).forEach(([ri, r]) => { if (JSON.stringify(r).includes('"' + id + '"')) out.push(`${kind}[${ri}] ${JSON.stringify(r).slice(0, 200)}`) })
    scan(d.ground, 'GROUND'); scan(d.allhands, 'PROG'); scan(d.duties, 'DUTY'); scan(d.sims, 'SIM')
    for (const k of Object.keys(d)) if (!['waves', 'ground', 'allhands', 'duties', 'sims', 'dt', 'rid'].includes(k) && JSON.stringify(d[k] || '').includes('"' + id + '"')) out.push('OTHER ' + k + ' ' + JSON.stringify(d[k]).slice(0, 160))
    return d.dt + ': ' + (out.join(' | ') || '—')
  })
  const hex = 'rocky', ol = idOf('Outlaw')
  return {
    keys: Object.keys(window.DAYS[0] || {}),
    hex: { rec: P[hex], items: items(hex) },
    outlaw: ol ? { id: ol, rec: P[ol], items: items(ol) } : 'no Outlaw',
    sansMen: Object.keys(P).filter(k => P[k].san).map(k => P[k].cs + '(' + k + ',' + P[k].seat + ')'),
    wsos: Object.keys(P).filter(k => P[k].seat === 'RCP' && !P[k].archived).map(k => P[k].cs + '(' + k + ')').join(' '),
    inputsHex: (window.INPUTS || []).filter(r => JSON.stringify(r).includes('"rocky"')).map(r => JSON.stringify(r).slice(0, 200)),
    inputsOl: ol ? (window.INPUTS || []).filter(r => JSON.stringify(r).includes('"' + ol + '"')).map(r => JSON.stringify(r).slice(0, 200)) : [],
  }
})
console.log(JSON.stringify(info, null, 1))
await L.usersOpen(p, W)
const acc = await p.evaluate(() => [...document.querySelectorAll('#accList [data-person]')].map(e => e.dataset.person + ':' + (e.innerText || '').replace(/\s+/g, ' ').slice(0, 80)).join('\n'))
console.log(acc)
console.log('errors', W.errs)
await b.close()
