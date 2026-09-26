/* RE-WALK copy of w2-02-cascade.mjs on the REBUILT app (26 Sep 26): pictures to rewalk/w2, results to
   parts/2026-09-26-absence-rewalk-w2-02-*.txt; B6 now also asserts AB3 (the cut leave says its OWN last day), and AB3a /
   AB3b walk AB3 where the first walk met it only in passing (register §12: "Every cut of a leave — a medical laid over
   it … — gives each surviving piece its OWN last day in the remark"; D189's words).
   W2-02 — the medical dialog's cascade ([S4-HUNT-REST] 2; the old hunt plan batch B, B2–B6), walked in the running app.
   Assertions of the RIGHT behaviour (a PASS is correct; re-running after a fix IS the re-walk).
     B2  an all-day OML 12–18 Jul over a KEPT ATT C 13–14 and a KEPT HL 16–17 mints exactly three OML pieces — 12, 15, 18
     B3  "HL replaces it, keep the tail" over ATT C 20–26 splits the ATT C exactly once; one undo puts it all back; the
         leftover's default (Remove) takes the tail away, shown before it happens
     B4  the same-type refusal ("A ATT C is already filed over these days") fires BEFORE anything is touched — on the add,
         on the edit and on the calendar drag — the neighbouring leave left uncut
     B5  Cancel on each save-time sheet leaves nothing behind: rows, the war's row, figures, manning
     B6  an upchit inside a medical that had cut leave: the medical trims, the leave stays cut, the war repaints at once
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w2-02-cascade.mjs [desktop|phone] */
const WD = process.argv[2] || 'desktop'
process.env.AB_WHO = 'rewalk/w2'
const L = await import('./ab-lib.mjs')
const W = await import('./w2-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { shot, toastSpy, toasts, resultBook, ROOT, inputsWindow } = L
const PHONE = WD === 'phone'
const R = resultBook(`RW-W2-02-${WD}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w2-02-${WD}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 3 : 1 })
await toastSpy(page)
const P = (n) => `rw-w2-02-${WD}-${n}`
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const ONLY = (process.env.W2_ONLY || '').split(',').filter(Boolean)
async function step(name, fn) { if (ONLY.length && !ONLY.some(o => name.startsWith(o))) return; try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await shot(page, P(`THREW-${name}`)).catch(() => {}) } }
const drag = (iid, a, b) => PHONE ? W.calDragTouch(page, iid, a, b) : W.calDragMouse(page, iid, a, b)
const JUL = d => `2026-07-${String(d).padStart(2, '0')}`
const days = (a, b) => { const o = []; for (let d = a; d <= b; d++) o.push(JUL(d)); return o }

/* ================================================================ B2 — three OML pieces around two kept statuses */
const B2M = 'haowen'                   // Talisman
await step('B2', async () => {
  const ac = await W.fileMed(page, { person: B2M, type: 'ATT C', from: JUL(13), to: JUL(14), remarks: 'W2 B2 ATT C' })
  const hl = await W.fileMed(page, { person: B2M, type: 'HL', from: JUL(16), to: JUL(17), remarks: 'W2 B2 HL' })
  const rows0 = await W.medRows(page, B2M), war0 = await W.warRead(page, B2M, days(12, 18))
  const om = await W.fileMed(page, { person: B2M, type: 'OML', from: JUL(12), to: JUL(18), remarks: 'W2 B2 OML' }, { choices: ['old', 'old'] })
  await shot(page, P('B2a-after-oml-keep-both'))
  const rows = await W.medRows(page, B2M)
  const omls = rows.filter(r => r.startsWith('OML'))
  R.note('B2-sheet', om.sheet)
  R.ck('B2-sheet-asked', !!om.sheet.medclash && /ATT C Jul 13 – Jul 14/.test(om.sheet.medclash) && /HL Jul 16 – Jul 17/.test(om.sheet.medclash), 'filing OML 12–18 asks about BOTH clashes (ATT C 13–14, HL 16–17), no default', om.sheet)
  R.ck('B2-three-pieces', omls.length === 3 && /OML Jul 12\b/.test(omls.join('|')) && /OML Jul 15\b/.test(omls.join('|')) && /OML Jul 18\b/.test(omls.join('|')) && !omls.some(r => /–/.test(r.split('"')[0])),
    'exactly three one-day OML pieces: 12, 15, 18 — none bridging a kept day, none lost', { rows0, rows })
  R.ck('B2-kept-intact', rows.includes(rows0.find(r => r.startsWith('ATT C'))) && rows.includes(rows0.find(r => r.startsWith('HL'))), 'the kept ATT C 13–14 and HL 16–17 are untouched', rows)
  const war = await W.warRead(page, B2M, days(12, 18))
  await L.lwShot(page, P('B2b-war-three-pieces'), B2M, JUL(15))
  R.ck('B2-war', same(war.run.map(x => x.split(':')[1].replace(/\[.*\]/, '')), ['OML', 'C', 'C', 'OML', 'HL', 'HL', 'OML']) && war.figs.medtot === '7',
    'the war reads OML · C · C · OML · HL · HL · OML over 12–18, MED TOT 7 (each day once)', { war0, war })
  R.note('B2-remarks', omls)
  const u = await W.hist(page, 'undo')
  const rU = await W.medRows(page, B2M), wU = await W.warRead(page, B2M, days(12, 18))
  R.ck('B2-one-undo', same(rU, rows0) && same(wU.run, war0.run) && wU.figs.medtot === war0.figs.medtot, 'ONE Undo removes all three pieces at once; the war and MED TOT back as before', { undo: u, rows: rU, war: wU })
  const r = await W.hist(page, 'redo')
  R.ck('B2-redo', same(await W.medRows(page, B2M), rows), 'Redo brings all three back', r)
  await W.reload(page, 'a')
  R.ck('B2-reload', same(await W.medRows(page, B2M), rows), 'a reload keeps the three pieces', await W.medRows(page, B2M))
})

/* ================================================================ B3 — "replaces it, keep the tail" */
const B3M = 'prism'                    // Recon
await step('B3', async () => {
  await W.fileMed(page, { person: B3M, type: 'ATT C', from: JUL(20), to: JUL(26), remarks: 'W2 B3 ATT C' })
  await W.fileMed(page, { person: B3M, type: 'LL', from: JUL(28), to: JUL(29), remarks: 'W2 B3 leave beside it' })
  const rows0 = await W.medRows(page, B3M), war0 = await W.warRead(page, B3M, days(20, 29))
  /* keep the tail */
  const hk = await W.fileMed(page, { person: B3M, type: 'HL', from: JUL(22), to: JUL(23), remarks: 'W2 B3 HL' }, { choices: ['new'], tails: ['keep'] })
  const rowsK = await W.medRows(page, B3M), warK = await W.warRead(page, B3M, days(20, 29))
  await shot(page, P('B3a-after-replace-keep-tail'))
  R.note('B3-sheet', hk.sheet)
  const acs = rowsK.filter(r => r.startsWith('ATT C'))
  R.ck('B3-split-once', acs.length === 2 && acs.some(r => /ATT C Jul 20–Jul 21/.test(r)) && acs.some(r => /ATT C Jul 24–Jul 26/.test(r)) && rowsK.some(r => /HL Jul 22–Jul 23/.test(r)),
    'the ATT C splits exactly once: 20–21 and 24–26 around HL 22–23 — no duplicated boundary day', rowsK)
  R.ck('B3-war-keep', warK.figs.medtot === '7' && rowsK.some(r => /LL Jul 28–Jul 29/.test(r)), 'MED TOT stays 7 (every day still medical, once); the leave beside it untouched', warK)
  await L.lwShot(page, P('B3b-war-keep-tail'), B3M, JUL(23))
  const u = await W.hist(page, 'undo')
  const rU = await W.medRows(page, B3M), wU = await W.warRead(page, B3M, days(20, 29))
  R.ck('B3-one-undo', same(rU, rows0) && wU.figs.medtot === war0.figs.medtot, 'ONE Undo puts the ATT C back whole and removes the HL', { undo: u, rows: rU, war: wU })
  /* the default leftover: Remove those days */
  const hr = await W.fileMed(page, { person: B3M, type: 'HL', from: JUL(22), to: JUL(23), remarks: 'W2 B3 HL' }, { choices: ['new'] })
  const rowsR = await W.medRows(page, B3M), warR = await W.warRead(page, B3M, days(20, 29))
  R.ck('B3-default-removes-tail', !rowsR.some(r => /Jul 24/.test(r)) && rowsR.some(r => /ATT C Jul 20–Jul 21/.test(r)) && warR.figs.medtot === '4',
    'with the leftover left on its default ("Remove those days", shown on the sheet), 24–26 go: ATT C 20–21 + HL 22–23, MED TOT 4', { sheet: hr.sheet, rows: rowsR, war: warR })
  await W.hist(page, 'undo')
  R.ck('B3-undo-2', same(await W.medRows(page, B3M), rows0), 'Undo again restores', await W.medRows(page, B3M))
})

/* ================================================================ B4 — the same-type refusal before anything is touched */
const B4M = 'split'                    // Vandal
await step('B4', async () => {
  const a = await W.fileMed(page, { person: B4M, type: 'ATT C', from: JUL(20), to: JUL(21), remarks: 'W2 B4 ATT C' })
  await W.fileMed(page, { person: B4M, type: 'LL', from: JUL(22), to: JUL(24), remarks: 'W2 B4 leave next to it' })
  const b = await W.fileMed(page, { person: B4M, type: 'ATT C', from: JUL(27), to: JUL(29), remarks: 'W2 B4 later ATT C' })
  const rows0 = await W.medRows(page, B4M), war0 = await W.warRead(page, B4M, days(20, 29))
  /* the add */
  await toasts(page)
  const add = await W.fileMed(page, { person: B4M, type: 'ATT C', from: JUL(21), to: JUL(23), remarks: 'W2 B4 duplicate' })
  const tA = await toasts(page)
  await shot(page, P('B4a-add-refused'))
  R.ck('B4-add-refused', add.added === 0 && tA.some(t => /already filed over these days/.test(t)) && same(await W.medRows(page, B4M), rows0),
    'a second ATT C 21–23 is refused on the add, naming what is in the way; the LL 22–24 it would have cut is untouched', { toasts: tA, sheet: add.sheet, rows: await W.medRows(page, B4M) })
  /* the edit */
  await inputsWindow(page, JUL(20), JUL(31))
  await W.tableEdit(page, b.iid)
  await W.tablePickDates(page, JUL(21), JUL(23))
  await toasts(page)
  await W.tableSave(page)
  const tE = await toasts(page), cE = await W.confirmNow(page)
  await shot(page, P('B4b-edit-refused'))
  R.ck('B4-edit-refused', tE.some(t => /already filed over these days/.test(t)) && !W.anyConfirm(cE) && same(await W.medRows(page, B4M), rows0),
    'moving the later ATT C onto 21–23 in the edit window is refused the same way, nothing touched', { toasts: tE, sheet: cE, rows: await W.medRows(page, B4M) })
  await W.tableCancel(page)
  /* the calendar drag */
  await W.calTo(page, '2026-07')
  await toasts(page)
  const d = await drag(b.iid, JUL(27), JUL(21))
  const tD = await toasts(page), cD = await W.confirmNow(page)
  await shot(page, P('B4c-drag-refused'))
  R.ck('B4-drag-refused', tD.some(t => /already filed over these days/.test(t)) && same(await W.medRows(page, B4M), rows0),
    'dragging the later ATT C chip onto 21 (→ 21–23) is refused the same way; the chip stays; the leave uncut', { drag: d, toasts: tD, sheet: cD, ghost: await W.ghostLeft(page), rows: await W.medRows(page, B4M) })
  const war = await W.warRead(page, B4M, days(20, 29))
  R.ck('B4-war-untouched', same(war.run, war0.run) && same(war.figs, war0.figs), 'the war\'s row and figures are exactly as before the three attempts', { war0, war })
})

/* ================================================================ B5 — Cancel leaves nothing behind */
const B5M = 'bapster'                  // Wildcard
await step('B5', async () => {
  await W.fileMed(page, { person: B5M, type: 'HL', from: JUL(20), to: JUL(22), remarks: 'W2 B5 HL' })
  await W.fileMed(page, { person: B5M, type: 'LL', from: JUL(24), to: JUL(24), remarks: 'W2 B5 leave' })
  const rows0 = await W.medRows(page, B5M), war0 = await W.warFull(page, B5M, [JUL(21), JUL(22), JUL(23), JUL(24)])
  /* the clash sheet's Cancel, after picking an answer */
  const c1 = await W.fileMed(page, { person: B5M, type: 'OML', from: JUL(21), to: JUL(24), remarks: 'W2 B5 OML' }, { cancel: true })
  const w1 = await W.warFull(page, B5M, [JUL(21), JUL(22), JUL(23), JUL(24)])
  R.ck('B5-medclash-cancel', !!c1.sheet.medclash && c1.added === 0 && same(await W.medRows(page, B5M), rows0) && same(w1, war0),
    'Cancel on the clash sheet: no row, the war\'s row, figures and manning identical', { sheet: c1.sheet, war0, war: w1 })
  /* the document ask: "Upload" goes back to the form, nothing filed */
  await L.inputsView(page, 'list')
  await page.selectOption('#inPerson', B5M).catch(() => {})
  await page.selectOption('#inType', 'ATT C')
  const n0 = await page.evaluate(() => window.INPUTS.length)
  /* dates: 27 Jul through the form's own calendar, as fileInput does */
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  for (let i = 0; i < 30 && !(await page.locator('#inCal [data-cal="2026-07-27"]').count()); i++) {
    const [m, y] = (await page.locator('#inCal .rc-mon').first().textContent()).trim().split(/\s+/)
    await page.locator(`#inCal button[aria-label="${`${y}-${String(MON.indexOf(m.slice(0, 3)) + 1).padStart(2, '0')}` < '2026-07' ? 'Next' : 'Previous'} month"]`).first().click()
  }
  await page.locator('#inCal [data-cal="2026-07-27"]').first().click(); await page.waitForTimeout(150)
  if ((await page.locator('#inDates').textContent()).includes('→')) { await page.locator('#inCal [data-cal="2026-07-27"]').first().click(); await page.waitForTimeout(150) }
  await page.locator('#inAdd').click(); await page.waitForTimeout(600)
  const dc = await W.confirmNow(page)
  await shot(page, P('B5a-document-ask'))
  await page.locator('[data-testid="docconf-upload"]').click().catch(() => {}); await page.waitForTimeout(400)
  const n1 = await page.evaluate(() => window.INPUTS.length)
  R.ck('B5-docask-upload-writes-nothing', !!dc.docconf && n1 === n0 && !(await page.locator('[data-testid="docconf"]').count()),
    'a new ATT C with no certificate asks "Upload" / "No document"; Upload returns to the form and files nothing', { sheet: dc, before: n0, after: n1 })
  /* Escape on the document ask = Upload (the safe choice) */
  await page.locator('#inAdd').click(); await page.waitForTimeout(600)
  const dc2 = await W.confirmNow(page)
  await page.keyboard.press('Escape'); await page.waitForTimeout(400)
  R.ck('B5-docask-escape', !!dc2.docconf && (await page.evaluate(() => window.INPUTS.length)) === n0 && !(await page.locator('[data-testid="docconf"]').count()), 'Escape on the document ask closes it and files nothing', dc2)
  const w2 = await W.warFull(page, B5M, [JUL(21), JUL(22), JUL(23), JUL(24)])
  R.ck('B5-all-identical', same(await W.medRows(page, B5M), rows0) && same(w2, war0), 'after every Cancel: rows, war row, figures and manning identical to before', { war: w2 })
})

