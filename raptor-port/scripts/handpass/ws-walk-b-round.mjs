/* WALKER B, part 2: B11-B18, the plain-user round (D1557) at 1536 x 864. node ws-walk-b-round.mjs */
import { start, signIn, editTab, recorder, shotter, at, boardOpen, around, OUT, writeJson } from './ws-walk-b-lib.mjs'
console.log('ws-walk-b-round v1 (B11-B18), pictures in ' + OUT)
const { browser, page, errors } = await start()
const { rows, note } = recorder()
const shot = shotter(page)
await signIn(page)
await editTab(page)
const SEAT = '0.0.0.2.p'
const seatText = () => page.evaluate(k => { const s = document.querySelector(`#eWeek [data-slot="${k}"]`); return s ? { text: s.textContent.trim(), person: s.querySelector('[data-person]')?.dataset.person || s.dataset.person || null } : null }, SEAT)

/* fixture: an empty seat, made through the board's own "+ aircraft" button on the first formation (the demo week has no empty flying seat) */
await page.locator('#eWeek .day[data-day="0"] .dt.sb-open').click()
await page.waitForSelector('#schedBoard:not([hidden])'); await page.waitForTimeout(400)
const lac = page.locator('#sbBoard [data-lac="0.0.0"]').first()
await lac.scrollIntoViewIfNeeded(); await lac.click(); await page.waitForTimeout(500)
await page.locator('#sbDone').click(); await page.waitForTimeout(500)
let st = await seatText()
console.log('fixture: empty seat', JSON.stringify(st))

/* ---------- B11 drag a man onto an empty seat; Undo; Redo ---------- */
const seatLoc = page.locator(`#eWeek [data-slot="${SEAT}"]`).first()
await seatLoc.scrollIntoViewIfNeeded()
const rp = page.locator('#eRoster .rpuck[data-person="beams"]').first()
await rp.scrollIntoViewIfNeeded()
const pBefore = await shot('B11a-before-drag-empty-seat', await around(page, `#eWeek [data-slot="${SEAT}"]`, 90))
async function drag(from, to) {
  const a = await from.boundingBox(), b = await to.boundingBox()
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await page.mouse.down()
  await page.mouse.move(a.x + a.width / 2 - 12, a.y + a.height / 2 - 6, { steps: 4 })
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 20 })
  await page.waitForTimeout(250)
  const mid = await shot('B11b-mid-drag')
  await page.mouse.up()
  await page.waitForTimeout(500)
  return mid
}
let mid, placed = null
for (let t = 1; t <= 3 && !placed; t++) {
  mid = await drag(rp, seatLoc)
  const s = await seatText()
  if (s && s.person === 'beams') placed = s
  else console.log('B11 try', t, 'seat now', JSON.stringify(s))
}
const pAfter = await shot('B11c-after-drop', await around(page, `#eWeek [data-slot="${SEAT}"]`, 90))
note('B11 drag Comet from the crew list onto the empty seat: he shows there', !!placed, `seat ${JSON.stringify(placed)}`, 'B11a B11b B11c')
/* the same seat on the board */
await page.locator('#eWeek .day[data-day="0"] .dt.sb-open').click(); await page.waitForTimeout(400)
const onBoard = await page.evaluate(k => { const s = document.querySelector(`#sbBoard [data-slot="${k}"]`); return s ? (s.querySelector('[data-person]')?.dataset.person || s.dataset.person || s.textContent.trim()) : 'no seat' }, SEAT)
const pBoard = await shot('B11d-same-seat-on-board')
await page.locator('#sbDone').click(); await page.waitForTimeout(400)
note('B11b the same man shows in the same seat on the Scheduler Board', onBoard === 'beams', `board seat reads ${onBoard}`, 'B11d')
await page.locator('#undoBtn').click(); await page.waitForTimeout(500)
st = await seatText()
const pU = await shot('B11e-after-undo', await around(page, `#eWeek [data-slot="${SEAT}"]`, 90))
note('B11c Undo (top bar): he is gone from the seat', !!st && st.person !== 'beams', JSON.stringify(st), 'B11e')
await page.locator('#redoBtn').click(); await page.waitForTimeout(500)
st = await seatText()
const pR = await shot('B11f-after-redo', await around(page, `#eWeek [data-slot="${SEAT}"]`, 90))
note('B11d Redo: he is back', !!st && st.person === 'beams', JSON.stringify(st), 'B11f')

