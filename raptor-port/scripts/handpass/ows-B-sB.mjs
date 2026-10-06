/* walker B — S28 (two formations), S29 (duplicate in-times, both orders), S30 (evening before), S32 (landing after midnight), S34 (zero-length sortie) */
import * as K from './ows-B-lib.mjs'
const { judge, row, savePart, sleep, pic } = K
const errs = []
const only = process.env.ONLY ? process.env.ONLY.split(',') : null
const want = id => !only || only.includes(id)
const allWarns = (p, di) => p.evaluate(i => ((window.WARN.byDay[i] || {}).warns || []).map(w => `${w.sev}/${w.code}${w.off ? '/hidden' : ''}: ${String(w.msg).slice(0, 130)}`), di)
const wrap = async (id, fn) => { try { await fn() } catch (e) { row(id, 'script', 'SCRIPT ERROR ' + String(e.stack || e).slice(0, 500), 'NOT WALKED') } }

/* ---------------- S28 ---------------- */
if (want('S28')) await wrap('S28', async () => {
  const wd = await K.world(); const { p, browser } = wd
  const bA = await K.baseline(p, 'bane'), bB = await K.baseline(p, 'stiff')
  await K.L.go(p, 'editsched'); await sleep(300)
  const w = await K.flight(p, 5, { cs: 'VIPER', to: '12:00', ld: '13:00', p1: 'bane' })
  await K.addLine(p, 5, w.wi)
  await K.lineBoxes(p, 5, w.wi, 1, { cs: 'COBRA', to: '12:00', ld: '13:00', p1: 'stiff' })
  const crew = await p.evaluate(([i, g]) => JSON.stringify(window.DAYS[i].waves[g].lines || window.DAYS[i].waves[g].forms || '?').slice(0, 300), [5, w.wi])
  const add = await K.addLines(p, 5, w.wi, ['IN TIME 08:30', 'VIPER IN TIME 10:00'])
  const pre = await pic(p, 'S28-board')
  const fb = await K.feedbackText(p, 5, w.wi)
  const pub = await K.publishNew(p, 5); await K.closeBoard(p)
  const a1 = await K.oilOf(p, 'bane', K.SAT, 'S28a-A'), b1 = await K.oilOf(p, 'stiff', K.SAT, 'S28a-B')
  judge('S28.1', 'Saturday: wave with two lines — VIPER (Ranger) and COBRA (Saber), both 12:00–13:00; typed IN TIME 08:30 (wave-wide) and VIPER IN TIME 10:00; published', [
    ['both lines drawn', true, crew], ['the two in-time lines', add.lines.length === 2, { trace: add.trace, lines: add.lines }], ['published ORIG', pub.head && pub.head.tag === 'ORIG', pub.head && pub.head.tag],
    ['A (Ranger): HO, 10:00–15:00', a1.letters === 'HO' && /10:00.15:00/.test(a1.row), { cell: a1.cell.text, row: a1.row.slice(0, 120), bal: [bA.bal, a1.bal] }],
    ['B (Saber): FO, 08:30–15:00', b1.letters === 'FO' && /08:30.15:00/.test(b1.row), { cell: b1.cell.text, row: b1.row.slice(0, 120), bal: [bB.bal, b1.bal] }]], [pre, ...a1.pics, ...b1.pics])
  row('S28.1-words', 'the box and the day say', JSON.stringify({ box: fb, day: await K.warnWords(p, 5) }), 'RECORDED', [pre])
  /* add the wave-wide Rally 09:00 */
  await K.toBoard(p, 5)
  const add2 = await K.addLines(p, 5, w.wi, [])
  await K.addItBtn(p, 5, w.wi)
  const ln = await K.intimes(p, 5, w.wi)
  await K.setItLine(p, 5, w.wi, ln.length - 1, 'RALLY 09:00')
  const lines2 = await K.intimes(p, 5, w.wi)
  const pre2 = await pic(p, 'S28b-board')
  await K.closeBoard(p)
  const d2 = await K.dayState(p, 5, 'S28b-day')
  const a2 = await K.oilOf(p, 'bane', K.SAT, 'S28b-A-held'), b2 = await K.oilOf(p, 'stiff', K.SAT, 'S28b-B-held')
  const am = await K.publishAm(p, 5); await K.closeBoard(p)
  const a3 = await K.oilOf(p, 'bane', K.SAT, 'S28c-A'), b3 = await K.oilOf(p, 'stiff', K.SAT, 'S28c-B')
  const d3 = await K.dayState(p, 5, 'S28c-day', { list: false })
  judge('S28.2', 'then a wave-wide RALLY 09:00 typed through "+ In-time / Rally" (working copy), then Publish AL', [
    ['the third line is there', lines2.length === 3, lines2], ['working copy: 1 pending', d2.pend === '1', d2.head.pending],
    ['paid holds: A HO 10:00', a2.letters === 'HO' && /10:00.15:00/.test(a2.row), a2.row.slice(0, 120)], ['paid holds: B FO 08:30', b2.letters === 'FO' && /08:30.15:00/.test(b2.row), b2.row.slice(0, 120)],
    ['AL1', am.head && /AL\s*1/.test(am.head.tag), am.head && am.head.tag],
    ['A now HO 09:00–15:00', a3.letters === 'HO' && /09:00.15:00/.test(a3.row), { cell: a3.cell.text, row: a3.row.slice(0, 120), bal: a3.bal }],
    ['B stays FO 08:30–15:00', b3.letters === 'FO' && /08:30.15:00/.test(b3.row), { cell: b3.cell.text, row: b3.row.slice(0, 120), bal: b3.bal }],
    ['nothing pending', d3.pend === '0', d3.head.pending]], [pre2, ...d2.pics, ...a2.pics, ...a3.pics, ...b3.pics])
  errs.push(...wd.errors); await browser.close()
})

