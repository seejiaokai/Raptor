/* walker B, script 2: P2-10 (suggested brief, publish), P2-11 (equal Rally and Brief), P2-12 (missing and malformed clocks),
   P2-13 (formation names are bounded). Each in its own fresh world. */
import * as K from './stk-B-lib.mjs'
const { B, L, W, R, pic, picEl, sleep } = K
const which = process.argv[2] || 'all'
const DI = 4   /* Friday — empty in the demo */
const mins = s => { const m = /(\d+)h(\d+)?/.exec(s || ''); return m ? +m[1] * 60 + (+m[2] || 0) : (/^\d+m/.test(s || '') ? +s.slice(0, -1) : null) }
const rep = ws => ws.filter(x => /REPORT/.test(x))
async function mk(p, cs, to, ld, crew, msn = 'BFM') {
  const { gi, label } = await K.addFlyWave(p, DI)
  await K.ff(p, DI, gi, 0, 'cs', cs); await K.ff(p, DI, gi, 0, 'msn', msn)
  if (to) await K.ff(p, DI, gi, 0, 'to', to)
  if (ld) await K.ff(p, DI, gi, 0, 'ld', ld)
  const took = []
  if (crew) { took.push((await K.seat(p, DI, gi, 0, 0, 'p', crew[0])).took); took.push((await K.seat(p, DI, gi, 0, 0, 'w', crew[1])).took) }
  return { gi, label, took }
}
const dayBox = (di, gi) => `#eWeek .day[data-day="${di}"] [data-itline="${di}|${gi}|0"]`

