/* walker B, script 1: H-05 (the Add button on a wave that flies just after midnight) and P2-09 (custom default wording). */
import * as K from './stk2-M-blib.mjs'
const { B, L, W, R, pic, picEl, sleep } = K
const which = process.argv[2] || 'all'
const DI = 1   /* Tuesday */

async function h05() {
  const { browser, p, errors } = await K.fresh()
  try {
    const nom = await K.logicRead(p, 'reportLead')
    const crewCs = await K.cs(p, ['taipan', 'mamba'])
    const hr0 = await K.hours(p, crewCs, 'h05-ins-before')
    const { gi, label } = await K.addFlyWave(p, DI)
    await K.ff(p, DI, gi, 0, 'cs', 'NX'); await K.ff(p, DI, gi, 0, 'msn', 'BFM'); await K.ff(p, DI, gi, 0, 'to', '01:30'); await K.ff(p, DI, gi, 0, 'ld', '02:30')
    const s1 = await K.seat(p, DI, gi, 0, 0, 'p', 'taipan'), s2 = await K.seat(p, DI, gi, 0, 0, 'w', 'mamba')
    await B.toEdit(p); await W.showDay(p, DI)
    await K.itAdd(p, 'week', DI, gi)
    const lines = await K.itLines(p, DI, gi)
    const fb = await K.feedback(p, 'week', DI, gi)
    await B.openList(p, '#eWeek', DI)
    const wl = await B.readList(p, '#eWeek', DI)
    const wk = await K.picEl(p, `#eWeek .day[data-day="${DI}"] [data-itline="${DI}|${gi}|0"]`, 'h05-week-line', { pad: 40 })
    await K.boardTo(p, DI)
    const onBoard = await K.linesOnScreen(p, 'board', DI, gi)
    const fbB = await K.feedback(p, 'board', DI, gi)
    const hdr = await p.evaluate(([i, g]) => { const b = document.querySelector(`#schedBoard [data-itadd="${i}|${g}"]`); const h = b && (b.closest('.sb-wh, .sb-wave, .sb-gh, .gh, .sb-panel, .sb-grp') || b.parentElement.parentElement); return h ? h.innerText.replace(/\s+/g, ' ').slice(0, 300) : null }, [DI, gi])
    const bd = await K.picEl(p, `#schedBoard [data-itline="${DI}|${gi}|0"]`, 'h05-board-line', { pad: 60 })
    await B.boardOpenFold(p)
    const bw = await B.readBoard(p)
    const wb = await K.picEl(p, '#schedBoard .sb-warn', 'h05-board-warn')
    const hr = await K.hours(p, crewCs, 'h05-insights', { keep: false })
    const w = await K.warns(p, DI)
    const wantWord = /22:30/.test(lines[0] || '')
    const prevDay = /previous day|prev day/i.test([fb, fbB, JSON.stringify(wl.lines), hdr, bw.lines.map(x => x.text).join(' ')].join(' '))
    R('H-05', `new wave on Tue (${label}) NX 01:30→02:30, crew Cobra+Sidewinder (seated: ${s1.took},${s2.took}); Logic nominal ${nom}; pressed "+ In-time / Rally" on the week`,
      `line "${lines.join(' / ')}"; reporting feedback on week "${fb}" / board "${fbB}"; board shows lines [${onBoard.join(' / ')}]; board wave header "${hdr}"; Edit-week bar "${wl.bar}" lines ${JSON.stringify(wl.lines.map(x => x.text))}; board panel "${bw.head}" ${JSON.stringify(bw.lines.map(x => x.text))}; app warns ${JSON.stringify(w)}; Work hours BEFORE the wave ${JSON.stringify(hr0.h)}, AFTER ${JSON.stringify(hr.h)} (the whole-week figure; the change is the NX day)`,
      wantWord && prevDay ? 'PASS' : 'FAIL', [wk, bd, wb, hr0.shot, hr.shot])
  } catch (e) { R('H-05', 'script', String(e.stack || e).slice(0, 500), 'FAIL', [await pic(p, 'h05-X')]) }
  R('H-05.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

async function p209() {
  const { browser, p, errors } = await K.fresh()
  const out = []
  try {
    const mk = async (cs, to, ld, crew) => {
      const { gi, label } = await K.addFlyWave(p, DI)
      await K.ff(p, DI, gi, 0, 'cs', cs); await K.ff(p, DI, gi, 0, 'msn', 'BFM'); await K.ff(p, DI, gi, 0, 'to', to); await K.ff(p, DI, gi, 0, 'ld', ld)
      if (crew) { await K.seat(p, DI, gi, 0, 0, 'p', crew[0]); await K.seat(p, DI, gi, 0, 0, 'w', crew[1]) }
      return { gi, label }
    }
    /* A: words RALLY, add on the WEEK, edit to 10:00 RALLY (later than the suggested brief 09:40) */
    const l1 = await K.logicSet(p, 'reportText', 'RALLY')
    const wA = await mk('AA', '12:00', '13:00')
    await K.itAdd(p, 'week', DI, wA.gi)
    const a0 = await K.itLines(p, DI, wA.gi); const a0fb = await K.feedback(p, 'week', DI, wA.gi)
    const a0w = await K.warns(p, DI)
    const pa0 = await K.picEl(p, `#eWeek .day[data-day="${DI}"] [data-itline="${DI}|${wA.gi}|0"]`, 'p09-A-week-default', { pad: 50 })
    const liveA = await K.itSet(p, 'week', DI, wA.gi, 0, '10:00 RALLY')
    const a1 = await K.itLines(p, DI, wA.gi); const a1fb = await K.feedback(p, 'week', DI, wA.gi); const a1w = await K.warns(p, DI)
    const pa1 = await K.picEl(p, `#eWeek .day[data-day="${DI}"] [data-itline="${DI}|${wA.gi}|0"]`, 'p09-A-week-later', { pad: 50 })
    R('P2-09.a', `Logic "button's words" ${l1.before} → ${l1.after}; new wave AA 12:00; "+ In-time / Rally" on the WEEK, then retyped "10:00 RALLY"`,
      `first press fills "${a0.join(' / ')}" (feedback "${a0fb}", day warnings ${JSON.stringify(a0w.filter(x => /REPORT/.test(x)))}); after retype "${a1.join(' / ')}": live feedback while typing "${liveA}", settled feedback "${a1fb}", warnings ${JSON.stringify(a1w.filter(x => /REPORT/.test(x)))}`,
      /rally 10:00 .* suggested brief/i.test(a1fb || '') && !/RALLY/.test(l1.before) ? 'PASS' : 'FAIL', [pa0, pa1])
    /* B: the same words on the BOARD (new wave BB) — week and board must agree */
    const wB = await mk('BB2', '12:00', '13:00')
    await K.itAdd(p, 'board', DI, wB.gi)
    const b0 = await K.itLines(p, DI, wB.gi); const b0fb = await K.feedback(p, 'board', DI, wB.gi)
    const pb0 = await K.picEl(p, `#schedBoard [data-itline="${DI}|${wB.gi}|0"]`, 'p09-B-board-default', { pad: 60 })
    R('P2-09.b', 'new wave BB2 12:00; "+ In-time / Rally" on the BOARD with the same words', `fills "${b0.join(' / ')}" (week fill was "${a0.join(' / ')}"); feedback "${b0fb}"`, b0[0] === a0[0] ? 'PASS' : 'FAIL', [pb0])
    /* C: blank words restore the default */
    const l2 = await K.logicBlank(p, 'reportText')
    const l2v = await K.logicRead(p, 'reportText')
    const wC = await mk('CC', '12:00', '13:00')
    await K.itAdd(p, 'week', DI, wC.gi)
    const c0 = await K.itLines(p, DI, wC.gi)
    const liveC = await K.itSet(p, 'week', DI, wC.gi, 0, '10:00 IN TIME + WX/NOTAMS')
    const c1fb = await K.feedback(p, 'week', DI, wC.gi)
    const pc = await K.picEl(p, `#eWeek .day[data-day="${DI}"] [data-itline="${DI}|${wC.gi}|0"]`, 'p09-C-blank-default', { pad: 50 })
    R('P2-09.c', 'Logic words blanked (typed nothing, Enter); new wave CC 12:00; "+ In-time / Rally" on the week; then retyped "10:00 IN TIME + WX/NOTAMS"',
      `Logic box emptied to "${l2.mid}", after Enter reads "${l2.after}" and on re-opening "${l2v}" (was "${l2.before}"); first press fills "${c0.join(' / ')}"; retyped feedback "${c1fb}"`,
      /IN TIME \+ WX\/NOTAMS/.test(l2v) && /IN TIME \+ WX\/NOTAMS/.test(c0[0] || '') && /in-time 10:00/i.test(c1fb || '') ? 'PASS' : 'FAIL', [pc])
    /* D: prose clock in the words */
    const l3 = await K.logicSet(p, 'reportText', 'RALLY — check 13:00')
    const l3v = await K.logicRead(p, 'reportText')
    const wD = await mk('DD', '12:00', '13:00')
    await K.itAdd(p, 'week', DI, wD.gi)
    const d0 = await K.itLines(p, DI, wD.gi); const d0fb = await K.feedback(p, 'week', DI, wD.gi); const d0w = await K.warns(p, DI)
    const pd = await K.picEl(p, `#eWeek .day[data-day="${DI}"] [data-itline="${DI}|${wD.gi}|0"]`, 'p09-D-prose', { pad: 50 })
    await K.boardTo(p, DI)
    const wD2 = await K.itAdd(p, 'board', DI, wD.gi)
    const d1 = await K.itLines(p, DI, wD.gi)
    R('P2-09.d', 'Logic words "RALLY — check 13:00"; new wave DD 12:00; "+ In-time / Rally" on the week, then pressed once more on the board',
      `Logic box reads "${l3v}"; first line "${d0.join(' / ')}", feedback "${d0fb}", warnings ${JSON.stringify(d0w.filter(x => /REPORT/.test(x)))}; after the board press the wave holds ${JSON.stringify(d1)}`,
      /^09:00H?/.test(d0[0] || '') && !(d0fb || '').length ? 'PASS' : 'FAIL', [pd])
  } catch (e) { R('P2-09.X', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'p09-X')]) }
  R('P2-09.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

if (which === 'all' || which === 'h05') await h05()
if (which === 'all' || which === 'p09') await p209()
B.savePart('s1' + which)
