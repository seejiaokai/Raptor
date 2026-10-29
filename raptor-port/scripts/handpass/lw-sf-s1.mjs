// The small fixes of 30 Oct 26 — fix 1, [LW-DELETED-NO-ROW-APPROVE]: a deleted man's leftover pending bid is never approved.
// Scenarios S1-1 to S1-9 of docs/superpowers/briefs/2026-10-30-lw-small-fixes-scenarios.md, through the app's own controls
// (Admin → Users, the bid window, the post sheets, Approvals, the top bar's Undo / Redo). Written as the right behaviour.
// SIZE=desk (his PC, default) or phone (WebKit 402). ONLY=s1-1,s1-2… runs some.
process.env.LW_OUT ||= '2026-10-30-lw-small-fixes/s1'
const L = await import('./lw-sf-lib.mjs')
const { T } = L
const SIZE = process.env.SIZE || 'desk'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const want = id => !ONLY.length || ONLY.includes(id)
console.log('[lw-sf-s1 v2]', SIZE, ONLY.join(',') || 'all')
L.clearOut()
const TODAY = new Date(); const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const addD = (s, n) => { const d = new Date(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)); d.setDate(d.getDate() + n); return iso(d) }
const today = iso(TODAY)
const POSTED = 'Posted out — refuse or delete it'

