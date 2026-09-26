/* RW copy of w3-03-postings.mjs (re-walk, 26 Sep 26): pictures to rewalk2/w3, results to 2026-09-26-absence-rewalk2-w3-03-<width>.txt. Checks unchanged — they were written as the RIGHT behaviour (AB5 said, W3-F5 the sheet stays). */
/* W3-03 — POSTINGS on the war: the bid sheet's PI / PO fold (R9a), the Post in / Post out sheets an admin's tap on a
   hatched day opens with their "Place leave or OIL here instead…" (R9b), the drag-selection's Post out (R9c); each
   posting's own Undo AND the top bar's Undo after a posting (R28 — recorded, a posting is not on the one timeline);
   AB5's OTHER doors — the posting sheets' date boxes and the selection sheet (Astra 34, Fable S3/F5); N7, N8, N12.
   Written as assertions of the RIGHT behaviour. Usage: node scripts/handpass/ab/w3-03-postings.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'rewalk2/w3'
const L = await import('./w3-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, bidOn, tapCell, sheetPress, closeSheets, sheetNow, shot, resultBook, ROOT, toastSpy, toasts, recsOf, lwHist, reload, rowRun } = L
const PHONE = W === 'phone'
const R = resultBook(`RW-W3-03-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk2-w3-03-${W}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 3 : 1 })
await toastSpy(page)
R.note('bundle', await page.evaluate(() => [...document.scripts].map(s => s.src).filter(s => /index-/.test(s)).join(' ')))
const pic = (n) => shot(page, `w3-03-${W}-${n}`)
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await pic(`THREW-${name}`).catch(() => {}); await closeSheets(page).catch(() => {}) } }
const P = 'freak'   // Echo — nothing on him in July / August
const cls = async (iso) => page.evaluate(([p, d]) => { const c = document.querySelector(`[data-testid="cell-${p}-${d}"]`); return c ? `${(c.innerText || '').trim() || '·'}{${c.className}}` : 'NOCELL' }, [P, iso])
const row = async (isos) => { const o = []; for (const d of isos) o.push(d.slice(5) + ':' + await cls(d)); return o }
const gone = (s) => /\bgone\b/.test(s)
const fillDate = async (tid, iso) => { const f = page.locator(`[data-testid="${tid}"]:visible`).first(); await f.fill(iso); await page.waitForTimeout(500); return (await f.count()) ? f.inputValue({ timeout: 2000 }).catch(() => 'GONE') : 'GONE (the sheet closed)' }

await lwOpen(page, '2026-07-20')

/* ---- R9a: the bid sheet's PI, after a bid (so the top bar's Undo has something to name) ---- */
await step('A1-pi-bidsheet', async () => {
  await bidOn(page, P, '2026-07-27', 'LL')
  await tapCell(page, P, '2026-07-28')
  await sheetPress(page, 'bid-postin')
  await pic('A1-pi-fold')
  const v = await fillDate('pi-date', '2026-07-06')
  const c = await sheetPress(page, 'pi-confirm')
  await lwOpen(page, '2026-07-06')
  const r = await row(['2026-07-03', '2026-07-05', '2026-07-06', '2026-07-07'])
  await L.lwShot(page, `w3-03-${W}-A1-pi-hatch`, P, '2026-07-06')
  R.ck('A1-pi-bidsheet', c.sheet.open === 'nothing' && gone(r[0]) && gone(r[1]) && !gone(r[2]), 'PI from 6 Jul: the sheet closes, the days before 6 Jul wear the hatch, 6 Jul on does not (N7)', { typed: v, rows: r })
})
await step('A2-topbar-undo-after-posting', async () => {
  const before = await row(['2026-07-05'])
  const u = await lwHist(page, 'undo')
  await lwOpen(page, '2026-07-06')
  const after = await row(['2026-07-05'])
  const bid = (await recsOf(page, P, ['2026-07-27']))['2026-07-27']
  await pic('A2-after-topbar-undo')
  R.note('A2-topbar-undo-after-posting', { title: u.title, pressed: u.pressed, hatchBefore: before, hatchAfter: after, bid27: bid })
  R.ck('A2-posting-survives-undo', gone(after[0]), 'the top bar\'s Undo is the one timeline and a posting is not on it: the PI stays (R28 — recorded, not a defect)', { title: u.title, after })
  if (u.pressed) { const rd = await lwHist(page, 'redo'); R.note('A2-redo', rd) }
})