/* ================================================================ B6 — an upchit inside a medical that had cut leave */
const B6 = 'pump'                      // Piston
await step('B6', async () => {
  await W.fileMed(page, { person: B6, type: 'LL', from: JUL(20), to: JUL(24), remarks: 'W2 B6 leave till 24 Jul' })
  const warL = await W.warRead(page, B6, days(20, 24))
  const m = await W.fileMed(page, { person: B6, type: 'ATT C', from: JUL(22), to: JUL(24), remarks: 'W2 B6 sick' })
  const rowsM = await W.medRows(page, B6), warM = await W.warRead(page, B6, days(20, 24))
  R.ck('B6-medical-cuts', rowsM.some(r => /^LL Jul 20–Jul 21/.test(r)) && !rowsM.some(r => /^LL .*Jul 2[234]/.test(r)) && warM.figs.medtot === '3',
    'ATT C 22–24 cuts the leave to 20–21 (the cut days go back to the balance), MED TOT 3', { leaveOnly: warL, rows: rowsM, war: warM })
  R.ck('AB3-B6-cut-says-own-last-day', rowsM.some(r => r === 'LL Jul 20–Jul 21 "W2 B6 leave till 21 Jul"'),
    'the cut leave\'s remark now says its OWN last day: "W2 B6 leave till 21 Jul" (was "till 24 Jul" — AB3, D189), the typist\'s other words kept', rowsM)
  R.note('B6-lve-before-after-cut', { before: warL.figs, after: warM.figs })
  await L.lwOpen(page, JUL(22))
  const u = await W.fileMed(page, { person: B6, type: 'Upchit', from: JUL(23), remarks: 'W2 B6 upchit' })
  await shot(page, P('B6a-after-upchit'))
  const rowsU = await W.medRows(page, B6), warU = await W.warRead(page, B6, days(20, 24))
  await L.lwShot(page, P('B6b-war-after-upchit'), B6, JUL(22))
  R.note('B6-upchit-sheet', u.sheet)
  R.ck('B6-upchit-summary', !!u.sheet.upconf && /ATT C Jul 22 – Jul 24 → now ends Jul 22/.test(u.sheet.upconf), 'the upchit summary says: ATT C 22–24 now ends 22 Jul', u.sheet)
  R.ck('B6-medical-trims-leave-stays-cut', rowsU.some(r => /^ATT C Jul 22 /.test(r) || /^ATT C Jul 22"/.test(r) || /^ATT C Jul 22$/.test(r.split(' "')[0])) && rowsU.some(r => /^LL Jul 20–Jul 21/.test(r)) && !rowsU.some(r => /^LL .*Jul 2[234]/.test(r)),
    'the ATT C ends 22 Jul; the leave stays 20–21 — nothing re-grows over 23–24', rowsU)
  R.ck('B6-war-at-once', warU.figs.medtot === '1' && same(warU.figs.lve, warM.figs.lve) && same(warU.figs.lvetot, warM.figs.lvetot) && /07-23:·/.test(warU.run.join(' ')),
    'the war repaints at once: MED TOT 3 → 1, 23–24 empty, the leave balances unchanged by the upchit', { before: warM, after: warU })
  const un = await W.hist(page, 'undo')
  R.ck('B6-undo', same(await W.medRows(page, B6), rowsM), 'ONE Undo takes the upchit back and the ATT C whole again', { undo: un, rows: await W.medRows(page, B6) })
})

/* ================================================================ AB3 — every piece of a cut leave says its own last day */
const S = await import('./ab-sched.mjs')
const csAB3 = await W.csOf(page)
/* late July: Reaper, Hunter, Cinch have nothing on file there in the demo (none is used by B2–B6 above) */
const [A3a, A3b, A3c] = ['dice', 'prowler', 'snap']
/* the loaded week (13–19 Jul) is full Mon–Tue; a man with nothing Wed–Fri carries the week-row check */
const used = new Set([B2M, B3M, B4M, B5M, B6, A3a, A3b, A3c])
const A3w = (await S.freeMen(page, [2, 3, 4])).filter(m => !used.has(m))[0]
R.note('AB3-cast', { A3a: csAB3[A3a], A3b: csAB3[A3b], A3c: csAB3[A3c], A3w: A3w && csAB3[A3w] })
/* the rows of a day card's Unavailable block, words and all (type, times, puck, remarks) */
const unavText = (where, di) => page.evaluate(s => { const b = document.querySelector(s); return b ? [...b.querySelectorAll('.pl-row')].map(r => r.innerText.replace(/\s+/g, ' ').trim()) : 'NO BLOCK' },
  `${where === 'face' ? '#vWeek' : '#eWeek'} .day[data-day="${di}"] .sec-unav`)
/* AB3a — a medical in the MIDDLE of a leave: two pieces, each "till" its own last day, the other words kept */
await step('AB3a', async () => {
  const M = A3a
  const l = await W.fileMed(page, { person: M, type: 'LL', from: JUL(20), to: JUL(24), remarks: 'W2 AB3 Bali till 24 Jul' })
  const rows0 = await W.medRows(page, M)
  const m = await W.fileMed(page, { person: M, type: 'ATT C', from: JUL(22), remarks: 'W2 AB3 sick' })
  const rows = await W.medRows(page, M)
  await W.toList(page); await inputsWindow(page, JUL(19), JUL(25))
  await shot(page, P('AB3a-inputs-table-two-pieces'))
  /* the medical's save adds TWO rows — the ATT C and the leave's second piece (the first re-walk run counted 1 and
     failed on its own arithmetic while the rows were right) */
  R.ck('AB3a-each-piece-own-till', l.added === 1 && m.added >= 1 && rows.includes('LL Jul 20–Jul 21 "W2 AB3 Bali till 21 Jul"') && rows.includes('LL Jul 23–Jul 24 "W2 AB3 Bali till 24 Jul"'),
    'ATT C 22 Jul in the middle of LL 20–24 "W2 AB3 Bali till 24 Jul": the first piece reads "till 21 Jul", the second "till 24 Jul", "Bali" kept on both', { rows0, rows })
  const u = await W.hist(page, 'undo')
  const rU = await W.medRows(page, M)
  R.ck('AB3a-one-undo', same(rU, rows0), 'ONE Undo takes the ATT C back and the leave is whole again, "till 24 Jul"', { undo: u, rows: rU })
})
/* AB3w — the same in the loaded week, so the week's Unavailable rows show the words */
await step('AB3w', async () => {
  const M = A3w
  if (!M) { R.ck('AB3w-cast', false, 'a man with nothing Wed–Fri of the loaded week', 'none found'); return }
  await W.fileMed(page, { person: M, type: 'LL', from: JUL(15), to: JUL(17), remarks: 'W2 AB3w Bali till 17 Jul' })
  await W.fileMed(page, { person: M, type: 'ATT C', from: JUL(16), remarks: 'W2 AB3w sick' })
  const rows = await W.medRows(page, M)
  await S.shotUnav(page, 'work', 2, P('AB3w-week-wednesday-unavailable'))
  const wed = await unavText('work', 2)
  await S.shotUnav(page, 'work', 4, P('AB3w-week-friday-unavailable'))
  const fri = await unavText('work', 4)
  const wRow = Array.isArray(wed) ? wed.find(r => r.includes(csAB3[M]) && /LL/.test(r)) : null
  const fRow = Array.isArray(fri) ? fri.find(r => r.includes(csAB3[M]) && /LL/.test(r)) : null
  R.ck('AB3w-week-rows-say-it', rows.includes('LL Jul 15 "W2 AB3w Bali till 15 Jul"') && rows.includes('LL Jul 17 "W2 AB3w Bali till 17 Jul"') && !!wRow && /till 15 Jul/.test(wRow) && !!fRow && /till 17 Jul/.test(fRow),
    'ATT C Thu 16 inside LL Wed 15 – Fri 17: Wednesday\'s leave row reads "till 15 Jul", Friday\'s "till 17 Jul" — the Inputs and the week agree', { rows, wed: wRow, fri: fRow })
})
/* AB3b — a medical over the END of a leave leaves ONE day: that piece says its own day */
await step('AB3b', async () => {
  const M = A3b
  await W.fileMed(page, { person: M, type: 'LL', from: JUL(20), to: JUL(22), remarks: 'W2 AB3b trip till 22 Jul' })
  await W.fileMed(page, { person: M, type: 'ATT C', from: JUL(21), to: JUL(22), remarks: 'W2 AB3b sick' })
  const rows = await W.medRows(page, M)
  await W.toList(page); await inputsWindow(page, JUL(19), JUL(25))
  await shot(page, P('AB3b-inputs-table-one-day-left'))
  R.ck('AB3b-one-day-piece', rows.includes('LL Jul 20 "W2 AB3b trip till 20 Jul"'), 'ATT C 21–22 over the end of LL 20–22 "till 22 Jul": the one day left reads "W2 AB3b trip till 20 Jul"', rows)
})
/* AB3c — a TIMED medical on a middle morning: the leave keeps the hours the medical does not cover — every piece says
   its own last day */
await step('AB3c', async () => {
  const M = A3c
  await W.fileMed(page, { person: M, type: 'LL', from: JUL(20), to: JUL(22), remarks: 'W2 AB3c home till 22 Jul' })
  await W.fileMed(page, { person: M, type: 'ATT C', from: JUL(21), span: 'custom', start: '08:00', end: '12:00', remarks: 'W2 AB3c clinic' })
  const rows = await W.medRows(page, M)
  await W.toList(page); await inputsWindow(page, JUL(19), JUL(25))
  await shot(page, P('AB3c-inputs-table-timed-cut'))
  const lls = rows.filter(r => /^LL /.test(r))
  R.note('AB3c-rows', rows)
  R.ck('AB3c-each-piece-own-till', lls.length >= 2 && lls.every(r => { const m = /^LL Jul (\d+)(?:–Jul (\d+))?/.exec(r); const last = m && (m[2] || m[1]); return last && r.includes(`till ${last} Jul`) }),
    'ATT C 08:00–12:00 on the 21st inside LL 20–22: every leave piece left says "till" its OWN last day', lls)
})

R.note('errors', errors.slice(0, 20))
R.ck('console-clean', !errors.length, 'no console errors, page errors or failed requests', errors.slice(0, 10))
R.save()
await browser.close()
