/* [DB-READINESS] phase 7 — WALKER A, part 2: A6 — the negatives. A Personal row with ALL AVAIL in its extras on
   Saturday: cancelled (CX), information-only (ⓘ), taken off (✕ on its row) — no chip each; and a Personal row with only
   a named extra (Sunday) — no chip. Board (OIL Earn off and on) and the edit week, each time. */
import { boot, world, fileTimed, oilButton, stored } from './p6-lib.mjs'
import * as S from './seat-lib.mjs'
import * as A from './p7-a-lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await world(L)
await W.toastSpy(p)
const SAT = A.SAT, SUN = A.SUN

/* what both surfaces say about the request's chip: board (mode off), board (mode on), edit week */
async function look(tag, di, iid, { expectChip }) {
  const out = {}
  await W.boardOn(p, di); await A.showRow(p, di, iid)
  out.boardOff = await A.chips(p, '#schedBoard', iid)
  out.rowOff = await A.boardRow(p, di, iid)
  await A.pic(L, p, `${tag}-board`)
  await oilButton(L, p); await A.showRow(p, di, iid)
  out.boardOn = await A.chips(p, '#schedBoard', iid)
  out.rowOn = await A.boardRow(p, di, iid)
  out.allOn = (await A.chips(p, '#schedBoard', null)).length
  await A.pic(L, p, `${tag}-board-oilearn`)
  await oilButton(L, p)
  await W.boardOff(p); await W.toEdit(L, p); await A.showWeekChip(p, '#eWeek', di, iid)
  out.week = await A.chips(p, `#eWeek .day[data-day="${di}"]`, iid)
  out.weekAny = (await A.chips(p, `#eWeek .day[data-day="${di}"]`, null)).length
  out.weekPh = await A.weekRow(p, '#eWeek', di, iid)
  await A.pic(L, p, `${tag}-editweek`)
  const n = [out.boardOff.length, out.boardOn.length, out.week.length]
  A.said(`${tag}: chips painted — board ${n[0]}, board with OIL Earn on ${n[1]}, edit week ${n[2]}${out.boardOff[0] ? ` ("${out.boardOff[0].txt}")` : ''}; row class [${out.rowOff.cls || out.rowOff.err}]; in the mode the item cell reads "${out.rowOn.item ? out.rowOn.item.title : out.rowOn.err}"`)
  A.ok(`${tag}: ${expectChip ? 'the chip shows on the board, in OIL Earn and on the edit week' : 'NO chip on the board, in OIL Earn or on the edit week'}`, expectChip ? n.every(x => x === 1) : n.every(x => x === 0), n)
  return out
}

