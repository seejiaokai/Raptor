/* [DB-READINESS] group A — the FULL walk, walker W5 (the Tracker), part D (30 Sep 26): the Tracker's own ↶ Undo and
   ↷ Redo (in the top bar — D347, D349) after a MARK and after a PACE change (D372). The Tracker's history is this
   session's own (a reload clears it, by design), so each Undo and each Redo gets its own fresh change first:
     mark → reload (kept) · mark → ↶ → reload (still undone) · mark → ↶ → ↷ → reload (back)
     pace → reload (kept) · pace → ↶ → reload (the earlier pace) · pace → ↶ → ↷ → reload (the new pace)
   Each gesture: the rows it wrote, named by its batch, ONE batch; each reload gives it all back and writes nothing.
     HP_URL=http://localhost:4205 HP_SHOTS=…/W5 HP_OUT=…/parts/dbrA-W5-d.json node dbrA-W5-d.mjs */
import * as L from './dbrA-lib.mjs'
import * as T from './dbrA-W5-lib.mjs'

const errors = [], table = [], notes = []
const b = await L.launch()
const undoState = p => p.evaluate(() => { const u = document.getElementById('trUndoBtn'), r = document.getElementById('trRedoBtn'); return { undo: u && !u.disabled, redo: r && !r.disabled, undoTitle: u && u.title, redoTitle: r && r.title } })
const paceOf = (p, sid) => p.evaluate(sid => { const c = document.getElementById('courseSel').value; const v = localStorage.getItem(`raptor:tracker/v3:${c}:pace:${sid}`); return v ? JSON.parse(v).epw : null }, sid)
const shownPace = p => p.inputValue('#epwIn')
try {
  const ctx = await L.context(b)
  const p = await L.page(ctx, errors, 'W5d')
  await T.firstBoot(p); await T.firstMount(p)
  const [stA] = await p.evaluate(() => window.__coreForTests.rosterNow())
  const [e1, e2, e3] = await T.firstBalls(p, 3)
  const M = new RegExp(`^tracker/v3:[^:]+:[^:]+:(m|d):${stA.id}$`), MX = [new RegExp(`^tracker/v3:[^:]+:(last:${stA.id}|lastStudent)$`)]
  L.check('D0 before anything, the top bar\'s ↶ ↷ are greyed', !(await undoState(p)).undo && !(await undoState(p)).redo, JSON.stringify(await undoState(p)))

  /* ---- marks ---- */
  const m1 = await L.step(p, `D1 a DCO mark on ${e1}`, async () => T.grade(p, e1, 'DCO'), { put: [M], also: MX, only: true })
  T.oneBatch('D1 a mark', m1)
  await T.trkReload(p, 'D1 a mark')
  L.check('D1 after the reload the mark is there, and the history is this session\'s own (↶ greyed)', (await T.gradeOf(p, e1)) === 'dco' && !(await undoState(p)).undo, JSON.stringify(await undoState(p)))
  await L.shot(p, 'd1-mark-after-reload')

  const m2 = await L.step(p, `D2a a DCO mark on ${e2}`, async () => T.grade(p, e2, 'DCO'))
  const us = await undoState(p)
  notes.push('D2 the ↶ title after the mark: ' + us.undoTitle)
  const u2 = await L.step(p, `D2b ↶ Undo (top bar) — the mark on ${e2}`, async () => { await p.click('#trUndoBtn'); await T.sleep(500) }, { put: [M], also: MX, only: true })
  T.oneBatch('D2b ↶ Undo a mark', u2)
  L.check(`D2b the mark on ${e2} is gone, ${e1} kept`, !(await T.gradeOf(p, e2)) && (await T.gradeOf(p, e1)) === 'dco', `${e2}: ${await T.gradeOf(p, e2)} · ${e1}: ${await T.gradeOf(p, e1)}`)
  await L.shot(p, 'd2-undone')
  await T.trkReload(p, 'D2b ↶ Undo a mark')
  L.check(`D2b after the reload ${e2} is still unmarked`, !(await T.gradeOf(p, e2)), String(await T.gradeOf(p, e2)))
  await L.shot(p, 'd2-after-reload')

  const m3 = await L.step(p, `D3a a DCO mark on ${e3}`, async () => T.grade(p, e3, 'DCO'))
  const u3 = await L.step(p, `D3b ↶ Undo — the mark on ${e3}`, async () => { await p.click('#trUndoBtn'); await T.sleep(500) }, { put: [M], also: MX, only: true })
  L.check(`D3b ${e3} unmarked, ↷ Redo lit`, !(await T.gradeOf(p, e3)) && (await undoState(p)).redo, JSON.stringify(await undoState(p)))
  const r3 = await L.step(p, `D3c ↷ Redo (top bar) — the mark on ${e3}`, async () => { await p.click('#trRedoBtn'); await T.sleep(500) }, { put: [M], also: MX, only: true })
  T.oneBatch('D3c ↷ Redo a mark', r3)
  L.check(`D3c ${e3} marked DCO again`, (await T.gradeOf(p, e3)) === 'dco', String(await T.gradeOf(p, e3)))
  await L.shot(p, 'd3-redone')
  await T.trkReload(p, 'D3c ↷ Redo a mark')
  L.check(`D3c after the reload ${e3} is DCO`, (await T.gradeOf(p, e3)) === 'dco', String(await T.gradeOf(p, e3)))
  await L.shot(p, 'd3-after-reload')
  table.push({ step: 'D1–D3', width: 'desktop', did: `DCO on ${e1} (reload); DCO on ${e2} → ↶ (reload); DCO on ${e3} → ↶ → ↷ (reload) — the top bar's pair`, after: `${e1} DCO · ${e2} not done · ${e3} DCO`,
    rows: `mark: ${T.rowsLine(m1)} ‖ ↶: ${T.rowsLine(u2)} ‖ ↶: ${T.rowsLine(u3)} ‖ ↷: ${T.rowsLine(r3)}`, pics: ['d1-mark-after-reload', 'd2-undone', 'd2-after-reload', 'd3-redone', 'd3-after-reload'] })

  /* ---- pace ---- */
  const P = new RegExp(`^tracker/v3:[^:]+:pace:${stA.id}$`)
  const p1 = await L.step(p, 'D4 pace 3 a week', async () => { await p.fill('#epwIn', '3'); await T.sleep(300) }, { put: [P], only: true })
  await T.trkReload(p, 'D4 a pace')
  L.check('D4 after the reload the pace reads 3', (await shownPace(p)) === '3' && String(await paceOf(p, stA.id)) === '3', `${await shownPace(p)} / ${await paceOf(p, stA.id)}`)
  const p2 = await L.step(p, 'D5a pace 3.5', async () => { await p.fill('#epwIn', '3.5'); await T.sleep(300) }, { put: [P], only: true })
  notes.push('D5 the ↶ title after the pace change: ' + (await undoState(p)).undoTitle)
  const u5 = await L.step(p, 'D5b ↶ Undo — the pace', async () => { await p.click('#trUndoBtn'); await T.sleep(500) }, { put: [P], only: true })
  T.oneBatch('D5b ↶ Undo a pace', u5)
  L.check('D5b the pace reads 3 again', (await shownPace(p)) === '3' && String(await paceOf(p, stA.id)) === '3', `${await shownPace(p)} / ${await paceOf(p, stA.id)}`)
  await L.shot(p, 'd5-pace-undone')
  await T.trkReload(p, 'D5b ↶ Undo a pace')
  L.check('D5b after the reload the pace reads 3', (await shownPace(p)) === '3', await shownPace(p))
  const p3 = await L.step(p, 'D6a pace 4', async () => { await p.fill('#epwIn', '4'); await T.sleep(300) }, { put: [P], only: true })
  const u6 = await L.step(p, 'D6b ↶ Undo — the pace', async () => { await p.click('#trUndoBtn'); await T.sleep(500) }, { put: [P], only: true })
  const r6 = await L.step(p, 'D6c ↷ Redo — the pace', async () => { await p.click('#trRedoBtn'); await T.sleep(500) }, { put: [P], only: true })
  T.oneBatch('D6c ↷ Redo a pace', r6)
  L.check('D6c the pace reads 4', (await shownPace(p)) === '4' && String(await paceOf(p, stA.id)) === '4', `${await shownPace(p)} / ${await paceOf(p, stA.id)}`)
  await L.shot(p, 'd6-pace-redone')
  await T.trkReload(p, 'D6c ↷ Redo a pace')
  L.check('D6c after the reload the pace reads 4', (await shownPace(p)) === '4', await shownPace(p))
  await p.locator('#epwIn').scrollIntoViewIfNeeded(); await T.sleep(200)
  await L.shot(p, 'd6-after-reload')
  table.push({ step: 'D4–D6', width: 'desktop', did: 'pace 3 (reload); 3.5 → ↶ (reload); 4 → ↶ → ↷ (reload)', after: 'pace 3 → 3 → 4',
    rows: `pace: ${T.rowsLine(p1)} ‖ ↶: ${T.rowsLine(u5)} ‖ ↶: ${T.rowsLine(u6)} ‖ ↷: ${T.rowsLine(r6)}`, pics: ['d5-pace-undone', 'd6-pace-redone', 'd6-after-reload'] })
} catch (e) {
  L.check('W5 part D ran to its end', false, e && e.stack || String(e))
} finally { await b.close() }
L.check('W5 part D — no console error, page error or failed request', errors.length === 0, errors.slice(0, 6).join(' | '))
process.exitCode = L.save({ walker: 'W5', part: 'D', table, notes, errors }) ? 1 : 0
