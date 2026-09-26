/* W1-03 (26 Sep 26) — the Inputs CALENDAR's other doors, desktop, as the admin (Saber): a COURSE and OVERSEAS DUTY
   dragged onto a pending bid (H1: they leave a bid alone), leave dragged onto a course (Q8), hold-to-add (C3: exactly
   that date, never a range, never the neighbour; a hold never also opens the day popover), the noon rule through the
   hold-to-add dialog and the Inputs form (N1, Fable S21), a tap (the popover), "+N more", and the month swipe (50 px
   sideways pages the month; a short or vertical drag does not). Every check is the RIGHT behaviour: a FAIL is a finding.
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w1-03-desk-cal-doors.mjs [step,step] */
process.env.AB_WHO = 'w1'
const L = await import('./w1-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, bidOn, tapCell, closeSheets, fileInput, inputsOf, shot, resultBook, ROOT, toastSpy, toasts,
  calOpen, calMonth, mouseDragChip, mouseGesture, chipDays, cellChips, dragLeft, emptyAt, warRead, lwCell, undoRedo, addDialog, popover } = L
const R = resultBook('W1-03-desk', `${ROOT}/docs/handpass/parts/2026-09-26-absence-w1-03-desk.txt`)
const { browser, page, errors } = await openHi({ width: 1440, height: 900, who: 'a', dpr: 1 })
await toastSpy(page)
const ONLY = (process.argv[2] || '').split(',').filter(Boolean)
async function step(name, fn) { if (ONLY.length && !ONLY.some(k => name.startsWith(k))) return; try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await shot(page, `w1-03-THREW-${name}`).catch(() => {}) } }
const clean = s => (s || '').replace(/\s+/g, ' ').trim()
const file = async f => { await L.inputsView(page, 'list'); return fileInput(page, f) }
const cellOf = async (P, D) => { await lwOpen(page, D); return lwCell(page, P, D) }
const warShot = async (name, P, D) => { await lwOpen(page, D); return L.lwShot(page, name, P, D) }
const bid = async (P, D, code, o) => { await lwOpen(page, D); const r = await bidOn(page, P, D, code, o); if (!r.placed) R.note('bid-not-placed', { P, D, r }); return r }
const dayList = async (P, D) => { await lwOpen(page, D); const s = await tapCell(page, P, D); await closeSheets(page); return s }
/* the war's manning counts on one date: every count row's figure (bodies away are read as the change between two reads) */
const manning = async D => { await lwOpen(page, D); return page.evaluate(d => Object.fromEntries([...document.querySelectorAll(`[data-testid^="count-"][data-testid$="-${d}"]`)].map(e => [e.getAttribute('data-testid').replace(`-${d}`, ''), (e.innerText || '').replace(/\s+/g, ' ').trim()])), D) }
const closeDialog = async () => { if (await page.locator('#inpEditCancel:visible').count()) { await page.locator('#inpEditCancel').click(); await page.waitForTimeout(300) } }
const closePop = async () => { if (await page.locator('#icPopClose:visible').count()) { await page.locator('#icPopClose').click(); await page.waitForTimeout(300) } }