/* ---- R9b: the Post in sheet (an admin taps a day before the PI) ---- */
await step('B1-postin-sheet', async () => {
  await lwOpen(page, '2026-07-02')
  const s = await tapCell(page, P, '2026-07-02')
  await pic('B1-postin-sheet')
  R.ck('B1-postin-sheet', s.open === 'postin-sheet' && s.buttons.some(b => /^postin-undo/.test(b)) && s.buttons.some(b => /^postin-place/.test(b)), 'an admin\'s tap on a day before the PI opens the Post in sheet: its date, Undo post in, Place leave or OIL here instead…', { open: s.open, text: (s.text || '').slice(0, 200), buttons: s.buttons })
  const v = await fillDate('postin-date', '2026-07-08')
  const r = await row(['2026-07-06', '2026-07-07', '2026-07-08'])
  R.ck('B2-postin-date-moves', v === '2026-07-08' && gone(r[0]) && gone(r[1]) && !gone(r[2]), 'changing the sheet\'s date to 8 Jul commits at once — 6 and 7 Jul now hatched, the sheet stays up', { value: v, rows: r, sheet: (await sheetNow(page)).open })
  const pl = await sheetPress(page, 'postin-place')
  R.ck('B3-postin-place', pl.sheet.open === 'bid-picker', '"Place leave or OIL here instead…" hands the day to the bid sheet (N12)', { open: pl.sheet.open })
  const b = await sheetPress(page, 'bid-LL')
  let s2 = await sheetNow(page); if (s2.open === 'bid-picker' && /Tap the same leave again/i.test(s2.text)) { await sheetPress(page, 'bid-LL'); s2 = await sheetNow(page) }
  const c = await cls('2026-07-02')
  await L.lwShot(page, `w3-03-${W}-B3-leave-before-pi`, P, '2026-07-02')
  R.ck('B4-leave-before-pi', /LL/.test(c) && gone(c), 'leave placed on a day before the PI shows as LL on the still-hatched day (answer C, N8 — the dates gate nothing)', { cell: c, sheet: s2.open })
  await closeSheets(page)
})

