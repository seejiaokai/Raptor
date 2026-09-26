/* D262 WALK (27 Sep 26) — ONE CHIP, ONE MOVE, written as assertions of the RIGHT behaviour (a re-run is the re-walk).
   The day sheet's Move has no date box and is never greyed; it picks the chip up into the grid's move mode; the chip
   lands on the day clicked (a phone stages it and asks to Confirm); the grid scrolls at its edges while moving; the
   month buttons keep the move on; an empty spot outside the grid ends it; a control does not. Plus Fable's scenarios:
   S1 (a double-click on Move lands nothing), S6 (its own day), S9 (leaving the tab ends it), S11 (a swipe never lands, a
   long press never cancels). Usage: node scripts/handpass/mv/mv-20-move.mjs [desktop|phone]   (build on 4175) */
const M = await import('./mv-lib.mjs')
const { WIDTH, PHONE, ROOT, openMv, lwOpen, tapCell, sheetNow, sheetPress, closeSheets, recsOf, grid, dragRect, selPress,
  lwHist, stageNow, stageGo, figures, shot, resultBook, centre, at, tapAt, press, fingerHoldDrag, fingerSwipe, banner, gridState,
  dayAt, gridBox, go } = M
const ONLY = process.env.ONLY || ''                 // one step alone — its own result file, never the full record's
const R = resultBook(`MV20-${WIDTH}`, `${ROOT}/docs/handpass/parts/2026-09-27-d260-d262-mv20-${WIDTH}${ONLY ? '-only-' + ONLY : ''}.txt`)
const { browser, page, errors, cdp } = await openMv('a')
const pic = n => shot(page, `mv20-${WIDTH}-${n}`)
async function step(name, fn) {
  if (ONLY && !name.startsWith(ONLY)) return
  try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await pic(`THREW-${name}`).catch(() => {}) }
  if (await banner(page)) { await press(page, 'move-cancel') }                  // never carry a move into the next step
  await closeSheets(page)
}
const P = 'bruise'                                  // Gambit — an undecided morning of LL on 23 Jan
const where = async () => {                         // the day Gambit's LL sits on now (Jan–Mar)
  const g = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="cell-bruise-2026-0"]')].filter(c => /LL/.test(c.innerText || '') && !/2026-01-0[89]/.test(c.getAttribute('data-testid'))).map(c => c.getAttribute('data-testid').slice(-10)))
  return g[0] || null
}
/** Bring a day's box on screen the way a person does while moving — a finger's quick swipe on the phone (the grid's own
    scroll), the mouse wheel sideways on the desktop — never a programmatic scroll the app could mistake for nothing. */
async function bringIntoView(testid) {
  for (let i = 0; i < 8; i++) {
    const p = await at(page, testid)
    if (p && p.ok && p.x > 10 && p.x < (PHONE ? 380 : 1430) && p.y > 60 && p.y < (PHONE ? 760 : 820)) return p
    const row = await page.locator(`[data-testid="${testid}"]`).first().evaluate(e => { const b = e.getBoundingClientRect(); return { x: b.left, y: b.top + b.height / 2 } }).catch(() => null)
    if (!row) return null
    if (row.y < 60 || row.y > (PHONE ? 760 : 820)) { await page.mouse.wheel(0, row.y - 420); await page.waitForTimeout(300); continue }
    const dx = row.x < 220 ? -1 : 1
    if (PHONE) await fingerSwipe(page, cdp, { x: dx > 0 ? 330 : 240, y: row.y }, { x: dx > 0 ? 240 : 330, y: row.y })
    else { await page.mouse.move(700, row.y); await page.mouse.wheel(dx * 300, 0); await page.waitForTimeout(300) }
  }
  return at(page, testid)
}
/** Land the picked-up chip on a day: a click on the desktop; a tap then Confirm on the phone. Returns what the banner said. */
async function landOn(testid, { confirm = true } = {}) {
  await page.waitForTimeout(450)                  // a person's click comes a beat after Move (the double-click guard)
  const p = await bringIntoView(testid)
  if (!p || !p.ok) return { landed: false, why: 'not on screen' }
  await tapAt(page, p.x, p.y)
  const said = await banner(page)
  let confirmed = false
  if (PHONE && confirm && (await page.locator('[data-testid="move-confirm"]:visible').count())) { await press(page, 'move-confirm'); confirmed = true }
  return { landed: true, said, confirmed, after: await banner(page) }
}
const moveBtnState = () => page.evaluate(() => {
  const b = document.querySelector('[data-testid="bid-picker"] [data-testid="decide-shift"]')
  return { move: !!b, disabled: b ? b.disabled : null, dateBox: document.querySelectorAll('[data-testid="shift-date"]').length }
})