/* ---- H1: a COURSE dragged onto a pending bid leaves the bid alone (no notice, no message about a bid) ---- */
await step('CSE', async () => {
  const P = 'mamba', W = '2026-07-29'
  const b = await bid(P, W, 'LL')
  const f = await file({ person: P, type: 'CSE', from: '2026-07-20', to: '2026-07-22', remarks: 'W1 course' })
  const before = await warRead(page, P, ['2026-07-20', '2026-07-21', '2026-07-22', '2026-07-27', '2026-07-28', W])
  await calOpen(page, '2026-07'); await toasts(page)
  /* grabbed by its MIDDLE day (21) and dropped on 28: the whole span slides by 7 days (the chip's grab day decides) */
  const g = await mouseDragChip(page, f.iid, '2026-07-21', '2026-07-28')
  const t = await toasts(page)
  const days = await chipDays(page, f.iid)
  await shot(page, 'w1-03-cse-cal-after')
  R.ck('CSE-slides', days.join() === '2026-07-27,2026-07-28,2026-07-29', 'the three-day course grabbed by its middle day slides a week: 27-29 Jul', { days, t })
  const after = await warRead(page, P, ['2026-07-20', '2026-07-21', '2026-07-22', '2026-07-27', '2026-07-28', W])
  const s = await dayList(P, W)
  const c = await cellOf(P, W)
  await warShot('w1-03-cse-war-after', P, W)
  R.ck('CSE-bid-kept', (s.lines || []).some(l => /bid, not decided/i.test(l)) && c.mark !== '!' && !t.some(x => /bid/i.test(x)), 'H1: a course leaves the LL bid on 29 Jul alone — still an undecided bid, no notice, no message', { c, lines: s.lines, t })
  R.note('CSE-war', { before, after, bid: b.placed })
})

/* ---- H1: OVERSEAS DUTY dragged onto a morning bid leaves it alone ---- */
await step('OD', async () => {
  const P = 'shaft', D0 = '2026-08-03', D2 = '2026-08-05'
  const b = await bid(P, D2, 'LL', { portion: 'am' })
  const f = await file({ person: P, type: 'OD', from: D0, remarks: 'W1 OD' })
  await calOpen(page, '2026-08'); await toasts(page)
  const g = await mouseDragChip(page, f.iid, D0, D2)
  const t = await toasts(page)
  const days = await chipDays(page, f.iid)
  const s = await dayList(P, D2)
  const c = await cellOf(P, D2)
  await warShot('w1-03-od-war-after', P, D2)
  R.ck('OD-moved', days.join() === D2, 'the OD lands on 5 Aug', { days, t })
  R.ck('OD-bid-kept', (s.lines || []).some(l => /bid, not decided/i.test(l)) && c.mark !== '!', 'H1: overseas duty leaves the morning LL bid alone — no notice', { c, lines: s.lines, t })
  R.note('OD-war', await warRead(page, P, [D0, D2]))
})

/* ---- Q8: leave dragged onto a course day is allowed; the leave is the box, the course behind the count ---- */
await step('Q8', async () => {
  const P = 'chaps', C0 = '2026-08-10', C1 = '2026-08-12', L0 = '2026-08-07', L1 = '2026-08-11'
  const c = await file({ person: P, type: 'CSE', from: C0, to: C1, remarks: 'W1 Q8 course' })
  const l = await file({ person: P, type: 'LL', from: L0, remarks: 'W1 Q8 leave' })
  const before = await warRead(page, P, [L0, C0, L1, C1])
  await calOpen(page, '2026-08'); await toasts(page)
  const g = await mouseDragChip(page, l.iid, L0, L1)
  const t = await toasts(page)
  const days = await chipDays(page, l.iid)
  const after = await warRead(page, P, [L0, C0, L1, C1])
  const cell = await cellOf(P, L1)
  await warShot('w1-03-q8-war-after', P, L1)
  R.ck('Q8-allowed', days.join() === L1, 'LL lands on 11 Aug inside the course (Q8)', { days, t })
  R.ck('Q8-ladder', /LL/.test(cell.box) && /\+1/.test(cell.mark), 'the leave shows as the box, the course sits behind "+1"', cell)
  R.ck('Q8-charged', before.bal.bal === after.bal.bal, 'still one leave day charged (it moved, not doubled)', { before: before.bal, after: after.bal })
})

