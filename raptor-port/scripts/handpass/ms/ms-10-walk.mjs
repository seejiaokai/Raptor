/* [LW-MOVE-STANDARD] WALK (27 Sep 26) — D264–D266, D330–D335, written as assertions of the RIGHT behaviour, so a re-run
   is the re-walk (MS_RUN=<name> sends it to its own folders — the first walk's pictures are the defects' evidence).
   The real production build (4177), a fresh demo world, the admin unless said; January 2026, bidding OPEN, then CLOSED,
   PUBLISHED and back to DRAFT. People: Vector = divot, Ryder = xray, Wisp = shrek, Ranger = bane (the member 'us').
   Everything is made through the app's own controls (bug-check order §7.7); reads of the saved world are for the table.
   Fable's scenarios: docs/superpowers/specs/2026-09-27-lw-move-standard-scenarios-fable.md (S-numbers below).
   Usage (from raptor-port/, the build served on 4177):
     node scripts/handpass/ms/ms-10-walk.mjs desktop      node scripts/handpass/ms/ms-10-walk.mjs phone
   ONLY=<step prefix> runs one step (its own result file). */
import './ms-env.mjs'
import { mkdirSync } from 'node:fs'
const M = await import('../mv/mv-lib.mjs')
const { WIDTH, PHONE, ROOT, openMv, signInAs, lwOpen, tapCell, sheetNow, sheetPress, closeSheets, recsOf, grid, dragRect,
  lwHist, stageNow, stageGo, resultBook, centre, at, tapAt, press, fingerHoldDrag, fingerSwipe, banner, bidOn, fileInput } = M
const RUN = process.env.MS_RUN || ''
const ONLY = process.env.ONLY || ''
const SHOTS = process.env.HP_SHOTS_MS
mkdirSync(SHOTS, { recursive: true })
const R = resultBook(`MS10-${WIDTH}${RUN ? '-' + RUN : ''}`,
  `${ROOT}/docs/handpass/parts/2026-09-27-lw-move-standard-ms10-${WIDTH}${RUN ? '-' + RUN : ''}${ONLY ? '-only-' + ONLY.replace(/\W+/g, '') : ''}.txt`)
const { browser, page, errors, cdp } = await openMv('a')
const pics = []
/** A picture: the phone's whole screen; on the desktop the whole window (the sheet and the grid behind it). */
async function pic(name) {
  const f = `${SHOTS}/ms10-${WIDTH}-${name}.png`
  await page.screenshot({ path: f }).catch(() => {})
  pics.push(name)
  return f
}
async function step(name, fn) {
  if (ONLY && !name.startsWith(ONLY)) return
  try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await pic(`THREW-${name}`) }
  /* never carry a sheet or a move into the next step */
  try {
    await closeSheets(page)
    if (await banner(page)) await press(page, 'move-cancel')
  } catch (e) { R.note(`cleanup-after-${name}`, String(e && e.message || e).slice(0, 160)) }
}
const bids = r => (r || '').split(',').filter(x => x.startsWith('request:'))
const hasAward = r => /credit:FO\/manual|credit:HO\/manual/.test(r || '')

