/* W1-05 (26 Sep 26) — the Inputs CALENDAR on a PHONE (390 x 844), by FINGER (CDP touch — the pointer events a phone
   sends, not mouse clicks), as the admin (Saber). Fable S15 and M11: three gestures share one surface —
     a chip's 180 ms hold lifts it; an empty cell's 450 ms hold adds; a 50 px sideways swipe pages the month.
   Expected (the RIGHT behaviour, so a FAIL is a finding): a held chip carried to another day moves there, a pending bid
   under it is replaced and the filer told; a drop the gate refuses leaves no ghost and no lit day; a quick sideways
   flick that starts on a chip never lifts it; a swipe on empty space pages the month; a still hold on empty space
   opens the add dialog for exactly that date and never ALSO the popover; a quick tap opens the popover; a tap on a
   chip opens its edit. Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w1-05-phone-finger.mjs */
process.env.AB_WHO = 'w1'
const L = await import('./w1-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, bidOn, tapCell, closeSheets, fileInput, shot, resultBook, ROOT, toastSpy, toasts, calOpen, calMonth, chipDays,
  chipAt, cellAt, emptyAt, dragLeft, touchOn, finger, fingerDragChip, addDialog, popover, lwCell, warRead, undoRedo } = L
const R = resultBook('W1-05-phone', `${ROOT}/docs/handpass/parts/2026-09-26-absence-w1-05-phone.txt`)
const { browser, page, errors } = await openHi({ width: 390, height: 844, who: 'a', dpr: 3 })
const cdp = await touchOn(page)
await toastSpy(page)
const ONLY = (process.argv[2] || '').split(',').filter(Boolean)
async function step(name, fn) { if (ONLY.length && !ONLY.some(k => name.startsWith(k))) return; try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await shot(page, `w1-05-THREW-${name}`).catch(() => {}) } }
const file = async f => { await L.inputsView(page, 'list'); return fileInput(page, f) }
const cellOf = async (P, D) => { await lwOpen(page, D); return lwCell(page, P, D) }
const bid = async (P, D, code, o) => { await lwOpen(page, D); const r = await bidOn(page, P, D, code, o); if (!r.placed) R.note('bid-not-placed', { P, D, r }); return r }
const noGhost = d => d.ghosts === 0 && !d.lit.length && !d.dragging
const closeDialog = async () => { if (await page.locator('#inpEditCancel:visible').count()) { await page.locator('#inpEditCancel').click(); await page.waitForTimeout(300) } }
const closePop = async () => { if (await page.locator('#icPopClose:visible').count()) { await page.locator('#icPopClose').click(); await page.waitForTimeout(300) } }

let A
await step('setup', async () => {
  const b = await bid('dice', '2026-07-22', 'LL')
  const f = await file({ person: 'dice', type: 'LL', from: '2026-07-20', remarks: 'W1 phone drag' })
  const x = await file({ person: 'pump', type: 'LL', from: '2026-07-20', remarks: 'W1 phone refused LL' })
  const y = await file({ person: 'pump', type: 'OL', from: '2026-07-21', remarks: 'W1 phone refused OL' })
  A = { reaper: f.iid, piston: x.iid, bid: b.placed }
  await calOpen(page, '2026-07')
  await shot(page, 'w1-05-00-phone-july')
  const sz = await chipAt(page, f.iid, '2026-07-20')
  R.note('setup', { A, chipSize: sz && { w: sz.w, h: sz.h } })
})

/* ---- a finger holds Reaper's leave 260 ms and carries it onto his pending bid on 22 Jul ---- */
await step('HOLD-DRAG', async () => {
  await calOpen(page, '2026-07'); await toasts(page)
  const g = await fingerDragChip(page, cdp, A.reaper, '2026-07-20', '2026-07-22', { mid: 'w1-05-01-finger-in-flight' })
  const t = await toasts(page)
  const days = await chipDays(page, A.reaper)
  await shot(page, 'w1-05-02-finger-dropped')
  R.ck('HOLD-DRAG-moved', g.dragged && days.join() === '2026-07-22', 'held 260 ms then carried: the chip lands on 22 Jul', { days, g })
  R.ck('HOLD-DRAG-told', t.some(x => /bid/i.test(x)), 'the pending bid under it is replaced and the filer told', t)
  R.ck('HOLD-DRAG-no-ghost', noGhost(g.after), 'no ghost left after the lift', g.after)
  const c = await cellOf('dice', '2026-07-22')
  await L.lwShot(page, 'w1-05-03-war-after-finger-drag', 'dice', '2026-07-22')
  R.ck('HOLD-DRAG-war', /LL/.test(c.box) && c.mark === '!', 'the war: his LL on 22 Jul with the amber notice mark', c)
})