/* ---------------- S29 ---------------- */
if (want('S29')) for (const order of [['IN TIME 23:00', 'IN TIME 00:30'], ['IN TIME 00:30', 'IN TIME 23:00']]) await wrap('S29', async () => {
  const tag = 'S29-' + (order[0].includes('23') ? 'A' : 'B')
  const r = await K.runCase(tag, { to: '01:00', ld: '02:00', lines: order })
  errs.push(...r.errors)
  const fri = await (async () => { })()
  judge(tag, `Saturday flight 01:00–02:00; two In-time lines typed in the order ${JSON.stringify(order)}; published`, [
    ['two lines kept in that order', r.add.lines.length === 2, { trace: r.add.trace, lines: r.add.lines }],
    ['HO', r.o.letters === 'HO', r.o.cell.text], ['worked 00:00–04:00', /00:00.04:00/.test(r.o.row), r.o.row.slice(0, 150)],
    ['balance +0.5', +r.o.bal === +r.base.bal + 0.5, { base: r.base.bal, now: r.o.bal }]], [...r.o.pics, ...r.d.pics, r.pre])
  row(tag + '-words', 'box / day words', JSON.stringify({ box: r.fb, day: r.warns }), 'RECORDED', [r.pre])
})

/* ---------------- S30 ---------------- */
if (want('S30')) await wrap('S30', async () => {
  const wd = await K.world(); const { p, browser } = wd
  const base = await K.baseline(p, 'bane')
  await K.L.go(p, 'editsched'); await sleep(300)
  const w = await K.flight(p, 5, { cs: 'VIPER', to: '01:00', ld: '02:00', p1: 'bane' })
  const add = await K.addLines(p, 5, w.wi, ['IN TIME 22:00'])
  const pub = await K.publishNew(p, 5); await K.closeBoard(p)
  const o1 = await K.oilOf(p, 'bane', K.SAT, 'S30a-sat')
  const fri = await K.lwCellOf(p, 'bane', '2026-07-17')
  judge('S30.1', 'Saturday flight 01:00–02:00, line IN TIME 22:00; published', [
    ['published ORIG', pub.head && pub.head.tag === 'ORIG', pub.head && pub.head.tag], ['line kept', add.lines.length === 1, add.lines],
    ['Saturday HO', o1.letters === 'HO', o1.cell.text], ['worked 00:00–04:00', /00:00.04:00/.test(o1.row), o1.row.slice(0, 150)], ['balance +0.5', +o1.bal === +base.bal + 0.5, { base: base.bal, now: o1.bal }],
    ['Friday 17 Jul: no credit from this flight', !/HO|FO/.test((fri && fri.text) || ''), fri]], o1.pics)
  await K.toBoard(p, 5)
  await K.setItLine(p, 5, w.wi, 0, 'IN TIME 21:59')
  const lines = await K.intimes(p, 5, w.wi)
  await K.closeBoard(p)
  const d2 = await K.dayState(p, 5, 'S30b-day')
  const o2 = await K.oilOf(p, 'bane', K.SAT, 'S30b-held')
  const am = await K.publishAm(p, 5); await K.closeBoard(p)
  const o3 = await K.oilOf(p, 'bane', K.SAT, 'S30c-am')
  const fri3 = await K.lwCellOf(p, 'bane', '2026-07-17')
  judge('S30.2', 'the line changed to IN TIME 21:59, then Publish AL', [
    ['line reads 21:59', /21:59/.test(lines[0] || ''), lines], ['1 pending', d2.pend === '1', d2.head.pending], ['paid HO holds, worked 00:00–04:00', o2.letters === 'HO' && /00:00.04:00/.test(o2.row), { cell: o2.cell.text, row: o2.row.slice(0, 120) }],
    ['AL1', am.head && /AL\s*1/.test(am.head.tag), am.head && am.head.tag],
    ['now FO, worked 00:00–04:00', o3.letters === 'FO' && /00:00.04:00/.test(o3.row), { cell: o3.cell.text, row: o3.row.slice(0, 120) }], ['balance +1', +o3.bal === +base.bal + 1, { base: base.bal, now: o3.bal }],
    ['Friday still no credit', !/HO|FO/.test((fri3 && fri3.text) || ''), fri3]], [...d2.pics, ...o2.pics, ...o3.pics])
  errs.push(...wd.errors); await browser.close()
})

