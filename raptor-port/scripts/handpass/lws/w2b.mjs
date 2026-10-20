// W2 walk, Item 2 — scenarios 27 (main case and edges) and 30. VERSION 1
// Reset order is greyed when the order AS DRAWN in the months on screen is the default; an armed "Really reset?" is
// taken back when the Leave War page leaves the screen. Run: node w2b.mjs phone|desktop   (ONLY=27,27e1,... to pick)
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { openWorld, tools } from './w2lib.mjs'
console.log('w2b.mjs VERSION 1')
const WHICH = process.argv[2] || 'phone'
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, 'out'); mkdirSync(OUT, { recursive: true })
const allResults = []
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null

async function pickDate(w, t, iso) {
  const { page } = w
  const want = iso.slice(0, 7)
  for (let i = 0; i < 14; i++) {
    if (await page.locator(`[data-testid="dcal-day-${iso}"]`).count()) break
    const cur = await page.locator('[data-testid="dcal"]').first().getAttribute('data-month')
    await t.press(cur < want ? '[data-testid="dcal-next"]' : '[data-testid="dcal-prev"]')
  }
  await t.press(`[data-testid="dcal-day-${iso}"]`)
}
// pick a row up by its grip and drop it on the upper (or lower) half of another row — a mouse on a desktop, a real CDP touch on a phone
async function dragRow(w, src, dst, half = 'upper') {
  const { page, TOUCH } = w
  const before = await page.evaluate(() => [...document.querySelectorAll('tr[data-testid^="row-"]')].map(e => e.getAttribute('data-testid').slice(4)))
  await page.locator(`[data-testid="row-${dst}"]`).evaluate(e => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(250)
  const g = await page.locator(`[data-testid="drag-${src}"]`).boundingBox()
  const tg = await page.locator(`[data-testid="row-${dst}"]`).boundingBox()
  if (!g) throw new Error(`the grip of ${src} is not on screen`)
  const x = g.x + g.width / 2, y0 = g.y + g.height / 2, y1 = half === 'upper' ? tg.y + 4 : tg.y + tg.height - 4
  if (TOUCH) {
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] })
    await page.waitForTimeout(90)
    for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + 40, y: y0 + (y1 - y0) * i / 8 }] })
    await page.waitForTimeout(120)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  } else {
    await page.mouse.move(x, y0); await page.mouse.down()
    await page.mouse.move(x, y0 + (y1 > y0 ? 6 : -6), { steps: 3 }); await page.mouse.move(x + 40, y1, { steps: 8 })
    await page.waitForTimeout(100)
    await page.mouse.up()
  }
  await page.waitForTimeout(500)
  const after = await page.evaluate(() => [...document.querySelectorAll('tr[data-testid^="row-"]')].map(e => e.getAttribute('data-testid').slice(4)))
  return { before: before.indexOf(src), after: after.indexOf(src) }
}
async function arrangeOn(t) { await t.press('[data-testid="roster-arrange"]') }
async function resetState(w, t, shotName) {
  const { page } = w
  await t.press('[data-testid="settings-open"]'); await page.waitForTimeout(400)
  await page.locator('[data-testid="roster-reset-order"]').scrollIntoViewIfNeeded()
  const s = await page.evaluate(() => { const b = document.querySelector('[data-testid="roster-reset-order"]'); const h = document.querySelector('[data-testid="roster-order-hint"]'); return { disabled: b.disabled, text: b.innerText.trim(), hint: (h?.innerText || '').slice(0, 70) } })
  if (shotName) await t.shot(shotName)
  await t.press('[data-testid="settings-close"]'); await page.waitForTimeout(300)
  return s
}
const drawn = (w, id) => w.page.evaluate(i => !!document.querySelector(`tr[data-testid="row-${i}"]`), id)

