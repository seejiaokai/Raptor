/* W5 RE-WALK (26 Sep 26) — BISECT of rw-w5-05's vanishing published-Friday pair (reproduced twice there, never in a
   single-prefix world of rw-w5-05e, and not with the canaries of rw-w5-05f). A copy of rw-w5-05 whose steps can be
   left out: RW_SKIP=A1,A2,A3,B,RELOAD,QUALS,FIGS,UNDO,DIAG,COUNTS (comma list; DIAG and COUNTS leave out the P-step's reads BEFORE the first Post out). Only the P-step's check matters here; its output
   file carries the skip list in its name. The Friday pair is fixed to the men rw-w5-05 picked (Drifter, Ace).
   W5 RE-WALK (26 Sep 26) of w5-05 on the rebuilt app (the fixes for W5-F1 / F2): the sheet's "Undo post out" now takes
   back the archive the Post out made — his row, bids and leave come back, and he is back on the Quals roster; a later
   Post out in the same sitting keeps the man's row (F2). Added to the copy: where the man stands on the Quals page after
   each posting step (roster or Archived), and a reload at the end. Everything else as the first walk.
   W5 — ORDER 5: POST OUT then FILE / FILE then POST OUT (Fable S11, Astra 9), with the two undos, redo and a reload; then
   the same pair on the PUBLISHED Friday 17 Jul. Assertions of the RIGHT behaviour.
   Rules: answer C and N8 (posting dates are official and gate NOTHING — leave after a posting-out is held, shown and
   charged), N12 (an admin's tap on a hatched day opens the posting sheet, with "Place leave or OIL here instead…" through to
   the bid sheet), the row stretches into a month the man has left (merge.ts spans — the 19 Aug "row disappears" narrowed),
   manning counts a posted-out man ZERO, once (N17), the leave shows with the PO tag, the sheet's own "Undo post out (PO)"
   clears the posting, and a posting is NOT on the one timeline (plan §9 R28) — what the top-bar Undo does is RECORDED.
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w5-05-postout-file.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'rewalk/w5'
const L = await import('./ab-lib.mjs')
const S = await import('./ab-sched.mjs')
const X = await import('./w5-lib.mjs')
const Q0 = await import('./rw-w5-lib.mjs')
const Q = { quals: (...a) => SKIP.has('QUALS') ? Promise.resolve({ onRoster: true, inArchive: false, skipped: true }) : Q0.quals(...a) }
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, tapCell, sheetPress, closeSheets, sheetNow, fileInput, inputsOf, shot, toastSpy, toasts, resultBook, ROOT, lwShot } = L
const { manning } = X
const undo = (p) => SKIP.has('UNDO') ? Promise.resolve({ pressed: false, why: 'skipped' }) : X.undo(p)
const redo = (p) => SKIP.has('UNDO') ? Promise.resolve({ pressed: false, why: 'skipped' }) : X.redo(p)
const reload = (p, w) => SKIP.has('RELOAD') ? Promise.resolve({ skipped: true }) : X.reload(p, w)
const snap = (p, id, isos, o = {}) => X.snap(p, id, isos, { ...o, figs: SKIP.has('FIGS') ? false : (o.figs ?? true) })
const PHONE = W === 'phone'
const SKIP = new Set((process.env.RW_SKIP || '').split(',').filter(Boolean))
const SK = [...SKIP].sort().join('+') || 'none'
const R = resultBook(`RW-W5-05g-${W}-skip-${SK}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w5-05g-${W}-skip-${SK}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 2 : 1 })
await toastSpy(page)
const GATE = { 'A-postout-then-file': 'A1', 'A-hatched-day-door': 'A2', 'A-undos': 'A3', 'B-file-then-postout': 'B' }
async function step(name, fn) { if (SKIP.has(GATE[name])) { R.note('SKIPPED', name); return } try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await shot(page, `rw-w5-05-${W}-THREW-${name}`).catch(() => {}) } }
const pic = n => `rw-w5-05g-${W}-skip-${SK}-${n}`
const SEP = ['2026-09-10', '2026-09-11', '2026-09-14']
const PO = '2026-08-01'
const lve = s => s && s.figs ? +s.figs.lve : NaN

/** Post a man out through the bid sheet's own PO row (tap a day inside his time → PO → date → archive on → Post out). */
async function postOut(id, tapIso, fromIso) {
  await lwOpen(page, tapIso)
  const t = await tapCell(page, id, tapIso)
  if (t.open !== 'bid-picker') { await closeSheets(page); return { done: false, why: 'opened ' + t.open } }
  await sheetPress(page, 'bid-postout')
  await page.locator('[data-testid="po-date"]').fill(fromIso); await page.waitForTimeout(200)
  const arch = page.locator('[data-testid="po-archive"]')
  if ((await arch.getAttribute('aria-pressed')) !== 'true') { await arch.click(); await page.waitForTimeout(150) }
  const p = await sheetPress(page, 'po-confirm')
  const after = await sheetNow(page)
  await closeSheets(page)
  return { done: p.pressed && after.open === 'nothing', said: after.text || '' }
}

