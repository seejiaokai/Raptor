/* W4 — MONEY around the posting dates, a notice-only day and the pilots' 15-day run (26 Sep 26). Old plan batch
   F2–F5, Fable S26, Astra 26. Every record through the app's own controls (the bid sheet's PI / PO row, the war's bid,
   the Inputs page form and its table's ✕). After every step the figure readers are read and must agree.
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w4-02-postings.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'w4'
const L = await import('./w4-lib.mjs')
const { openW4, fileInput, lwOpen, tapDay, closeSheets, sheetPress, sheetNow, shot, resultBook, ROOT, readAll, manningOn, manningDelta, top, cellOf, inputsWindow, deleteInputRow, lwShot, bidOn, rowRun, toastSpy, toasts } = L
const PHONE = W === 'phone'
const R = resultBook(`W4-post-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-w4-postings-${W}.txt`)
const { browser, page, errors } = await openW4({ phone: PHONE, who: 'a' })
await toastSpy(page)
const P = n => `w4-post-${W}-${n}`
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).split('\n')[0].slice(0, 300)); await shot(page, P(`THREW-${name}`)).catch(() => {}); await closeSheets(page).catch(() => {}) } }
const lines = s => (s.lines || []).map(x => x.slice(0, 100))
/* a sheet button: by finger on the phone (a mouse click on the PI sheet's confirm timed out there), by mouse on a desktop */
const press = async t => PHONE ? { pressed: (await L.fingerTap(page, `[data-testid="${t}"]`)).ok } : sheetPress(page, t)
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b)

/* the August event line, for the record: which days the war calls a holiday (a PH changes what a WSO's run charges) */
await lwOpen(page, '2026-08-03')
const evAug = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="event-"]')].filter(e => /2026-08-(0\d|1[0-7])$/.test(e.getAttribute('data-testid')) && (e.innerText || '').trim()).map(e => e.getAttribute('data-testid') + '=' + e.innerText.trim()))
R.note('aug-events', evAug)

/* F2 (Codex) — a POSTED-OUT man with two half-day leaves on one day: Trident (harpoon) posted out from Sat 1 Aug (the
   archive switch off, so his row stays), then LL morning + OL afternoon on Mon 3 Aug. Expected (answer C): both show,
   both charge (LVE −1 in all), manning unchanged (he is off the manpower already). */
await step('F2', async () => {
  const id = 'harpoon', d = '2026-08-03'
  /* his figures BEFORE, read while he is still drawn: once posted out, his row leaves every month after the one
     holding his last day until a record is dated out there (the 19 Aug rule as narrowed — CURRENT-STATE §5) */
  await lwOpen(page, d)
  const m0 = await manningOn(page, d)
  const r0 = await readAll(page, id, d, { bd: ['lve'] })
  await lwOpen(page, d)
  const t = await tapDay(page, PHONE, id, d)
  const po = await press('bid-postout')
  await page.locator('[data-testid="po-date"]').fill('2026-08-01'); await page.waitForTimeout(200)
  if ((await page.locator('[data-testid="po-archive"]').getAttribute('aria-pressed')) === 'true') await press('po-archive')
  await shot(page, P('F2-po-sheet'))
  const c = await press('po-confirm')
  await closeSheets(page)
  const mPO = await manningOn(page, d)
  await lwOpen(page, '2026-07-31')
  const julRow = await rowRun(page, id, ['2026-07-30', '2026-07-31'])
  await lwOpen(page, d)
  const augRow = await rowRun(page, id, ['2026-08-01', '2026-08-03'])
  await shot(page, P('F2-after-po-aug'))
  R.note('F2-posted-out', { tap: t.open, po: po.pressed, confirm: c.pressed, before: r0.cell, julRow, augRow, manningFellByPO: manningDelta(m0, mPO) })
  R.ck('F2-po-leaves-manning', Object.values(manningDelta(m0, mPO)).some(v => v < 0), 'posting out takes him off the manpower from 1 Aug (his rows fall on 3 Aug)', manningDelta(m0, mPO))
  const a = await fileInput(page, { person: id, type: 'LL', from: d, span: 'am', remarks: 'W4 F2 clearing LL morning' })
  const b = await fileInput(page, { person: id, type: 'OL', from: d, span: 'pm', remarks: 'W4 F2 clearing OL afternoon' })
  await lwOpen(page, d)
  const m1 = await manningOn(page, d)
  const r1 = await readAll(page, id, d, { bd: ['lve'] })
  const tl = await tapDay(page, PHONE, id, d)
  await shot(page, P('F2-taplist'))
  await closeSheets(page)
  R.ck('F2-filed', a.added === 1 && b.added === 1, 'both halves filed after the posting-out date (nothing gates them — N8)', { a: [a.added, a.toast], b: [b.added, b.toast] })
  R.ck('F2-both-show', /LL|OL/.test(r1.cell.box) && r1.cell.mark === '+1' && tl.open === 'daylist-sheet' && (tl.lines || []).length === 2, 'the box shows one half with a grey +1 and the PO tag; the list shows both halves', { cell: r1.cell, open: tl.open, lines: lines(tl) })
  R.ck('F2-both-charge', top(r1.sheet.lve) === top(r0.sheet.lve) - 1 && r1.agree, 'LVE −1 in all (each half charges its 0.5), every reader agreeing', { before: r0.sheet.lve, after: r1.sheet.lve, bd: r1.breakdown.lve, disagree: r1.disagree })
  R.ck('F2-manning-unchanged', eq(mPO, m1), 'filing the two halves does not move the manning count (he is already off the manpower)', manningDelta(mPO, m1))
  await lwShot(page, P('F2-box'), id, d)
})