/* ---------------- S32 ---------------- */
if (want('S32')) await wrap('S32', async () => {
  const wd = await K.world(); const { p, browser } = wd
  const base = await K.baseline(p, 'bane')
  await K.L.go(p, 'editsched'); await sleep(300)
  const w = await K.flight(p, 5, { cs: 'VIPER', to: '22:00', ld: '01:00', p1: 'bane' })
  const add = await K.addLines(p, 5, w.wi, ['IN TIME 20:00'])
  const pub = await K.publishNew(p, 5); await K.closeBoard(p)
  const o1 = await K.oilOf(p, 'bane', K.SAT, 'S32a-sat')
  const sun1 = await K.lwCellOf(p, 'bane', K.SUN)
  const d1 = await K.dayState(p, 5, 'S32a-day', { list: false })
  judge('S32.1', 'Saturday flight 22:00–01:00, line IN TIME 20:00; published', [
    ['published ORIG', pub.head && pub.head.tag === 'ORIG', pub.head && pub.head.tag], ['line kept', add.lines.length === 1, add.lines],
    ['Saturday FO', o1.letters === 'FO', o1.cell.text], ['worked 20:00–23:59', /20:00.23:59/.test(o1.row), o1.row.slice(0, 150)], ['balance +1', +o1.bal === +base.bal + 1, { base: base.bal, now: o1.bal }],
    ['Sunday: nothing from it', !/HO|FO/.test((sun1 && sun1.text) || ''), sun1]], [...o1.pics, ...d1.pics])
  const set = await K.logicSet(p, 'debrief', '1h30')
  const lg = await K.logicGet(p)
  const d2 = await K.dayState(p, 5, 'S32b-day')
  const o2 = await K.oilOf(p, 'bane', K.SAT, 'S32b-sat')
  const sun2 = await K.lwCellOf(p, 'bane', K.SUN)
  judge('S32.2', 'Logic → "Flight debrief after land" 2h → 1h30', [
    ['value changed (minutes)', lg.debrief === 90, { set, debrief: lg.debrief }],
    ['no OIL pending (0 pending)', d2.pend === '0', d2.head.pending], ['sign-offs still stand', K.signsStand(d2.head), d2.head.signs],
    ['paid holds: FO, 20:00–23:59', o2.letters === 'FO' && /20:00.23:59/.test(o2.row), { cell: o2.cell.text, row: o2.row.slice(0, 120) }], ['balance holds', o2.bal === o1.bal, { was: o1.bal, now: o2.bal }],
    ['Sunday: still nothing', !/HO|FO/.test((sun2 && sun2.text) || ''), sun2]], [...d2.pics, ...o2.pics])
  row('S32.2-list', 'the day head after the Logic change', JSON.stringify({ head: d2.head }), 'RECORDED', d2.pics)
  errs.push(...wd.errors); await browser.close()
})

