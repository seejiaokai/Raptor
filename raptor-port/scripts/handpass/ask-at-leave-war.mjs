// [ASK-AT-THE-CONTROL] (D1626) — the Leave War's questions (the roll-call's #41–#57), each pictured as it is today and as
// the approved card of the input window's ✕ hanging from the control pressed, at a desktop's size and his iPhone's.
//   WALK_DIR=<frozen dist> ISR_OUT=docs/img/handpass/2026-11-04-ask-at-the-control/leave-war LOOK_URL=http://localhost:4397/ \
//     node scripts/handpass/ask-at-leave-war.mjs [41 42 …]      (no numbers: every question)
// Only the look is drawn (ask-at-lib.mjs): a question that is a box today has its words and buttons MOVED into the card;
// a "press again" arm is pictured armed (today), then the sheet is opened afresh and the card hung from the unarmed
// button, its question the arm's own words — every word not on screen today is listed in the manifest's newWords.
import * as L from './isr-A-lib.mjs'
import { CARD_CSS, hangInPage, rehomeInPage } from './ask-at-lib.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const OUT = L.OUT
mkdirSync(OUT, { recursive: true })
const ONLY = process.argv.slice(2).map(Number).filter(Boolean)
const manifest = []
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

/* ---- the Leave War's own controls, as ab-lib.mjs drives them ---- */
async function lwOpen(page, iso) {
  await L.go(page, 'leavewar')
  await page.waitForSelector('[data-testid^="row-"]', { timeout: 15000 }); await sleep(500)
  const bar = page.locator('[data-testid="figures-toggle"]')
  if ((await bar.count()) && (await bar.getAttribute('aria-expanded')) === 'true') { await bar.click(); await sleep(300) }
  if (iso) {
    const m = page.locator(`[data-testid="month-${MON[+iso.slice(5, 7) - 1]}"]:visible`).first()
    if (await m.count()) { await m.click(); await sleep(900) }
    await page.locator(`[data-testid="head-${iso}"]`).waitFor({ state: 'attached', timeout: 8000 }).catch(() => {})
  }
}
async function tapCell(page, tap, id, iso) {
  const c = page.locator(`[data-testid="cell-${id}-${iso}"]`).first()
  if (!(await c.count())) throw new Error(`premise: no box for ${id} on ${iso}`)
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  const at = await c.evaluate(e => { const b = e.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2; const h = document.elementFromPoint(x, y); return { x, y, ok: !!h && (h === e || e.contains(h)) } })
  if (!at.ok) throw new Error(`premise: ${id} ${iso} is covered`)
  if (tap) await page.touchscreen.tap(at.x, at.y); else await page.mouse.click(at.x, at.y)
  await sleep(700)
}
const sheetSel = '.bidsheet[role="dialog"]'
async function press(page, tap, sel) {
  const b = page.locator(sel).filter({ visible: true }).last()
  if (!(await b.count())) throw new Error('premise: nothing to press — ' + sel)
  await b.scrollIntoViewIfNeeded().catch(() => {})
  if (tap) await b.tap(); else await b.click()
  await sleep(tap ? 650 : 250)
}
async function closeSheets(page) {
  for (let i = 0; i < 4; i++) {
    const x = page.locator(`${sheetSel} button.x:visible`).last()
    if (await x.count()) { await x.click().catch(() => {}); await sleep(350); continue }
    break
  }
}
const textOf = (page, sel) => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().height > 0); return e ? (e.textContent || '').replace(/\s+/g, ' ').trim() : null }, sel)
/* a neutral spot, so no control is left focused or hovered before a picture */
async function settle(page, tap) {
  await page.evaluate(() => { const a = document.activeElement; if (a && a !== document.body) a.blur() })
  if (!tap) await page.mouse.move(2, 2)
  await sleep(150)
}
/* the desktop clip: the control, the question's box and the sheet or window they sit in, padded 40px, inside the screen */
async function clipOf(page, sels, extraTop = 0) {
  return page.evaluate(([sels, extraTop]) => {
    const rs = []
    for (const s of sels) { const e = [...document.querySelectorAll(s)].filter(x => { const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0 }).pop(); if (e) rs.push(e.getBoundingClientRect()) }
    if (!rs.length) return null
    const l = Math.max(0, Math.min(...rs.map(r => r.left)) - 40), t = Math.max(0, Math.min(...rs.map(r => r.top)) - 40 - extraTop)
    const r = Math.min(innerWidth, Math.max(...rs.map(r => r.right)) + 40), b = Math.min(innerHeight, Math.max(...rs.map(r => r.bottom)) + 40)
    return { x: Math.round(l), y: Math.round(t), width: Math.round(r - l), height: Math.round(b - t) }
  }, [sels, extraTop])
}
async function picture(page, size, n, which, clip) {
  await settle(page, size === 'phone')
  const f = `${String(n).padStart(2, '0')}-${size}-${which}.png`
  if (size === 'desktop' && clip) await page.screenshot({ path: join(OUT, f), clip })
  else await page.screenshot({ path: join(OUT, f) })
  return f
}
const ring = (page, sel) => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].filter(x => x.getBoundingClientRect().height > 0).pop(); if (e) e.classList.add('aq-ring'); return !!e }, sel)
const unring = page => page.evaluate(() => document.querySelectorAll('.aq-ring').forEach(e => e.classList.remove('aq-ring')))
/* the card's colours, read inside the Leave War's own page (its stylesheet is scoped under #page-leavewar) */
const cardLook = page => page.evaluate(() => { const c = document.querySelector('.aq-card'); if (!c) return null; const cs = getComputedStyle(c); const b = [...c.querySelectorAll('button')].map(x => { const s = getComputedStyle(x); return `${x.textContent.trim()}: ${s.backgroundColor} / ${s.color} / ${s.borderColor} / ${s.fontSize}` }); return { bg: cs.backgroundColor, border: cs.borderColor, ink: getComputedStyle(c.querySelector('.aq-q')).color, inPage: !!c.closest('#page-leavewar'), btns: b } })

async function session(size) {
  const s = await L.session(size, 'ad')
  await s.page.addStyleTag({ content: CARD_CSS })
  return s
}

/* ---------------------------------------------------------------- the questions ---------------------------------------- */
const Q = {}