/* ================= A. POST OUT then FILE (Cobra — taipan) */
const A = 'taipan', B = 'bruise'
let a0, a1, a2
await step('A-postout-then-file', async () => {
  await lwOpen(page, SEP[0])
  a0 = await snap(page, A, SEP)
  const man0 = await manning(page, SEP[0])
  const po = await postOut(A, '2026-07-28', PO)
  const qA = await Q.quals(page, A, pic('A0-quals-after-postout'))
  R.note('A-quals-after-postout', { ...qA, expect: 'archived at once — the PO date (1 Aug) has come and "Archive on PO date" is on (the default)' })
  await lwOpen(page, SEP[0])
  a1 = await snap(page, A, SEP)
  const man1 = await manning(page, SEP[0])
  const f = await fileInput(page, { person: A, type: 'LL', from: SEP[0], to: SEP[1], remarks: 'W5 clearing leave after PO' })
  await lwOpen(page, SEP[0])
  a2 = await snap(page, A, SEP)
  const man2 = await manning(page, SEP[0])
  await lwShot(page, pic('A1-postout-then-file-sep'), A, SEP[0])
  R.ck('A-row-stretches-PO-tag', po.done && f.added === 1 && a2.run[0] !== undefined && !/NO CELL/.test(a2.run[0]) && /LL/.test(a2.run[0]) && /\{PO\}/.test(a2.run[0]) && /LL/.test(a2.run[1]),
    'posted out from 1 Aug, then LL 10–11 Sep filed: September still draws Cobra\'s row, the days read LL with the PO tag', { po, run: a2.run })
  /* his September row is not drawn between the Post out and the leave (a row with nothing out there disappears — by
     design), so the charge is measured from before the Post out */
  R.ck('A-charged', lve(a2) === lve(a0) - 2, 'the leave after the posting-out still charges (−2)', { lve: [lve(a0), lve(a2)] })
  if (!Object.keys(man1).length || !Object.keys(man2).length) R.note('A-manning-unread', 'the count rows are folded at this width — read on the desktop run')
  else R.ck('A-manning-zero-once', JSON.stringify(man2) === JSON.stringify(man1), 'manning: the posting took him off (counted zero); the leave takes nothing more', { before: man0, afterPO: man1, afterLeave: man2 })
})
await step('A-hatched-day-door', async () => {
  await lwOpen(page, SEP[2])
  const t = await tapCell(page, A, SEP[2])
  await shot(page, pic('A2-hatched-day-posting-sheet'))
  const place = (t.buttons || []).find(b => /^postout-place/.test(b))
  R.ck('A-posting-sheet', t.open === 'postout-sheet' && !!place, 'an admin\'s tap on a blank hatched day opens the posting sheet, with "Place leave or OIL here instead…"', { open: t.open, buttons: t.buttons, text: (t.text || '').slice(0, 200) })
  if (!place) { await closeSheets(page); return }
  const p = await sheetPress(page, 'postout-place')
  await shot(page, pic('A3-place-leave-instead'))
  const opened = p.sheet && p.sheet.open
  let placed = false
  if (opened === 'bid-picker') {
    await sheetPress(page, 'bid-LL')
    let s = await sheetNow(page)
    if (s.open === 'bid-picker' && /Tap the same leave again/i.test(s.text)) { await sheetPress(page, 'bid-LL'); s = await sheetNow(page) }
    placed = s.open === 'nothing'
  }
  await closeSheets(page)
  const s3 = await snap(page, A, SEP)
  R.ck('A-place-through', opened === 'bid-picker' && placed && /LL/.test(s3.run[2]) && lve(s3) === lve(a2) - 1, '"Place leave or OIL here instead…" opens the bid sheet on that day; the LL lands and charges', { opened, placed, run: s3.run, lve: lve(s3) })
  a2 = s3
})
await step('A-undos', async () => {
  /* the top-bar Undo first (a posting is not on the timeline — RECORD what it does), then the sheet's own Undo post out */
  await lwOpen(page, SEP[0])
  const u = await undo(page)
  const su = await snap(page, A, SEP)
  R.note('A-topbar-undo-RECORD', { undo: u, run: su.run, lve: lve(su), note: 'the last timeline step was the Place-instead bid; the posting itself is not undoable there (R28)' })
  const r = await redo(page)
  R.note('A-topbar-redo-RECORD', { redo: r, run: (await snap(page, A, SEP, { figs: false })).run })
  await lwOpen(page, SEP[2])
  const t = await tapCell(page, A, '2026-09-15')
  let un = { pressed: false, why: 'opened ' + t.open }
  if (t.open === 'postout-sheet') un = await sheetPress(page, 'postout-undo')
  await closeSheets(page)
  await lwOpen(page, SEP[0])
  const s = await snap(page, A, SEP)
  await lwShot(page, pic('A4-after-undo-post-out'), A, SEP[0])
  R.ck('A-sheet-undo-postout', un.pressed && !s.run.some(x => /\{PO\}|NO CELL/.test(x)) && s.run.filter(x => /^\d\d-\d\d:LL/.test(x)).length === 3, '"Undo post out (PO)" clears the posting: his row still drawn, no PO tag, the leave kept', { un: un.pressed, run: s.run, lve: lve(s) })
  await lwOpen(page, '2026-07-28')
  const jul = await L.rowRun(page, A, ['2026-07-28', '2026-07-29'])
  await lwShot(page, pic('A4b-after-undo-post-out-jul'), A, '2026-07-28')
  const qU = await Q.quals(page, A, pic('A4c-quals-after-undo-post-out'))
  R.ck('A-sheet-undo-quals', qU.onRoster && !qU.inArchive && !/NO CELL/.test(jul.join(' ')), '"Undo post out" puts him back as he was: his July row drawn, and on the Quals ROSTER, not in its Archived section (W5-F1)', { jul, quals: qU })
  await lwOpen(page, SEP[0])
  const u2 = await undo(page)
  const s2 = await snap(page, A, SEP)
  await lwShot(page, pic('A5-topbar-undo-after-sheet-undo'), A, SEP[0])
  const qu2 = await Q.quals(page, A)
  R.note('A-topbar-undo-after-sheet-undo-RECORD', { undo: u2, run: s2.run, quals: qu2 })
  if (u2.pressed) {
    await lwOpen(page, SEP[0])
    const r2 = await redo(page)
    const s3 = await snap(page, A, SEP)
    await lwShot(page, pic('A6-topbar-redo'), A, SEP[0])
    const qr2 = await Q.quals(page, A)
    R.note('A-redo-RECORD', { redo: r2, run: s3.run, quals: qr2 })
    const back = qr2.onRoster && !qr2.inArchive && !s3.run.some(x => /\{PO\}|NO CELL/.test(x))
    const out = !qr2.onRoster && qr2.inArchive && s3.run.some(x => /\{PO\}/.test(x))
    R.ck('A-undo-redo-consistent', back || out, "after the top bar's Undo and Redo, the war and the Quals page agree about him (no half-restored man)", { run: s3.run, quals: qr2, back, out })
  }
})