let w = null, P = null
async function world() {
  if (w) await w.ctx.close()
  w = await L.newCtx(SIZE === 'phone' ? 'phone' : 'desk'); P = w.page
  await L.signIn(w, 'admin')
}
/* ---- Admin → Users ---- */
async function adminUsers() {
  await P.evaluate(() => window.go('admin')); await P.waitForTimeout(400)
  const back = P.locator('#page-admin .adm-back')
  if (await back.count() && await back.first().isVisible()) await back.first().click()
  await P.evaluate(() => { const b = [...document.querySelectorAll('#page-admin button')].find(b => b.getBoundingClientRect().width > 0 && /^Users/.test((b.textContent || '').trim())); if (b) b.click() })
  await P.waitForTimeout(400)
}
async function pickDate(sel, want) {
  await L.press(w, sel); await P.waitForSelector(T('dcal-card'))
  const target = +want.slice(0, 4) * 12 + +want.slice(5, 7)
  for (let i = 0; i < 40; i++) {
    const at = await P.locator(T('dcal')).getAttribute('data-month')
    const d = target - (+at.slice(0, 4) * 12 + +at.slice(5, 7))
    if (!d) break
    await L.press(w, d > 0 ? T('dcal-next') : T('dcal-prev'))
  }
  await L.press(w, T(`dcal-day-${want}`)); await P.waitForTimeout(300)
  return P.locator(sel).getAttribute('data-value')
}
async function addPerson(cs, postIn) {
  await adminUsers()
  await P.locator('#accAddCs').scrollIntoViewIfNeeded()
  await P.fill('#accAddCs', cs); await P.fill('#accAddIni', cs.slice(0, 2).toUpperCase())
  const seats = await P.locator('#accAddSeat option').evaluateAll(os => os.map(o => ({ v: o.value, t: o.textContent })))
  const pilot = seats.find(o => /pilot/i.test(o.t)) || seats.find(o => o.v)
  await P.selectOption('#accAddSeat', pilot.v); await P.waitForTimeout(150)
  const opts = await P.locator('#accAddCat option').evaluateAll(os => os.map(o => o.value))
  if (opts.includes('C')) await P.selectOption('#accAddCat', 'C')
  const got = await pickDate('#accAddPostIn', postIn)
  await L.press(w, '#accAdd'); await P.waitForTimeout(600)
  await L.shot(w, 'add-' + cs)
  const pid = await L.pidOf(P, cs)
  console.log(`   added ${cs} (post-in box ${got}) → ${pid}`)
  return pid
}
async function deleteOnUsers(pid) {
  await adminUsers()
  const row = P.locator(`#accList [data-person="${pid}"] .acc-main`)
  await row.scrollIntoViewIfNeeded(); await L.press(w, `#accList [data-person="${pid}"] .acc-main`); await P.waitForTimeout(300)
  await L.press(w, '#accEdDel'); await P.waitForTimeout(200)
  const armed = await L.txt(P, '#accEdDel')
  await L.press(w, '#accEdDel'); await P.waitForTimeout(700)
  const deleted = await P.evaluate(pid => !!(window.PEOPLE[pid] && window.PEOPLE[pid].deleted), pid)
  console.log(`   delete armed "${armed}" → deleted ${deleted}`)
  return deleted
}
/* a pending LL by the admin on a day (Auto-approve off) — the bid window, or the post-in sheet's "Place leave or OIL here instead…" */
async function pendingLL(pid, day, type = 'LL') {
  await L.openWar(w); await L.openGrid(w)
  await L.openCell(w, pid, day)
  if (await L.vis(P, T('postin-place'))) await L.press(w, T('postin-place'))
  else if (await L.vis(P, T('postout-place'))) await L.press(w, T('postout-place'))
  await P.waitForTimeout(300)
  await L.autoApprove(w, false)
  const ok = await L.placeLeave(w, type)
  const c = await L.cellInfo(P, pid, day)
  return { ok, cell: c ? c.boxes.map(b => `${b.text}:${(b.cls.match(/s-[awr]/) || [''])[0]}`).join(',') : 'no cell' }
}
/* Post out → Delete from a day's own cell (its date is the box's), the confirm pressed twice (D287 (3)) */
async function postOutDelete(pid, day, pic) {
  await L.openWar(w); await L.openGrid(w)
  await L.openCell(w, pid, day)
  await L.press(w, T('bid-more')); await P.waitForTimeout(250); await L.press(w, T('bid-postout')); await P.waitForTimeout(400)
  await L.press(w, T('po-delete')); await P.waitForTimeout(200)
  const date = await P.locator(T('po-date')).getAttribute('data-value').catch(() => null)
  await L.press(w, T('po-confirm')); await P.waitForTimeout(250)
  if (pic) await L.shot(w, pic)
  await L.press(w, T('po-confirm')); await P.waitForTimeout(700)
  await L.closeWin(w)
  return `PO from ${date}`
}
const linesOf = async pid => (await L.apprLines(P)).filter(l => l.who === pid)
const leaveInputs = async (pid, day) => (await L.inputsOf(P, pid)).filter(r => r.lw && /L/.test(r.type))
const whyOn = async (pid, n = 0) => P.evaluate(([pid, n]) => { const ls = [...document.querySelectorAll(`[data-testid="approvals-page"] [data-testid="appr-line-${pid}"]`)].filter(e => e.getBoundingClientRect().height > 0); const e = ls[n]?.querySelector('[data-testid="appr-why"]'); return e ? e.textContent.trim() : null }, [pid, n])
const lineIdx = async (pid, dayWord) => (await linesOf(pid)).findIndex(l => l.text.includes(dayWord))
const dm = s => `${+s.slice(8, 10)} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+s.slice(5, 7) - 1]}`