/* ---- a refused drop by finger (LL onto his OL): no ghost, no lit day, the reason shown ---- */
await step('REFUSED', async () => {
  await calOpen(page, '2026-07'); await toasts(page)
  const g = await fingerDragChip(page, cdp, A.piston, '2026-07-20', '2026-07-21', { mid: 'w1-05-04-refused-in-flight' })
  const t = await toasts(page)
  const days = await chipDays(page, A.piston)
  await shot(page, 'w1-05-05-refused-after')
  R.ck('REFUSED-stays', days.join() === '2026-07-20' && t.some(x => /OL/.test(x)), 'refused whole: the LL stays on 20 Jul, the refusal names his OL', { days, t })
  R.ck('REFUSED-no-ghost', noGhost(g.after), 'a refused finger drop leaves no ghost and no lit day', { inFlight: g.inFlight, after: g.after })
})

/* ---- a quick sideways flick that STARTS ON A CHIP never lifts it ---- */
await step('FLICK-CHIP', async () => {
  await calOpen(page, '2026-07'); await toasts(page)
  const a = await chipAt(page, A.piston, '2026-07-20')
  const m0 = await calMonth(page)
  const g = await finger(page, cdp, a, { x: a.x - 130, y: a.y + 4 }, { holdMs: 0, steps: 6, stepMs: 12 })
  const t = await toasts(page)
  const days = await chipDays(page, A.piston), m1 = await calMonth(page)
  R.ck('FLICK-CHIP-no-lift', days.join() === '2026-07-20' && g.inFlight.ghosts === 0 && !t.some(x => /Moved/.test(x)), 'a quick flick from a chip does not lift it (no ghost, not moved)', { days, inFlight: g.inFlight, t })
  R.note('FLICK-CHIP-month', { m0, m1, why: 'the swipe verdict belongs to EMPTY space; a flick that starts on a chip is neither a drag nor a page' })
})

/* ---- the swipe on EMPTY space pages the month; back again ---- */
await step('SWIPE', async () => {
  await calOpen(page, '2026-07')
  const p = await emptyAt(page, '2026-07-08')
  const m0 = await calMonth(page)
  const g = await finger(page, cdp, p, { x: Math.max(8, p.x - 150), y: p.y + 6 }, { steps: 8, stepMs: 16 })
  const m1 = await calMonth(page), pop = await popover(page), dlg = await addDialog(page)
  await shot(page, 'w1-05-06-swipe-left')
  R.ck('SWIPE-left', m0 === 'July 2026' && m1 === 'August 2026' && !pop.open && !dlg.open, 'a 150 px finger swipe left on empty space pages to August — nothing else opens', { m0, m1, pop: pop.open, dlg: dlg.open, p })
  /* the right swipe is walked on its own: if the left one did not page, the arrows take it to August first */
  if ((await calMonth(page)) !== 'August 2026') await calOpen(page, '2026-08')
  const q = await emptyAt(page, '2026-08-12')
  await finger(page, cdp, q, { x: Math.min(382, q.x + 150), y: q.y - 4 }, { steps: 8, stepMs: 16 })
  const m2 = await calMonth(page)
  R.ck('SWIPE-right', m2 === 'July 2026', 'a finger swipe right pages back to July', m2)
  /* a slower, deliberate swipe (a finger that settles, then sweeps) */
  if ((await calMonth(page)) !== 'July 2026') await calOpen(page, '2026-07')
  const r = await emptyAt(page, '2026-07-08')
  await finger(page, cdp, r, { x: Math.max(8, r.x - 150), y: r.y }, { holdMs: 120, steps: 14, stepMs: 30 })
  const m3 = await calMonth(page)
  R.ck('SWIPE-slow', m3 === 'August 2026', 'a slower sweep (120 ms settle, then 150 px) still pages the month and does not add', { m3, dlg: (await addDialog(page)).open })
  await closeDialog()
})

