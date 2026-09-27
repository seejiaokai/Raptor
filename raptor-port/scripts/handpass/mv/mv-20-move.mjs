/* D262 WALK (27 Sep 26) — ONE CHIP, ONE MOVE, written as assertions of the RIGHT behaviour (a re-run is the re-walk).
   The day sheet's Move has no date box and is never greyed; it picks the chip up into the grid's move mode; the chip
   lands on the day clicked (a phone stages it and asks to Confirm); the grid scrolls at its edges while moving; the
   month buttons keep the move on; an empty spot outside the grid ends it; a control does not. Plus Fable's scenarios:
   S1 (a double-click on Move lands nothing), S6 (its own day), S9 (leaving the tab ends it), S11 (a swipe never lands, a
   long press never cancels). Usage: node scripts/handpass/mv/mv-20-move.mjs [desktop|phone]   (build on 4175) */
const M = await import('./mv-lib.mjs')
const { WIDTH, PHONE, ROOT, RUN, openMv, lwOpen, tapCell, sheetNow, sheetPress, closeSheets, recsOf, grid, dragRect, selPress,
  lwHist, stageNow, stageGo, figures, shot, resultBook, centre, at, tapAt, press, fingerHoldDrag, fingerSwipe, banner, gridState,
  dayAt, gridBox, go } = M
const ONLY = process.env.ONLY || ''                 // one step alone — its own result file, never the full record's
const R = resultBook(`MV20-${WIDTH}${RUN ? '-' + RUN : ''}`, `${ROOT}/docs/handpass/parts/2026-09-27-d260-d262-mv20-${WIDTH}${RUN ? '-' + RUN : ''}${ONLY ? '-only-' + ONLY : ''}.txt`)
const { browser, page, errors, cdp } = await openMv('a')
const pic = n => shot(page, `mv20-${WIDTH}-${n}`)
async function step(name, fn) {
  if (ONLY && !name.startsWith(ONLY)) return
  try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await pic(`THREW-${name}`).catch(() => {}) }
  /* never carry a sheet or a move into the next step — the sheets first (one can cover the banner's Cancel) */
  try {
    await closeSheets(page)
    if (await banner(page)) await press(page, 'move-cancel')
    if (await page.locator('[data-testid="event-move-banner"]:visible').count()) await press(page, 'event-move-cancel')
  } catch (e) { R.note(`cleanup-after-${name}`, String(e && e.message || e).slice(0, 160)) }
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
/** An EMPTY spot outside the grid, as a person would tap it. On a desktop: the page beside the grid's card. On a phone
    the grid fills the width, and a finger in its few-pixel margin is snapped by the phone onto the grid's edge (probe
    mv-23) — so the phone's empty area is the bars above the grid: the words "Bidding on" (probe mv-24). */
async function outsideSpot() {
  if (!PHONE) return page.evaluate(() => { const c = document.querySelector('.stage > .card').getBoundingClientRect(); return { x: Math.max(2, Math.round(c.left / 2)), y: Math.round(innerHeight / 2) } })
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(400)
  return page.evaluate(() => { const e = [...document.querySelectorAll('section.page *')].find(x => x.children.length === 0 && /^bidding on$/i.test((x.textContent || '').trim())); const b = e.getBoundingClientRect(); return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) } })
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
  const at0 = await outsideSpot()
  const spot = await page.evaluate(([x, y]) => {
    const h = document.elementFromPoint(x, y)
    return { x, y, what: h ? `${h.tagName}.${String(h.className).split(' ')[0]}` : 'nothing', control: !!(h && h.closest('button, a, input, select, [role="button"]')) }
  }, [at0.x, at0.y])
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
  /* the left band starts where the DAYS start, past the balance column (the final reads, F1) */
  await page.mouse.move(box.daysLeft + 12, row.y); await page.waitForTimeout(700)
  const s2 = (await gridState(page)).scrollLeft
  await page.mouse.move(800, row.y); await page.waitForTimeout(300)
  const s3 = (await gridState(page)).scrollLeft
  await page.waitForTimeout(500)
  const s4 = (await gridState(page)).scrollLeft
  const day = await dayAt(page, 800, row.y)
  await page.mouse.click(800, row.y); await page.waitForTimeout(600)
  const g = await grid(page, [P], [day])
  await pic('C6-landed-after-edge-scroll')
  R.ck('C6-edge-scroll', s1 - s0 > 150 && s2 < s1 - 100 && s3 === s4 && /LL/.test(g[P]) && !(await banner(page)),
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
  const after = await banner(page)
  /* the release picks the day under the pointer: it lands there, or — on a day already booked — is refused with its
     reason and the move stays on (the landing rules, unchanged) */
  const landed = /LL/.test(g[P]) && !after
  const refused = /already booked/.test(after) || /already booked/.test(staged)
  R.ck('C7-drag-lands', s1 - s0 > 100 && (landed || refused) && (!PHONE || /Move 1 entry here\?|already booked/.test(staged)),
    'held and dragged to the right edge the days scroll on; the release picks the day under the pointer — it lands there (the phone stages it, Confirm lands it), or is refused with its reason on a booked day', { s0, s1, day, staged, after, g })
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
  const spot = await outsideSpot()
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
  const spot = await outsideSpot()
  await tapAt(page, spot.x, spot.y)
  const b1 = await page.locator('[data-testid="event-move-banner"]:visible').count()
  await pic('C13-event-move-cancelled-outside')
  R.ck('C13-event-outside-cancels', !!ev && /PH/.test(ev.text) && b0 === 1 && b1 === 0, 'the PH event’s Move… picks it up (the event banner), and an empty tap outside the grid ends it', { ev, sheet: s.open, b0, b1 })
})

