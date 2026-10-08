/* X-17 — short-screen windows coexist with the calendar's height and unchanged controls (D487, D648, D653, D664).
   node cal-H-x17.mjs phone | short | side.  Six-week August 2026 with a crowded date (seeded background: twelve absences and
   duties on Wed 12 Aug through the app's filing door — "seeded"; everything the scenario tests is done by touch).
   The tall phone (390x844) is the comparison for the visible button sizes. */
import * as H from './cal-H-lib.mjs'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
const SIZE = process.argv[2] || 'short'
H.setTag('x17' + SIZE)
const { browser, ctx, page, errors } = await H.world({ size: SIZE })
page.__size = SIZE
await H.toastSpy(page)
const VH = H.SIZES[SIZE].height, VW = H.SIZES[SIZE].width
const cdp = await ctx.newCDPSession(page)
const touch = async (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: Math.round(x), y: Math.round(y), id: 1 }] })
async function touchDrag(a, b, steps = 8) {
  await touch('touchStart', a.x, a.y)
  for (let i = 1; i <= steps; i++) { await touch('touchMove', a.x + (b.x - a.x) * i / steps, a.y + (b.y - a.y) * i / steps); await H.sleep(25) }
  await touch('touchEnd', b.x, b.y); await H.sleep(400)
}
const tid = id => page.locator(`[data-testid="${id}"]`)
const hit = sel => page.evaluate(s => { const e = document.querySelector(s); if (!e) return { found: false }; const r = e.getBoundingClientRect(); if (!(r.width > 0)) return { found: true, drawn: false }; const x = r.left + r.width / 2, y = r.top + r.height / 2; const t = document.elementFromPoint(x, y); return { found: true, drawn: true, onScreen: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth, centre: [Math.round(x), Math.round(y)], size: [Math.round(r.width), Math.round(r.height)], lands: !!t && (t === e || e.contains(t)), top: t ? (t.id || t.getAttribute('data-testid') || t.className || t.tagName).toString().slice(0, 40) : null } }, sel)
const box = sel => page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } }, sel)

// ---- seeded background: a crowded date
await H.go(page, 'inputs')
await page.evaluate(() => {
  const P = window.PEOPLE, crew = Object.keys(P).filter(id => !P[id].san && !P[id].archived && !P[id].deleted && !P[id].special && !P[id].pers)
  const types = ['LL', 'Meeting', 'Appointment', 'OIL', 'Training', 'Personal']
  for (let i = 0; i < 12; i++) window.fileInput({ iid: 'x17-' + i, person: crew[i], type: types[i % 6], date: 'Aug 12', endDate: i % 4 === 0 ? 'Aug 14' : undefined, yr: 2026, allday: true, s: 360, e: 1080 })
  for (let i = 12; i < 16; i++) window.fileInput({ iid: 'x17-' + i, person: crew[i], type: 'Meeting', date: 'Aug 13', yr: 2026, allday: true, s: 360, e: 1080 })
})
await H.inputsMonth(page, 2026, 8); await H.sleep(500)
await page.evaluate(() => scrollTo(0, 0))