await lwOpen(page, '2026-01-20')
R.note('stage-start', await stageNow(page))

/* ---- C1: the day sheet's Move — picks up, lands, undecided, one Undo ---- */
await step('C1-pick-up-and-land', async () => {
  const lve0 = (await figures(page, P)).lve
  const s = await tapCell(page, P, '2026-01-23')
  const mb = await moveBtnState()
  await pic('C1-sheet-move-no-date-box')
  R.ck('C1-no-date-box', s.open === 'bid-picker' && mb.move && mb.disabled === false && mb.dateBox === 0, 'the sheet\'s Move is pressable at once and has no date box beside it', { open: s.open, ...mb })
  await press(page, 'decide-shift')
  const b1 = await banner(page)
  const sheet = await sheetNow(page)
  if (!PHONE) { const t = await at(page, `cell-${P}-2026-01-27`); await page.mouse.move(t.x, t.y); await page.waitForTimeout(400) }
  await pic('C1-picked-up')
  const gs = await gridState(page)
  R.ck('C1-picked-up', sheet.open === 'nothing' && /Tap a day to move 1 entry/.test(b1) && (PHONE || gs.landing.includes(`cell-${P}-2026-01-27`)),
    'Move closes the sheet and picks the chip up: the banner says one entry; on the desktop the landing is painted where the mouse is', { sheet: sheet.open, banner: b1, landing: gs.landing })
  const l = await landOn(`cell-${P}-2026-01-27`)
  const g = await grid(page, [P], ['2026-01-23', '2026-01-27'])
  const r = (await recsOf(page, P, ['2026-01-27']))['2026-01-27']
  await pic('C1-landed')
  const lve1 = (await figures(page, P)).lve
  R.ck('C1-landed', !/LL/.test(g[P].split(' | ')[0]) && /LL/.test(g[P].split(' | ')[1]) && /request:\*LL\/pending/.test(r) && !(await banner(page)) && (!PHONE || /Move 1 entry here\?/.test(l.said)),
    'a click on 27 Jan lands it there (the phone asks "Move 1 entry here?" and Confirm lands it), undecided; the old day empty; the move over', { l, g, r })
  R.ck('C1-money', String(lve0) === String(lve1), 'his leave balance does not change by a move', { lve0, lve1 })
  await lwHist(page, 'undo')
  const g2 = await grid(page, [P], ['2026-01-23', '2026-01-27'])
  await lwHist(page, 'redo')
  const g3 = await grid(page, [P], ['2026-01-23', '2026-01-27'])
  R.ck('C1-undo-redo', /LL/.test(g2[P].split(' | ')[0]) && /LL/.test(g3[P].split(' | ')[1]), 'one Undo puts it back on 23 Jan; Redo moves it again', { g2, g3 })
})

/* ---- C2: its own day (S6) ---- */
await step('C2-own-day', async () => {
  const d = await where()
  await tapCell(page, P, d)
  await press(page, 'decide-shift')
  const l = await landOn(`cell-${P}-${d}`, { confirm: false })
  await pic('C2-own-day')
  const conf = await page.locator('[data-testid="move-confirm"]:visible').count()
  R.ck('C2-own-day', /already on that day/.test(l.said) && !/Nothing to move/.test(l.said) && conf === 0 && !!(await banner(page)),
    'its own day says it is already there, offers no Confirm, and the move stays on', { said: l.said, confirm: conf })
})

