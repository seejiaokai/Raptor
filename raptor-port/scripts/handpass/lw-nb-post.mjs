// The night of 1–2 Nov 26, job 1 — [LW-DELETE-POSTING-RESTORE] and the per-day rule of [LW-DELETED-REDO-NETSUM], walked on
// screen: before a posting out with the Delete outcome has run, the top bar's Undo / Redo never put back an approval the live
// Approve refuses from its date (his D1545); every other posting refuses nothing (D1541); a move is no approval. Pressed
// through the app's own controls: the bid window (place, Move, ⋯ → Post out → Delete / Overseas Sqn, the posting sheet's
// "Undo post out"), Approvals' Approve (and its second tap), the top bar's Undo / Redo. Written as the RIGHT behaviour (a PASS
// means correct). The browser's clock from T0 (Wed 4 Nov 26), left running (walk-scripts §1); the built folder served inside
// the browser (lw-rr-lib). The refusals' words are read from the app's own passing note (LW_TOASTS=1 keeps it drawn).
// Run from raptor-port:  SIZE=desk|phone  LW_OUT=<folder under docs/img/handpass>  ONLY=dp0,dp1,…  LW_TOASTS=1
//   node scripts/handpass/lw-nb-post.mjs
process.env.LW_OUT ||= '2026-11-01-lw-next-batch/post'
process.env.LW_TOASTS ||= '1'
const L = await import('./lw-rr-lib.mjs')
const SIZE = process.env.SIZE || 'desk'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const want = id => !ONLY.length || ONLY.includes(id)
console.log('[lw-nb-post v2]', SIZE, ONLY.join(',') || 'all', 'today', L.TODAY, '→', L.OUT)
L.clearOut()

/* the days (T0 = Wed 4 Nov 26): his Delete posting dated Mon 9 Nov — still to run, so he is not deleted; the war refuses his
   leave from 9 Nov (D1545). AFTER Wed 11 Nov is refused live; BEFORE Fri 6 Nov approves; the move: 6 Nov → 10 Nov */
const PO = L.day(5), AFTER = L.day(7), BEFORE = L.day(2), LAND = L.day(6)
const REFUSED = new RegExp(`^Can’t (undo|redo) that — \\S+ posts out on ${L.dm(PO)}, so leave from that day can’t be approved$`)
let w = null, P = null
async function world() {
  if (w) await w.ctx.close()
  w = await L.newWorld(SIZE === 'phone' ? 'phone' : 'desk'); P = w.page
  await L.signInSaved(w, 'admin'); await L.toWar(w)
}
const pidOf = cs => L.pidOf(P, cs)
const leaveAt = async (pid, d) => (await L.warLeave(w, pid)).filter(r => r.date === L.inWords(d))
const approvedOn = async (pid, d) => { const ok = await L.pendingLL(w, pid, d); const lit = await L.approveOn(w, pid, d); return ok && lit === 'approved' }
/* the posting sheet's own "Undo post out", from an empty day of his from the posting's date (a day holding his bid opens the
   day's list there — answer C of [ARCH-STACK]) */
async function undoPostOutOn(pid, d, pic = null) {
  /* the page back at its top first: on a phone the last row picture left the tab row above the screen, and a press aimed
     there landed on the top bar (the walker's DP2 on the phone, 1 Nov 26) */
  await L.settle(w)
  await L.toWar(w); await L.openGrid(w)
  await L.openCell(w, pid, d)
  if (pic) await L.shot(w, pic)
  const offered = await L.vis(P, L.T('postout-undo'))
  if (offered) { await L.press(w, L.T('postout-undo')); await P.waitForTimeout(600) }
  await L.settle(w)
  return offered
}
/* the toast the press raised, read fresh: what the app said after the press */
const saidAfter = async n0 => (await P.evaluate(() => window.__said || [])).slice(n0)
const saidCount = () => P.evaluate(() => (window.__said || []).length)

