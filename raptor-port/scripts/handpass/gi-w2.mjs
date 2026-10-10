// [GROUP-INPUT-ONE-ROW] W2 — the phone, 390x844, touch. Usage: node scripts/handpass/gi-w2.mjs 1 2 3 ...
import * as L from './gi-w2lib.mjs'
import { browser as giBrowser } from './gi-lib.mjs'
const { open, fileFixture, shot, log, errs, browser, sleep, toBoardSec, toWeekSec, goBoard, goWeek, openDrawer, drawerName, touchDrag, centre, toast, inputsOf, readRows,
  unfoldBoard, unfoldWeek, hideToast, ender, closeDrawerIfOpen, signOut, signInAs, result, stateOf, pressBar, reloadAndBack, WIN, DI, TITLE, csId } = L
const which = process.argv.slice(2).map(Number)
const run = async (n, fn) => { if (which.length && !which.includes(n)) return; log(`===== S${n}`); try { await fn() } catch (e) { log(`S${n} SCRIPT ERROR: ` + String(e.stack || e).split('\n').slice(0, 6).join(' | ')); result(n, { scriptError: String(e).slice(0, 300) }) } }

const rowGeom = (page, where) => page.evaluate(([where, title]) => {
  const norm = s => String(s || '').trim().toLowerCase()
  const SEL = {
    weekGround: ['#eWeek .day:not(.peek) .sec-grnd .pl-row', r => r.querySelector('.nm .ntx')?.textContent],
    weekInputs: ['#eWeek .day:not(.peek) .sec-inp .pl-row', r => r.querySelector('.nm .ntx')?.textContent],
    boardGround: ['#schedBoard .sb-panel.grnd .sb-arow', r => r.querySelector('textarea.ain, input.ain')?.value],
    boardInputs: ['#schedBoard .sb-panel.pinp .sb-arow.inprow', r => r.querySelector('.inpedit')?.textContent],
  }
  const [sel, name] = SEL[where]
  const box = e => { const r = e.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), h: Math.round(r.height) } }
  return [...document.querySelectorAll(sel)].filter(r => norm(name(r)) === norm(title)).map(r => {
    const ts = r.querySelector('.t.t-s'), te = r.querySelector('.t.t-e')
    return { row: box(r), pucks: [...r.querySelectorAll('.ppl .puck')].map(k => ({ ...box(k), name: (k.querySelector('.nm')?.textContent || '').trim() })), ts: ts ? box(ts) : null, te: te ? box(te) : null }
  })
}, [where, TITLE])

const wkRow = page => page.locator('#page-editsched .day:not(.peek) .sec-grnd .pl-row').filter({ has: page.locator('.nm .ntx', { hasText: /^range safety brief$/i }) }).first()
const bdRow = page => page.locator('#schedBoard .sb-panel.grnd .sb-arow').filter({ has: page.locator('textarea.ain, input.ain') }).filter({ hasText: /./ }).evaluateAll ? null : null
const bdGroundRowPuck = (page, idx = 0) => page.evaluate(([title, idx]) => {
  const r = [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')].find(r => (r.querySelector('textarea.ain, input.ain') || {}).value?.toLowerCase() === title)
  const p = [...r.querySelectorAll('.ppl .puck')][idx]; const b = p.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, x2: b.x + 20 }
}, [TITLE.toLowerCase(), idx])
const fresh = async (opts, fixture) => { const o = await open(opts); const filed = await fileFixture(o.page, fixture || {}); return { ...o, filed } }
const backWeek = page => async () => { await goWeek(page); await unfoldWeek(page); await toWeekSec(page, 'ground'); await sleep(300) }
const backBoard = page => async () => { await goBoard(page); await unfoldBoard(page); await toBoardSec(page, 'ground'); await sleep(300) }