/* ==== added for the final reads (27 Sep 26) — each checks a fix in the running app ==== */

/* ---- C6b (desktop): the mouse resting on the card's controls, a callsign, the JAN button never scrolls (Fable F1) ---- */
if (!PHONE) await step('C6b-controls-never-scroll', async () => {
  await lwOpen(page, '2026-01-20')
  const d = await where()
  await tapCell(page, P, d)
  await press(page, 'decide-shift')
  await page.waitForTimeout(450)
  /* park the grid on March with the move on (the month button keeps it), the controls and a row all on screen */
  await page.locator('[data-testid="month-MAR"]').first().scrollIntoViewIfNeeded()
  await page.mouse.wheel(0, -200); await page.waitForTimeout(300)
  const mar = await centre(page, 'month-MAR')
  await tapAt(page, mar.x, mar.y); await page.waitForTimeout(900)
  const s0 = (await gridState(page)).scrollLeft
  const rowY = await page.evaluate(() => { const c = [...document.querySelectorAll('[data-testid^="cell-"]')].map(e => e.getBoundingClientRect()).find(b => b.top > 380 && b.bottom < innerHeight - 100); return c ? c.top + c.height / 2 : null })
  const spots = []
  for (const id of ['counts-toggle', 'month-JAN', 'person-']) {
    const c = await page.evaluate(sel => { const e = [...document.querySelectorAll(sel === 'person-' ? '[data-testid^="person-"]' : `[data-testid="${sel}"]`)].find(x => { const b = x.getBoundingClientRect(); return b.width > 0 && b.top > 70 && b.bottom < innerHeight - 90 }); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 } }, id)
    if (!c || rowY == null) { spots.push({ id, skipped: 'off screen' }); continue }
    await page.mouse.move(800, rowY); await page.waitForTimeout(150)          // over the middle of the days first
    await page.mouse.move(c.x, c.y); await page.waitForTimeout(1000)
    spots.push({ id, scrollLeft: (await gridState(page)).scrollLeft })
  }
  await pic('C6b-resting-on-controls')
  const measured = spots.filter(x => x.scrollLeft != null)
  R.ck('C6b-controls-never-scroll', s0 > 300 && measured.length === 3 && measured.every(x => x.scrollLeft === s0) && /1 entry/.test(await banner(page)),
    'with the grid parked on March and a chip picked up, resting the mouse on Manning, the JAN button or a callsign scrolls nothing', { s0, rowY, spots })
})