/* ---- C3: a refused landing says why, and the next lands (both on screen) ---- */
await step('C3-refused-then-lands', async () => {
  const d = await where()
  await tapCell(page, P, d)
  await press(page, 'decide-shift')
  const bad = await landOn(`cell-${P}-2026-01-08`, { confirm: false })   // Gambit's approved LL
  await pic('C3-refused')
  const conf = await page.locator('[data-testid="move-confirm"]:visible').count()
  R.ck('C3-refused', /already booked/.test(bad.said) && conf === 0 && !!(await banner(page)), 'a day that cannot take it is refused with its reason, no Confirm, the move stays on', { bad, confirm: conf })
  const good = await landOn(`cell-${P}-2026-01-12`)
  const g = await grid(page, [P], ['2026-01-12'])
  R.ck('C3-next-lands', /LL/.test(g[P]) && !(await banner(page)), 'the next day lands it', { good, g })
})

/* ---- C4: the month buttons keep it on ---- */
await step('C4-months-keep-it', async () => {
  const d = await where()
  await tapCell(page, P, d)
  await press(page, 'decide-shift')
  await page.locator('[data-testid="month-MAR"]').first().scrollIntoViewIfNeeded()
  const mb = await centre(page, 'month-MAR')
  await tapAt(page, mb.x, mb.y)
  await page.waitForTimeout(900)
  const b = await banner(page)
  await pic('C4-after-month-button')
  R.ck('C4-month-keeps', /Tap a day to move 1 entry/.test(b), 'pressing MAR scrolls the grid and the move stays on', b)
  const l = await landOn(`cell-${P}-2026-03-10`)
  const g = await grid(page, [P], ['2026-03-10'])
  await pic('C4-landed-in-march')
  R.ck('C4-lands-in-march', /LL/.test(g[P]) && !(await banner(page)), 'the chip lands in March, carried across the month jump', { l, g })
  await lwHist(page, 'undo')
  await lwOpen(page, '2026-01-20')
})

/* ---- C5: outside the grid — an empty spot cancels; a control does not ---- */
await step('C5-outside-empty-cancels', async () => {
  const d = await where()
  await tapCell(page, P, d)
  await press(page, 'decide-shift')
  await page.waitForTimeout(450)
  const spot = await page.evaluate(() => {
    const card = document.querySelector('.stage > .card').getBoundingClientRect()
    const x = Math.max(2, Math.round(card.left / 2)), y = Math.round(innerHeight / 2)
    const h = document.elementFromPoint(x, y)
    return { x, y, what: h ? `${h.tagName}.${String(h.className).split(' ')[0]}` : 'nothing', control: !!(h && h.closest('button, a, input, select, [role="button"]')) }
  })
  await tapAt(page, spot.x, spot.y)
  await pic('C5-cancelled-by-outside-tap')
  const g = await grid(page, [P], [d])
  R.ck('C5-cancelled', !(await banner(page)) && /LL/.test(g[P]) && !spot.control, 'a tap on the empty page beside the grid ends the move; nothing moved', { spot, g })
})
await step('C5b-controls-keep-it', async () => {
  const d = await where()
  await tapCell(page, P, d)
  await press(page, 'decide-shift')
  await page.waitForTimeout(450)
  await page.locator('[data-testid="counts-toggle"]').first().scrollIntoViewIfNeeded()
  const t = await centre(page, 'counts-toggle')
  await tapAt(page, t.x, t.y)                           // the grid's own Manning toggle
  const b1 = await banner(page)
  await tapAt(page, t.x, t.y)                           // and back
  const legend = page.locator('button', { hasText: 'Legend' }).first()
  await legend.scrollIntoViewIfNeeded()
  if (PHONE) await legend.tap(); else await legend.click()
  await page.waitForTimeout(600)
  const opened = await sheetNow(page)
  const b2 = await banner(page)
  const legendUp = await page.locator('[data-testid="legend"]:visible').count()
  await pic('C5b-legend-over-a-move')
  /* close it the way a person does — a tap on its shade, away from the list */
  const shade = await page.evaluate(() => { const l = document.querySelector('[data-testid="legend"]').getBoundingClientRect(); return { x: Math.min(innerWidth - 6, l.right + 8 < innerWidth ? l.right + 8 : 6), y: Math.min(innerHeight - 120, l.bottom + 30) } })
  await tapAt(page, shade.x, shade.y)
  const legendGone = !(await page.locator('[data-testid="legend"]:visible').count())
  const b3 = await banner(page)
  R.ck('C5b-controls', /1 entry/.test(b1) && legendUp === 1 && /1 entry/.test(b2) && legendGone && /1 entry/.test(b3), 'the Manning toggle, the Legend (a control outside the grid) and a tap on its shade to close it all leave the move on', { b1, legendUp, b2, legendGone, b3 })
})

