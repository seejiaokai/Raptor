// The night of 30–31 Oct 26, job 2 — fix 2, [LW-DELETED-RESTORE-OVERREFUSE]: for a deleted man, Undo / Redo no longer
// refuses two changes the live screen allows (docs/handpass/parts/lw-sf1030/read-fix2.md, findings A and B). Scenarios
// RR-A0, RR-A, RR-B0, RR-B, RR-C1, RR-C2 of docs/handpass/2026-10-31-lw-roster-restore.md §5, pressed through the app's own
// controls: the bid window (place, Move, ⋯ → Post out → Delete), Approvals' Approve, the Inputs page's window, Admin → Users'
// Delete, the top bar's Undo / Redo. Written as the RIGHT behaviour (a PASS means correct) — on origin/main's build RR-A and
// RR-B are expected to FAIL (the fault), every other scenario to PASS on both.
// Run from raptor-port:  SIZE=desk|phone  LW_DIST=dist|<main's build>  LW_OUT=<folder under docs/img/handpass>  ONLY=rr-a,…
//   node scripts/handpass/lw-rr-s1.mjs
process.env.LW_OUT ||= '2026-10-31-lw-roster-restore/s1'
const L = await import('./lw-rr-lib.mjs')
const SIZE = process.env.SIZE || 'desk'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const want = id => !ONLY.length || ONLY.includes(id)
console.log('[lw-rr-s1 v1]', SIZE, ONLY.join(',') || 'all', 'today', L.TODAY)
L.clearOut()
const DEL = /has been deleted — that change can.t be undone/

/* the days (T0 = Wed 4 Nov 26): his approved leave on Mon 26 Oct, a Delete posting dated Fri 30 Oct run late (on 4 Nov — he
   is deleted from 4 Nov, his 30 Oct–3 Nov kept but refused live), the move's landing Mon 2 Nov, a second day Tue 27 Oct */
const A = L.day(-9), A2 = L.day(-8), PO = L.day(-5), GAP = L.day(-2)
let w = null, P = null
async function world() {
  if (w) await w.ctx.close()
  w = await L.newWorld(SIZE === 'phone' ? 'phone' : 'desk'); P = w.page
  await L.signInSaved(w, 'admin'); await L.toWar(w)
}
const pidOf = cs => L.pidOf(P, cs)
const leaveAt = async (pid, d) => (await L.warLeave(w, pid)).filter(r => r.date === L.inWords(d))
const approvedOn = async (pid, d) => { const ok = await L.pendingLL(w, pid, d); const lit = await L.approveOn(w, pid, d); return ok && lit === 'approved' }

/* ---------- RR-A0 — the live door, for comparison: after the posting ran late, his approved leave moves across its date ---------- */
if (want('rr-a0')) {
  await world()
  const id = await pidOf('Drifter')
  const ap = await approvedOn(id, A)
  const po = await L.postOutFrom(w, id, PO, 'delete', 'rr-a0-a-postout')
  const cut = await P.evaluate(id => window.PEOPLE[id] && window.PEOPLE[id].deletedFrom, id)
  const mv = await L.moveLeave(w, id, A, GAP, 'rr-a0-b-move-staged')
  await L.rowShot(w, id, L.day(-10), L.day(-1), 'rr-a0-c-after-move')
  const on = await leaveAt(id, GAP), off = await leaveAt(id, A)
  L.rec('RR-A0 the live move across the posting’s date', SIZE, ap && cut === L.TODAY && mv && on.length === 1 && off.length === 0 ? 'PASS' : 'FAIL',
    `approved ${ap}; ${po.line ? `"${po.line}"` : ''} deleted from ${cut}; Move offered ${!!mv}, banner "${mv?.banner}", after "${mv?.after}"; leave on ${L.dm(GAP)} ${on.length}, on ${L.dm(A)} ${off.length}`, ['rr-a0-a-postout', 'rr-a0-c-after-move'])
}