async function p210() {
  const { browser, p, errors } = await K.fresh()
  try {
    const w = await mk(p, 'TS', '12:00', '13:00', ['taipan', 'mamba'])
    await K.itAdd(p, 'week', DI, w.gi)
    const live = await K.itSet(p, 'week', DI, w.gi, 0, '10:00 RALLY')
    const fb = await K.feedback(p, 'week', DI, w.gi)
    const wl = await K.warnsFull(p, DI)
    await B.openList(p, '#eWeek', DI)
    const lst = await B.readList(p, '#eWeek', DI)
    const rl = (lst.lines || []).find(x => /rally/i.test(x.text))
    const p1 = await K.picEl(p, `#eWeek .day[data-day="${DI}"] [data-dwbox="${DI}"]`, 'p10-warning', { pad: 10, maxH: 500 })
    const brLine = wl.find(x => /REPORT_ORDER/.test(x.code))
    R('P2-10.a', 'new wave TS 12:00→13:00 (Cobra+Sidewinder), blank Brief; "+ In-time / Rally" then typed "10:00 RALLY" and committed',
      `while typing "${live}"; settled "${fb}"; the day's warning list: ${JSON.stringify(wl.filter(x => /REPORT/.test(x.code)).map(x => `${x.sev} ${x.msg}`))}; list bar "${lst.bar}", Rally line on the list "${rl ? rl.text : 'none'}" (button ${rl ? rl.btn : '-'})`,
      brLine && brLine.sev === 'hard' && /suggested brief/.test(brLine.msg) && !/ brief 09:40/.test(brLine.msg.replace('suggested brief', '')) ? 'PASS' : 'FAIL', [p1])
    const h0 = await B.head(p, DI)
    const pub = await K.publishOrig(p, DI)
    const h1 = await B.head(p, DI)
    const wl1 = (await K.warnsFull(p, DI)).filter(x => /REPORT/.test(x.code))
    const p2 = await K.picEl(p, `#eWeek .day[data-day="${DI}"]`, 'p10-published', { pad: 6, maxH: 700 })
    R('P2-10.b', 'signed the four names and pressed Publish day with the red timing line still showing', `before: tag "${h0.tag}" button ${h0.beak}; button press ${JSON.stringify(pub.r)}; sign-offs ${JSON.stringify(pub.s)}; after: tag "${h1.tag}", signed line "${h1.signed}", chip "${h1.pending}"; the warning is still held: ${JSON.stringify(wl1.map(x => x.msg))}`,
      pub.r.pressed && /ORIG|AL0|Orig/i.test(h1.tag) ? 'PASS' : 'FAIL', [p2])
    /* an amendment while the warning remains */
    await K.ff(p, DI, w.gi, 0, 'msn', 'ACM')
    await B.toEdit(p); await W.showDay(p, DI)
    const h2 = await B.head(p, DI)
    const al = await K.publishAL(p, DI)
    const h3 = await B.head(p, DI)
    const wl3 = (await K.warnsFull(p, DI)).filter(x => /REPORT/.test(x.code))
    const p3 = await K.picEl(p, `#eWeek .day[data-day="${DI}"]`, 'p10-amended', { pad: 6, maxH: 700 })
    R('P2-10.c', 'changed the Mission to ACM on the published day, signed the four again, pressed Publish AL1 while the warning remains', `before: chip "${h2.pending}" tag "${h2.tag}"; press ${JSON.stringify(al.r)}; after: tag "${h3.tag}", chip "${h3.pending}", signed "${h3.signed}"; warning still there: ${JSON.stringify(wl3.map(x => x.msg))}`,
      al.r.pressed && /AL1/i.test(h3.tag) ? 'PASS' : 'FAIL', [p3])
  } catch (e) { R('P2-10.X', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'p10-X')]) }
  R('P2-10.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

async function p211() {
  const { browser, p, errors } = await K.fresh()
  try {
    const w = await mk(p, 'EQ', '12:00', '13:00', ['taipan', 'mamba'])
    await K.ff(p, DI, w.gi, 0, 'br', '09:40')
    await K.itAdd(p, 'week', DI, w.gi); await K.itAdd(p, 'week', DI, w.gi)
    await K.itSet(p, 'week', DI, w.gi, 0, '08:00 IN TIME')
    await K.itSet(p, 'week', DI, w.gi, 1, '09:40 RALLY')
    const eq = await K.warnsFull(p, DI); const fb0 = await K.feedback(p, 'week', DI, w.gi)
    const lines0 = await K.itLines(p, DI, w.gi)
    const pa = await K.picEl(p, dayBox(DI, w.gi), 'p11-equal', { pad: 50 })
    const live1 = await K.itSet(p, 'week', DI, w.gi, 1, '09:41 RALLY')
    const late = await K.warnsFull(p, DI); const fb1 = await K.feedback(p, 'week', DI, w.gi)
    await K.boardTo(p, DI); await B.boardOpenFold(p)
    const bw = await B.readBoard(p)
    const pb = await K.picEl(p, '#schedBoard .sb-warn', 'p11-board-late', { pad: 6, maxH: 400 })
    await K.itSet(p, 'board', DI, w.gi, 1, '09:40 RALLY')
    const back = await K.warnsFull(p, DI); const fb2 = await K.feedback(p, 'board', DI, w.gi)
    await B.toEdit(p); await W.showDay(p, DI)
    const pc = await K.picEl(p, dayBox(DI, w.gi), 'p11-back', { pad: 50 })
    const o = x => x.filter(z => /REPORT/.test(z.code)).map(z => z.msg)
    R('P2-11', 'new wave EQ 12:00→13:00, Brief typed 09:40; lines "08:00 IN TIME" and "09:40 RALLY"; then Rally 09:41 (week), then back to 09:40 (on the board)',
      `equal: lines ${JSON.stringify(lines0)} feedback "${fb0}" warnings ${JSON.stringify(o(eq))}; one minute later: live "${live1}" settled "${fb1}" warnings ${JSON.stringify(o(late))}, board panel ${JSON.stringify(bw.lines.map(x => x.text).filter(t => /rally|brief/i.test(t)))}; corrected: feedback "${fb2}" warnings ${JSON.stringify(o(back))}`,
      !o(eq).length && o(late).some(m => /rally 09:41.*brief 09:40/.test(m)) && !o(back).length ? 'PASS' : 'FAIL', [pa, pb, pc])
  } catch (e) { R('P2-11.X', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'p11-X')]) }
  R('P2-11.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

async function p212() {
  const { browser, p, errors } = await K.fresh()
  try {
    const crewCs = await K.cs(p, ['taipan', 'mamba'])
    const hr0 = await K.hours(p, crewCs, 'p12-ins-base')
    const w = await mk(p, '', '', '', null)    /* a wave with an empty formation and no take-off */
    await K.itAdd(p, 'week', DI, w.gi)
    const added = await K.itLines(p, DI, w.gi)
    const liveA = await K.itSet(p, 'week', DI, w.gi, 0, 'RALLY AFTER IN TIME')
    const a = await K.warnsFull(p, DI); const fbA = await K.feedback(p, 'week', DI, w.gi)
    const pa = await K.picEl(p, dayBox(DI, w.gi), 'p12-a-no-takeoff', { pad: 50 })
    R('P2-12.a', 'new wave with NO take-off and an empty formation; "+ In-time / Rally" (no take-off to work from), then typed "RALLY AFTER IN TIME"',
      `the press fills ${JSON.stringify(added)}; typed: live "${liveA}", settled "${fbA}"; warnings ${JSON.stringify(a.filter(x => /REPORT/.test(x.code)).map(x => x.sev + ' ' + x.msg))}; the day's whole list has ${a.length} entries`, 'RECORDED', [pa])
    await K.itAdd(p, 'week', DI, w.gi)
    const liveB = await K.itSet(p, 'week', DI, w.gi, 1, '25:99 IN TIME')
    const b = await K.warnsFull(p, DI); const fbB = await K.feedback(p, 'week', DI, w.gi)
    const linesB = await K.itLines(p, DI, w.gi)
    R('P2-12.b', 'added a second line and typed the invalid clock "25:99 IN TIME" (still no take-off)', `lines ${JSON.stringify(linesB)}; live "${liveB}", settled "${fbB}"; warnings ${JSON.stringify(b.filter(x => /REPORT/.test(x.code)).map(x => x.sev + ' ' + x.msg))}`, 'RECORDED', [])
    /* now the take-off, the crew and a valid in-time */
    await K.ff(p, DI, w.gi, 0, 'cs', 'MM'); await K.ff(p, DI, w.gi, 0, 'msn', 'BFM'); await K.ff(p, DI, w.gi, 0, 'to', '12:00'); await K.ff(p, DI, w.gi, 0, 'ld', '13:00')
    const t1 = (await K.seat(p, DI, w.gi, 0, 0, 'p', 'taipan')).took, t2 = (await K.seat(p, DI, w.gi, 0, 0, 'w', 'mamba')).took
    const c1 = await K.warnsFull(p, DI); const fbC = await K.feedback(p, 'week', DI, w.gi)
    const pc = await K.picEl(p, dayBox(DI, w.gi), 'p12-c-takeoff', { pad: 50 })
    await K.itAdd(p, 'week', DI, w.gi)
    await K.itSet(p, 'week', DI, w.gi, 2, '08:30 IN TIME')
    const d1 = await K.warnsFull(p, DI); const fbD = await K.feedback(p, 'week', DI, w.gi)
    const linesD = await K.itLines(p, DI, w.gi)
    const hr1 = await K.hours(p, crewCs, 'p12-ins-valid')
    const pd = await K.picEl(p, dayBox(DI, w.gi), 'p12-d-valid', { pad: 50 })
    R('P2-12.c', 'gave the formation MM 12:00→13:00, crew Cobra+Sidewinder (seated ' + t1 + ',' + t2 + '), then a third line "08:30 IN TIME"',
      `with take-off, before the valid in-time: feedback "${fbC}", warnings ${JSON.stringify(c1.filter(x => /REPORT/.test(x.code)).map(x => x.msg))}; lines now ${JSON.stringify(linesD)}, feedback "${fbD}", warnings ${JSON.stringify(d1.filter(x => /REPORT/.test(x.code)).map(x => x.msg))}; Work hours base ${JSON.stringify(hr0.h)} → with the valid in-time ${JSON.stringify(hr1.h)}`, 'RECORDED', [pc, pd, hr0.shot, hr1.shot])
    await S_cx(p, w)
    const hr2 = await K.hours(p, crewCs, 'p12-ins-cx')
    const e1 = await K.warnsFull(p, DI)
    const pe = await K.picEl(p, '#eWeek .day[data-day="' + DI + '"]', 'p12-e-cx', { pad: 6, maxH: 600 })
    const m = h => Object.values(h).map(mins)
    R('P2-12.d', 'cancelled the formation (CX with a reason)', `Work hours ${JSON.stringify(hr1.h)} → ${JSON.stringify(hr2.h)} (base ${JSON.stringify(hr0.h)}); report warnings now ${JSON.stringify(e1.filter(x => /REPORT/.test(x.code)).map(x => x.msg))}`,
      JSON.stringify(hr2.h) === JSON.stringify(hr0.h) && m(hr1.h).every((v, i) => v > m(hr0.h)[i]) ? 'PASS' : 'FAIL', [pe, hr2.shot])
  } catch (e) { R('P2-12.X', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'p12-X')]) }
  R('P2-12.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}
async function S_cx(p, w) { await K.cx(p, DI, `${DI}.${w.gi}.0.0`, 'walk P2-12') }

async function p213() {
  const { browser, p, errors } = await K.fresh()
  try {
    const crewIds = ['taipan', 'mamba', 'boosh', 'beams']
    const crewCs = await K.cs(p, crewIds)
    const w = await mk(p, 'VL', '12:00', '13:00', ['taipan', 'mamba'])
    await K.addLine(p, DI, w.gi)
    await K.ff(p, DI, w.gi, 1, 'cs', 'VL2'); await K.ff(p, DI, w.gi, 1, 'msn', 'BFM'); await K.ff(p, DI, w.gi, 1, 'to', '12:00'); await K.ff(p, DI, w.gi, 1, 'ld', '13:00')
    const t3 = (await K.seat(p, DI, w.gi, 1, 0, 'p', 'boosh')).took, t4 = (await K.seat(p, DI, w.gi, 1, 0, 'w', 'beams')).took
    const H0 = await K.hours(p, crewCs, 'p13-0-base')
    await K.itAdd(p, 'week', DI, w.gi)
    await K.itSet(p, 'week', DI, w.gi, 0, '08:00 VL IN TIME')
    const H1 = await K.hours(p, crewCs, 'p13-1-VLline')
    const f1 = await K.feedback(p, 'week', DI, w.gi)
    const pa = await K.picEl(p, dayBox(DI, w.gi), 'p13-a-VL-line', { pad: 60 })
    const d = (a, b) => crewCs.map(c => `${c} ${a[c] || '-'}→${b[c] || '-'}`).join(', ')
    const vlOnly = H1.h[crewCs[0]] !== H0.h[crewCs[0]] && H1.h[crewCs[2]] === H0.h[crewCs[2]] && H1.h[crewCs[3]] === H0.h[crewCs[3]]
    R('P2-13.a', `wave VL + VL2 (both 12:00→13:00; VL crew ${crewCs[0]}+${crewCs[1]}, VL2 crew ${crewCs[2]}+${crewCs[3]}; seated ${t3},${t4}); one line "08:00 VL IN TIME"`,
      `Work hours: ${d(H0.h, H1.h)}; feedback "${f1}"`, vlOnly ? 'PASS' : 'FAIL', [pa, H0.shot, H1.shot])
    /* an unnamed line containing only a crew member's name */
    await K.itAdd(p, 'week', DI, w.gi)
    const nm = crewCs[0]
    const liveN = await K.itSet(p, 'week', DI, w.gi, 1, nm)
    const H2 = await K.hours(p, crewCs, 'p13-2-name-only')
    const f2 = await K.feedback(p, 'week', DI, w.gi); const w2 = await K.warnsFull(p, DI)
    const pb = await K.picEl(p, dayBox(DI, w.gi), 'p13-b-name-only', { pad: 60 })
    R('P2-13.b', `second line: only a crew member's callsign "${nm}" (no clock, no formation name)`,
      `Work hours: ${d(H1.h, H2.h)}; feedback "${f2}"; warnings ${JSON.stringify(w2.filter(x => /REPORT/.test(x.code)).map(x => x.sev + ' ' + x.msg))}`,
      JSON.stringify(H2.h) === JSON.stringify(H1.h) ? 'PASS' : 'FAIL', [pb, H2.shot])
    /* the same name with a clock: whole wave or just the named man? */
    await K.itSet(p, 'week', DI, w.gi, 1, `07:00 ${nm} IN TIME`)
    const H3 = await K.hours(p, crewCs, 'p13-3-name-with-clock')
    const f3 = await K.feedback(p, 'week', DI, w.gi)
    const pc = await K.picEl(p, dayBox(DI, w.gi), 'p13-c-name-clock', { pad: 60 })
    const only = crewCs.map(c => H3.h[c] !== H2.h[c])
    R('P2-13.c', `second line retyped "07:00 ${nm} IN TIME" (a clock and a man's name, no formation callsign)`, `Work hours: ${d(H2.h, H3.h)}; who changed: ${crewCs.map((c, i) => c + ':' + only[i]).join(' ')}; feedback "${f3}"`, 'RECORDED', [pc, H3.shot])
    /* clock spellings */
    const sp = []
    for (const t of ['8:00 VL IN TIME', '0800 VL IN TIME', '800H VL RALLY', '08:00L VL IN TIME', '8h00 VL IN TIME', '8.00 VL IN TIME', '2400 VL IN TIME']) {
      await K.itSet(p, 'week', DI, w.gi, 0, t)
      const l = await K.itLines(p, DI, w.gi); const f = await K.feedback(p, 'week', DI, w.gi)
      sp.push(`"${t}" → stored "${l[0]}" / feedback "${f || ''}"`)
    }
    const pd = await K.picEl(p, dayBox(DI, w.gi), 'p13-d-spellings', { pad: 60 })
    R('P2-13.d', 'line 1 retyped through accepted and unaccepted clock spellings (week)', sp.join(' ;; '),
      sp.slice(0, 4).every(s => /stored "08:00/.test(s) || /stored "0?8:00/.test(s)) ? 'PASS' : 'FAIL', [pd])
  } catch (e) { R('P2-13.X', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'p13-X')]) }
  R('P2-13.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

if (which === 'all' || which === 'p10') await p210()
if (which === 'all' || which === 'p11') await p211()
if (which === 'all' || which === 'p12') await p212()
if (which === 'all' || which === 'p13') await p213()
B.savePart('s2' + which)