/* ---- C6 (desktop): the mouse at the grid's edges scrolls the days ---- */
if (!PHONE) await step('C6-hover-edge-scroll', async () => {
  const d = await where()
  await tapCell(page, P, d)
  await press(page, 'decide-shift')
  const row = await at(page, `cell-${P}-${d}`)
  const box = await gridBox(page)
  await page.mouse.move(800, row.y); await page.waitForTimeout(200)
  const s0 = (await gridState(page)).scrollLeft
  await page.mouse.move(box.right - 12, row.y); await page.waitForTimeout(1300)
  const s1 = (await gridState(page)).scrollLeft
  await pic('C6-scrolled-right-by-the-edge')
  await page.mouse.move(box.namesRight + 14, row.y); await page.waitForTimeout(700)
  const s2 = (await gridState(page)).scrollLeft
  await page.mouse.move(800, row.y); await page.waitForTimeout(300)
  const s3 = (await gridState(page)).scrollLeft
  await page.waitForTimeout(500)
  const s4 = (await gridState(page)).scrollLeft
  const day = await dayAt(page, 800, row.y)
  await page.mouse.click(800, row.y); await page.waitForTimeout(600)
  const g = await grid(page, [P], [day])
  await pic('C6-landed-after-edge-scroll')
  R.ck('C6-edge-scroll', s1 - s0 > 150 && s2 < s1 && s3 === s4 && /LL/.test(g[P]) && !(await banner(page)),
    'the mouse at the right edge scrolls the days on, at the left edge (past the names) back, in the middle it stops; a click then lands it on the day under the mouse', { s0, s1, s2, s3, s4, day, g, box })
  await lwHist(page, 'undo')
})

/* ---- C7: a press-and-drag carries it to the edge and lands on the lift ---- */
await step('C7-drag-to-edge-and-release', async () => {
  const d = await where()
  await tapCell(page, P, d)
  await press(page, 'decide-shift')
  await page.waitForTimeout(450)
  const p = await at(page, `cell-${P}-${d}`)
  const box = await gridBox(page)
  const s0 = (await gridState(page)).scrollLeft
  let day, staged = ''
  if (!PHONE) {
    await page.mouse.move(p.x, p.y); await page.mouse.down()
    await page.mouse.move(p.x + 20, p.y, { steps: 3 })
    await page.mouse.move(box.right - 14, p.y, { steps: 10 }); await page.waitForTimeout(1100)
    await page.mouse.move(800, p.y, { steps: 8 }); await page.waitForTimeout(200)
    day = await dayAt(page, 800, p.y)
    await page.mouse.up(); await page.waitForTimeout(700)
  } else {
    await fingerHoldDrag(page, cdp, p, [{ x: 384, y: p.y, dwell: 1100 }, { x: 250, y: p.y }])
    day = await dayAt(page, 250, p.y)
    staged = await banner(page)
    await pic('C7-phone-lift-stages')
    if (await page.locator('[data-testid="move-confirm"]:visible').count()) await press(page, 'move-confirm')
  }
  const s1 = (await gridState(page)).scrollLeft
  const g = await grid(page, [P], [day])
  await pic('C7-landed-after-drag')
  R.ck('C7-drag-lands', s1 - s0 > 100 && /LL/.test(g[P]) && !(await banner(page)) && (!PHONE || /Move 1 entry here\?/.test(staged)),
    'held and dragged to the right edge the days scroll on; the release lands it on the day under the pointer (the phone stages it, Confirm lands it)', { s0, s1, day, staged, g })
  await lwHist(page, 'undo')
  await lwOpen(page, '2026-01-20')
})

