/* The absence-record re-test — HOST H2 (26 Sep 26): reproduce Fable's CONFIRMED findings through the real screens,
   on the exact build (bug-check order §4 "what to do with what they hand back", step 1). Written as assertions of the
   RIGHT behaviour, so this script FAILS while the defect is there and PASSES once fixed — re-running it IS the re-walk.
     F1  the bid sheet's Clear, on a day holding an OIL award, must keep the award
     F3  a leave cut by a medical keeps a "till <date>" that no longer matches its dates
     F5  a posting that would close before it opens: the sheet must say why, not close silently
   (F2 — bulk Delete — and F4 — the calendar drag of a medical — need a real drag; their own scripts.)
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/ab-h2-fable-repro.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = `rewalk/host/h2-${W}`
const L = await import('./ab-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, lwAward, tapCell, sheetPress, closeSheets, sheetNow, figures, fileInput, inputsOf, shot, resultBook, ROOT, rowRun, toastSpy, toasts } = L
const PHONE = W === 'phone'
const R = resultBook(`H2-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-h2-${W}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 3 : 1 })
await toastSpy(page)
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await shot(page, `h2-THREW-${name}`).catch(() => {}) } }

/* F1 — Ranger (bane), Tue 21 Jul: an award alone, then the bid sheet's Clear */
await step('F1', async () => {
  const P = 'bane', D = '2026-07-21'
  await lwOpen(page, D)
  const g = await lwAward(page, P, D, '1', 'H2 callout')
  const before = { cell: await L.lwCell(page, P, D), figs: await figures(page, P) }
  const t = await tapCell(page, P, D)
  await shot(page, 'h2-F1-sheet-before-clear')
  const c = await sheetPress(page, 'bid-clear')
  await closeSheets(page)
  const after = { cell: await L.lwCell(page, P, D), figs: await figures(page, P) }
  R.note('F1-setup', { given: g, sheet: t.open, sheetText: (t.text || '').slice(0, 200), clearPressed: c.pressed })
  R.ck('F1-clear-keeps-award', /FO|HO/.test(after.cell.box) && after.figs.oil === before.figs.oil,
    'the bid sheet\'s Clear leaves the day\'s OIL award (the award has its own Remove)', { before: { box: before.cell.box, oil: before.figs.oil }, after: { box: after.cell.box, oil: after.figs.oil } })
  await L.lwShot(page, 'h2-F1-after-clear', P, D)
})

/* F3 — a leave with a "till" in its remark, cut by a medical: each piece's words must match its dates */
await step('F3-typed', async () => {
  const P = 'bapster'
  const a = await fileInput(page, { person: P, type: 'LL', from: '2026-07-20', to: '2026-07-24', remarks: 'Bali till 24 Jul' })
  const b = await fileInput(page, { person: P, type: 'ATT C', from: '2026-07-22', to: '2026-07-23', remarks: 'H2 sick' })
  const pieces = (await inputsOf(page, P)).filter(x => x.type === 'LL')
  R.note('F3-typed-pieces', { filed: [a.added, b.added], toastB: b.toast, pieces })
  const bad = pieces.filter(x => { const m = /till (\d+) Jul/.exec(x.remarks); const end = +(x.endDate || x.date).split(' ')[1]; return m && +m[1] !== end })
  R.ck('F3-typed-till-follows-cut', pieces.length === 2 && !bad.length, 'each leave piece\'s "till <date>" matches its own last day after the medical cut', pieces.map(x => `${x.date}${x.endDate ? '–' + x.endDate : ''}: "${x.remarks}"`))
})
await step('F3-war-approved', async () => {
  const P = 'haowen', A = '2026-07-27', B = '2026-07-31'
  await lwOpen(page, A)
  /* a five-day bid through the bid sheet's own range, then Approve */
  const t = await tapCell(page, P, A)
  let r = await sheetPress(page, 'span-range')
  const picked = await page.evaluate(() => [...document.querySelectorAll('.bidsheet[role="dialog"] [data-testid$="-day-2026-07-31"]')].map(e => e.getAttribute('data-testid')))
  if (picked.length) { await page.locator(`[data-testid="${picked[0]}"]`).first().click(); await page.waitForTimeout(300) }
  r = await sheetPress(page, 'bid-LL')
  await closeSheets(page)
  await tapCell(page, P, A); const ap = await sheetPress(page, 'decide-approve'); await closeSheets(page)
  const approved = (await inputsOf(page, P)).filter(x => x.type === 'LL')
  const m = await fileInput(page, { person: P, type: 'ATT C', from: '2026-07-29', remarks: 'H2 sick mid-leave' })
  const pieces = (await inputsOf(page, P)).filter(x => x.type === 'LL')
  R.note('F3-war-setup', { tap: t.open, rangePick: picked, approve: ap.pressed, approved, medical: m.added, toast: m.toast })
  const bad = pieces.filter(x => { const mm = /till (\d+) Jul/.exec(x.remarks); const end = +(x.endDate || x.date).split(' ')[1]; return mm && +mm[1] !== end })
  R.ck('F3-war-till-follows-cut', pieces.length >= 2 && !bad.length, 'the war-approved leave\'s pieces each say "till" their own last day after the medical cut', pieces.map(x => `${x.date}${x.endDate ? '–' + x.endDate : ''}: "${x.remarks}"`))
})

/* F5 — Post in from 1 Jun, then Post out from 1 May (before it): the sheet must say why */
await step('F5', async () => {
  const P = 'bane', D = '2026-07-28'
  await lwOpen(page, D)
  await tapCell(page, P, D)
  await sheetPress(page, 'bid-postin')
  await page.locator('[data-testid="pi-date"]').fill('2026-06-01'); await page.waitForTimeout(200)
  const pi = await sheetPress(page, 'pi-confirm')
  const afterPi = await sheetNow(page)
  await closeSheets(page)
  await tapCell(page, P, D)
  await sheetPress(page, 'bid-postout')
  await page.locator('[data-testid="po-date"]').fill('2026-05-01'); await page.waitForTimeout(200)
  await shot(page, 'h2-F5-po-before-confirm')
  const po = await sheetPress(page, 'po-confirm')
  const s = await sheetNow(page)
  await shot(page, 'h2-F5-po-after-confirm')
  const said = s.open !== 'nothing' && /posting|post(ed)? in|before|after/i.test(s.text || '')
  R.note('F5-setup', { piPressed: pi.pressed, afterPi: afterPi.open, poPressed: po.pressed })
  R.ck('F5-refusal-said', said, 'a Post out dated before the Post in keeps the sheet open and says why', { open: s.open, text: (s.text || '').slice(0, 300) })
  await closeSheets(page)
  await lwOpen(page, '2026-05-04')
  R.note('F5-may-row', await rowRun(page, P, ['2026-05-01', '2026-05-04', '2026-06-01']))
})

R.note('toasts', await toasts(page))
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