/* #41 — the one-day sheet's Delete on a day that also holds an OIL award: a note, and the chip turns "Delete — sure?" */
Q[41] = async (size) => {
  const n = 41, ID = 'slipway', ISO = '2026-03-14'
  const { page, tap } = await session(size)
  await lwOpen(page, ISO); await tapCell(page, tap, ID, ISO)
  await page.locator(`${sheetSel} [data-testid="bid-clear"]`).waitFor({ timeout: 5000 })
  await press(page, tap, `${sheetSel} [data-testid="bid-clear"]`)
  const note = await textOf(page, `${sheetSel} [data-testid="span-note"], ${sheetSel} .note.warn`)
  if (!note || !/OIL award/.test(note)) throw new Error('premise: the award note did not come — ' + note)
  await ring(page, `${sheetSel} [data-testid="bid-clear"]`)
  const clip = await clipOf(page, [sheetSel])
  const today = await picture(page, size, n, 'today', clip)
  await unring(page); await closeSheets(page)
  await tapCell(page, tap, ID, ISO)
  const q = note.replace(/\s*—\s*tap Delete again to go ahead\.?$/, '.')
  const m = await page.evaluate(hangInPage, [`${sheetSel} [data-testid="bid-clear"]`, { q: { text: q }, btns: [{ t: 'Delete', cls: 'abtn danger' }, { t: 'Cancel', cls: 'abtn' }], safe: 'Cancel' }])
  const look = await cardLook(page)
  const card = await picture(page, size, n, 'card', clip)
  await page.context().close()
  return { today, card, measures: m, look, words: { today: note, card: q }, newWords: ['the card drops "— tap Delete again to go ahead"', 'Cancel (the safe answer; today the arm has none — a tap elsewhere or the ✕ drops it)'] }
}

/* a drag-selection, the way each device makes one: the mouse pressed and moved past its slop on a desktop; on the phone a
   finger HELD (180ms arms it) and slid, then lifted — a hold-and-slide sends no trailing tap (rw-w3-08b-phone-move.mjs) */
async function dragSel(page, tap, id, from, to) {
  const c = page.locator(`[data-testid="cell-${id}-${from}"]`).first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(350)
  const pt = d => page.evaluate(s => { const b = document.querySelector(s).getBoundingClientRect(); return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) } }, `[data-testid="cell-${id}-${d}"]`)
  const a = await pt(from), b = await pt(to)
  if (tap) {
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: a.x, y: a.y, id: 7 }] })
    await sleep(450)
    for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: Math.round(a.x + (b.x - a.x) * i / 8), y: Math.round(a.y + (b.y - a.y) * i / 8), id: 7 }] }); await sleep(30) }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  } else {
    await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move(a.x + 8, a.y)
    await page.mouse.move(b.x, b.y, { steps: 6 }); await page.mouse.up()
  }
  await sleep(900)
  await page.locator('[data-testid="select-sheet"]').waitFor({ timeout: 5000 })
}
const selSheet = '[data-testid="select-sheet"]'
async function closeSel(page) {
  const x = page.locator(`${selSheet} button.x:visible`).first()
  if (await x.count()) { await x.click().catch(() => {}); await sleep(400) } else { await page.keyboard.press('Escape'); await sleep(400) }
}

/* #42 — the drag-selection sheet's Delete over a block that holds entries: a note, and the chip turns "Delete — sure?" */
Q[42] = async (size) => {
  const n = 42, ID = 'slash', A = '2026-02-02', B = '2026-02-03'
  const { page, tap } = await session(size)
  await lwOpen(page, A); await dragSel(page, tap, ID, A, B)
  await press(page, tap, `${selSheet} [data-testid="sel-delete"]`)
  const note = await textOf(page, `${selSheet} [data-testid="sel-note"]`)
  if (!note || !/Tap Delete again/.test(note)) throw new Error('premise: the delete question did not come — ' + note)
  await ring(page, `${selSheet} [data-testid="sel-delete"]`)
  const clip = await clipOf(page, [selSheet])
  const today = await picture(page, size, n, 'today', clip)
  await unring(page); await closeSel(page)
  await dragSel(page, tap, ID, A, B)
  const q = note.replace(/\s*Tap Delete again\.?$/, '')
  const m = await page.evaluate(hangInPage, [`${selSheet} [data-testid="sel-delete"]`, { q: { text: q }, btns: [{ t: 'Delete', cls: 'abtn danger' }, { t: 'Cancel', cls: 'abtn' }], safe: 'Cancel' }])
  const look = await cardLook(page)
  const card = await picture(page, size, n, 'card', clip)
  await page.context().close()
  return { today, card, measures: m, look, words: { today: note, card: q }, newWords: ['the card drops "Tap Delete again."', 'Cancel (the safe answer; today the arm has none)'] }
}

/* #43 — the one-day sheet: a leave that takes the balance below zero. The first press writes nothing and says so; the same
   leave again goes ahead. Ranger's CL already stands at −1. */
Q[43] = async (size) => {
  const n = 43, ID = 'bane', ISO = '2026-02-04', CHIP = `${sheetSel} [data-testid="bid-CL"]`
  const { page, tap } = await session(size)
  await lwOpen(page, ISO); await tapCell(page, tap, ID, ISO)
  await press(page, tap, CHIP)
  const note = await textOf(page, `${sheetSel} [data-testid="span-note"]`)
  if (!note || !/Tap the same leave again/.test(note)) throw new Error('premise: the below-zero question did not come — ' + note)
  await ring(page, CHIP)
  const clip = await clipOf(page, [sheetSel])
  const today = await picture(page, size, n, 'today', clip)
  await unring(page); await closeSheets(page)
  await tapCell(page, tap, ID, ISO)
  const q = note.replace(/\s*Tap the same leave again to go ahead\.?$/, '')
  const m = await page.evaluate(hangInPage, [CHIP, { q: { text: q }, btns: [{ t: 'Take CL', cls: 'abtn' }, { t: 'Cancel', cls: 'abtn' }], safe: 'Cancel' }])
  const look = await cardLook(page)
  const card = await picture(page, size, n, 'card', clip)
  await page.context().close()
  return { today, card, measures: m, look, words: { today: note, card: q }, newWords: ['the card drops "Tap the same leave again to go ahead."', '"Take CL" — the go-ahead (today: the same leave chip pressed again); plain, not red: nothing is lost', 'Cancel (the safe answer)'] }
}

