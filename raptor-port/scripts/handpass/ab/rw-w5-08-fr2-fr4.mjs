/* W5 RE-WALK (26 Sep 26) — the final code reads' FR2 and FR4 on the post-out archive, walked through the app's own
   controls, the man's state read on the QUALS page (roster or Archived) as well as on the Leave War.
   Register §12: "The archive a Post out makes belongs to the posting. 'Undo post out' takes it back — the man's row, bids
   and leave come back; a date moved later, or 'Archive on PO date' turned off, puts him back on the roster until the
   posting archives him again. An archive made by hand on Quals is never taken back by a posting door."
   Today (the app's calendar) is 26 Sep 2026: a PO dated 1 Aug has come (archives at once, switch on); 15 Oct is to come.
     FR2a  Cobra   — PO 15 Aug (archived) → the posting sheet's date box to 15 Oct  → back on the roster at once
     FR2b  Gambit  — PO 15 Aug (archived) → the posting sheet's "Archive on PO date" OFF → back on the roster at once;
                     switched ON again → archived again (the date has come)
     FR2c  Wisp    — PO 15 Aug (archived) → date box to 18 Aug (still past) → stays archived (control)
     FR2d  Piston  — PO 1 Aug (archived) → the BID SHEET's PO again, from 20 Oct → back on the roster
     FR2e  Cinch   — PO 1 Aug (archived) → the DRAG-SELECTION's Post out, from 20 Oct → back on the roster
     FR4   Hunter  — PO 2 Nov (to come, not archived) → archived BY HAND on Quals → the posting sheet's Undo post out →
                     the date cleared, he STAYS archived
     FR4b  Drifter — PO 2 Nov → archived by hand → the posting sheet's date to 15 Dec, then the switch OFF → stays archived
     F2    Recon   — after all of that, one more Post out (LL 17 Jul, PO from 15 Jul): his July row is still drawn
   then a reload, and every man read again.
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/rw-w5-08-fr2-fr4.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'rewalk/w5'
const L = await import('./ab-lib.mjs')
const X = await import('./w5-lib.mjs')
const Q = await import('./rw-w5-lib.mjs')
const W3 = await import('./w3-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, closeSheets, fileInput, shot, toastSpy, toasts, resultBook, ROOT, rowRun, lwShot } = L
const PHONE = W === 'phone'
const R = resultBook(`RW-W5-08-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w5-08-${W}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 2 : 1 })
await toastSpy(page)
const pic = n => `rw-w5-08-${W}-${n}`
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await shot(page, pic('THREW-' + name)).catch(() => {}) } }
const row = async (id, isos) => { await lwOpen(page, isos[0]); return rowRun(page, id, isos) }
const onRosterOnly = q => q.onRoster && !q.inArchive
const archivedOnly = q => !q.onRoster && q.inArchive

/* FR2a — the date moved to one still to come */
await step('FR2a', async () => {
  const id = 'taipan'
  const po = await Q.postOutBid(page, id, '2026-07-28', '2026-08-15', true)
  const q0 = await Q.quals(page, id, pic('FR2a-1-quals-after-po'))
  await lwOpen(page, '2026-08-20')
  const s = await Q.postingSheet(page, id, '2026-08-20', { date: '2026-10-15' }, { before: pic('FR2a-2-posting-sheet'), after: pic('FR2a-3-after-date-to-15-oct') })
  const q1 = await Q.quals(page, id, pic('FR2a-4-quals-after-move'))
  const r = await row(id, ['2026-09-14', '2026-10-14', '2026-10-15'])
  await lwShot(page, pic('FR2a-5-war-after-move'), id, '2026-10-14')
  R.ck('FR2a-archived-first', po.done && archivedOnly(q0) && q0.stored.archivedBy === 'po', 'posted out from 15 Aug (switch on — the default): archived at once, in the Quals Archived section', { po, q0 })
  R.ck('FR2a-back-on-roster', /2026-10-15/.test(s.after.text) && onRosterOnly(q1) && !/NO CELL/.test(r.join(' ')) && /PO/.test(r[2]) && !/PO/.test(r[0]),
    'the posting sheet\'s date moved to 15 Oct (still to come): he is back on the Quals ROSTER at once; the war draws him in from 14 Sep, hatched from 15 Oct (FR2)', { sheet: s, q1, row: r })
  /* the war's Undo / Redo after the move — RECORD, and the two pages must agree */
  await lwOpen(page, '2026-10-14')
  const u = await X.undo(page)
  const qu = await Q.quals(page, id)
  const ru = await row(id, ['2026-08-20', '2026-10-14', '2026-10-15'])
  await lwShot(page, pic('FR2a-6-war-after-undo'), id, '2026-08-20')
  const rd = await X.redo(page)
  const qr = await Q.quals(page, id)
  const rr = await row(id, ['2026-08-20', '2026-10-14', '2026-10-15'])
  R.note('FR2a-undo-redo-RECORD', { undo: u, afterUndo: { q: qu, row: ru }, redo: rd, afterRedo: { q: qr, row: rr } })
  const agree = (q, rw) => (onRosterOnly(q) && !/PO/.test(rw[0])) || (archivedOnly(q) && /PO/.test(rw[0]))
  R.ck('FR2a-undo-redo-agree', agree(qu, ru) && agree(qr, rr), 'after the war\'s Undo and its Redo, Quals and the war agree about him (archived ⇔ posted out on 20 Aug)', { qu: [qu.onRoster, qu.inArchive], ru, qr: [qr.onRoster, qr.inArchive], rr })
})