/* ---------------------------------------------------------------- 1 */
await run(1, async () => {
  const { ctx, page, filed } = await fresh()
  log('filed', Object.fromEntries(Object.entries(filed).map(([k, v]) => [k, v.length])))
  await goWeek(page); await hideToast(page); await unfoldWeek(page)
  await toWeekSec(page, 'ground'); await sleep(300); await shot(page, 's1-week-ground')
  const wg = await rowGeom(page, 'weekGround')
  await toWeekSec(page, 'inputs'); await sleep(300); await shot(page, 's1-week-inputs')
  const wi = await rowGeom(page, 'weekInputs')
  await goBoard(page); await unfoldBoard(page)
  await toBoardSec(page, 'ground'); await sleep(300); await shot(page, 's1-board-ground')
  const bg = await rowGeom(page, 'boardGround')
  await toBoardSec(page, 'inputs'); await sleep(300); await shot(page, 's1-board-inputs')
  const bi = await rowGeom(page, 'boardInputs')
  const rows = await readRows(page)
  const st = await stateOf(page)
  const end = await ender(page, 's1', backBoard(page))
  result(1, { rows, weekGroundGeom: wg, weekInputsGeom: wi, boardGroundGeom: bg, boardInputsGeom: bi, state: st, end })
  await ctx.close()
})

/* ---------------------------------------------------------------- 2 */
await run(2, async () => {
  const { ctx, page } = await fresh()
  await goBoard(page); await unfoldBoard(page); await toBoardSec(page, 'ground'); await sleep(300)
  await openDrawer(page, true); await shot(page, 's2-drawer-open')
  const from = await centre(await drawerName(page, 'Anvil')); const tgt = await bdGroundRowPuck(page, 0)
  await touchDrag(page, from, { x: tgt.x2, y: tgt.y })
  const t = await toast(page); await shot(page, 's2-after-drop')
  const st = await stateOf(page)
  await toBoardSec(page, 'inputs'); await sleep(300); await shot(page, 's2-after-drop-inputs')
  const rows = await readRows(page)
  // the Inputs page's calendar / the opened day's card for 15 Jul
  let cal = null
  try {
    await page.evaluate(() => window.closeScheduler && window.closeScheduler()); await page.evaluate(() => window.go('inputs')); await sleep(700)
    await page.locator('#inCalBtn').tap(); await sleep(900)
    cal = await page.evaluate(() => { const t = document.body.innerText.split(String.fromCharCode(10)); const i = t.findIndex(x => /Range safety brief/.test(x)); return i < 0 ? t.slice(0, 12).join(' | ') : t.slice(Math.max(0, i - 3), i + 2).join(' | ') })
    const more = page.locator('#page-inputs').getByText(/^[+]\d+ more$/).first(); if (await more.count()) { await more.tap(); await sleep(900) }
    cal = await page.evaluate(() => { const t = document.body.innerText.split(String.fromCharCode(10)); const i = t.findIndex(x => /Range safety brief/.test(x)); return i < 0 ? t.slice(0, 14).join(' | ') : t.slice(Math.max(0, i - 4), i + 2).join(' | ') })
    await shot(page, 's2-inputs-calendar')
  } catch (e) { cal = 'calendar read failed: ' + String(e).slice(0, 100) }
  await goWeek(page); await backBoard(page)()
  const end = await ender(page, 's2', backBoard(page))
  result(2, { toast: t, state: st, rowsAfterDrop: rows, calendarCard15Jul: cal, end })
  await ctx.close()
})

