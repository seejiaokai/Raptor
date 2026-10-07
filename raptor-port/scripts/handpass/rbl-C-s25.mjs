/* S25 — overnight and reporting precedence (a report the evening before; In-time / Rally scopes, duplicates, order) */
import * as C from './rbl-C-lib.mjs'
const { B, L, W, K, ID, MON, TUE, R, pic, picEl } = C

async function view(p, tag, { shots = true } = {}) {
  const s = await C.seeWeek(p, TUE, tag, { noPics: !shots })
  const lines = (s.list.full || []).filter(x => x.text.includes(C.CSN) && /rest|turning|Tight|report/i.test(x.text)).map(x => x.text.replace(/ ✕| ↺/g, ''))
  return { s, lines, tue: s.pk.filter(x => x.where === 'flying line'), mon: s.pv.filter(x => x.where === 'flying line' || x.where === 'ground row'), held: s.held.map(w => `${w.sev}/${w.code}: ${w.msg}`) }
}
const ringTxt = xs => xs.length ? xs.map(x => `${x.where}:${x.solid ? 'SOLID' : x.dashed ? 'DASHED' : 'no ring'}${x.dotted ? '+DOTTED' : ''}${x.chip ? ' chip ' + x.chip : ''}`).join(' / ') : '(none drawn)'
const rest = v => v.held.find(x => /CREW_REST/.test(x)) || null
const itl = (p, gi) => C.K.itLines(p, TUE, gi)

const { browser, p, errors } = await K.fresh()
try {
  const cs = await B.csOf(p, ID)
  const g = await C.groundRow(p, MON, 'LATE DUTY', '14:00', '22:00', true)
  const t = await C.flyWave(p, TUE, { cs: 'ZT', msn: 'BFM', br: '00:30', to: '01:00', ld: '02:00' })
  const base = `Monday Ground Programme row LATE DUTY 14:00–22:00 with ${cs} (seated ${g.took}); Tuesday ZT take-off 01:00, landing 02:00, Brief 00:30, ${cs} seated (${t.took})`
  let v = await view(p, 's25-a-brief-only')
  R('S25.a', base + '; no In-time line', `held: ${JSON.stringify(v.held)}; Tuesday puck ${ringTxt(v.tue)}; Monday ${ringTxt(v.mon)}`, rest(v) && /00:30/.test(rest(v)) ? 'PASS' : 'FAIL', v.s.pics)

  await K.itAdd(p, 'board', TUE, t.gi)
  const live = await K.itSet(p, 'board', TUE, t.gi, 0, '23:00 IN TIME')
  const fbk = await K.feedback(p, 'board', TUE, t.gi)
  v = await view(p, 's25-b-intime-2300')
  R('S25.b', `"+ In-time / Rally" → typed "23:00 IN TIME" (box feedback while typing: ${live ? '"' + live + '"' : 'none'}; after: ${fbk ? '"' + fbk + '"' : 'none'})`,
    `held: ${JSON.stringify(v.held)}; list lines: ${JSON.stringify(v.lines.map(x => x.slice(0, 260)))}; Tuesday puck ${ringTxt(v.tue)}; Monday ${ringTxt(v.mon)}`,
    rest(v) && /23:00/.test(rest(v)) && /1h00/.test(rest(v)) ? 'PASS' : 'FAIL', v.s.pics)
  const sentenceB = rest(v)

  const x1 = await C.extraLine(p, TUE, t.gi)
  v = await view(p, 's25-c-blankline', { shots: false })
  R('S25.c', `"+ Line" on Tuesday's wave, ${cs} seated on the blank line (took ${x1.took})`, `held: ${JSON.stringify(v.held)}`, rest(v) === sentenceB ? 'PASS' : 'FAIL')
  const t2 = await C.flyWave(p, TUE, { }, true)   /* a second wave whose only line is blank, X on it */
  v = await view(p, 's25-d-blank-wave', { shots: true })
  R('S25.d', `"+ Wave" → another flying wave, line blank, ${cs} seated on it (took ${t2.took})`, `held: ${JSON.stringify(v.held)}; Tuesday puck ${ringTxt(v.tue)}; Monday ${ringTxt(v.mon)}`, rest(v) === sentenceB ? 'PASS' : 'FAIL', v.s.pics)

  /* a RALLY line scoped to the formation ZT, beside the whole-wave IN TIME 23:00 */
  await K.itAdd(p, 'board', TUE, t.gi)
  await K.itSet(p, 'board', TUE, t.gi, 1, '22:30 ZT RALLY')
  v = await view(p, 's25-e-rally-2230')
  R('S25.e', 'a second reporting line "22:30 ZT RALLY" beside the whole-wave "23:00 IN TIME" (two activities: D505 resolves each separately; D506 takes the earliest)', `intimes ${JSON.stringify(await itl(p, t.gi))}; held: ${JSON.stringify(v.held)}; Tuesday puck ${ringTxt(v.tue)}`, rest(v) && /22:30/.test(rest(v)) ? 'PASS' : 'FAIL', v.s.pics)

  /* duplicate same-activity scoped lines, both orders */
  await K.itSet(p, 'board', TUE, t.gi, 0, '23:00 ZT IN TIME')
  await K.itSet(p, 'board', TUE, t.gi, 1, '22:45 ZT IN TIME')
  v = await view(p, 's25-f1-dup-order1', { shots: false })
  const s1 = rest(v)
  await K.itSet(p, 'board', TUE, t.gi, 0, '22:45 ZT IN TIME')
  await K.itSet(p, 'board', TUE, t.gi, 1, '23:00 ZT IN TIME')
  v = await view(p, 's25-f2-dup-order2', { shots: true })
  const s2 = rest(v)
  R('S25.f', 'two same-activity scoped lines "23:00 ZT IN TIME" and "22:45 ZT IN TIME" in one order, then the other', `order 1 (23:00 then 22:45): ${s1}; order 2 (22:45 then 23:00): ${s2}; intimes now ${JSON.stringify(await itl(p, t.gi))}`, s1 && s1 === s2 && /22:45/.test(s1) ? 'PASS' : 'FAIL', v.s.pics)

  /* an unrelated formation's instruction must not win: a second formation ZU on the same wave, another man on it, with an earlier RALLY scoped to ZU */
  await K.addLine(p, TUE, t.gi)
  const fi = (await C.nLines(p, TUE, t.gi)) - 1
  await C.csFix(p, TUE, t.gi, fi, { cs: 'ZU', msn: 'BFM', to: '01:30', ld: '02:30' })
  await K.seat(p, TUE, t.gi, fi, 0, 'p', 'bane')
  await K.itAdd(p, 'board', TUE, t.gi)
  await K.itSet(p, 'board', TUE, t.gi, 2, '21:00 ZU RALLY')
  v = await view(p, 's25-g-other-formation')
  R('S25.g', `a second formation ZU (another man, Ranger) on the same wave, with "21:00 ZU RALLY" scoped to it; ${cs} is on ZT only`, `intimes ${JSON.stringify(await itl(p, t.gi))}; held: ${JSON.stringify(v.held)}; Tuesday puck ${ringTxt(v.tue)}`, s2 && rest(v) === s2 ? 'PASS' : 'FAIL', v.s.pics)
} catch (e) { R('S25', 'script', String(e.stack || e).slice(0, 700), 'NOT WALKED', [await pic(p, 's25-X').catch(() => '')]) }
R('S25.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
B.savePart('rbl-C-s25')
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}\n   ${r.did}\n   → ${r.saw}\n   ${r.pics.join(' ')}`)
