/* walker B — S33, S25, S26, S27: the spellings and the first usable clock. One fresh world per case. */
import * as K from './ows-B-lib.mjs'
const { judge, row, savePart } = K
const errs = []
const only = process.env.ONLY ? process.env.ONLY.split(',') : null
const want = id => !only || only.includes(id)
const FO = (o, base, start) => [
  ['Leave War cell FO', o.letters === 'FO', o.cell.text], ['worked ' + start + '–15:00', new RegExp(start.replace(':', ':') + '.15:00').test(o.row || ''), (o.row || '').slice(0, 150)],
  ['balance +1', !!base.bal && +o.bal === +base.bal + 1, { base: base.bal, now: o.bal }]]
const HO = (o, base, start = '09:00') => [
  ['Leave War cell HO', o.letters === 'HO', o.cell.text], ['worked ' + start + '–15:00', new RegExp(start + '.15:00').test(o.row || ''), (o.row || '').slice(0, 150)],
  ['balance +0.5', !!base.bal && +o.bal === +base.bal + 0.5, { base: base.bal, now: o.bal }]]
async function one(id, did, spec, checks) {
  try {
    const r = await K.runCase(id.replace(/\W+/g, '_'), spec)
    errs.push(...r.errors)
    const c = [['lines on the wave', true, r.add.lines], ['published ORIG', r.pubr && r.pubr.head && r.pubr.head.tag === 'ORIG', r.pubr && r.pubr.head && r.pubr.head.tag], ...checks(r)]
    judge(id, did, c, [...r.o.pics, ...r.d.pics, r.pre])
    if (r.fb && r.fb.length || r.warns.length) row(id + '-words', 'the box and the day say, about the reporting lines', JSON.stringify({ box: r.fb, day: r.warns }), 'RECORDED', [r.pre])
    return r
  } catch (e) { row(id, did, 'SCRIPT ERROR ' + String(e.stack || e).slice(0, 400), 'NOT WALKED') }
}

/* S33 — exact 6h00 and 6h01 */
if (want('S33')) {
  await one('S33.a', 'Saturday flight 12:00–13:00, no In-time/Rally, published (nominal 09:00 — exactly 6h00)', { lines: [] }, r => HO(r.o, r.base))
  await one('S33.b', 'same flight, one In-time/Rally line typed IN TIME 08:59 through "+ In-time / Rally", published (6h01)', { lines: ['IN TIME 08:59'] }, r => FO(r.o, r.base, '08:59'))
}
/* S25 — accepted clock spellings */
if (want('S25')) {
  for (const t of ['IN TIME 0830', 'IN TIME 08:30', 'IN TIME 0830H', 'IN TIME 0830L', 'IN TIME 830']) {
    await one('S25 ' + t, `Saturday flight 12:00–13:00; the line typed "${t}"; published`, { lines: [t] }, r => [['the line as the box kept it: ' + JSON.stringify(r.add.lines), true, r.add.lines], ...FO(r.o, r.base, '08:30')])
  }
  for (const t of ['08:30', '830']) {
    const r = await K.runCase('S25_bare_' + t.replace(':', ''), { lines: [t] })
    errs.push(...r.errors)
    row('S25 bare ' + t, `Saturday flight 12:00–13:00; the line typed literally "${t}" (no IN TIME words); published`, `kept as ${JSON.stringify(r.add.lines)} · cell ${r.o.letters} · worked ${r.o.worked} · balance ${r.o.bal} (was ${r.base.bal}) · box says ${JSON.stringify(r.fb)} · day says ${JSON.stringify(r.warns)}`, 'RECORDED', [...r.o.pics, r.pre])
  }
}
/* S26 — unreadable clocks, words only */
if (want('S26')) {
  for (const t of ['IN TIME 8h30', 'IN TIME 25:90', 'IN TIME FL240', 'THE USUAL BRIEF IN THE USUAL PLACE', 'RALLY AFTER IN TIME']) {
    await one('S26 ' + t, `Saturday flight 12:00–13:00; the line typed "${t}"; published`, { lines: [t] }, r => [['the line as kept: ' + JSON.stringify(r.add.lines), true, r.add.lines], ...HO(r.o, r.base)])
  }
}
/* S27 — first usable clock; free text */
if (want('S27')) {
  await one('S27.a', 'Saturday flight 12:00–13:00; one line typed "0830 IN TIME — brief 1000"; published', { lines: ['0830 IN TIME — brief 1000'] }, r => FO(r.o, r.base, '08:30'))
  await one('S27.b', 'same; one line typed "FL240 0830 IN TIME — brief 1000"; published', { lines: ['FL240 0830 IN TIME — brief 1000'] }, r => FO(r.o, r.base, '08:30'))
  /* a person's name in the line, a second man (Echo, a WSO) in the rear seat of the same line */
  try {
    const wd = await K.world(); const { p, browser } = wd
    const b1 = await K.baseline(p, 'bane'), b2 = await K.baseline(p, 'freak')
    await K.L.go(p, 'editsched'); await K.sleep(300)
    const w = await K.flight(p, 5, { cs: 'VIPER', to: '12:00', ld: '13:00', p1: 'bane', w1: 'freak' })
    const add = await K.addLines(p, 5, w.wi, ['IN TIME 0830 — Ranger to brief'])
    const pre = await K.pic(p, 'S27c-board')
    const pub = await K.publishNew(p, 5); await K.closeBoard(p)
    const o1 = await K.oilOf(p, 'bane', K.SAT, 'S27c-ranger'), o2 = await K.oilOf(p, 'freak', K.SAT, 'S27c-echo')
    errs.push(...wd.errors)
    judge('S27.c', 'Saturday flight 12:00–13:00 with Ranger front and Echo (a WSO) rear; one line typed "IN TIME 0830 — Ranger to brief" (a callsign, no formation named); published', [
      ['both seated', w.got.flat().join() === 'bane,freak' || JSON.stringify(w.got).includes('freak'), w.got], ['line kept', add.lines.length === 1, add.lines],
      ['Ranger: FO from 08:30', o1.letters === 'FO' && /08:30.15:00/.test(o1.row), { cell: o1.cell.text, row: o1.row.slice(0, 120) }],
      ['Echo (not named): FO from 08:30 too', o2.letters === 'FO' && /08:30.15:00/.test(o2.row), { cell: o2.cell.text, row: o2.row.slice(0, 120) }],
      ['balances +1 each', +o1.bal === +b1.bal + 1 && +o2.bal === +b2.bal + 1, { r: [b1.bal, o1.bal], e: [b2.bal, o2.bal] }]], [pre, ...o1.pics, ...o2.pics])
    await browser.close()
  } catch (e) { row('S27.c', 'name mention', 'SCRIPT ERROR ' + String(e.stack || e).slice(0, 400), 'NOT WALKED') }
}
console.log('ERRORS', JSON.stringify(errs))
savePart('ows-B-sA' + (only ? '-' + only.join('') : ''), { errors: errs })
