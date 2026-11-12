/* rcsb-w2-n7 v1 — W2 N7: the plain-user round. Everything that opens is opened and closed, each state pictured.
   Part A (both): Inputs day panel + input window (close by Escape / by a visible close control), board open + Done, ⓘ.
   Part B (phone): after a filed leave + seated man, hide a warning line, Undo, Redo, Reset arrow by TAP.
   usage: node scripts/handpass/rcsb/w2/rcsb-w2-n7.mjs [pc|phone] */
const KIND = process.argv[2] || 'pc'
const C = await import('./rcsb-w2-common.mjs')
C.setShots(`N7-${KIND}`)
console.log('rcsb-w2-n7 v1', KIND, process.env.HP_SHOTS)
const Q = await C.load()
const { R, I, X, L, sleep } = Q
const j = C.j
const w = await R.world(KIND)
const { page } = w
const P = KIND === 'phone' ? 'p-' : 'd-'
const out = { kind: KIND, steps: {} }
const vis = sel => page.locator(sel + ':visible').count()
const closers = async root => page.evaluate(r => {
  const el = document.querySelector(r); if (!el) return []
  return [...el.querySelectorAll('button, [role=button], .x, [data-close]')].filter(e => e.offsetWidth).map(e => (e.id ? '#' + e.id : '') + '.' + String(e.className).replace(/\s+/g, '.').slice(0, 40) + ' "' + (e.innerText || e.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 30) + '"')
}, root)