/* ---------------------------------------------------------------- 3 */
await run(3, async () => {
  const { ctx, page } = await fresh()
  const isArmed = () => page.evaluate(() => ({ rosArm: !!document.querySelector('.ros-arm'), text: document.querySelector('.ros-arm')?.innerText?.replace(/\s+/g, ' ') || null }))
  // (a) the week: tap the row's "+ add" place (below the last puck of the row) - and, as the control, a one-man row's
  await goWeek(page); await hideToast(page); await unfoldWeek(page)
  const weekTries = []
  for (const k of ['g:2.3.+', 'g:2.1.+']) {
    await toWeekSec(page, 'ground'); await sleep(250)
    const ab = await page.locator('[data-fill="' + k + '"] .addz').boundingBox()
    await page.touchscreen.tap(ab.x + ab.width / 2, ab.y + ab.height / 2); await sleep(600)
    weekTries.push({ key: k, at: [Math.round(ab.x + ab.width / 2), Math.round(ab.y + ab.height / 2)], armed: await isArmed(), toast: await toast(page) })
    if (k === 'g:2.3.+') await shot(page, 's3-week-tap-add')
  }
  // (b) the board: the same tap arms; then a name from the board's crew drawer
  await goBoard(page); await unfoldBoard(page); await toBoardSec(page, 'ground'); await sleep(300)
  const boardPlace = await page.evaluate(() => { const r = [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')].find(r => (r.querySelector('textarea.ain, input.ain') || {}).value === 'RANGE SAFETY BRIEF'); const b = r.querySelector('.addz').getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, key: r.querySelector('[data-fill]').getAttribute('data-fill') } })
  await page.touchscreen.tap(boardPlace.x, boardPlace.y); await sleep(700)
  const armedBoard = await isArmed()
  await shot(page, 's3-board-armed')
  let drawerWasOpen = !!(await drawerName(page, 'Blade', true))
  if (!drawerWasOpen) { await openDrawer(page, true); await sleep(300) }
  const armedOpen = await isArmed(); await shot(page, 's3-board-armed-drawer')
  const bl = await drawerName(page, 'Blade', true)
  await bl.tap(); await sleep(800)
  const t = await toast(page)
  const armedAfter = await isArmed()
  await closeDrawerIfOpen(page)
  await toBoardSec(page, 'ground'); await sleep(300); await shot(page, 's3-board-after-add')
  const st = await stateOf(page)
  const end = await ender(page, 's3', backBoard(page))
  result(3, { weekTries, boardPlace, drawerOpenedByItself: drawerWasOpen, armedBoard, armedOpen, toast: t, armedAfter, state: st, end })
  await ctx.close()
})

/* ---------------------------------------------------------------- 4 */
const dropSpots = (page) => page.evaluate(title => {
  const rows = [...document.querySelectorAll('#page-editsched .day:not(.peek) .sec-grnd .pl-row')]
  const r = rows.find(r => (r.querySelector('.nm .ntx')?.textContent || '').trim().toLowerCase() === title)
  const rb = r.getBoundingClientRect()
  const day = r.closest('.day')
  const sec = day.querySelector('.sec-grnd').parentElement.getBoundingClientRect()
  const nxt = day.querySelector('.sec-inp')?.closest('.dsec, .sec') || day.querySelector('.sec-inp')
  const nb = nxt ? nxt.getBoundingClientRect() : null
  const tabEl = document.querySelector('#rosTab'), tb = tabEl ? tabEl.getBoundingClientRect() : null
  return {
    gap: { x: 190, y: nb ? Math.round((sec.bottom + nb.top) / 2) : Math.round(sec.bottom + 8) },
    leftEdge: { x: 6, y: Math.round(rb.top + 40) },
    aircrewTab: { x: tb ? Math.round(tb.left + tb.width / 2) : 376, y: tb ? Math.round(tb.top + 40) : 300 },
    rowBlank: { x: 100, y: Math.round(rb.top + 60) },
  }
}, TITLE.toLowerCase())
const s4once = async (spot, label, withEnd) => {
  const { ctx, page } = await fresh()
  await goWeek(page); await hideToast(page); await unfoldWeek(page); await toWeekSec(page, 'ground'); await sleep(300)
  const id = await csId(page, 'Tally')
  const from = await centre(page.locator('#page-editsched .day:not(.peek) .sec-grnd .pl-row .ppl .puck[data-person="' + id + '"]').first())
  const spots = await dropSpots(page)
  await shot(page, label + '-before')
  await touchDrag(page, from, spots[spot])
  const t = await toast(page); const st = await stateOf(page)
  await shot(page, label + '-after')
  const out = { spot, from: [Math.round(from.x), Math.round(from.y)], to: spots[spot], toast: t, recs: st.recs, weekGround: st.rows.weekGround }
  if (withEnd) {
    await toWeekSec(page, 'inputs'); await sleep(300); await shot(page, label + '-after-inputs')
    out.end = await ender(page, label, backWeek(page))
  }
  await ctx.close()
  return out
}
await run(4, async () => {
  const main = await s4once('gap', 's4', true)
  const extras = []
  for (const spot of ['leftEdge', 'aircrewTab', 'rowBlank']) extras.push(await s4once(spot, 's4x-' + spot, false))
  result(4, { main, extras })
})

/* ---------------------------------------------------------------- 5 */
await run(5, async () => {
  const { ctx, page } = await fresh()
  await goBoard(page); await unfoldBoard(page); await toBoardSec(page, 'inputs'); await sleep(300)
  const line = page.locator('#schedBoard .sb-panel.pinp .sb-arow.inprow').filter({ hasText: 'Range safety brief' }).first()
  await line.locator('.inpedit').tap(); await sleep(800)
  const info = await page.evaluate(() => { const w = document.querySelector('#inpEditPop'); const head = w.querySelector('.airpop-hd, .airpop-head, h2, h3, header') ; return { text: w.innerText.replace(/\s+/g, ' ').slice(0, 300), lit: [...w.querySelectorAll('[data-pp][aria-pressed="true"]')].map(b => b.textContent.trim()), allPickerBtns: w.querySelectorAll('[data-pp]').length, hasDatesLine: /dates are changed on the Inputs page/i.test(w.innerText), dateCal: !!w.querySelector('#inpEdCal') } })
  await shot(page, 's5-window-top')
  // scroll the window to its foot for the second picture
  await page.evaluate(() => { const b = document.querySelector('#inpEditPop .airpop-body'); b.scrollTop = b.scrollHeight; const bx = document.querySelector('#inpEditPop .airpop-box'); bx.scrollTop = bx.scrollHeight }); await sleep(300)
  await shot(page, 's5-window-foot')
  await page.locator('#inpEditRmk').fill('Bring ID card'); await sleep(200)
  await page.locator('#inpEditSave').scrollIntoViewIfNeeded(); await page.locator('#inpEditSave').tap(); await sleep(900)
  const t1 = await toast(page)
  const afterSave = await stateOf(page)
  await toBoardSec(page, 'ground'); await sleep(300); await shot(page, 's5-after-save')
  // open again, Delete -> Keep
  await toBoardSec(page, 'inputs'); await sleep(300)
  await line.locator('.inpedit').tap(); await sleep(700)
  await page.locator('#inpEditDel').scrollIntoViewIfNeeded(); await page.locator('#inpEditDel').tap(); await sleep(700)
  const conf = await page.evaluate(() => { const all = [...document.querySelectorAll('#inpEditPop *')].filter(e => /^Delete this input for all/i.test((e.innerText || '').trim())); const e = all[all.length - 1]; if (!e) return null; const r = e.getBoundingClientRect(); const box = document.querySelector('#inpEditPop .airpop-box').getBoundingClientRect(); return { text: e.innerText.replace(/\s+/g, ' '), btns: [...e.querySelectorAll('button')].map(b => ({ t: b.textContent.trim(), top: Math.round(b.getBoundingClientRect().top), bottom: Math.round(b.getBoundingClientRect().bottom) })), confirmBottom: Math.round(r.bottom), windowBottom: Math.round(box.bottom) } })
  await shot(page, 's5-delete-confirm')
  const keepGeo = () => page.evaluate(() => { const k = [...document.querySelectorAll('#inpEditPop button')].find(b => /^keep/i.test(b.textContent.trim())); const box = document.querySelector('#inpEditPop .airpop-box'); const bd = document.querySelector('#inpEditPop .airpop-body'); if (!k) return { keep: null }; const kr = k.getBoundingClientRect(), br = box.getBoundingClientRect(); return { keepTop: Math.round(kr.top), keepBottom: Math.round(kr.bottom), windowBottom: Math.round(br.bottom), keepInsideWindow: kr.bottom <= br.bottom + 1 && kr.top >= br.top, boxScroll: [box.scrollTop, box.scrollHeight, box.clientHeight], bodyScroll: [bd.scrollTop, bd.scrollHeight, bd.clientHeight] } })
  const geo0 = await keepGeo()
  // a real finger swipe up inside the window to bring the confirm into view
  const cdp = await page.context().newCDPSession(page)
  const pt = (x, y) => [{ x, y, id: 1 }]
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(200, 600) })
  for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(200, 600 - i * 30) }); await sleep(20) }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach().catch(() => {}); await sleep(500)
  const geo1 = await keepGeo()
  await shot(page, 's5-delete-confirm-scrolled')
  let kept = false
  if (geo1.keepInsideWindow) { await page.touchscreen.tap(200, (geo1.keepTop + geo1.keepBottom) / 2); await sleep(700); kept = true }
  else { const keep = page.getByRole('button', { name: /^keep/i }).first(); if (await keep.count()) { await keep.tap(); await sleep(700); kept = 'via scroll-into-view' } }
  const afterKeep = await stateOf(page)
  const winStill = await page.locator('#inpEditPop').count()
  await shot(page, 's5-after-keep')
  if (winStill) { await page.locator('#inpEditCancel').tap().catch(() => {}); await sleep(400) }
  const end = await ender(page, 's5', backBoard(page))
  result(5, { info, toastSave: t1, afterSave, conf, keepGeoBeforeScroll: geo0, keepGeoAfterSwipe: geo1, kept, afterKeep, winStillOpenAfterKeep: winStill, end })
  await ctx.close()
})

