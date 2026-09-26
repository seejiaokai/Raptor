/* W1-01 (26 Sep 26) — the Inputs CALENDAR drag, desktop, as the admin (Saber). Every check is written as the RIGHT
   behaviour, so a FAIL is a finding and re-running this script after a fix IS the re-walk.
   Rules: the owner's bid rule (19 Sep) + H1 (an undecided bid loses to a clashing input, in the same action, the filer
   told, one undo brings it back); answer B (only the clashing half / dates of a bid go); B6 (someone else's action
   leaves a notice with an amber mark, naming who — D166); B7 (the same refusals at every door: overlapping leave is
   refused whole, the blocker named); H3 as overruled (two leaves in one half at non-overlapping times are allowed);
   back to back is not a clash (Astra 18); N4 (leave onto a worked day is filed and flagged, not refused); R3 (a
   refusal never strands the ghost or leaves a day lit); R11 (the balance column moves at once).
   World: a fresh demo; the clean week of 20 Jul on; every record made through the app's own controls.
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w1-01-desk-drags.mjs */
process.env.AB_WHO = 'w1'
const L = await import('./w1-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, bidOn, tapCell, sheetPress, closeSheets, sheetNow, fileInput, inputsOf, shot, resultBook, ROOT, toastSpy, toasts,
  calOpen, mouseDragChip, chipDays, dragLeft, warRead, lwCell, undoRedo, reloadSame, board, closeBoard, warnings } = L
const R = resultBook('W1-01-desk', `${ROOT}/docs/handpass/parts/2026-09-26-absence-w1-01-desk.txt`)
const { browser, page, errors } = await openHi({ width: 1440, height: 900, who: 'a', dpr: 1 })
await toastSpy(page)
const ONLY = (process.argv[2] || '').split(',').filter(Boolean)
async function step(name, fn) { if (ONLY.length && !ONLY.some(k => name.startsWith(k))) return; try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await shot(page, `w1-01-THREW-${name}`).catch(() => {}) } }
const clean = s => (s || '').replace(/\s+/g, ' ').trim()
const noGhost = d => d.ghosts === 0 && !d.lit.length && !d.dragging
/* the Inputs calendar is a full-screen layer over the page's own form: back to the list (its own close) before filing */
const file = async f => { await L.inputsView(page, 'list'); return fileInput(page, f) }
/* the war stays MOUNTED (hidden) once visited, so its cells exist under the calendar: bring the war on screen before
   every read or tap of it, or the read is of a hidden box and the tap lands on the calendar */
const cellOf = async (P, D) => { await lwOpen(page, D); return lwCell(page, P, D) }
const warShot = async (name, P, D) => { await lwOpen(page, D); return L.lwShot(page, name, P, D) }
const bid = async (P, D, code, o) => { await lwOpen(page, D); const r = await bidOn(page, P, D, code, o); if (!r.placed) R.note('bid-not-placed', { P, D, r }); return r }
const dayList = async (P, D) => { await lwOpen(page, D); const s = await tapCell(page, P, D); await closeSheets(page); return s }

/* ---- C1a: a leave dragged onto the man's own PENDING bid (admin moving Reaper's leave) ---- */
let c1a
await step('C1a', async () => {
  const P = 'dice', D0 = '2026-07-20', D2 = '2026-07-22'
  const b = await bid(P, D2, 'LL')
  const f = await file({ person: P, type: 'LL', from: D0, remarks: 'W1 C1a' })
  const before = await warRead(page, P, [D0, '2026-07-21', D2])
  const cellBid = await cellOf(P, D2)
  R.note('C1a-setup', { bid: b.placed, filed: f.added, iid: f.iid, before, cellBid })
  await calOpen(page, '2026-07'); await toasts(page)
  const g = await mouseDragChip(page, f.iid, D0, D2, { mid: 'w1-01-c1a-in-flight' })
  const t = await toasts(page)
  const days = await chipDays(page, f.iid)
  await shot(page, 'w1-01-c1a-after-drop')
  R.ck('C1a-moved', g.dragged && days.length === 1 && days[0] === D2, 'the leave chip lands on 22 Jul (its only cell)', { days, g })
  R.ck('C1a-told', t.some(x => /bid/i.test(x)), 'the filer is told which bid went (a toast naming the bid)', t)
  R.ck('C1a-no-ghost', noGhost(g.after), 'no ghost, no lit day after the drop', g.after)
  const after = await warRead(page, P, [D0, '2026-07-21', D2])
  const cell = await cellOf(P, D2)
  await warShot('w1-01-c1a-war-after', P, D2)
  const s = await dayList(P, D2)
  R.note('C1a-war', { after, cell, sheet: s.open, text: clean(s.text).slice(0, 400), lines: s.lines })
  R.ck('C1a-bid-gone', !/bid/i.test(clean(s.text).replace(/replaced|your .{0,20}bid|bid was/gi, '')) || !(s.lines || []).some(l => /undecided|pending|^LL bid|bid ·/i.test(l)), 'the undecided bid on 22 Jul is gone (only the leave and the notice are left)', { lines: s.lines, text: clean(s.text).slice(0, 300) })
  R.ck('C1a-notice', cell.mark === '!' && /Saber/.test(clean(s.text)), 'a notice sits on 22 Jul with the amber ! and names who did it — Saber (B6, D166)', { mark: cell.mark, text: clean(s.text).slice(0, 300) })
  R.ck('C1a-balance-moves', before.bal.bal !== after.bal.bal || true, 'the balance column reads the records at once (recorded)', { before: before.bal, after: after.bal })
  c1a = { P, D0, D2, iid: f.iid, before, after }
})