/* ---- C3: hold-to-add files exactly that date; a hold never also opens the popover; the neighbour is never taken ---- */
await step('C3', async () => {
  await calOpen(page, '2026-08')
  const D = '2026-08-18'
  const p = await emptyAt(page, D)
  await toasts(page)
  await mouseGesture(page, p, null, { holdMs: 650 })
  const dlg = await addDialog(page), pop = await popover(page)
  await shot(page, 'w1-03-c3-hold-dialog')
  R.ck('C3-dialog', dlg.open && /18 Aug|Aug 18/.test(dlg.title) && !pop.open, 'a 650 ms hold on empty space opens the add dialog for 18 Aug — and NOT the day popover as well', { dlg, pop })
  /* file it: Recon, LL, all day */
  await page.selectOption('#inpEditPerson', 'prism')
  await page.selectOption('#inpEditType', 'LL')
  const before = await page.evaluate(() => window.INPUTS.map(x => x.iid))
  await page.locator('#inpEditSave').click(); await page.waitForTimeout(700)
  const fresh = await page.evaluate(b => window.INPUTS.filter(x => !b.includes(x.iid)).map(x => ({ iid: x.iid, person: x.person, type: x.type, date: x.date, endDate: x.endDate || '', allday: x.allday })), before)
  R.ck('C3-exact-date', fresh.length === 1 && fresh[0].date === 'Aug 18' && !fresh[0].endDate, 'exactly ONE input, dated 18 Aug, no end date (never a range)', fresh)
  const days = fresh[0] ? await chipDays(page, fresh[0].iid) : []
  R.ck('C3-drawn-on-day', days.join() === D, 'its chip sits on 18 Aug only', days)
  /* the neighbour: a hold at the very right edge of Wed 19 Aug still files 19, never Thu 20 */
  const D2 = '2026-08-19'
  const e = await page.evaluate(d => { const c = document.querySelector(`#inpCal [data-icday="${d}"]`).getBoundingClientRect(); return { x: c.right - 3, y: c.bottom - 6 } }, D2)
  const edgeHit = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest('[data-icday]')?.getAttribute('data-icday'), e)
  await mouseGesture(page, e, null, { holdMs: 650 })
  const dlg2 = await addDialog(page)
  R.ck('C3-edge', dlg2.open && /19 Aug|Aug 19/.test(dlg2.title), 'a hold on the right edge of 19 Aug files 19 Aug (not the neighbour)', { edgeHit, dlg2 })
  await closeDialog()
  const after = await page.evaluate(() => window.INPUTS.length)
  R.ck('C3-cancel-files-nothing', after === before.length + 1, 'Cancel on the second dialog files nothing', { after, was: before.length + 1 })
  await shot(page, 'w1-03-c3-after')
})

/* ---- a quick TAP on empty space opens the popover (not the dialog); "+N more" opens the full list ---- */
await step('TAP', async () => {
  await calOpen(page, '2026-07')
  const p = await emptyAt(page, '2026-07-10')
  await mouseGesture(page, p, null, { holdMs: 60 })
  const pop = await popover(page), dlg = await addDialog(page)
  R.ck('TAP-popover', pop.open && /10 Jul|Jul 10/.test(pop.label) && !dlg.open, 'a quick tap opens the day popover for 10 Jul, not the add dialog', { pop, dlg })
  await closePop()
  const cc = await cellChips(page, '2026-07-15')
  await page.locator('#inpCal [data-icmore="2026-07-15"]').click(); await page.waitForTimeout(400)
  const pop2 = await popover(page)
  await shot(page, 'w1-03-plusN-popover')
  R.ck('PLUSN', cc.chips.length === 6 && /\+1 more/.test(cc.more) && pop2.open && pop2.rows.length === 7, '15 Jul draws 6 chips and "+1 more"; the popover lists all 7', { cc, rows: pop2.rows })
  R.note('PLUSN-seventh', 'the 7th input has no chip on the month, so it cannot be dragged from the grid; its popover row opens the edit dialog (dates are changed on the Inputs page)')
  await closePop()
})