/* ---------------------------------------------------------------- 6 */
await run(6, async () => {
  const { ctx, page } = await fresh()
  await goBoard(page); await unfoldBoard(page); await toBoardSec(page, 'inputs'); await sleep(300)
  const line = () => page.locator('#schedBoard .sb-panel.pinp .sb-arow.inprow').filter({ hasText: 'Range safety brief' }).first()
  await shot(page, 's6-before')
  await line().locator('button.accb.undo').tap(); await sleep(800)
  const t1 = await toast(page)
  const lineText = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.pinp .sb-arow')].map(r => r.innerText.replace(/\s+/g, ' ')))
  const afterUndoRows = await readRows(page); const st1 = await stateOf(page)
  await shot(page, 's6-taken-off-inputs')
  await toBoardSec(page, 'ground'); await sleep(300); await shot(page, 's6-taken-off-ground')
  await toBoardSec(page, 'inputs'); await sleep(300)
  const accepts = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.pinp .sb-arow button')].map(b => b.textContent.trim() + '|' + b.className))
  const accept = page.locator('#schedBoard .sb-panel.pinp .sb-arow.inprow').filter({ hasText: 'Range safety brief' }).first().locator('button.accb').first()
  const acceptText = await accept.innerText()
  await accept.tap(); await sleep(800)
  const t2 = await toast(page); const rows2 = await readRows(page); const st2 = await stateOf(page)
  await toBoardSec(page, 'ground'); await sleep(300); await shot(page, 's6-after-accept-ground')
  const end = await ender(page, 's6', backBoard(page))
  result(6, { toastLineUndo: t1, lineTextAfterUndo: lineText, rowsAfterLineUndo: afterUndoRows, stateAfterLineUndo: st1, accepts, acceptText, toastAccept: t2, rowsAfterAccept: rows2, stateAfterAccept: st2, end })
  await ctx.close()
})