/* ---- hold-to-add by finger: exactly that date, never ALSO the popover ---- */
await step('HOLD-ADD', async () => {
  await calOpen(page, '2026-08')
  const D = '2026-08-18'
  const p = await emptyAt(page, D)
  await finger(page, cdp, p, null, { holdMs: 650 })
  const dlg = await addDialog(page), pop = await popover(page)
  await shot(page, 'w1-05-07-hold-add-dialog')
  R.ck('HOLD-ADD-dialog', dlg.open && /Aug 18/.test(dlg.title) && !pop.open, 'a 650 ms finger hold on empty space opens the add dialog for 18 Aug only — not the popover too', { dlg, pop, p })
  const fits = await page.evaluate(() => { const b = document.querySelector('#inpEditPop .airpop-box')?.getBoundingClientRect(); const s = document.getElementById('inpEditSave')?.getBoundingClientRect(); return b && s ? { box: { l: b.left, r: b.right, t: b.top, b: b.bottom }, save: { t: s.top, b: s.bottom }, vw: innerWidth, vh: innerHeight } : null })
  R.ck('HOLD-ADD-fits', fits && fits.box.l >= 0 && fits.box.r <= fits.vw && fits.save.b <= fits.vh, 'the add dialog fits the phone, Save on screen', fits)
  await page.selectOption('#inpEditType', 'LL')
  const before = await page.evaluate(() => window.INPUTS.map(x => x.iid))
  await page.locator('#inpEditSave').tap().catch(async () => page.locator('#inpEditSave').click())
  await page.waitForTimeout(700)
  const fresh = await page.evaluate(b => window.INPUTS.filter(x => !b.includes(x.iid)).map(x => ({ date: x.date, endDate: x.endDate || '', person: x.person, type: x.type })), before)
  R.ck('HOLD-ADD-exact', fresh.length === 1 && fresh[0].date === 'Aug 18' && !fresh[0].endDate, 'exactly one input on 18 Aug (the signed-in admin\'s own)', fresh)
})

/* ---- a quick finger tap on empty space opens the popover; a tap on a chip opens its edit ---- */
await step('TAPS', async () => {
  await calOpen(page, '2026-07')
  const p = await emptyAt(page, '2026-07-10')
  await finger(page, cdp, p, null, { holdMs: 60 })
  const pop = await popover(page), dlg = await addDialog(page)
  await shot(page, 'w1-05-08-tap-popover')
  R.ck('TAP-popover', pop.open && /10 Jul/.test(pop.label) && !dlg.open, 'a quick finger tap opens the day popover (not the add dialog)', { pop, dlg })
  const popFit = await page.evaluate(() => { const b = document.querySelector('#inpCal .ic-pop')?.getBoundingClientRect(); return b ? { l: b.left, r: b.right, t: b.top, b: b.bottom, vw: innerWidth, vh: innerHeight } : null })
  R.ck('TAP-popover-fits', popFit && popFit.l >= 0 && popFit.r <= popFit.vw, 'the popover fits the phone width', popFit)
  await closePop()
  const c = await chipAt(page, A.piston, '2026-07-20')
  await finger(page, cdp, c, null, { holdMs: 60 })
  const d2 = await addDialog(page)
  await shot(page, 'w1-05-09-tap-chip-edit')
  R.ck('TAP-chip-edit', d2.open && /Piston/.test(d2.title), 'a quick tap on a chip opens that input\'s edit', d2)
  await closeDialog()
  /* a chip held past 180 ms and released where it lay: no move, no edit opened, nothing written */
  const n0 = await page.evaluate(() => JSON.stringify(window.INPUTS.map(x => x.iid + x.date)))
  const g = await finger(page, cdp, c, null, { holdMs: 400 })
  const d3 = await addDialog(page)
  const n1 = await page.evaluate(() => JSON.stringify(window.INPUTS.map(x => x.iid + x.date)))
  R.ck('HOLD-CHIP-in-place', n0 === n1 && !d3.open && noGhost(g.after), 'a chip held and released where it lay: nothing moves, no edit opens, no ghost', { d3: d3.open, after: g.after })
})

R.note('toasts-left', await toasts(page))
R.ck('console-errors', !errors.length, 'no console / page errors / 4xx', errors.slice(0, 20))
R.save()
await browser.close()