async function scenario(id, fn) {
  if (ONLY && !ONLY.includes(id)) return
  console.log(`\n== ${id} (${WHICH})`)
  const w = await openWorld(WHICH); const t = tools(w, 'w2-s' + id.replace(/[^0-9a-z]/gi, ''))
  const rec = (sc, verdict, seen, pic = '') => { t.rec(sc, WHICH, verdict, seen, pic); allResults.push({ id: sc, size: WHICH, verdict, seen, pic }) }
  try { await fn(w, t, rec) } catch (e) { console.log('  STEP-ERROR ' + String(e).split('\n')[0].slice(0, 300)); allResults.push({ id, size: WHICH, verdict: 'NOT WALKED', seen: String(e).split('\n')[0].slice(0, 300) }) }
  console.log('  errors', JSON.stringify(w.errors))
  if (w.errors.length) allResults.push({ id: id + '-errors', size: WHICH, verdict: 'ERRORS', seen: JSON.stringify(w.errors) })
  await w.browser.close()
}
const ok = (c, then = 'PASS') => (c ? then : 'FAIL')

// ---------------- 27 main: a hand order that differs only for a man not drawn
await scenario('27', async (w, t, rec) => {
  const { page } = w
  await t.lw('JAN')
  const r0 = await resetState(w, t)
  const torchJan = await drawn(w, 'ignite')
  await arrangeOn(t)
  const mv = await dragRow(w, 'ignite', 'dj', 'upper')
  await arrangeOn(t)
  rec('27-setup', torchJan && mv.after !== mv.before ? 'OK' : 'NOT WALKED', `Torch drawn in Jan ${torchJan}; default state ${JSON.stringify(r0)}; Torch moved from row ${mv.before} to ${mv.after}`)
  const r1 = await resetState(w, t, 'jan-drawn')
  rec('27-control-drawn', ok(!r1.disabled), `Torch drawn in Jan, order differs for him: Reset order disabled=${r1.disabled} text="${r1.text}"`, 'w2-s27-' + WHICH + '-jan-drawn.png')
  await t.press('[data-testid="month-MAR"]'); await page.waitForTimeout(1000)
  const torchMar = await drawn(w, 'ignite')
  const r2 = await resetState(w, t, 'mar-not-drawn')
  rec('27-greyed', torchMar === false ? ok(r2.disabled) : 'NOT WALKED', `Mar: Torch drawn ${torchMar}; Reset order disabled=${r2.disabled} text="${r2.text}" hint="${r2.hint}"`, 'w2-s27-' + WHICH + '-mar-not-drawn.png')
  await t.press('[data-testid="month-JAN"]'); await page.waitForTimeout(1000)
  const r3 = await resetState(w, t, 'jan-back')
  rec('27-active-again', ok(!r3.disabled), `back on Jan: Torch drawn ${await drawn(w, 'ignite')}; Reset order disabled=${r3.disabled} text="${r3.text}"`, 'w2-s27-' + WHICH + '-jan-back.png')
})