/* ---------- DP0 — the live door, for comparison: a Delete posting set (not run), Approvals' Approve refuses his day after it ---------- */
if (want('dp0')) {
  await world()
  const id = await pidOf('Drifter')
  const bid = await L.pendingLL(w, id, AFTER)
  const po = await L.postOutFrom(w, id, PO, 'delete', 'dp0-a-postout')
  const deleted = await P.evaluate(id => !!(window.PEOPLE[id] && window.PEOPLE[id].deleted), id)
  await L.settle(w); await L.openApprovals(w)
  const i = await L.lineIdx(w, id, AFTER)
  if (i >= 0) await L.apprPress(w, id, 'appr-approve', i)
  const why = i >= 0 ? await P.evaluate(([pid, n]) => { const ls = [...document.querySelectorAll(`[data-testid="approvals-page"] [data-testid="appr-line-${pid}"]`)].filter(e => e.getBoundingClientRect().height > 0); return ls[n]?.querySelector('[data-testid="appr-why"]')?.textContent.trim() || null }, [id, i]) : '(no line)'
  await L.shot(w, 'dp0-b-approvals')
  const n = (await leaveAt(id, AFTER)).length
  L.rec('DP0 the live Approve after a Delete posting is set', SIZE,
    bid && !deleted && n === 0 && new RegExp(`^He posts out on ${L.dm(PO)}: refuse or delete it$`).test(why || '') ? 'PASS' : 'FAIL',
    `bid ${bid}; posting line "${po.line}"; deleted yet ${deleted}; Approve said "${why}"; his leave on ${L.dm(AFTER)} ${n}`, ['dp0-a-postout', 'dp0-b-approvals'])
}

/* ---------- DP1 — approve, Undo, a Delete posting set, Redo: refused in the live door's words; pressed again, the same ---------- */
/* ---------- DP2 — …then the posting taken back by "Undo post out": the same Redo goes through ---------- */
if (want('dp1')) {
  await world()
  const id = await pidOf('Drifter')
  const ap = await approvedOn(id, AFTER)
  await L.toWar(w); await L.undo(w)
  const undone = (await leaveAt(id, AFTER)).length === 0
  await L.postOutFrom(w, id, PO, 'delete')
  await L.toWar(w); await L.openGrid(w)
  const offered = await L.redoOffered(w)
  let n0 = await saidCount()
  await L.redo(w)
  const said1 = await saidAfter(n0)
  await L.shot(w, 'dp1-a-redo-refused')
  const n1 = (await leaveAt(id, AFTER)).length
  const still = await L.redoOffered(w)
  /* the second press says the same words again: the note's own text is read (the log keeps a repeated line once) */
  await P.evaluate(() => { for (const e of document.querySelectorAll('#toastEl, .toast')) e.textContent = '' })
  await L.redo(w)
  await P.waitForTimeout(200)
  const said2 = await P.evaluate(() => [...document.querySelectorAll('#toastEl, .toast')].map(e => (e.textContent || '').trim()).filter(Boolean))
  await L.reachCell(w, id, AFTER)
  await L.rowShot(w, id, L.day(1), L.day(9), 'dp1-b-row-after-refusal')
  const n2 = (await leaveAt(id, AFTER)).length
  L.rec('DP1 the Redo of an approval after a Delete posting is set: refused, said, nothing written', SIZE,
    ap && undone && offered === true && said1.some(s => REFUSED.test(s)) && n1 === 0 && still === true && said2.some(s => REFUSED.test(s)) && n2 === 0 ? 'PASS' : 'FAIL',
    `approved ${ap}; Undo ${undone}; Redo offered ${offered}; first press said ${JSON.stringify(said1)}; leave ${n1}; still offered ${still}; second press said ${JSON.stringify(said2)}; leave ${n2}`, ['dp1-a-redo-refused', 'dp1-b-row-after-refusal'])
  const took = await undoPostOutOn(id, PO, 'dp2-a-posting-sheet')
  await L.toWar(w); await L.openGrid(w)
  n0 = await saidCount()
  await L.redo(w)
  const said3 = await saidAfter(n0)
  const n3 = (await leaveAt(id, AFTER)).length
  await L.reachCell(w, id, AFTER)
  await L.rowShot(w, id, L.day(1), L.day(9), 'dp2-row-after-redo')
  L.rec('DP2 the posting taken back ("Undo post out"): the same Redo goes through', SIZE,
    took && n3 === 1 && !said3.some(s => REFUSED.test(s)) ? 'PASS' : 'FAIL',
    `"Undo post out" offered and pressed ${took}; Redo said ${JSON.stringify(said3)}; his leave on ${L.dm(AFTER)} ${n3}`, ['dp2-a-posting-sheet', 'dp2-row-after-redo'])
}