/* F3 (Fable) — leave dated BEFORE a posting-in: Vandal (split) posted in from Mon 10 Aug, then LL on Wed 5 Aug.
   Expected: the leave code in an otherwise blank box, it charges (LVE −1), and manning never counts him that day. */
await step('F3', async () => {
  const id = 'split', d = '2026-08-05'
  await lwOpen(page, '2026-08-10')
  const t = await tapDay(page, PHONE, id, '2026-08-10')
  const pi = await press('bid-postin')
  await page.locator('[data-testid="pi-date"]').fill('2026-08-10'); await page.waitForTimeout(200)
  await shot(page, P('F3-pi-sheet'))
  const c = await press('pi-confirm')
  await closeSheets(page)
  await lwOpen(page, d)
  const m0 = await manningOn(page, d)
  const r0 = await readAll(page, id, d, { bd: ['lve'] })
  const a = await fileInput(page, { person: id, type: 'LL', from: d, span: 'all', remarks: 'W4 F3 leave before posting in' })
  await lwOpen(page, d)
  const m1 = await manningOn(page, d)
  const r1 = await readAll(page, id, d, { bd: ['lve'] })
  R.note('F3-posted-in', { tap: t.open, pi: pi.pressed, confirm: c.pressed, before: r0.cell, row: await rowRun(page, id, ['2026-08-05', '2026-08-07', '2026-08-10']) })
  R.ck('F3-shows', a.added === 1 && /^LL$/.test(r1.cell.box), 'the leave shows (LL) in the not-yet-arrived box', { added: a.added, toast: a.toast, cell: r1.cell })
  R.ck('F3-charges', top(r1.sheet.lve) === top(r0.sheet.lve) - 1 && r1.agree, 'it charges: LVE −1, every reader agreeing', { before: r0.sheet.lve, after: r1.sheet.lve, disagree: r1.disagree })
  R.ck('F3-manning-never', eq(m0, m1), 'manning does not move — a man not yet posted in is never counted, with or without leave', manningDelta(m0, m1))
  await lwShot(page, P('F3-box'), id, d)
})

/* F4 (Fable) — a day holding ONLY a notice: Ace (dj) Tue 4 Aug — a whole-day LL bid on the war, then an LL filed on
   the Inputs page for the same day (it replaces the bid and leaves a notice), then that input deleted from the Inputs
   table. Expected: an empty box with an AMBER mark; the list still opens on it and says what happened; OK, seen
   clears it; the figures follow each step (bid charges, filed leave charges once, nothing charges at the end). */
await step('F4', async () => {
  const id = 'dj', d = '2026-08-04'
  await lwOpen(page, d)
  const r0 = await readAll(page, id, d, { bd: ['lve'] })
  const bid = await bidOn(page, id, d, 'LL')
  const r1 = await readAll(page, id, d, { bd: ['lve'] })
  const f = await fileInput(page, { person: id, type: 'LL', from: d, span: 'all', remarks: 'W4 F4 filed over the bid' })
  await lwOpen(page, d)
  const r2 = await readAll(page, id, d, { bd: ['lve'] })
  await inputsWindow(page, d, d)
  const del = await deleteInputRow(page, f.iid)
  await lwOpen(page, d)
  const r3 = await readAll(page, id, d, { bd: ['lve'] })
  const tl = await tapDay(page, PHONE, id, d)
  await shot(page, P('F4-notice-only-list'))
  R.ck('F4-bid-charges', bid.placed && top(r1.sheet.lve) === top(r0.sheet.lve) - 1 && r1.agree, 'the undecided LL bid charges LVE −1 (worst case), readers agree', { bid, before: r0.sheet.lve, after: r1.sheet.lve, cell: r1.cell })
  R.ck('F4-replaced-charged-once', f.added === 1 && top(r2.sheet.lve) === top(r0.sheet.lve) - 1 && r2.cell.amber && r2.agree, 'the filed LL replaces the bid: still LVE −1 (charged once, not twice), the box amber (the notice)', { toast: f.toast, cell: r2.cell, lve: r2.sheet.lve, disagree: r2.disagree })
  R.ck('F4-notice-only-box', del.deleted && r3.cell.box === '' && r3.cell.mark === '!' && r3.cell.amber, 'after the input is deleted: an EMPTY box with an amber !', { del, cell: r3.cell })
  R.ck('F4-notice-only-figures', top(r3.sheet.lve) === top(r0.sheet.lve) && r3.agree, 'nothing charges now — LVE back where it started', { start: r0.sheet.lve, now: r3.sheet.lve, disagree: r3.disagree })
  R.ck('F4-list-opens', tl.open === 'daylist-sheet' && (tl.lines || []).length === 1 && /replaced/.test(tl.lines[0] || ''), 'the list still opens on the empty box and names the replaced bid', { open: tl.open, lines: lines(tl), text: (tl.text || '').slice(0, 200) })
  const ok = await sheetPress(page, /OK, seen/)
  await closeSheets(page)
  const r4 = await cellOf(page, id, d)
  R.ck('F4-seen-clears', ok.pressed && r4.box === '' && r4.mark === '', '"OK, seen" clears the notice — the box is plain empty', { ok: ok.pressed, cell: r4 })
  await lwShot(page, P('F4-after-seen'), id, d)
})

