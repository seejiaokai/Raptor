/* rcb2-w3 R7 v1 — every window W3 opened, closed each way: day details (Done, x, Escape, outside), the Inputs calendar settings window (x, Escape, outside), the ALL AVAIL window (x, Escape, outside tap, page change).
   usage: [PHONE=1] node rcb2-w3-r7.mjs */
process.env.RCB2_DIST = 'C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/6e376de7-ce28-4b0e-ad14-7848f71c5f9a/scratchpad/frozen-f01e1e416'
process.env.RCB2_BUNDLE = 'index-DDDelbBP.js'
const PHONE = process.env.PHONE === '1'
process.env.RCB2_RUN ||= 'r7-' + (PHONE ? 'p' : 'd') + (process.env.TAG || '1')
const X = await import('./rcb2-w3-lib.mjs')
const { L, say, sleep, FRI } = X
say('rcb2-w3-r7 v1')
const w = await X.open({ phone: PHONE }); const { page, P } = w
const size = PHONE ? '402' : '1536'
const snap = () => page.evaluate(() => JSON.stringify(window.DAYS))
// Friday with a flight and an ALL AVAIL ground row (as R2)
await X.board(w, FRI)
const wi = await X.flight(w, FRI, '12:00', '')
const g0 = await page.evaluate(d => window.DAYS[d].ground.length, FRI)
await X.press(w, `[data-gradd="${FRI}"]`, { scope: 'board' }); await sleep(400)
await X.typeIn(w, `[data-bfld="gr:${FRI}.${g0}.prog"]`, 'ALL AVAIL TEST')
await X.typeIn(w, `[data-bfld="gr:${FRI}.${g0}.str"]`, '12:30')
await X.typeIn(w, `[data-bfld="gr:${FRI}.${g0}.end"]`, '13:30')
say('seat', await X.seat(w, `[data-fill="g:${FRI}.${g0}.+"]`, 'allavail'))
await X.closeBoard(w)
await L.go(page, 'editsched'); await sleep(500)
// --- day details, four ways
const base = await snap()
for (const how of ['done', 'x', 'esc', 'outside']) {
  const dd = await X.dayDetails(w, '#eWeek', FRI)
  await X.pic(w, `r7-daydet-open-${how}-${P}`)
  const r = await X.closeDayPop(w, how)
  await X.pic(w, `r7-daydet-after-${how}-${P}`)
  X.row('R7 day details', size, 'opened from the day card, closed by ' + how, 'closes; the day unchanged', `open: ${dd.ok}; after: ${r}; day unchanged: ${base === await snap()}`, dd.ok && r === 'closed' && base === await snap() ? 'PASS' : 'FAIL', `r7-daydet-after-${how}-${P}.png`)
}
// --- Inputs calendar settings window, three ways
async function openSet() {
  await L.go(page, 'logic'); await sleep(500)
  const d = page.locator('[data-lgopen="inputs"]:visible').first()
  await d.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  if (PHONE) await d.tap(); else await d.click()
  await page.waitForSelector('[data-testid="win-inputsset"]:visible', { timeout: 5000 }); await sleep(400)
}
const isOpen = () => page.locator('[data-testid="win-inputsset"]:visible').count()
let cut0 = null
for (const how of ['x', 'esc', 'outside']) {
  await L.go(page, 'logic'); await sleep(400); cut0 = await page.evaluate(() => (document.querySelector('[data-lgopen="inputs"]') || {}).ariaLabel)
  await openSet(); await X.pic(w, `r7-inset-open-${how}-${P}`)
  if (how === 'x') { const x = page.locator('[data-testid="win-inputsset-x"]:visible').first(); if (PHONE) await x.tap(); else await x.click() }
  else if (how === 'esc') await page.keyboard.press('Escape')
  else { const b = await page.locator('[data-testid="win-inputsset"]').first().boundingBox(); const vp = page.viewportSize(); const x = b.x > 60 ? 20 : vp.width - 6, y = vp.height - 6; if (PHONE) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y) }
  await sleep(600)
  const still = await isOpen()
  await X.pic(w, `r7-inset-after-${how}-${P}`)
  const cut1 = await page.evaluate(() => (document.querySelector('[data-lgopen="inputs"]') || {}).ariaLabel)
  X.row('R7 Inputs calendar settings window', size, 'opened from the Logic page late cut-off, closed by ' + how, how === 'outside' ? 'RECORD' : 'closes; value unchanged', `still open: ${still}; value same: ${cut0 === cut1}`, how === 'outside' ? 'RECORDED' : (!still && cut0 === cut1 ? 'PASS' : 'FAIL'), `r7-inset-after-${how}-${P}.png`)
  if (still) { const x = page.locator('[data-testid="win-inputsset-x"]:visible').first(); if (PHONE) await x.tap().catch(() => {}); else await x.click().catch(() => {}); await sleep(400) }
}
// --- ALL AVAIL window
await L.go(page, 'editsched'); await sleep(500)
const awOpen = () => page.locator('.availwin:not([hidden]):visible').count()
async function openAW() {
  const chip = page.locator(`#eWeek .day[data-day="${FRI}"] [data-oilsent]:visible`).first()
  if (!(await chip.count())) return false
  await chip.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  if (PHONE) await chip.tap({ timeout: 3000 }).catch(() => {}); else { const b = await chip.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
  await sleep(600); return awOpen()
}
for (const how of ['x', 'esc', 'outside', 'pagechange']) {
  const ok = await openAW()
  if (!ok && PHONE) {
    await page.evaluate(() => document.querySelector('[data-disarm]')?.click()); await sleep(300)
    await X.board(w, FRI)
    const chipB = page.locator('#schedBoard [data-oilsent]:visible').first()
    if (await chipB.count()) { await chipB.evaluate(e => e.scrollIntoView({ block: 'center' })); const b = await chipB.boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await sleep(600) }
    if (await awOpen()) { say('ALL AVAIL window opened from the board (phone fallback)'); w.fromBoard = true } else await X.closeBoard(w)
  }
  const ok2 = ok || (await awOpen())
  if (!ok2) { await X.pic(w, `r7-aw-noopen-${how}-${P}`); X.row('R7 ALL AVAIL window', size, 'opened from the week day card, closed by ' + how, 'closes', 'window did not open from the week card (' + (PHONE ? 'phone: the tap armed the row for planning' : 'desktop') + ')', 'NOT WALKED', `r7-aw-noopen-${how}-${P}.png`); await page.evaluate(() => document.querySelector('[data-disarm]')?.click()); continue }
  await X.pic(w, `r7-aw-open-${how}-${P}`)
  if (how === 'x') await X.press(w, '.availwin .win-x')
  else if (how === 'esc') { await page.keyboard.press('Escape'); await sleep(500) }
  else if (how === 'outside') { const b = await page.locator('.availwin').first().boundingBox(); const vp = page.viewportSize(); const x = b.x > 60 ? 20 : vp.width - 6, y = vp.height - 6; if (PHONE) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y); await sleep(500) }
  else { await L.go(page, 'viewsched'); await sleep(500) }
  const still = await awOpen()
  await X.pic(w, `r7-aw-after-${how}-${P}`)
  const exp = how === 'esc' ? 'closes (known filed fault [ALLAVAIL-ESCAPE] if not)' : how === 'outside' ? 'stays open (contract)' : 'closes'
  const verdict = how === 'esc' ? (still ? 'RECORDED' : 'PASS') : how === 'outside' ? (still ? 'PASS' : 'RECORDED') : (!still ? 'PASS' : 'FAIL')
  X.row('R7 ALL AVAIL window', size, 'opened from the ' + (PHONE ? 'board (the week card tap arms the row on the phone)' : 'week day card') + ', closed by ' + how, exp, `still open: ${still}` + (how === 'esc' && still ? ' ([ALLAVAIL-ESCAPE], already filed)' : ''), verdict, `r7-aw-after-${how}-${P}.png`)
  if (still) { await X.press(w, '.availwin .win-x').catch(() => {}); await sleep(400) }
  if (w.fromBoard) { await X.closeBoard(w); w.fromBoard = false; await L.go(page, 'editsched') }
  if (how === 'pagechange') await L.go(page, 'editsched')
}
await X.fin(w)
