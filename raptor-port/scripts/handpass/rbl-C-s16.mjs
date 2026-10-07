/* S16 — accepted clock spellings (take-off on week and board; 0500H / 0500L in In-time / Rally text)
   S17 — reporting-text variations (IN TIME / IN-TIME / INTIME / named Rally; reporting-line order reversed) */
import * as C from './rbl-C-lib.mjs'
const { B, L, W, K, ID, MON, TUE, R, pic, picEl } = C

const restOf = async p => {
  const ws = await C.fullWarnsX(p, TUE)
  return ws.filter(w => /CREW_REST|TIGHT|TT|TURN/i.test(w.code) || /rest|turning/i.test(w.msg)).map(w => `${w.sev}/${w.code}: ${w.msg}`)
}
const dispVal = (p, surf, key) => p.evaluate(([s, k]) => {
  const e = document.querySelector(s === 'board' ? `#schedBoard [data-bfld="${k}"], #schedBoard [data-txt="${k}"]` : `#eWeek [data-txt="${k}"]`)
  return e ? (e.value !== undefined && e.tagName === 'INPUT' ? e.value : e.textContent.trim()) : null
}, [surf, key])

const { browser, p, errors } = await K.fresh()
try {
  const cs = await B.csOf(p, ID)
  const m = await C.flyWave(p, MON, { cs: 'ZM', msn: 'BFM', to: '20:00', ld: '22:30' })
  const t = await C.flyWave(p, TUE, { cs: 'ZT', msn: 'BFM', to: '07:00', ld: '08:00' })
  const ref = await restOf(p)
  R('S16.0', `reference: Monday ZM 20:00–22:30, Tuesday ZT take-off 07:00 landing 08:00 (no Brief), ${cs} on both`, `his rest line(s): ${JSON.stringify(ref)}`, ref.length ? 'PASS' : 'FAIL', [await pic(p, 's16-0-ref')])
  for (const surf of ['board', 'week']) {
    const key = `ff:${TUE}.${t.gi}.0.to`
    const seen = []
    for (const sp of ['700', '0700', '7:00', '07:00', '0700H']) {
      await C.typeBox(p, surf, key, sp, 'blur')
      const stored = await C.formVal(p, TUE, t.gi, 0, 'to')
      const shown = await dispVal(p, surf, key)
      const r = await restOf(p)
      seen.push({ sp, stored, shown, r })
    }
    const same = seen.every(x => x.stored === '07:00' && JSON.stringify(x.r) === JSON.stringify(ref))
    R(`S16.${surf}`, `take-off box typed on the ${surf === 'board' ? 'Board' : 'week'}: 700 · 0700 · 7:00 · 07:00 · 0700H (each committed by clicking away)`, seen.map(x => `"${x.sp}" → stored "${x.stored}", box shows "${x.shown}", rest line ${JSON.stringify(x.r).slice(0, 170)}`).join(' | '), same ? 'PASS' : 'FAIL', [await pic(p, `s16-${surf}-after`)])
  }
  /* In-time / Rally text: 0500H, 0500L against 05:00 */
  for (const surf of ['board', 'week']) {
    await K.itAdd(p, surf, TUE, t.gi)
    const seen = []
    for (const txt of ['04:00 IN TIME', '0400H IN TIME', '0400L IN TIME', '0400H RALLY', '0400L RALLY']) {
      await K.itSet(p, surf, TUE, t.gi, 0, txt)
      seen.push({ txt, r: await restOf(p), fb: await K.feedback(p, surf, TUE, t.gi) })
    }
    const base = JSON.stringify(seen[0].r)
    const same = seen.every(x => JSON.stringify(x.r) === base) && base.includes('report 04:00')
    R(`S16.it-${surf}`, `In-time / Rally line typed on the ${surf === 'board' ? 'Board' : 'week'}: ${seen.map(x => x.txt).join(' · ')}`, seen.map(x => `"${x.txt}" → ${JSON.stringify(x.r).slice(0, 200)}${x.fb ? ' [box says: ' + x.fb + ']' : ''}`).join(' | '), same ? 'PASS' : 'FAIL', [await pic(p, `s16-it-${surf}`)])
    await K.itDel(p, surf, TUE, t.gi, 0)
  }
} catch (e) { R('S16', 'script', String(e.stack || e).slice(0, 700), 'NOT WALKED', [await pic(p, 's16-X').catch(() => '')]) }

/* S17 */
try {
  const cs = await B.csOf(p, ID)
  /* the same world: the Tuesday wave gets a blank second line (X on it too) — "a blank and a timed formation" */
  const t = { gi: await p.evaluate(() => window.DAYS[1].waves.length - 1) }
  const x = await C.extraLine(p, TUE, t.gi)
  const nowIt = await K.itLines(p, TUE, t.gi)
  for (let i = nowIt.length - 1; i >= 0; i--) await K.itDel(p, 'board', TUE, t.gi, i)
  const out = []
  await K.itAdd(p, 'board', TUE, t.gi)
  for (const txt of ['04:00 IN TIME', '04:00 IN-TIME', '04:00 INTIME', '04:00 ZT RALLY', '04:00 IN TIME + RALLY', '04:00']) {
    await K.itSet(p, 'board', TUE, t.gi, 0, txt)
    out.push({ txt, r: await restOf(p) })
  }
  const same = out.every(o => JSON.stringify(o.r) === JSON.stringify(out[0].r)) && out[0].r.some(x => /report 04:00/.test(x))
  R('S17.a', `Tuesday wave now has the timed ZT and a blank second line (${cs} on both; blank took ${x.took}); one reporting line replaced by: ${out.map(o => o.txt).join(' · ')}`, out.map(o => `"${o.txt}" → ${JSON.stringify(o.r).slice(0, 210)}`).join(' | '), same ? 'PASS' : 'FAIL', [await pic(p, 's17-a')])
  /* two reporting lines, then the order reversed */
  await K.itSet(p, 'board', TUE, t.gi, 0, '04:00 IN TIME')
  await K.itAdd(p, 'board', TUE, t.gi)
  await K.itSet(p, 'board', TUE, t.gi, 1, '03:30 ZT RALLY')
  const r1 = await restOf(p)
  const pa = await pic(p, 's17-b-order1')
  await K.itSet(p, 'board', TUE, t.gi, 0, '03:30 ZT RALLY')
  await K.itSet(p, 'board', TUE, t.gi, 1, '04:00 IN TIME')
  const r2 = await restOf(p)
  const pb = await pic(p, 's17-b-order2')
  R('S17.b', 'two reporting lines "04:00 IN TIME" + "03:30 ZT RALLY", then the same two in the reverse order', `order 1: ${JSON.stringify(r1).slice(0, 260)} | order 2 (reversed): ${JSON.stringify(r2).slice(0, 260)}; lines now ${JSON.stringify(await K.itLines(p, TUE, t.gi))}`, JSON.stringify(r1) === JSON.stringify(r2) && r1.some(x => /report 03:30/.test(x)) ? 'PASS' : 'FAIL', [pa, pb])
} catch (e) { R('S17', 'script', String(e.stack || e).slice(0, 700), 'NOT WALKED', [await pic(p, 's17-X').catch(() => '')]) }
R('S16.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
B.savePart('rbl-C-s16')
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}\n   ${r.did}\n   → ${r.saw}\n   ${r.pics.join(' ')}`)