/* ---------- DP3 — the same with an Overseas Sqn posting: it refuses nothing, the Redo goes through (D1541) ---------- */
if (want('dp3')) {
  await world()
  const id = await pidOf('Drifter')
  const ap = await approvedOn(id, AFTER)
  await L.toWar(w); await L.undo(w)
  const undone = (await leaveAt(id, AFTER)).length === 0
  await L.postOutFrom(w, id, PO, 'overseas')
  await L.toWar(w); await L.openGrid(w)
  const n0 = await saidCount()
  await L.redo(w)
  const said = await saidAfter(n0)
  const n = (await leaveAt(id, AFTER)).length
  await L.reachCell(w, id, AFTER)
  await L.rowShot(w, id, L.day(1), L.day(9), 'dp3-row-after-redo')
  L.rec('DP3 an Overseas Sqn posting: the Redo of the approval goes through (D1541)', SIZE,
    ap && undone && n === 1 && !said.some(s => /Can’t (undo|redo)/.test(s)) ? 'PASS' : 'FAIL',
    `approved ${ap}; Undo ${undone}; Redo said ${JSON.stringify(said)}; his leave on ${L.dm(AFTER)} ${n}`, ['dp3-row-after-redo'])
}

/* ---------- DP4 — approve, the second tap sends it back, a Delete posting set, Undo: refused — the approval not put back ---------- */
if (want('dp4')) {
  await world()
  const id = await pidOf('Drifter')
  const ap = await approvedOn(id, AFTER)
  /* the bid window on his approved day: Approve shows lit, a second tap sends the leave back to waiting (D1330) */
  await L.toWar(w); await L.openGrid(w)
  await L.openCell(w, id, AFTER)
  const lit = await P.locator(`${L.T('bid-picker')} ${L.T('decide-approve')}`).getAttribute('aria-pressed').catch(() => null)
  if (await L.vis(P, L.T('decide-approve'))) { await L.press(w, L.T('decide-approve')); await P.waitForTimeout(600) }
  await L.settle(w)
  const back = (await leaveAt(id, AFTER)).length === 0
  await L.postOutFrom(w, id, PO, 'delete')
  await L.toWar(w); await L.openGrid(w)
  const n0 = await saidCount()
  await L.undo(w)
  const said = await saidAfter(n0)
  await L.shot(w, 'dp4-undo-refused')
  const n = (await leaveAt(id, AFTER)).length
  L.rec('DP4 the Undo of a send-back after a Delete posting is set: refused, said, nothing written', SIZE,
    ap && back && said.some(s => REFUSED.test(s)) && n === 0 ? 'PASS' : 'FAIL',
    `approved ${ap}; Approve lit ${lit}; sent back ${back}; Undo said ${JSON.stringify(said)}; his leave on ${L.dm(AFTER)} ${n}`, ['dp4-undo-refused'])
}

/* ---------- DP5 — his day BEFORE the posting's date: approve, Undo, the Delete posting set, Redo — goes through ---------- */
if (want('dp5')) {
  await world()
  const id = await pidOf('Drifter')
  const ap = await approvedOn(id, BEFORE)
  await L.toWar(w); await L.undo(w)
  const undone = (await leaveAt(id, BEFORE)).length === 0
  await L.postOutFrom(w, id, PO, 'delete')
  await L.toWar(w); await L.openGrid(w)
  const n0 = await saidCount()
  await L.redo(w)
  const said = await saidAfter(n0)
  const n = (await leaveAt(id, BEFORE)).length
  await L.reachCell(w, id, BEFORE)
  await L.rowShot(w, id, L.day(1), L.day(9), 'dp5-row-after-redo')
  L.rec('DP5 his day before the Delete posting’s date: the Redo goes through', SIZE,
    ap && undone && n === 1 && !said.some(s => /Can’t (undo|redo)/.test(s)) ? 'PASS' : 'FAIL',
    `approved ${ap}; Undo ${undone}; Redo said ${JSON.stringify(said)}; his leave on ${L.dm(BEFORE)} ${n}`, ['dp5-row-after-redo'])
}