/* ---------- RR-A — finding A: moved across the posting's date, Undo, the posting runs late, Redo ---------- */
if (want('rr-a')) {
  await world()
  const id = await pidOf('Drifter')
  const ap = await approvedOn(id, A)
  const mv = await L.moveLeave(w, id, A, GAP)
  const moved = (await leaveAt(id, GAP)).length === 1
  await L.undo(w)
  const back = (await leaveAt(id, A)).length === 1 && (await leaveAt(id, GAP)).length === 0
  await L.postOutFrom(w, id, PO, 'delete')
  const cut = await P.evaluate(id => window.PEOPLE[id] && window.PEOPLE[id].deletedFrom, id)
  await L.toWar(w); await L.openGrid(w)
  const offered = await L.redoOffered(w)
  await L.shot(w, 'rr-a-a-before-redo')
  await L.redo(w)
  const said = await L.lastSaid(w)
  const on = await leaveAt(id, GAP), off = await leaveAt(id, A)
  await L.reachCell(w, id, GAP)
  await L.rowShot(w, id, L.day(-10), L.day(-1), 'rr-a-b-after-redo')
  L.rec('RR-A the Redo of a move across the posting’s date, after it ran late', SIZE,
    ap && moved && back && cut === L.TODAY && offered === true && on.length === 1 && off.length === 0 && !said.some(s => DEL.test(s)) ? 'PASS' : 'FAIL',
    `approved ${ap}; moved ${!!mv && moved}; Undo put it back ${back}; deleted from ${cut}; Redo offered ${offered}; after Redo leave on ${L.dm(GAP)} ${on.length}, on ${L.dm(A)} ${off.length}; said ${JSON.stringify(said)}`, ['rr-a-a-before-redo', 'rr-a-b-after-redo'])
}

/* ---------- RR-B0 — the live door, for comparison: after his delete, the Inputs-page lengthening over his own pending bid ---------- */
if (want('rr-b0')) {
  await world()
  const id = await pidOf('Drifter')
  const ap = await approvedOn(id, A)
  const bid = await L.pendingLL(w, id, A2)
  const del = await L.deleteOnUsers(w, id)
  const row = (await leaveAt(id, A))[0]
  const r = row ? await L.lengthenOnInputs(w, row.iid, A, A2, 'rr-b0-a-window') : 'no leave'
  const after = (await L.warLeave(w, id)).find(x => x.iid === row?.iid)
  await L.shot(w, 'rr-b0-b-saved')
  L.rec('RR-B0 the live lengthening over his pending bid, after his delete', SIZE, ap && bid && del && r === 'saved' && after?.end === L.inWords(A2) ? 'PASS' : 'FAIL',
    `approved ${ap}; pending bid on ${L.dm(A2)} ${bid}; deleted ${del}; window ${r}; the leave now ${after?.date}–${after?.end}`, ['rr-b0-a-window', 'rr-b0-b-saved'])
}

