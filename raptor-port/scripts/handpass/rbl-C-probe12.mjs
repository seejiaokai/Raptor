import * as C from './rbl-C-lib.mjs'
const { B, L, W, K, ID, MON, TUE } = C
const { browser, p, errors } = await K.fresh()
try {
  const r = await p.evaluate(() => {
    const out = []
    for (const who of ['stiff', 'bane']) for (let d = 0; d < 3; d++) {
      const s = JSON.stringify(window.DAYS[d])
      let i = -1; const hits = []
      while ((i = s.indexOf('"' + who + '"', i + 1)) >= 0) hits.push(s.slice(Math.max(0, i - 60), i + 12).replace(/\s+/g, ' '))
      out.push(who + ' day' + d + ': ' + hits.length + ' ' + hits.slice(0, 3).join(' // '))
    }
    out.push('inputs ' + JSON.stringify(window.INPUTS.filter(x => x.person === 'stiff' || x.person === 'bane').map(x => x.person + x.type + x.date)))
    return out
  })
  console.log(r.join('\n'))
  const w = await B.warnsOf(p, 0); console.log('mon warns', w.filter(x => x.who.includes('stiff')).map(x => x.msg).join(' | '))
  const w1 = await B.warnsOf(p, 1); console.log('tue warns', w1.filter(x => x.who.includes('stiff')).map(x => x.msg).join(' | '))
} catch (e) { console.log('ERR', e.stack) }
await browser.close()