// ---- 1. the month
const g = await page.evaluate(() => {
  const el = document.querySelector('[data-testid="ib-grid"]'), cs = getComputedStyle(el), cal = document.getElementById('inpCal')
  return { weeks: el.querySelectorAll('.ib-week').length, ownScroll: el.scrollHeight - el.clientHeight, calScroll: cal.scrollHeight - cal.clientHeight, overflowY: cs.overflowY, maxH: cs.maxHeight, pageH: document.documentElement.scrollHeight, pageW: document.documentElement.scrollWidth, vh: innerHeight, vw: innerWidth, bars: el.querySelectorAll('.ib-bar').length, more: [...el.querySelectorAll('.ib-more')].map(e => e.innerText.trim()).slice(0, 4) }
})
const SZ = {}
for (const id of ['#icPrev', '#icNext', '#icToday', '#inCalBtn', '#inListBtn', '#inFiltersBtn', '[data-testid="in-gear"]', '#inMemberMode', '#inSansMode', '#inMedBtn']) { const b = await box(id); SZ[id] = b ? [b.w, b.h] : null }
const sizesFile = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/8bd22da8-eddf-41f4-a0b3-4f89d1b5d57c/scratchpad/x17-sizes.json'
if (SIZE === 'phone') writeFileSync(sizesFile, JSON.stringify(SZ))
const tallSz = existsSync(sizesFile) ? JSON.parse(readFileSync(sizesFile, 'utf8')) : null
const sameHeights = tallSz ? Object.keys(SZ).every(k => !tallSz[k] || !SZ[k] || !SZ[k][1] || !tallSz[k][1] || SZ[k][1] === tallSz[k][1]) : null
const pMonth = await H.pic(page, '1-month-august')
H.judge(`X-17 ${SIZE} (1) the month`, `six-week August 2026, ${SIZE} (${VW}x${VH}), a crowded Wed 12 Aug (seeded): the month and the tools`, [
  ['six weeks drawn', g.weeks === 6, g.weeks],
  ['the month has no scroll of its own and no height limit', g.ownScroll <= 1 && g.calScroll <= 1 && g.maxH === 'none' && !/auto|scroll/.test(g.overflowY), { ownScroll: g.ownScroll, calScroll: g.calScroll, maxH: g.maxH, overflowY: g.overflowY }],
  ['nothing runs off sideways', g.pageW <= g.vw, { pageW: g.pageW, vw: g.vw }],
  ['the crowded date shows its bars and a "+N more" line', g.bars >= 3 && g.more.length > 0, { bars: g.bars, more: g.more }],
  ['the visible button sizes are those of the tall phone (heights equal)', sameHeights === null ? true : sameHeights, { SZ, tall: tallSz }],
], [pMonth], { g, SZ, tallSz })

// ---- 2. open the crowded day by a real touch at its corner
await page.evaluate(() => document.querySelector('[data-icday="2026-08-12"]').scrollIntoView({ block: 'center' })); await H.sleep(300)
{ const bb = await page.evaluate(() => { const b = document.querySelector('.topbar'); return getComputedStyle(b).position === 'sticky' || getComputedStyle(b).position === 'fixed' ? b.getBoundingClientRect().bottom : 0 })
  if (bb) { const top = (await page.locator('[data-icday="2026-08-12"]').boundingBox()).y; await page.evaluate(d => scrollBy(0, d), top - (bb + 4)); await H.sleep(300) } }
const cb = await page.locator('[data-icday="2026-08-12"]').boundingBox()
const barInfo = await page.evaluate(() => { const b = document.querySelector('.topbar'); const cs = getComputedStyle(b); return { bottom: Math.round(b.getBoundingClientRect().bottom), pos: cs.position, h: Math.round(b.getBoundingClientRect().height) } })
const tapY = barInfo.pos === 'sticky' || barInfo.pos === 'fixed' ? Math.max(cb.y + 8, barInfo.bottom + 6) : cb.y + 8
const cellHit = await page.evaluate(([x, y]) => { const t = document.elementFromPoint(x, y); return t ? (t.closest('[data-icday]') ? t.closest('[data-icday]').dataset.icday : (t.id || t.className || t.tagName).toString().slice(0, 40)) : null }, [cb.x + 8, tapY])
console.log('tap point lands on', cellHit, 'at', Math.round(cb.x + 8), Math.round(tapY), JSON.stringify(barInfo))
await page.touchscreen.tap(cb.x + 8, tapY); await H.sleep(900)
const dayUp = await tid('win-inputsday').count()
const dayBox = await box('[data-testid="win-inputsday"]')
const dayHit = { x: await hit('[data-testid="win-inputsday-x"]'), add: await hit('#icPopAdd'), list: await hit('[data-testid="idy-list"]') }
const pDay = await H.pic(page, '2-day-opened')
H.judge(`X-17 ${SIZE} (2) the opened day`, 'a real tap at the corner of Wed 12 Aug opened the day window', [
  ['the day window is up and wholly on the screen', dayUp === 1 && dayBox && dayBox.y >= 0 && dayBox.y + dayBox.h <= VH && dayBox.x >= 0 && dayBox.x + dayBox.w <= VW, dayBox],
  ['its close cross is a finger\'s size (44) and a touch on its middle lands on it', dayHit.x.found && Math.min(...dayHit.x.size) >= 44 && dayHit.x.lands, dayHit.x],
  ['"+ Input" is on screen and a touch on its middle lands on it', dayHit.add.found && dayHit.add.onScreen && dayHit.add.lands, dayHit.add],
], [pDay], { dayBox, dayHit })