/* ---------------- S34 ---------------- */
if (want('S34')) await wrap('S34', async () => {
  const wd = await K.world(); const { p, browser } = wd
  const base = await K.baseline(p, 'bane')
  await K.L.go(p, 'editsched'); await sleep(300)
  const w = await K.flight(p, 5, { cs: 'VIPER', to: '12:00', ld: '12:00', p1: 'bane' })
  const pre = await pic(p, 'S34-board')
  const warns0 = await allWarns(p, 5)
  const pub = await K.publishNew(p, 5); await K.closeBoard(p)
  const o1 = await K.oilOf(p, 'bane', K.SAT, 'S34a')
  judge('S34.1', 'Saturday flight 12:00–12:00 (take-off = landing), no In-time/Rally; published', [
    ['published ORIG', pub.head && pub.head.tag === 'ORIG', pub.head && pub.head.tag],
    ['HO', o1.letters === 'HO', o1.cell.text], ['worked 09:00–14:00', /09:00.14:00/.test(o1.row), o1.row.slice(0, 150)], ['balance +0.5', +o1.bal === +base.bal + 0.5, { base: base.bal, now: o1.bal }]], [pre, ...o1.pics])
  row('S34.1-words', 'the day\'s warning list on the unpublished fixture (board), all words', JSON.stringify(warns0), 'RECORDED', [pre])
  await K.toBoard(p, 5)
  const add = await K.addLines(p, 5, w.wi, ['IN TIME 12:00'])
  await K.closeBoard(p)
  const d2 = await K.dayState(p, 5, 'S34b-day')
  const am = await K.publishAm(p, 5); await K.closeBoard(p)
  const o2 = await K.oilOf(p, 'bane', K.SAT, 'S34b')
  judge('S34.2', 'IN TIME 12:00 typed (take-off), then Publish AL', [
    ['line kept', add.lines.length === 1, add.lines], ['1 pending before the amendment', d2.pend === '1', d2.head.pending], ['AL1', am.head && /AL\s*1/.test(am.head.tag), am.head && am.head.tag],
    ['HO', o2.letters === 'HO', o2.cell.text], ['worked 12:00–14:00', /12:00.14:00/.test(o2.row), o2.row.slice(0, 150)], ['balance +0.5', +o2.bal === +base.bal + 0.5, { base: base.bal, now: o2.bal }]], [...d2.pics, ...o2.pics])
  const set = await K.logicSet(p, 'debrief', '0')
  const lg = await K.logicGet(p)
  const d3 = await K.dayState(p, 5, 'S34c-day')
  const o3held = await K.oilOf(p, 'bane', K.SAT, 'S34c-held')
  const am3 = await K.publishAm(p, 5); await K.closeBoard(p)
  const o3 = await K.oilOf(p, 'bane', K.SAT, 'S34c')
  const warns3 = await allWarns(p, 5)
  judge('S34.3', 'Logic → "Flight debrief after land" set to 0; then Publish AL', [
    ['debrief now 0', lg.debrief === 0, { set, debrief: lg.debrief }], ['paid holds HO 12:00–14:00', o3held.letters === 'HO' && /12:00.14:00/.test(o3held.row), { cell: o3held.cell.text, row: o3held.row.slice(0, 120) }],
    ['1 pending (it would now earn nothing)', d3.pend === '1', d3.head.pending],
    ['AL2', am3.head && /AL\s*2/.test(am3.head.tag), am3.head && am3.head.tag],
    ['no credit: cell empty', !/HO|FO/.test(o3.cell.text || ''), o3.cell], ['balance back to baseline', +o3.bal === +base.bal, { base: base.bal, now: o3.bal, row: o3.row.slice(0, 120) }]], [...d3.pics, ...o3held.pics, ...o3.pics])
  row('S34.3-words', 'To go out list on the Logic change; the day\'s warning words after', JSON.stringify({ list: d3.list, warns: warns3 }), 'RECORDED', d3.pics)
  errs.push(...wd.errors); await browser.close()
})
console.log('ERRORS', JSON.stringify(errs))
savePart('ows-B-sB' + (only ? '-' + only.join('') : ''), { errors: errs })