A.scen('A6', 'timed Personal (Ranger, Sat 18 Jul 10:00–11:00) with ALL AVAIL in the extras; then on the board: CX, CX again, ⓘ, ⓘ again, ✕ on its row, Undo; and a Sunday Personal row with only a named extra (Anvil)')
try {
  const iid = await fileTimed(L, p, { person: A.RANGER, type: 'Personal', iso: A.ISO[SAT], from: '10:00', to: '11:00', remarks: 'P7 A6' })
  await W.boardOn(p, SAT)
  let ri = await A.rowIdx(p, SAT, iid)
  const put = await A.place(S, p, SAT, ri, 'extras', 'allavail')
  A.ok('ALL AVAIL placed in the extras', put.took, put)
  const base = await look('A6-0-standing', SAT, iid, { expectChip: true })

  /* (a) cancelled */
  await W.boardOn(p, SAT); ri = await A.rowIdx(p, SAT, iid)
  A.said('CX pressed: ' + await A.rowBtn(p, 'data-grcx', SAT, ri))
  A.data('row after CX: ' + JSON.stringify(await A.rowOf(p, SAT, iid)))
  const cx = await look('A6-a-cancelled', SAT, iid, { expectChip: false })
  await W.boardOn(p, SAT); A.said('CX pressed again: ' + await A.rowBtn(p, 'data-grcx', SAT, ri))
  await look('A6-a2-uncancelled', SAT, iid, { expectChip: true })

  /* (b) information-only */
  await W.boardOn(p, SAT)
  A.said('ⓘ pressed: ' + await A.rowBtn(p, 'data-grinfo', SAT, ri))
  A.data('row after ⓘ: ' + JSON.stringify(await A.rowOf(p, SAT, iid)))
  await look('A6-b-infoonly', SAT, iid, { expectChip: false })
  await W.boardOn(p, SAT); A.said('ⓘ pressed again: ' + await A.rowBtn(p, 'data-grinfo', SAT, ri))
  await look('A6-b2-uninfo', SAT, iid, { expectChip: true })

  /* (c) taken off — ✕ on its row */
  await W.boardOn(p, SAT)
  await W.toasts(p)
  A.said('✕ on the row: ' + await A.rowBtn(p, 'data-grdel', SAT, ri) + '; the app said ' + JSON.stringify(await W.toasts(p)))
  const req = await A.reqOf(p, iid)
  A.data(`request after ✕: acc=${req && req.acc}; rows left for it on Saturday: ${JSON.stringify(await p.evaluate(([d, i]) => (window.DAYS[d].ground || []).filter(r => r.src === i), [SAT, iid]))}`)
  A.ok('the request reads taken off', req && req.acc === 'r', req && req.acc)
  await W.boardOn(p, SAT)
  const anyB = await A.chips(p, '#schedBoard', null)
  await A.pic(L, p, 'A6-c-takenoff-board')
  await oilButton(L, p); const anyBon = await A.chips(p, '#schedBoard', null); await A.pic(L, p, 'A6-c-takenoff-board-oilearn'); await oilButton(L, p)
  await W.boardOff(p); await W.toEdit(L, p); await W.showDay(p, SAT)
  const anyW = await A.chips(p, `#eWeek .day[data-day="${SAT}"]`, null)
  await A.pic(L, p, 'A6-c-takenoff-editweek')
  A.ok('A6-c taken off: no chip anywhere on the day (board, OIL Earn, edit week)', anyB.length === 0 && anyBon.length === 0 && anyW.length === 0, { board: anyB.length, mode: anyBon.length, week: anyW.length })
  A.said(`A6-c taken off: chips painted — board ${anyB.length}, OIL Earn ${anyBon.length}, edit week ${anyW.length}`)
  /* Undo the ✕ → the row and its crowd return */
  const u = await W.door(p, 'top', 'undo')
  A.said(`Undo (top bar, "${u.title}"): toasts ${JSON.stringify(u.toasts)}`)
  const row2 = await A.rowOf(p, SAT, iid)
  A.data('row after Undo: ' + JSON.stringify(row2))
  await look('A6-c2-undo-takenoff', SAT, iid, { expectChip: true })

  /* (d) a Personal row with only a named extra — Sunday */
  const iid2 = await fileTimed(L, p, { person: A.RANGER, type: 'Personal', iso: A.ISO[SUN], from: '10:00', to: '11:00', remarks: 'P7 A6d' })
  await W.boardOn(p, SUN)
  const ri2 = await A.rowIdx(p, SUN, iid2)
  const put2 = await A.place(S, p, SUN, ri2, 'extras', 'shaft')
  A.ok('Anvil (a named man) placed in the extras of the Sunday Personal row', put2.took, put2)
  const d = await look('A6-d-named-only', SUN, iid2, { expectChip: false })
  for (const pk of d.rowOn.pucks || []) A.said(`A6-d OIL Earn, Sunday row puck ${pk.cs}: ${pk.earn ? `[${pk.earn.cls}] "${pk.earn.title}"` : 'no earn wrapper'}`)
  A.data('stored Sunday row: ' + JSON.stringify(((await stored(p, 'weeks/13-07-2026#6')) || {}).ground || 'n/a').slice(0, 300))

  const n0 = L.results.length
  await L.reloadCompare(p, 'A6', 'a', { page: 'editsched' })
  A.ok('a reload gives back what was there and writes nothing', L.results.slice(n0).every(r => r.ok), L.results.slice(n0).filter(r => !r.ok))
} catch (e) {
  A.ok('the scenario ran', false, String(e && e.stack || e).slice(0, 700))
  await A.pic(L, p, 'A6-X-error').catch(() => {})
}
A.ok('no console error, page error or 4xx', errors.length === 0, errors.slice(0, 5))
A.saveRows(process.env.HP_OUT.replace(/\.json$/, '-walk2.json'), { errors })
await browser.close()