/* F5 / Fable S26 / Astra 26 — the pilots' 15-day run (H4, N6). The same fifteen days, 1–15 Aug (three weekends' worth:
   Sat 1, Sun 2, Sat 8, Sun 9, Sat 15), filed three ways on the Inputs page:
     Blade (slash, pilot):       LL 1–7, LL 8 morning + OL 8 afternoon, LL 9–15 → 15 days charged (weekends inside)
     Static (wolf, WSO):         the same                                        → working days only
     Sidewinder (mamba, pilot):  LL 1–7, LL 8 MORNING ONLY, LL 9–15              → the half day breaks the run: working days only */
await step('F5', async () => {
  const runs = [
    { id: 'slash', who: 'pilot, split day', split: true, want: 'all15' },
    { id: 'wolf', who: 'WSO, split day', split: true, want: 'working' },
    { id: 'mamba', who: 'pilot, half day', split: false, want: 'working' },
  ]
  /* working days 1–15 Aug by the war's own calendar: weekdays, less any PH the event line names (read above) */
  const days = Array.from({ length: 15 }, (_, i) => `2026-08-${String(i + 1).padStart(2, '0')}`)
  const wk = d => { const w = new Date(d + 'T00:00:00Z').getUTCDay(); return w !== 0 && w !== 6 }
  const working = days.filter(d => wk(d) && !evAug.some(x => x.includes(d) && /PH/i.test(x))).length
  R.note('F5-working-days', { working, ph: evAug.filter(x => /PH/i.test(x)) })
  for (const k of runs) {
    await lwOpen(page, '2026-08-01')
    const r0 = await readAll(page, k.id, null, { bd: ['lve'], drawer: false })
    const got = []
    got.push(await fileInput(page, { person: k.id, type: 'LL', from: '2026-08-01', to: '2026-08-07', span: 'all', remarks: `W4 F5 ${k.id} run a` }))
    got.push(await fileInput(page, { person: k.id, type: 'LL', from: '2026-08-08', span: 'am', remarks: `W4 F5 ${k.id} 8 Aug morning` }))
    if (k.split) got.push(await fileInput(page, { person: k.id, type: 'OL', from: '2026-08-08', span: 'pm', remarks: `W4 F5 ${k.id} 8 Aug afternoon` }))
    got.push(await fileInput(page, { person: k.id, type: 'LL', from: '2026-08-09', to: '2026-08-15', span: 'all', remarks: `W4 F5 ${k.id} run b` }))
    await lwOpen(page, '2026-08-08')
    const r1 = await readAll(page, k.id, '2026-08-08', { bd: ['lve'] })
    const taken = Math.round((top(r1.sheet.lvetot) - top(r0.sheet.lvetot)) * 10) / 10
    const want = k.want === 'all15' ? 15 : working
    R.ck(`F5-${k.id}`, got.every(g => g.added === 1) && taken === want && r1.agree, `${k.who}: LVE TOT rises by ${want}${k.want === 'all15' ? ' (a pilot\'s 15-day run charges every day, weekends included)' : ' (working days only)'}`, { filed: got.map(g => g.added), taken, lve: [r0.sheet.lve, r1.sheet.lve], lvetot: [r0.sheet.lvetot, r1.sheet.lvetot], split8: r1.cell, bd: r1.breakdown.lve, disagree: r1.disagree })
    await lwShot(page, P(`F5-${k.id}-run`), k.id, '2026-08-08')
  }
})

R.note('toasts', await toasts(page))
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
