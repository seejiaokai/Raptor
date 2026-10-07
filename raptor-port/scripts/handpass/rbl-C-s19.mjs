/* S19 — malformed reporting text on a blank formation, with B's timed breach kept; and Publish is not hard-blocked by timing-order warnings (D509) */
import * as C from './rbl-C-lib.mjs'
const { B, L, W, K, ID, MON, TUE, R, pic, picEl } = C

const restOf = async p => (await C.fullWarnsX(p, TUE)).filter(w => /CREW_REST/.test(w.code)).map(w => `${w.sev}/${w.code}: ${w.msg}`)
const dayWarns = async p => (await B.warnsOf(p, TUE)).filter(w => /REPORT|UNRESOLVED/i.test(w.code) || /report|clock|rally|in.time/i.test(w.msg)).map(w => `${w.sev}/${w.code}${w.off ? '/HIDDEN' : ''}: ${w.msg}`)
const { browser, p, errors } = await K.fresh()
try {
  const cs = await B.csOf(p, ID)
  const { m, t } = await C.baselineB(p)
  const ref = await restOf(p)
  const x = await C.extraLine(p, TUE, t.gi)            /* the blank formation, X on it */
  R('S19.0', `Baseline B plus "+ Line" on Tuesday's wave with ${cs} seated on the blank line (took ${x.took})`, `his rest line: ${JSON.stringify(await restOf(p))}`, JSON.stringify(await restOf(p)) === JSON.stringify(ref) ? 'PASS' : 'FAIL', [await pic(p, 's19-0')])
  await K.itAdd(p, 'board', TUE, t.gi)
  const outs = []
  for (const txt of ['8h00 IN TIME', '25:90 RALLY', '08.00 IN TIME']) {
    const live = await K.itSet(p, 'board', TUE, t.gi, 0, txt)
    const fb = await K.feedback(p, 'board', TUE, t.gi)
    const r = await restOf(p)
    const dw = await dayWarns(p)
    const pc = await pic(p, `s19-${txt.replace(/[^a-z0-9]/gi, '')}`)
    outs.push({ txt, live, fb, r, dw, pc })
  }
  const keep = outs.every(o => JSON.stringify(o.r) === JSON.stringify(ref))
  const explained = outs.every(o => (o.fb && o.fb.length > 3) || o.dw.length)
  R('S19.a', `a reporting line typed in the wave's In-time / Rally box: ${outs.map(o => o.txt).join(' · ')}`,
    outs.map(o => `"${o.txt}": box says while typing ${o.live ? '"' + o.live + '"' : 'nothing'}, after ${o.fb ? '"' + o.fb + '"' : 'nothing'}; day warnings about it ${JSON.stringify(o.dw).slice(0, 230)}; his rest line ${o.r.length ? 'kept' : 'GONE'}`).join(' | '),
    keep && explained ? 'PASS' : 'FAIL', outs.map(o => o.pc))
  /* publish: with the breach and a malformed clock standing */
  await K.itSet(p, 'board', TUE, t.gi, 0, '25:90 RALLY')
  await B.toEdit(p)
  const pub = await K.publishOrig(p, TUE)
  const h = await B.head(p, TUE)
  const after = await restOf(p)
  R('S19.b', `with the breach and "25:90 RALLY" still standing: the four sign-offs and Publish day (${cs} on Tuesday)`, `signed ${JSON.stringify(pub.s)}; button pressed ${JSON.stringify(pub.r)}; the day's head now: tag "${h.tag}", pending "${h.pending}", sign-offs [${h.signs.join(' | ')}]; his rest line after publishing: ${JSON.stringify(after)}`, pub.r && pub.r.pressed && /ORIG|Original|v1|issued|1/i.test(h.tag || '') ? 'PASS' : 'FAIL', [await pic(p, 's19-b-published')])
} catch (e) { R('S19', 'script', String(e.stack || e).slice(0, 700), 'NOT WALKED', [await pic(p, 's19-X').catch(() => '')]) }
R('S19.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
B.savePart('rbl-C-s19')
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}\n   ${r.did}\n   → ${r.saw}\n   ${r.pics.join(' ')}`)
