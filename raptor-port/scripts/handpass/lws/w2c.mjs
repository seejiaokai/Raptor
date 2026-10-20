// W2 walk, Item 1 — scenario 32: the drag-selection sheet's half-day chips. VERSION 1
// Run: node w2c.mjs phone|desktop   (ONLY=32a,32m to pick)
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { openWorld, tools } from './w2lib.mjs'
console.log('w2c.mjs VERSION 1')
const WHICH = process.argv[2] || 'phone'
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, 'out'); mkdirSync(OUT, { recursive: true })
const allResults = []
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null
const TYPES = ['LL', 'OL', 'OIL', 'CCL', 'FCL', 'PL', 'EL', 'CL']
const want = (portion) => TYPES.map(t => portion === 'am' ? `<${t}` : portion === 'pm' ? `${t}>` : t)

async function scenario(id, who, pass, fn) {
  if (ONLY && !ONLY.includes(id)) return
  console.log(`\n== ${id} (${WHICH})`)
  const w = await openWorld(WHICH, who, pass); const t = tools(w, 'w2-s' + id.replace(/[^0-9a-z]/gi, ''))
  const rec = (sc, verdict, seen, pic = '') => { t.rec(sc, WHICH, verdict, seen, pic); allResults.push({ id: sc, size: WHICH, verdict, seen, pic }) }
  try { await fn(w, t, rec) } catch (e) { console.log('  STEP-ERROR ' + String(e).split('\n')[0].slice(0, 300)); allResults.push({ id, size: WHICH, verdict: 'NOT WALKED', seen: String(e).split('\n')[0].slice(0, 300) }) }
  console.log('  errors', JSON.stringify(w.errors))
  if (w.errors.length) allResults.push({ id: id + '-errors', size: WHICH, verdict: 'ERRORS', seen: JSON.stringify(w.errors) })
  await w.browser.close()
}
const ok = (c, then = 'PASS') => (c ? then : 'FAIL')
const cellId = (p, d) => `[data-testid="cell-${p}-${d}"]`

async function dragSelect(w, p, d1, d2) {
  const { page, TOUCH } = w
  await page.locator(cellId(p, d1)).evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(300)
  const a = await page.locator(cellId(p, d1)).boundingBox(), b = await page.locator(cellId(p, d2)).boundingBox()
  if (!a || !b) throw new Error('cells not on screen')
  const ax = a.x + a.width / 2, ay = a.y + a.height / 2, bx = b.x + b.width / 2, by = b.y + b.height / 2
  if (TOUCH) {
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: ax, y: ay }] })
    await page.waitForTimeout(420)   // the long press that arms the selection
    for (let i = 1; i <= 6; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: ax + (bx - ax) * i / 6, y: ay + (by - ay) * i / 6 }] })
    await page.waitForTimeout(120)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  } else {
    await page.mouse.move(ax, ay); await page.mouse.down()
    await page.mouse.move(ax + 8, ay); await page.mouse.move(bx, by, { steps: 6 })
    await page.mouse.up()
  }
  await page.waitForTimeout(500)
}
async function openDragSheet(w, p, d1, d2) {
  const sheet = w.page.locator('[data-testid="select-sheet"]')
  for (let i = 0; i < 4; i++) { await dragSelect(w, p, d1, d2); if (await sheet.count()) return true; await w.page.waitForTimeout(600) }
  return false
}
const dragChips = page => page.evaluate(() => [...document.querySelectorAll('[data-testid="select-sheet"] button.tchip')].map(b => b.innerText.trim()))
const oneChips = page => page.evaluate(() => [...document.querySelectorAll('[data-testid="bid-picker"] button.tchip')].map(b => b.innerText.trim()))
const cellLook = (page, p, d) => page.evaluate(([p, d]) => { const c = document.querySelector(`[data-testid="cell-${p}-${d}"]`); return c ? { text: (c.innerText || '').replace(/\s+/g, ' ').trim(), cls: c.className.replace(/\b(sel|focus|hover)\b/g, '').replace(/\s+/g, ' ').trim() } : null }, [p, d])
const closeSheet = async (t, page, sel) => { if (await page.locator(sel).count()) { await t.press(sel.replace(']', '').replace('[data-testid="', '[data-testid="') .includes('select-sheet') ? '[data-testid="sel-cancel"]' : '[data-testid="bid-cancel"]'); await page.waitForTimeout(250) } }