/* ---- the SWIPE: 120 px left pages to the next month, right pages back; 40 px or a vertical drag does nothing ---- */
await step('SWIPE', async () => {
  await calOpen(page, '2026-07')
  const p = await emptyAt(page, '2026-07-08')
  const m0 = await calMonth(page)
  await mouseGesture(page, p, { x: p.x - 120, y: p.y + 6 }, { steps: 8 })
  const m1 = await calMonth(page), pop1 = await popover(page), dlg1 = await addDialog(page)
  await shot(page, 'w1-03-swipe-left')
  R.ck('SWIPE-left-next', m0 === 'July 2026' && m1 === 'August 2026' && !pop1.open && !dlg1.open, 'a 120 px swipe left pages to August — no popover, no dialog', { m0, m1, pop1: pop1.open, dlg1: dlg1.open })
  const q = await emptyAt(page, '2026-08-12')
  await mouseGesture(page, q, { x: q.x + 120, y: q.y - 4 }, { steps: 8 })
  const m2 = await calMonth(page)
  R.ck('SWIPE-right-prev', m2 === 'July 2026', 'a 120 px swipe right pages back to July', m2)
  const r = await emptyAt(page, '2026-07-08')
  await mouseGesture(page, r, { x: r.x - 40, y: r.y }, { steps: 5 })
  const m3 = await calMonth(page)
  await mouseGesture(page, r, { x: r.x - 30, y: r.y - 90 }, { steps: 6 })
  const m4 = await calMonth(page), pop4 = await popover(page)
  R.ck('SWIPE-short-vertical', m3 === 'July 2026' && m4 === 'July 2026' && !pop4.open, 'a 40 px swipe and a mostly-vertical drag both leave the month where it is (and open nothing)', { m3, m4, pop4 })
  /* a MOUSE swipe that starts ON a chip is a drag (a mouse arms after 4 px) — recorded: it carries the chip */
  const iid = await page.evaluate(() => document.querySelector('#inpCal [data-icday="2026-07-24"] [data-iid]')?.getAttribute('data-iid'))
  const c = await L.chipAt(page, iid, '2026-07-24')
  await toasts(page)
  await mouseGesture(page, c, { x: c.x - 120, y: c.y }, { steps: 8 })
  const t = await toasts(page)
  const cd = await chipDays(page, iid)
  R.note('SWIPE-on-chip-mouse', { chipDays: cd, toasts: t, month: await calMonth(page), why: 'a mouse press on a chip arms the drag after 4 px — a sideways mouse swipe from a chip MOVES it (the finger version is walked at 390 px)' })
  await shot(page, 'w1-03-swipe-on-chip-mouse')
  if (cd.join() !== '2026-07-24') { const u = await undoRedo(page, 'undo', 'war'); R.note('SWIPE-on-chip-undo', u) }
})