/* ---------- B12 the bell ---------- */
const bellList = page.locator('[data-testid="bell-list"]')
await page.locator('#notifyBell').click(); await page.waitForTimeout(400)
const bellUp = await bellList.count()
const pB1 = await shot('B12a-bell-open')
const lineCount = await page.locator('[data-testid^="bell-line-"]').count()
await page.mouse.click(700, 400); await page.waitForTimeout(350)   // outside, on the week
const gone1 = (await bellList.count()) === 0
await page.locator('#notifyBell').click(); await page.waitForTimeout(300)
const up2 = await bellList.count()
await page.keyboard.press('Escape'); await page.waitForTimeout(300)
const gone2 = (await bellList.count()) === 0
await page.locator('#notifyBell').click(); await page.waitForTimeout(300)
const up3 = await bellList.count()
await page.locator('#notifyBell').click(); await page.waitForTimeout(300)
const gone3 = (await bellList.count()) === 0
const pB2 = await shot('B12b-bell-closed')
note('B12 the bell: its list opens; a click outside, Escape, and the bell again each close it', bellUp === 1 && gone1 && up2 === 1 && gone2 && up3 === 1 && gone3, `lines ${lineCount}; outside-click closed ${gone1}; Escape closed ${gone2}; bell-again closed ${gone3}`, 'B12a B12b')

/* ---------- B13 the changes window ---------- */
await page.locator('#histBtn').click(); await page.waitForTimeout(500)
const win = page.locator('.chgwin:not([hidden])')
const winUp = await win.count()
const allTab = page.locator('.chgwin .win-tab', { hasText: 'All changes' })
if (await allTab.count()) { await allTab.click(); await page.waitForTimeout(300) }
const pC1 = await shot('B13a-changes-open')
const lineBtns = page.locator('.chgwin button[data-cwkey]')
const nLines = await lineBtns.count()
console.log('B13 lines in window', nLines, JSON.stringify(await lineBtns.evaluateAll(bs => bs.slice(0, 5).map(b => b.dataset.cwkey + ' | ' + b.textContent.trim().slice(0, 60)))))
/* scroll the week away first so a jump is visible */
await page.evaluate(() => { window.scrollTo(0, 0) })
const target = lineBtns.first()
const key = await target.getAttribute('data-cwkey')
await target.click(); await page.waitForTimeout(700)
const where = await page.evaluate(k => {
  const e = document.querySelector(`#eWeek [data-slot="${k}"]`) || document.querySelector(`#eWeek [data-key="${k}"]`)
  if (!e) return { found: false }
  const r = e.getBoundingClientRect()
  return { found: true, inView: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth, rect: [Math.round(r.left), Math.round(r.top)] }
}, key)
const pC2 = await shot('B13b-after-tap-a-line')
const stillOpen = await win.count()
await page.locator('.chgwin .win-x').click(); await page.waitForTimeout(400)
const closed = (await page.locator('.chgwin:not([hidden])').count()) === 0
const pC3 = await shot('B13c-changes-closed')
note('B13 changes window: opens (clock), a tapped line takes the schedule to that change, ✕ closes it', winUp === 1 && nLines > 0 && where.found && where.inView && stillOpen === 1 && closed, `lines ${nLines}; key ${key}; the change's place ${JSON.stringify(where)}; window stayed open ${stillOpen}; closed by ✕ ${closed}`, 'B13a B13b B13c')

