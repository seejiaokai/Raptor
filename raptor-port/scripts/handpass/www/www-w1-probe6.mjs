/* www w1 probe 6: what is Ace's Friday in the demo week */
process.env.WWW_WHO = 'w1'
process.env.WWW_RUN ||= 'probe6-d'
const H = await import('./www-w1-lib3.mjs')
const { X, say } = H
const w = await X.open({ phone: false })
const { page } = w
const MAN = await H.pidOf(page, 'Ace')
say('Ace', MAN)
const hits = await page.evaluate(([d, m]) => {
  const out = []
  const walk = (o, path) => { if (o && typeof o === 'object') { for (const k of Object.keys(o)) { const v = o[k]; if (v === m && /^(id|p|w|who)$/.test(k)) out.push(path + '.' + k + ' :: ' + JSON.stringify(o).slice(0, 160)); else if (v && typeof v === 'object') walk(v, path + '.' + k) } } }
  walk(window.DAYS[d], 'D' + d)
  return out
}, [4, MAN])
say(JSON.stringify(hits, null, 1))
await X.fin(w)