/* ================= B. FILE then POST OUT (Gambit — bruise) */
await step('B-file-then-postout', async () => {
  await lwOpen(page, SEP[0])
  const b0 = await snap(page, B, SEP)
  const man0 = await manning(page, SEP[0])
  const f = await fileInput(page, { person: B, type: 'LL', from: SEP[0], to: SEP[1], remarks: 'W5 leave before the PO' })
  await lwOpen(page, SEP[0])
  const b1 = await snap(page, B, SEP)
  const man1 = await manning(page, SEP[0])
  const po = await postOut(B, '2026-07-28', PO)
  await lwOpen(page, SEP[0])
  const b2 = await snap(page, B, SEP)
  const man2 = await manning(page, SEP[0])
  await lwShot(page, pic('B1-file-then-postout-sep'), B, SEP[0])
  R.ck('B-same-final', f.added === 1 && po.done && /LL/.test(b2.run[0]) && /\{PO\}/.test(b2.run[0]) && lve(b2) === lve(b0) - 2,
    'filed first, then posted out: the same final day as the other order — LL with the PO tag, still charged (−2)', { run: b2.run, lve: [lve(b0), lve(b1), lve(b2)] })
  R.note('B-manning', { before: man0, afterLeave: man1, afterPO: man2 })
  if (Object.keys(man1).length && Object.keys(man2).length) R.ck('B-manning-once', JSON.stringify(man2) === JSON.stringify(man1), 'manning: the leave took him off; the posting takes nothing more (never below zero, never twice)', { afterLeave: man1, afterPO: man2 })
  const rl = await reload(page, 'a')
  await lwOpen(page, SEP[0])
  const b3 = await snap(page, B, SEP)
  const a3 = await snap(page, A, SEP)
  R.ck('B-reload', JSON.stringify(b3.run) === JSON.stringify(b2.run) && lve(b3) === lve(b2), 'a reload keeps the leave, the PO tag and the charge', { rl, B: b3.run, A: a3.run })
  const qA3 = await Q.quals(page, A, pic('B2-quals-cobra-after-reload'))
  R.ck('A-after-reload', !a3.run.some(x => /NO CELL|\{PO\}/.test(x)) && qA3.onRoster && !qA3.inArchive, 'after a reload Cobra (posting undone) is still on the war with his leave, and on the Quals roster (W5-F1 survives no reload)', { A: a3.run, quals: qA3 })
})