// ---------------- 32 as admin
await scenario('32', 'ad', 'a', async (w, t, rec) => {
  const { page } = w
  await t.lw('NOV')
  const X = 'shaft', Y = 'snap'
  const opened = await openDragSheet(w, X, '2026-11-10', '2026-11-12')
  if (!opened) throw new Error('the drag-selection sheet did not open')
  const res = {}
  for (const portion of ['am', 'pm', 'full']) {
    await t.press(`[data-testid="sel-portion-${portion}"]`)
    res[portion] = await dragChips(page)
    await page.locator('[data-testid="sel-LL"]').scrollIntoViewIfNeeded()
    await t.shot('chips-' + portion)
    rec('32-chips-' + portion, ok(JSON.stringify(res[portion]) === JSON.stringify(want(portion))), `drag sheet, How much ${portion}: chips ${JSON.stringify(res[portion])}; expected ${JSON.stringify(want(portion))}`, `w2-s32-${WHICH}-chips-${portion}.png`)
  }
  await t.press('[data-testid="sel-cancel"]')
  // the one-day sheet's own chips, for comparison
  await page.locator(cellId(X, '2026-11-20')).evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(250)
  await t.press(cellId(X, '2026-11-20')); await page.waitForTimeout(350)
  const one = {}
  for (const portion of ['am', 'pm', 'full']) { await t.press(`[data-testid="portion-${portion}"]`); one[portion] = await oneChips(page) }
  await t.shot('oneday-pm')
  rec('32-oneday-same', ok(JSON.stringify(one.am) === JSON.stringify(res.am) && JSON.stringify(one.pm) === JSON.stringify(res.pm) && JSON.stringify(one.full) === JSON.stringify(res.full)), `one-day sheet AM ${JSON.stringify(one.am)} PM ${JSON.stringify(one.pm)} Full ${JSON.stringify(one.full)}`, `w2-s32-${WHICH}-oneday-pm.png`)
  await t.press('[data-testid="bid-cancel"]')
  // fill AM LL by the drag on X (Nov 10-12), by the one-day sheet on Y (Nov 10)
  await openDragSheet(w, X, '2026-11-10', '2026-11-12')
  await t.press('[data-testid="sel-portion-am"]'); await t.press('[data-testid="sel-LL"]'); await page.waitForTimeout(500)
  const askLL = await page.evaluate(() => (document.querySelector('[data-testid="sel-note"]')?.innerText) || '')
  console.log('  drag fill AM LL: note after the first tap:', JSON.stringify(askLL))
  if (await page.locator('[data-testid="select-sheet"]').count()) { await t.press('[data-testid="sel-LL"]'); await page.waitForTimeout(500) }
  if (await page.locator('[data-testid="select-sheet"]').count()) await t.press('[data-testid="sel-cancel"]')
  const x10 = await cellLook(page, X, '2026-11-10'), x11 = await cellLook(page, X, '2026-11-11'), x12 = await cellLook(page, X, '2026-11-12')
  await page.locator(cellId(Y, '2026-11-10')).evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(250)
  await t.press(cellId(Y, '2026-11-10')); await page.waitForTimeout(350)
  await t.press('[data-testid="portion-am"]'); await t.press('[data-testid="bid-LL"]'); await page.waitForTimeout(500)
  console.log('  one-day fill AM LL: note after the first tap:', JSON.stringify(await page.evaluate(() => (document.querySelector('[data-testid="span-note"]')?.innerText) || '')))
  if (await page.locator('[data-testid="bid-picker"]').count()) { await t.press('[data-testid="bid-LL"]'); await page.waitForTimeout(500) }
  if (await page.locator('[data-testid="bid-picker"]').count()) await t.press('[data-testid="bid-cancel"]')
  const y10 = await cellLook(page, Y, '2026-11-10')
  await t.shotRow('cells', cellId(X, '2026-11-10'))
  rec('32-fill-same-look', ok(x10 && y10 && x10.text === y10.text && x10.cls === y10.cls && /<LL/.test(x10.text)), `drag-filled (Anvil 10 Nov) ${JSON.stringify(x10)}, 11 Nov ${JSON.stringify(x11)}, 12 Nov ${JSON.stringify(x12)}; one-day-filled (Cinch 10 Nov) ${JSON.stringify(y10)}`, `w2-s32-${WHICH}-cells.png`)
  // reopen the one-day sheet on each and read what is selected
  const reopen = async (p, d) => {
    await page.locator(cellId(p, d)).evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(250)
    await t.press(cellId(p, d)); await page.waitForTimeout(400)
    const r = await page.evaluate(() => ({ portions: [...document.querySelectorAll('[data-testid="bid-picker"] .pchip')].map(b => b.innerText.trim() + (b.getAttribute('aria-pressed') === 'true' ? '*on' : '')), on: [...document.querySelectorAll('[data-testid="bid-picker"] .tchip')].filter(b => /\bon\b/.test(b.className) || b.getAttribute('aria-pressed') === 'true').map(b => b.innerText.trim()), sel: [...document.querySelectorAll('[data-testid="bid-picker"] .tchip')].map(b => b.className.replace('tchip', '').trim()).filter(Boolean) }))
    return r
  }
  const rx = await reopen(X, '2026-11-10'); await t.shot('reopen-drag-filled'); await t.press('[data-testid="bid-cancel"]')
  const ry = await reopen(Y, '2026-11-10'); await t.shot('reopen-oneday-filled'); await t.press('[data-testid="bid-cancel"]')
  rec('32-reopen-same', ok(JSON.stringify(rx) === JSON.stringify(ry)), `one-day sheet reopened on the drag-filled cell: ${JSON.stringify(rx)}; on the one-day-filled cell: ${JSON.stringify(ry)}`, `w2-s32-${WHICH}-reopen-drag-filled.png`)
  // Move one half-day block, then Delete it
  await openDragSheet(w, X, '2026-11-10', '2026-11-12')
  const hasMove = await page.locator('[data-testid="sel-move"]').count(), hasDel = await page.locator('[data-testid="sel-delete"]').count()
  await t.shot('block-sheet')
  rec('32-block-sheet', ok(hasMove && hasDel), `drag across the half-day block: Move ${hasMove} Delete ${hasDel}; chips ${JSON.stringify(await dragChips(page))}`, `w2-s32-${WHICH}-block-sheet.png`)
  if (hasMove) {
    await t.press('[data-testid="sel-move"]'); await page.waitForTimeout(500)
    await page.locator(cellId(X, '2026-11-17')).evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
    await t.shot('move-mode')
    await t.press(cellId(X, '2026-11-17')); await page.waitForTimeout(800)
    if (await page.locator('[data-testid="move-confirm"]').count()) { await t.shot('move-preview'); await t.press('[data-testid="move-confirm"]'); await page.waitForTimeout(800) }
    const m17 = await cellLook(page, X, '2026-11-17'), m18 = await cellLook(page, X, '2026-11-18'), m19 = await cellLook(page, X, '2026-11-19'), m10 = await cellLook(page, X, '2026-11-10')
    const note = await page.evaluate(() => [...document.querySelectorAll('[data-testid="shift-problem"], [data-testid="sel-note"], .toast, #toast')].map(e => (e.innerText || '').trim()).filter(Boolean))
    await t.shotRow('moved', cellId(X, '2026-11-17'))
    rec('32-move', ok(m17 && /<LL/.test(m17.text) && m18 && /<LL/.test(m18.text) && m19 && /<LL/.test(m19.text) && (!m10 || !m10.text)), `after Move to 17 Nov: 17 ${JSON.stringify(m17)} 18 ${JSON.stringify(m18)} 19 ${JSON.stringify(m19)}; 10 Nov ${JSON.stringify(m10)}; notes ${JSON.stringify(note)}`, `w2-s32-${WHICH}-moved.png`)
  }
  await openDragSheet(w, X, '2026-11-17', '2026-11-19')
  if (await page.locator('[data-testid="sel-delete"]').count()) {
    await t.press('[data-testid="sel-delete"]'); await page.waitForTimeout(300)
    const armedTxt = await page.locator('[data-testid="sel-delete"]').innerText().catch(() => '')
    const nt = await page.evaluate(() => (document.querySelector('[data-testid="sel-note"]')?.innerText) || '')
    await t.shot('delete-asks')
    await t.press('[data-testid="sel-delete"]'); await page.waitForTimeout(600)
    if (await page.locator('[data-testid="select-sheet"]').count()) await t.press('[data-testid="sel-cancel"]')
    const d17 = await cellLook(page, X, '2026-11-17')
    rec('32-delete', ok(d17 && !d17.text), `Delete: first tap "${armedTxt}" note "${nt}"; after the second tap 17 Nov reads ${JSON.stringify(d17)}`, `w2-s32-${WHICH}-delete-asks.png`)
  } else rec('32-delete', 'NOT WALKED', 'the moved block could not be selected again')
  // the below-zero ask: PL has no balance
  await openDragSheet(w, X, '2026-11-24', '2026-11-26')
  await t.press('[data-testid="sel-portion-am"]'); await t.press('[data-testid="sel-PL"]'); await page.waitForTimeout(400)
  const ask = await page.evaluate(() => (document.querySelector('[data-testid="sel-note"]')?.innerText) || '')
  await t.shot('below-zero-ask')
  const stillOpen = await page.locator('[data-testid="select-sheet"]').count()
  rec('32-below-zero-ask', /below zero|PL/i.test(ask) ? 'INFO' : 'NOT WALKED', `AM PL over 3 days: note "${ask}"; sheet still open ${stillOpen}`, `w2-s32-${WHICH}-below-zero-ask.png`)
  if (stillOpen) { await t.press('[data-testid="sel-PL"]'); await page.waitForTimeout(500) }
  const pl = await cellLook(page, X, '2026-11-24')
  console.log('  after the second PL tap, 24 Nov reads', JSON.stringify(pl))
  if (await page.locator('[data-testid="select-sheet"]').count()) await t.press('[data-testid="sel-cancel"]')
})

// ---------------- 32 as a member, on his own row
await scenario('32m', 'us', 'us', async (w, t, rec) => {
  const { page } = w
  await t.lw('NOV')
  const opened = await openDragSheet(w, 'bane', '2026-11-10', '2026-11-12')
  if (!opened) throw new Error('the member\'s drag-selection sheet did not open on his own row')
  const res = {}
  for (const portion of ['am', 'pm', 'full']) {
    await t.press(`[data-testid="sel-portion-${portion}"]`)
    res[portion] = await dragChips(page)
    await page.locator('[data-testid="sel-LL"]').scrollIntoViewIfNeeded()
    if (portion !== 'full') await t.shot('chips-' + portion)
    rec('32m-chips-' + portion, ok(JSON.stringify(res[portion]) === JSON.stringify(want(portion))), `member on his own row, How much ${portion}: ${JSON.stringify(res[portion])}`, portion !== 'full' ? `w2-s32m-${WHICH}-chips-${portion}.png` : '')
  }
})

writeFileSync(join(OUT, `w2c-${WHICH}.json`), JSON.stringify({ allResults }, null, 1))
console.log('\nDONE')