/** Select a block the way this width does: a mouse drag on the desktop, a held-then-dragged finger on the phone. */
async function selectBlock(a, isoA, b, isoB) {
  if (!PHONE) return dragRect(page, a, isoA, b, isoB)
  const p1 = await centre(page, `cell-${a}-${isoA}`)
  const p2 = await page.locator(`[data-testid="cell-${b}-${isoB}"]`).first().evaluate(e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
  await fingerHoldDrag(page, cdp, p1, [p2])
  return sheetNow(page)
}
/** Bring a day's box on screen the way a person does while moving (a finger's swipe / the mouse wheel). */
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
/** Land what is picked up on a day: a click on the desktop; a tap then Confirm on the phone. */
async function landOn(testid, { confirm = true } = {}) {
  await page.waitForTimeout(450)
  const p = await bringIntoView(testid)
  if (!p || !p.ok) return { landed: false, why: 'not on screen' }
  await tapAt(page, p.x, p.y)
  const said = await banner(page)
  let confirmed = false
  if (PHONE && confirm && (await page.locator('[data-testid="move-confirm"]:visible').count())) { await press(page, 'move-confirm'); confirmed = true }
  return { landed: true, said, confirmed, after: await banner(page) }
}
/** The open sheet's rows, top to bottom, as the first control's testid in each (a label row named by its words). */
const rowsNow = () => page.evaluate(() => {
  const s = [...document.querySelectorAll('.bidsheet[role="dialog"]')].filter(e => e.offsetWidth).pop()
  if (!s) return []
  return [...s.querySelectorAll(':scope > .bidsheet-row')].map(r => {
    const lab = r.querySelector('.lab'); const b = r.querySelector('button')
    return `${lab ? lab.textContent.trim() : '-'}:${b ? b.getAttribute('data-testid') : '-'}`
  })
})
/** How the ONE Move and the ONE Delete look where they are drawn (D334, D332) — measured, not assumed. */
const lookOf = testid => page.evaluate(t => {
  const b = document.querySelector(`[data-testid="${t}"]`); if (!b) return null
  const arr = b.querySelector('.mvarr'); const cs = getComputedStyle(b); const bb = b.getBoundingClientRect()
  return { text: (b.textContent || '').trim(), arrow: arr ? getComputedStyle(arr).color : null, bg: cs.backgroundColor, borderStyle: cs.borderTopStyle, borderColor: cs.borderTopColor, color: cs.color, h: Math.round(bb.height) }
}, testid)
const TEAL = 'rgb(59, 198, 232)'

/* =============================== bidding OPEN =============================== */
await lwOpen(page, '2026-01-05')
R.note('stage-start', await stageNow(page))

await step('A1-fixture', async () => {
  /* Vector's 3 Jan (the owner's picture): an OIL award, then an LL bid beside it — through the day's own sheet */
  let t = await tapCell(page, 'divot', '2026-01-03')
  await sheetPress(page, 'bid-oil')
  await page.fill('[data-testid="oil-why"]', 'Exercise recovery')
  await sheetPress(page, 'oil-give')
  await closeSheets(page)
  const v = await bidOn(page, 'divot', '2026-01-03', 'LL')
  const r = await bidOn(page, 'xray', '2026-01-04', 'LL')
  const w = await bidOn(page, 'shrek', '2026-01-05', 'LL')
  const rec = await recsOf(page, 'divot', ['2026-01-03'])
  R.ck('A1-fixture', v.placed && r.placed && w.placed && hasAward(rec['2026-01-03']) && bids(rec['2026-01-03']).length === 1,
    'Vector 3 Jan holds an award and an LL bid; Ryder 4 Jan and Wisp 5 Jan an LL bid', { v: v.placed, r: r.placed, w: w.placed, rec })
})

await step('B1-oneday-order', async () => {
  const s = await tapCell(page, 'xray', '2026-01-04')
  const rows = await rowsNow()
  const want = ['How many:span-one', 'Decide:decide-ack', 'Selected:decide-shift', 'How much:portion-full', 'Which leave:bid-LL']
  const idx = want.map(w => rows.indexOf(w))
  const inOrder = idx.every((v, i) => v >= 0 && (i === 0 || v > idx[i - 1]))
  const mv = await lookOf('decide-shift'), del = await lookOf('bid-clear')
  await pic('B1-oneday')
  R.ck('B1-order', s.open === 'bid-picker' && inOrder && rows[rows.length - 1].startsWith('-:bid-oil'),
    'one-day sheet: How many → Decide → Selected (Move · Delete) → How much → Which leave → +OIL/PO/PI (D331, D335)', { rows })
  R.ck('B1-look', mv && mv.text === '⇄Move' && mv.arrow === TEAL && del && del.text === 'Delete' && del.borderStyle === 'dashed' && Math.abs(mv.h - del.h) <= 1,
    'Move is the grey chip with a TEAL arrow, Delete the dashed grey, the same height (D332, D334)', { mv, del })
  R.ck('B1-no-clear-chip', !s.buttons.some(b => /^bid-clear:Clear/.test(b)) && !s.buttons.some(b => /bid-clear/.test(b) && /Which/.test(b)),
    'no Clear left among the leave chips', s.buttons.filter(b => /clear/i.test(b)))
})

await step('B2-block-order', async () => {
  const s = await selectBlock('xray', '2026-01-04', 'xray', '2026-01-06')
  const rows = await rowsNow()
  const want = ['Decide:sel-pending', 'Selected:sel-move', 'How much:sel-portion-full', 'Which leave:sel-LL']
  const idx = want.map(w => rows.indexOf(w))
  const inOrder = idx.every((v, i) => v >= 0 && (i === 0 || v > idx[i - 1]))
  const mv = await lookOf('sel-move'), del = await lookOf('sel-delete'), po = await lookOf('sel-postout')
  await pic('B2-block-one-person')
  R.ck('B2-order', s.open === 'select-sheet' && inOrder, 'block sheet: Decide → Selected (Move · Delete) → How much → Which leave (D331)', { rows })
  R.ck('B2-look', mv && mv.text === '⇄Move' && mv.arrow === TEAL && del && del.borderStyle === 'dashed',
    'the block\'s Move and Delete are the SAME buttons as the one-day sheet\'s (D264, D334)', { mv, del })
  R.ck('B2-po', po && po.text === 'PO', 'a one-person block\'s posting button reads "PO", as the one-day sheet\'s', po)
})

await step('C1-award-only-delete', async () => {
  let t = await tapCell(page, 'divot', '2026-01-10')
  await sheetPress(page, 'bid-oil'); await sheetPress(page, 'oil-give'); await closeSheets(page)
  t = await tapCell(page, 'divot', '2026-01-10')
  const noMove = !t.buttons.some(b => /decide-shift/.test(b))
  const c1 = await sheetPress(page, 'bid-clear')
  await pic('C1-award-delete-asks')
  const asked = /Delete also takes .*OIL award \(1 day\) — tap Delete again/.test(c1.sheet.text) && c1.sheet.buttons.some(b => /bid-clear:Delete — sure\?/.test(b))
  const c2 = await sheetPress(page, 'bid-clear')
  const r = await recsOf(page, 'divot', ['2026-01-10'])
  R.ck('C1-award-delete', noMove && asked && c2.sheet.open === 'nothing' && !hasAward(r['2026-01-10']),
    'a day holding only an award: no Move; Delete names the award ("Delete also takes … — tap Delete again"), the second tap takes it (D260, D332)',
    { noMove, text: c1.sheet.text.slice(-160), rec: r })
})

await step('D1-list-award-bid', async () => {
  const t = await tapCell(page, 'divot', '2026-01-03')
  const lines = t.lines || []
  const bidLine = await page.evaluate(() => { const li = [...document.querySelectorAll('[data-testid="daylist"] li')].find(l => /bid, not decided/.test(l.textContent)); return li ? [...li.querySelectorAll('button')].map(b => (b.textContent || '').trim()) : null })
  const awLine = await page.evaluate(() => { const li = [...document.querySelectorAll('[data-testid="daylist"] li')].find(l => /OIL award/.test(l.textContent)); return li ? [...li.querySelectorAll('button')].map(b => (b.textContent || '').trim()) : null })
  const dateBox = await page.locator('[data-testid^="dl-moveto-"]').count()
  const mvId = await page.evaluate(() => { const b = [...document.querySelectorAll('[data-testid^="dl-move-"]')][0]; return b ? b.getAttribute('data-testid') : null })
  await pic('D1-list-vector')
  R.ck('D1-list-buttons', t.open === 'daylist-sheet' && JSON.stringify(bidLine) === JSON.stringify(['Ack', 'Approve', 'Refuse', '⇄Move', 'Delete'])
    && JSON.stringify(awLine) === JSON.stringify(['Edit…', 'Delete']) && dateBox === 0,
    'Vector 3 Jan\'s list: the bid Ack · Approve · Refuse · Move · Delete; the award Edit… · Delete; no date box (D265, D266, D332)', { bidLine, awLine, dateBox, lines })
  const mv = await lookOf(mvId)
  R.ck('D1-list-look', mv && mv.arrow === TEAL, 'the list\'s Move is the same button (D334)', mv)
  await sheetPress(page, mvId)
  const b = await banner(page)
  await pic('D1-picked-up')
  R.ck('D1-picked', /1 entry/.test(b) && /1 OIL award stays/.test(b) && (await sheetNow(page)).open === 'nothing',
    'Move closes the list and picks up THAT bid: "Tap a day to move 1 entry · 1 OIL award stays"', b)
  const l = await landOn('cell-divot-2026-01-05')
  const r = await recsOf(page, 'divot', ['2026-01-03', '2026-01-05'])
  await pic('D1-landed')
  R.ck('D1-landed', l.landed && bids(r['2026-01-05']).length === 1 && /pending/.test(bids(r['2026-01-05'])[0] || '') && hasAward(r['2026-01-03']) && bids(r['2026-01-03']).length === 0,
    'the bid lands undecided on 5 Jan; the award stays on 3 Jan (D265)', { l, r })
  const u = await lwHist(page, 'undo')
  const r2 = await recsOf(page, 'divot', ['2026-01-03', '2026-01-05'])
  R.ck('D1-undo', u.pressed && bids(r2['2026-01-03']).length === 1 && bids(r2['2026-01-05']).length === 0, 'one Undo puts the bid back on 3 Jan', { u, r2 })
})

await step('D2-block-award-bid', async () => {
  const s = await selectBlock('xray', '2026-01-03', 'shrek', '2026-01-03')
  const hasMove = s.buttons.some(b => /^sel-move:/.test(b))
  await pic('D2-block-3jan')
  R.ck('D2-offers-move', s.open === 'select-sheet' && hasMove, 'a block over Ryder–Wisp 3 Jan offers Move (it was Delete only — his picture, D265)', s.buttons)
  await sheetPress(page, 'sel-move')
  const b = await banner(page)
  await pic('D2-picked-up')
  R.ck('D2-banner', /1 entry/.test(b) && /1 OIL award stays/.test(b), 'the banner counts the bid and says the award stays', b)
  const l = await landOn('cell-divot-2026-01-07')
  const r = await recsOf(page, 'divot', ['2026-01-03', '2026-01-07'])
  R.ck('D2-landed', bids(r['2026-01-07']).length === 1 && hasAward(r['2026-01-03']), 'the bid moves alone to 7 Jan; the award stays', { l, r })
  await lwHist(page, 'undo')
})

await step('E1-two-halves', async () => {
  await bidOn(page, 'xray', '2026-01-12', 'LL', { portion: 'am' })
  await bidOn(page, 'xray', '2026-01-12', 'LL', { portion: 'pm' })
  const t = await tapCell(page, 'xray', '2026-01-12')
  const moves = await page.locator('[data-testid^="dl-move-"]').count()
  await pic('E1-list-two-halves')
  R.ck('E1-list-two-moves', t.open === 'daylist-sheet' && moves === 2, 'a morning bid and an afternoon bid: each line has its own Move (D266)', { open: t.open, moves, lines: t.lines })
  /* pick the MORNING */
  const am = await page.evaluate(() => { const li = [...document.querySelectorAll('[data-testid="daylist"] li')].find(l => /morning/.test(l.textContent)); const b = li && li.querySelector('[data-testid^="dl-move-"]'); return b ? b.getAttribute('data-testid') : null })
  await sheetPress(page, am)
  const b = await banner(page)
  R.ck('E1-one-picked', /1 entry/.test(b) && /1 bid stays/.test(b), 'Move on the morning picks up that one; the afternoon stays', b)
  await landOn('cell-xray-2026-01-13')
  const r = await recsOf(page, 'xray', ['2026-01-12', '2026-01-13'])
  R.ck('E1-landed', /\*LL/.test(r['2026-01-13']) && /request:LL\*/.test(r['2026-01-12']) && !/\*LL/.test(r['2026-01-12']), 'the morning on 13 Jan, the afternoon still on 12 Jan', r)
  await lwHist(page, 'undo')
  const s = await selectBlock('xray', '2026-01-12', 'xray', '2026-01-12')
  await sheetPress(page, 'sel-move')
  const b2 = await banner(page)
  R.ck('E1-block-two', /2 entries/.test(b2), 'a block over that day moves both — "2 entries" (S5)', b2)
  await landOn('cell-xray-2026-01-14')
  const r2 = await recsOf(page, 'xray', ['2026-01-12', '2026-01-14'])
  await pic('E1-both-landed')
  R.ck('E1-both-landed', bids(r2['2026-01-14']).length === 2 && bids(r2['2026-01-12']).length === 0, 'both halves land on 14 Jan', r2)
  const u = await lwHist(page, 'undo')
  const r3 = await recsOf(page, 'xray', ['2026-01-12', '2026-01-14'])
  R.ck('E1-one-undo', u.pressed && bids(r3['2026-01-12']).length === 2 && bids(r3['2026-01-14']).length === 0, 'ONE Undo brings both back', r3)
})

await step('E2-inputs-filed-beside', async () => {
  const f = await fileInput(page, { person: 'xray', type: 'LL', from: '2026-01-26', span: 'am', remarks: 'MS10 filed morning' })
  await lwOpen(page, '2026-01-26')
  const t = await tapCell(page, 'xray', '2026-01-26')
  const free = t.open === 'bid-picker' && t.buttons.some(b => /portion-pm/.test(b)) && !t.buttons.some(b => /portion-am/.test(b))
  await closeSheets(page)
  const placed = await bidOn(page, 'xray', '2026-01-26', 'LL', { portion: 'pm' })
  const l = await tapCell(page, 'xray', '2026-01-26')
  const filedLine = await page.evaluate(() => { const li = [...document.querySelectorAll('[data-testid="daylist"] li')].find(x => /filed on the Inputs page/.test(x.textContent)); return li ? li.querySelectorAll('button').length : null })
  const bidMove = await page.locator('[data-testid^="dl-move-"]').count()
  await pic('E2-list-filed-and-bid')
  R.ck('E2-list', l.open === 'daylist-sheet' && filedLine === 0 && bidMove === 1,
    'filed morning + afternoon bid: the filed line has no buttons, the bid one Move', { f: f.ok ?? f, free, placed: placed.placed, filedLine, bidMove, lines: l.lines })
  await closeSheets(page)
  await selectBlock('xray', '2026-01-26', 'xray', '2026-01-26')
  await sheetPress(page, 'sel-move')
  const b = await banner(page)
  R.ck('E2-banner', /1 entry/.test(b) && /1 leave filed on the Inputs page stays/.test(b), 'the block moves the bid alone and says the filed leave stays (W3-F3)', b)
  await landOn('cell-xray-2026-01-27')
  const r = await recsOf(page, 'xray', ['2026-01-26', '2026-01-27'])
  const g = await grid(page, ['xray'], ['2026-01-26'])
  await pic('E2-landed')
  R.ck('E2-landed', /LL\*/.test(r['2026-01-27']) && bids(r['2026-01-26']).length === 0 && /LL/.test(g.xray), 'the bid on 27 Jan; the filed morning still on 26 Jan', { r, g })
})

await step('F1-range', async () => {
  await lwOpen(page, '2026-01-13')
  let t = await tapCell(page, 'shrek', '2026-01-13')
  await sheetPress(page, 'span-range'); await sheetPress(page, 'span-day-2026-01-15')
  /* three days of LL take Wisp below zero: the sheet asks first ("Tap the same leave again") — the same tap is the yes */
  const w = await sheetPress(page, 'bid-LL')
  if (w.sheet.open === 'bid-picker' && /Tap the same leave again/i.test(w.sheet.text)) await sheetPress(page, 'bid-LL')
  await closeSheets(page)
  t = await tapCell(page, 'shrek', '2026-01-13')
  await sheetPress(page, 'span-range'); await sheetPress(page, 'span-day-2026-01-15')
  await pic('F1-range-picked')
  await sheetPress(page, 'decide-shift')
  const b = await banner(page)
  R.ck('F1-range-move', /3 entries/.test(b), 'Pick a range → Move picks up every day of it — "3 entries" (D335)', b)
  await landOn('cell-shrek-2026-01-20')
  const r = await recsOf(page, 'shrek', ['2026-01-13', '2026-01-20', '2026-01-21', '2026-01-22'])
  R.ck('F1-range-landed', bids(r['2026-01-20']).length === 1 && bids(r['2026-01-22']).length === 1 && bids(r['2026-01-13']).length === 0, 'the three land 20–22 Jan', r)
  await lwHist(page, 'undo')
  t = await tapCell(page, 'shrek', '2026-01-13')
  await sheetPress(page, 'span-range'); await sheetPress(page, 'span-day-2026-01-15'); await sheetPress(page, 'decide-ack')
  const r2 = await recsOf(page, 'shrek', ['2026-01-13', '2026-01-14', '2026-01-15'])
  R.ck('F1-range-ack', ['2026-01-13', '2026-01-14', '2026-01-15'].every(d => /acknowledged/.test(r2[d])), 'Pick a range → Ack answers every day of it (D335)', r2)
})

await step('G1-refused-alone', async () => {
  await bidOn(page, 'xray', '2026-01-16', 'LL')
  let t = await tapCell(page, 'xray', '2026-01-16')
  await sheetPress(page, 'decide-refuse')
  t = await tapCell(page, 'xray', '2026-01-16')
  const hasMove = t.buttons.some(b => /decide-shift/.test(b))
  await pic('G1-refused-sheet')
  R.ck('G1-refused-move', hasMove, 'a refused bid alone on its day offers Move (the mock-up\'s reading)', t.buttons)
  await sheetPress(page, 'decide-shift')
  await landOn('cell-xray-2026-01-17')
  const r = await recsOf(page, 'xray', ['2026-01-16', '2026-01-17'])
  R.ck('G1-lands-undecided', /request:LL\/pending/.test(r['2026-01-17']) && bids(r['2026-01-16']).length === 0, 'it lands undecided', r)
})

await step('H1-member', async () => {
  await signInAs(page, 'us')
  await lwOpen(page, '2026-01-06')
  const p = await bidOn(page, 'bane', '2026-01-06', 'LL')
  const t = await tapCell(page, 'bane', '2026-01-06')
  const noDecide = !t.buttons.some(b => /decide-/.test(b) && !/decide-shift/.test(b))
  const hasMove = t.buttons.some(b => /decide-shift/.test(b)), hasDel = t.buttons.some(b => /bid-clear:Delete/.test(b))
  await pic('H1-member-sheet')
  R.ck('H1-member-sheet', p.placed && t.open === 'bid-picker' && noDecide && hasMove && hasDel, 'Ranger\'s own bid, bidding open: no Decide; Move and Delete (D333)', t.buttons)
  await sheetPress(page, 'decide-shift')
  const b = await banner(page)
  await landOn('cell-bane-2026-01-08')
  const r = await recsOf(page, 'bane', ['2026-01-06', '2026-01-08'])
  R.ck('H1-member-moved', /1 entry/.test(b) && bids(r['2026-01-08']).length === 1 && bids(r['2026-01-06']).length === 0, 'his Move lands his bid on 8 Jan', { b, r })
  const other = await tapCell(page, 'xray', '2026-01-04')
  R.ck('H1-not-others', other.open === 'nothing', 'another man\'s bid opens nothing for him', other.open)
  await closeSheets(page)
  await signInAs(page, 'a')
  await lwOpen(page, '2026-01-06')
})

/* =============================== bidding CLOSED =============================== */
await step('J1-closed-leave-and-bid', async () => {
  const g = await stageGo(page, 'advance')
  R.note('J1-stage', g)
  await bidOn(page, 'shrek', '2026-01-19', 'LL', { portion: 'am' })
  let t = await tapCell(page, 'shrek', '2026-01-19')
  await sheetPress(page, 'decide-approve')
  await bidOn(page, 'shrek', '2026-01-19', 'LL', { portion: 'pm' })
  t = await tapCell(page, 'shrek', '2026-01-19')
  const leaveBtns = await page.evaluate(() => { const li = [...document.querySelectorAll('[data-testid="daylist"] li')].find(l => /approved/.test(l.textContent)); return li ? [...li.querySelectorAll('button')].map(b => (b.textContent || '').trim()) : null })
  const dateBox = await page.locator('[data-testid^="dl-moveto-"]').count()
  await pic('J1-list-leave-bid')
  R.ck('J1-leave-line', t.open === 'daylist-sheet' && JSON.stringify(leaveBtns) === JSON.stringify(['Back to bid', 'Refuse', '⇄Move', 'Delete']) && dateBox === 0,
    'approved morning + afternoon bid (closed): the leave line Back to bid · Refuse · Move · Delete, no date box (D266)', { leaveBtns, lines: t.lines })
  const lv = await page.evaluate(() => { const li = [...document.querySelectorAll('[data-testid="daylist"] li')].find(l => /approved/.test(l.textContent)); const b = li && li.querySelector('[data-testid^="dl-move-"]'); return b ? b.getAttribute('data-testid') : null })
  await sheetPress(page, lv)
  const b = await banner(page)
  R.ck('J1-leave-picked', /1 entry/.test(b) && /1 bid stays/.test(b), 'the leave\'s Move picks up the leave alone', b)
  await landOn('cell-shrek-2026-01-21')
  const gr = await grid(page, ['shrek'], ['2026-01-19', '2026-01-21'])
  await pic('J1-leave-landed')
  R.ck('J1-leave-landed', /<LL/.test(gr.shrek.split('|')[1] || '') && /LL>/.test(gr.shrek.split('|')[0] || ''), 'the approved morning on 21 Jan; the afternoon bid still on 19 Jan', gr)
  await lwHist(page, 'undo')
  await selectBlock('shrek', '2026-01-19', 'shrek', '2026-01-19')
  await sheetPress(page, 'sel-move')
  const b2 = await banner(page)
  await landOn('cell-shrek-2026-01-22')
  const gr2 = await grid(page, ['shrek'], ['2026-01-19', '2026-01-22'])
  R.ck('J1-both', /2 entries/.test(b2) && /<LL/.test(gr2.shrek.split('|')[1] || '') && !/LL/.test(gr2.shrek.split('|')[0] || ''), 'a block moves both — "2 entries" (S8)', { b2, gr2 })
  await lwHist(page, 'undo')
})

/* =============================== PUBLISHED =============================== */
await step('K1-published', async () => {
  const g = await stageGo(page, 'advance')
  R.note('K1-stage', g)
  const t = await tapCell(page, 'shrek', '2026-01-19')
  const leaveBtns = await page.evaluate(() => { const li = [...document.querySelectorAll('[data-testid="daylist"] li')].find(l => /approved/.test(l.textContent)); return li ? [...li.querySelectorAll('button')].map(b => (b.textContent || '').trim()) : null })
  await pic('K1-published-list')
  R.ck('K1-leave-finished', leaveBtns && !leaveBtns.includes('⇄Move'), 'on a published war the approved leave is finished paperwork: no Move on its line', leaveBtns)
  await closeSheets(page)
  await selectBlock('shrek', '2026-01-19', 'shrek', '2026-01-19')
  await sheetPress(page, 'sel-move')
  const b = await banner(page)
  await pic('K1-published-banner')
  R.ck('K1-banner', /1 entry/.test(b) && /1 approved leave stays/.test(b), 'a block over it moves the bid alone and says the approved leave stays', b)
})

/* =============================== back to DRAFT =============================== */
await step('L1-draft', async () => {
  for (let i = 0; i < 3; i++) R.note(`L1-back-${i}`, await stageGo(page, 'back'))
  const now = await stageNow(page)
  const t = await tapCell(page, 'xray', '2026-01-04')
  const decide = t.buttons.some(b => /decide-(ack|approve|refuse)/.test(b)), move = t.buttons.some(b => /decide-shift/.test(b))
  await pic('L1-draft-sheet')
  R.ck('L1-draft', /draft/i.test(now) && !decide && move, 'a draft war: no Decide; Move follows the store\'s one rule (the admin may move), as the block always did', { now, buttons: t.buttons })
})

console.log('pictures', pics.length)
R.note('errors', errors.length ? errors.slice(0, 8) : 'none')
R.save()
await browser.close()