/* ---------- S1-1: a never-arrived man, deleted, his past pending bid ---------- */
if (want('s1-1')) {
  await world()
  const postIn = addD(today, SIZE === 'phone' ? 2 : 4), past = addD(today, SIZE === 'phone' ? -2 : -3)
  const id = await addPerson('NEWBY', postIn)
  const b = await pendingLL(id, past)
  await L.rowShot(w, id, addD(past, -2), addD(past, 2), 's1-1-a-pending')
  await L.openApprovals(w)
  const n0 = await L.tabCount(P)
  L.rec('S1-1 premise', SIZE, b.ok && /s-w/.test(b.cell) && (await linesOf(id)).length === 1 ? 'PASS' : 'FAIL', `NEWBY (post-in ${dm(postIn)}) pending LL on ${dm(past)}: cell ${b.cell}; Approvals count ${n0}`, ['s1-1-a-pending'])
  const del = await deleteOnUsers(id)
  await L.openWar(w); await L.openApprovals(w)
  const n1 = await L.tabCount(P), ls = await linesOf(id)
  await L.shot(w, 's1-1-b-approvals-after-delete')
  const i = await lineIdx(id, String(+past.slice(8, 10)))
  await L.apprPress(w, id, 'appr-approve', Math.max(0, i), w.phone ? 's1-1-c-approve-q' : null)
  const why = await whyOn(id, Math.max(0, i)), inp = await leaveInputs(id)
  await L.shot(w, 's1-1-c-approve-pressed')
  L.rec('S1-1 Approve refused', SIZE, del && ls.length === 1 && why === POSTED && inp.length === 0 ? 'PASS' : 'FAIL',
    `deleted ${del}; count ${n0} → ${n1}; his line "${ls[0]?.text.slice(0, 70)}"; Approve said "${why}"; leave inputs written for him: ${inp.length}`, ['s1-1-b-approvals-after-delete', 's1-1-c-approve-pressed'])
  await L.apprPress(w, id, 'appr-refuse', Math.max(0, i))
  const after = (await linesOf(id))[0]
  await L.shot(w, 's1-1-d-refused')
  L.rec('S1-1 Refuse works', SIZE, after && after.lit === 'refused' ? 'PASS' : 'FAIL', `after Refuse: lit "${after?.lit}" "${after?.text.slice(0, 60)}"`, ['s1-1-d-refused'])
  L.rec('S1-1 the name the line shows', SIZE, 'RECORDED', `"${ls[0]?.text.slice(0, 40)}"; a man with no row has no cell to delete the bid from: Refuse is the way`, [])
  /* S1-9: his callsign given to a new man, the same day */
  if (want('s1-1')) {
    const id2 = await addPerson('NEWBY', postIn)
    const b2 = await pendingLL(id2, past)
    await L.openApprovals(w)
    const both = (await L.apprLines(P)).filter(l => l.who === id || l.who === id2)
    await L.shot(w, 's1-9-a-two-newbys')
    const j = await lineIdx(id2, String(+past.slice(8, 10)))
    await L.apprPress(w, id2, 'appr-approve', Math.max(0, j))
    const lit2 = (await linesOf(id2))[0]?.lit, inp2 = await leaveInputs(id2), inp1 = await leaveInputs(id)
    await L.shot(w, 's1-9-b-new-approved')
    L.rec('S1-9 the new NEWBY approves, the old stays refused', SIZE, b2.ok && lit2 === 'approved' && inp2.length === 1 && inp1.length === 0 ? 'PASS' : 'FAIL',
      `new id ${id2}; new line lit "${lit2}", his leave inputs ${inp2.length}; old man's ${inp1.length}; lines: ${both.map(l => `${l.who}: ${l.text.slice(0, 50)} [${l.lit}]`).join(' / ')}`, ['s1-9-a-two-newbys', 's1-9-b-new-approved'])
  }
}

/* ---------- S1-2: a Delete POSTING that has run — the date rule (D1447 R20) ---------- */
if (want('s1-2')) {
  await world()
  const id = await L.pidOf(P, 'Drifter')
  /* his records from the delete's cutoff (today) go with it (D299), so both bids are on days already past: one before the
     posting's date, one from it — the Delete posting dated four days ago, so it runs at once */
  const past = addD(today, -8), ahead = addD(today, -2), poDay = addD(today, -4)
  const a = await pendingLL(id, past), b = await pendingLL(id, ahead)
  const chips = await postOutDelete(id, poDay, 's1-2-a-postout-sheet')
  const gone = await P.evaluate(id => !!(window.PEOPLE[id] && window.PEOPLE[id].deleted), id)
  await L.openApprovals(w)
  const ia = await lineIdx(id, String(+past.slice(8, 10))), ib = await lineIdx(id, String(+ahead.slice(8, 10)))
  await L.apprPress(w, id, 'appr-approve', ia)
  const la = (await linesOf(id))[ia]
  const ib2 = await lineIdx(id, String(+ahead.slice(8, 10)))
  await L.apprPress(w, id, 'appr-approve', ib2)
  const whyB = await whyOn(id, ib2)
  await L.shot(w, 's1-2-b-approvals')
  L.rec('S1-2 a run Delete posting keeps the date rule', SIZE, a.ok && b.ok && gone && la?.lit === 'approved' && /^He posted out on .*: refuse or delete it$/.test(whyB || '') ? 'PASS' : 'FAIL',
    `${chips}; deleted by the posting ${gone}; ${dm(past)} line lit "${la?.lit}"; ${dm(ahead)} said "${whyB}"`, ['s1-2-a-postout-sheet', 's1-2-b-approvals'])
}