/* #44 — the same below-zero question on the drag-selection sheet (Drifter's FCL stands at 0: three days take him to −3) */
Q[44] = async (size) => {
  const n = 44, ID = 'slipway', A = '2026-01-06', B = '2026-01-08', CHIP = `${selSheet} [data-testid="sel-FCL"]`
  const { page, tap } = await session(size)
  await lwOpen(page, A); await dragSel(page, tap, ID, A, B)
  await press(page, tap, CHIP)
  const note = await textOf(page, `${selSheet} [data-testid="sel-note"]`)
  if (!note || !/Tap the same leave again/.test(note)) throw new Error('premise: the below-zero question did not come — ' + note)
  await ring(page, CHIP)
  const clip = await clipOf(page, [selSheet])
  const today = await picture(page, size, n, 'today', clip)
  await unring(page); await closeSel(page)
  await dragSel(page, tap, ID, A, B)
  const q = note.replace(/\s*Tap the same leave again to go ahead\.?$/, '')
  const m = await page.evaluate(hangInPage, [CHIP, { q: { text: q }, btns: [{ t: 'Take FCL', cls: 'abtn' }, { t: 'Cancel', cls: 'abtn' }], safe: 'Cancel' }])
  const look = await cardLook(page)
  const card = await picture(page, size, n, 'card', clip)
  await page.context().close()
  return { today, card, measures: m, look, words: { today: note, card: q }, newWords: ['the card drops "Tap the same leave again to go ahead."', '"Take FCL" — the go-ahead', 'Cancel'] }
}

/* ⋯ then one of its items (MoreButton) */
async function more(page, tap, moreSel, itemTid) {
  await press(page, tap, moreSel)
  await press(page, tap, `[data-testid="${itemTid}"]`)
}
const csOf = (page, id) => page.evaluate(id => (window.PEOPLE[id] || {}).cs || id, id)

/* #45 — the one-day sheet's ⋯ → Post out → the Delete outcome → Post out: the button turns "Tap again to delete X" */
Q[45] = async (size) => {
  const n = 45, ID = 'wolf', ISO = '2026-11-20', BTN = `${sheetSel} [data-testid="po-confirm"]`
  const { page, tap } = await session(size)
  const cs = await csOf(page, ID)
  const open = async () => {
    await tapCell(page, tap, ID, ISO)
    await more(page, tap, `${sheetSel} [data-testid="bid-more"]`, 'bid-postout')
    await press(page, tap, `${sheetSel} [data-testid="po-delete"]`)
  }
  await lwOpen(page, ISO); await open()
  const line = await textOf(page, `${sheetSel} [data-testid="po-line"]`)
  await press(page, tap, BTN)
  const armed = await textOf(page, BTN)
  if (!/Tap again to delete/.test(armed || '')) throw new Error('premise: the Delete posting did not arm — ' + armed)
  await ring(page, BTN)
  const clip = await clipOf(page, [sheetSel])
  const today = await picture(page, size, n, 'today', clip)
  await unring(page); await closeSheets(page)
  await open()
  const q = `Delete ${cs}?`
  const m = await page.evaluate(hangInPage, [BTN, { q: { text: q }, sub: line ? [{ text: line }] : [], btns: [{ t: 'Delete', cls: 'abtn danger' }, { t: 'Cancel', cls: 'abtn' }], safe: 'Cancel' }])
  const look = await cardLook(page)
  const card = await picture(page, size, n, 'card', clip)
  await page.context().close()
  return { today, card, measures: m, look, words: { today: `${armed} (the button); the line above it: ${line}`, card: `${q} / ${line}` }, newWords: [`"${q}" — the card's question (today only the button's "${armed}")`, 'Delete and Cancel — the answers (today the same button pressed again; no Cancel)', 'the line under the question is today\'s outcome line, moved'] }
}

/* #46 — the same on the drag-selection sheet: one man's empty block → ⋯ → Post out → Delete → Post out */
Q[46] = async (size) => {
  const n = 46, ID = 'stuff', A = '2026-11-18', B = '2026-11-20', BTN = `${selSheet} [data-testid="sel-po-confirm"]`
  const { page, tap } = await session(size)
  const cs = await csOf(page, ID)
  const open = async () => {
    await dragSel(page, tap, ID, A, B)
    await more(page, tap, `${selSheet} [data-testid="sel-more"]`, 'sel-postout')
    await press(page, tap, `${selSheet} [data-testid="sel-po-delete"]`)
  }
  await lwOpen(page, A); await open()
  const line = await textOf(page, `${selSheet} [data-testid="sel-po-line"]`)
  await press(page, tap, BTN)
  const armed = await textOf(page, BTN)
  if (!/Tap again to delete/.test(armed || '')) throw new Error('premise: the Delete posting did not arm — ' + armed)
  await ring(page, BTN)
  const clip = await clipOf(page, [selSheet])
  const today = await picture(page, size, n, 'today', clip)
  await unring(page); await closeSel(page)
  await open()
  const q = `Delete ${cs}?`
  const m = await page.evaluate(hangInPage, [BTN, { q: { text: q }, sub: line ? [{ text: line }] : [], btns: [{ t: 'Delete', cls: 'abtn danger' }, { t: 'Cancel', cls: 'abtn' }], safe: 'Cancel' }])
  const look = await cardLook(page)
  const card = await picture(page, size, n, 'card', clip)
  await page.context().close()
  return { today, card, measures: m, look, words: { today: `${armed} (the button); the line above it: ${line}`, card: `${q} / ${line}` }, newWords: [`"${q}"`, 'Delete and Cancel'] }
}

/* a man posted out through the one-day sheet (outcome by its chip), then his posted-out day tapped: the Posted out sheet */
async function postOut(page, tap, id, iso, outcome) {
  await tapCell(page, tap, id, iso)
  await more(page, tap, `${sheetSel} [data-testid="bid-more"]`, 'bid-postout')
  await press(page, tap, `${sheetSel} [data-testid="po-${outcome}"]`)
  await press(page, tap, `${sheetSel} [data-testid="po-confirm"]`)
  if (outcome === 'delete') await press(page, tap, `${sheetSel} [data-testid="po-confirm"]`)
  await sleep(600); await closeSheets(page)
}
const poSheet = '[data-testid="postout-sheet"]'

/* a card that rises above its sheet is cut by the sheet's own edge (the sheet clips what is inside it): moved out to the
   page at the same place on screen — the build must do the same (named in the manifest) */
