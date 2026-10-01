/* Scenario 12 — change first, then publish: the only copy moves immediately and becomes the Original unchanged. */
import * as S from './ins-s-lib2.mjs'
const { B, L, W } = S
const { judge, row, pic, savePart, TUE } = B
B.prefix('s12-')
const WED = 2
const { browser, p, errors } = await B.world()
const tuePart = r => S.byDay(r, 'Tuesday')
const wedPart = r => S.byDay(r, 'Wednesday')
try {
  await B.toEdit(p)
  await S.publish(p, TUE, 'orig')
  const r0 = await S.look(p, 's12-a-tuesday-published', { foot: true })
  const dW0 = await S.dayState(p, WED, { view: false })
  row('12.a', 'Tuesday published (Original), Wednesday left as a draft', `Wednesday: ${S.dayLine(dW0)} · Insights tile ${r0.tiles[3].n} ${r0.tiles[3].l}, Sorties ${S.tile(r0, 0)}, Formations ${S.tile(r0, 1)}, Aircrew ${S.tile(r0, 2)} · Tuesday "${tuePart(r0)}" · Wednesday "${wedPart(r0)}"`, 'RECORDED', [r0.shot, r0.shot2])

  /* a pending change on Tuesday that must NOT leak into Wednesday's step */
  await S.takeOff(p, TUE, '1.1.1.0.p'); await B.toEdit(p)
  const dT = await S.dayState(p, TUE, { view: false })
  const rT = await S.look(p, 's12-b-tuesday-pending')
  judge('12.b', "a change waiting on Tuesday (Rebel off the board seat); Insights", [
    ['Tuesday pending', /pending/.test(dT.pending), dT.pending],
    ['Insights identical to 12.a', S.same(rT, r0), S.same(rT, r0) ? '' : S.delta(r0, rT).slice(0, 300)],
  ], [rT.shot])

  /* Wednesday: step by step, every step must move the window at once */
  const steps = []
  async function step(id, label, fn, test, mayStay = false) {
    await fn(); await B.toEdit(p)
    const d = await S.dayState(p, WED, { view: false })
    const r = await S.look(p, `s12-${id}`, { foot: id === 'f-hide' })
    steps.push({ id, r, d })
    const prev = steps.length > 1 ? steps[steps.length - 2].r : r0
    const moved = !S.same(r, prev)
    judge(`12.${id.split('-')[0]}`, label, [
      [mayStay ? 'Insights moved at once, or no figure depends on this edit (recorded)' : 'Insights moved at once (working copy is the only copy)', mayStay || moved, moved ? S.delta(prev, r).slice(0, 500) : 'NO CHANGE (time now ' + await p.evaluate(() => window.DAYS[2].waves[0].formations[0].to + '–' + window.DAYS[2].waves[0].formations[0].ld) + ')'],
      ...(test ? test(r, prev, d) : []),
      ['Tuesday row unchanged (its waiting change did not leak and Wednesday did not touch it)', tuePart(r) === tuePart(r0), `${tuePart(r0)} → ${tuePart(r)}`],
      ['Wednesday still a draft (no pending chip, no version tag)', !/pending/.test(d.pending) && !/ORIG|AL\d/.test(d.tag), `tag "${d.tag}" chip "${d.pending}"`],
    ], [r.shot, r.shot2].filter(Boolean))
    return r
  }
  await step('c-seat', "board: Wednesday's Cutter (psy) taken off his seat", () => S.takeOff(p, WED, '2.0.1.0.w'), (r, pr) => [['Aircrew flying 38 → 37 (psy flies only Wednesday)', S.tile(r, 2) === S.tile(pr, 2) - 1, `${S.tile(pr, 2)} → ${S.tile(r, 2)}`]])
  await step('d-cx', 'board: Wednesday formation 2 of wave 2 cancelled (both aircraft CX)', async () => { await S.cx(p, WED, '2.1.1.0', 'walk w'); await S.cx(p, WED, '2.1.1.1', 'walk w') }, (r, pr) => [['Sorties down by 2 and Formations down by 1', S.tile(r, 0) === S.tile(pr, 0) - 2 && S.tile(r, 1) === S.tile(pr, 1) - 1, `${S.tile(pr, 0)}/${S.tile(pr, 1)} → ${S.tile(r, 0)}/${S.tile(r, 1)}`]])
  await step('e-time', "board: Wednesday's first formation take-off 10:35 → 09:00 (alone: no figure of the window depends on it, the wave has a published in-time)", () => S.setTime(p, WED, 'ff:2.0.0.to', '09:00'), null, true)
  await step('e2-time', "board: the same formation's landing 12:00 → 13:30", () => S.setTime(p, WED, 'ff:2.0.0.ld', '13:30'), null)
  const rH = await step('f-hide', 'Edit Schedule: the x on the Wednesday On leave + flying warning', () => B.hide(p, WED, /On leave/i), (r, pr) => [['the Wednesday issue count drops by one', +(/(\d+) issue/.exec(wedPart(r)) || [0, 0])[1] === +(/(\d+) issue/.exec(wedPart(pr)) || [0, 0])[1] - 1, `${wedPart(pr)} → ${wedPart(r)}`]])

  /* sign and publish Wednesday */
  const pub = await S.publish(p, WED, 'orig')
  const dP = await S.dayState(p, WED)
  const rP = await S.look(p, 's12-g-wed-published', { foot: true })
  judge('12.g', `sign the four and Publish day on Wednesday (${JSON.stringify(pub.r)})`, [
    ['Wednesday is ORIG', /ORIG/.test(dP.tag), `${dP.tag} / ${dP.pending}`],
    ['the same figures remain, now backed by Original (Insights identical to before publishing)', S.same(rP, rH), S.same(rP, rH) ? '' : S.delta(rH, rP).slice(0, 700)],
    ['Tuesday still issued and its waiting change still invisible (Tuesday row as at 12.a)', tuePart(rP) === tuePart(r0), `${tuePart(rP)}`],
  ], [rP.shot, rP.shot2])
  const dTue = await S.dayState(p, TUE, { view: false })
  row('12.h', 'Tuesday after Wednesday went out', `Tuesday still: tag "${dTue.tag}", chip "${dTue.pending}"`, /pending/.test(dTue.pending) ? 'PASS' : 'FAIL', [])
} catch (e) { row('12.X', 'the script stopped', String(e && e.stack || e).slice(0, 1500), 'FAIL', [await pic(p, 's12-X-error')]) }
row('12.err', "the browser's error list", errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart('s12', { errors })
await browser.close()
