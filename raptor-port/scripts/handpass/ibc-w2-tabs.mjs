// W2: S20 — two tabs of one browser, both open before any write. Also: the Redo left after a board action (seen in S13).
import { L, closeBoard, editWeek, showDay, sleep, npub, typeNote, undoTitle, reloadIn } from './ibc-w2-lib.mjs'
const { check, note, shot } = L
console.log('ibc-w2-tabs v1')
const DI = 1
const lateOffOf = (page, id) => page.evaluate(id => { const r = window.INPUTS.find(x => String(x.iid) === String(id)); return r ? { lateOff: !!r.lateOff, remarks: r.remarks } : 'gone' }, id)
async function newTab(ctx) {
  const p = await ctx.newPage()
  p.on('pageerror', e => L.errs.push(`tab B page error ${e.message}`))
  await p.goto(L.URL); await sleep(900)
  if (await p.locator('#luser').isVisible().catch(() => false)) { await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]') }
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(500)
  return p
}
const { ctx, page: A, tap } = await L.session('desktop')
const B = await newTab(ctx)
await editWeek(A); await L.go(B, 'editsched')
const idsA = await A.evaluate(() => window.INPUTS.find(x => x.type === 'LL' && x.date === 'Jul 14').iid)
note('S20', `both tabs on Edit Schedule; input ${idsA}`)
/* A: drop LATE on the board */
await A.locator(`#eWeek [data-sbday="${DI}"]:visible`).first().click(); await A.waitForSelector('#schedBoard'); await sleep(700)
await A.locator(`#schedBoard .latechip[data-lateoff="${idsA}"]`).first().click(); await sleep(600)
check('S20', 'tab A: LATE dropped', (await lateOffOf(A, idsA)).lateOff === true, await lateOffOf(A, idsA))
note('S20', `tab B (untouched) sees: ${JSON.stringify(await lateOffOf(B, idsA))}`)
/* B: edit the same input's remarks on the Inputs page */
await L.toInputsCal(B, false); await L.incalMonth(B, false, 2026, 7); await L.openDay(B, '2026-07-14')
await B.locator(`[data-testid="idy-row-${idsA}"] .icard-open`).first().click(); await B.locator('#inpEditRmk').waitFor(); await B.fill('#inpEditRmk', 'W2 B edit'); await B.locator('#inpEditSave').click(); await sleep(900)
if (await L.tid(B, 'oilconf').count()) { await B.locator((await L.tid(B, 'oil-all').count()) ? '[data-testid="oil-all"]' : '[data-testid="oil-yes"]').click(); await B.locator('[data-testid="oilconf-save"]').click(); await sleep(400) }
note('S20', `after B's write: B holds ${JSON.stringify(await lateOffOf(B, idsA))}; A holds ${JSON.stringify(await lateOffOf(A, idsA))}`)
await reloadIn(A)
await reloadIn(B)
const ra = await lateOffOf(A, idsA), rb = await lateOffOf(B, idsA)
check('S20', 'EXPECTED (RECORD in brief): after both reload, LATE still dropped AND B\'s remarks kept', ra.lateOff === true && ra.remarks === 'W2 B edit' && rb.lateOff === true && rb.remarks === 'W2 B edit', { A: ra, B: rb })
await shot(A, 'S20', 'desktop', 'A-after')
await ctx.close()
/* part 2: Make public in A, a Wed edit in B */
{
  const { ctx, page: A } = await L.session('desktop')
  const B = await newTab(ctx)
  await editWeek(A); await L.go(B, 'editsched')
  await showDay(A, 2); const w = A.locator('#eWeek [data-notepub="pn:2"]').first(); await w.evaluate(e => e.scrollIntoView({ block: 'center' })); await w.click(); await sleep(600)
  check('S20', 'tab A: Wed note made public', JSON.stringify(await npub(A, 2)) === '["pn"]', await npub(A, 2))
  note('S20', `tab B (untouched) sees npub: ${JSON.stringify(await npub(B, 2))}`)
  /* B: type in Wed's programme note (an edit of the same day) */
  await showDay(B, 2); const box = B.locator('#eWeek .blknote.ed[data-txt="pn:2"]').first(); await box.evaluate(e => e.scrollIntoView({ block: 'center' })); await box.click(); await B.keyboard.type('B typed'); await B.locator('#eWeek').evaluate(() => document.activeElement && document.activeElement.blur()); await sleep(700)
  note('S20', `after B's edit: B npub ${JSON.stringify(await npub(B, 2))}; A npub ${JSON.stringify(await npub(A, 2))}`)
  await reloadIn(A)
  await reloadIn(B)
  const na = await npub(A, 2), nb = await npub(B, 2)
  const tx = await B.evaluate(() => JSON.stringify(window.DAYS[2].prognotes).slice(0, 120))
  check('S20', 'EXPECTED (RECORD): after both reload the note is still public and B\'s text is kept', JSON.stringify(na) === '["pn"]' && JSON.stringify(nb) === '["pn"]' && tx.includes('B typed'), { A: na, B: nb, text: tx })
  await ctx.close()
}
/* part 3: Redo left after a board action */
{
  const { page, tap } = await L.session('desktop')
  const men = await L.freeMen(page, 1, [3])
  const id = await L.fileOn(page, tap, '2026-07-16', { type: 'Event', people: men, title: 'Sports day', remarks: 'z' })
  await page.locator('#undoBtn').click(); await sleep(600)
  const t0 = await undoTitle(page)
  note('S20r', `after filing and Undo: ${JSON.stringify(t0)}`)
  await L.go(page, 'editsched'); await showDay(page, 3)
  const ed = page.locator('#eWeek .blknote.ed[data-txt="pn:3"]').first(); await ed.evaluate(e => e.scrollIntoView({ block: 'center' })); await ed.click(); await page.keyboard.type('note after undo'); await page.locator('#eWeek').evaluate(() => document.activeElement && document.activeElement.blur()); await sleep(700)
  const t1 = await undoTitle(page)
  check('S20r', 'a new change after an Undo empties the Redo (RECORD the state)', t1.redoOff === true, t1)
  await shot(page, 'S20r', 'desktop', 'after-new-change')
  await page.context().close()
}
await L.finish('tabs')