/* ---------- S1-3: a Delete posting set (not run), then deleted on Admin → Users ---------- */
if (want('s1-3')) {
  await world()
  const id = await L.pidOf(P, 'Drifter')
  const past = addD(today, -8), ahead = addD(today, -2)
  await pendingLL(id, past); await pendingLL(id, ahead)
  await postOutDelete(id, addD(today, 14), 's1-3-a-postout-set')
  const del = await deleteOnUsers(id)
  await L.openWar(w); await L.openApprovals(w)
  const n0 = (await leaveInputs(id)).length
  const ia = await lineIdx(id, String(+past.slice(8, 10)))
  await L.apprPress(w, id, 'appr-approve', ia); const whyA = await whyOn(id, ia)
  const ib = await lineIdx(id, String(+ahead.slice(8, 10)))
  await L.apprPress(w, id, 'appr-approve', ib); const whyB = await whyOn(id, ib)
  await L.shot(w, 's1-3-approvals')
  L.rec('S1-3 Delete posting set, then deleted on Admin → Users: both refused whole', SIZE, del && whyA === POSTED && whyB === POSTED && (await leaveInputs(id)).length === n0 ? 'PASS' : 'FAIL',
    `deleted ${del}; ${dm(past)} "${whyA}"; ${dm(ahead)} "${whyB}"`, ['s1-3-approvals'])
}

/* ---------- S1-4: a SANS man with SANS off still approves ---------- */
if (want('s1-4')) {
  await world()
  /* ⚙ → + SANS */
  await L.press(w, T('settings-open')).catch(() => {}); await P.waitForTimeout(400)
  const addSans = P.locator(T('gadd-SANS')).first()
  const had = await addSans.count()
  if (had) { await addSans.click(); await P.waitForTimeout(500) }
  await L.closeWin(w); await P.keyboard.press('Escape').catch(() => {})
  const sans = await P.evaluate(() => Object.keys(window.PEOPLE).filter(k => window.PEOPLE[k].san && !window.PEOPLE[k].archived && !window.PEOPLE[k].deleted && document.querySelector(`[data-testid="row-${k}"]`)))
  const id = sans[0]
  const day = addD(today, 9)
  const b = id ? await pendingLL(id, day) : { ok: false, cell: 'no SANS row' }
  /* SANS off: the group's ✕ */
  await L.press(w, T('settings-open')).catch(() => {}); await P.waitForTimeout(400)
  const x = P.locator(T('gdrop-SANS')).first()
  const xs = await P.locator('[data-testid*="sans"]').evaluateAll(es => es.map(e => e.dataset.testid))
  if (await x.count()) { await x.click(); await P.waitForTimeout(400) }
  await P.keyboard.press('Escape').catch(() => {}); await P.waitForTimeout(300)
  const rowGone = id ? !(await P.locator(T(`row-${id}`)).count()) : false
  await L.openApprovals(w)
  const i = id ? await lineIdx(id, String(+day.slice(8, 10))) : -1
  if (i >= 0) await L.apprPress(w, id, 'appr-approve', i)
  const l = id && i >= 0 ? (await linesOf(id))[i] : null
  await L.shot(w, 's1-4-approvals')
  L.rec('S1-4 SANS man, SANS off, approves', SIZE, b.ok && rowGone && l?.lit === 'approved' && (await leaveInputs(id)).length >= 1 ? 'PASS' : 'FAIL',
    `+SANS found ${!!had}; SANS row ${id}; bid ${b.cell}; sans test ids ${xs.slice(0, 6).join(',')}; row gone with SANS off ${rowGone}; line lit "${l?.lit}"`, ['s1-4-approvals'])
}