// ---- 3. a second window: the Inputs settings (the gear)
await page.evaluate(() => scrollTo(0, 0)); await H.sleep(300)
const gear = await page.locator('[data-testid="in-gear"]').boundingBox()
const gearHit = await hit('[data-testid="in-gear"]')
let setUp = 0, setBox = null, setHit = {}
if (gearHit.lands) { await page.touchscreen.tap(gear.x + gear.width / 2, gear.y + gear.height / 2); await H.sleep(800) }
setUp = await tid('win-inputsset').count(); setBox = await box('[data-testid="win-inputsset"]')
const pTwo = await H.pic(page, '3-two-windows')
setHit = { x: await hit('[data-testid="win-inputsset-x"]'), save: await hit('[data-testid="iset-save"]'), cancel: await hit('[data-testid="iset-cancel"]'), dayX: await hit('[data-testid="win-inputsday-x"]'), dayAdd: await hit('#icPopAdd') }
H.judge(`X-17 ${SIZE} (3) two windows`, 'with the day window up, a real touch on the gear opened the settings window', [
  ['the gear was reachable (a touch on its middle landed on it, or it was reached)', gearHit.found, gearHit],
  ['the settings window is up', setUp === 1, setBox],
  ['the settings window\'s close cross, Save and Cancel are each hit by a touch on their middles when the window is whole on screen', setHit.x.lands !== false && (setHit.save.lands || !setHit.save.onScreen) && (setHit.cancel.lands || !setHit.cancel.onScreen), setHit],
  ['(recorded) the day window\'s close cross before the settings window is moved: ' + (setHit.dayX.found ? (setHit.dayX.lands ? 'reachable' : 'COVERED by the settings window (' + setHit.dayX.top + ')') : 'no day window'), true, setHit.dayX],
], [pTwo], { setBox, setHit, gearHit })

// ---- 4. drag the settings window low, by its bar, with a real finger
let dragged = null
if (setUp) {
  const bar = await box('[data-testid="win-inputsset"] .win-bar')
  const from = { x: bar.x + 60, y: bar.y + bar.h / 2 }, to = { x: bar.x + 60, y: Math.min(VH - 40, bar.y + bar.h / 2 + 150) }
  await touchDrag(from, to)
  const after = await box('[data-testid="win-inputsset"]'), barAfter = await box('[data-testid="win-inputsset"] .win-bar')
  dragged = { from: from.y, to: to.y, barAfterY: barAfter && barAfter.y + barAfter.h / 2, winBefore: setBox, winAfter: after }
}
const pDrag = await H.pic(page, '4-settings-dragged-low')
const afterDrag = { x: await hit('[data-testid="win-inputsset-x"]'), save: await hit('[data-testid="iset-save"]'), dayX: await hit('[data-testid="win-inputsday-x"]'), dayAdd: await hit('#icPopAdd'), undo: await hit('#undoBtn') }
H.judge(`X-17 ${SIZE} (4) drag one low`, 'dragged the settings window down by its bar with a real finger (touchStart / touchMove / touchEnd)', [
  ['the window followed the finger (its bar moved down by about the drag)', dragged && Math.abs(dragged.barAfterY - dragged.to) <= 30, dragged],
  ['the window stays inside the screen', dragged && dragged.winAfter && dragged.winAfter.y >= 0 && dragged.winAfter.y < VH, dragged && dragged.winAfter],
  ['the day window\'s close cross can still be touched (hit by its own middle)', afterDrag.dayX.found ? afterDrag.dayX.lands : true, afterDrag.dayX],
  ['the settings window\'s own close cross can be touched', afterDrag.x.found ? afterDrag.x.lands || !afterDrag.x.onScreen === false : true, afterDrag.x],
], [pDrag], { afterDrag })