/* ---------------------------------------------------------------- 7 */
await run(7, async () => {
  const { ctx, page } = await fresh({ clock: '2026-07-14T09:00:00' })
  await goBoard(page); await unfoldBoard(page)
  const lateInfo = async () => page.evaluate(() => {
    const out = { chips: [], groundRow: null }
    const line = [...document.querySelectorAll('#schedBoard .sb-panel.pinp .sb-arow.inprow')].find(r => /range safety brief/i.test(r.innerText))
    if (line) out.chips = [...line.querySelectorAll('.latechip')].map(c => ({ text: c.textContent.trim(), cls: String(c.className) }))
    const g = [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')].find(r => (r.querySelector('textarea.ain, input.ain') || {}).value?.toLowerCase() === 'range safety brief')
    if (g) { const b = getComputedStyle(g, '::before'); out.groundRow = { cls: String(g.className), lateinp: g.classList.contains('lateinp'), beforeBg: b.backgroundColor, beforeContent: b.content } }
    return out
  })
  await toBoardSec(page, 'inputs'); await sleep(300)
  const before = await lateInfo(); await shot(page, 's7-before-inputs')
  const chip = () => page.locator('#schedBoard .sb-panel.pinp .sb-arow.inprow').filter({ hasText: 'Range safety brief' }).first().locator('.latechip').first()
  await chip().tap(); await sleep(700)
  const hidden = await lateInfo(); await shot(page, 's7-chip-hidden-inputs')
  await toBoardSec(page, 'ground'); await sleep(300); await shot(page, 's7-chip-hidden-ground')
  const hiddenGround = await lateInfo()
  await toBoardSec(page, 'inputs'); await sleep(300)
  await chip().tap(); await sleep(700)
  const back = await lateInfo(); await shot(page, 's7-chip-back-inputs')
  await toBoardSec(page, 'ground'); await sleep(300); await shot(page, 's7-chip-back-ground')
  const end = await ender(page, 's7', backBoard(page))
  const afterReload = await lateInfo()
  result(7, { before, hidden, hiddenGround, back, afterReload, end })
  await ctx.close()
})

/* ---------------------------------------------------------------- 8 */
await run(8, async () => {
  const { ctx, page } = await fresh()
  await goBoard(page); await unfoldBoard(page); await toBoardSec(page, 'inputs'); await sleep(300)
  const line = page.locator('#schedBoard .sb-panel.pinp .sb-arow.inprow').filter({ hasText: 'Range safety brief' }).first()
  const boxes = await line.evaluate(r => [...r.querySelectorAll('input, textarea')].map(i => ({ ifld: i.getAttribute('data-ifld'), v: i.value, cls: String(i.className) })))
  const end0 = line.locator('[data-ifld$=".end"]').first()
  await end0.scrollIntoViewIfNeeded(); await shot(page, 's8-before')
  await end0.tap(); await end0.fill('15:30'); await end0.blur(); await sleep(900)
  const t1 = await toast(page)
  const st = await stateOf(page)
  const rows = await readRows(page)
  await shot(page, 's8-after-typed')
  await toBoardSec(page, 'ground'); await sleep(300); await shot(page, 's8-after-typed-ground')
  const geom = await rowGeom(page, 'boardGround')
  const end = await ender(page, 's8', backBoard(page))
  result(8, { boxes, toast: t1, state: st, rows, geom: geom.length, end })
  await ctx.close()
})

/* ---------------------------------------------------------------- 9 */
await run(9, async () => {
  const { ctx, page } = await fresh()
  const geomMon = async () => page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow.gr-frominput')].map(row => {
    const line = getComputedStyle(row, '::before'), box = row.getBoundingClientRect()
    const left = box.left + parseFloat(line.left), right = left + parseFloat(line.width)
    const drawn = [...row.querySelectorAll('.puck, .mbtn, input, textarea, .sb-grip')].map(e => e.getBoundingClientRect()).filter(r => r.width > 0 && r.height > 0)
    return { name: (row.querySelector('textarea.ain, input.ain') || {}).value, late: row.classList.contains('lateinp'), content: line.content, colour: line.backgroundColor, shadow: getComputedStyle(row).boxShadow, lineLeft: Math.round(left), lineRight: Math.round(right), firstDrawn: Math.round(Math.min(...drawn.map(r => r.left))), panelLeft: Math.round(row.closest('.sb-panel').getBoundingClientRect().left), things: drawn.length }
  }))
  await goBoard(page, 0); await toBoardSec(page, 'ground', 0); await sleep(400)
  const g1 = await geomMon(); await shot(page, 's9-mon-ground-a')
  // scroll through the Monday ground programme for the rest
  await page.evaluate(() => { const sec = document.querySelector('#schedBoard [data-secmove="0.ground"]'); for (let n = sec.parentElement; n; n = n.parentElement) if (n.scrollHeight > n.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(n).overflowY)) { n.scrollTop += 520; break } }); await sleep(300)
  await shot(page, 's9-mon-ground-b')
  await page.evaluate(() => { const sec = document.querySelector('#schedBoard [data-secmove="0.ground"]'); for (let n = sec.parentElement; n; n = n.parentElement) if (n.scrollHeight > n.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(n).overflowY)) { n.scrollTop += 520; break } }); await sleep(300)
  await shot(page, 's9-mon-ground-c')
  await goBoard(page, 2); await toBoardSec(page, 'ground', 2); await sleep(400); await shot(page, 's9-wed-ground')
  const gw = await geomMon()
  const end = await ender(page, 's9', async () => { await goBoard(page, 0); await toBoardSec(page, 'ground', 0); await sleep(400) })
  const g2 = await geomMon()
  result(9, { mondayRows: g1, wednesdayRows: gw, mondayAfterReload: g2, end })
  await ctx.close()
})