const unclip = page => page.evaluate(() => { const c = document.querySelector('.aq-card'); if (!c) return null; const r = c.getBoundingClientRect(); const home = document.querySelector('#page-leavewar') || document.body; home.append(c); c.style.left = r.left + 'px'; c.style.top = r.top + 'px'; const r2 = c.getBoundingClientRect(); return { moved: Math.round(r2.left - r.left) + ',' + Math.round(r2.top - r.top) } })

/* #47 — the Posted out sheet's Delete chip: a row button "Tap again to delete X" appears under the chips */
Q[47] = async (size) => {
  const n = 47, ID = 'dirty', ISO = '2026-11-20', CHIP = `${poSheet} [data-testid="postout-delete"]`
  const { page, tap } = await session(size)
  const cs = await csOf(page, ID)
  await lwOpen(page, ISO); await postOut(page, tap, ID, ISO, 'overseas')
  await tapCell(page, tap, ID, ISO); await page.locator(poSheet).waitFor({ timeout: 5000 })
  await press(page, tap, CHIP)
  const go = await textOf(page, `${poSheet} [data-testid="postout-delete-go"]`)
  if (!/Tap again to delete/.test(go || '')) throw new Error('premise: the Delete row did not come — ' + go)
  const line = await textOf(page, `${poSheet} [data-testid="postout-line"]`)
  await ring(page, CHIP)
  /* the card rises above the chip, over the sheet's top: the clip takes in the room above it */
  const clip = await clipOf(page, [poSheet], 120)
  const today = await picture(page, size, n, 'today', clip)
  await unring(page); await closeSheets(page)
  await tapCell(page, tap, ID, ISO); await page.locator(poSheet).waitFor({ timeout: 5000 })
  const q = `Delete ${cs}?`
  const m = await page.evaluate(hangInPage, [CHIP, { q: { text: q }, sub: line ? [{ text: line }] : [], btns: [{ t: 'Delete', cls: 'abtn danger' }, { t: 'Cancel', cls: 'abtn' }], safe: 'Cancel' }])
  const moved = await unclip(page)
  const look = await cardLook(page)
  const card = await picture(page, size, n, 'card', clip)
  await page.context().close()
  return { today, card, measures: m, look, words: { today: `${go} (a new row under the chips); the line: ${line}`, card: `${q} / ${line}` }, newWords: [`"${q}"`, 'Delete and Cancel (today: the row button "' + go + '", and the Delete chip tapped again backs out)'], notes: 'BUILD NOTE: hung above the chip the card rises over the sheet top edge, which clips it — it must be drawn outside the sheet (the drawing moves it out to the page, same place on screen). Today the Delete CHIP lights and the line changes to what a Delete does; the go-ahead is a separate row button below — the card replaces that row' }
}

/* #48 — the Posted out sheet of a DELETE posting: a date picked of today or earlier would delete him now — the same row
   button appears. Raised by picking a day in the date box's calendar: the card hangs from the date box. */