/* ---- C7b: a press-and-drag released OFF the days lands nothing (both reads) ---- */
await step('C7b-release-off-the-days', async () => {
  await lwOpen(page, '2026-01-20')
  const d = await where()
  await tapCell(page, P, d)
  await press(page, 'decide-shift')
  await page.waitForTimeout(450)
  const p = await at(page, `cell-${P}-${d}`)
  const g0 = await grid(page, [P], [d])
  /* off the days: the page beside the grid on a desktop; the frozen name column on a phone (still the grid, not a day) */
  const off = PHONE ? { x: 40, y: p.y } : await page.evaluate(() => { const c = document.querySelector('.stage > .card').getBoundingClientRect(); return { x: Math.max(3, Math.round(c.left / 2)), y: Math.round(innerHeight / 2) } })
  if (!PHONE) {
    await page.mouse.move(p.x, p.y); await page.mouse.down()
    await page.mouse.move(p.x + 60, p.y, { steps: 6 })               // across the next days
    await page.mouse.move(off.x, off.y, { steps: 10 })                // and off the grid
    await page.mouse.up(); await page.waitForTimeout(600)
  } else {
    await fingerHoldDrag(page, cdp, p, [{ x: p.x + 60, y: p.y }, { x: off.x, y: off.y }])
  }
  const g1 = await grid(page, [P], [d])
  const b = await banner(page)
  const conf = await page.locator('[data-testid="move-confirm"]:visible').count()
  await pic('C7b-released-off-the-days')
  R.ck('C7b-release-off-lands-nothing', g0[P] === g1[P] && /LL/.test(g1[P]) && conf === 0 && /Tap a day to move 1 entry/.test(b),
    'a drag carried off the grid and let go lands nothing (no Confirm on the phone) and the move is still on', { g0, g1, banner: b, confirm: conf })
})

/* ---- C14 (phone): a sheet opened mid-move, and the tap that closes it, neither stage nor cancel (Fable F2) ---- */
if (PHONE) await step('C14-sheet-mid-move', async () => {
  await lwOpen(page, '2026-01-20')
  const d = await where()
  await tapCell(page, P, d)
  await press(page, 'decide-shift')
  await page.waitForTimeout(450)
  const who = await centre(page, `person-${P}`)
  await tapAt(page, who.x, who.y)                                  // his callsign: every-figure sheet
  const s = await sheetNow(page)
  await pic('C14-sheet-over-a-move')
  /* a tap above the sheet, where a person taps to close it — whatever is under the finger there: a day of the grid if one
     shows above the sheet (the move reads a tap by its DATE, on any row), else the page above it */
  const day = await page.evaluate(() => {
    const top = Math.min(...[...document.querySelectorAll('.bidsheet')].map(e => e.getBoundingClientRect().top), innerHeight)
    const cell = [...document.querySelectorAll('[data-testid^="cell-"]')].map(e => { const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, empty: !(e.innerText || '').trim(), id: e.getAttribute('data-testid') } }).find(b => b.empty && b.y > 130 && b.y < top - 30 && b.x > 200 && b.x < 380)
    return cell || { x: 300, y: Math.max(20, Math.round(top - 40)), id: 'above the sheet (no day shows there)', top }
  })
  if (day) await tapAt(page, day.x, day.y)                         // a tap on the grid beside the sheet
  await page.waitForTimeout(500)
  const b = await banner(page)
  const conf = await page.locator('[data-testid="move-confirm"]:visible').count()
  R.ck('C14-sheet-owns-the-tap', s.open !== 'nothing' && !!day && conf === 0 && /Tap a day to move 1 entry/.test(b),
    'with a sheet opened mid-move, the tap that closes it stages nothing and ends nothing — the move still waits for a day', { sheet: s.open, tapped: day, banner: b, confirm: conf })
})

/* ---- C15: an event row tapped while a chip is picked up opens nothing (Astra 1) ---- */
await step('C15-event-row-mid-move', async () => {
  await lwOpen(page, '2026-01-20')
  const d = await where()
  await tapCell(page, P, d)
  await press(page, 'decide-shift')
  await page.waitForTimeout(450)
  await page.locator('[data-testid="event-0-2026-01-26"]').first().scrollIntoViewIfNeeded()   // a person scrolls up to the event rows
  await page.waitForTimeout(300)
  const ev = await page.evaluate(() => { const e = [...document.querySelectorAll('[data-testid^="event-0-2026-01-2"]')].find(x => { const b = x.getBoundingClientRect(); return b.width > 0 && b.left > 220 && b.right < innerWidth - 10 && b.top > 60 && b.bottom < innerHeight - 90 }); if (!e) return null; const b = e.getBoundingClientRect(); return { id: e.getAttribute('data-testid'), x: b.left + b.width / 2, y: b.top + b.height / 2 } })
  if (ev) await tapAt(page, ev.x, ev.y)
  const s = await sheetNow(page)
  const b = await banner(page)
  R.ck('C15-event-row-inert', !!ev && s.open === 'nothing' && /1 entry/.test(b), 'a tap on an event row while a chip is picked up opens no event sheet — one move at a time', { ev, sheet: s.open, banner: b })
})

R.note('errors', errors.length ? errors : 'none')
R.save()
await browser.close()
