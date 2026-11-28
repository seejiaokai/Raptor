// bell190 walker A — group 2: a man dragged from a seat onto an input's row (its "+ add"; the only man's puck) [F5, A5];
// group 3: a man moved from one input's row to another's [F6, A6]. Desktop, Edit Schedule week and the Scheduler Board.
import * as L from './bell190-a-lib.mjs'
console.log('bell190-a-g23 v3', L.LIBV)
const R = L.recorder('bell190-a-g23')
const only = process.argv[2] || ''
const { ID, J } = L
const seatOf = (p, di, pid) => p.evaluate(([di, pid]) => { const e = [...document.querySelectorAll('#eWeek [data-slot], #schedBoard [data-slot]')].find(s => s.getBoundingClientRect().width > 3 && new RegExp('^' + di + '\\.\\d+\\.\\d+\\.\\d+\\.[pw]$').test(s.getAttribute('data-slot')) && s.querySelector(`.puck[data-person="${pid}"]`)); return e ? e.getAttribute('data-slot') : null }, [di, pid])
const slotWho = (p, key) => p.evaluate(k => { try { return window.DAYS && null } catch { return null } }, key)
async function bellOf(w, pb, re) { const rr = await L.readAs(w, 'us', pb, re); return rr }
/* ---------- group 2 ---------- */
for (const door of ['week', 'board']) for (const shape of ['add', 'puck']) {
  const c = `A2-seat-to-${shape}-${door}-desk`
  if (only && !c.includes(only)) continue
  console.log('\n=====', c)
  const w = await L.newWorld('desk')
  try {
    await L.signIn(w, 'ad')
    const iid = await L.fileInput(w, L.THU, { type: 'Training', people: [ID.Tally], from: '09:00', to: '11:00' })
    const p = w.page
    let root
    if (door === 'week') { await L.go(p, 'editsched'); root = '#eWeek' } else { await L.openBoard(w, 3); root = '#schedBoard' }
    const seat = await seatOf(p, 3, ID.Ranger)
    const place = await L.rowPlace(p, 3, iid, shape === 'add' ? null : ID.Tally)
    if (!seat || !place) { R(c, 'fixture', 'NOT WALKED', { seat, place }); await w.ctx.close(); continue }
    const n0 = await L.allNotices(p)
    const pb = `a-${c}`
    await L.shot(w, pb + '-1-before')
    const d = await L.drag(w, `${root} [data-slot="${seat}"] .puck[data-person="bane"]`, `${root} ${place.sel}`, pb + '-2')
    const note = await L.toast(p)
    await L.sleep(600)
    const seatNow = await p.evaluate(k => [...document.querySelectorAll(`[data-slot="${k}"] .puck[data-person]`)].filter(e => e.getBoundingClientRect().width > 3).map(e => e.getAttribute('data-person')), seat)
    const rowNow = await L.rowsOf(p, 3, iid)
    await p.evaluate(s => document.querySelector(s)?.scrollIntoView({ block: 'center' }), `${root} [data-fill="g:3.${place.ri}.+"]`)
    await L.shot(w, pb + '-3-after-row')
    await p.evaluate(s => document.querySelector(s)?.scrollIntoView({ block: 'center' }), `${root} [data-slot="${seat}"]`)
    await L.shot(w, pb + '-3-after-seat')
    const fresh = L.newSince(n0, await L.allNotices(p))
    const expect = shape === 'add' ? { bane: 'in', nick: 'add:bane', stiff: null } : { bane: 'in', nick: 'out', stiff: null }
    const changed = rowNow.length && (rowNow[0].who === 'bane' || (rowNow[0].more || []).includes('bane'))
    R(c, 'the drag from his seat ' + seat, d.ok ? 'DONE' : 'BLOCKED', { drag: d, note, seatNowHolds: seatNow, rowNow: rowNow.map(r => [r.who, r.more]), input: (await L.rec(p, iid))?.people }, '', [pb + '-2-carried.png', pb + '-3-after-row.png', pb + '-3-after-seat.png'])
    R(c, 'what his seat does', 'RECORD', `seat ${seat} now holds ${J(seatNow)}; note "${note}"`, '', [pb + '-3-after-seat.png'])
    if (changed) {
      const j = L.judgeLines(fresh, expect, iid)
      R(c, 'lines written (the store)', j.ok ? 'PASS' : 'FAIL', j.out, J(expect))
    } else {
      R(c, 'refused — nobody told', fresh.length === 0 ? 'PASS' : 'FAIL', { note, lines: fresh.map(L.fmtN) }, 'a refused drop writes no line (D757)')
    }
    if (door === 'board') await L.closeBoard(w)
    const rr = await bellOf(w, pb + '-4-ranger', /Training/)
    R(c, 'Ranger\'s bell on screen', 'RECORD', { lines: (rr.bell.lines || []).map(l => `${l.name} | ${l.day} | ${l.what}`), tap: rr.tap && { type: rr.tap.type, people: rr.tap.people, person: rr.tap.person, editor: rr.tap.editor } }, '', [rr.bell.pic, rr.tap?.pic].filter(Boolean))
    if (w.errs.length) R(c, 'page errors', 'NOTE', w.errs)
  } catch (e) { R(c, 'script', 'BLOCKED', String(e.stack || e).slice(0, 400)) }
  await w.ctx.close().catch(() => {})
}
/* ---------- group 3 ---------- */
for (const [door, shape] of [['week', 'add'], ['board', 'add'], ['week', 'puck']]) {
  const c = `A3-move-to-${shape}-${door}-desk`
  if (only && !c.includes(only)) continue
  console.log('\n=====', c)
  const w = await L.newWorld('desk')
  try {
    await L.signIn(w, 'ad')
    const A = await L.fileInput(w, L.WED, { type: 'Training', people: [ID.Ranger, ID.Hex], from: '09:00', to: '11:00' })
    const B = await L.fileInput(w, L.WED, { type: 'Meeting', people: [ID.Tally], from: '13:00', to: '14:00' })
    const p = w.page
    let root
    if (door === 'week') { await L.go(p, 'editsched'); root = '#eWeek' } else { await L.openBoard(w, 2); root = '#schedBoard' }
    const from = await L.rowPlace(p, 2, A, ID.Ranger)
    const to = await L.rowPlace(p, 2, B, shape === 'add' ? null : ID.Tally)
    if (!from || !to) { R(c, 'fixture', 'NOT WALKED', { from, to, ground: await L.groundDump(p, 2) }); await w.ctx.close(); continue }
    const n0 = await L.allNotices(p)
    const pb = `a-${c}`
    await L.shot(w, pb + '-1-before')
    const d = await L.drag(w, `${root} ${from.sel}`, `${root} ${to.sel}`, pb + '-2')
    const note = await L.toast(p)
    await L.sleep(600)
    await L.shot(w, pb + '-3-after')
    const fresh = L.newSince(n0, await L.allNotices(p))
    const recA = await L.rec(p, A), recB = await L.rec(p, B)
    R(c, 'the move', d.ok ? 'DONE' : 'BLOCKED', { drag: d, note, A: recA?.people, B: recB?.people }, '', [pb + '-2-carried.png', pb + '-3-after.png'])
    const exp = shape === 'add'
      ? ['bane|A|out', 'bane|B|in', 'rocky|A|rem:bane', 'nick|B|add:bane']
      : ['bane|A|out', 'bane|B|in', 'rocky|A|rem:bane', 'nick|B|out']
    const j = L.judgeSet(fresh, exp, { A, B })
    R(c, 'lines written (the store)', shape === 'add' ? (j.ok ? 'PASS' : 'FAIL') : 'RECORD', j, shape === 'add' ? 'F6/A6: Ranger "taken off" A and "added" B; Hex "Ranger taken off"; Tally "Ranger added"; Saber none' : 'onto B\'s only puck: what the app does is recorded')
    /* one Undo takes both back */
    const undo = p.locator(door === 'week' ? '#undoBtn' : '#sbUndo').first()
    const nU = await L.allNotices(p)
    await undo.click(); await L.sleep(800)
    const recA2 = await L.rec(p, A), recB2 = await L.rec(p, B)
    const afterUndo = await L.allNotices(p)
    R(c, 'one Undo takes the move back', J(recA2?.people?.slice().sort()) === J(['bane', 'rocky']) && J(recB2?.people) === J(recB0(recB, shape)) ? 'PASS' : 'FAIL', { A: recA2?.people, B: recB2?.people, linesLeftFromMove: L.newSince(n0, afterUndo).map(L.fmtN), linesGone: nU.length - afterUndo.length }, 'A holds Ranger and Hex again, B Tally alone; the move\'s unread lines go (D1693)', [await L.shot(w, pb + '-5-undo')])
    if (door === 'board') await L.closeBoard(w)
    if (w.errs.length) R(c, 'page errors', 'NOTE', w.errs)
  } catch (e) { R(c, 'script', 'BLOCKED', String(e.stack || e).slice(0, 400)) }
  await w.ctx.close().catch(() => {})
}
function recB0() { return ['nick'] }
await L.closeAll()
