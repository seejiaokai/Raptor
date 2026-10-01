/* Scenario 14 — Undo/Redo follows the publication boundary, including Undo of AL1. */
import * as S from './ins-s-lib2.mjs'
const { B, L, W } = S
const { judge, row, pic, savePart, TUE } = B
B.prefix('s14-')
const { browser, p, errors } = await B.world()
const doorTxt = d => d.present === false ? 'absent' : (d.pressed ? `pressed ("${d.title}"; toasts ${JSON.stringify(d.toasts || [])})` : `not pressed (${d.disabled ? 'disabled' : '?'})`)
try {
  await B.toEdit(p)
  await S.publish(p, TUE, 'orig')
  await W.toastSpy(p)
  const r0 = await S.look(p, 's14-a-original', { foot: true })
  /* one waiting change */
  await S.takeOff(p, TUE, '1.1.1.0.p'); await B.toEdit(p)
  const d1 = await S.dayState(p, TUE, { view: false })
  const r1 = await S.look(p, 's14-b-change-waiting')
  judge('14.a', 'Tuesday published; Rebel taken off on the board (one waiting change); Insights', [
    ['Tuesday pending', /pending/.test(d1.pending), d1.pending],
    ['Insights identical to the Original', S.same(r1, r0), S.same(r1, r0) ? '' : S.delta(r0, r1).slice(0, 300)],
  ], [r0.shot, r0.shot2, r1.shot].filter(Boolean))

  /* top-bar Undo */
  const u1 = await W.door(p, 'top', 'undo'); await B.toEdit(p)
  const d2 = await S.dayState(p, TUE, { view: false })
  const r2 = await S.look(p, 's14-c-after-undo')
  judge('14.b', `top-bar Undo (${doorTxt(u1)})`, [
    ['pending cleared', !/pending/.test(d2.pending), d2.pending],
    ['Insights identical to the Original', S.same(r2, r0), S.same(r2, r0) ? '' : S.delta(r0, r2).slice(0, 300)],
  ], [r2.shot])
  /* Redo */
  const rd = await W.door(p, 'top', 'redo'); await B.toEdit(p)
  const d3 = await S.dayState(p, TUE, { view: false })
  const r3 = await S.look(p, 's14-d-after-redo')
  judge('14.c', `top-bar Redo (${doorTxt(rd)})`, [
    ['pending back', /pending/.test(d3.pending), d3.pending],
    ['Insights identical to the Original', S.same(r3, r0), S.same(r3, r0) ? '' : S.delta(r0, r3).slice(0, 300)],
  ], [r3.shot])

  /* the board's own Undo / Redo */
  await S.board(p, TUE)
  const bu = await W.door(p, 'board', 'undo')
  const dBU = await W.head(p, TUE)
  await B.toEdit(p)
  const r4 = await S.look(p, 's14-e-board-undo')
  await S.board(p, TUE)
  const br = await W.door(p, 'board', 'redo')
  const dBR = await W.head(p, TUE)
  await B.toEdit(p)
  const r5 = await S.look(p, 's14-f-board-redo')
  judge('14.d', `Scheduler Board's own Undo (${doorTxt(bu)}) then Redo (${doorTxt(br)})`, [
    ['board Undo clears pending the same as the top bar', !/pending/.test(dBU.pending), dBU.pending],
    ['board Redo brings it back', /pending/.test(dBR.pending), dBR.pending],
    ['Insights identical to the Original after both', S.same(r4, r0) && S.same(r5, r0), S.same(r4, r0) && S.same(r5, r0) ? '' : S.delta(r0, r5).slice(0, 300)],
  ], [r4.shot, r5.shot])

  /* publish AL1, then Undo it */
  await S.publish(p, TUE, 'al')
  const d6 = await S.dayState(p, TUE, { view: false })
  const r6 = await S.look(p, 's14-g-al1', { foot: true })
  judge('14.e', 'sign the four and Publish AL1', [
    ['Tuesday is AL1', /AL1/.test(d6.tag), `${d6.tag} / ${d6.pending}`],
    ['Insights moved (Aircrew flying 38 → 37)', S.tile(r0, 2) === 38 && S.tile(r6, 2) === 37, `${S.tile(r0, 2)} → ${S.tile(r6, 2)}`],
  ], [r6.shot, r6.shot2])
  const ua = await W.door(p, 'top', 'undo'); await B.toEdit(p)
  const d7 = await S.dayState(p, TUE, { view: true })
  const r7 = await S.look(p, 's14-h-undo-of-al1', { foot: true })
  judge('14.f', `top-bar Undo right after Publish AL1 (${doorTxt(ua)})`, [
    ['AL1 is retracted: Tuesday reads ORIG again', /ORIG/.test(d7.tag) && !/AL1/.test(d7.tag), `${d7.tag}`],
    ['the change is open again as pending', /pending/.test(d7.pending), d7.pending],
    ['Insights back to the Original (identical to 14.a before)', S.same(r7, r0), S.same(r7, r0) ? '' : S.delta(r0, r7).slice(0, 500)],
  ], [r7.shot, r7.shot2])
  const rr = await W.door(p, 'top', 'redo'); await B.toEdit(p)
  const d8 = await S.dayState(p, TUE, { view: false })
  const r8 = await S.look(p, 's14-i-redo-of-al1')
  row('14.g', `top-bar Redo after that (${doorTxt(rr)})`, `Tuesday ${d8.tag} / ${d8.pending} · Insights ${S.same(r8, r6) ? 'identical to AL1 (14.e)' : S.same(r8, r0) ? 'identical to the Original' : 'DIFFERS: ' + S.delta(r6, r8).slice(0, 300)}`, 'RECORDED', [r8.shot])
} catch (e) { row('14.X', 'the script stopped', String(e && e.stack || e).slice(0, 1500), 'FAIL', [await pic(p, 's14-X-error')]) }
row('14.err', "the browser's error list", errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart('s14', { errors })
await browser.close()