// A. Inputs day panel
await L.go(page, 'inputs'); await sleep(800)
await R.shot(page, P + 'A0-inputs-page')
await I.openDay(page, '2026-07-16'); await sleep(500)
await R.shot(page, P + 'A1-day-panel-open')
const popSel = await page.evaluate(() => { const e = document.querySelector('#icPopAdd'); const p = e && (e.closest('[role=dialog], .modal-box, .icpop, [id*=icPop]') || e.parentElement); return p ? (p.id ? '#' + p.id : '.' + String(p.className).split(/\s+/)[0]) : null })
out.popSel = popSel
out.dayPanelClosers = popSel ? await closers(popSel) : []
console.log('day panel', popSel, j(out.dayPanelClosers))
await page.keyboard.press('Escape'); await sleep(600)
out.steps.dayPanelEsc = (await vis('#icPopAdd')) ? 'STILL OPEN' : 'closed'
console.log('day panel after Escape', out.steps.dayPanelEsc)
await R.shot(page, P + 'A2-day-panel-after-escape')
if (out.steps.dayPanelEsc === 'STILL OPEN') {
  const x = page.locator(`${popSel} button:visible`).filter({ hasText: /✕|×|close|done/i }).first()
  if (await x.count()) { await C.hit(w, x); await sleep(600) }
  out.steps.dayPanelX = (await vis('#icPopAdd')) ? 'STILL OPEN' : 'closed'
  console.log('day panel after control', out.steps.dayPanelX)
  await R.shot(page, P + 'A2-day-panel-after-x')
}
// reopen, close by tapping outside
if (!(await vis('#icPopAdd'))) { await I.openDay(page, '2026-07-16'); await sleep(500) }
await page.mouse.click(KIND === 'phone' ? 6 : 6, 120); await sleep(600)
out.steps.dayPanelOutside = (await vis('#icPopAdd')) ? 'STILL OPEN' : 'closed'
console.log('day panel after outside tap', out.steps.dayPanelOutside)
await R.shot(page, P + 'A3-day-panel-after-outside')
// the day panel's own ✕ (the panel is docked, not a pop-up: an outside tap leaves it open, ✕ and Escape close it)
if (!(await vis('#icPopAdd'))) { await I.openDay(page, '2026-07-16'); await sleep(500) }
await C.hit(w, page.locator('.win-x:visible').first()); await sleep(600)
out.steps.dayPanelXbtn = (await vis('#icPopAdd')) ? 'STILL OPEN' : 'closed'
console.log('day panel after its X', out.steps.dayPanelXbtn)
await R.shot(page, P + 'A3b-day-panel-after-x')
// the input window
if (!(await vis('#icPopAdd'))) { await I.openDay(page, '2026-07-16'); await sleep(500) }
await C.hit(w, page.locator('#icPopAdd').first()); await page.waitForSelector('#inpEditPerson'); await sleep(500)
await R.shot(page, P + 'A4-input-window-open')
out.winClosers = await closers((await page.evaluate(() => { const e = document.querySelector('#inpEditPerson'); const p = e.closest('[role=dialog], .modal-box, [class*=modal]') || e.parentElement; return p.id ? '#' + p.id : '.' + String(p.className).split(/\s+/)[0] })))
console.log('input window controls', j(out.winClosers))
await page.keyboard.press('Escape'); await sleep(600)
out.steps.winEsc = (await vis('#inpEditPerson')) ? 'STILL OPEN' : 'closed'
console.log('input window after Escape', out.steps.winEsc)
await R.shot(page, P + 'A5-input-window-after-escape')
if (out.steps.winEsc === 'STILL OPEN') {
  const c = page.locator('button:visible').filter({ hasText: /^(Cancel|Close|✕|×)$/ }).first()
  if (await c.count()) { await C.hit(w, c); await sleep(600) }
  out.steps.winCancel = (await vis('#inpEditPerson')) ? 'STILL OPEN' : 'closed'
  console.log('input window after Cancel', out.steps.winCancel)
  await R.shot(page, P + 'A5-input-window-after-cancel')
}
// the window's ✕ and Cancel
for (const [k, sel] of [['winX', '.win-x:visible'], ['winCancelBtn', 'button:visible:text-is("Cancel")']]) {
  if (!(await vis('#inpEditPerson'))) { if (!(await vis('#icPopAdd'))) { await I.openDay(page, '2026-07-16'); await sleep(500) } await C.hit(w, page.locator('#icPopAdd').first()); await page.waitForSelector('#inpEditPerson'); await sleep(500) }
  await C.hit(w, page.locator(sel).last()); await sleep(700)
  out.steps[k] = (await vis('#inpEditPerson')) ? 'STILL OPEN' : 'closed'
  console.log('input window after', k, out.steps[k])
  await R.shot(page, P + 'A6-input-window-after-' + k)
}
// leave the day panel if still open
if (await vis('#icPopAdd')) { await page.keyboard.press('Escape'); await sleep(500) }
// B. the board open and Done
await L.board(page, 3); await sleep(500)
await R.shot(page, P + 'B1-board-open')
out.boardDoneCtl = await page.evaluate(() => [...document.querySelectorAll('#schedBoard button, #schedBoard [role=button]')].filter(e => e.offsetWidth && /done|✓/i.test(e.innerText)).map(e => (e.id || e.className) + ' "' + e.innerText.trim() + '"'))
console.log('board Done controls', j(out.boardDoneCtl))
await L.closeBoard(page); await sleep(500)
out.steps.board = (await vis('#schedBoard')) ? 'STILL OPEN' : 'closed'
console.log('board after Done', out.steps.board)
await R.shot(page, P + 'B2-board-after-done')