/* ================= PUBLISHED Friday: file then post out, post out then file */
const FRI = 4, FISO = '2026-07-17'
await step('P-published-pair', async () => {
  const [P1, P2] = ['slipway', 'dj']
  const JUL = ['2026-07-13', '2026-07-14', '2026-07-15', FISO]
  const diag = async (id, tag) => { if (SKIP.has('DIAG') && /start|after-file/.test(tag)) return []; await lwOpen(page, FISO); const r = await L.rowRun(page, id, JUL); const a = await page.evaluate(p => !!(window.PEOPLE[p] || {}).archived, id); R.note(`P-diag-${tag}`, { id, row: r, archived: a }); return r }
  await diag(P1, 'P1-start'); await diag(P2, 'P2-start')
  await S.pubAndSign(page, FRI)
  const f1 = await fileInput(page, { person: P1, type: 'LL', from: FISO, remarks: 'W5 late leave, then posted out' })
  const c1 = SKIP.has('COUNTS') ? { n: { week: 1 } } : await S.counts(page, FRI)
  await diag(P1, 'P1-after-file')
  const po1 = await postOut(P1, '2026-07-14', '2026-07-15')
  await diag(P1, 'P1-after-po')
  const c2 = await S.counts(page, FRI)
  const po2 = await postOut(P2, '2026-07-14', '2026-07-15')
  await diag(P2, 'P2-after-po')
  const c3 = await S.counts(page, FRI)
  const f2 = await fileInput(page, { person: P2, type: 'LL', from: FISO, remarks: 'W5 posted out, then late leave' })
  const c4 = await S.counts(page, FRI)
  await diag(P2, 'P2-after-file')
  await lwOpen(page, FISO)
  const r1 = await snap(page, P1, [FISO]), r2 = await snap(page, P2, [FISO])
  const face = await S.unavOn(page, 'face', FRI), work = await S.unavOn(page, 'work', FRI)
  await lwShot(page, pic('P1-published-friday-both'), P1, FISO)
  await S.shotUnav(page, 'work', FRI, pic('P2-work-published-friday'))
  R.note('P-counts', { fileThenPO: [c1.n.week, c2.n.week], poThenFile: [c3.n.week, c4.n.week], P1: r1.run, P2: r2.run, face, work })
  R.ck('P-same-both-orders', f1.added === 1 && f2.added === 1 && po1.done && po2.done && !/NO CELL/.test(r1.run[0] + r2.run[0]) && /LL/.test(r1.run[0]) && r1.run[0].replace(/\[.*\]/, '') === r2.run[0].replace(/\[.*\]/, '') && c4.n.week === 2 && c2.n.week === 1,
    'on published Friday the two orders end alike: both men\'s leave held with the PO tag, each late leave reads pending (2 in all), the posting itself adds nothing pending', { P1: r1.run, P2: r2.run, n: [c1.n.week, c2.n.week, c3.n.week, c4.n.week] })
})

R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