Q[48] = async (size) => {
  const n = 48, ID = 'wolf', ISO = '2026-11-20', NOW = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` })(), BOX = `${poSheet} [data-testid="postout-date"]`
  const { page, tap } = await session(size)
  const cs = await csOf(page, ID)
  await lwOpen(page, ISO); await postOut(page, tap, ID, ISO, 'delete')
  const pick = async () => {
    await tapCell(page, tap, ID, ISO); await page.locator(poSheet).waitFor({ timeout: 5000 })
    await press(page, tap, BOX)
    await press(page, tap, `[data-testid="dcal-day-${NOW}"]`)
  }
  await pick()
  const go = await textOf(page, `${poSheet} [data-testid="postout-delete-go"]`)
  if (!/Tap again to delete/.test(go || '')) throw new Error('premise: the Delete row did not come on a date of today — ' + go)
  const line = await textOf(page, `${poSheet} [data-testid="postout-line"]`)
  await ring(page, BOX)
  const clip = await clipOf(page, [poSheet])
  const today = await picture(page, size, n, 'today', clip)
  await unring(page); await closeSheets(page)
  /* the card is drawn on the sheet as it stands after the pick (the box shows the picked date): its row button is hidden,
     never restyled, so the card stands where the question is asked */
  await pick()
  const q = `Delete ${cs} now?`
  const m = await page.evaluate(hangInPage, [BOX, { q: { text: q }, sub: line ? [{ text: line }] : [], btns: [{ t: 'Delete', cls: 'abtn danger' }, { t: 'Cancel', cls: 'abtn' }], hide: `${poSheet} [data-testid="postout-delete-go"]`, safe: 'Cancel' }])
  await page.evaluate(s => { const e = document.querySelector(s); if (e) e.closest('.bidsheet-row').style.setProperty('display', 'none', 'important') }, `${poSheet} [data-testid="postout-delete-go"]`)
  const look = await cardLook(page)
  const card = await picture(page, size, n, 'card', clip)
  await page.context().close()
  return { today, card, measures: m, look, words: { today: `${go} (a row button); the line: ${line}`, card: `${q} / ${line}` }, newWords: [`"${q}"`, 'Delete and Cancel (today: the row button; Cancel = a chip tapped, which puts the date back)'], notes: `raised by picking ${NOW} (today) in the date box's calendar — the card hangs from the date box; the hidden row is today's "Tap again" button` }
}

/* a desktop clip round one control: the screen's width (or its window's), `above` px over it and `below` px under it */
async function clipAround(page, sel, above = 140, below = 240, inSel = null) {
  return page.evaluate(([sel, above, below, inSel]) => {
    const e = [...document.querySelectorAll(sel)].filter(x => x.getBoundingClientRect().height > 0).pop(); if (!e) return null
    const r = e.getBoundingClientRect(); const box = inSel ? (e.closest(inSel) || document.body).getBoundingClientRect() : { left: 0, right: innerWidth }
    const l = Math.max(0, box.left - 20), rr = Math.min(innerWidth, box.right + 20)
    const t = Math.max(0, r.top - above), b = Math.min(innerHeight, r.bottom + below)
    return { x: Math.round(l), y: Math.round(t), width: Math.round(rr - l), height: Math.round(b - t) }
  }, [sel, above, below, inSel])
}

/* #49 — Approvals → "Approve all N": the button turns amber, "Approve N — tap again" (D1431 keeps it amber) */
Q[49] = async (size) => {
  const n = 49, BTN = '[data-testid="appr-approve-all"]'
  const { page, tap } = await session(size)
  await lwOpen(page); await press(page, tap, '[data-testid="lw-tab-approvals"]'); await page.locator(BTN).waitFor({ timeout: 8000 })
  const rest = await textOf(page, BTN)
  await press(page, tap, BTN)
  const armed = await textOf(page, BTN)
  if (!/tap again/.test(armed || '')) throw new Error('premise: Approve all did not arm — ' + armed)
  await ring(page, BTN)
  const clip = await clipAround(page, BTN, 160, 260)
  const today = await picture(page, size, n, 'today', clip)
  await unring(page)
  await press(page, tap, '[data-testid="lw-tab-grid"]'); await press(page, tap, '[data-testid="lw-tab-approvals"]'); await page.locator(BTN).waitFor()
  if (/tap again/.test(await textOf(page, BTN))) throw new Error('premise: Approve all is still armed after leaving the tab')
  const k = (rest.match(/\d+/) || ['?'])[0]
  const q = `Approve all ${k} requests?`
  const m = await page.evaluate(hangInPage, [BTN, { q: { text: q }, btns: [{ t: 'Approve', cls: 'abtn' }, { t: 'Cancel', cls: 'abtn' }], safe: 'Cancel' }])
  const look = await cardLook(page)
  const card = await picture(page, size, n, 'card', clip)
  await page.context().close()
  return { today, card, measures: m, look, words: { today: armed, card: q }, newWords: [`"${q}"`, 'Approve (plain, not red: nothing is lost) and Cancel'], notes: 'D1431 rules the armed button stays amber, "so it is plain that the next tap decides many requests at once" — a card replaces that armed state; the button itself would stay "Approve all N".' }
}

/* #50 — phone only: a drag-selection's Move, then a tap on a landing day — the slim bar asks "Move N entries here?".
   On a desktop the click lands the move at once and asks nothing. */
Q[50] = async (size) => {
  if (size === 'desktop') return { skip: 'a desktop click on the landing day moves at once — no question is put; nothing to draw' }
  const n = 50, ID = 'slash', A = '2026-02-02', B = '2026-02-03', TO = '2026-02-10', LAND = `[data-testid="cell-${ID}-${TO}"]`
  const { page, tap } = await session(size)
  const stage = async () => {
    await lwOpen(page, A); await dragSel(page, tap, ID, A, B)
    await press(page, tap, `${selSheet} [data-testid="sel-move"]`)
    await page.locator('[data-testid="move-banner"]').waitFor({ timeout: 5000 })
    await page.locator(LAND).evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
    const p = await page.locator(LAND).boundingBox(); await page.touchscreen.tap(p.x + p.width / 2, p.y + p.height / 2); await sleep(700)
    await page.locator('[data-testid="move-confirm"]').waitFor({ timeout: 5000 })
  }
  await stage()
  const msg = await textOf(page, '[data-testid="move-banner"] .mv-msg')
  await ring(page, LAND)
  const today = await picture(page, size, n, 'today')
  await unring(page)
  const m = await page.evaluate(hangInPage, [LAND, { q: '[data-testid="move-banner"] .mv-msg', btns: ['[data-testid="move-confirm"]', '[data-testid="move-cancel"]'], hide: '[data-testid="move-banner"]', safe: 'Cancel' }])
  const look = await cardLook(page)
  const card = await picture(page, size, n, 'card')
  await page.context().close()
  return { today, card, measures: m, look, words: { today: msg, card: msg }, newWords: [], notes: 'the card takes the slim bar\'s question and its Confirm / Cancel, moved; the bar is hidden in the drawing — before the tap it reads "Tap a day to move N entries", which would stay a bar (it asks nothing)' }
}

/* #51 — phone only: an event's Move…, then a tap on a landing day — "Move this event here?" */
Q[51] = async (size) => {
  if (size === 'desktop') return { skip: 'a desktop click on the landing day moves the event at once — no question; nothing to draw' }
  const n = 51, FROM = '2026-02-17', TO = '2026-02-24', LAND = `[data-testid="event-0-${TO}"]`
  const { page, tap } = await session(size)
  await lwOpen(page, FROM)
  const band = page.locator(`[data-testid="event-0-${FROM}"], [data-testid="event-band-0-${FROM}"]`).filter({ hasText: 'PH' }).first()
  await band.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  await band.tap(); await sleep(500)
  if (await page.locator('[data-testid="event-peek-edit"]:visible').count()) await press(page, tap, '[data-testid="event-peek-edit"]')
  await press(page, tap, '[data-testid="event-move"]')
  await page.locator('[data-testid="event-move-banner"]').waitFor({ timeout: 5000 })
  await page.locator(LAND).evaluate(e => e.scrollIntoView({ block: 'nearest', inline: 'center' })); await sleep(300)
  const p = await page.locator(LAND).boundingBox(); await page.touchscreen.tap(p.x + p.width / 2, p.y + p.height / 2); await sleep(700)
  await page.locator('[data-testid="event-move-confirm"]').waitFor({ timeout: 5000 })
  const msg = await textOf(page, '[data-testid="event-move-banner"] .mv-msg')
  await ring(page, LAND)
  const today = await picture(page, size, n, 'today')
  await unring(page)
  const m = await page.evaluate(hangInPage, [LAND, { q: '[data-testid="event-move-banner"] .mv-msg', btns: ['[data-testid="event-move-confirm"]', '[data-testid="event-move-cancel"]'], hide: '[data-testid="event-move-banner"]', safe: 'Cancel' }])
  const look = await cardLook(page)
  const card = await picture(page, size, n, 'card')
  await page.context().close()
  return { today, card, measures: m, look, words: { today: msg, card: msg }, newWords: [], notes: 'as #50: the bar\'s question and buttons moved into the card; before the tap the bar still says "Tap a day to move this event"' }
}

/* #52 — ⚙ → Events… → the ✕ on a line: its kind's column reads "Delete — sure?" and the ✕ turns red (D1515, D1516) */
Q[52] = async (size) => {
  const n = 52
  const { page, tap } = await session(size)
  await lwOpen(page)
  await press(page, tap, '[data-testid="settings-open"]'); await press(page, tap, '[data-testid="settings-events"]')
  await page.locator('[data-testid="events-sheet"]').waitFor({ timeout: 5000 })
  const key = await page.evaluate(() => { const x = [...document.querySelectorAll('[data-testid^="evdel-"]')].find(b => b.getBoundingClientRect().height > 0); return x ? x.getAttribute('data-testid').slice(6) : null })
  if (!key) throw new Error('premise: no event line with a ✕')
  const X = `[data-testid="evdel-${key}"]`
  await press(page, tap, X)
  const kind = await textOf(page, `[data-testid="evkind-${key}"]`)
  const said = await page.evaluate(() => (document.querySelector('[data-testid="events-said"]') || {}).textContent || '')
  if (!/sure/.test(kind || '')) throw new Error('premise: the ✕ did not arm — ' + kind)
  await ring(page, X)
  const clip = await clipOf(page, ['[data-testid="events-sheet"]'])
  /* the armed ✕ drops on blur: no settle() blur before this picture */
  const f = `${n}-${size}-today.png`; if (size === 'desktop' && clip) await page.screenshot({ path: join(OUT, f), clip }); else await page.screenshot({ path: join(OUT, f) })
  await unring(page)
  await page.evaluate(() => document.activeElement && document.activeElement.blur()); await sleep(300)
  if (/sure/.test(await textOf(page, `[data-testid="evkind-${key}"]`) || '')) throw new Error('premise: still armed')
  const q = said.replace(/\s*Press again to delete\.?$/, '')
  const m = await page.evaluate(hangInPage, [X, { q: { text: q }, btns: [{ t: 'Delete', cls: 'abtn danger' }, { t: 'Cancel', cls: 'abtn' }], safe: 'Cancel' }])
  const look = await cardLook(page)
  const card = await picture(page, size, n, 'card', clip)
  await page.context().close()
  return { today: f, card, measures: m, look, words: { today: `the line's kind column: "${kind}"; read aloud only (screen reader): "${said}"`, card: q }, newWords: ['the card\'s question is today\'s spoken-only sentence, shown, without "Press again to delete."', 'Delete and Cancel'], notes: 'D1516 rules "the ✕ asks once — its first press arms it, a second deletes" (and D1515 the in-place "Delete — sure?") — the card replaces a ruled design: his to confirm' }
}