/* ---------------------------------------------------------------- 10 */
await run(10, async () => {
  const { ctx, page } = await fresh({}, { s1: false, g4: false, sat: true })
  const T = 'Range duty'
  const oilOf = async () => (await inputsOf(page, T)).map(r => r.cs + ':' + JSON.stringify(r.oil)).sort()
  const satRowPuck = () => page.evaluate(title => { const r = [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')].find(r => (r.querySelector('textarea.ain, input.ain') || {}).value?.toLowerCase() === title); const p = r.querySelector('.ppl .puck'); const b = p.getBoundingClientRect(); return { x: b.x + 20, y: b.y + b.height / 2 } }, T.toLowerCase())
  const question = async () => page.evaluate(() => { const q = document.querySelector('[data-testid="oilconf"]'); return q && q.getBoundingClientRect().width ? q.innerText.split(String.fromCharCode(10)).join(' ') : null })
  const dragOn = async (cs) => { await goBoard(page, 5); await unfoldBoard(page); await toBoardSec(page, 'ground', 5); await sleep(300); await openDrawer(page, true); const nm = await drawerName(page, cs, true); if (!nm) throw new Error('no drawer name ' + cs); const from = await centre(nm); const tgt = await satRowPuck(); await touchDrag(page, from, tgt); return toast(page) }
  const out = { filed: await oilOf() }
  // (a) all answers Yes: drop Hunter
  out.hunterToast = await dragOn('Hunter')
  out.hunterQuestion = await question()
  out.afterHunter = await oilOf(); out.rowsAfterHunter = await readRows(page, T)
  await shot(page, 's10-hunter-added')
  // the Inputs page's window on the input, as the admin
  try {
    await page.evaluate(() => window.closeScheduler && window.closeScheduler()); await page.evaluate(() => window.go('inputs')); await sleep(700)
    if (await page.locator('#inCalBtn[aria-pressed="false"]').count()) { await page.locator('#inCalBtn').tap(); await sleep(600) }
    for (let i = 0; i < 4 && !(await page.locator('[data-ichead="2026-07-18"]').count()); i++) { await page.locator('#icPrev').tap(); await sleep(400) }
    await page.locator('#page-inputs').getByText(/^3 · /).first().tap(); await sleep(900)
    out.adminWindowOil = await page.evaluate(() => { const w = document.querySelector('#inpEditPop'); const leaves = [...w.querySelectorAll('*')].filter(e => e.children.length === 0 && /credited|unanswered|not answered|OIL:|your oil/i.test(e.textContent)); if (leaves[0]) leaves[0].scrollIntoView({ block: 'center' }); return leaves.map(e => e.textContent.trim().slice(0, 140)) })
    await sleep(300)
    await shot(page, 's10-admin-window-oil')
    await page.locator('#inpEditCancel').tap().catch(() => {}); await sleep(500)
  } catch (e) { out.adminWindowOil = 'could not read: ' + String(e).slice(0, 120) }
  // (b) make the answers differ through Ranger's own door
  await signOut(page); await signInAs(page, 'us', 'us')
  try {
    await page.evaluate(() => window.go('inputs')); await sleep(800)
    if (await page.locator('#inCalBtn[aria-pressed="false"]').count()) { await page.locator('#inCalBtn').tap(); await sleep(600) }
    for (let i = 0; i < 4 && !(await page.locator('[data-ichead="2026-07-18"]').count()); i++) { await page.locator('#icPrev').tap(); await sleep(400) }
    await page.locator('#page-inputs').getByText(/^3 · /).first().tap(); await sleep(900)
    await page.locator('[data-testid="oil-revise-own"]').scrollIntoViewIfNeeded(); await page.locator('[data-testid="oil-revise-own"]').tap(); await sleep(700)
    await shot(page, 's10-ranger-change')
    await page.locator('[data-testid="oilconf"] [data-testid="oil-no"]').tap(); await sleep(300)
    await page.locator('[data-testid="oilconf-save"]').tap(); await sleep(900)
    out.rangerToast = await toast(page)
    out.afterRangerNo = await oilOf()
    await shot(page, 's10-ranger-after-no')
    if (await page.locator('#inpEditCancel').count()) { await page.locator('#inpEditCancel').tap().catch(() => {}); await sleep(400) }
  } catch (e) { out.rangerError = String(e).slice(0, 200) }
  await signOut(page); await signInAs(page, 'ad', 'a')
  // (c) answers now differ: drop Tally
  out.tallyToast = await dragOn('Tally')
  await sleep(400)
  out.tallyQuestion = await question()
  await shot(page, 's10-tally-question')
  out.afterTallyDropBeforeAnswer = await oilOf()
  if (out.tallyQuestion) {
    await page.locator('[data-testid="oilconf"] [data-testid="oil-yes"]').tap(); await sleep(300)
    await page.locator('[data-testid="oilconf-save"]').tap(); await sleep(900)
    out.afterTallyYes = await oilOf(); out.questionAfterSave = await question()
    out.windowBehind = await page.locator('#inpEditPop').count()
    await shot(page, 's10-after-tally-yes')
  }
  // (d) Anvil on, the question closed unanswered
  out.anvilToast = await dragOn('Anvil'); await sleep(400)
  out.anvilQuestion = await question()
  await shot(page, 's10-anvil-question')
  if (out.anvilQuestion) {
    const x = page.locator('[data-testid="oilconf"]').locator('button[aria-label*="lose"], .win-x, button:has-text("✕"), [data-testid="oilconf-x"]').first()
    out.anvilCloseControl = (await x.count()) ? await x.evaluate(e => e.outerHTML.slice(0, 120)) : 'no x found'
    if (await x.count()) { await x.tap(); await sleep(700) }
  }
  out.afterAnvilClosed = await oilOf(); out.rowsAfterAnvil = await readRows(page, T)
  out.questionAfterClose = await question()
  await shot(page, 's10-anvil-closed')
  out.end = await ender(page, 's10', async () => { await goBoard(page, 5); await unfoldBoard(page); await toBoardSec(page, 'ground', 5); await sleep(300) }, T)
  result(10, out)
  await ctx.close()
})

await browser.close(); await giBrowser.close()
log('ERRS ' + JSON.stringify(errs))