/* ---------- B14 the ALL AVAIL window: ALL AVAIL dragged onto an empty programme row, the count chip then opened ---------- */
const zone = page.locator('#eWeek .day[data-day="0"] [data-fill="a:0.0.+"]').first()
await zone.scrollIntoViewIfNeeded()
const aa = page.locator('#eRoster .rpuck[data-person="allavail"]').first()
await aa.scrollIntoViewIfNeeded()
let chip = 0
for (let t = 1; t <= 3 && !chip; t++) {
  const a = await aa.boundingBox(), b = await zone.boundingBox()
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down()
  await page.mouse.move(a.x + a.width / 2 - 12, a.y + a.height / 2 - 6, { steps: 4 })
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 20 })
  await page.waitForTimeout(250); await page.mouse.up(); await page.waitForTimeout(600)
  chip = await page.locator('#eWeek [data-oilsent]:visible').count()
  if (!chip) { const q = await page.locator('.mission-role-question, .modal:not([hidden]), [role=dialog]').count(); console.log('B14 try', t, 'no chip; dialogs', q) }
}
const pA1 = await shot('B14a-allavail-on-week')
let availOpen = 0, moved = null, closedX = false, closedEsc = false
if (chip) {
  const cp = page.locator('#eWeek [data-oilsent]:visible').first()
  await cp.scrollIntoViewIfNeeded(); await cp.click(); await page.waitForTimeout(500)
  availOpen = await page.locator('.availwin:not([hidden])').count()
  const pA2 = await shot('B14b-availwin-open')
  const bar = page.locator('.availwin:not([hidden]) .win-bar').first()
  const b0 = await page.locator('.availwin:not([hidden])').first().boundingBox()
  const bb = await bar.boundingBox()
  await page.mouse.move(bb.x + 60, bb.y + bb.height / 2); await page.mouse.down()
  await page.mouse.move(bb.x + 60 - 220, bb.y + bb.height / 2 + 80, { steps: 12 }); await page.mouse.up(); await page.waitForTimeout(300)
  const b1 = await page.locator('.availwin:not([hidden])').first().boundingBox()
  moved = { dx: Math.round(b1.x - b0.x), dy: Math.round(b1.y - b0.y) }
  const pA3 = await shot('B14c-availwin-moved')
  await page.locator('.availwin:not([hidden]) .win-x').click(); await page.waitForTimeout(400)
  closedX = (await page.locator('.availwin:not([hidden])').count()) === 0
  await cp.click(); await page.waitForTimeout(400)
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  closedEsc = (await page.locator('.availwin:not([hidden])').count()) === 0
  if (!closedEsc) await page.locator('.availwin:not([hidden]) .win-x').click()
  await shot('B14d-availwin-closed')
}
note('B14 ALL AVAIL window: opens from the count chip, moves, ✕ closes it', chip > 0 && availOpen === 1 && !!moved && (moved.dx !== 0 || moved.dy !== 0) && closedX, `chip ${chip}; window ${availOpen}; moved ${JSON.stringify(moved)}; closed by ✕ ${closedX}; closed by Escape ${closedEsc} (information only)`, 'B14a B14b B14c B14d')