// ---------------- 27 edges
// PO from the 1st of the first month on screen -> greyed; the 2nd -> active
await scenario('27e1', async (w, t, rec) => {
  const { page } = w
  await t.lw('MAR')
  await arrangeOn(t); const mv = await dragRow(w, 'razer', 'dice', 'upper'); await arrangeOn(t)
  const c = await resetState(w, t)
  rec('27e1-setup', !c.disabled && mv.after !== mv.before ? 'OK' : 'NOT WALKED', `Ridge moved ${mv.before}->${mv.after}; control (drawn in Mar): disabled=${c.disabled}`)
  await page.evaluate(() => window.lwSetPostOut('razer', '2026-03-01')); await page.waitForTimeout(1200)
  const d1 = await drawn(w, 'razer'); const s1 = await resetState(w, t, 'po-first')
  rec('27e1-1st', d1 === false ? ok(s1.disabled) : 'NOT WALKED', `PO from 1 Mar (last day 28 Feb): Ridge drawn in Mar view ${d1}; disabled=${s1.disabled}`, 'w2-s27e1-' + WHICH + '-po-first.png')
  await page.evaluate(() => window.lwSetPostOut('razer', '2026-03-02')); await page.waitForTimeout(1200)
  const d2 = await drawn(w, 'razer'); const s2 = await resetState(w, t, 'po-second')
  rec('27e1-2nd', d2 === true ? ok(!s2.disabled) : 'NOT WALKED', `PO from 2 Mar (last day 1 Mar): Ridge drawn ${d2}; disabled=${s2.disabled}`, 'w2-s27e1-' + WHICH + '-po-second.png')
})
// a post-in after the last month on screen -> greyed (through the war's own PI button on the one-day sheet)
await scenario('27e2', async (w, t, rec) => {
  const { page } = w
  await t.lw('MAR')
  await arrangeOn(t); const mv = await dragRow(w, 'harpoon', 'slash', 'upper'); await arrangeOn(t)
  const c = await resetState(w, t)
  rec('27e2-setup', !c.disabled && mv.after !== mv.before ? 'OK' : 'NOT WALKED', `Trident moved ${mv.before}->${mv.after}; control: disabled=${c.disabled}`)
  const cell = '[data-testid="cell-harpoon-2026-03-10"]'
  await page.locator(cell).evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
  await t.press(cell); await page.waitForTimeout(400)
  await t.press('[data-testid="bid-postin"]'); await page.waitForTimeout(300)
  await t.press('[data-testid="pi-date"]'); await pickDate(w, t, '2026-12-01')
  await t.press('[data-testid="pi-confirm"]'); await page.waitForTimeout(1200)
  const err = await page.evaluate(() => (document.querySelector('[data-testid="post-err"]')?.innerText) || '')
  if (await page.locator('[data-testid="bid-picker"]').count()) await t.press('[data-testid="bid-cancel"]')
  await page.waitForTimeout(500)
  const d = await drawn(w, 'harpoon'); const s = await resetState(w, t, 'pi-dec')
  rec('27e2-greyed', d === false ? ok(s.disabled) : 'NOT WALKED', `post-in 1 Dec set on the sheet (error "${err}"): Trident drawn in Mar view ${d}; disabled=${s.disabled}`, 'w2-s27e2-' + WHICH + '-pi-dec.png')
  await t.press('[data-testid="month-DEC"]'); await page.waitForTimeout(1000)
  const d2 = await drawn(w, 'harpoon'); const s2 = await resetState(w, t, 'dec')
  rec('27e2-dec-active', d2 === true ? ok(!s2.disabled) : 'NOT WALKED', `Dec view: Trident drawn ${d2}; disabled=${s2.disabled}`, 'w2-s27e2-' + WHICH + '-dec.png')
})
// a posted-out man with clearing leave in a month on screen -> active
await scenario('27e3', async (w, t, rec) => {
  const { page } = w
  await t.lw('JAN')
  await arrangeOn(t); const mv = await dragRow(w, 'freak', 'glass', 'upper'); await arrangeOn(t)
  await page.evaluate(() => window.lwSetPostOut('freak', '2026-01-02')); await page.waitForTimeout(800)
  await t.press('[data-testid="month-MAR"]'); await page.waitForTimeout(1000)
  const d1 = await drawn(w, 'freak'); const s1 = await resetState(w, t, 'no-leave')
  rec('27e3-greyed', d1 === false ? ok(s1.disabled) : 'NOT WALKED', `Echo moved ${mv.before}->${mv.after}; PO from 2 Jan; Mar view: Echo drawn ${d1}; disabled=${s1.disabled}`, 'w2-s27e3-' + WHICH + '-no-leave.png')
  await page.evaluate(() => window.fileInput({ iid: 'w2-e3', person: 'freak', type: 'LL', date: 'Mar 10', endDate: 'Mar 12', yr: 2026, allday: true })); await page.waitForTimeout(1500)
  const d2 = await drawn(w, 'freak'); const s2 = await resetState(w, t, 'with-leave')
  rec('27e3-active', d2 === true ? ok(!s2.disabled) : 'NOT WALKED', `leave filed 10-12 Mar: Echo drawn ${d2}; disabled=${s2.disabled}`, 'w2-s27e3-' + WHICH + '-with-leave.png')
})
// a SANS man with Show SANS off -> greyed; on -> active
await scenario('27e4', async (w, t, rec) => {
  const { page } = w
  await t.lw('JAN')
  await t.press('[data-testid="settings-open"]'); await page.waitForTimeout(300); await t.press('[data-testid="sans-toggle"]'); await page.waitForTimeout(500); await t.press('[data-testid="settings-close"]'); await page.waitForTimeout(500)
  const rows = await t.rowsDrawn(); const sans = rows.filter(r => /SANS/.test(r.group)); console.log('  SANS rows', JSON.stringify(sans.map(r => r.cs)))
  if (sans.length < 2) throw new Error('no SANS group with two men drawn after Show SANS')
  await arrangeOn(t); const mv = await dragRow(w, sans[sans.length - 1].id, sans[0].id, 'upper'); await arrangeOn(t)
  const on1 = await resetState(w, t, 'sans-on')
  rec('27e4-on', ok(!on1.disabled), `Show SANS on, ${sans[sans.length - 1].cs} moved ${mv.before}->${mv.after}: disabled=${on1.disabled}`, 'w2-s27e4-' + WHICH + '-sans-on.png')
  await t.press('[data-testid="settings-open"]'); await page.waitForTimeout(300); await t.press('[data-testid="sans-toggle"]'); await page.waitForTimeout(500); await t.press('[data-testid="settings-close"]'); await page.waitForTimeout(600)
  const hidden = !(await drawn(w, sans[0].id)); const off = await resetState(w, t, 'sans-off')
  rec('27e4-off', hidden ? ok(off.disabled) : 'NOT WALKED', `Show SANS off: SANS man drawn ${!hidden}; disabled=${off.disabled}`, 'w2-s27e4-' + WHICH + '-sans-off.png')
  await t.press('[data-testid="settings-open"]'); await page.waitForTimeout(300); await t.press('[data-testid="sans-toggle"]'); await page.waitForTimeout(500); await t.press('[data-testid="settings-close"]'); await page.waitForTimeout(600)
  const on2 = await resetState(w, t, 'sans-on-again')
  rec('27e4-on-again', ok(!on2.disabled), `Show SANS on again: disabled=${on2.disabled}`)
})