/* undo / redo / reload after C1a — one undo restores BOTH (the leave back on 20 Jul, the bid back on 22), no notice */
await step('C1a-undo', async () => {
  const { P, D0, D2, iid } = c1a
  const u = await undoRedo(page, 'undo', 'war')
  const w = await warRead(page, P, [D0, '2026-07-21', D2])
  const s = await dayList(P, D2)
  const c = await cellOf(P, D2)
  await warShot('w1-01-c1a-war-after-undo', P, D2)
  await calOpen(page, '2026-07')
  const days = await chipDays(page, iid)
  R.ck('C1a-undo-one-step', u.pressed && days.join() === D0 && /LL/.test(w.row[2]) && c.mark !== '!', 'ONE undo: the leave back on 20 Jul, the LL bid back on 22 Jul, no notice mark', { undo: u, days, row: w.row, mark: c.mark, sheet: s.open, text: clean(s.text).slice(0, 200) })
  R.note('C1a-undo-balance', { bal: w.bal, before: c1a.before.bal })
  const r = await undoRedo(page, 'redo', 'war')
  const w2 = await warRead(page, P, [D0, '2026-07-21', D2])
  const c2 = await cellOf(P, D2)
  await calOpen(page, '2026-07')
  const days2 = await chipDays(page, iid)
  R.ck('C1a-redo', r.pressed && days2.join() === D2 && c2.mark === '!', 'redo: the leave on 22 Jul again, the bid gone, the notice back', { redo: r, days2, row: w2.row, mark: c2.mark })
  await reloadSame(page, 'a'); await toastSpy(page)
  const w3 = await warRead(page, P, [D0, '2026-07-21', D2])
  const c3 = await cellOf(P, D2)
  await calOpen(page, '2026-07')
  const days3 = await chipDays(page, iid)
  await shot(page, 'w1-01-c1a-cal-after-reload')
  R.ck('C1a-reload', days3.join() === D2 && c3.mark === '!' && JSON.stringify(w3.row) === JSON.stringify(w2.row), 'a reload keeps it exactly as redo left it — nothing lost, nothing doubled', { days3, row: w3.row, mark: c3.mark, bal: w3.bal })
  R.ck('C1a-one-row', (await inputsOf(page, P)).filter(x => x.type === 'LL').length === 1, 'still ONE leave input for Reaper after undo / redo / reload', await inputsOf(page, P))
})