/* ---------- DP6 — a move is no approval: his approved 6 Nov moved by the bid window's Move to 10 Nov (across the date), Undo,
   the Delete posting set, Redo — goes through; and the live Move, for comparison, after the posting is set ---------- */
if (want('dp6')) {
  await world()
  const id = await pidOf('Drifter')
  const ap = await approvedOn(id, BEFORE)
  const mv = await L.moveLeave(w, id, BEFORE, LAND)
  const moved = (await leaveAt(id, LAND)).length === 1
  await L.toWar(w); await L.undo(w)
  const back = (await leaveAt(id, BEFORE)).length === 1 && (await leaveAt(id, LAND)).length === 0
  await L.postOutFrom(w, id, PO, 'delete')
  await L.toWar(w); await L.openGrid(w)
  const n0 = await saidCount()
  await L.redo(w)
  const said = await saidAfter(n0)
  const on = (await leaveAt(id, LAND)).length, off = (await leaveAt(id, BEFORE)).length
  await L.reachCell(w, id, LAND)
  await L.rowShot(w, id, L.day(1), L.day(9), 'dp6-a-row-after-redo')
  L.rec('DP6 the Redo of a move across the Delete posting’s date: goes through (a move is no approval)', SIZE,
    ap && !!mv && moved && back && on === 1 && off === 0 && !said.some(s => /Can’t (undo|redo)/.test(s)) ? 'PASS' : 'FAIL',
    `approved ${ap}; moved ${!!mv && moved}; Undo put it back ${back}; Redo said ${JSON.stringify(said)}; leave on ${L.dm(LAND)} ${on}, on ${L.dm(BEFORE)} ${off}`, ['dp6-a-row-after-redo'])
  /* the live Move, for comparison: back to 6 Nov and across again, the posting standing */
  await L.settle(w); await L.toWar(w); await L.undo(w)
  await L.settle(w)
  const mv2 = await L.moveLeave(w, id, BEFORE, LAND, 'dp6-b-live-move-staged')
  if (!(await L.vis(P, L.T('move-confirm')))) await L.shot(w, 'dp6-b-live-move-staged')
  const live = (await leaveAt(id, LAND)).length
  L.rec('DP6-live the live Move across the Delete posting’s date, for comparison', SIZE, 'RECORDED',
    `Move offered ${!!mv2}, banner "${mv2?.banner}", after "${mv2?.after}"; leave on ${L.dm(LAND)} ${live}`, ['dp6-b-live-move-staged'])
}

/* ---------- DP7 — the scenario designer's S9: approve, the Delete posting set, Undo (passes — it takes the approval away), Redo
   (refused) ---------- */
if (want('dp7')) {
  await world()
  const id = await pidOf('Drifter')
  const ap = await approvedOn(id, AFTER)
  await L.postOutFrom(w, id, PO, 'delete')
  await L.toWar(w); await L.openGrid(w)
  let n0 = await saidCount()
  await L.undo(w)
  const saidU = await saidAfter(n0)
  const undone = (await leaveAt(id, AFTER)).length === 0
  n0 = await saidCount()
  await L.redo(w)
  const saidR = await saidAfter(n0)
  await L.shot(w, 'dp7-redo-refused')
  const n = (await leaveAt(id, AFTER)).length
  L.rec('DP7 approve, a Delete posting set, Undo, Redo: the Undo goes, the Redo is refused', SIZE,
    ap && undone && !saidU.some(s => /Can’t (undo|redo)/.test(s)) && saidR.some(s => REFUSED.test(s)) && n === 0 ? 'PASS' : 'FAIL',
    `approved ${ap}; Undo said ${JSON.stringify(saidU)}, took it ${undone}; Redo said ${JSON.stringify(saidR)}; his leave on ${L.dm(AFTER)} ${n}`, ['dp7-redo-refused'])
}

/* ---------- DP8 — the designer's S11: refused, then the posting's outcome changed to Overseas Sqn on the posting sheet: the
   Redo goes through (D1541) ---------- */
