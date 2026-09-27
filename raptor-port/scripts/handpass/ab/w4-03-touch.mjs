/* W4 — the PHONE by FINGER (26 Sep 26). Old plan G1; Fable S15. 390 x 844 with real touch (CDP
   Input.dispatchTouchEvent — the same pointer events a phone sends; worked example scripts/handpass/trk-pinch.mjs).
     G1a  hold-and-drag selects a block of days; the sheet it opens fills it (admin)
     G1b  the two-step move: a landing where ONE day clashes is refused whole, nothing moves; a clean landing
          stages first (painted, Confirm) and lands only on Confirm; the figures follow
     G1c  a quick flick scrolls the grid and never arms a selection or opens a sheet
     G1d  a wobble: a small jitter during the hold is tolerated (the hold still arms); an early slide past the
          give-up distance gives up — no selection
     G1e  the member (Ranger): a drag over his own row fills; a drag that also covers another man's row writes only
          his own and says how many it skipped (D166)
   After every gesture the figure readers are read. Usage: node scripts/handpass/ab/w4-03-touch.mjs */
process.env.AB_WHO = 'w4'
const L = await import('./w4-lib.mjs')
const { openW4, fileInput, lwOpen, closeSheets, sheetPress, sheetNow, shot, resultBook, ROOT, readAll, cellOf, rowRun, fingerTap, sideScroll, toastSpy, toasts } = L
const R = resultBook('W4-touch', `${ROOT}/docs/handpass/parts/2026-09-26-absence-w4-touch.txt`)
const P = n => `w4-touch-${n}`
let page
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).split('\n')[0].slice(0, 300)); await shot(page, P(`THREW-${name}`)).catch(() => {}); await closeSheets(page).catch(() => {}) } }

/* ---- the finger ---------------------------------------------------------------------------------------------- */
const centre = (pg, sel) => pg.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2), w: Math.round(b.width), h: Math.round(b.height) } }, sel)
async function bringIntoView(pg, sel) {
  await pg.locator(sel).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await pg.waitForTimeout(350)
}
/** One finger: down at a, HOLD `hold` ms, slide to b in `steps` moves of `stepMs`, lift. */
async function finger(pg, cdp, a, b, { hold = 260, steps = 10, stepMs = 30, jitter = 0 } = {}) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: a.x, y: a.y, id: 7 }] })
  if (jitter) {
    /* a wobble WHILE holding: small moves either side of the press, inside the give-up distance */
    const n = Math.max(2, Math.floor(hold / 40))
    for (let i = 0; i < n; i++) { await pg.waitForTimeout(40); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a.x + (i % 2 ? -jitter : jitter), y: a.y + (i % 2 ? jitter / 2 : -jitter / 2), id: 7 }] }) }
  } else if (hold) await pg.waitForTimeout(hold)
  for (let i = 1; i <= steps; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: Math.round(a.x + (b.x - a.x) * i / steps), y: Math.round(a.y + (b.y - a.y) * i / steps), id: 7 }] })
    await pg.waitForTimeout(stepMs)
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await pg.waitForTimeout(700)
}
const gridState = pg => pg.evaluate(() => {
  const w = document.querySelector('.mx-wrap')
  return { scrollLeft: w ? Math.round(w.scrollLeft) : null, scrollY: Math.round(scrollY), lit: document.querySelectorAll('.selcell').length,
    selecting: !!document.querySelector('.mx-wrap[data-selecting]'), sheet: [...document.querySelectorAll('.bidsheet[role="dialog"]')].filter(e => e.offsetWidth).map(e => e.getAttribute('data-testid')),
    banner: ((document.querySelector('[data-testid="move-banner"]') || {}).innerText || '').replace(/\s+/g, ' ').trim(), landing: [...document.querySelectorAll('.mvland')].map(e => e.getAttribute('data-testid')) }
})
/** Hold on one day of a man's row and drag to another day (same or another row). */
async function dragSelect(pg, cdp, from, to, opts = {}) {
  await bringIntoView(pg, `[data-testid="cell-${from[0]}-${from[1]}"]`)
  const a = await centre(pg, `[data-testid="cell-${from[0]}-${from[1]}"]`)
  const b = await centre(pg, `[data-testid="cell-${to[0]}-${to[1]}"]`)
  if (!a || !b) return { err: 'cell not drawn', a, b }
  await finger(pg, cdp, a, b, opts)
  return { a, b, after: await gridState(pg), sheet: await sheetNow(pg) }
}

