/* RW-W3-09 — the re-walk's NEW script for the final code reads' findings in W3's ground (26 Sep 26, the rebuilt app):
   register §12 "Undo and Redo obey the bid rule" and "A dragged block's Delete takes the war's own bids beneath …".
     FR1  Refuse a bid, Ack it, Undo (back to refused), file a medical on its day on the Inputs page, Redo → refused BY
          NAME ("…ATT C now holds 2 Dec, and a bid can't go over it"); the bid stays refused.
     F8b  a bid, then a medical filed on its day on the Inputs page (the bid gives way), then ONE Undo → the medical goes
          and the bid comes back (W3-F8's second half: "undoing a filing that replaced a bid still gives the bid back").
     FR5  a dragged block's Delete over a morning the WAR approved plus an afternoon bid on the same day takes BOTH.
   Everything through the app's own controls (the bid sheet, the Inputs form, the war's Undo / Redo, a mouse drag);
   reads of the saved world are for the table only. Pictures to rewalk/w3; results to
   docs/handpass/parts/2026-09-26-absence-rewalk-w3-09-<width>.txt.
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/rw-w3-09-restore.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'rewalk/w3'
const L = await import('./w3-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, bidOn, tapCell, sheetPress, closeSheets, sheetNow, fileInput, inputsOf, shot, resultBook, ROOT, toastSpy, toasts,
  recsOf, lwHist, lwCell, dragRect, selPress } = L
const PHONE = W === 'phone'
const R = resultBook(`RW-W3-09-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w3-09-${W}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 3 : 1 })
await toastSpy(page)
R.note('bundle', await page.evaluate(() => [...document.scripts].map(s => s.src).filter(s => /index-/.test(s)).join(' ')))
const pic = (n) => shot(page, `rw-w3-09-${W}-${n}`)
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await pic(`THREW-${name}`).catch(() => {}); await closeSheets(page).catch(() => {}) } }
const rec = async (p, d) => (await recsOf(page, p, [d]))[d]
const inp = async (p, re) => (await inputsOf(page, p)).filter(x => re.test(x.date)).map(x => `${x.type} ${x.date}${x.allday ? '' : ' ' + x.s + '-' + x.e} lw=${x.lw ? 'y' : 'n'} "${x.remarks}"`)
const toastNow = async () => page.evaluate(() => { const t = document.getElementById('toastEl'); return t && getComputedStyle(t).opacity !== '0' ? t.textContent : '' })

/* ---- FR1: a refused bid is not made live again by Redo over a medical filed since ---- */
await step('FR1', async () => {
  const P = 'mamba', D = '2026-12-02'   // Sidewinder, Wed 2 Dec 26 (JAN–DEC 26, OPEN)
  await lwOpen(page, '2026-12-01')
  const b = await bidOn(page, P, D, 'LL')
  const t1 = await tapCell(page, P, D); const rf = await sheetPress(page, 'decide-refuse'); await closeSheets(page)
  const r1 = await rec(P, D)
  const t2 = await tapCell(page, P, D)
  await pic('FR1-a-refused-bid-sheet')
  const ak = await sheetPress(page, 'decide-ack'); await closeSheets(page)
  const r2 = await rec(P, D)
  const u = await lwHist(page, 'undo')
  const r3 = await rec(P, D)
  R.note('FR1-setup', { placed: b.placed, refuseOpened: t1.open, refused: rf.pressed, afterRefuse: r1, refusedSheetButtons: t2.buttons, acked: ak.pressed, afterAck: r2, undo: u.title, afterUndo: r3 })
  R.ck('FR1-setup-reached', /refused/.test(r1) && !/refused/.test(r2) && /refused/.test(r3), 'a refused bid, acknowledged, then undone back to refused — reached through the sheet and the war\'s Undo', { r1, r2, r3 })
  await toasts(page)   // drain
  const f = await fileInput(page, { person: P, type: 'ATT C', from: D, remarks: 'RW FR1 medical' })
  await lwOpen(page, '2026-12-01')
  const r4 = await rec(P, D)
  const rb = page.locator('[data-testid="lw-redo"]:visible').first()
  const redoOn = !(await rb.isDisabled()), title = await rb.getAttribute('title')
  let pressed = null, seen = ''
  if (redoOn) { await rb.click(); await page.waitForTimeout(250); seen = await toastNow(); await page.waitForTimeout(600); pressed = true }
  const tt = await toasts(page)
  await pic('FR1-b-after-redo')
  const r5 = await rec(P, D)
  const c5 = await lwCell(page, P, D)
  const s5 = await tapCell(page, P, D)
  await pic('FR1-c-after-redo-tap')
  await closeSheets(page)
  R.note('FR1-after', { filed: f.added, asked: f.asked, afterMedical: r4, redoOn, title, pressed, toastSeen: seen, toasts: tt, afterRedo: r5, cell: c5, tap: { open: s5.open, lines: s5.lines, text: (s5.text || '').slice(0, 300) } })
  R.ck('FR1-refused-by-name', !redoOn || tt.concat(seen).some(x => /ATT C/.test(x) && /2 Dec/.test(x) && /can.t go over/i.test(x)),
    'Redo (which would turn the refused bid back into an acknowledged one over the ATT C) is refused BY NAME — "…ATT C now holds 2 Dec, and a bid can\'t go over it" (FR1, register §12)', { redoOn, toasts: tt, seen })
  R.ck('FR1-bid-stays-refused', /refused/.test(r5) && !/acknowledged|pending/.test(r5), 'the bid stays refused — nothing live stands on the medical day', { afterRedo: r5, cell: c5 })
})

