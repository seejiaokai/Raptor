/* S25 part A — the Inputs page's own list: file (form), edit (✎: shorten, remarks, move), delete (✕), top-bar Undo — while X sits on blank
   seats Tue (flying line + duty row) and Wed (flying line). Every step reads Tue and Wed on Edit Schedule, plus the board's warning panel. */
import * as T from './bta-B-lib.mjs'
import * as Q from './bta-B-lib2.mjs'
const { K, B, C, D, L, W, W2, ID, CSN, sleep, R, pic } = T
const t = T.mk('s25a')
const P = T.PHONE ? 'ph' : 'dk'
const TU = 1, WE = 2
const fl = r => r.away.filter(x => /On leave|Medically|Downchit/i.test(x))
const sum = (rt, rw) => `${Q.shortDay(TU, rt)} || ${Q.shortDay(WE, rw)}`
async function boardLines(p, di, tag) {
  await B.board(p, di)
  const b = await B.readBoard(p)
  const mine = (b.lines || []).filter(x => x.text.includes(CSN)).map(x => x.text.slice(0, 120))
  const shot = await pic(p, `s25a-${tag}-board`)
  await W.boardOff(p)
  return { mine, head: b.head, shot }
}
const { browser, p, errors } = await K.fresh()
try {
  await Q.seatDays(p, [TU, WE]); await T.blankRow(p, 'duty', TU)
  const a0t = await Q.readDay(p, TU, 'a0'), a0w = await Q.readDay(p, WE, 'a0')
  t.add('S25a.0', `${CSN} on a blank flying line Tue and Wed and a blank duty row Tue; nothing filed`, sum(a0t, a0w), fl(a0t).length + fl(a0w).length === 0 ? 'PASS' : 'FAIL')

  const f = await T.file(p, { type: 'LL', di: TU, toDi: WE, allday: true, remarks: 'Reason one' })
  const a1t = await Q.readDay(p, TU, 'a1', { noPics: false }), a1w = await Q.readDay(p, WE, 'a1')
  const b1 = await boardLines(p, TU, 'a1')
  t.add('S25a.1', `Inputs page form: LL, All day, Tue 14 → Wed 15 filed (stored: ${await T.rec(p, f.iid)})`, `${sum(a1t, a1w)} || the board's warning panel for Tuesday, lines naming him: ${JSON.stringify(b1.mine)}`,
    fl(a1t).length === 2 && fl(a1w).length === 1 && b1.mine.length === 2 ? 'PASS' : 'FAIL', [...a1t.s.pics, b1.shot])

  const rd = await W2.redate(p, f.iid, T.ISO(TU), null)
  const a2t = await Q.readDay(p, TU, 'a2', { noPics: false }), a2w = await Q.readDay(p, WE, 'a2', { noPics: false })
  t.add('S25a.2', `✎ on its row in the Inputs table: the dates shortened to Tue 14 only (calendar read "${rd}"; stored: ${await T.rec(p, f.iid)})`, sum(a2t, a2w), fl(a2t).length === 2 && fl(a2w).length === 0 ? 'PASS' : 'FAIL', [...a2w.s.pics])

  const er = await W2.editRemarks(p, f.iid, 'Reason two')
  const a3t = await Q.readDay(p, TU, 'a3'), a3w = await Q.readDay(p, WE, 'a3')
  t.add('S25a.3', `✎: the remarks changed to "Reason two" (${er})`, sum(a3t, a3w), fl(a3t).length === 2 && fl(a3t).every(x => /Reason two/.test(x)) ? 'PASS' : 'FAIL')

  const rd2 = await W2.redate(p, f.iid, T.ISO(WE), null)
  const a4t = await Q.readDay(p, TU, 'a4', { noPics: false }), a4w = await Q.readDay(p, WE, 'a4', { noPics: false })
  t.add('S25a.4', `✎: the date moved to Wed 15 only (calendar read "${rd2}"; stored: ${await T.rec(p, f.iid)})`, sum(a4t, a4w), fl(a4t).length === 0 && fl(a4w).length === 1 ? 'PASS' : 'FAIL', [...a4t.s.pics, ...a4w.s.pics])

  const del = await W2.delReq(p, f.iid)
  const a5t = await Q.readDay(p, TU, 'a5', { noPics: false }), a5w = await Q.readDay(p, WE, 'a5', { noPics: false })
  const b5 = await boardLines(p, WE, 'a5')
  t.add('S25a.5', `✕ on its row in the Inputs table (${del})`, `${sum(a5t, a5w)} || board panel for Wednesday, lines naming him: ${JSON.stringify(b5.mine)}`, fl(a5t).length + fl(a5w).length === 0 && b5.mine.length === 0 ? 'PASS' : 'FAIL', [...a5w.s.pics, b5.shot])

  const un = await W.door(p, 'top', 'undo')
  const a6t = await Q.readDay(p, TU, 'a6'), a6w = await Q.readDay(p, WE, 'a6')
  t.add('S25a.6', `the top bar's Undo pressed once after the delete (${JSON.stringify(un).slice(0, 160)})`, sum(a6t, a6w), 'RECORDED')
  await B.reloadAs(p, 'a'); await B.toEdit(p)
  const a7t = await Q.readDay(p, TU, 'a7'), a7w = await Q.readDay(p, WE, 'a7')
  t.add('S25a.7', 'reload and sign in again', sum(a7t, a7w), 'RECORDED')
} catch (e) { R('S25a.X', 'script', String(e.stack || e).slice(0, 900), 'FAIL', [await pic(p, 's25a-X')]) }
R('S25a.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
T.done('bta-B-s25a')