/* ---------- RR-B — finding B: lengthened over his pending bid, Undo, he is deleted, Redo ---------- */
if (want('rr-b')) {
  await world()
  const id = await pidOf('Drifter')
  const ap = await approvedOn(id, A)
  const bid = await L.pendingLL(w, id, A2)
  const row = (await leaveAt(id, A))[0]
  const r = row ? await L.lengthenOnInputs(w, row.iid, A, A2) : 'no leave'
  const len = (await L.warLeave(w, id)).find(x => x.iid === row?.iid)?.end === L.inWords(A2)
  /* the inputs door took his bid (it swaps a bid the leave now covers for a notice) — read on the grid */
  await L.toWar(w); await L.openGrid(w)
  const cellA2 = await L.cellInfo(P, id, A2)
  await L.undo(w)
  const undone = !(await L.warLeave(w, id)).find(x => x.iid === row?.iid)?.end
  const del = await L.deleteOnUsers(w, id)
  await L.goPage(w, 'inputs', 'Inputs')
  const offered = await L.redoOffered(w)
  await L.shot(w, 'rr-b-a-before-redo')
  await L.redo(w)
  const said = await L.lastSaid(w)
  const after = (await L.warLeave(w, id)).find(x => x.iid === row?.iid)
  await L.shot(w, 'rr-b-b-after-redo')
  L.rec('RR-B the Redo of an Inputs-page lengthening over his pending bid, after his delete', SIZE,
    ap && bid && r === 'saved' && len && undone && del && offered === true && after?.end === L.inWords(A2) && !said.some(s => DEL.test(s)) ? 'PASS' : 'FAIL',
    `approved ${ap}; bid ${bid}; lengthened ${len} (grid ${L.dm(A2)}: ${cellInfoWords(cellA2)}); Undo ${undone}; deleted ${del}; Redo offered ${offered}; after Redo ${after?.date}–${after?.end}; said ${JSON.stringify(said)}`, ['rr-b-a-before-redo', 'rr-b-b-after-redo'])
}
function cellInfoWords(c) { return c ? c.boxes.map(b => `${b.text}:${(b.cls.match(/s-[awr]/) || [''])[0]}`).join(',') || 'empty' : 'no cell' }

/* ---------- RR-C1 — must stay refused: approve, Undo, he is deleted on Admin → Users, Redo (the fix must not open it) ---------- */
if (want('rr-c1')) {
  await world()
  const id = await pidOf('Drifter')
  const ap = await approvedOn(id, A)
  await L.toWar(w); await L.undo(w)
  const undone = (await leaveAt(id, A)).length === 0
  const del = await L.deleteOnUsers(w, id)
  await L.toWar(w); await L.openGrid(w)
  const offered = await L.redoOffered(w)
  await L.redo(w)
  const n = (await leaveAt(id, A)).length
  await L.shot(w, 'rr-c1-after-redo')
  L.rec('RR-C1 the Redo of an approval after his delete stays refused', SIZE, ap && undone && del && n === 0 ? 'PASS' : 'FAIL',
    `approved ${ap}; Undo ${undone}; deleted ${del}; Redo offered ${offered}; his leave on ${L.dm(A)} after Redo ${n}`, ['rr-c1-after-redo'])
}

/* ---------- RR-C2 — must stay refused: approve a day in the gap, Undo, the posting runs late, Redo ---------- */
if (want('rr-c2')) {
  await world()
  const id = await pidOf('Drifter')
  const ap = await approvedOn(id, GAP)
  await L.toWar(w); await L.undo(w)
  const undone = (await leaveAt(id, GAP)).length === 0
  await L.postOutFrom(w, id, PO, 'delete')
  await L.toWar(w); await L.openGrid(w)
  const offered = await L.redoOffered(w)
  await L.redo(w)
  const n = (await leaveAt(id, GAP)).length
  await L.settle(w); await L.openApprovals(w)
  const i = await L.lineIdx(w, id, GAP)
  if (i >= 0) await L.apprPress(w, id, 'appr-approve', i)
  const live = i >= 0 ? await P.evaluate(([pid, n]) => { const ls = [...document.querySelectorAll(`[data-testid="approvals-page"] [data-testid="appr-line-${pid}"]`)].filter(e => e.getBoundingClientRect().height > 0); return ls[n]?.querySelector('[data-testid="appr-why"]')?.textContent.trim() || null }, [id, i]) : '(no line)'
  await L.shot(w, 'rr-c2-approvals')
  L.rec('RR-C2 the Redo of an approval of a refused day stays refused, as the live Approve', SIZE,
    ap && undone && n === 0 && /^He posted out on .*: refuse or delete it$/.test(live || '') ? 'PASS' : 'FAIL',
    `approved ${ap}; Undo ${undone}; Redo offered ${offered}; his leave on ${L.dm(GAP)} after Redo ${n}; the live Approve said "${live}"`, ['rr-c2-approvals'])
}

console.log('errors:', w?.errs.length ? w.errs : 'none')
L.writeResults('s1-' + SIZE)
await L.closeBrowser()