// ---------------- 30 leave the page while armed
await scenario('30', async (w, t, rec) => {
  const { page } = w
  await t.lw('JAN')
  await arrangeOn(t); const mv = await dragRow(w, 'razer', 'dice', 'upper'); await arrangeOn(t)
  const rowsBefore = (await t.rowsDrawn()).map(r => r.id)
  const btn = '[data-testid="roster-reset-order"]'
  const txt = () => page.evaluate(b => { const e = document.querySelector(b); return e ? e.innerText.trim() + (e.disabled ? ' (disabled)' : '') : 'NO BUTTON' }, btn)
  await t.press('[data-testid="settings-open"]'); await page.waitForTimeout(400)
  await page.locator(btn).scrollIntoViewIfNeeded()
  await t.press(btn); const armed = await txt()
  await t.shot('armed')
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(700)
  await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(900)
  let sheetUp = await page.locator(btn).count()
  const phoneClosed = !sheetUp
  let back = sheetUp ? await txt() : 'sheet gone'
  if (sheetUp) await page.locator(btn).scrollIntoViewIfNeeded()
  await t.shot('back')
  if (!sheetUp) {
    await t.press('[data-testid="settings-open"]'); await page.waitForTimeout(400); await page.locator(btn).scrollIntoViewIfNeeded()
    sheetUp = await page.locator(btn).count(); back = 'sheet closed itself on the page switch; reopened: ' + (await txt()); await t.shot('back-reopened')
  }
  rec('30-leave', /Really reset/.test(armed) && /Reset order/.test(back) ? 'PASS' : 'FAIL', `armed: "${armed}" -> left the page and came back (sheet kept up by the page: ${!phoneClosed}): "${back}"`, 'w2-s30-' + WHICH + (phoneClosed ? '-back-reopened.png' : '-back.png'))
  if (sheetUp) {
    await t.press(btn); const t1 = await txt()
    const rowsNow = (await t.rowsDrawn()).map(r => r.id)
    rec('30-one-tap', /Really reset/.test(t1) && JSON.stringify(rowsNow) === JSON.stringify(rowsBefore) ? 'PASS' : 'FAIL', `one tap on coming back: "${t1}"; order unchanged: ${JSON.stringify(rowsNow) === JSON.stringify(rowsBefore)}`)
    // armed -> close the sheet -> reopen
    await t.press('[data-testid="settings-close"]'); await page.waitForTimeout(300)
    await t.press('[data-testid="settings-open"]'); await page.waitForTimeout(400); await page.locator(btn).scrollIntoViewIfNeeded()
    const t2 = await txt()
    rec('30-close-reopen', /Reset order/.test(t2) ? 'PASS' : 'FAIL', `armed, closed, reopened: "${t2}"`)
    // armed -> the order turns default by Undo (the drag undone) and non-default again by Redo -> never a live "Really reset?"
    await t.press(btn); const t3 = await txt()
    const undoReach = await page.evaluate(() => { const b = document.getElementById('undoBtn'); if (!b) return 'no button'; const r = b.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return (b === h || b.contains(h)) ? 'reachable' : 'covered by ' + (h && (h.className || h.id || h.tagName)) })
    console.log('  top-bar Undo while the sheet is up:', undoReach)
    const rowsA = (await t.rowsDrawn()).map(r => r.id)
    let route = 'the top-bar Undo button'
    if (undoReach === 'reachable') { await t.press('#undoBtn') }
    else { route = 'Ctrl+Z (the scrim covers the button)'; await page.keyboard.press('Control+z') }
    await page.waitForTimeout(600)
    let rowsU = (await t.rowsDrawn()).map(r => r.id)
    if (JSON.stringify(rowsU) === JSON.stringify(rowsA)) { route = 'a script click on the covered Undo button (Ctrl+Z did nothing)'; await page.evaluate(() => document.getElementById('undoBtn').click()); await page.waitForTimeout(600); rowsU = (await t.rowsDrawn()).map(r => r.id) }
    const undone = JSON.stringify(rowsU) !== JSON.stringify(rowsA)
    const tU = await txt()
    if (route.startsWith('the top-bar')) await t.press('#redoBtn')
    else if (route.startsWith('Ctrl+Z')) await page.keyboard.press('Control+Shift+z')
    else await page.evaluate(() => document.getElementById('redoBtn').click())
    await page.waitForTimeout(600)
    const rowsR = (await t.rowsDrawn()).map(r => r.id)
    let tR = await txt()
    const closedByPress = tR === 'NO BUTTON'
    if (closedByPress) { await t.press('[data-testid="settings-open"]'); await page.waitForTimeout(400); tR = 'the press closed the sheet; reopened: ' + (await txt()) }
    await page.locator(btn).scrollIntoViewIfNeeded(); await t.shot('undo-redo')
    rec('30-undo-redo', undone && JSON.stringify(rowsR) === JSON.stringify(rowsA) ? (/Really reset/.test(tR) ? (route.startsWith('a script') ? 'FAIL (script-only route)' : 'FAIL') : 'PASS') : 'NOT WALKED', `armed "${t3}"; via ${route}: order changed by undo ${undone}, back after redo ${JSON.stringify(rowsR) === JSON.stringify(rowsA)}; text after Undo "${tU}", after Redo "${tR}"`, 'w2-s30-' + WHICH + '-undo-redo.png')
  }
})

writeFileSync(join(OUT, `w2b-${WHICH}.json`), JSON.stringify({ allResults }, null, 1))
console.log('\nDONE')