/* #53 — a Manning row's name → its sheet → Edit counter… → Delete counter: "Really delete?" (D677 keeps this as ruled) */
Q[53] = async (size) => {
  const n = 53, BTN = '[data-testid="cform-delete"]'
  const { page, tap } = await session(size)
  await lwOpen(page)
  const open = async () => {
    if (!(await page.locator('[data-testid="manning-info-ip"]:visible').count())) await press(page, tap, '[data-testid="counts-toggle"]')
    await press(page, tap, '[data-testid="manning-info-ip"]')
    await press(page, tap, '[data-testid="counter-edit-open"]')
    await page.locator(BTN).waitFor({ timeout: 5000 })
  }
  await open()
  await press(page, tap, BTN)
  const armed = await textOf(page, BTN)
  if (!/Really delete/.test(armed || '')) throw new Error('premise: Delete counter did not arm — ' + armed)
  await ring(page, BTN)
  const win = await page.evaluate(s => { const e = document.querySelector(s); const w = e && e.closest('[role=dialog], .bidsheet, .cform, form'); return w ? (w.getAttribute('data-testid') ? `[data-testid="${w.getAttribute('data-testid')}"]` : null) : null }, BTN)
  const clip = win ? await clipOf(page, [win]) : await clipAround(page, BTN, 300, 160)
  const today = await picture(page, size, n, 'today', clip)
  await unring(page)
  await press(page, tap, '[data-testid="cform-cancel"]'); await sleep(300)
  await page.keyboard.press('Escape'); await sleep(300)
  await open()
  const q = 'Delete the IP counter?'
  const m = await page.evaluate(hangInPage, [BTN, { q: { text: q }, btns: [{ t: 'Delete', cls: 'abtn danger' }, { t: 'Cancel', cls: 'abtn' }], safe: 'Cancel' }])
  const look = await cardLook(page)
  const card = await picture(page, size, n, 'card', clip)
  await page.context().close()
  return { today, card, measures: m, look, words: { today: armed, card: q }, newWords: [`"${q}"`, 'Delete and Cancel'], notes: 'D677 (8 Oct 26): "Delete counter" in the counter\'s own window still asks "Really delete?" — left as ruled, never a finding (design guide). Drawn because the roll-call lists it; whether D1626 reaches it is his to say.' }
}

/* #54 — ⚙ → ↺ Reset order, once the roster has been arranged by hand: "Really reset?" */
Q[54] = async (size) => {
  const n = 54, BTN = '[data-testid="roster-reset-order"]'
  const { page, tap } = await session(size)
  await lwOpen(page, '2026-01-05')
  /* an order arranged by hand, as a person makes one: Rearrange on, Ridge's row dragged above Reaper's, Done */
  await press(page, tap, '[data-testid="settings-open"]'); await press(page, tap, '[data-testid="settings-rearrange"]'); await sleep(500)
  if (await page.locator('[data-testid="settings-close"]:visible').count()) await press(page, tap, '[data-testid="settings-close"]')
  await page.locator('[data-testid="row-dice"]').evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
  const g = await page.locator('[data-testid="drag-razer"]').boundingBox(), tg = await page.locator('[data-testid="row-dice"]').boundingBox()
  if (!g) throw new Error('premise: Rearrange is not on (no grip)')
  const x = g.x + g.width / 2, y0 = g.y + g.height / 2, y1 = tg.y + 4
  if (tap) {
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] }); await sleep(90)
    for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + 40, y: y0 + (y1 - y0) * i / 8 }] })
    await sleep(120); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  } else {
    await page.mouse.move(x, y0); await page.mouse.down(); await page.mouse.move(x, y0 - 6, { steps: 3 }); await page.mouse.move(x + 40, y1, { steps: 8 }); await sleep(100); await page.mouse.up()
  }
  await sleep(600)
  await press(page, tap, '[data-testid="roster-arrange"]'); await sleep(400)
  const open = async () => { await press(page, tap, '[data-testid="settings-open"]'); await page.locator(BTN).scrollIntoViewIfNeeded(); await sleep(250) }
  await open()
  if (await page.locator(BTN).isDisabled()) throw new Error('premise: Reset order is greyed — the drag made no hand order')
  await press(page, tap, BTN)
  const armed = await textOf(page, BTN)
  if (!/Really reset/.test(armed || '')) throw new Error('premise: Reset order did not arm — ' + armed)
  const title = await page.locator(BTN).getAttribute('title')
  await ring(page, BTN)
  const clip = await clipOf(page, ['[data-testid="settings-sheet"]', BTN])
  const today = await picture(page, size, n, 'today', clip)
  await unring(page)
  await press(page, tap, '[data-testid="settings-close"]'); await open()
  const q = 'Reset the order?'
  const m = await page.evaluate(hangInPage, [BTN, { q: { text: q }, sub: title ? [{ text: title.replace(/^Put/, 'Puts') }] : [], btns: [{ t: 'Reset', cls: 'abtn danger' }, { t: 'Cancel', cls: 'abtn' }], safe: 'Cancel' }])
  const look = await cardLook(page)
  const card = await picture(page, size, n, 'card', clip)
  await page.context().close()
  return { today, card, measures: m, look, words: { today: armed, card: `${q} / ${title}` }, newWords: [`"${q}"`, 'the line under it is the button\'s own hover text (today seen only on a desktop\'s hover), "Put" made "Puts"', 'Reset and Cancel'], notes: 'D274 approved Reset order as built (27 Sep 26)' }
}

