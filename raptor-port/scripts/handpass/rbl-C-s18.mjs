/* S18 — invalid time attempts (morning, 25:90, 1260) into take-off, landing and Brief, committed by Tab and by clicking away, on the week and on the Board */
import * as C from './rbl-C-lib.mjs'
const { B, L, W, K, ID, MON, TUE, R, pic, picEl } = C

const restOf = async p => (await C.fullWarnsX(p, TUE)).filter(w => /CREW_REST/.test(w.code)).map(w => `${w.sev}/${w.code}: ${w.msg}`)
const dispVal = (p, surf, key) => p.evaluate(([s, k]) => {
  const e = document.querySelector(s === 'board' ? `#schedBoard [data-bfld="${k}"], #schedBoard [data-txt="${k}"]` : `#eWeek [data-txt="${k}"]`)
  return e ? (e.tagName === 'INPUT' ? e.value : e.textContent.trim()) : null
}, [surf, key])
const { browser, p, errors } = await K.fresh()
try {
  const cs = await B.csOf(p, ID)
  const { m, t } = await C.baselineB(p)
  const ref = await restOf(p)
  const want = { to: '07:00', ld: '08:00', br: '05:00' }
  R('S18.0', `Baseline B (Monday 20:00–22:30; Tuesday Brief 05:00, take-off 07:00, landing 08:00), ${cs} on both`, `his rest line: ${JSON.stringify(ref)}`, ref.length ? 'PASS' : 'FAIL', [await pic(p, 's18-0-base')])
  for (const surf of ['board', 'week']) {
    const bad = []; const log = []
    let n = 0
    for (const f of ['to', 'ld', 'br']) for (const v of ['morning', '25:90', '1260']) for (const commit of ['tab', 'blur']) {
      const key = `ff:${TUE}.${t.gi}.0.${f}`
      const before = await C.formVal(p, TUE, t.gi, 0, f)
      let err = null
      try { await C.typeBox(p, surf, key, v, commit) } catch (e) { err = String(e.message).slice(0, 80) }
      const stored = await C.formVal(p, TUE, t.gi, 0, f)
      const shown = await dispVal(p, surf, key)
      const r = await restOf(p)
      n++
      const ok = !err && stored === want[f] && JSON.stringify(r) === JSON.stringify(ref) && (shown === want[f] || shown === want[f].replace(/^0/, ''))
      log.push(`${f} ${v}/${commit}: stored "${stored}" box "${shown}"${ok ? '' : ' ✗'}${err ? ' err ' + err : ''}`)
      if (!ok) bad.push(`${f} ${v}/${commit}: stored "${stored}" (was "${before}"), box shows "${shown}", rest ${JSON.stringify(r).slice(0, 120)}`)
    }
    R(`S18.${surf}`, `${n} attempts on the ${surf === 'board' ? 'Board' : 'week'}: morning · 25:90 · 1260 into take-off, landing and Brief, each committed by Tab and by clicking away`, bad.length ? `${bad.length} did not restore/keep: ${bad.join(' || ')}` : `every attempt restored the prior value and his rest line stayed the same (${log.length} checked); sample: ${log.slice(0, 6).join(' | ')}`, bad.length ? 'FAIL' : 'PASS', [await pic(p, `s18-${surf}-end`)])
  }
} catch (e) { R('S18', 'script', String(e.stack || e).slice(0, 700), 'NOT WALKED', [await pic(p, 's18-X').catch(() => '')]) }
R('S18.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
B.savePart('rbl-C-s18')
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}\n   ${r.did}\n   → ${r.saw}\n   ${r.pics.join(' ')}`)