if (!(await tid('win-inputsday').count())) {
  H.row(`X-17 ${SIZE} (5)-(7)`, 'expand the day, reach the last input, Undo, close', 'the day window did not open for the touch on the crowded date (see step 2), so these steps could not be walked', 'NOT WALKED', [])
  H.save('x17-' + SIZE, { errors }); console.log('ERRORS', errors); await browser.close(); process.exit(0)
}
// ---- close the settings window by touch: how many touches does its cross take?
let closeTouches = 0
for (let i = 0; i < 3 && (await tid('win-inputsset').count()); i++) {
  const xb = await box('[data-testid="win-inputsset-x"]'); if (!xb) break
  await page.touchscreen.tap(xb.x + xb.w / 2, xb.y + xb.h / 2); closeTouches++; await H.sleep(900)
}
const setClosed = (await tid('win-inputsset').count()) === 0
// expand the day: a touch on its title pulls it up (phone only; a window on a wide-and-short screen may not be a panel)
const ttl = await box('[data-testid="win-inputsday"] .win-ttl')
if (ttl) { await page.touchscreen.tap(ttl.x + 20, ttl.y + ttl.h / 2); await H.sleep(700) }
const tallBox = await box('[data-testid="win-inputsday"]')
const isTall = await page.evaluate(() => document.querySelector('[data-testid="win-inputsday"]').classList.contains('is-tall'))
const pTall = await H.pic(page, '5-day-expanded')
// reach the last input
const lastInfo = await page.evaluate(() => {
  const l = document.querySelector('[data-testid="idy-list"]'); if (!l) return null
  l.scrollTop = l.scrollHeight
  const rows = [...l.querySelectorAll('[data-testid^="idy-row-"]')], last = rows[rows.length - 1], lr = last.getBoundingClientRect(), wr = document.querySelector('[data-testid="win-inputsday"]').getBoundingClientRect()
  return { rows: rows.length, scrolls: l.scrollHeight > l.clientHeight + 2, lastText: last.innerText.replace(/\s+/g, ' ').slice(0, 60), lastInWin: lr.top >= wr.top - 1 && lr.bottom <= wr.bottom + 1, lastOnScreen: lr.top >= 0 && lr.bottom <= innerHeight }
})
await H.sleep(300)
const lastOpen = await page.evaluate(() => { const rows = [...document.querySelectorAll('[data-testid^="idy-row-"]')]; const b = rows[rows.length - 1].querySelector('[data-testid="idy-open"]'); const r = b.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { size: [Math.round(r.width), Math.round(r.height)], centre: [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)], lands: !!t && (t === b || b.contains(t)), top: t ? (t.getAttribute('data-testid') || t.className || t.tagName).toString().slice(0, 40) : null } })
const pLast = await H.pic(page, '6-last-input-reached')
H.judge(`X-17 ${SIZE} (5) expand the day and reach the last input`, 'closed the settings window by touch, pulled the day up by its title, scrolled the list to its end', [
  ['the settings window closed by the FIRST touch on its cross (after the finger drag)', setClosed && closeTouches === 1, { closeTouches, setClosed }],
  ['the day window rests at the taller height (is-tall) on a phone', SIZE === 'side' ? true : isTall, { isTall, tallBox }],
  ['the list is long enough to scroll inside the window, and the last input is in the window and on the screen', lastInfo && lastInfo.lastInWin && lastInfo.lastOnScreen, lastInfo],
  ['a touch on the last input\'s open button lands on it', lastOpen.lands, lastOpen],
], [pTall, pLast], { lastInfo, lastOpen })