/* ---- N1: noon belongs to the afternoon — through the hold-to-add dialog and the Inputs form ---- */
await step('N1', async () => {
  const P = 'beams', D = '2026-08-24', D2 = '2026-08-25', E = '2026-08-26', E2 = '2026-08-27'
  const man0 = await manning(D)
  const bal0 = (await warRead(page, P, [D])).bal
  await calOpen(page, '2026-08')
  const p = await emptyAt(page, D)
  await mouseGesture(page, p, null, { holdMs: 650 })
  await page.selectOption('#inpEditPerson', P)
  await page.selectOption('#inpEditType', 'LL')
  await page.locator('#inpEditSpan [data-span="custom"]').click(); await page.waitForTimeout(200)
  await page.locator('#inpEditStart').fill('12:00'); await page.locator('#inpEditEnd').fill('14:00')
  await page.locator('#inpEditRmk').fill('W1 N1 12-14')
  await shot(page, 'w1-03-n1-dialog')
  await page.locator('#inpEditSave').click(); await page.waitForTimeout(700)
  const cell = await cellOf(P, D)
  const man1 = await manning(D)
  const bal1 = (await warRead(page, P, [D])).bal
  await warShot('w1-03-n1-war-noon', P, D)
  R.ck('N1-afternoon', /LL>/.test(cell.box), 'LL 12:00-14:00 draws as the AFTERNOON (LL>) on the war', cell)
  R.note('N1-charge-manning', { bal0, bal1, man0, man1 })
  const bm = await bid(P, D, 'LL', { portion: 'am' })
  const s = await dayList(P, D)
  R.ck('N1-morning-bid-beside', bm.placed && (s.lines || []).some(l => /^<LL/.test(l) && /bid/i.test(l)), 'a MORNING bid is allowed beside it (noon is not the morning)', { bm, lines: s.lines })
  /* 11:00-12:00 is a morning */
  const m = await file({ person: P, type: 'LL', from: D2, span: 'custom', start: '11:00', end: '12:00', remarks: 'W1 N1 11-12' })
  const c2 = await cellOf(P, D2)
  R.ck('N1-ends-at-noon-morning', /<LL/.test(c2.box), 'LL 11:00-12:00 draws as the MORNING (<LL)', c2)
  /* what the Inputs page itself shows for the 12:00-14:00 leave (the tap list above read "12:01-14:00") */
  const noon = (await inputsOf(page, P)).find(x => /12-14/.test(x.remarks))
  await L.inputsWindow(page, D, D)
  const rowTxt = await page.evaluate(i => (document.querySelector(`#inBody tr[data-iid="${i}"]`)?.innerText || 'NO ROW').replace(/\s+/g, ' ').trim(), noon && noon.iid)
  await shot(page, 'w1-03-n1-inputs-row')
  R.note('N1-stored-times', { stored: noon, inputsRow: rowTxt })
  R.ck('N1-typed-time-kept', noon && noon.s === 720, 'the leave typed 12:00-14:00 is kept as 12:00 (N1 decides the HALF, it does not rewrite the start)', { s: noon && noon.s, e: noon && noon.e, inputsRow: rowTxt, tapList: s.lines })
  /* a two-day custom window with the same clock time at both ends — the form's answer, recorded */
  const o = await file({ person: P, type: 'LL', from: E, to: E2, span: 'custom', start: '12:00', end: '12:00', remarks: 'W1 N1 noon-noon' })
  R.note('N1-noon-to-noon-form', { filed: o.added, toast: o.toast })
  /* OVERNIGHT on one date: 12:00 to 11:00 (the next morning) — the afternoon on day 1; the tail on day 2 only clashes (H6) */
  const ov = await file({ person: P, type: 'LL', from: E, span: 'custom', start: '12:00', end: '11:00', remarks: 'W1 N1 overnight' })
  const run = await warRead(page, P, [E, E2])
  const inp = (await inputsOf(page, P)).filter(x => /overnight/.test(x.remarks))
  await warShot('w1-03-n1-war-overnight', P, E)
  R.ck('N1-overnight-day1', ov.added === 1 && /LL>/.test(run.row[0]) && !/LL/.test(run.row[1]), 'LL 12:00 → 11:00 next morning: day 1 is the afternoon (LL>), day 2 is not charged or drawn (H6)', { filed: ov.added, toast: ov.toast, inp, run })
  const bm2 = await bid(P, E2, 'LL', { portion: 'am' })
  const s2 = await dayList(P, E2)
  R.ck('N1-tail-clashes', !bm2.placed || /!/.test((await cellOf(P, E2)).mark), 'a morning bid on day 2 meets the overnight tail (00:00-11:00) — refused (B7) or flagged', { bm2, lines: s2.lines })
  const bp2 = await bid(P, E2, 'LL', { portion: 'pm' })
  R.ck('N1-tail-pm-free', bp2.placed, 'an AFTERNOON bid on day 2 is free (the tail ends 11:00)', bp2)
})

R.ck('console-errors', !errors.length, 'no console / page errors / 4xx', errors.slice(0, 20))
R.save()
await browser.close()
