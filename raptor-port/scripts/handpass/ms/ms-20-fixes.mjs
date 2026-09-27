/* [LW-MOVE-STANDARD] RE-WALK OF THE FINAL READS' FIXES (27 Sep 26) — FR1–FR5 of the evidence sheet §8, in the running
   production build (4177), at both widths, made through the app's own controls, written as assertions of the RIGHT
   behaviour. People: Ryder = xray, Wisp = shrek, Vector = divot. February 2026, bidding OPEN, the admin.
   Usage (from raptor-port/): node scripts/handpass/ms/ms-20-fixes.mjs desktop|phone   (MS_RUN names the pictures' folder) */
import './ms-env.mjs'
import { mkdirSync } from 'node:fs'
const M = await import('../mv/mv-lib.mjs')
const { WIDTH, PHONE, ROOT, openMv, lwOpen, tapCell, sheetNow, sheetPress, closeSheets, recsOf, grid, dragRect,
  resultBook, centre, at, tapAt, press, fingerHoldDrag, fingerSwipe, banner, bidOn } = M
const RUN = process.env.MS_RUN || 'rewalk'
const SHOTS = `${ROOT}/docs/img/handpass/2026-09-27-lw-move-standard/${RUN}/${WIDTH}`
mkdirSync(SHOTS, { recursive: true })
const R = resultBook(`MS20-${WIDTH}`, `${ROOT}/docs/handpass/parts/2026-09-27-lw-move-standard-ms20-${WIDTH}.txt`)
const { browser, page, errors, cdp } = await openMv('a')
const pics = []
const pic = async n => { await page.screenshot({ path: `${SHOTS}/ms20-${WIDTH}-${n}.png` }).catch(() => {}); pics.push(n) }
async function step(name, fn) {
  try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await pic(`THREW-${name}`) }
  try { await closeSheets(page); if (await banner(page)) await press(page, 'move-cancel') } catch { }
}
const bids = r => (r || '').split(',').filter(x => x.startsWith('request:'))
async function selectBlock(a, isoA, b, isoB) {
  if (!PHONE) return dragRect(page, a, isoA, b, isoB)
  const p1 = await centre(page, `cell-${a}-${isoA}`)
  const p2 = await page.locator(`[data-testid="cell-${b}-${isoB}"]`).first().evaluate(e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
  await fingerHoldDrag(page, cdp, p1, [p2])
  return sheetNow(page)
}
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
/** The war-approved Inputs of one man (the evidence table's read of the saved world). */
const lwInputs = p => page.evaluate(p => (window.INPUTS || []).filter(r => r.person === p && r.lw).map(r => `${r.date}${r.endDate ? '→' + r.endDate : ''}${r.half ? '/' + r.half : ''}`), p)
/** Approve a man's bid(s) through the one-day sheet (a range when `to` is given). */
async function approve(p, from, to) {
  await tapCell(page, p, from)
  if (to) { await sheetPress(page, 'span-range'); await sheetPress(page, `span-day-${to}`) }
  await sheetPress(page, 'decide-approve')
  await closeSheets(page)
}

await lwOpen(page, '2026-02-10')

await step('FR1-two-day-leave-cut', async () => {
  /* a two-day leave the war approved: LL bid 10–11 Feb by a range, approved by a range */
  let t = await tapCell(page, 'xray', '2026-02-10')
  await sheetPress(page, 'span-range'); await sheetPress(page, 'span-day-2026-02-11')
  const w = await sheetPress(page, 'bid-LL')
  if (w.sheet.open === 'bid-picker' && /Tap the same leave again/i.test(w.sheet.text)) await sheetPress(page, 'bid-LL')
  await closeSheets(page)
  await approve('xray', '2026-02-10', '2026-02-11')
  const inputs = await lwInputs('xray')
  await bidOn(page, 'xray', '2026-02-09', 'LL')
  R.note('FR1-premise', { inputs })
  await selectBlock('xray', '2026-02-09', 'xray', '2026-02-10')
  await sheetPress(page, 'sel-move')
  const b0 = await banner(page)
  const l = await landOn('cell-xray-2026-02-11', { confirm: false })
  await pic('FR1-refused')
  const r = await recsOf(page, 'xray', ['2026-02-09', '2026-02-11'])
  const oneInput = inputs.some(x => /Feb 10→Feb 11/.test(x))
  R.ck('FR1', /2 entries/.test(b0) && /already booked/.test(l.said || l.after) && bids(r['2026-02-09']).length === 1 && bids(r['2026-02-11']).length === 0,
    'a block over the bid (9 Feb) and the FIRST day of the two-day approved leave, landed two days on: refused — the bid would land on the leave\'s untouched 11 Feb; nothing moved',
    { oneInput, inputs, b0, said: l.said || l.after, r })
})

await step('FR2-leave-onto-vacated-day', async () => {
  await bidOn(page, 'xray', '2026-02-16', 'LL', { portion: 'am' })
  await approve('xray', '2026-02-16')
  await bidOn(page, 'xray', '2026-02-17', 'LL', { portion: 'am' })
  await selectBlock('xray', '2026-02-16', 'xray', '2026-02-17')
  await sheetPress(page, 'sel-move')
  const b0 = await banner(page)
  const l = await landOn('cell-xray-2026-02-17')
  const g = await grid(page, ['xray'], ['2026-02-16', '2026-02-17', '2026-02-18'])
  const r = await recsOf(page, 'xray', ['2026-02-17', '2026-02-18'])
  await pic('FR2-landed')
  R.ck('FR2', /2 entries/.test(b0) && /<LL/.test(g.xray.split('|')[1] || '') && bids(r['2026-02-18']).length === 1 && !/LL/.test(g.xray.split('|')[0] || ''),
    'approved morning 16 Feb + morning bid 17 Feb, moved one day: the leave lands on the day the bid leaves (17), the bid on 18 — no false "already booked"', { b0, l, g, r })
})

await step('FR3-refused-under-leave', async () => {
  await bidOn(page, 'shrek', '2026-02-23', 'LL', { portion: 'am' })
  await tapCell(page, 'shrek', '2026-02-23'); await sheetPress(page, 'decide-refuse'); await closeSheets(page)
  await tapCell(page, 'shrek', '2026-02-23'); await sheetPress(page, 'portion-am')
  /* the second morning takes Wisp below zero — the sheet asks first; the same tap is the yes */
  const w2 = await sheetPress(page, 'bid-LL')
  if (w2.sheet.open === 'bid-picker' && /Tap the same leave again/i.test(w2.sheet.text)) await sheetPress(page, 'bid-LL')
  await closeSheets(page)
  const t = await tapCell(page, 'shrek', '2026-02-23')
  const live = await page.evaluate(() => { const li = [...document.querySelectorAll('[data-testid="daylist"] li')].find(l => /not decided yet/.test(l.textContent)); const b = li && li.querySelector('[data-testid^="dl-approve-"]'); return b ? b.getAttribute('data-testid') : null })
  await sheetPress(page, live)
  await closeSheets(page)
  const t2 = await tapCell(page, 'shrek', '2026-02-23')
  await pic('FR3-list-leave-and-refused')
  const refusedMove = await page.evaluate(() => { const li = [...document.querySelectorAll('[data-testid="daylist"] li')].find(l => /refused/.test(l.textContent)); return li ? !!li.querySelector('[data-testid^="dl-move-"]') : null })
  await closeSheets(page)
  await selectBlock('shrek', '2026-02-23', 'shrek', '2026-02-23')
  await sheetPress(page, 'sel-move')
  const b0 = await banner(page)
  await pic('FR3-banner')
  await landOn('cell-shrek-2026-02-25')
  const r = await recsOf(page, 'shrek', ['2026-02-23', '2026-02-25'])
  const g = await grid(page, ['shrek'], ['2026-02-25'])
  R.ck('FR3', t.open === 'daylist-sheet' && refusedMove === false && /1 entry/.test(b0) && /1 refused bid stays/.test(b0)
    && bids(r['2026-02-25']).length === 0 && /refused/.test(r['2026-02-23']) && /<LL/.test(g.shrek),
    'approved morning beside a refused morning: the refused bid has no Move and stays; a block moves the leave alone ("· 1 refused bid stays"); 25 Feb holds the leave and no bid',
    { lines: t2.lines, refusedMove, b0, r, g })
})

await step('FR4-range-decide', async () => {
  await bidOn(page, 'divot', '2026-02-26', 'LL')
  await bidOn(page, 'divot', '2026-02-28', 'LL')
  const t = await tapCell(page, 'divot', '2026-02-27')
  const before = t.buttons.some(b => /decide-ack/.test(b))
  await sheetPress(page, 'span-range'); await sheetPress(page, 'span-day-2026-02-26'); await sheetPress(page, 'span-day-2026-02-28')
  const s = await sheetNow(page)
  await pic('FR4-range-decide')
  const hasDecide = s.buttons.some(b => /decide-ack/.test(b))
  await sheetPress(page, 'decide-ack')
  const r = await recsOf(page, 'divot', ['2026-02-26', '2026-02-28'])
  R.ck('FR4', !before && hasDecide && /acknowledged/.test(r['2026-02-26']) && /acknowledged/.test(r['2026-02-28']),
    'an empty day: no Decide; a range 26–28 Feb picked from it draws Decide, and Ack answers both bids', { before, hasDecide, r })
})

console.log('pictures', pics.length)
R.note('errors', errors.length ? errors.slice(0, 8) : 'none')
R.save()
await browser.close()