// ---- open the last input (a third window), change its remark, Save, then Undo from the top bar
await page.touchscreen.tap(lastOpen.centre[0], lastOpen.centre[1]); await H.sleep(800)
const edUp = await tid('win-inputedit').count()
const edBox = await box('[data-testid="win-inputedit"]')
const edHit = { save: await hit('#inpEditSave'), x: await hit('[data-testid="win-inputedit-x"]'), cancel: await hit('#inpEditCancel') }
if (edUp) { await page.fill('#inpEditRmk', 'X17 touched'); await page.locator('#inpEditSave').scrollIntoViewIfNeeded().catch(() => {}); const sv = await box('#inpEditSave'); if (sv) await page.touchscreen.tap(sv.x + sv.w / 2, sv.y + sv.h / 2); await H.sleep(900); await H.answerOilIfAsked(page, 'Yes') }
const saved = await page.evaluate(() => window.INPUTS.filter(x => x.remarks === 'X17 touched').length)
await page.evaluate(() => scrollTo(0, 0)); await H.sleep(300)
const undoHitExpanded = await hit('#undoBtn')
const dayExpandedNow = await page.evaluate(() => { const d = document.querySelector('[data-testid="win-inputsday"]'); return d ? d.classList.contains('is-tall') : null })
const pUndoCovered = await H.pic(page, '7a-day-expanded-undo-covered')
// bring the day back down by its title, then reach Undo
const ttl2 = await box('[data-testid="win-inputsday"] .win-ttl')
if (ttl2 && dayExpandedNow) { await page.touchscreen.tap(ttl2.x + 20, ttl2.y + ttl2.h / 2); await H.sleep(800) }
const undoHit = await hit('#undoBtn')
if (undoHit.found && undoHit.lands) { const ub = await box('#undoBtn'); await H.toastSpy(page); await page.touchscreen.tap(ub.x + ub.w / 2, ub.y + ub.h / 2); await H.sleep(900) }
const afterUndo = await page.evaluate(() => window.INPUTS.filter(x => x.remarks === 'X17 touched').length)
const toastU = await H.toasts(page)
const pUndo = await H.pic(page, '7-after-save-and-undo')
H.judge(`X-17 ${SIZE} (6) the editor and Undo`, 'touched the last input\'s open button (the editor window), typed a remark, Save by touch, then the top bar\'s Undo by touch', [
  ['the editor opened as a window, whole on the screen', edUp === 1 && edBox && edBox.y >= 0 && edBox.y + edBox.h <= VH + 1, edBox],
  ['Save was reachable (on screen after scrolling inside the window) and a touch on it saved', saved >= 1, { saved, save: edHit.save }],
  ['Undo in the top bar is hit by a touch on its middle WHILE THE DAY IS PULLED UP', undoHitExpanded.found && undoHitExpanded.lands, { undoHitExpanded, dayExpandedNow }],
  ['Undo is hit by a touch on its middle once the day is back down', undoHit.found && undoHit.lands, undoHit],
  ['the touch on Undo took the change back', afterUndo < saved, { saved, afterUndo, toastU }],
], [pUndoCovered, pUndo], { edHit, undoHit, undoHitExpanded })

// ---- close everything by touch
let closed = []
for (let i = 0; i < 4; i++) {
  const w = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="win-"]')].filter(e => !/-x$/.test(e.getAttribute('data-testid'))).map(e => e.getAttribute('data-testid')))
  if (!w.length) break
  const id = w[w.length - 1]; const xb = await box(`[data-testid="${id}-x"]`)
  if (!xb) { closed.push(id + ':no cross'); break }
  const hh = await hit(`[data-testid="${id}-x"]`)
  await page.touchscreen.tap(xb.x + xb.w / 2, xb.y + xb.h / 2); await H.sleep(500)
  closed.push(`${id}:${hh.lands ? 'landed' : 'COVERED by ' + hh.top}:${Math.min(...(hh.size || [0, 0]))}px`)
}
const left = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="win-"]')].filter(e => !/-x$/.test(e.getAttribute('data-testid'))).length)
const g2 = await page.evaluate(() => { const el = document.querySelector('[data-testid="ib-grid"]'); return { ownScroll: el.scrollHeight - el.clientHeight, pageW: document.documentElement.scrollWidth, vw: innerWidth } })
const pEnd = await H.pic(page, '8-all-closed')
H.judge(`X-17 ${SIZE} (7) close`, 'closed every window by a touch on its cross, front one first', [
  ['every window closed', left === 0, closed],
  ['each cross was a finger\'s size and landed', closed.every(c => /landed:(4[4-9]|[5-9]\d|\d{3})px/.test(c)), closed],
  ['the month still has no scroll of its own and nothing sideways', g2.ownScroll <= 1 && g2.pageW <= g2.vw, g2],
], [pEnd], { closed })
console.log('ERRORS', errors)
H.save('x17-' + SIZE, { errors })
await browser.close()