/* #55 — Balances → Grades… → ✕ on a grade people hold: a row under it, "n people hold X: they become No grade" Delete / Keep */
Q[55] = async (size) => {
  const n = 55
  const { page, tap } = await session(size)
  await lwOpen(page)
  await press(page, tap, '[data-testid="lw-tab-balances"]'); await press(page, tap, '[data-testid="bal-grades"]')
  await page.locator('[data-testid="grades-sheet"]').waitFor({ timeout: 5000 })
  const gid = await page.evaluate(() => { const r = [...document.querySelectorAll('[data-testid^="grade-holds-"]')].find(e => /[1-9]/.test(e.textContent)); return r ? r.getAttribute('data-testid').slice(12) : null })
  if (!gid) throw new Error('premise: no grade is held by anyone')
  const X = `[data-testid="grade-del-${gid}"]`
  await press(page, tap, X)
  await page.locator('[data-testid="grade-ask"]').waitFor({ timeout: 4000 })
  const ask = await textOf(page, '[data-testid="grade-ask"] span')
  await ring(page, X)
  const clip = await clipOf(page, ['[data-testid="grades-sheet"]'])
  /* the ask takes the keyboard (autoFocus on Delete): picture it as it stands, no blur */
  const f = `${n}-${size}-today.png`; if (!tap) await page.mouse.move(2, 2); if (size === 'desktop' && clip) await page.screenshot({ path: join(OUT, f), clip }); else await page.screenshot({ path: join(OUT, f) })
  await unring(page)
  const m = await page.evaluate(hangInPage, [X, { q: '[data-testid="grade-ask"] span', btns: ['[data-testid="grade-del-sure"]', '[data-testid="grade-del-keep"]'], hide: '[data-testid="grade-ask"]', safe: 'Keep' }])
  await page.evaluate(() => { const a = document.querySelector('[data-testid="grade-ask"]'); if (a) a.style.setProperty('display', 'none', 'important') })
  const look = await cardLook(page)
  const card = await picture(page, size, n, 'card', clip)
  await page.context().close()
  return { today: f, card, measures: m, look, words: { today: ask, card: ask }, newWords: [], notes: 'today the question is a row inside the list under the grade, already beside its ✕ — the card moves it to hang from the ✕ itself; Delete keeps its own red look (gw-yes), Keep takes the blue' }
}

/* #56 / #57 — the OIL tab: an admin taps a granted award (or a correction) → its edit row → Delete: "Really delete?" */
async function oilDel(size, n, kind) {
  const { page, tap } = await session(size)
  await lwOpen(page)
  await press(page, tap, '[data-testid="oil-tracker"]'); await sleep(1200)
  const id = await page.evaluate(kind => {
    const es = [...document.querySelectorAll('[data-testid^="oil-entry-"][role="button"]')]
    const e = es.find(x => kind === 'corr' ? x.classList.contains('corr') : !x.classList.contains('take'))
    return e ? e.getAttribute('data-testid').slice(10) : null
  }, kind)
  if (!id) return { page, none: true }
  const E = `[data-testid="oil-entry-${id}"]`
  const openRow = async () => { await page.locator(E).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300); await press(page, tap, E); await page.locator(`[data-testid="oil-del-${id}"]`).waitFor({ timeout: 4000 }) }
  await openRow()
  const BTN = `[data-testid="oil-del-${id}"]`
  await press(page, tap, BTN)
  const armed = await textOf(page, BTN)
  if (!/Really delete/.test(armed || '')) throw new Error('premise: Delete did not arm — ' + armed)
  await ring(page, BTN)
  const clip = await clipAround(page, BTN, 200, 220)
  const today = await picture(page, size, n, 'today', clip)
  await unring(page)
  await press(page, tap, '[data-testid="oil-edit-cancel"]'); await openRow()
  const what = await page.evaluate(E => { const e = document.querySelector(E); return e ? (e.querySelector('[data-testid="oil-edit-reason"]') || {}).value || '' : '' }, E)
  const q = kind === 'corr' ? `Delete this correction${what ? ` (${what})` : ''}?` : `Delete this OIL award${what ? ` (${what})` : ''}?`
  const m = await page.evaluate(hangInPage, [BTN, { q: { text: q }, btns: [{ t: 'Delete', cls: 'abtn danger' }, { t: 'Cancel', cls: 'abtn' }], safe: 'Cancel' }])
  const look = await cardLook(page)
  const card = await picture(page, size, n, 'card', clip)
  return { page, today, card, measures: m, look, words: { today: armed, card: q }, newWords: [`"${q}"`, 'Delete and Cancel (the row\'s own Cancel, which closes the edit, stays beside them)'] }
}
Q[56] = async (size) => { const r = await oilDel(size, 56, 'award'); await r.page.context().close(); if (r.none) throw new Error('premise: no award an admin can edit on the OIL tab'); return r }
Q[57] = async (size) => {
  const r = await oilDel(size, 57, 'corr'); await r.page.context().close()
  if (r.none) return { skip: 'the demo holds no OIL correction on the OIL tab; making one is a form of its own — not staged, not pictured' }
  return r
}