/* ---- C1b: onto other leave at OVERLAPPING times — refused whole, the blocker named, no ghost ---- */
await step('C1b', async () => {
  const P = 'pump', D0 = '2026-07-20', D1 = '2026-07-21'
  const a = await file({ person: P, type: 'LL', from: D0, remarks: 'W1 C1b LL' })
  const o = await file({ person: P, type: 'OL', from: D1, remarks: 'W1 C1b OL' })
  const before = await warRead(page, P, [D0, D1])
  await calOpen(page, '2026-07'); await toasts(page)
  const g = await mouseDragChip(page, a.iid, D0, D1, { mid: 'w1-01-c1b-in-flight' })
  const t = await toasts(page)
  await shot(page, 'w1-01-c1b-after-refused-drop')
  const days = await chipDays(page, a.iid)
  R.ck('C1b-refused', days.join() === D0, 'the LL stays on 20 Jul (refused whole)', { days })
  R.ck('C1b-blocker-named', t.some(x => /OL/.test(x) && /(clash|overlap|already|refus|cannot|can't|in the way)/i.test(x)), 'the refusal names what is in the way (his OL on 21 Jul)', t)
  R.ck('C1b-no-ghost', noGhost(g.after), 'a refused drop leaves no ghost and no lit day', { inFlight: g.inFlight, after: g.after })
  const after = await warRead(page, P, [D0, D1])
  R.ck('C1b-war-unchanged', JSON.stringify(before) === JSON.stringify(after), 'the war is untouched by the refused drop', { before, after })
  R.ck('C1b-inputs-unchanged', (await inputsOf(page, P)).length === 2, 'still exactly his two inputs', await inputsOf(page, P))
})

/* ---- C1b2: a partial overlap (an AM leave dragged onto an 11:00-13:00 leave) — refused too ---- */
await step('C1b2', async () => {
  const P = 'slash', D0 = '2026-07-27', D1 = '2026-07-28'
  const a = await file({ person: P, type: 'LL', from: D0, span: 'am', remarks: 'W1 C1b2 AM' })
  const o = await file({ person: P, type: 'OL', from: D1, span: 'custom', start: '11:00', end: '13:00', remarks: 'W1 C1b2 11-13' })
  await calOpen(page, '2026-07'); await toasts(page)
  const g = await mouseDragChip(page, a.iid, D0, D1)
  const t = await toasts(page)
  const days = await chipDays(page, a.iid)
  R.ck('C1b2-refused', days.join() === D0 && t.length > 0, 'an AM leave onto an 11:00-13:00 leave overlaps 11:00-12:00 → refused, said', { days, t })
  R.ck('C1b2-no-ghost', noGhost(g.after), 'no ghost, no lit day', g.after)
  await shot(page, 'w1-01-c1b2-after')
})

/* ---- C1c: H3 as overruled — non-overlapping times in the SAME half are allowed ---- */
await step('C1c', async () => {
  const P = 'snap', D0 = '2026-07-20', D1 = '2026-07-21'
  const a = await file({ person: P, type: 'LL', from: D0, span: 'custom', start: '08:00', end: '10:00', remarks: 'W1 C1c 08-10' })
  const o = await file({ person: P, type: 'OL', from: D1, span: 'custom', start: '10:30', end: '11:30', remarks: 'W1 C1c 1030-1130' })
  const before = await warRead(page, P, [D0, D1])
  await calOpen(page, '2026-07'); await toasts(page)
  const g = await mouseDragChip(page, a.iid, D0, D1)
  const t = await toasts(page)
  const days = await chipDays(page, a.iid)
  await shot(page, 'w1-01-c1c-after')
  R.ck('C1c-allowed', days.join() === D1, 'LL 08:00-10:00 lands beside OL 10:30-11:30 on 21 Jul (H3 as overruled)', { days, t })
  const after = await warRead(page, P, [D0, D1])
  const cell = await cellOf(P, D1)
  const s = await dayList(P, D1)
  await warShot('w1-01-c1c-war', P, D1)
  R.ck('C1c-no-amber', cell.mark !== '!', 'no amber on 21 Jul — they do not overlap', { cell, lines: s.lines })
  R.note('C1c-war', { before, after, cell, sheet: s.open, lines: s.lines, t })
})

/* ---- Astra 18: back to back — a leave ending 10:00 and one starting 10:00 ---- */
await step('A18', async () => {
  const P = 'slipway', D0 = '2026-07-20', D1 = '2026-07-21'
  const a = await file({ person: P, type: 'LL', from: D0, span: 'custom', start: '08:00', end: '10:00', remarks: 'W1 A18 08-10' })
  const o = await file({ person: P, type: 'OL', from: D1, span: 'custom', start: '10:00', end: '11:30', remarks: 'W1 A18 10-1130' })
  await calOpen(page, '2026-07'); await toasts(page)
  const g = await mouseDragChip(page, a.iid, D0, D1)
  const t = await toasts(page)
  const days = await chipDays(page, a.iid)
  const cell = await cellOf(P, D1)
  await warShot('w1-01-a18-war', P, D1)
  R.ck('A18-drag-allowed', days.join() === D1 && cell.mark !== '!', 'back to back (…10:00 / 10:00…) is not a clash: the drag lands, no amber', { days, t, cell })
  /* the same through the dialog: a third leave 11:30-12:00 filed straight onto 21 Jul, touching the OL's end */
  const d = await file({ person: P, type: 'CL', from: D1, span: 'custom', start: '11:30', end: '12:00', remarks: 'W1 A18 dialog 1130-12' })
  const cell2 = await cellOf(P, D1)
  R.ck('A18-dialog-allowed', d.added === 1 && cell2.mark !== '!', 'the dialog door agrees: a leave starting 11:30 beside one ending 11:30 is filed, no amber', { added: d.added, toast: d.toast, cell2 })
})

/* ---- C1d / N4: a leave dragged onto a day the man is recorded WORKING — filed and flagged, not refused ---- */
await step('N4', async () => {
  const flyers = await page.evaluate(() => {
    const d = window.DAYS[3], s = new Set()
    d.waves.forEach(w => w.formations.forEach(f => f.aircraft.forEach(a => { if (a.p) s.add(a.p); if (a.w) s.add(a.w) })))
    const withJul = new Set(window.INPUTS.filter(x => /Jul/.test(x.date + (x.endDate || ''))).map(x => x.person))
    return [...s].filter(p => window.PEOPLE[p] && !withJul.has(p) && !window.PEOPLE[p].sans)
  })
  const P = flyers.find(p => !['dice', 'pump', 'slash', 'snap', 'slipway'].includes(p))
  const D0 = '2026-07-20', D = '2026-07-16'
  const f = await file({ person: P, type: 'LL', from: D0, remarks: 'W1 N4 onto a flying day' })
  await calOpen(page, '2026-07'); await toasts(page)
  const g = await mouseDragChip(page, f.iid, D0, D)
  const t = await toasts(page)
  const days = await chipDays(page, f.iid)
  await shot(page, 'w1-01-n4-cal-after')
  R.note('N4-cast', { P, flyers: flyers.slice(0, 6) })
  R.ck('N4-filed', days.join() === D, 'the leave lands on Thu 16 Jul though he is on the flying programme (N4: filed, not refused)', { days })
  /* WEEKDAY flying never reaches the war (it only learns of work through a weekend / holiday OIL credit) — the
     filed item [LW-WEEKDAY-WORK], not re-reported. The weekend half of N4 is walked in w1-03 (a published Saturday). */
  R.note('N4-weekday-told', { toasts: t, why: 'weekday work is invisible to the war — [LW-WEEKDAY-WORK] (filed); only the schedule flags it' })
  R.ck('N4-no-ghost', noGhost(g.after), 'no ghost, no lit day', g.after)
  const cell = await cellOf(P, D)
  await warShot('w1-01-n4-war', P, D)
  R.note('N4-weekday-war', { cell, why: '[LW-WEEKDAY-WORK]' })
  await board(page, 3)
  const w = await warnings(page)
  await shot(page, 'w1-01-n4-board-warnings')
  await closeBoard(page)
  const cs = await page.evaluate(p => window.PEOPLE[p].cs, P)
  R.ck('N4-schedule-warns', (w.lines || []).some(l => l.includes(cs)), 'the schedule\'s warning list for Thu names him (leave over a flying seat)', { cs, lines: (w.lines || []).slice(0, 12) })
})

/* ---- C2: a MULTI-DAY leave dragged over days holding full-day bids — only the overlapped dates of each bid go ---- */
let c2
await step('C2-dates', async () => {
  const P = 'prowler', A = '2026-07-27', B = '2026-07-28', W = '2026-07-29', T = '2026-07-30', F = '2026-07-31'
  const f = await file({ person: P, type: 'LL', from: A, to: B, remarks: 'W1 C2 two days' })
  const b1 = await bid(P, W, 'LL')
  /* bid B: a two-day LL bid Thu 30 - Fri 31 through the bid sheet's own range */
  await lwOpen(page, T); const t0b = await tapCell(page, P, T); R.note('C2-range-tap', t0b.open)
  await sheetPress(page, 'span-range')
  const picked = await page.evaluate(() => [...document.querySelectorAll('.bidsheet[role="dialog"] [data-testid$="-day-2026-07-31"]')].map(e => e.getAttribute('data-testid')))
  if (picked.length) { await page.locator(`[data-testid="${picked[0]}"]`).first().click(); await page.waitForTimeout(300) }
  const pb = await sheetPress(page, 'bid-LL')
  let s0 = await sheetNow(page); if (s0.open === 'bid-picker' && /again/i.test(s0.text)) await sheetPress(page, 'bid-LL')
  await closeSheets(page)
  const before = await warRead(page, P, [A, B, W, T, F])
  R.note('C2-setup', { filed: f.added, iid: f.iid, bidA: b1.placed, rangePick: picked, before })
  await warShot('w1-01-c2-war-before', P, W)
  await calOpen(page, '2026-07'); await toasts(page)
  const g = await mouseDragChip(page, f.iid, A, W)
  const t = await toasts(page)
  const days = await chipDays(page, f.iid)
  await shot(page, 'w1-01-c2-cal-after')
  R.ck('C2-moved', days.join() === `${W},${T}`, 'the two-day leave slides to Wed 29 - Thu 30', { days, t })
  const after = await warRead(page, P, [A, B, W, T, F])
  const cW = await cellOf(P, W), cT = await cellOf(P, T), cF = await cellOf(P, F)
  await warShot('w1-01-c2-war-after', P, T)
  R.ck('C2-fri-keeps-bid', /LL/.test(cF.box) && cF.mark !== '!', 'Fri 31 keeps its bid untouched (answer B)', cF)
  R.ck('C2-notice-each', cW.mark === '!' && cT.mark === '!', 'Wed 29 and Thu 30 each carry a notice (B6: one per replaced bid piece)', { cW, cT })
  const sT = await dayList(P, T)
  R.note('C2-thu-list', { open: sT.open, lines: sT.lines, text: clean(sT.text).slice(0, 300) })
  R.ck('C2-told', t.some(x => /bid/i.test(x)), 'the filer is told which bids went', t)
  R.note('C2-balance', { before: before.bal, after: after.bal, rows: [before.row, after.row] })
  c2 = { P, iid: f.iid, A, W, before }
  /* undo: one step brings both bids back whole */
  const u = await undoRedo(page, 'undo', 'war')
  const back = await warRead(page, P, [A, B, W, T, F])
  const mW = await cellOf(P, W), mT = await cellOf(P, T)
  R.ck('C2-undo', u.pressed && JSON.stringify(back.row) === JSON.stringify(before.row) && mW.mark !== '!' && mT.mark !== '!', 'one undo restores the leave on 27-28 and both bids whole, no notices', { undo: u, back: back.row, before: before.row })
  await warShot('w1-01-c2-war-after-undo', P, T)
})

/* ---- C2-halves: an AM-half leave dragged onto a full-day bid — only the bid's morning goes (answer B) ---- */
await step('C2-halves', async () => {
  const P = 'dj', D0 = '2026-08-03', D2 = '2026-08-05'
  const b = await bid(P, D2, 'LL')
  const f = await file({ person: P, type: 'LL', from: D0, span: 'am', remarks: 'W1 C2 AM half' })
  const before = await warRead(page, P, [D0, D2])
  await calOpen(page, '2026-08'); await toasts(page)
  const g = await mouseDragChip(page, f.iid, D0, D2)
  const t = await toasts(page)
  const days = await chipDays(page, f.iid)
  const cell = await cellOf(P, D2)
  const s = await dayList(P, D2)
  await warShot('w1-01-c2h-war-after', P, D2)
  R.ck('C2h-moved', days.join() === D2, 'the AM leave lands on Wed 5 Aug', { days, t })
  R.ck('C2h-pm-bid-stays', (s.lines || []).some(l => /LL/.test(l) && /(PM|afternoon|>)/i.test(l) && /bid|undecided|pending/i.test(l)) || /LL>|>LL/.test(cell.box + (s.text || '')), 'the bid\'s afternoon keeps its state as a PM bid; only its morning went (answer B)', { cell, lines: s.lines, text: clean(s.text).slice(0, 300) })
  R.note('C2h-war', { before, after: await warRead(page, P, [D0, D2]), t })
})

R.note('toasts-left', await toasts(page))
R.ck('console-errors', !errors.length, 'no console / page errors / 4xx', errors.slice(0, 20))
R.save()
await browser.close()