/* ---- C8 (desktop): a double-click on Move lands nothing (S1) ---- */
if (!PHONE) await step('C8-double-click-move', async () => {
  const d = await where()
  await tapCell(page, P, d)
  await page.locator('[data-testid="bid-picker"] [data-testid="decide-shift"]').dblclick()
  await page.waitForTimeout(700)
  const g = await grid(page, [P], [d])
  R.ck('C8-dblclick', /LL/.test(g[P]) && /1 entry/.test(await banner(page)), 'a double-click on Move picks the chip up and lands nothing', { d, g })
})

/* ---- C9: once bidding has closed — the dotted mark and "moved from" ---- */
await step('C9-closed-dotted-mark', async () => {
  await stageGo(page, 'advance')
  await lwOpen(page, '2026-02-02')
  await tapCell(page, 'slash', '2026-02-02')
  await press(page, 'decide-shift')
  const l = await landOn('cell-slash-2026-02-06')
  const cls = await page.locator('[data-testid="cell-slash-2026-02-06"] .c').first().getAttribute('class').catch(() => '')
  await pic('C9-closed-landed-dotted')
  const s = await tapCell(page, 'slash', '2026-02-06')
  await pic('C9-closed-moved-from')
  R.ck('C9-dotted', /moved/.test(cls || '') && /moved from 2026-02-02/.test(s.text || ''), 'at BIDDING CLOSED the landed chip wears the dotted mark and its sheet says "moved from 2 Feb"', { l, cls, text: (s.text || '').slice(0, 200) })
  await closeSheets(page)
  await lwHist(page, 'undo')
  await stageGo(page, 'back')
  R.note('C9-stage', await stageNow(page))
})

/* ---- C10: leaving the Leave War ends a move (S9) ---- */
await step('C10-leaving-ends-it', async () => {
  await lwOpen(page, '2026-01-20')
  const d = await where()
  await tapCell(page, P, d)
  await press(page, 'decide-shift')
  const b0 = await banner(page)
  await go(page, 'inputs')
  await page.waitForTimeout(500)
  const ghost = await page.locator('[data-testid="move-ghost"]').count()
  await lwOpen(page, '2026-01-20')
  const b1 = await banner(page)
  R.ck('C10-ended', /1 entry/.test(b0) && !b1 && ghost === 0, 'going to the Inputs page ends the move; back on the war there is none', { b0, ghost, b1 })
})

/* ---- C11: the drag-selection's Move… — months keep it, an outside tap ends it ---- */
await step('C11-block-move', async () => {
  const d = await where()
  let s
  if (!PHONE) s = await dragRect(page, P, d, P, d)
  else { const p = await centre(page, `cell-${P}-${d}`); await fingerHoldDrag(page, cdp, p, [{ x: p.x + 2, y: p.y }]); s = await sheetNow(page) }
  await selPress(page, 'sel-move')
  const b0 = await banner(page)
  await page.locator('[data-testid="month-FEB"]').first().scrollIntoViewIfNeeded()
  const mb = await centre(page, 'month-FEB'); await tapAt(page, mb.x, mb.y); await page.waitForTimeout(900)
  const b1 = await banner(page)
  const l = await landOn(`cell-${P}-2026-02-10`)
  const g = await grid(page, [P], ['2026-02-10'])
  R.ck('C11-block-month-land', s.open === 'select-sheet' && /1 entry/.test(b0) && /1 entry/.test(b1) && /LL/.test(g[P]), 'the drag-selection\'s Move… keeps on through the FEB button and lands in February', { open: s.open, b0, b1, l, g })
  await lwHist(page, 'undo')
  await lwOpen(page, '2026-01-20')
  const d2 = await where()
  if (!PHONE) await dragRect(page, P, d2, P, d2)
  else { const p = await centre(page, `cell-${P}-${d2}`); await fingerHoldDrag(page, cdp, p, [{ x: p.x + 2, y: p.y }]) }
  await selPress(page, 'sel-move')
  await page.waitForTimeout(450)
  const spot = await page.evaluate(() => { const c = document.querySelector('.stage > .card').getBoundingClientRect(); return { x: Math.max(2, Math.round(c.left / 2)), y: Math.round(innerHeight / 2) } })
  await tapAt(page, spot.x, spot.y)
  R.ck('C11-block-outside-cancels', !(await banner(page)), 'an empty tap outside the grid ends the drag-selection\'s move too', await banner(page))
})