/* FR2b — "Archive on PO date" turned off, then on again */
await step('FR2b', async () => {
  const id = 'bruise'
  const po = await Q.postOutBid(page, id, '2026-07-28', '2026-08-15', true)
  const q0 = await Q.quals(page, id)
  await lwOpen(page, '2026-08-20')
  const s = await Q.postingSheet(page, id, '2026-08-20', { flip: true }, { after: pic('FR2b-1-after-switch-off') })
  const q1 = await Q.quals(page, id, pic('FR2b-2-quals-after-switch-off'))
  const r1 = await row(id, ['2026-08-13', '2026-08-15', '2026-08-20'])
  R.ck('FR2b-back-on-roster', po.done && archivedOnly(q0) && /Stays on the Quals roster/.test(s.after.text) && onRosterOnly(q1) && /PO/.test(r1[1]),
    '"Archive on PO date" turned OFF on the posting sheet: he is back on the Quals roster at once; his posting still stands from 15 Aug (FR2)', { q0: [q0.onRoster, q0.inArchive], opened: s.opened, sheet: s.after.text, q1, r1 })
  await lwOpen(page, '2026-08-20')
  const s2 = await Q.postingSheet(page, id, '2026-08-20', { flip: true })
  const q2 = await Q.quals(page, id, pic('FR2b-3-quals-after-switch-on-again'))
  R.ck('FR2b-archived-again', /Moves to the Quals archive/.test(s2.after.text) && archivedOnly(q2) && q2.stored.archivedBy === 'po', 'the switch ON again, the date (15 Aug) already come: the posting archives him again', { sheet: s2.after.text, q2 })
})

/* FR2c — control: the date moved to one still past keeps the archive */
await step('FR2c', async () => {
  const id = 'shrek'
  await Q.postOutBid(page, id, '2026-07-28', '2026-08-15', true)
  await lwOpen(page, '2026-08-20')
  const s = await Q.postingSheet(page, id, '2026-08-20', { date: '2026-08-18' })
  const q = await Q.quals(page, id, pic('FR2c-quals-after-move-to-10-aug'))
  R.note('FR2c-posting-sheet', s)
  R.ck('FR2c-stays-archived', s.opened === 'postout-sheet' && /2026-08-18/.test(s.after.text) && archivedOnly(q), 'the date moved to 18 Aug — still past: the archive stands (Quals Archived section)', { sheet: s.after.text, q })
})

/* FR2d — the bid sheet's PO again, on a man the Post out has archived */
await step('FR2d', async () => {
  const id = 'pump'
  await Q.postOutBid(page, id, '2026-07-28', '2026-08-01', true)
  const q0 = await Q.quals(page, id)
  const po2 = await Q.postOutBid(page, id, '2026-07-20', '2026-10-20', true)
  const q1 = await Q.quals(page, id, pic('FR2d-quals-after-bidsheet-po-to-20-oct'))
  const r = await row(id, ['2026-09-14', '2026-10-19', '2026-10-20'])
  await lwShot(page, pic('FR2d-war'), id, '2026-10-19')
  R.ck('FR2d-back-on-roster', archivedOnly(q0) && po2.done && onRosterOnly(q1) && !/PO/.test(r[0]) && /PO/.test(r[2]), 'the bid sheet\'s PO moved the posting to 20 Oct: back on the Quals roster at once, hatched from 20 Oct', { q0: [q0.onRoster, q0.inArchive], po2, q1, r })
})

/* FR2e — the drag-selection's Post out */
await step('FR2e', async () => {
  const id = 'snap'
  await Q.postOutBid(page, id, '2026-07-28', '2026-08-01', true)
  const q0 = await Q.quals(page, id)
  await lwOpen(page, '2026-07-20')
  const sel = await W3.dragRect(page, id, '2026-07-20', id, '2026-07-21')
  let c = { pressed: false, why: 'opened ' + sel.open }
  if (sel.open === 'select-sheet') {
    await W3.selPress(page, 'sel-postout')
    await page.locator('[data-testid="sel-po-date"]').fill('2026-10-20'); await page.waitForTimeout(300)
    await shot(page, pic('FR2e-1-selection-post-out'))
    c = await W3.selPress(page, 'sel-po-confirm')
  }
  await closeSheets(page)
  const q1 = await Q.quals(page, id, pic('FR2e-2-quals-after-selection-po'))
  const r = await row(id, ['2026-09-14', '2026-10-19', '2026-10-20'])
  R.ck('FR2e-back-on-roster', archivedOnly(q0) && c.pressed && onRosterOnly(q1) && /PO/.test(r[2]) && !/PO/.test(r[0]), 'the drag-selection\'s Post out from 20 Oct: back on the Quals roster at once', { sel: sel.open, c: c.note || c.why, q1, r })
})