/* ---------- B15 the duty and wave template editors ---------- */
await page.locator('#eWeek .day[data-day="0"] .dt.sb-open').click()
await page.waitForSelector('#schedBoard:not([hidden])'); await page.waitForTimeout(400)
const store = () => page.evaluate(() => JSON.stringify(Object.entries(localStorage).filter(([k]) => !/hist|elog|seen|view/i.test(k))))
const s15 = await store()
async function editor(label, menuSel, penSel, modalSel, closeSel, tag) {
  const results = {}
  for (const how of ['x', 'esc']) {
    const b = page.locator(menuSel).first()
    await b.scrollIntoViewIfNeeded(); await b.click(); await page.waitForTimeout(300)
    await page.locator(penSel).first().click(); await page.waitForTimeout(400)
    const up = await page.locator(`${modalSel}:not([hidden])`).count()
    if (how === 'x') await shot(`B15-${tag}-open`)
    const tabs = []
    for (let i = 0; i < 12; i++) { await page.keyboard.press('Tab'); const a = await page.evaluate(() => { const e = document.activeElement; return (e.getAttribute('aria-label') || e.id || e.tagName) + (e.closest('.modal') ? '' : ' (OUTSIDE)') }); tabs.push(a) }
    if (how === 'x') await shot(`B15-${tag}-tabbed`)
    const cancelBtn = page.locator(`${modalSel} button`, { hasText: /^cancel$/i })
    if (how === 'x') { if (await cancelBtn.count()) await cancelBtn.first().click(); else await page.locator(closeSel).click() } else await page.keyboard.press('Escape')
    await page.waitForTimeout(400)
    results[how] = { up, tabs, closed: (await page.locator(`${modalSel}:not([hidden])`).count()) === 0, cancelBtn: await cancelBtn.count() }
    if (how === 'x') await shot(`B15-${tag}-closed-by-${(results.x.cancelBtn ? 'cancel' : 'x')}`)
    else await shot(`B15-${tag}-closed-by-escape`)
    /* make sure it is gone before the next round */
    if (!results[how].closed) await page.locator(closeSel).click()
    await page.waitForTimeout(300)
  }
  const s = await store()
  note(`B15 ${label}: opens, Tab stays inside it, ✕/Cancel closes, Escape closes, nothing saved`, results.x.up === 1 && results.x.closed && results.esc.up === 1 && results.esc.closed && !results.x.tabs.some(t => /OUTSIDE/.test(t)) && s === s15, `x: ${JSON.stringify(results.x)}; esc: closed ${results.esc.closed}; storage unchanged ${s === s15}`, `B15-${tag}-*`)
}
await editor('+ Block ⚙ (duty templates)', '#sbBoard [data-dwadd]', '[data-blkedit]', '#tplModal', '#tplClose', 'duty')
await editor('+ Wave ⚙ (wave templates)', '#sbBoard [data-wvadd]', '[data-wvedit]', '#waveTplModal', '#waveTplClose', 'wave')

/* ---------- B16 Sort all, and a jet's CX dialog ---------- */
const days0 = () => page.evaluate(() => JSON.stringify(window.DAYS).length)
const d0 = await days0()
await page.locator('#sbSortAll').click(); await page.waitForTimeout(400)
const dlg = await page.evaluate(() => { const m = [...document.querySelectorAll('[role=dialog], .modal:not([hidden]), .sbdlg, .confirm')].filter(e => e.offsetWidth); return m.map(e => e.className + ' | ' + e.textContent.trim().slice(0, 140)) })
console.log('B16 Sort all dialog', JSON.stringify(dlg))
const p16a = await shot('B16a-sort-all-dialog')
const cancel1 = page.locator('button:visible', { hasText: /^cancel$/i }).first()
const hadCancel1 = await cancel1.count()
if (hadCancel1) await cancel1.click(); else await page.keyboard.press('Escape')
await page.waitForTimeout(400)
const dlgGone = await page.evaluate(() => [...document.querySelectorAll('[role=dialog], .modal:not([hidden]), .sbdlg, .confirm')].filter(e => e.offsetWidth).length)
const p16b = await shot('B16b-sort-all-cancelled')
note('B16a Sort all: its dialog opens; Cancel closes it; nothing changed', dlg.length > 0 && hadCancel1 > 0 && dlgGone === 0 && (await days0()) === d0, `dialog ${JSON.stringify(dlg)}; cancel button ${hadCancel1}; dialogs left ${dlgGone}; data size ${d0} -> ${await days0()}`, 'B16a B16b')
const cx = page.locator('#sbBoard [data-lcx]:visible').first()
await cx.scrollIntoViewIfNeeded(); await cx.click(); await page.waitForTimeout(400)
const dlg2 = await page.evaluate(() => [...document.querySelectorAll('[role=dialog], .modal:not([hidden]), .sbdlg, .confirm, .cxdlg')].filter(e => e.offsetWidth).map(e => e.className + ' | ' + e.textContent.trim().slice(0, 160)))
console.log('B16 CX dialog', JSON.stringify(dlg2))
const p16c = await shot('B16c-cx-dialog')
const cancel2 = page.locator('button:visible', { hasText: /^cancel$/i }).first()
const hadCancel2 = await cancel2.count()
if (hadCancel2) await cancel2.click(); else await page.keyboard.press('Escape')
await page.waitForTimeout(400)
const p16d = await shot('B16d-cx-cancelled')
const cxLeft = await page.evaluate(() => [...document.querySelectorAll('[role=dialog], .modal:not([hidden]), .sbdlg, .confirm, .cxdlg')].filter(e => e.offsetWidth).length)
note("B16b a jet's CX (cancel) dialog: opens; Cancel closes it; nothing changed", dlg2.length > 0 && hadCancel2 > 0 && cxLeft === 0 && (await days0()) === d0, `dialog ${JSON.stringify(dlg2)}; cancel ${hadCancel2}; left ${cxLeft}; data size ${await days0()}`, 'B16c B16d')

