/* D260 + D261 WALK (27 Sep 26) — written as assertions of the RIGHT behaviour, so a re-run is the re-walk.
   D260: every door that clears a day names each OIL award it takes and asks once; one Undo brings them back; Move never
   takes one. D261: a member opens his own award read only at every stage; another man's stays shut.
   Usage: node scripts/handpass/mv/mv-10-awards.mjs [desktop|phone]   (the build served on 4175) */
const M = await import('./mv-lib.mjs')
const { WIDTH, PHONE, ROOT, openMv, signInAs, lwOpen, tapCell, sheetNow, sheetPress, closeSheets, recsOf, grid, dragRect, selPress,
  lwHist, stageNow, stageGo, figures, shot, resultBook, centre, fingerHoldDrag, press } = M
const R = resultBook(`MV10-${WIDTH}`, `${ROOT}/docs/handpass/parts/2026-09-27-d260-d262-mv10-${WIDTH}.txt`)
const { browser, page, errors, cdp } = await openMv('a')
const pic = n => shot(page, `mv10-${WIDTH}-${n}`)
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await pic(`THREW-${name}`).catch(() => {}) } }
const oilOf = async id => (await figures(page, id)).oil
const credit = r => /credit:(FO|HO)\/manual/.test(r)

/** Select a block the way this width does: a mouse drag on the desktop, a held-then-dragged finger on the phone. */
async function selectBlock(a, isoA, b, isoB) {
  if (!PHONE) return dragRect(page, a, isoA, b, isoB)
  const p1 = await centre(page, `cell-${a}-${isoA}`)
  const p2 = await page.locator(`[data-testid="cell-${b}-${isoB}"]`).first().evaluate(e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
  await fingerHoldDrag(page, cdp, p1, [p2])
  return sheetNow(page)
}

await lwOpen(page, '2026-01-05')
R.note('stage-start', await stageNow(page))

/* ======================= D260 — the one-day Clear ======================= */
await step('A1-clear-one-day', async () => {
  const oil0 = await oilOf('prowler')
  const t = await tapCell(page, 'prowler', '2026-01-04')
  const c1 = await sheetPress(page, 'bid-clear')
  await pic('A1-clear-asks')
  const r1 = (await recsOf(page, 'prowler', ['2026-01-04']))['2026-01-04']
  R.ck('A1-asks-first', t.open === 'bid-picker' && c1.sheet.open === 'bid-picker' && /Clear also takes .*OIL award \(1 day\)/.test(c1.sheet.text) && c1.sheet.buttons.some(b => /bid-clear:Clear — sure\?/.test(b)) && (r1 === '-' || credit(r1)),
    'the first Clear names the award, the button reads "Clear — sure?", the award is still there', { open: t.open, text: c1.sheet.text.slice(-200), buttons: c1.sheet.buttons.filter(b => /clear/.test(b)), rec: r1 })
  const c2 = await sheetPress(page, 'bid-clear')
  const r2 = (await recsOf(page, 'prowler', ['2026-01-04']))['2026-01-04']
  const oil1 = await oilOf('prowler')
  await pic('A1-cleared')
  R.ck('A1-takes-on-second', c2.sheet.open === 'nothing' && !credit(r2) && Number(oil1) === Number(oil0) - 1,
    'the second Clear takes it: the sheet closes, the award is gone, his OIL drops by 1', { sheet: c2.sheet.open, rec: r2, oil0, oil1 })
  const u = await lwHist(page, 'undo')
  const r3 = (await recsOf(page, 'prowler', ['2026-01-04']))['2026-01-04']
  const oil2 = await oilOf('prowler')
  R.ck('A1-undo', credit(r3) && Number(oil2) === Number(oil0), 'one Undo brings the award back, and his OIL', { undo: u.title, rec: r3, oil2 })
})

await step('A2-clear-range', async () => {
  await tapCell(page, 'prowler', '2026-01-01')
  await sheetPress(page, 'span-range')
  await sheetPress(page, 'span-day-2026-01-04')
  const c1 = await sheetPress(page, 'bid-clear')
  await pic('A2-range-asks')
  R.ck('A2-names-both', /Clear also takes 2 OIL awards \(\w+ 1 Jan 1 day, \w+ 4 Jan 1 day\)/.test(c1.sheet.text),
    'a range Clear names each award in the span, by its day (one man has two)', c1.sheet.text.slice(-220))
  const c2 = await sheetPress(page, 'bid-clear')
  const r = await recsOf(page, 'prowler', ['2026-01-01', '2026-01-04'])
  R.ck('A2-takes-both', c2.sheet.open === 'nothing' && !credit(r['2026-01-01']) && !credit(r['2026-01-04']), 'the second Clear takes both', { sheet: c2.sheet.open, r })
  await lwHist(page, 'undo')
  const r2 = await recsOf(page, 'prowler', ['2026-01-01', '2026-01-04'])
  R.ck('A2-undo', credit(r2['2026-01-01']) && credit(r2['2026-01-04']), 'one Undo brings both back', r2)
})

/* ======================= D260 — a dragged block's Delete ======================= */
await step('A3-block-delete', async () => {
  const oilP = await oilOf('prowler'), oilS = await oilOf('slipway')
  const s = await selectBlock('slipway', '2026-01-01', 'prowler', '2026-01-04')
  await pic('A3-block-sheet')
  const d1 = await selPress(page, 'sel-delete')
  await pic('A3-delete-asks')
  R.ck('A3-names-awards', s.open === 'select-sheet' && /including 3 OIL awards \(/.test(d1.note) && /Drifter 3 Jan 1 day/.test(d1.note) && /Hunter 1 Jan 1 day/.test(d1.note) && /Hunter 4 Jan 1 day/.test(d1.note),
    'the Delete confirm names each of the three awards in the block before anything goes', { open: s.open, note: d1.note })
  const d2 = await selPress(page, 'sel-delete')
  const g = await grid(page, ['slipway', 'prowler'], ['2026-01-01', '2026-01-03', '2026-01-04'])
  const oilP1 = await oilOf('prowler'), oilS1 = await oilOf('slipway')
  await pic('A3-deleted')
  R.ck('A3-takes-everything', d2.sheet.open === 'nothing' && !/FO|OL/.test(g.slipway) && !/FO/.test(g.prowler) && Number(oilP1) === Number(oilP) - 2 && Number(oilS1) === Number(oilS) - 1,
    'the second Delete takes everything in the block — the approved OL and the three awards; both men\'s OIL drop', { g, oilP, oilP1, oilS, oilS1 })
  await lwHist(page, 'undo')
  const g2 = await grid(page, ['slipway', 'prowler'], ['2026-01-01', '2026-01-03', '2026-01-04'])
  R.ck('A3-one-undo', /OL/.test(g2.slipway) && /FO/.test(g2.slipway) && (g2.prowler.match(/FO/g) || []).length === 2, 'ONE Undo brings the leave and all three awards back', g2)
})

await step('A4-block-of-awards-only', async () => {
  const s = await selectBlock('pike', '2026-01-09', 'pike', '2026-01-11')
  await pic('A4-awards-only-sheet')
  const buttons = (s.buttons || []).join(' ')
  R.ck('A4-delete-no-move', s.open === 'select-sheet' && /sel-delete/.test(buttons) && !/sel-move/.test(buttons), 'a block holding only an award offers Delete, never Move (an award never moves)', buttons)
  const d1 = await selPress(page, 'sel-delete')
  R.ck('A4-names', /including 1 OIL award \(Nomad 1 day\)/.test(d1.note), 'its confirm names the one award', d1.note)
  await closeSheets(page)
})

await step('A5-move-leaves-award', async () => {
  /* a block holding approved leave and an award: Move carries the leave only (Fable's S20) — "1 entry", and the award
     stays on the day he earned it. The landing day is one in view at both widths (a day off screen is not a tap). */
  const s = await selectBlock('pike', '2026-01-10', 'pike', '2026-01-14')
  await selPress(page, 'sel-move')
  const b = await M.banner(page)
  await page.waitForTimeout(450)
  const t = await M.at(page, 'cell-pike-2026-01-12')
  if (t && t.ok) await M.tapAt(page, t.x, t.y)
  if (PHONE) await M.press(page, 'move-confirm')
  const g = await grid(page, ['pike'], ['2026-01-10', '2026-01-14', '2026-01-12'])
  await pic('A5-moved-leave-award-stays')
  R.ck('A5-award-stays', s.open === 'select-sheet' && /1 entry/.test(b) && !!t?.ok && /FO/.test(g.pike.split(' | ')[0]) && /OIL/.test(g.pike.split(' | ')[2]) && !/OIL/.test(g.pike.split(' | ')[1]),
    'Move carries the approved OIL only ("1 entry"); the award stays on 10 Jan', { open: s.open, banner: b, target: t, g })
  if (await M.banner(page)) await M.press(page, 'move-cancel')          // never leave a move on for the next step
  await lwHist(page, 'undo')
  const g2 = await grid(page, ['pike'], ['2026-01-10', '2026-01-14', '2026-01-12'])
  R.ck('A5-undo', /OIL/.test(g2.pike.split(' | ')[1]) && !/OIL/.test(g2.pike.split(' | ')[2]), 'one Undo puts it back', g2)
})

/* ======================= D261 — a member's own award ======================= */
await step('B0-admin-gives-ranger-awards', async () => {
  for (const [iso, why, days] of [['2026-01-20', 'Recall', '2'], ['2026-04-20', 'SIM', '1']]) {
    await lwOpen(page, iso)
    await tapCell(page, 'bane', iso)
    await sheetPress(page, 'bid-oil')
    await page.locator('[data-testid="oil-why"]:visible').fill(why)
    if (why === 'Recall') await page.locator('[data-testid="oil-given-by"]:visible').fill('OC Ops')
    await page.locator('[data-testid="oil-days"]:visible').fill(days)
    await sheetPress(page, 'oil-give')
  }
  const r = await recsOf(page, 'bane', ['2026-01-20', '2026-04-20'])
  R.ck('B0-given', credit(r['2026-01-20']) && credit(r['2026-04-20']), 'the admin gave Ranger (bane) two awards through +OIL', r)
})

async function asMember(fn) { await signInAs(page, 'user'); try { await fn() } finally { await signInAs(page, 'a') } }
const readOnly = s => s.open === 'award-sheet' && !(s.buttons || []).some(b => /bid-|oil-clear|decide-|oil-give/.test(b))

await step('B1-member-open-outside-window', async () => {
  await asMember(async () => {
    await lwOpen(page, '2026-04-20')
    const s = await tapCell(page, 'bane', '2026-04-20')
    await pic('B1-member-own-award-open-stage-outside-window')
    R.ck('B1-read-only-sheet', readOnly(s) && /SIM/.test(s.text) && /a day/.test(s.text) && /only an admin can change it/.test(s.text),
      'OPEN, outside the bidding window: his tap opens the award, read only — reason, given by, days; nothing to press but ✕', { open: s.open, text: s.text, buttons: s.buttons })
    await closeSheets(page)
    await lwOpen(page, '2026-01-20')
    const s2 = await tapCell(page, 'bane', '2026-01-20')
    await pic('B1-member-own-award-inside-window')
    R.ck('B1-inside-window-bid-sheet', s2.open === 'bid-picker' && /Recall/.test(s2.text) && /OC Ops/.test(s2.text) && !(s2.buttons || []).some(b => /bid-oil/.test(b)),
      'inside the window his tap opens the bid sheet as before, the award read back at its foot, no +OIL', { open: s2.open, buttons: s2.buttons })
    const c = await sheetPress(page, 'bid-clear')
    const r = (await recsOf(page, 'bane', ['2026-01-20']))['2026-01-20']
    R.ck('B1-member-clear-takes-no-award', !/OIL award/.test(c.sheet.text || '') && credit(r), 'his Clear neither names nor takes the award', { text: (c.sheet.text || '').slice(-160), r })
    await closeSheets(page)
    const s3 = await tapCell(page, 'prowler', '2026-01-04')
    R.ck('B1-other-mans-award-shut', s3.open === 'nothing', 'another man\'s award opens nothing for him', s3.open)
  })
})

await step('B2-closed', async () => {
  await lwOpen(page, '2026-01-20')
  await stageGo(page, 'advance')
  await asMember(async () => {
    await lwOpen(page, '2026-01-20')
    const s = await tapCell(page, 'bane', '2026-01-20')
    await pic('B2-member-own-award-closed')
    R.ck('B2-closed-read-only', readOnly(s) && /Recall/.test(s.text) && /OC Ops/.test(s.text) && /2 days/.test(s.text), 'BIDDING CLOSED: his award opens read only', { open: s.open, text: s.text })
    await closeSheets(page)
  })
})

await step('B3-published', async () => {
  await lwOpen(page, '2026-04-20')
  await stageGo(page, 'advance')
  R.note('B3-stage', await stageNow(page))
  await asMember(async () => {
    await lwOpen(page, '2026-04-20')
    const s = await tapCell(page, 'bane', '2026-04-20')
    await pic('B3-member-own-award-published')
    R.ck('B3-published-read-only', readOnly(s) && /SIM/.test(s.text), 'PUBLISHED: his award opens read only', { open: s.open, text: s.text })
    await closeSheets(page)
  })
})

/* ======================= D260 on a published war (Fable's S18) ======================= */
await step('A6-published-delete-says-leave-stays', async () => {
  /* the war is PUBLISHED now; slipway's 1 Jan OL (war-approved) is finished paperwork. Give him an award there first. */
  await lwOpen(page, '2026-01-05')
  const s0 = await tapCell(page, 'slipway', '2026-01-01')
  R.note('A6-tap', { open: s0.open, buttons: s0.buttons })
  await closeSheets(page)
  const s = await selectBlock('slipway', '2026-01-01', 'slipway', '2026-01-03')
  const d1 = await selPress(page, 'sel-delete')
  const d2 = await selPress(page, 'sel-delete')
  const r = await recsOf(page, 'slipway', ['2026-01-01', '2026-01-03'])
  const g = await grid(page, ['slipway'], ['2026-01-01', '2026-01-03'])
  await pic('A6-published-delete')
  R.ck('A6-says-leave-stayed', /including 1 OIL award/.test(d1.note) && /1 deleted\. 1 skipped/.test(d2.note) && d2.sheet.open === 'select-sheet' && /OL/.test(g.slipway) && !credit(r['2026-01-03']),
    'PUBLISHED: Delete names and takes the award, and SAYS the approved leave was skipped (the sheet stays)', { ask: d1.note, after: d2.note, open: d2.sheet.open, g, r })
  await closeSheets(page)
  await lwHist(page, 'undo')
})

await step('Z-stage-back', async () => {
  await stageGo(page, 'back'); await stageGo(page, 'back')
  R.note('Z-stage', await stageNow(page))
})

R.note('errors', errors.length ? errors : 'none')
R.save()
await browser.close()
