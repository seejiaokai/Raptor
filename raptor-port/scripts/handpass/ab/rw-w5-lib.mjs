/* The W5 RE-WALK (26 Sep 26) — small helpers for the re-walk of the post-out fixes (W5-F1, F2, FR2, FR4): where a man
   stands on the QUALS page — on the roster, or in its Archived section — read the way a person reads it (the page's own
   "All" view, its filter box with his callsign, its Archived fold opened). Import AFTER setting process.env.AB_WHO.
   Reads of window.PEOPLE are for the evidence table only; nothing here writes through window. */
const L = await import('./ab-lib.mjs')
const { go, shot, closeSheets, closeBoard } = L

/** The man on the Quals page: is his row in the roster table (All view, filtered to his callsign), is he in the
    Archived section (opened), and what does the fold's own count say. Takes a picture when `pic` is given. */
export async function quals(page, id, pic) {
  if (await page.locator('#schedBoard:visible').count()) await closeBoard(page)
  await closeSheets(page)
  await go(page, 'quals')
  await page.waitForSelector('#qtbl', { timeout: 10000 })
  await page.locator('#qViewA').click(); await page.waitForTimeout(200)
  const cs = await page.evaluate(p => (window.PEOPLE[p] || {}).cs || p, id)
  await page.locator('#qFilter').fill(cs); await page.waitForTimeout(450)
  const onRoster = (await page.locator(`#qtbl td.qname[data-person="${id}"]`).count()) > 0
  let fold = 'no Archived section', inArchive = false
  const tog = page.locator('#qArchToggle')
  if (await tog.count()) {
    if ((await tog.getAttribute('aria-expanded')) !== 'true') { await tog.click(); await page.waitForTimeout(350) }
    fold = (await tog.innerText()).replace(/\s+/g, ' ').trim()
    inArchive = (await page.locator(`[data-testid="qarchrow-${id}"]`).count()) > 0
    const at = inArchive ? page.locator(`[data-testid="qarchrow-${id}"]`) : page.locator('#qArchive')
    await at.evaluate(e => e.scrollIntoView({ block: 'end' })).catch(() => {})
  } else await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(250)
  if (pic) await shot(page, pic)
  const stored = await page.evaluate(p => { const x = window.PEOPLE[p] || {}; return { archived: !!x.archived, archivedBy: x.archivedBy || '' } }, id)
  await page.locator('#qFilter').fill(''); await page.waitForTimeout(200)
  return { cs, onRoster, inArchive, fold, stored }
}

/** Archive a man BY HAND on the Quals page: Enable editing → the red ✕ on his row → Save (Done). */
export async function archiveByHand(page, id, pic) {
  if (await page.locator('#schedBoard:visible').count()) await closeBoard(page)
  await closeSheets(page)
  await go(page, 'quals')
  await page.waitForSelector('#qtbl', { timeout: 10000 })
  await page.locator('#qViewA').click(); await page.waitForTimeout(200)
  const cs = await page.evaluate(p => (window.PEOPLE[p] || {}).cs || p, id)
  await page.locator('#qFilter').fill(cs); await page.waitForTimeout(400)
  if (await page.locator('#qEdit:visible').count()) { await page.locator('#qEdit').click(); await page.waitForTimeout(400) }
  const x = page.locator(`#qtbl [data-arch="${id}"]`).first()
  if (!(await x.count())) return { archived: false, why: 'no ✕ on his row' }
  if (pic) await shot(page, pic)
  await x.click(); await page.waitForTimeout(500)
  if (await page.locator('#qSave:visible').count()) { await page.locator('#qSave').click(); await page.waitForTimeout(400) }
  await page.locator('#qFilter').fill(''); await page.waitForTimeout(200)
  return { archived: await page.evaluate(p => !!(window.PEOPLE[p] || {}).archived, id) }
}

/** The posting sheet on a man's hatched day: read it, then do one thing — move the date, flip the archive switch,
    Undo post out — and read it again. `act`: { date: iso } | { flip: true } | { undo: true } | {} (read only). */
export async function postingSheet(page, id, iso, act = {}, pics = {}) {
  const t = await L.tapCell(page, id, iso)
  const out = { opened: t.open, before: (t.text || '').slice(0, 260), buttons: t.buttons, after: { open: 'not opened', text: '', err: [] } }
  if (t.open !== 'postout-sheet') { await closeSheets(page); return out }
  if (pics.before) await shot(page, pics.before)
  if (act.date) {
    await page.locator('[data-testid="postout-date"]').fill(act.date); await page.waitForTimeout(700)
  } else if (act.flip) {
    await L.sheetPress(page, 'postout-archive')
  } else if (act.undo) {
    const u = await L.sheetPress(page, 'postout-undo'); out.undo = u.pressed
  }
  const s = await L.sheetNow(page)
  out.after = { open: s.open, text: (s.text || '').slice(0, 260), err: await page.locator('[data-testid="postout-err"]').allInnerTexts() }
  if (pics.after) await shot(page, pics.after)
  await closeSheets(page)
  return out
}

/** Post a man out through the bid sheet's own PO row (tap a day inside his time → PO → date → the archive switch as
    asked → Post out). */
export async function postOutBid(page, id, tapIso, fromIso, archive = true) {
  await L.lwOpen(page, tapIso)
  const t = await L.tapCell(page, id, tapIso)
  if (t.open !== 'bid-picker') { await closeSheets(page); return { done: false, why: 'opened ' + t.open } }
  await L.sheetPress(page, 'bid-postout')
  await page.locator('[data-testid="po-date"]').fill(fromIso); await page.waitForTimeout(200)
  const arch = page.locator('[data-testid="po-archive"]')
  const on = (await arch.getAttribute('aria-pressed')) === 'true'
  if (on !== archive) { await arch.click(); await page.waitForTimeout(150) }
  const p = await L.sheetPress(page, 'po-confirm')
  const after = await L.sheetNow(page)
  await closeSheets(page)
  return { done: p.pressed && after.open === 'nothing', archiveDefault: on, said: after.text || '' }
}

export { L }
