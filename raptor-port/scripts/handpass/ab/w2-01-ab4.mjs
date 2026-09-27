/* W2-01 — FINDING AB4 (Fable F4 / S4; Astra 1, 2, 3, defect A), walked in the running app at one width.
   Written as assertions of the RIGHT behaviour: a PASS means the app did what the owner ruled, so this script FAILS
   while the defect is there and re-running it after a fix IS the re-walk.
   The rule (owner, 27 Aug 26 — MedClashConfirm / UpchitConfirm header comments): a medical that overlaps a
   DIFFERENT-type medical is never resolved silently — before anything is written, the filer is asked who holds the
   shared days (NO default); an upchit is never saved silently — the summary and a Keep/Remove on every later entry
   (NO default). B7 (register §2): the same rules at every door — the Inputs page, the calendar, reassign.
     A1  the Inputs CALENDAR: drag a downchit chip (ATT C) onto days held by a different-type downchit (HL)
     A2  the Inputs CALENDAR: drag an UPCHIT chip into a medical, with a later medical on file
     A3  EDIT SCHEDULE: reassign (arm the Unavailable row's person, tap another man) a medical to a man holding a
         different-type medical
   Each: first the SAME change through the edit window (it asks — the comparison), Cancel (nothing written); then the
   gesture; what it wrote, what it asked; the war (MED TOT, the row); Undo, Redo, a reload.
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w2-01-ab4.mjs [desktop|phone] */
const WD = process.argv[2] || 'desktop'
process.env.AB_WHO = 'w2'
const L = await import('./ab-lib.mjs')
const W = await import('./w2-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { shot, toastSpy, toasts, resultBook, ROOT, inputsWindow } = L
const PHONE = WD === 'phone'
const R = resultBook(`W2-01-${WD}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-w2-01-${WD}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 3 : 1 })
await toastSpy(page)
const P = (n) => `w2-01-${WD}-${n}`
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const ONLY = (process.env.W2_ONLY || '').split(',').filter(Boolean)
async function step(name, fn) { if (ONLY.length && !ONLY.some(o => name.startsWith(o))) return; try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await shot(page, P(`THREW-${name}`)).catch(() => {}) } }
const drag = (iid, a, b) => PHONE ? W.calDragTouch(page, iid, a, b) : W.calDragMouse(page, iid, a, b)
const JUL = d => `2026-07-${String(d).padStart(2, '0')}`

/* ================================================================ A1 — downchit dragged onto a different-type downchit */
/* A1: ATT C 18–19 Jul dragged by its 18th to 24th → it would cover 24–25, sharing 24 with HL 20–24: a REAL choice
   ("ATT C replaces" / "Keep HL till Jul 24"), no default. A1f: a one-day ATT C dropped INSIDE the HL — the owner's forced
   exception (28 Aug 26): "ATT C replaces" is the only answer, and the question moves to the leftover HL 23–24 —
   "Remove those days" (the default, shown before it happens) or "Keep them". */
const M1 = 'dice', M1F = 'prowler'     // Reaper; Hunter — nothing on file in July
const A1D = [18, 19, 20, 21, 22, 23, 24, 25].map(d => `2026-07-${d}`)
for (const [tag, man, acFrom, acTo, dropFrom, dropTo, dlgFrom, dlgTo] of [
  ['A1', M1, 18, 19, 18, 24, 24, 25],
  ['A1f', M1F, 18, 18, 18, 22, 22, 22],
]) {
  let a1 = {}
  await step(`${tag}-setup`, async () => {
    const hl = await W.fileMed(page, { person: man, type: 'HL', from: JUL(20), to: JUL(24), remarks: `W2 ${tag} hospital` })
    const ac = await W.fileMed(page, { person: man, type: 'ATT C', from: JUL(acFrom), to: acTo !== acFrom ? JUL(acTo) : undefined, remarks: `W2 ${tag} sick` })
    a1 = { hl: hl.iid, ac: ac.iid }
    a1.rows0 = await W.medRows(page, man)
    a1.war0 = await W.warRead(page, man, A1D)
    R.ck(`${tag}-setup`, hl.added === 1 && ac.added === 1, `HL 20–24 Jul and ATT C ${acFrom}${acTo !== acFrom ? '–' + acTo : ''} Jul filed on the Inputs page (certificate asked, answered "No document")`, { rows: a1.rows0, war: a1.war0 })
  })
  await step(`${tag}-dialog-asks`, async () => {
    /* the comparison: the SAME move through the Inputs table's edit window */
    const w = await inputsWindow(page, JUL(18), JUL(25))
    const opened = await W.tableEdit(page, a1.ac)
    const picked = await W.tablePickDates(page, JUL(dlgFrom), JUL(dlgTo))
    await W.tableSave(page)
    const c = await W.confirmNow(page)
    await shot(page, P(`${tag}a-dialog-asks`))
    const want = tag === 'A1'
      ? (!!c.medclash && /Keep HL/.test(c.medclash) && c.buttons.some(b => /medclash-save.*\(off\)/.test(b)))
      : (!!c.medclash && /Left over after it: HL Jul 23 – Jul 24 — will be removed/.test(c.medclash))
    R.ck(`${tag}-dialog-asks`, want, tag === 'A1'
      ? 'the edit window asks who holds 24 Jul — "ATT C replaces" / "Keep HL till Jul 24", Save off until answered (no default)'
      : 'the edit window shows "ATT C replaces" (forced — HL covers the whole entry) and asks about the leftover: HL 23–24 "will be removed" unless Keep', { window: w, opened, picked, sheet: c })
    await W.confirmCancel(page)
    await W.tableCancel(page)
    const rows = await W.medRows(page, man)
    R.ck(`${tag}-dialog-cancel-writes-nothing`, same(rows, a1.rows0), 'Cancel on the sheet writes nothing', rows)
  })
  await step(`${tag}-drag`, async () => {
    const mon = await W.calTo(page, '2026-07')
    await shot(page, P(`${tag}b-cal-before-drag`))
    await toasts(page)
    const d = await drag(a1.ac, JUL(dropFrom), JUL(dropTo))
    const c = await W.confirmNow(page)
    const t = await toasts(page)
    const rows = await W.medRows(page, man)
    a1.rowsDrag = rows
    await shot(page, P(`${tag}c-cal-after-drag`))
    R.note(`${tag}-drag-gesture`, { mon, drag: d, toasts: t, ghost: await W.ghostLeft(page) })
    R.ck(`AB4-${tag}-drag-asks`, W.anyConfirm(c), tag === 'A1'
      ? 'the calendar drag of ATT C onto the HL asks who holds 24 Jul, as the edit window does (owner 27 Aug 26, B7)'
      : 'the calendar drag of ATT C into the HL shows the leftover HL 23–24 and its Remove / Keep before writing, as the edit window does (owner 28 Aug 26 — "never silent")', { sheet: c, toasts: t })
    R.ck(`AB4-${tag}-nothing-before-answer`, same(rows, a1.rows0), 'nothing is written until the question is answered', { before: a1.rows0, after: rows })
    a1.warDrag = await W.warRead(page, man, A1D)
    R.note(`${tag}-war-after-drag`, a1.warDrag)
    await L.lwShot(page, P(`${tag}d-war-after-drag`), man, JUL(dropTo))
    if (c.medclash) await W.confirmCancel(page)
  })
  await step(`${tag}-undo-redo-reload`, async () => {
    const u = await W.hist(page, 'undo')
    const rU = await W.medRows(page, man), wU = await W.warRead(page, man, A1D)
    R.ck(`${tag}-undo`, same(rU, a1.rows0), 'ONE Undo puts the HL and the ATT C back as they were (the drag was one step)', { undo: u, rows: rU, war: wU })
    R.ck(`${tag}-undo-war`, same(wU.figs, a1.war0.figs) && same(wU.run, a1.war0.run), 'the war repaints to the before-state at once: the row and MED TOT', { before: a1.war0, after: wU })
    const r = await W.hist(page, 'redo')
    const rR = await W.medRows(page, man)
    R.ck(`${tag}-redo`, same(rR, a1.rowsDrag), 'Redo puts the drag result back exactly', { redo: r, rows: rR })
    await W.reload(page, 'a')
    const rL = await W.medRows(page, man), wL = await W.warRead(page, man, A1D)
    R.ck(`${tag}-reload`, same(rL, a1.rowsDrag) && wL.figs.medtot === a1.warDrag.figs.medtot && same(wL.run, a1.warDrag.run), 'a reload keeps the last state, war figures included', { rows: rL, war: wL })
  })
}

/* ================================================================ A2 — upchit dragged into a medical */
const M2 = 'pump'                      // Piston
let a2 = {}
await step('A2-setup', async () => {
  const om = await W.fileMed(page, { person: M2, type: 'OML', from: JUL(20), to: JUL(24), remarks: 'W2 A2 OML' })
  const fu = await W.fileMed(page, { person: M2, type: 'ATT C', from: JUL(28), remarks: 'W2 A2 later ATT C' })
  const up = await W.fileMed(page, { person: M2, type: 'Upchit', from: JUL(31), remarks: 'W2 A2 upchit' })
  a2 = { om: om.iid, fu: fu.iid, up: up.iid }
  a2.rows0 = await W.medRows(page, M2)
  R.ck('A2-setup', om.added === 1 && fu.added === 1 && up.added === 1, 'Piston: OML 20–24 Jul, a later ATT C 28 Jul, an Upchit 31 Jul (its summary answered Save — nothing to shorten)', { rows: a2.rows0, upSheet: up.sheet })
})
await step('A2-dialog-asks', async () => {
  const w = await inputsWindow(page, JUL(20), JUL(31))
  const opened = await W.tableEdit(page, a2.up)
  const picked = await W.tablePickDates(page, JUL(22))
  await W.tableSave(page)
  const c = await W.confirmNow(page)
  await shot(page, P('A2a-dialog-upchit-summary'))
  R.ck('A2-dialog-asks', !!c.upconf && /OML/.test(c.upconf) && /ATT C/.test(c.upconf) && c.buttons.some(b => /upconf-save.*\(off\)/.test(b)),
    'the edit window shows the upchit summary: OML ends 21 Jul; the later ATT C 28 Jul — Keep or Remove, Save off until chosen', { window: w, opened, picked, sheet: c })
  await W.confirmCancel(page)
  await W.tableCancel(page)
  R.ck('A2-dialog-cancel-writes-nothing', same(await W.medRows(page, M2), a2.rows0), 'Cancel writes nothing', await W.medRows(page, M2))
})
await step('A2-drag', async () => {
  await W.calTo(page, '2026-07')
  await toasts(page)
  const d = await drag(a2.up, JUL(31), JUL(22))
  const c = await W.confirmNow(page)
  const t = await toasts(page)
  const rows = await W.medRows(page, M2)
  a2.rowsDrag = rows
  await shot(page, P('A2b-cal-after-upchit-drag'))
  R.note('A2-drag-gesture', { drag: d, toasts: t })
  R.ck('AB4-A2-upchit-drag-asks', W.anyConfirm(c), 'the calendar drag of the upchit into Piston\'s OML shows the upchit summary and asks Keep / Remove for the later ATT C, as the edit window does (owner 27 Aug 26)', { sheet: c, toasts: t })
  R.ck('AB4-A2-nothing-before-answer', same(rows, a2.rows0), 'nothing is written until the summary is answered', { before: a2.rows0, after: rows })
  a2.warDrag = await W.warRead(page, M2, [JUL(20), JUL(21), JUL(22), JUL(23), JUL(24), JUL(28)])
  R.note('A2-war-after-drag', a2.warDrag)
  await L.lwShot(page, P('A2c-war-after-upchit-drag'), M2, JUL(22))
  if (c.upconf) await W.confirmCancel(page)
})
await step('A2-undo', async () => {
  const u = await W.hist(page, 'undo')
  const rU = await W.medRows(page, M2)
  R.ck('A2-undo', same(rU, a2.rows0), 'ONE Undo puts the OML and the upchit back', { undo: u, rows: rU })
  const r = await W.hist(page, 'redo')
  R.ck('A2-redo', same(await W.medRows(page, M2), a2.rowsDrag), 'Redo re-applies the drag', { redo: r })
})

/* ================================================================ A3 — reassign a medical to a man holding a different medical */
const M3 = 'snap', M4 = 'slipway'      // Cinch, Drifter
const THU = 3, FRI = 4
let a3 = {}
await step('A3-setup', async () => {
  const ac = await W.fileMed(page, { person: M3, type: 'ATT C', from: JUL(16), to: JUL(17), remarks: 'W2 A3 Cinch sick' })
  const hl = await W.fileMed(page, { person: M4, type: 'HL', from: JUL(17), to: JUL(18), remarks: 'W2 A3 Drifter hospital' })
  a3 = { ac: ac.iid, hl: hl.iid }
  a3.rows0 = { [M3]: await W.medRows(page, M3), [M4]: await W.medRows(page, M4) }
  R.ck('A3-setup', ac.added === 1 && hl.added === 1, 'Cinch ATT C Thu 16–Fri 17 Jul; Drifter HL Fri 17–Sat 18 Jul', a3.rows0)
})
await step('A3-dialog-asks', async () => {
  const u = await W.unavRow(page, FRI, a3.ac)
  if (!u.hasEdit) { R.ck('A3-dialog-door', false, 'Friday\'s Unavailable row for Cinch\'s ATT C has its edit door', u); return }
  await u.edit.evaluate(e => e.scrollIntoView({ block: 'center' })); await u.edit.click(); await page.waitForTimeout(500)
  const sel = page.locator('#inpEditPerson:visible')
  const hasSel = !!(await sel.count())
  if (hasSel) await sel.selectOption(M4)
  await page.locator('#inpEditSave:visible').click(); await page.waitForTimeout(600)
  const c = await W.confirmNow(page)
  await shot(page, P('A3a-dialog-person-change-asks'))
  R.ck('A3-dialog-asks', !!c.medclash, 'changing the ATT C\'s person to Drifter in the edit window asks who holds Fri 17 Jul (Drifter\'s HL)', { hasSel, sheet: c })
  await W.confirmCancel(page)
  const x = page.locator('#inpEditCancel:visible'); if (await x.count()) { await x.click(); await page.waitForTimeout(300) }
  const rows = { [M3]: await W.medRows(page, M3), [M4]: await W.medRows(page, M4) }
  R.ck('A3-dialog-cancel-writes-nothing', same(rows, a3.rows0), 'Cancel writes nothing', rows)
})
await step('A3-reassign', async () => {
  await toasts(page)
  const g = await W.reassignByTap(page, FRI, a3.ac, M4)
  const c = await W.confirmNow(page)
  const t = await toasts(page)
  const rows = { [M3]: await W.medRows(page, M3), [M4]: await W.medRows(page, M4) }
  a3.rowsRe = rows
  await shot(page, P('A3b-after-reassign'))
  R.note('A3-reassign-gesture', { gesture: g, toasts: t })
  R.ck('AB4-A3-reassign-asks', W.anyConfirm(c), 'reassigning Cinch\'s ATT C to Drifter (who holds HL on Fri 17) asks who holds the shared day, as the edit window does (B7)', { sheet: c, toasts: t })
  R.ck('AB4-A3-nothing-before-answer', same(rows, a3.rows0), 'nothing is written until answered', { before: a3.rows0, after: rows })
  const war = { [M3]: await W.warRead(page, M3, [JUL(16), JUL(17), JUL(18)]), [M4]: await W.warRead(page, M4, [JUL(16), JUL(17), JUL(18)]) }
  R.note('A3-war-after-reassign', war)
  await L.lwShot(page, P('A3c-war-after-reassign'), M4, JUL(17))
  if (c.medclash) await W.confirmCancel(page)
})
await step('A3-undo', async () => {
  const u = await W.hist(page, 'undo')
  const rows = { [M3]: await W.medRows(page, M3), [M4]: await W.medRows(page, M4) }
  R.ck('A3-undo', same(rows, a3.rows0), 'ONE Undo puts both men\'s medicals back', { undo: u, rows })
})

/* the same reassign by DRAG — a crew-palette puck dropped on the Unavailable row's person (drag.ts → reassignInput) */
await step('A3-drag', async () => {
  if (PHONE) { R.note('A3-drag', 'phone: the arm-then-tap above is the phone door; the palette drag is walked at desktop'); return }
  const u = await W.unavRow(page, FRI, a3.ac)
  await u.seat.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300)
  const rp = page.locator(`.rpuck[data-person="${M4}"]:visible`).first()
  if (!(await rp.count())) { R.ck('A3-drag-door', false, 'Drifter\'s puck in the crew palette', {}); return }
  await rp.evaluate(e => e.scrollIntoView({ block: 'nearest' })); await page.waitForTimeout(200)
  const a = await rp.boundingBox(), b = await u.seat.boundingBox()
  await toasts(page)
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down()
  await page.mouse.move(a.x + a.width / 2 - 8, a.y + a.height / 2 + 4, { steps: 3 })
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 16 }); await page.waitForTimeout(150)
  await page.mouse.up(); await page.waitForTimeout(800)
  const c = await W.confirmNow(page), t = await toasts(page)
  const rows = { [M3]: await W.medRows(page, M3), [M4]: await W.medRows(page, M4) }
  await shot(page, P('A3d-after-reassign-by-drag'))
  R.ck('AB4-A3-drag-asks', W.anyConfirm(c), 'the same reassign by DRAGGING Drifter\'s palette puck onto the row asks who holds Fri 17 (B7)', { sheet: c, toasts: t })
  R.ck('AB4-A3-drag-nothing-before-answer', same(rows, a3.rows0), 'nothing is written until answered', { before: a3.rows0, after: rows })
  if (!same(rows, a3.rows0)) R.note('A3-drag-undo', await W.hist(page, 'undo'))
})

/* the SAME-TYPE refusal on the reassign door (Astra 23; register "same type twice"): Cinch's ATT C 16–17 handed to
   Hunter, who already holds an ATT C on Fri 17 — refused before anything moves, as the add / edit / drag doors are */
await step('A3s', async () => {
  const M5 = 'prowler'                 // Hunter
  const h = await W.fileMed(page, { person: M5, type: 'ATT C', from: JUL(17), remarks: 'W2 A3s Hunter sick' })
  const before = { [M3]: await W.medRows(page, M3), [M5]: await W.medRows(page, M5) }
  await toasts(page)
  const g = await W.reassignByTap(page, FRI, a3.ac, M5)
  const t = await toasts(page), c = await W.confirmNow(page)
  const after = { [M3]: await W.medRows(page, M3), [M5]: await W.medRows(page, M5) }
  await shot(page, P('A3s-same-type-reassign'))
  R.ck('A3s-same-type-refused', same(after, before) && t.some(x => /already filed over these days/.test(x)),
    'reassigning Cinch\'s ATT C to Hunter (ATT C on Fri 17) is refused, naming the ATT C in the way; nothing moves', { filed: h.added, gesture: g, toasts: t, sheet: c, before, after })
})

R.note('toasts-left', await toasts(page))
R.note('errors', errors.slice(0, 20))
R.ck('console-clean', !errors.length, 'no console errors, page errors or failed requests', errors.slice(0, 10))
R.save()
await browser.close()