if (want('dp8')) {
  await world()
  const id = await pidOf('Drifter')
  const ap = await approvedOn(id, AFTER)
  await L.toWar(w); await L.undo(w)
  await L.postOutFrom(w, id, PO, 'delete')
  await L.toWar(w); await L.openGrid(w)
  let n0 = await saidCount()
  await L.redo(w)
  const said1 = await saidAfter(n0)
  /* the posting sheet, from the posting's own (empty) day: Overseas Sqn chosen, its button pressed */
  await L.openCell(w, id, PO)
  const sheet = await L.vis(P, L.T('postout-overseas'))
  if (sheet) {
    await L.press(w, L.T('postout-overseas')); await P.waitForTimeout(300)
    if (await L.vis(P, L.T('postout-confirm'))) { await L.press(w, L.T('postout-confirm')); await P.waitForTimeout(600) }
  }
  await L.shot(w, 'dp8-a-posting-sheet')
  await L.settle(w)
  const outcome = await P.evaluate(id => { const s = window.lwState ? window.lwState() : null; return s?.postOuts?.[id]?.outcome ?? s?.people?.find(p => p.id === id)?.outcome ?? null }, id)
  await L.toWar(w); await L.openGrid(w)
  n0 = await saidCount()
  await L.redo(w)
  const said2 = await saidAfter(n0)
  const n = (await leaveAt(id, AFTER)).length
  await L.reachCell(w, id, AFTER)
  await L.rowShot(w, id, L.day(1), L.day(9), 'dp8-b-row-after-redo')
  L.rec('DP8 refused, the outcome changed to Overseas Sqn, Redo: goes through (D1541)', SIZE,
    ap && said1.some(s => REFUSED.test(s)) && n === 1 && !said2.some(s => /Can’t (undo|redo)/.test(s)) ? 'PASS' : 'FAIL',
    `approved ${ap}; first Redo said ${JSON.stringify(said1)}; the sheet's Overseas chip offered ${sheet}; outcome read ${outcome}; second Redo said ${JSON.stringify(said2)}; his leave on ${L.dm(AFTER)} ${n}`, ['dp8-a-posting-sheet', 'dp8-b-row-after-redo'])
}

/* ---------- DP9 — the designer's S15: Auto-approve on, LL placed on his day after the Delete posting's date — the live door
   keeps it pending and says why; Undo, Redo: still no approval ---------- */
if (want('dp9')) {
  await world()
  const id = await pidOf('Drifter')
  await L.postOutFrom(w, id, PO, 'delete')
  await L.toWar(w); await L.openGrid(w)
  /* his day after the posting's date opens the posting sheet; its "Place leave or OIL here instead…" leads to the bid window */
  await L.openCell(w, id, AFTER)
  if (await L.vis(P, L.T('postout-place'))) { await L.press(w, L.T('postout-place')); await P.waitForTimeout(400) }
  const tick = await L.autoApprove(w, true)
  await L.press(w, L.T('bid-LL')); await P.waitForTimeout(600)
  if (await L.vis(P, L.T('bid-picker')) && /again/i.test((await L.txt(P, L.T('bid-picker'))) || '')) { await L.press(w, L.T('bid-LL')); await P.waitForTimeout(600) }
  const kept = await P.evaluate(() => document.body.innerText.match(/kept pending[^\n]*/)?.[0] ?? null)
  await L.shot(w, 'dp9-a-kept-pending')
  const n1 = (await leaveAt(id, AFTER)).length
  await L.settle(w)
  await L.undo(w)
  await L.redo(w)
  const n2 = (await leaveAt(id, AFTER)).length
  const cell = await L.cellInfo(P, id, AFTER)
  await L.reachCell(w, id, AFTER)
  await L.rowShot(w, id, L.day(1), L.day(9), 'dp9-b-row-after-redo')
  L.rec('DP9 Auto-approve after a Delete posting’s date: kept pending live, and no approval after Undo / Redo', SIZE,
    tick !== null && /kept pending — He posts out on/.test(kept || '') && n1 === 0 && n2 === 0 ? 'PASS' : 'FAIL',
    `Auto-approve on ${tick}; said "${kept}"; his leave on ${L.dm(AFTER)} after placing ${n1}, after Undo / Redo ${n2}; the cell draws ${cell?.text}`, ['dp9-a-kept-pending', 'dp9-b-row-after-redo'])
}

console.log('errors:', w?.errs.length ? w.errs : 'none')
L.rec('errors', SIZE, !w?.errs.length ? 'PASS' : 'FAIL', w?.errs.slice(0, 6).join(' | ') || 'none')
L.writeResults('post-' + SIZE)
await L.closeBrowser()