/* ---------- S1-6: Undo / Redo putting an approval back for a deleted man ---------- */
if (want('s1-6')) {
  await world()
  const postIn = addD(today, SIZE === 'phone' ? 2 : 4), past = addD(today, SIZE === 'phone' ? -2 : -3)
  const id = await addPerson('INCO', postIn)
  await pendingLL(id, past)
  await L.openApprovals(w)
  await L.apprPress(w, id, 'appr-approve', 0)
  const lit0 = (await linesOf(id))[0]?.lit
  await L.undo(w)
  const afterUndo = await leaveInputs(id)
  await deleteOnUsers(id)
  await L.openWar(w); await L.openApprovals(w)
  const redoOn = await P.evaluate(() => { const b = document.querySelector('#redoBtn'); return b ? !b.disabled : null })
  await L.redo(w)
  const afterRedo = await leaveInputs(id)
  const toast = await P.evaluate(() => [...document.querySelectorAll('#toastEl, .toast')].map(e => e.textContent.trim()).filter(Boolean).join(' | '))
  await L.shot(w, 's1-6-a-after-redo')
  L.rec('S1-6 (a) Redo after his delete', SIZE, lit0 === 'approved' && afterUndo.length === 0 && afterRedo.length === 0 ? 'PASS' : 'FAIL',
    `approved "${lit0}", Undo → inputs ${afterUndo.length}; Redo enabled ${redoOn}; after Redo his leave inputs ${afterRedo.length}; said "${toast}"`, ['s1-6-a-after-redo'])
  /* (b) approve, second tap on the lit Approve (back to pending), delete him, Undo */
  const id2 = await addPerson('INCB', postIn)
  await pendingLL(id2, past)
  await L.openApprovals(w)
  await L.apprPress(w, id2, 'appr-approve', 0)
  await L.apprPress(w, id2, 'appr-approve', 0)
  const back = (await leaveInputs(id2)).length
  await deleteOnUsers(id2)
  await L.openWar(w); await L.openApprovals(w)
  await L.undo(w)
  const afterU = await leaveInputs(id2)
  const toast2 = await P.evaluate(() => [...document.querySelectorAll('#toastEl, .toast')].map(e => e.textContent.trim()).filter(Boolean).join(' | '))
  await L.shot(w, 's1-6-b-after-undo')
  L.rec('S1-6 (b) Undo of a send-back after his delete', SIZE, back === 0 && afterU.length === 0 ? 'PASS' : 'FAIL',
    `after the second tap his inputs ${back}; after Undo ${afterU.length}; said "${toast2}"`, ['s1-6-b-after-undo'])
}

/* ---------- S1-7: a man deleted after arriving — every door ---------- */
if (want('s1-7')) {
  await world()
  const id = await L.pidOf(P, 'Drifter'), other = await L.pidOf(P, 'Ridge')   // the next row: a drag over the two
  const d1 = addD(today, -10), d2 = addD(today, -9)
  await pendingLL(id, d1); await pendingLL(id, d2); await pendingLL(other, d2)
  /* a second entry on d1: an HO award from the bid window's +OIL? keep the day's list for later — Grant OIL via the drag window */
  const del = await deleteOnUsers(id)
  await L.openWar(w); await L.openGrid(w)
  const n0 = (await leaveInputs(id)).length, o0 = (await leaveInputs(other)).length
  await L.reachCell(w, id, d1)
  const drawn = !!(await P.locator(T(L.cellId(id, d1))).count())
  let whyBid = null
  if (drawn) {
    await L.openCell(w, id, d1)
    await L.press(w, T('decide-approve')).catch(() => {}); await P.waitForTimeout(400)
    whyBid = (await L.txt(P, T('bid-picker'))) || ''
    await L.shot(w, 's1-7-a-bidwindow')
    await L.closeWin(w)
  }
  const c1 = await L.cellInfo(P, id, d1)
  L.rec('S1-7 bid window refuses', SIZE, del && drawn && whyBid.includes(POSTED) && (await leaveInputs(id)).length === n0 ? 'PASS' : 'FAIL',
    `deleted ${del}; his ${dm(d1)} drawn ${drawn}; window says "${(whyBid || '').slice(0, 160)}"; cell ${c1?.boxes.map(b => b.cls.match(/s-\w/)?.[0]).join(',')}`, ['s1-7-a-bidwindow'])
  /* the drag window over d2 with another man's bid in the selection */
  const opened = await L.dragCells(w, [id, d2], [other, d2])
  let note = ''
  if (opened) { await L.press(w, T('sel-approve')); await P.waitForTimeout(500); note = (await L.txt(P, T('select-sheet'))) || '' }
  await L.shot(w, 's1-7-b-dragwindow')
  await L.closeWin(w)
  const otherIn = (await leaveInputs(other)).length - o0
  L.rec('S1-7 drag window refuses him, approves the other', SIZE, opened && note.includes(POSTED) && otherIn === 1 && (await leaveInputs(id)).length === n0 ? 'PASS' : 'FAIL',
    `window opened ${opened}; said "${note.slice(0, 200)}"; other man's leave inputs ${otherIn}`, ['s1-7-b-dragwindow'])
  /* Auto-approve ON, a new LL on one of his kept past days (D321) */
  const d3 = addD(today, -12)
  await L.openCell(w, id, d3)
  await L.autoApprove(w, true)
  await L.placeLeave(w, 'LL')
  const c3 = await L.cellInfo(P, id, d3)
  const said3 = (await L.txt(P, T('bid-picker'))) || ''
  await L.rowShot(w, id, addD(d3, -1), addD(d3, 1), 's1-7-c-autoapprove')
  await L.closeWin(w)
  L.rec('S1-7 Auto-approve on a deleted man’s past day', SIZE, 'RECORDED', `cell ${c3?.boxes.map(b => `${b.text}:${b.cls.match(/s-\w/)?.[0]}`).join(',') || 'empty'}; window said "${said3.slice(0, 120)}"; his leave inputs ${(await leaveInputs(id)).length} (${n0} before)`, ['s1-7-c-autoapprove'])
}