/* ---- R9a: the bid sheet's PO, then R9b: the Post out sheet ---- */
await step('C1-po-bidsheet', async () => {
  await lwOpen(page, '2026-08-10')
  await tapCell(page, P, '2026-08-05')
  await sheetPress(page, 'bid-postout')
  const v = await fillDate('po-date', '2026-08-10')
  await sheetPress(page, 'po-archive')                       // off: keep him on the roster (the custom case)
  await pic('C1-po-fold')
  const c = await sheetPress(page, 'po-confirm')
  await lwOpen(page, '2026-08-10')
  const r = await row(['2026-08-09', '2026-08-10', '2026-08-12'])
  await L.lwShot(page, `w3-03-${W}-C1-po-grey`, P, '2026-08-10')
  R.ck('C1-po-bidsheet', c.sheet.open === 'nothing' && !gone(r[0]) && gone(r[1]) && /PO/.test(r[2]), 'PO from 10 Aug: 9 Aug is his, 10 Aug on greyed and marked PO', { typed: v, rows: r })
})
await step('C2-postout-sheet', async () => {
  const s = await tapCell(page, P, '2026-08-12')
  await pic('C2-postout-sheet')
  R.ck('C2-postout-sheet', s.open === 'postout-sheet' && s.buttons.some(b => /^postout-undo/.test(b)) && s.buttons.some(b => /^postout-place/.test(b)), 'an admin\'s tap on a greyed day opens the Post out sheet: date, Archive, Undo post out, Place leave or OIL here instead…', { open: s.open, text: (s.text || '').slice(0, 220), buttons: s.buttons })
  const v = await fillDate('postout-date', '2026-08-14')
  const r = await row(['2026-08-12', '2026-08-13', '2026-08-14'])
  const after = await sheetNow(page)
  await pic('C3-after-po-date-moved-past-tapped-day')
  R.ck('C3-postout-date-moves', !gone(r[0]) && !gone(r[1]) && gone(r[2]), 'moving the PO date to 14 Aug gives him back 12–13 Aug at once', { value: v, rows: r })
  R.ck('C3b-postout-sheet-stays', after.open === 'postout-sheet', 'the Post out sheet stays up while its date is changed ("commits on change — the sheet stays up so the admin can see the grid move")', { open: after.open, text: (after.text || '').slice(0, 160) })
  await closeSheets(page)
  await tapCell(page, P, '2026-08-17')
  const pl = await sheetPress(page, 'postout-place')
  const b = await sheetPress(page, 'bid-LL')
  let s2 = await sheetNow(page); if (s2.open === 'bid-picker' && /Tap the same leave again/i.test(s2.text)) { await sheetPress(page, 'bid-LL'); s2 = await sheetNow(page) }
  const c = await cls('2026-08-17')
  await L.lwShot(page, `w3-03-${W}-C4-clearing-leave`, P, '2026-08-17')
  R.ck('C4-clearing-leave', pl.sheet.open === 'bid-picker' && /LL/.test(c), 'clearing leave after the PO through "Place leave or OIL here instead…" (N12)', { place: pl.sheet.open, cell: c })
  await closeSheets(page)
})

/* ---- AB5's other doors: a window that would close before it opens ---- */
await step('D1-postout-datebox-before-pi', async () => {
  await tapCell(page, P, '2026-08-20')
  const v = await fillDate('postout-date', '2026-07-01')        // before his PI (8 Jul)
  const s = await sheetNow(page)
  await pic('D1-postout-datebox-refused')
  const r = await row(['2026-08-13', '2026-08-14'])
  R.ck('D1-postout-datebox-says-why', /has to be|can.t|cannot|must/i.test(s.text || '') && !/2026-07-01/.test(v),
    'AB5 (Post out sheet\'s date box): a PO before the PI is refused AND the sheet says why — not a silent snap-back', { valueAfter: v, sheet: (s.text || '').slice(0, 260), rows: r })
  await closeSheets(page)
})
await step('D2-postin-datebox-after-po', async () => {
  await lwOpen(page, '2026-07-02')
  await tapCell(page, P, '2026-07-03')
  const v = await fillDate('postin-date', '2026-08-20')         // after his PO (14 Aug)
  const s = await sheetNow(page)
  await pic('D2-postin-datebox-refused')
  R.ck('D2-postin-datebox-says-why', /has to be|can.t|cannot|must/i.test(s.text || '') && !/2026-08-20/.test(v),
    'AB5 (Post in sheet\'s date box): a PI after the PO is refused AND the sheet says why', { valueAfter: v, sheet: (s.text || '').slice(0, 260) })
  await closeSheets(page)
})
await step('D3-selection-po-before-pi', async () => {
  await lwOpen(page, '2026-07-20')
  const sel = await L.dragRect(page, P, '2026-07-20', P, '2026-07-22')
  const po = await L.selPress(page, 'sel-postout')
  const v = await fillDate('sel-po-date', '2026-07-01')
  await pic('D3-selection-po-fold')
  const c = await L.selPress(page, 'sel-po-confirm')
  const s = await sheetNow(page)
  await pic('D3-selection-po-after')
  /* RW: the fix keeps the selection sheet up with its sentence (the premise the old script had — it closed — is gone),
     so close it through its own ✕ before going to August to read the rows */
  await closeSheets(page)
  await lwOpen(page, '2026-08-13')
  const r = await row(['2026-08-13', '2026-08-14'])
  R.ck('D3-selection-po-says-why', s.open === 'select-sheet' && /has to be|can.t|cannot|must/i.test(s.text || ''),
    'AB5 (drag-selection\'s Post out, Astra 34): a PO before the PI keeps the sheet open and says why', { sel: sel.open, typed: v, open: s.open, text: (s.text || '').slice(0, 260), rows: r })
})
await step('D4-bidsheet-po-before-pi', async () => {
  await lwOpen(page, '2026-07-20')
  await tapCell(page, P, '2026-07-21')
  await sheetPress(page, 'bid-postout')
  await fillDate('po-date', '2026-07-01')
  const c = await sheetPress(page, 'po-confirm')
  await pic('D4-bidsheet-po-refused')
  R.ck('D4-bidsheet-po-says-why', c.sheet.open === 'bid-picker' && /has to be|can.t|cannot|must/i.test(c.sheet.text || ''), 'AB5 (bid sheet, already reproduced by the host): the sheet stays and says why', { open: c.sheet.open, text: (c.sheet.text || '').slice(0, 200) })
  await closeSheets(page)
})