/* ---- F8b: undoing a filing that replaced a bid gives the bid back, in one step ---- */
await step('F8b', async () => {
  const P = 'shrek', D = '2026-12-03'   // Wisp, Thu 3 Dec 26
  await lwOpen(page, '2026-12-01')
  const b = await bidOn(page, P, D, 'LL')
  const r0 = await rec(P, D)
  await toasts(page)
  const f = await fileInput(page, { person: P, type: 'ATT C', from: D, remarks: 'RW F8b medical' })
  const ft = await toasts(page)
  await lwOpen(page, '2026-12-01')
  const r1 = await rec(P, D), i1 = await inp(P, /Dec 3/)
  await L.lwShot(page, `rw-w3-09-${W}-F8b-a-medical-replaced-bid`, P, D)
  const u = await lwHist(page, 'undo')
  await lwOpen(page, '2026-12-01')
  const r2 = await rec(P, D), i2 = await inp(P, /Dec 3/)
  const c2 = await lwCell(page, P, D)
  await L.lwShot(page, `rw-w3-09-${W}-F8b-b-after-one-undo`, P, D)
  R.note('F8b', { placed: b.placed, before: r0, filed: f.added, filingToasts: ft, afterFiling: r1, inputsAfterFiling: i1, undo: u.title, afterUndo: r2, inputsAfterUndo: i2, cell: c2 })
  R.ck('F8b-bid-gives-way', /request:LL/.test(r0) && !/request:LL\/pending/.test(r1) && i1.some(x => /^ATT C/.test(x)), 'filing the ATT C on the bid\'s day on the Inputs page: the medical stands and the bid gives way (the Inputs door\'s rule)', { r0, r1, i1 })
  R.ck('F8b-one-undo-gives-bid-back', /request:LL\/pending/.test(r2) && !i2.some(x => /^ATT C/.test(x)), 'ONE Undo takes the medical back AND gives the bid back (register §12 — the day judged as the restore will leave it)', { r2, i2, cell: c2 })
  const rd = await lwHist(page, 'redo')
  const r3 = await rec(P, D), i3 = await inp(P, /Dec 3/)
  R.ck('F8b-redo-refiles', i3.some(x => /^ATT C/.test(x)) && !/request:LL\/pending/.test(r3), 'Redo files the medical again and the bid gives way again', { redo: rd.title, r3, i3 })
})

/* ---- FR5: a dragged block's Delete takes a WAR-approved morning AND the afternoon bid beside it ---- */
await step('FR5', async () => {
  const P = 'bruise', D = '2026-12-04', D2 = '2026-12-07'   // Gambit, Fri 4 Dec → Mon 7 Dec 26
  await lwOpen(page, '2026-12-01')
  const b1 = await bidOn(page, P, D, 'LL', { portion: 'am' })
  const t = await tapCell(page, P, D); const ap = await sheetPress(page, 'decide-approve'); await closeSheets(page)
  const i0 = await inp(P, /Dec 4/)
  const t2 = await tapCell(page, P, D)
  await pic('FR5-a-sheet-after-am-approved')
  await closeSheets(page)
  const b2 = await bidOn(page, P, D, 'LL', { portion: 'pm' })
  const r1 = await rec(P, D), i1 = await inp(P, /Dec 4/), c1 = await lwCell(page, P, D)
  await L.lwShot(page, `rw-w3-09-${W}-FR5-b-before`, P, D)
  R.note('FR5-setup', { am: b1.placed, amWhy: b1.why, approveOpened: t.open, approved: ap.pressed, inputsAfterApprove: i0, tapAfterApprove: { open: t2.open, buttons: t2.buttons }, pm: b2.placed, pmWhy: b2.why, recs: r1, inputs: i1, cell: c1 })
  R.ck('FR5-setup-reached', i1.some(x => /^LL Dec 4 0-720 lw=y/.test(x) || (/^LL Dec 4/.test(x) && /lw=y/.test(x))) && /request:LL/.test(r1), 'a morning the WAR approved (an Input carrying the war\'s mark) and an afternoon bid on the same day', { i1, r1, cell: c1 })
  const sel = await dragRect(page, P, D, P, D2)
  const d1 = await selPress(page, 'sel-delete')
  const d2 = await selPress(page, 'sel-delete')
  await pic('FR5-c-delete-note')
  await closeSheets(page)
  const r2 = await rec(P, D), i2 = await inp(P, /Dec 4/), c2 = await lwCell(page, P, D)
  await L.lwShot(page, `rw-w3-09-${W}-FR5-d-after-delete`, P, D)
  R.note('FR5-delete', { sel: sel.open, selText: (sel.text || '').slice(0, 120), confirm: d1.note, note: d2.note, recs: r2, inputs: i2, cell: c2 })
  R.ck('FR5-both-gone', !/request/.test(r2) && !i2.some(x => /^LL Dec 4/.test(x)), 'the dragged block\'s Delete takes BOTH — the war-approved morning (its Input) and the afternoon bid (FR5, register §12)', { recs: r2, inputs: i2, cell: c2, note: d2.note })
  const u = await lwHist(page, 'undo')
  const r3 = await rec(P, D), i3 = await inp(P, /Dec 4/)
  R.ck('FR5-one-undo-back', /request:LL/.test(r3) && i3.some(x => /^LL Dec 4/.test(x) && /lw=y/.test(x)), 'one Undo brings both back', { undo: u.title, r3, i3 })
})
R.note('toasts', await toasts(page))
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