/* ---------- S1-5: Approve all over a mixed list — NEWBY's leftover line, an ordinary man's, all the demo's ---------- */
if (want('s1-5')) {
  await world()
  const postIn = addD(today, SIZE === 'phone' ? 2 : 4), past = addD(today, SIZE === 'phone' ? -2 : -3)
  const id = await addPerson('NEWBY', postIn)
  await pendingLL(id, past)
  const R = 'bane'
  await pendingLL(R, addD(today, -6))
  await deleteOnUsers(id)
  await L.openWar(w); await L.openApprovals(w)
  const before = await L.apprLines(P)
  const allLeave = async () => P.evaluate(() => (window.INPUTS || []).filter(r => r && r.lw).length)
  const n0 = await allLeave()
  await L.press(w, T('appr-approve-all')); await P.waitForTimeout(300)
  await L.shot(w, 's1-5-a-armed')
  await L.press(w, T('appr-approve-all'), w.phone ? 's1-5-b-pressed-q' : null); await P.waitForTimeout(700)
  const after = await L.apprLines(P)
  const why = await whyOn(id, 0)
  const n1 = await allLeave()
  await L.shot(w, 's1-5-b-after')
  const mineLit = after.find(l => l.who === id)?.lit, rLit = after.filter(l => l.who === R).map(l => l.lit)
  await L.undo(w)
  const n2 = await allLeave()
  const back = await L.apprLines(P)
  await L.shot(w, 's1-5-c-undo')
  L.rec('S1-5 Approve all: his line answers for itself, the rest go through, one Undo', SIZE,
    why === POSTED && mineLit !== 'approved' && rLit.includes('approved') && n1 > n0 && n2 === n0 && (await leaveInputs(id)).length === 0 ? 'PASS' : 'FAIL',
    `${before.length} lines; NEWBY said "${why}" (lit "${mineLit}"); Ranger ${rLit.join(',')}; war-approved leave ${n0} → ${n1} → after one Undo ${n2}; lines lit after Undo ${back.filter(l => l.lit).length}`, ['s1-5-a-armed', 's1-5-b-after', 's1-5-c-undo'])
}