/* FR4 — a man archived BY HAND on Quals, with a Post out still to come: the posting sheet's Undo keeps him archived */
await step('FR4', async () => {
  const id = 'prowler'
  const po = await Q.postOutBid(page, id, '2026-07-28', '2026-11-02', true)
  const q0 = await Q.quals(page, id)
  const a = await Q.archiveByHand(page, id, pic('FR4-1-quals-x-before-archive'))
  const q1 = await Q.quals(page, id, pic('FR4-2-quals-archived-by-hand'))
  const r1 = await row(id, ['2026-10-30', '2026-11-02', '2026-11-10'])
  await lwShot(page, pic('FR4-3-war-after-hand-archive'), id, '2026-11-10')
  await lwOpen(page, '2026-11-10')
  const s = await Q.postingSheet(page, id, '2026-11-10', { undo: true }, { before: pic('FR4-4-posting-sheet') })
  const q2 = await Q.quals(page, id, pic('FR4-5-quals-after-undo-post-out'))
  await lwOpen(page, '2026-11-10')
  const r2 = await rowRun(page, id, ['2026-10-30', '2026-11-02', '2026-11-10'])
  await shot(page, pic('FR4-6-war-after-undo-post-out'))
  R.note('FR4-setup', { po, q0: [q0.onRoster, q0.inArchive], hand: a, q1, war: r1 })
  R.ck('FR4-stays-archived', onRosterOnly(q0) && archivedOnly(q1) && q1.stored.archivedBy === '' && s.opened === 'postout-sheet' && s.undo && archivedOnly(q2),
    'archived BY HAND on Quals, a Post out to come (2 Nov): the posting sheet\'s "Undo post out" clears the date and he STAYS archived — Quals Archived section, not the roster (FR4)', { sheet: s.opened, undo: s.undo, q2 })
  R.note('FR4-war-after-RECORD', { row: r2, note: 'a man archived by hand with no posting is not on the war (the Quals ✕ = "should never have been here")' })
})

/* FR4b — the same hand archive is not taken back by the date box or the switch */
await step('FR4b', async () => {
  const id = 'slipway'
  await Q.postOutBid(page, id, '2026-07-20', '2026-11-02', true)
  await Q.archiveByHand(page, id)
  const q0 = await Q.quals(page, id)
  await lwOpen(page, '2026-11-10')
  const s1 = await Q.postingSheet(page, id, '2026-11-10', { date: '2026-12-15' })
  const q1 = await Q.quals(page, id, pic('FR4b-1-quals-after-date-to-15-dec'))
  await lwOpen(page, '2026-12-20')
  const s2 = await Q.postingSheet(page, id, '2026-12-20', { flip: true })
  const q2 = await Q.quals(page, id, pic('FR4b-2-quals-after-switch-off'))
  R.ck('FR4b-hand-archive-stands', archivedOnly(q0) && s1.opened === 'postout-sheet' && archivedOnly(q1) && s2.opened === 'postout-sheet' && archivedOnly(q2),
    'archived by hand: moving his posting date (15 Dec) and turning "Archive on PO date" off never put him back on the roster', { q0: q0.stored, s1: s1.after, q1: [q1.onRoster, q1.inArchive], s2: s2.after, q2: [q2.onRoster, q2.inArchive] })
})

/* F2 — one more Post out in this sitting keeps the man's row */
await step('F2-later-postout', async () => {
  const id = 'prism'
  await fileInput(page, { person: id, type: 'LL', from: '2026-07-17', remarks: 'W5 rewalk F2' })
  const po = await Q.postOutBid(page, id, '2026-07-10', '2026-07-15', true)
  const r = await row(id, ['2026-07-13', '2026-07-14', '2026-07-17'])
  await lwShot(page, pic('F2-later-postout-recon'), id, '2026-07-14')
  R.ck('F2-row-kept', po.done && !r.some(x => /NO CELL/.test(x)) && /PO/.test(r[2]), 'after the undos and moves above, a later Post out keeps the man\'s July row, his 17 Jul LL with the PO tag (W5-F2)', { po, r })
})

/* a reload, and every man read again */
await step('reload', async () => {
  const rl = await X.reload(page, 'a')
  const want = { taipan: 'roster', bruise: 'archive', shrek: 'archive', pump: 'roster', snap: 'roster', prowler: 'archive', slipway: 'archive' }
  const got = {}
  for (const id of Object.keys(want)) { const q = await Q.quals(page, id); got[id] = onRosterOnly(q) ? 'roster' : archivedOnly(q) ? 'archive' : `BOTH/NEITHER ${q.onRoster}/${q.inArchive}` }
  await Q.quals(page, 'prowler', pic('reload-quals'))
  const rp = await row('prism', ['2026-07-13', '2026-07-14', '2026-07-17'])
  R.ck('reload-keeps', JSON.stringify(got) === JSON.stringify(want) && !rp.some(x => /NO CELL/.test(x)), 'a reload keeps every man where the steps left him (Quals roster / Archived), and Recon\'s row', { rl, got, want, recon: rp })
})

R.note('toasts', await toasts(page))
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