/* ================================================================ ADMIN */
{
  const o = await openW4({ phone: true, who: 'a' })
  page = o.page
  const { browser, errors } = o
  await toastSpy(page)
  const cdp = await page.context().newCDPSession(page)
  const id = 'prowler'                                   // Hunter — nothing on him in August
  const A = ['2026-08-03', '2026-08-04', '2026-08-05']   // Mon–Wed
  await step('G1a', async () => {
    await lwOpen(page, A[0])
    const r0 = await readAll(page, id, A[0], { bd: ['lve'] })
    await lwOpen(page, A[0])
    const d = await dragSelect(page, cdp, [id, A[0]], [id, A[2]])
    await shot(page, P('G1a-select-sheet'))
    R.ck('G1a-drag-selects', d.sheet.open === 'select-sheet' && /3 days/.test(d.sheet.text || ''), 'a hold-and-drag along his row opens the selection sheet for the three days', { sheet: d.sheet.open, text: (d.sheet.text || '').slice(0, 120), a: d.a, b: d.b })
    const f = await sheetPress(page, 'sel-LL')
    await closeSheets(page)
    const cells = await rowRun(page, id, A)
    const r1 = await readAll(page, id, A[1], { bd: ['lve'] })
    R.ck('G1a-fill', cells.every(c => /LL/.test(c)) && Math.round((L.top(r1.sheet.lve) - L.top(r0.sheet.lve)) * 10) / 10 === -3 && r1.agree, 'the three days fill with LL bids, LVE falls by 3 at once, every reader agreeing', { pressed: f.pressed, cells, lve: [r0.sheet.lve, r1.sheet.lve], disagree: r1.disagree })
    await L.lwShot(page, P('G1a-filled'), id, A[1])
  })
  await step('G1b', async () => {
    /* the clash to land on: an LL filed on the Inputs page for Wed 12 Aug */
    const c = await fileInput(page, { person: id, type: 'LL', from: '2026-08-12', span: 'all', remarks: 'W4 G1 the landing clash' })
    await lwOpen(page, A[0])
    const r0 = await readAll(page, id, A[0], { bd: ['lve'] })
    await lwOpen(page, A[0])
    const d = await dragSelect(page, cdp, [id, A[0]], [id, A[2]])
    const mv = await sheetPress(page, 'sel-move')
    const g0 = await gridState(page)
    await shot(page, P('G1b-move-mode'))
    R.ck('G1b-move-mode', /Tap a day to move 3/.test(g0.banner), 'Move… closes the sheet and the banner says "Tap a day to move 3 entries"', { sel: d.sheet.open, move: mv.pressed, banner: g0.banner })
    /* landing 10–12 Aug: the 12th holds the filed LL → refused whole, nothing moves, no Confirm */
    const t1 = await fingerTap(page, `[data-testid="cell-${id}-2026-08-10"]`)
    const g1 = await gridState(page)
    await shot(page, P('G1b-refused-landing'))
    const confirm1 = await page.locator('[data-testid="move-confirm"]:visible').count()
    const cells1 = await rowRun(page, id, [...A, '2026-08-10', '2026-08-11', '2026-08-12'])
    R.ck('G1b-refused-whole', t1.ok && !confirm1 && !/Tap a day/.test(g1.banner) && g1.landing.length === 0 && cells1.slice(0, 3).every(x => /LL/.test(x)) && !/LL/.test(cells1[3] + cells1[4]), 'a landing with ONE clashing day is refused whole: the banner says why, no Confirm, nothing painted, nothing moved', { tap: t1, banner: g1.banner, confirm: confirm1, landing: g1.landing, cells: cells1 })
    /* landing 17–19 Aug: clean → staged (painted + Confirm), lands only on Confirm */
    const t2 = await fingerTap(page, `[data-testid="cell-${id}-2026-08-17"]`)
    const g2 = await gridState(page)
    await shot(page, P('G1b-staged'))
    const cellsStaged = await rowRun(page, id, [...A, '2026-08-17', '2026-08-18', '2026-08-19'])
    R.ck('G1b-staged-not-landed', t2.ok && g2.landing.length === 3 && /here\?/.test(g2.banner) && cellsStaged.slice(0, 3).every(x => /LL/.test(x)) && !/LL/.test(cellsStaged.slice(3).join('')), 'a clean landing is STAGED first: three days painted, "Move 3 entries here?" with Confirm — nothing has moved yet', { banner: g2.banner, landing: g2.landing, cells: cellsStaged })
    const cf = await fingerTap(page, '[data-testid="move-confirm"]')
    await page.waitForTimeout(400)
    const g3 = await gridState(page)
    const cells3 = await rowRun(page, id, [...A, '2026-08-17', '2026-08-18', '2026-08-19'])
    const r1 = await readAll(page, id, '2026-08-18', { bd: ['lve'] })
    R.ck('G1b-confirm-lands', cf.ok && !g3.banner && cells3.slice(0, 3).every(x => !/LL/.test(x)) && cells3.slice(3).every(x => /LL/.test(x)), 'Confirm lands the block on 17–19 Aug and clears 3–5 Aug; the banner goes', { cells: cells3, banner: g3.banner })
    R.ck('G1b-figures', L.top(r1.sheet.lve) === L.top(r0.sheet.lve) && r1.agree, 'weekday to weekday: LVE unchanged by the move, every reader agreeing', { before: r0.sheet.lve, after: r1.sheet.lve, disagree: r1.disagree })
    R.ck('G1b-no-moved-mark', !/dot|moved|shifted/.test((await cellOf(page, id, '2026-08-18')).chipCls), 'bidding still OPEN: no dotted "moved" mark (recorded only once bidding is closed)', await cellOf(page, id, '2026-08-18'))
    await L.lwShot(page, P('G1b-landed'), id, '2026-08-18')
  })
  await step('G1c', async () => {
    await lwOpen(page, '2026-08-17')
    const sel = `[data-testid="cell-${id}-2026-08-24"]`
    await bringIntoView(page, sel)
    const a = await centre(page, sel)
    const g0 = await gridState(page)
    await finger(page, cdp, a, { x: a.x - 160, y: a.y + 4 }, { hold: 0, steps: 6, stepMs: 12 })
    const g1 = await gridState(page)
    await shot(page, P('G1c-after-flick'))
    R.ck('G1c-flick-scrolls', g1.scrollLeft !== g0.scrollLeft && g1.lit === 0 && !g1.selecting && g1.sheet.length === 0, 'a quick sideways flick scrolls the grid, arms nothing, opens nothing', { before: g0.scrollLeft, after: g1.scrollLeft, lit: g1.lit, sheet: g1.sheet })
  })
  await step('G1d', async () => {
    await lwOpen(page, '2026-08-24')
    const s1 = `[data-testid="cell-${id}-2026-08-25"]`
    await bringIntoView(page, s1)
    const a = await centre(page, s1)
    const b = await centre(page, `[data-testid="cell-${id}-2026-08-26"]`)
    /* (i) a jitter of ±8px while holding, then the slide: tolerated — the hold still arms and the sheet opens */
    const g0 = await gridState(page)
    await finger(page, cdp, a, b, { hold: 280, jitter: 8, steps: 8, stepMs: 30 })
    const s = await sheetNow(page)
    await shot(page, P('G1d-jitter-still-arms'))
    R.ck('G1d-jitter-tolerated', s.open === 'select-sheet', 'a small wobble during the hold is tolerated: the drag still arms and selects', { open: s.open, text: (s.text || '').slice(0, 80) })
    await closeSheets(page)
    /* (ii) an early slide of 40px (before the hold could arm), then held still, then lifted: gives up */
    await bringIntoView(page, s1)
    const a2 = await centre(page, s1)
    const gb = await gridState(page)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: a2.x, y: a2.y, id: 8 }] })
    for (let i = 1; i <= 4; i++) { await page.waitForTimeout(15); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a2.x - 10 * i, y: a2.y, id: 8 }] }) }
    await page.waitForTimeout(400)   // now held still, long past the hold time
    const mid = await gridState(page)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await page.waitForTimeout(600)
    const ga = await gridState(page)
    const s2 = await sheetNow(page)
    await shot(page, P('G1d-early-slide-gives-up'))
    R.ck('G1d-early-slide-gives-up', !mid.selecting && mid.lit === 0 && ga.lit === 0 && s2.open === 'nothing', 'a 40px slide before the hold arms gives the gesture up to the scroll: nothing lights while held, nothing opens on lift', { heldState: { selecting: mid.selecting, lit: mid.lit }, after: { lit: ga.lit, scroll: [gb.scrollLeft, ga.scrollLeft] }, open: s2.open })
    await closeSheets(page)
  })
  R.note('admin-side-scroll', await sideScroll(page))
  R.note('admin-toasts', await toasts(page))
  R.note('admin-errors', errors.slice(0, 20))
  await browser.close()
}