/* ---- C12 (phone): a quick swipe never lands; a long press never cancels (S11) ---- */
if (PHONE) await step('C12-swipe-and-long-press', async () => {
  const d = await where()
  await tapCell(page, P, d)
  await press(page, 'decide-shift')
  await page.waitForTimeout(450)
  const p = await at(page, `cell-${P}-${d}`)
  const s0 = (await gridState(page)).scrollLeft
  await fingerSwipe(page, cdp, { x: 330, y: p.y }, { x: 230, y: p.y })
  const s1 = (await gridState(page)).scrollLeft
  const b1 = await banner(page)
  await pic('C12-after-swipe')
  R.ck('C12-swipe', s1 !== s0 && /Tap a day to move/.test(b1), 'a quick swipe scrolls the grid and stages nothing — the move is still waiting for a day', { s0, s1, b1 })
  /* a long press on a DAY in view (the probe mv-21 shows 300 / 600 / 900 ms each stage it) */
  const cands = await page.evaluate(([pid, y]) => [...document.querySelectorAll(`[data-testid^="cell-${pid}-2026-0"]`)].map(c => { const b = c.getBoundingClientRect(); return { id: c.getAttribute('data-testid'), x: b.left + b.width / 2, y: b.top + b.height / 2, empty: !(c.innerText || '').trim() } }).filter(c => c.empty && c.x > 240 && c.x < 370), [P, p.y])
  const q = cands[0] ? await at(page, cands[0].id) : null
  if (q && q.ok) await fingerHoldDrag(page, cdp, q, [], { holdMs: 900 })
  const b2 = await banner(page)
  await pic('C12-after-long-press')
  R.ck('C12-long-press', !!q?.ok && /Move 1 entry here\?/.test(b2), 'a long press on a free day does not cancel the move: the day under the finger is staged for Confirm', { day: cands[0]?.id, b2 })
})

/* ---- C13: the event move shares the machine — an outside tap ends it; a day on its line lands it ---- */
await step('C13-event-move', async () => {
  await lwOpen(page, '2026-01-05')
  await page.locator('[data-testid="event-0-2026-01-01"], [data-testid^="event-band-0-2026-01-01"]').first().scrollIntoViewIfNeeded()
  const ev = await page.evaluate(() => { const e = document.querySelector('[data-testid="event-0-2026-01-01"]') || document.querySelector('[data-testid^="event-band-0-2026-01-01"]'); if (!e) return null; const b = e.getBoundingClientRect(); return { id: e.getAttribute('data-testid'), x: b.left + b.width / 2, y: b.top + b.height / 2, text: (e.innerText || '').trim() } })
  await tapAt(page, ev.x, ev.y)
  const s = await sheetNow(page)
  await press(page, 'event-move')
  const b0 = await page.locator('[data-testid="event-move-banner"]:visible').count()
  await page.waitForTimeout(450)
  const spot = await page.evaluate(() => { const c = document.querySelector('.stage > .card').getBoundingClientRect(); return { x: Math.max(2, Math.round(c.left / 2)), y: Math.round(innerHeight / 2) } })
  await tapAt(page, spot.x, spot.y)
  const b1 = await page.locator('[data-testid="event-move-banner"]:visible').count()
  await pic('C13-event-move-cancelled-outside')
  R.ck('C13-event-outside-cancels', !!ev && /PH/.test(ev.text) && b0 === 1 && b1 === 0, 'the PH event’s Move… picks it up (the event banner), and an empty tap outside the grid ends it', { ev, sheet: s.open, b0, b1 })
})

R.note('errors', errors.length ? errors : 'none')
R.save()
await browser.close()