if (KIND === 'phone') {
  // C. hide a line on the phone: file leave for Vandal Thu, seat him on a flying line, then hide/undo/redo/reset by tap
  const id = w.ID('Vandal'), di = 3
  const f = await C.fileInput(w, Q, '2026-07-16', id, 'LL', P + 'C0-input-form')
  console.log('filed', f.added, j(f.nodoc))
  await L.board(page, di)
  const gi = await X.addWave(w, di, '')
  await X.typeIn(w, `[data-bfld="ff:${di}.${gi}.0.to"]`, '10:00'); await X.typeIn(w, `[data-bfld="ff:${di}.${gi}.0.ld"]`, '11:30')
  out.seat = await X.seatPhoneAware(w, `[data-slot="${di}.${gi}.0.0.p"]`, id)
  await L.closeBoard(page)
  await L.go(page, 'editsched'); await sleep(800)
  const lines = async () => { await X.stripItems(page, '#eWeek', di); return linesRaw() }
  const linesRaw = async () => page.evaluate(d => [...document.querySelectorAll(`#eWeek [data-dwbox="${d}"] .witem`)].map(e => ({ ix: e.dataset.wix, t: e.innerText.replace(/[\s ]+/g, ' ').trim(), struck: getComputedStyle(e.querySelector('.wtx') || e).textDecorationLine.includes('line-through') || e.classList.contains('hid') })), di)
  out.l0 = await lines(); console.log('C0 lines', j(out.l0))
  await X.pic(page, P + 'C1-strip', `#eWeek [data-dwbox="${di}"]`, { pad: 8 })
  const tgt = out.l0.find(l => /Vandal/.test(l.t) && /planned to fly/.test(l.t))
  if (!tgt) console.log('NO Vandal planned-to-fly LINE')
  else {
    const btn = () => page.locator(`#eWeek [data-dwbox="${di}"] .witem-mute[data-woff="${di}.${tgt.ix}"]`).first()
    out.btnHtml = await btn().evaluate(e => e.outerHTML.slice(0, 220))
    await btn().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
    await btn().tap(); await sleep(800)
    out.hidden = (await lines()).filter(l => /Vandal/.test(l.t)); console.log('C hidden', j(out.hidden))
    await X.pic(page, P + 'C2-hidden', `#eWeek [data-dwbox="${di}"]`, { pad: 8 })
    const u = await X.undoBtn(w, 'undo'); await sleep(600)
    out.afterUndo = { r: u, l: (await lines()).filter(l => /Vandal/.test(l.t)) }; console.log('C undo', j(out.afterUndo))
    await X.pic(page, P + 'C3-after-undo', `#eWeek [data-dwbox="${di}"]`, { pad: 8 })
    const r = await X.undoBtn(w, 'redo'); await sleep(600)
    out.afterRedo = { r, l: (await lines()).filter(l => /Vandal/.test(l.t)) }; console.log('C redo', j(out.afterRedo))
    await X.pic(page, P + 'C4-after-redo', `#eWeek [data-dwbox="${di}"]`, { pad: 8 })
    await btn().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
    await btn().tap(); await sleep(800)
    out.afterReset = (await lines()).filter(l => /Vandal/.test(l.t)); console.log('C reset', j(out.afterReset))
    await X.pic(page, P + 'C5-after-reset', `#eWeek [data-dwbox="${di}"]`, { pad: 8 })
  }
  // D. Insights on the phone, if it has the button
  const ib = page.locator('#insightBtn:visible').first()
  out.insightsOnPhone = await ib.count()
  console.log('insights button on phone', out.insightsOnPhone)
  if (out.insightsOnPhone) {
    await ib.tap(); await sleep(1000)
    await R.shot(page, P + 'D1-insights-open')
    await page.keyboard.press('Escape'); await sleep(600)
    const still = await page.evaluate(() => [...document.querySelectorAll('*')].some(e => e.offsetWidth && e.children.length === 0 && /^Week insights/.test((e.innerText || '').trim())))
    out.steps.insightsEsc = still ? 'STILL OPEN' : 'closed'
    if (still) {
      const b = await page.evaluate(() => { const h = [...document.querySelectorAll('*')].find(e => e.offsetWidth && e.children.length === 0 && /^Week insights/.test((e.innerText || '').trim())); const el = h.closest('.modal-box') || h.parentElement; const b = [...el.querySelectorAll('button')].filter(x => x.offsetWidth && !/Show all/.test(x.innerText))[0]; if (b) b.setAttribute('data-w2x', '1'); return !!b })
      if (b) await page.locator('[data-w2x]').first().tap(); await sleep(600)
      out.steps.insightsX = (await page.evaluate(() => [...document.querySelectorAll('*')].some(e => e.offsetWidth && e.children.length === 0 && /^Week insights/.test((e.innerText || '').trim())))) ? 'STILL OPEN' : 'closed'
    }
    console.log('insights phone', j(out.steps))
    await R.shot(page, P + 'D2-insights-closed')
  }
}
out.errors = w.errors
console.log('errors', j(w.errors))
const { writeFileSync } = await import('node:fs')
writeFileSync(process.env.HP_SHOTS + '/out.json', JSON.stringify(out, null, 1))
await w.browser.close()