/* ---------- B17 the board's search ---------- */
const hist = () => page.evaluate(() => { const h = {}; document.querySelectorAll('#sbBoard .puck').forEach(p => { const c = [...p.classList].sort().join(' '); h[c] = (h[c] || 0) + 1 }); const lit = [...document.querySelectorAll('#sbBoard .puck')].filter(p => /Saber/.test(p.textContent)).map(p => p.className); return { h, lit } })
const h0 = await hist()
await shot('B17a-search-before')
await page.locator('#searchB').click(); await page.keyboard.type('Saber', { delay: 40 }); await page.waitForTimeout(500)
const h1 = await hist()
const p17b = await shot('B17b-search-saber')
const changedUp = JSON.stringify(h1.h) !== JSON.stringify(h0.h)
await page.locator('#searchB').fill(''); await page.waitForTimeout(500)
const h2 = await hist()
const p17c = await shot('B17c-search-cleared')
note('B17 board search: typing a callsign lights the matching pucks; clearing puts them back', changedUp && JSON.stringify(h2.h) === JSON.stringify(h0.h), `puck classes before/typed/cleared differ ${changedUp}; restored ${JSON.stringify(h2.h) === JSON.stringify(h0.h)}; Saber classes typed: ${JSON.stringify(h1.lit.slice(0, 2))}; before: ${JSON.stringify(h0.lit.slice(0, 2))}`, 'B17a B17b B17c')
await page.locator('#sbDone').click(); await page.waitForTimeout(400)

/* ---------- B18 the sync chip ---------- */
const chipEl = page.locator('#fastSync')
const t0 = (await chipEl.textContent()).trim(), ttl0 = await chipEl.getAttribute('title')
await chipEl.hover(); await page.waitForTimeout(500)
const p18a = await shot('B18a-sync-hover', await around(page, '#fastSync', 80))
await chipEl.click(); await page.waitForTimeout(500)
const t1 = (await chipEl.textContent()).trim(), ttl1 = await chipEl.getAttribute('title'), cls1 = await chipEl.getAttribute('class')
const p18b = await shot('B18b-sync-pressed', await around(page, '#fastSync', 80))
await chipEl.click(); await page.waitForTimeout(500)
const t2 = (await chipEl.textContent()).trim()
const p18c = await shot('B18c-sync-back', await around(page, '#fastSync', 80))
note('B18 the sync chip: hover shows its title; pressing toggles its state, pressing again puts it back', t1 !== t0 && t2 === t0, `text ${JSON.stringify(t0)} -> ${JSON.stringify(t1)} -> ${JSON.stringify(t2)}; title ${JSON.stringify(ttl0)} -> ${JSON.stringify(ttl1)}; class pressed ${cls1}`, 'B18a B18b B18c')

console.log('errors:', JSON.stringify(errors))
note('B-errs round: no console errors, page errors or failed requests', errors.length === 0, errors.join(' | '))
await browser.close()
writeJson('ws-walk-b-results2.json', rows)
console.log(`\n${rows.filter(r => r.ok).length}/${rows.length} pass`)
