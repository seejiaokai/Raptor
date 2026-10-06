/* S26 — boundary and ring style (the exactly-twelve-hours edge, TT without a ring, the late show, an earlier meeting) */
import * as C from './rbl-C-lib.mjs'
const { B, L, W, K, ID, MON, TUE, R, pic, picEl } = C

async function view(p, tag, { shots = true } = {}) {
  const s = await C.seeWeek(p, TUE, tag, { noPics: !shots })
  const lines = (s.list.full || []).filter(x => x.text.includes(C.CSN) && /rest|turning|Tight/i.test(x.text)).map(x => ({ sev: x.sev, text: x.text.replace(/ ✕| ↺/g, '') }))
  const tue = s.pk.filter(x => x.where === 'flying line'); const open = s.pkOpen.filter(x => x.where === 'flying line')
  const mon = s.pv.filter(x => x.where === 'flying line')
  return { s, lines, tue, open, mon, held: s.held.map(w => `${w.sev}/${w.code}`) }
}
const ringTxt = xs => xs.length ? xs.map(x => `${x.solid ? 'SOLID' : x.dashed ? 'DASHED' : 'no ring'}${x.dotted ? '+DOTTED' : ''}${x.chip ? ' chip ' + x.chip : ''} [${x.cls.split(' ').filter(c => /^(warn|hard|adv|note|boxred|boxdash|boxdot)$/.test(c)).join(' ')}${x.outline ? ' | outline ' + x.outline : ''}${x.shadow ? ' | shadow ' + x.shadow.replace(/rgb([0-9, ]+)/, 'c').slice(0, 30) : ''}]`).join(' / ') : '(none drawn)'
const brief = async (p, t, v) => { await K.ff(p, TUE, t.gi, 0, 'br', v) }