/* ================================================================ MEMBER (us = Ranger, person bane) */
{
  const o = await openW4({ phone: true, who: 'm' })
  page = o.page
  const { browser, errors } = o
  const cdp = await page.context().newCDPSession(page)
  const me = 'bane', D = ['2026-03-09', '2026-03-10', '2026-03-11']   // inside the bidding window (1 Jan – 31 Mar)
  await step('G1e', async () => {
    await lwOpen(page, D[0])
    const r0 = await readAll(page, me, D[0], { bd: ['lve'] })
    await lwOpen(page, D[0])
    const d = await dragSelect(page, cdp, [me, D[0]], [me, D[2]])
    await shot(page, P('G1e-member-select'))
    const f = await sheetPress(page, 'sel-LL')
    await closeSheets(page)
    const cells = await rowRun(page, me, D)
    const r1 = await readAll(page, me, D[1], { bd: ['lve'] })
    R.ck('G1e-own-row', d.sheet.open === 'select-sheet' && cells.every(c => /LL/.test(c)) && Math.round((L.top(r1.sheet.lve) - L.top(r0.sheet.lve)) * 10) / 10 === -3 && r1.agree, 'the member drags his own row by finger and fills three LL bids; his LVE falls by 3, every reader agreeing', { open: d.sheet.open, cells, lve: [r0.sheet.lve, r1.sheet.lve], disagree: r1.disagree })
    /* a rectangle over his row AND the next man's (Saber, stiff) — only his own may be written */
    const E = ['2026-03-16', '2026-03-17']
    await lwOpen(page, E[0])
    const order = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].map(e => e.getAttribute('data-testid').slice(4)))
    const other = order[order.indexOf(me) + 1]
    const d2 = await dragSelect(page, cdp, [me, E[0]], [other, E[1]])
    const f2 = await sheetPress(page, 'sel-LL')
    const note = await sheetNow(page)
    await shot(page, P('G1e-member-two-rows'))
    await closeSheets(page)
    const mine = await rowRun(page, me, E), theirs = await rowRun(page, other, E)
    /* by design (Matrix.tsx selCtx.order, 27 Aug 26): a member's rectangle never spans rows he could not fill — the
       selection stays on his own row, so there is no "skipped" note to read */
    R.ck('G1e-other-row-untouched', d2.sheet.open === 'select-sheet' && /2 days/.test(d2.sheet.text || '') && /^Ranger\s/.test(d2.sheet.text || '') && mine.every(c => /LL/.test(c)) && theirs.every(c => !/LL/.test(c)), `a drag that runs onto ${other}'s row keeps the selection on his OWN row: his two days fill, the other man's row is untouched`, { sheet: (d2.sheet.text || '').slice(0, 70), mine, theirs, note: (note.text || '').slice(-160) })
  })
  R.note('member-side-scroll', await sideScroll(page))
  R.note('member-errors', errors.slice(0, 20))
  await browser.close()
}
R.save()