/* ---------------------------------------------------------------- the run ---------------------------------------------- */
const META = {
  42: { screen: 'Leave War — Grid, the drag-selection sheet over Blade\'s 2–3 Feb (LL, LL)', control: 'the sheet\'s Delete chip', answers: 'Delete (pressed again) — no other answer', today: 'a red note under the chips, and the chip reads "Delete — / sure?"', proposal: 'card' },
  43: { screen: 'Leave War — Grid, the one-day sheet (Ranger, Wed 4 Feb; his CL at −1)', control: 'the CL leave chip', answers: 'the same leave chip pressed again — no other answer', today: 'a red note at the foot of the leave chips', proposal: 'card' },
  44: { screen: 'Leave War — Grid, the drag-selection sheet over Drifter\'s 6–8 Jan (his FCL at 0)', control: 'the FCL leave chip', answers: 'the same leave chip pressed again — no other answer', today: 'a red note beside the leave chips', proposal: 'card' },
  45: { screen: 'Leave War — Grid, the one-day sheet → ⋯ → Post out (Static, from Fri 20 Nov)', control: 'the Post out button, with the Delete outcome chosen', answers: 'the same button pressed again — no other answer', today: 'the button itself turns red: "Tap again to delete Static"', proposal: 'card' },
  46: { screen: 'Leave War — Grid, the drag-selection sheet over one man\'s empty days → ⋯ → Post out', control: 'the Post out button, with the Delete outcome chosen', answers: 'the same button pressed again', today: 'the button turns red: "Tap again to delete …"', proposal: 'card' },
  47: { screen: 'Leave War — Grid, the Posted out sheet (a man posted out Overseas, his posted-out day tapped)', control: 'the Delete outcome chip', answers: 'a new row button "Tap again to delete …"; the Delete chip tapped again backs out', today: 'the Delete chip lights, the line says what a Delete does, and a red row button appears below', proposal: 'card' },
  48: { screen: 'Leave War — Grid, the Posted out sheet of a Delete posting', control: 'the PO from date box (a day of today picked in its calendar)', answers: 'the row button "Tap again to delete …"; a chip tapped puts the date back', today: 'a red row button appears below the chips', proposal: 'card' },
  49: { screen: 'Leave War — Approvals', control: 'Approve all N, at the right of the filter row', answers: 'the same button pressed again', today: 'the button turns amber: "Approve N — tap again"', proposal: 'card' },
  50: { screen: 'Leave War — Grid on a phone, a drag-selection being moved', control: 'the landing day tapped', answers: 'Confirm / Cancel', today: 'a slim bar (the move banner) asks "Move N entries here?"', proposal: 'card' },
  51: { screen: 'Leave War — Grid on a phone, an event being moved (the public holiday of 17–18 Feb, Move…)', control: 'the landing day tapped on the Event row', answers: 'Confirm / Cancel', today: 'the slim bar asks "Move this event here?"', proposal: 'card' },
  52: { screen: 'Leave War — ⚙ Settings → Events…, the list of events', control: 'the ✕ at a line\'s end', answers: 'the ✕ pressed again', today: 'the line\'s kind column reads "Delete — sure?" and the ✕ turns red; the full question is read aloud only', proposal: 'card' },
  53: { screen: 'Leave War — a Manning row\'s name → its sheet → Edit counter…, the counter\'s own window', control: 'Delete counter', answers: 'the same button pressed again', today: 'the button reads "Really delete?"', proposal: 'card' },
  54: { screen: 'Leave War — ⚙ Settings, the Order line (after a hand-arranged order)', control: '↺ Reset order', answers: 'the same button pressed again', today: 'the button reads "Really reset?"', proposal: 'card' },
  55: { screen: 'Leave War — Balances → Grades…', control: 'the ✕ at the end of a grade people hold', answers: 'Delete / Keep', today: 'a row opens under the grade, inside the list: "n people hold X: they become No grade" Delete · Keep', proposal: 'card' },
  56: { screen: 'Leave War — the OIL tab, a granted award opened for editing', control: 'the edit row\'s Delete', answers: 'the same button pressed again', today: 'the button reads "Really delete?"', proposal: 'card' },
  57: { screen: 'Leave War — the OIL tab, a correction opened for editing', control: 'the edit row\'s Delete', answers: 'the same button pressed again', today: 'the button reads "Really delete?"', proposal: 'card' },
  41: { screen: 'Leave War — Grid, the one-day sheet of a day holding an OIL award (Drifter, Sat 14 Mar, FO)', control: 'the sheet\'s Delete chip', answers: 'Delete (pressed again) — no other answer; the ✕ or a tap outside drops it', today: 'a red note under the chips, and the chip itself reads "Delete — / sure?"', proposal: 'card' },
}
for (const n of Object.keys(Q).map(Number).filter(n => !ONLY.length || ONLY.includes(n))) {
  const row = { n, area: 'Leave War', ...META[n], pics: { today: {}, card: {} }, measures: {}, look: {}, newWords: [], notes: '' }
  for (const size of ['desktop', 'phone']) {
    try {
      const r = await Q[n](size)
      if (r.skip) { row.notes += ` ${size}: ${r.skip}.`; L.say(`NOTE ${n} — ${size}: not pictured — ${r.skip}`); continue }
      row.pics.today[size] = 'A/' + r.today; row.pics.card[size] = 'A/' + r.card; row.measures[size] = r.measures; row.look[size] = r.look
      if (r.words) row.question = r.words.today, row.cardWords = r.words.card
      if (r.newWords) row.newWords = r.newWords
      if (r.notes) row.notes = r.notes
      L.note(n, `${size}: ${JSON.stringify(r.measures)}`)
      L.check(n, `${size}: the card on screen, every answer's words inside its button`, r.measures?.onScreen !== false && (r.measures?.btns || []).every(b => b.fits), r.measures)
    } catch (e) { L.say(`FAIL ${n} ${size} — THREW ${String(e && e.message || e).slice(0, 300)}`); row.notes += ` ${size} THREW: ${String(e && e.message || e).slice(0, 200)}` }
  }
  manifest.push(row)
}
const mf = join(OUT, '..', 'manifest.json')
let prev = []; try { prev = JSON.parse((await import('node:fs')).readFileSync(mf, 'utf8')) } catch {}
const merged = [...prev.filter(p => !manifest.some(m => m.n === p.n)), ...manifest].sort((a, b) => a.n - b.n)
writeFileSync(mf, JSON.stringify(merged, null, 1))
await L.finish('ask-at-leave-war')