const { browser, p, errors } = await K.fresh()
const pics = {}
try {
  const cs = await B.csOf(p, ID)
  /* Monday: lands 15:00, the day ends 17:00 (2h debrief) — clear at 05:00 on Tuesday. Tuesday: take-off 07:00. */
  const m = await C.flyWave(p, MON, { cs: 'ZM', msn: 'BFM', to: '13:00', ld: '15:00' })
  const t = await C.flyWave(p, TUE, { cs: 'ZT', msn: 'BFM', to: '07:00', ld: '08:00' })
  /* a: nominal only */
  let v = await view(p, 's26-a-nominal')
  R('S26.a', `Monday ZM lands 15:00 (end 17:00, clear 05:00); Tuesday ZT take-off 07:00, NO Brief and no In-time typed; ${cs} on both`,
    `Tuesday lines naming him: ${JSON.stringify(v.lines)}; codes held ${v.held.join(',') || 'none'}; Tuesday cockpit puck (list shut): ${ringTxt(v.tue)}; list OPEN: ${ringTxt(v.open)}; Monday cockpit puck: ${ringTxt(v.mon)}`,
    'RECORDED', v.s.pics)
  for (const [lab, val, want] of [['b', '05:00', 'legal'], ['c', '04:59', 'breach'], ['d', '05:01', 'legal'], ['e', '05:00', 'legal']]) {
    await brief(p, t, val)
    v = await view(p, `s26-${lab}-brief-${val.replace(':', '')}`, { shots: want === 'breach' || lab === 'b' })
    const breach = v.held.some(x => /CREW_REST/.test(x))
    const ring = v.tue.some(x => x.solid), dot = v.mon.some(x => x.dotted)
    const ok = want === 'breach' ? breach && ring && dot : !breach && !ring && !dot && v.held.some(x => /CREW_TIGHT/.test(x)) && v.tue.some(x => x.chip === 'TT')
    R(`S26.${lab}`, `Brief typed ${val} on Tuesday (take-off 07:00; Monday clear at 05:00) — ${want === 'legal' ? 'expect NO breach (exactly twelve hours is legal for 05:00; later is legal)' : 'expect a breach, one minute short'}`,
      `Tuesday lines naming him: ${JSON.stringify(v.lines)}; codes held ${v.held.join(',') || 'none'}; Tuesday cockpit puck (list shut): ${ringTxt(v.tue)}; list OPEN: ${ringTxt(v.open)}; Monday cockpit puck: ${ringTxt(v.mon)}`, ok ? 'PASS' : 'FAIL', v.s.pics)
  }
  /* late show: Monday lands 17:00 (end 19:00, clear 07:00); Tuesday take-off 08:00, Brief 05:00 → rest clears between report and step */
  await K.ff(p, MON, m.gi, 0, 'to', '15:00'); await K.ff(p, MON, m.gi, 0, 'ld', '17:00')
  await K.ff(p, TUE, t.gi, 0, 'to', '08:00'); await K.ff(p, TUE, t.gi, 0, 'ld', '09:00'); await brief(p, t, '05:00')
  v = await view(p, 's26-f-noshow')
  R('S26.f', 'Monday lands 17:00 (clear 07:00); Tuesday take-off 08:00, Brief 05:00, no late show', `lines: ${JSON.stringify(v.lines)}; codes ${v.held.join(',') || 'none'}; Tuesday puck (list shut): ${ringTxt(v.tue)}; with the list OPEN: ${ringTxt(v.open)}; Monday puck: ${ringTxt(v.mon)}`,
    v.held.some(x => /CREW_REST/.test(x)) && v.tue.some(x => x.solid) && v.mon.some(x => x.dotted) ? 'PASS' : 'FAIL', v.s.pics)
  await W.boardOn(p, TUE)
  await K.boardTo(p, TUE)
  await W.boardText(p, `fr:${TUE}.${t.gi}.0.0`, 'LATE SHOW')
  v = await view(p, 's26-g-lateshow-achievable')
  R('S26.g', 'the same, with LATE SHOW typed in the line\'s remarks (step 07:00, rest clears 07:00 — achievable)', `lines: ${JSON.stringify(v.lines)}; codes ${v.held.join(',') || 'none'}; Tuesday puck (list shut): ${ringTxt(v.tue)}; with the list OPEN: ${ringTxt(v.open)}; Monday puck: ${ringTxt(v.mon)}`,
    v.held.some(x => /CREW_REST/.test(x)) && v.tue.some(x => x.dashed) && !v.tue.some(x => x.solid) && v.mon.some(x => x.dotted) ? 'PASS' : 'FAIL', v.s.pics)
  /* not achievable: take-off 06:30 → step 05:30 < clear 07:00 */
  await K.ff(p, TUE, t.gi, 0, 'to', '06:30'); await K.ff(p, TUE, t.gi, 0, 'ld', '07:30')
  v = await view(p, 's26-h-lateshow-not-achievable')
  R('S26.h', 'LATE SHOW still typed, take-off moved to 06:30 (step 05:30 is before rest clears at 07:00 — not achievable)', `lines: ${JSON.stringify(v.lines)}; codes ${v.held.join(',') || 'none'}; Tuesday puck (list shut): ${ringTxt(v.tue)}; with the list OPEN: ${ringTxt(v.open)}; Monday puck: ${ringTxt(v.mon)}`,
    v.held.some(x => /CREW_REST/.test(x)) && v.tue.some(x => x.solid) && !v.tue.some(x => x.dashed) ? 'PASS' : 'FAIL', v.s.pics)
  /* back to achievable, then an earlier meeting: typed Meeting 05:00–05:30 on Tuesday through the Inputs page */
  await K.ff(p, TUE, t.gi, 0, 'to', '08:00'); await K.ff(p, TUE, t.gi, 0, 'ld', '09:00')
  const f = await C.fileInput(p, { type: 'Meeting', di: TUE, allday: false, from: '04:00', to: '04:30', remarks: 'S26 meet' })
  v = await view(p, 's26-i-meeting-bound')
  R('S26.i', `take-off back at 08:00 with LATE SHOW (dashed in step g); then a Meeting 04:00–04:30 for ${cs} filed on the Inputs page (filed: ${!!f.iid})`, `lines: ${JSON.stringify(v.lines)}; codes ${v.held.join(',') || 'none'}; Tuesday puck (list shut): ${ringTxt(v.tue)}; with the list OPEN: ${ringTxt(v.open)}; Monday puck: ${ringTxt(v.mon)}`,
    v.held.some(x => /CREW_REST/.test(x)) && v.tue.some(x => x.solid) && !v.tue.some(x => x.dashed) ? 'PASS' : 'FAIL', v.s.pics)
} catch (e) { R('S26', 'script', String(e.stack || e).slice(0, 700), 'NOT WALKED', [await pic(p, 's26-X').catch(() => '')]) }
R('S26.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
B.savePart('rbl-C-s26')
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}\n   ${r.did}\n   → ${r.saw}\n   ${r.pics.join(' ')}`)
