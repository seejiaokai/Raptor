import * as C from './rbl-C-lib.mjs'
const { B, L, W, K, ID, MON, TUE } = C
const { browser, p, errors } = await K.fresh()
try {
  const r = await p.evaluate(() => {
    const out = []
    for (const [k, v] of Object.entries(window.PEOPLE)) {
      if (['all', 'allavail'].includes(k)) continue
      const used = [0, 1, 2].filter(d => JSON.stringify(window.DAYS[d]).includes('"' + k + '"') || JSON.stringify(window.DAYS[d]).includes('"' + k + '.'))
      const inp = window.INPUTS.filter(x => x.person === k).map(x => x.type + '@' + x.date + (x.endDate ? '→' + x.endDate : ''))
      out.push(`${k}:${v.cs}:${v.seat}:q=${v.q}:san=${v.san ? 'Y' : 'n'}:days=${used.join('')}:inputs=${inp.join(',')}`)
    }
    return out
  })
  console.log(r.filter(x => x.includes('days=:') ).join('\n'))
  console.log('ERR', errors.join(' | '))
} catch (e) { console.log('ERR', e.stack) }
await browser.close()