/* ---- R9c works when the date is fine; each posting's own Undo; reload ---- */
await step('E1-selection-po-ok', async () => {
  const sel = await L.dragRect(page, 'beams', '2026-07-20', 'beams', '2026-07-21')
  await L.selPress(page, 'sel-postout')
  await fillDate('sel-po-date', '2026-09-01')
  const c = await L.selPress(page, 'sel-po-confirm')
  await pic('E1-selection-po-ok')
  await lwOpen(page, '2026-08-31'); await page.waitForTimeout(600)
  const r = await rowRun(page, 'beams', ['2026-08-31', '2026-09-01'])
  const cl = await page.evaluate(() => ['2026-08-31', '2026-09-01'].map(d => { const c = document.querySelector(`[data-testid="cell-beams-${d}"]`); return c ? c.className : 'NOCELL' }))
  r.push(...cl)
  R.ck('E1-selection-po-ok', c.sheet.open === 'nothing' && !gone(r[2]) && gone(r[3]), 'the drag-selection\'s Post out for one man posts him out from the date typed (R9c)', { rows: r })
})
await step('E2-own-undos', async () => {
  await reload(page); await lwOpen(page, '2026-08-14')
  const kept = await row(['2026-07-07', '2026-08-14'])
  R.ck('E2-reload-keeps-postings', gone(kept[0]) && gone(kept[1]), 'after a reload both postings stand (PI 8 Jul, PO 14 Aug)', kept)
  await tapCell(page, P, '2026-08-20')
  await sheetPress(page, 'postout-undo')
  await lwOpen(page, '2026-07-06')
  await tapCell(page, P, '2026-07-03')
  await sheetPress(page, 'postin-undo')
  await lwOpen(page, '2026-07-06')
  const r1 = await row(['2026-07-03', '2026-07-07'])
  await lwOpen(page, '2026-08-14')
  const r2 = await row(['2026-08-14', '2026-08-20'])
  await L.lwShot(page, `w3-03-${W}-E2-undone`, P, '2026-08-14')
  R.ck('E2-own-undos', !gone(r1[0]) && !gone(r1[1]) && !gone(r2[0]) && !gone(r2[1]) && /LL/.test(r2[1] + (await cls('2026-08-17'))), 'each posting\'s own Undo clears it; the leave placed outside the dates stays', { pi: r1, po: r2, aug17: await cls('2026-08-17') })
})
R.note('toasts', await toasts(page))
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