/* ---------- S1-7 the day's list: a deleted man's day holding his bid and an OIL award ---------- */
if (want('s1-7d')) {
  await world()
  const id = await L.pidOf(P, 'Drifter'), d1 = addD(today, -10)
  await pendingLL(id, d1, 'LL')
  /* a second entry: Grant OIL from the bid window's row (an award — D1394), on his own day, before the delete */
  await L.openCell(w, id, d1)
  const grant = P.locator(T('bid-oil-grant')).first()
  let granted = false
  for (const sel of ['bid-oil', 'bid-grant', 'bid-file-OIL']) if (!granted && await L.vis(P, T(sel))) { await L.press(w, T(sel)); granted = true }
  await P.waitForTimeout(300)
  await L.shot(w, 's1-7d-a-grant-window')
  await L.closeWin(w)
  L.rec('S1-7 the day’s list (fixture)', SIZE, 'RECORDED', `grant button found ${granted}; cell ${JSON.stringify((await L.cellInfo(P, id, d1))?.boxes.map(b => b.text))}`, ['s1-7d-a-grant-window'])
}

/* ---------- the blind read's finding 1: Redo of an Auto-approve placement after his delete (S1-6 c, d) ---------- */
if (want('s1-6c')) {
  await world()
  const postIn = addD(today, SIZE === 'phone' ? 2 : 4), past = addD(today, SIZE === 'phone' ? -2 : -3)
  const id = await addPerson('AUTO', postIn)
  /* the bid window from the post-in sheet's "Place leave or OIL here instead…", Auto-approve ON: it lands approved */
  await L.openWar(w); await L.openGrid(w)
  await L.openCell(w, id, past)
  if (await L.vis(P, T('postin-place'))) await L.press(w, T('postin-place'))
  await P.waitForTimeout(300)
  await L.autoApprove(w, true)
  await L.placeLeave(w, 'LL')
  const placed = await leaveInputs(id)
  await L.undo(w)
  const afterUndo = await leaveInputs(id)
  await deleteOnUsers(id)
  await L.openWar(w); await L.openGrid(w)
  const redoOn = await P.evaluate(() => { const b = document.querySelector('#redoBtn'); return b ? !b.disabled : null })
  await L.redo(w)
  const afterRedo = await leaveInputs(id)
  await L.shot(w, 's1-6c-after-redo')
  L.rec('S1-6 (c) Redo of an Auto-approve placement after his delete', SIZE, placed.length === 1 && afterUndo.length === 0 && afterRedo.length === 0 ? 'PASS' : 'FAIL',
    `placed approved ${placed.length}; after Undo ${afterUndo.length}; Redo offered ${redoOn}; after Redo his leave ${afterRedo.length}`, ['s1-6c-after-redo'])
}
/* ---------- the blind read's finding 2: a Delete posting that has run — the Redo of his day before the date (S1-2 b) ---------- */
if (want('s1-2b')) {
  await world()
  const id = await L.pidOf(P, 'Drifter')
  const past = addD(today, -8), poDay = addD(today, -4)
  await pendingLL(id, past)
  await L.openApprovals(w)
  const n0 = (await leaveInputs(id)).length
  await L.apprPress(w, id, 'appr-approve', await lineIdx(id, String(+past.slice(8, 10))))
  const n1 = (await leaveInputs(id)).length
  await L.undo(w)
  const n2 = (await leaveInputs(id)).length
  await postOutDelete(id, poDay, null)
  const gone = await P.evaluate(id => !!(window.PEOPLE[id] && window.PEOPLE[id].deleted), id)
  await L.openWar(w); await L.openGrid(w)
  const redoOn = await P.evaluate(() => { const b = document.querySelector('#redoBtn'); return b ? !b.disabled : null })
  await L.redo(w)
  const n3 = (await leaveInputs(id)).length
  const said = await P.evaluate(() => (window.__said || []).slice(-3))
  await L.shot(w, 's1-2b-after-redo')
  L.rec('S1-2 (b) a run Delete posting: the Redo of his day before the date goes back, as the live door approves it', SIZE,
    gone && n1 === n0 + 1 && n2 === n0 && n3 === n0 + 1 ? 'PASS' : 'FAIL', `his leave ${n0} → approved ${n1} → Undo ${n2}; deleted by the posting ${gone}; Redo offered ${redoOn} → ${n3}; said ${JSON.stringify(said)}`, ['s1-2b-after-redo'])
}

console.log('errors:', w?.errs.length ? w.errs : 'none')
L.writeResults('s1-' + SIZE)
await L.closeBrowser()
