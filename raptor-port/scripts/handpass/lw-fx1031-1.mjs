// Leave War fixes of 31 Oct 26 — scenario R1: a man posted out, then Redo of an approval (before-fix walk; re-run later as the re-walk).
// Steps: (a) pending LL on D = TODAY+10 · (b) Approve on Approvals · (c) top bar Undo once · (d) Post out (Overseas Sqn) dated
// TODAY+5 (R1) / TODAY-1 (R1b) · (e) Approvals' Approve on his D line · (f) top bar Redo. Records what the screen showed.
// Run from raptor-port:  SIZE=desk|phone  LW_DIST=<build>  [LW_OUT=<folder under docs/img/handpass>]  [ONLY=r1,r1b]
//   node scripts/handpass/lw-fx1031-1.mjs
process.env.LW_OUT ||= '2026-10-31-lw-fixes/before'
const L = await import('./lw-rr-lib.mjs')
const F = await import('./lw-fx1031-lib.mjs')
const SIZE = F.SIZE
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const want = id => !ONLY.length || ONLY.includes(id)
console.log('[lw-fx1031-1 v1]', SIZE, 'today', L.TODAY)
F.clearMine(`r1-${SIZE}-`); F.clearMine(`r1b-${SIZE}-`)
const D = L.day(10)
const errsAll = []

async function variant(tag, poDate) {
  const pre = `${tag}-${SIZE}-`
  const w = await F.world('admin'); const P = w.page
  const id = await L.pidOf(P, 'Drifter')
  const log = []
  const note = (k, v) => { log.push([k, v]); console.log(`  ${tag} ${k}:`, typeof v === 'string' ? v : JSON.stringify(v)) }
  note('who', `Drifter (${id}); D = ${D} (${L.dm(D)}), posting date asked ${poDate}`)
  note('his cell on D before', await F.cellWords(w, id, D))
  note('his war inputs before', await L.warLeave(w, id))
  /* (a) a pending LL */
  const okA = await L.pendingLL(w, id, D)
  await L.toWar(w); await L.openGrid(w); await L.reachCell(w, id, D)
  await L.rowShot(w, id, L.day(7), L.day(13), pre + 'a-pending-row')
  note('(a) placed pending LL', { placed: okA, cell: await F.cellWords(w, id, D) })
  /* (b) approve on Approvals */
  const lit = await L.approveOn(w, id, D)
  await L.toWar(w); await L.openGrid(w); await L.reachCell(w, id, D)
  await L.rowShot(w, id, L.day(7), L.day(13), pre + 'b-approved-row')
  note('(b) approved', { lit, cell: await F.cellWords(w, id, D), inputs: await L.warLeave(w, id) })
  /* (c) Undo once */
  const redo0 = await L.redoOffered(w)
  await L.undo(w)
  const sUndo = await L.lastSaid(w)
  await L.rowShot(w, id, L.day(7), L.day(13), pre + 'c-undone-row')
  const cellC = await F.cellWords(w, id, D), inC = await L.warLeave(w, id)
  await F.toApprovals(w)
  const linesC = await F.apprRead(w, id)
  await L.shot(w, pre + 'c-approvals-after-undo')
  note('(c) after Undo', { redoOfferedBefore: redo0, redoOffered: await L.redoOffered(w), said: sUndo, cell: cellC, inputs: inC, approvalsLines: linesC })
  /* (d) post him out, dated poDate */
  const po = await F.postOutOn(w, id, D, 'overseas', poDate, pre + 'd-postout-sheet')
  const cutAfter = await P.evaluate(id => { const p = window.PEOPLE[id]; return p ? { archived: !!p.archived, deleted: !!p.deleted, po: p.postOut || p.postingOut || null, keys: Object.keys(p).filter(k => /post|arch|delet|away|from/i.test(k)).map(k => k + '=' + JSON.stringify(p[k])) } : null }, id)
  note('(d) post out sheet', { ...po, personAfter: cutAfter, said: await L.lastSaid(w) })
  await L.toWar(w); await L.openGrid(w); await L.reachCell(w, id, D)
  await L.rowShot(w, id, L.day(3), L.day(13), pre + 'd-row-after-postout')
  /* (e) Approvals' Approve on his D line */
  await F.toApprovals(w)
  const linesE0 = await F.apprRead(w, id)
  await L.shot(w, pre + 'e-approvals-before-approve')
  const i = await L.lineIdx(w, id, D)
  const pressed = i >= 0 ? await L.apprPress(w, id, 'appr-approve', i) : false
  await P.waitForTimeout(400)
  const linesE1 = await F.apprRead(w, id)
  await L.shot(w, pre + 'e-approvals-after-approve')
  note('(e) Approve on his D line', { lineIndex: i, pressed, before: linesE0, after: linesE1, said: await L.lastSaid(w), inputs: await L.warLeave(w, id) })
  /* (f) Redo */
  await L.toWar(w); await L.openGrid(w)
  const btn = await P.evaluate(() => { const b = document.querySelector('#redoBtn'); return b ? { disabled: b.disabled, title: b.title || b.getAttribute('aria-label') } : null })
  const offered = await L.redoOffered(w)
  await L.shot(w, pre + 'f-before-redo')
  const hadSaid = (await P.evaluate(() => (window.__said || []).length))
  if (offered) await L.redo(w)
  const sRedo = await P.evaluate(n => (window.__said || []).slice(n), hadSaid)
  await L.toWar(w); await L.openGrid(w); await L.reachCell(w, id, D)
  await L.rowShot(w, id, L.day(3), L.day(13), pre + 'f-row-after-redo')
  note('(f) Redo', { button: btn, offered, saidDuringRedo: sRedo, cellOnD: await F.cellWords(w, id, D), warApprovedInputs: await L.warLeave(w, id) })
  await F.toApprovals(w)
  note('(f) Approvals after Redo', await F.apprRead(w, id))
  await L.shot(w, pre + 'f-approvals-after-redo')
  if (w.errs.length) errsAll.push(...w.errs.map(e => tag + ' ' + e))
  note('errors', w.errs.length ? w.errs : 'none')
  L.rec(`${tag.toUpperCase()} post out then Redo`, SIZE, 'RECORDED', log.map(([k, v]) => k + ': ' + (typeof v === 'string' ? v : JSON.stringify(v))).join(' || '), [])
  await w.ctx.close()
}

if (want('r1')) await variant('r1', L.day(5))
if (want('r1b')) await variant('r1b', L.day(-1))
L.writeResults(`r1-${SIZE}`)
console.log('ALL ERRORS:', errsAll.length ? errsAll : 'none')
await L.closeBrowser()
