/* [TRK-EDIT-SIDEWAYS] + D373 — walker c: the ORDERS the first fold walk skipped (28 Sep 26).
   trk-lo-10-fold.mjs already proves the basics (the row, Tools ▾ opens, a choice closes it,
   Escape, a press outside, ⤢ Fit, Done). This walks what comes AFTER them, at 844×390 with a
   finger unless said: + Flight / + Test / 📋 Edit events / ↺ Reset layout from the opened set,
   ✎ Text and ╱ Line used from the fold, a pinch and a one-finger pan on the freed chart, a turn
   of the phone mid-edit, Escape with a question up while the set is open (a 1280×480 desktop
   window — the keyboard's own case), and the member. Every step is an assertion of the RIGHT
   behaviour (PASS = correct); the chart's visible height is recorded in EVERY state and must
   never be 0.

     HP_URL=http://localhost:4175 HP_SHOTS=<dir> HP_OUT=<dir> node scripts/handpass/trk-lo-2c-fold.mjs
*/
import { open, shot, save, log } from './trk-lib.mjs'
import { touchCdp, pinch, drag, zoomNow, chartAt, emptySpot, pickBall, hitAt, mark, unmark } from './trk-pinch.mjs'

const L = log()
const sleep = ms => new Promise(r => setTimeout(r, ms))
const SIDE = { width: 844, height: 390 }, UP = { width: 390, height: 844 }
const chartLog = []          /* [state, visible chart px] for every state walked */
const allErrors = []

/* what the screen shows, read off the page (never set) */
const S = page => page.evaluate(() => {
  const vis = e => !!e && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 0
  const fold = document.getElementById('arrFold'), set = document.getElementById('arrTools'), bd = document.getElementById('board')
  const b = bd ? bd.getBoundingClientRect() : null
  const onTop = el => {
    if (!el || !vis(el)) return false
    const r = el.getBoundingClientRect()
    return [[0.5, 0.5], [0.2, 0.3], [0.8, 0.75]].every(([fx, fy]) => { const h = document.elementFromPoint(r.left + r.width * fx, r.top + r.height * fy); return !!h && el.contains(h) })
  }
  const dm = document.getElementById('dlgModal')
  const f = fold ? fold.getBoundingClientRect() : null
  return {
    editing: !!document.querySelector('.tr-root.arranging'),
    fold: vis(fold), foldBottom: f ? Math.round(f.bottom) : null,
    setOpen: !!set && set.classList.contains('open'), setShown: vis(set), setPos: set ? getComputedStyle(set).position : '',
    setOnTop: onTop(set),
    tool: ((document.getElementById('foldTool') || {}).textContent || '').trim(), hint: ((document.getElementById('foldHint') || {}).textContent || '').trim(),
    chart: b ? Math.max(0, Math.round(Math.min(b.bottom, innerHeight) - Math.max(b.top, 0))) : -1,
    boardTop: b ? Math.round(b.top) : null,
    tabs: vis(document.getElementById('viewtabs')),
    dlg: vis(dm) ? ((document.getElementById('dlgMsg') || {}).textContent || '').trim() : null, dlgOnTop: onTop(dm),
    save: !!document.getElementById('saveChanges'),
    scrollY: Math.round(scrollY), vw: innerWidth, vh: innerHeight,
  }
})
const note = async (page, what) => { const s = await S(page); chartLog.push([what, s.chart]); return s }
const press = async (page, sel, touch) => { const l = page.locator(sel).first(); if (touch) await l.tap(); else await l.click(); await sleep(300) }
const inSet = async (page, text, touch) => { const l = page.locator('#arrTools button', { hasText: text }).first(); if (touch) await l.tap(); else await l.click(); await sleep(350) }
const typeIn = async (page, text) => { await page.locator('#dlgInput').first().click(); await page.keyboard.type(text, { delay: 35 }); await sleep(150) }
const hasBall = (page, id) => page.evaluate(id => !!document.querySelector(`#flowSvg .ball[data-id="${CSS.escape(id)}"]`), id)
const lineCount = page => page.evaluate(() => new Set([...document.querySelectorAll('#flowSvg [data-lid]')].map(e => e.dataset.lid)).size)
async function toggleEdit(page, touch) {
  await press(page, '#sylMenuBtn', touch)
  await page.waitForSelector('#arrangeBtn', { state: 'visible', timeout: 4000 })
  await press(page, '#arrangeBtn', touch); await sleep(500)
}
/* two empty points on the chart, on one row, ≥120px apart, clear of every ball, line and the fold row */
const twoEmpty = page => page.evaluate(() => {
  const bd = document.getElementById('board').getBoundingClientRect(), fold = document.getElementById('arrFold').getBoundingClientRect()
  const top = Math.max(bd.top, fold.bottom) + 24, bot = Math.min(bd.bottom, innerHeight) - 24
  const clear = (x, y) => {
    for (const [dx, dy] of [[0, 0], [-18, 0], [18, 0], [0, -18], [0, 18]]) {
      const e = document.elementFromPoint(x + dx, y + dy)
      if (!e || !e.closest('#flowSvg')) return false
      if (e.closest('.ball') || e.closest('[data-lid]') || e.closest('.edgehit') || /hit|port|lend|lvert/.test(e.getAttribute('class') || '')) return false
    }
    return true
  }
  for (let y = top; y < bot; y += 9) {
    const xs = []
    for (let x = bd.left + 40; x < Math.min(bd.right, innerWidth) - 40; x += 9) if (clear(x, y)) xs.push(x)
    for (const a of xs) { const b = xs.find(x => x >= a + 120 && x <= a + 220); if (b) return { a: { x: a, y }, b: { x: b, y } } }
  }
  return null
})

/* ============ 1 — 844×390, a finger, the admin ============ */
{
  const { browser, page, errors } = await open({ size: SIDE, touch: true })
  const T = true
  await toggleEdit(page, T)
  let s = await note(page, 'editing, folded')
  L.ok('1.1 844×390 editing: the folded row shows, the set is shut, the chart has room', s.editing && s.fold && !s.setOpen && s.chart >= 120, JSON.stringify({ fold: s.fold, setOpen: s.setOpen, chart: s.chart }))
  await shot(page, 'lo-2c-f01-folded')

  /* ---- + Flight from the opened set ---- */
  await press(page, '#foldTools', T)
  s = await note(page, 'set open')
  L.ok('1.2 Tools ▾ opens the set over the chart', s.setOpen && s.setShown && s.setOnTop && s.setPos === 'absolute', JSON.stringify({ setOpen: s.setOpen, onTop: s.setOnTop, pos: s.setPos }))
  await inSet(page, '+ Flight', T)
  s = await note(page, '+ Flight question up')
  L.ok('1.3 + Flight from the set: the set is shut BEFORE the name question shows', !s.setOpen && !s.setShown, JSON.stringify({ setOpen: s.setOpen, setShown: s.setShown }))
  L.ok('1.4 + Flight: the name question is up, on top, and asks for the name', s.dlg != null && /Name for the new flight event/i.test(s.dlg) && s.dlgOnTop, JSON.stringify({ dlg: s.dlg, onTop: s.dlgOnTop }))
  await shot(page, 'lo-2c-f02-flight-question')
  await typeIn(page, 'LO2C-F')
  await press(page, '#dlgOk', T); await sleep(400)
  s = await note(page, 'after + Flight')
  L.ok('1.5 + Flight answered: the ball "LO2C-F" is on the chart, ✓ Save changes shows, the row is still folded', (await hasBall(page, 'LO2C-F')) && s.save && s.fold && !s.setOpen && s.dlg == null, JSON.stringify({ save: s.save, fold: s.fold, dlg: s.dlg }))
  await shot(page, 'lo-2c-f03-flight-added')

  /* ---- + Test from the opened set ---- */
  await press(page, '#foldTools', T)
  await inSet(page, '+ Test', T)
  s = await note(page, '+ Test question up')
  L.ok('1.6 + Test from the set: set shut, question on top', !s.setOpen && s.dlg != null && /new test event/i.test(s.dlg) && s.dlgOnTop, JSON.stringify({ setOpen: s.setOpen, dlg: s.dlg, onTop: s.dlgOnTop }))
  await typeIn(page, 'LO2C-T')
  await press(page, '#dlgOk', T); await sleep(400)
  L.ok('1.7 + Test answered: "LO2C-T" is on the chart', await hasBall(page, 'LO2C-T'))

  /* ---- 📋 Edit events from the set ---- */
  await press(page, '#foldTools', T)
  await inSet(page, 'Edit events', T)
  s = await note(page, '📋 Edit events window')
  const syl = await page.evaluate(() => { const m = document.getElementById('sylModal'); if (!m) return null; const r = m.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(40, r.height / 2)); return { shown: getComputedStyle(m).display !== 'none' && r.height > 0, onTop: !!h && m.contains(h), top: Math.round(r.top), h: Math.round(r.height), vh: innerHeight } })
  L.ok('1.8 📋 Edit events from the set: the set is shut and the event list is on top', !s.setOpen && syl && syl.shown && syl.onTop, JSON.stringify({ setOpen: s.setOpen, syl }))
  L.ok('1.9 📋 Edit events: its window fits the sideways screen (top ≥ 0, bottom ≤ screen)', syl && syl.top >= 0 && syl.top + syl.h <= syl.vh + 1, JSON.stringify(syl))
  await shot(page, 'lo-2c-f04-edit-events')
  await press(page, '#sylCancel', T)
  L.ok('1.10 📋 Edit events: Cancel closes it; still editing, still folded', !(await page.locator('#sylModal').count()) && (await S(page)).fold)

  /* ---- ↺ Reset layout from the set ---- */
  await press(page, '#foldTools', T)
  await inSet(page, 'Reset layout', T)
  s = await note(page, '↺ Reset layout question')
  L.ok('1.11 ↺ Reset layout from the set: set shut, its question on top', !s.setOpen && s.dlg != null && /Reset/i.test(s.dlg) && s.dlgOnTop, JSON.stringify({ setOpen: s.setOpen, dlg: s.dlg, onTop: s.dlgOnTop }))
  await shot(page, 'lo-2c-f05-reset-question')
  await press(page, '#dlgCancel', T)
  L.ok('1.12 ↺ Reset layout: Cancel leaves the chart as it was (both new balls there)', (await hasBall(page, 'LO2C-F')) && (await hasBall(page, 'LO2C-T')) && (await S(page)).dlg == null)

  /* ---- ✎ Text from the fold ---- */
  await press(page, '#foldTools', T)
  await inSet(page, 'Text', T)
  s = await note(page, 'tool Text')
  L.ok('1.13 ✎ Text chosen: the set shuts, the row shows "✎ Text" and its hint', !s.setOpen && /Text/.test(s.tool) && /tap a ball/.test(s.hint), JSON.stringify({ tool: s.tool, hint: s.hint }))
  /* the ball under the finger (the two new balls sit on one spot — the newest on top) */
  const b1 = await pickBall(page)
  const under = b1 ? await hitAt(page, b1) : null
  if (b1) { await page.touchscreen.tap(b1.x, b1.y); await sleep(450) }
  const ed = await page.evaluate(() => { const m = document.getElementById('editModal'); if (!m) return null; const r = m.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + 30); return { onTop: !!h && m.contains(h), text: (document.getElementById('edText') || {}).value, num: (document.getElementById('edNum') || {}).value } })
  L.ok('1.14 ✎ Text: a finger on a ball opens THAT ball\'s editor, on top', !!b1 && ed && ed.onTop && !!under && ((ed.text || '') === under || (ed.num || '') === under || (ed.text || '').includes(under)), JSON.stringify({ underFinger: under, ed }))
  await shot(page, 'lo-2c-f06-text-editor')
  if (ed) await press(page, '#edCancel', T)

  /* ---- ╱ Line from the fold: two taps on the chart ---- */
  await press(page, '#foldTools', T)
  await inSet(page, 'Line', T)
  s = await note(page, 'tool Line')
  L.ok('1.15 ╱ Line chosen: the set shuts, the row shows "╱ Line"', !s.setOpen && /Line/.test(s.tool), JSON.stringify({ tool: s.tool, hint: s.hint }))
  const pts = await twoEmpty(page)
  const n0 = await lineCount(page)
  if (pts) {
    const tgt = await page.evaluate(p => { const e = document.elementFromPoint(p.x, p.y); return e ? (e.closest('#flowSvg') ? 'chart' : e.closest('#arrFold') ? 'fold row' : (e.id || e.tagName)) : null }, pts.a)
    await page.touchscreen.tap(pts.a.x, pts.a.y); await sleep(350)
    const mid = await S(page)
    L.ok('1.16 ╱ Line: the first tap lands on the CHART (not the fold row) and starts a line — the row says where to tap next', tgt === 'chart' && pts.a.y > (s.foldBottom || 0) && /Now click where it ends/.test(mid.hint), JSON.stringify({ tgt, at: pts.a, foldBottom: s.foldBottom, hint: mid.hint.slice(0, 60) }))
    await shot(page, 'lo-2c-f07-line-started')
    await page.touchscreen.tap(pts.b.x, pts.b.y); await sleep(400)
    const n1 = await lineCount(page)
    L.ok('1.17 ╱ Line: the second tap ends it — one more line on the chart, ✓ Save changes shows', n1 === n0 + 1 && (await S(page)).save, `lines ${n0} → ${n1}`)
    await shot(page, 'lo-2c-f08-line-drawn')
  } else L.ok('1.16 ╱ Line: two empty points on the chart to tap', false, 'none found in the chart\'s visible room')
  await note(page, 'after line')

  /* ---- a pinch and a one-finger pan on the freed chart (✋ Move) ---- */
  await press(page, '#foldTools', T)
  await inSet(page, 'Move', T)
  const cdp = await touchCdp(page)
  const p = await emptySpot(page)
  if (p) {
    const c0 = await chartAt(page, p), v0 = (await zoomNow(page)).view
    await mark(page, p); await shot(page, 'lo-2c-f09-pinch-before'); await unmark(page)
    const end = await pinch(page, cdp, { cx: p.x, cy: p.y, d0: 60, d1: 150 })
    const c1 = await chartAt(page, end), v1 = (await zoomNow(page)).view, k = +(v1.match(/scale\(([\d.]+)\)/) || [0, 1])[1]
    const drift = Math.round(Math.hypot(c1.x - c0.x, c1.y - c0.y) * k * 10) / 10
    await mark(page, end); await shot(page, 'lo-2c-f10-pinch-after'); await unmark(page)
    L.ok('1.18 a pinch on the freed chart zooms it and keeps the chart point under the fingers (≤6px)', v1 !== v0 && drift <= 6, `view ${v0} → ${v1}; drift ${drift}px`)
    await note(page, 'after pinch')
    /* one finger on empty chart pans it */
    const q = await emptySpot(page)
    if (q) {
      const d0 = await chartAt(page, q), sy0 = await page.evaluate(() => scrollY), bs0 = await page.evaluate(() => document.getElementById('board').scrollTop)
      await drag(page, cdp, { x: q.x, y: q.y, dx: -70, dy: -30 })
      const d1 = await chartAt(page, { x: q.x - 70, y: q.y - 30 }), v2 = (await zoomNow(page)).view, k2 = +(v2.match(/scale\(([\d.]+)\)/) || [0, 1])[1]
      const sy1 = await page.evaluate(() => scrollY), bs1 = await page.evaluate(() => document.getElementById('board').scrollTop)
      const off = Math.round(Math.hypot(d1.x - d0.x, d1.y - d0.y) * k2 * 10) / 10
      L.ok('1.19 one finger on empty chart pans it: the point under the finger follows it (≤6px); the page itself does not scroll', v2 !== v1 && off <= 6 && sy0 === sy1 && bs0 === bs1, `view ${v1} → ${v2}; point ${off}px from the finger; page scroll ${sy0}→${sy1}; board scroll ${bs0}→${bs1}`)
      await shot(page, 'lo-2c-f11-after-pan')
    } else L.ok('1.19 an empty spot to pan from', false, 'none found')
  } else L.ok('1.18 an empty spot on the freed chart to pinch on', false, 'none found — the chart\'s room: ' + (await S(page)).chart + 'px')
  await cdp.detach().catch(() => {})
  await note(page, 'after pan')

  /* ---- turn the phone mid-edit, the set SHUT ---- */
  await page.setViewportSize(UP); await sleep(700)
  s = await note(page, 'turned upright, editing')
  L.ok('1.20 turned upright mid-edit: the full strip shows (in the page, not floating), no folded row, the chart keeps its room', s.editing && !s.fold && s.setShown && s.setPos !== 'absolute' && s.chart >= 300, JSON.stringify({ fold: s.fold, setShown: s.setShown, pos: s.setPos, chart: s.chart }))
  await shot(page, 'lo-2c-f12-upright-mid-edit')
  await page.setViewportSize(SIDE); await sleep(700)
  s = await note(page, 'turned back sideways')
  L.ok('1.21 back on its side: folded again, the set shut, the chart has room', s.editing && s.fold && !s.setOpen && !s.setShown && s.chart >= 120, JSON.stringify({ fold: s.fold, setOpen: s.setOpen, chart: s.chart }))
  await shot(page, 'lo-2c-f13-sideways-again')

  /* ---- turn the phone with the set OPEN ---- */
  await press(page, '#foldTools', T)
  let o = await S(page)
  if (!o.setOpen) { L.note('1.22a Tools ▾ needed a second tap to open (the first after a turn/drag)', JSON.stringify({ setOpen: o.setOpen })); await press(page, '#foldTools', T); o = await S(page) }
  L.ok('1.22a the set is open before the phone is turned', o.setOpen, JSON.stringify({ setOpen: o.setOpen }))
  await page.setViewportSize(UP); await sleep(700)
  s = await note(page, 'turned upright with the set open')
  L.ok('1.22 turned upright with the set open: the strip shows in its own place, not floating over the chart', s.setShown && s.setPos !== 'absolute' && s.chart >= 300, JSON.stringify({ setOpen: s.setOpen, pos: s.setPos, chart: s.chart }))
  await shot(page, 'lo-2c-f14-upright-set-was-open')
  await page.setViewportSize(SIDE); await sleep(700)
  s = await note(page, 'back sideways after the set was open')
  L.note('1.23 back on its side after turning with the set open', JSON.stringify({ setOpen: s.setOpen, setShown: s.setShown, chart: s.chart }))
  await shot(page, 'lo-2c-f15a-sideways-on-return')
  L.ok('1.23 back on its side: nothing is stuck open — the set is shut, or one press outside shuts it', !s.setOpen || await (async () => { const b = await page.evaluate(() => { const r = document.getElementById('board').getBoundingClientRect(); return { x: r.left + 20, y: Math.min(r.bottom, innerHeight) - 8 } }); await page.touchscreen.tap(b.x, b.y); await sleep(300); return !(await S(page)).setOpen })(), JSON.stringify({ setOpenOnReturn: s.setOpen }))
  await shot(page, 'lo-2c-f15-sideways-after-open-turn')
  await note(page, 'after closing')

  /* ---- Done editing ---- */
  await toggleEdit(page, T)
  s = await note(page, 'done editing')
  L.ok('1.24 ✓ Done editing chart: the tabs come back, the folded row goes, the chart grows back', !s.editing && s.tabs && !s.fold && s.chart >= 100, JSON.stringify({ tabs: s.tabs, fold: s.fold, chart: s.chart }))
  L.ok('1.25 844×390 finger: no console or page error', errors.length === 0, errors.join(' | '))
  allErrors.push(...errors.map(e => '844 admin: ' + e))
  await browser.close()
}

/* ============ 2 — a desktop window only 480px tall, a mouse and keyboard ============ */
{
  const { browser, page, errors } = await open({ size: { width: 1280, height: 480 } })
  const T = false
  const pre = await note(page, '1280×480 before editing')
  await toggleEdit(page, T)
  let s = await note(page, '1280×480 editing')
  L.ok('2.1 1280×480 desktop window: Edit chart layout FOLDS too; the chart has room', s.fold && !s.setShown && s.chart >= 120, JSON.stringify({ fold: s.fold, setShown: s.setShown, chart: s.chart, before: pre.chart }))
  await shot(page, 'lo-2c-f16-desk480-folded')
  await press(page, '#foldTools', T)
  await inSet(page, '+ Test', T)
  s = await note(page, '1280×480 + Test question')
  L.ok('2.2 1280×480: + Test from the set — set shut, question on top', !s.setOpen && s.dlg != null && s.dlgOnTop, JSON.stringify({ setOpen: s.setOpen, dlg: s.dlg }))
  await typeIn(page, 'LO2C-D')
  await page.keyboard.press('Enter'); await sleep(400)
  L.ok('2.3 1280×480: Enter answers it — "LO2C-D" is on the chart', await hasBall(page, 'LO2C-D'))

  /* Escape with a question up WHILE the set is open: ▣ Select all (from the set), open the
     set again, press the Delete key — the "delete them?" question comes up over the open set.
     (A plain click on a ball in ✋ Move does not select it, so Delete alone asks nothing.) */
  const nBalls = () => page.evaluate(() => document.querySelectorAll('#flowSvg .ball').length)
  const n0 = await nBalls()
  await press(page, '#foldTools', T)
  await inSet(page, 'Select all', T)
  await press(page, '#foldTools', T)
  await page.keyboard.press('Delete'); await sleep(400)
  s = await note(page, 'question over the open set')
  L.ok('2.4 a question raised while the set is open shows ON TOP of the set', s.setOpen && s.dlg != null && s.dlgOnTop, JSON.stringify({ setOpen: s.setOpen, dlg: s.dlg, onTop: s.dlgOnTop }))
  await shot(page, 'lo-2c-f17-question-over-open-set')
  await page.keyboard.press('Escape'); await sleep(350)
  s = await note(page, 'after one Escape')
  if (s.dlg != null) await press(page, '#dlgCancel', T)   /* never leave "delete every ball?" up */
  L.ok('2.5 the FIRST Escape answers the question (no) — every ball stays, the set is still open', s.dlg == null && s.setOpen && (await nBalls()) === n0, JSON.stringify({ dlg: s.dlg, setOpen: s.setOpen, balls: [n0, await nBalls()] }))
  await shot(page, 'lo-2c-f18-after-first-escape')
  await page.keyboard.press('Escape'); await sleep(350)
  s = await note(page, 'after two Escapes')
  L.ok('2.6 the SECOND Escape shuts the set — and nothing else: still editing', !s.setOpen && s.editing, JSON.stringify({ setOpen: s.setOpen, editing: s.editing }))
  await toggleEdit(page, T)
  s = await note(page, '1280×480 done')
  L.ok('2.7 1280×480: Done editing — the folded row and the strip go, the chart grows back (no Flow/Info tabs at this width, as before)', !s.editing && !s.fold && !s.setShown && s.chart >= pre.chart - 2, JSON.stringify({ fold: s.fold, setShown: s.setShown, chart: s.chart, before: pre.chart }))
  await shot(page, 'lo-2c-f18b-desk480-done')
  L.ok('2.8 1280×480: no console or page error', errors.length === 0, errors.join(' | '))
  allErrors.push(...errors.map(e => '1280x480: ' + e))
  await browser.close()
}

/* ============ 3 — the member (us/us), 844×390, a finger ============ */
{
  const { browser, page, errors } = await open({ size: SIDE, touch: true, who: 'u' })
  const T = true
  await toggleEdit(page, T)
  let s = await note(page, 'member editing')
  L.ok('3.1 the member at 844×390: the same folded row, the chart has room', s.editing && s.fold && !s.setShown && s.chart >= 120, JSON.stringify({ fold: s.fold, chart: s.chart, tool: s.tool }))
  await shot(page, 'lo-2c-f19-member-folded')
  await press(page, '#foldTools', T)
  s = await note(page, 'member set open')
  L.ok('3.2 the member: Tools ▾ opens the same set over the chart', s.setOpen && s.setOnTop, JSON.stringify({ setOpen: s.setOpen, onTop: s.setOnTop }))
  await shot(page, 'lo-2c-f20-member-set-open')
  await inSet(page, '+ Acad', T)
  s = await note(page, 'member + Acad question')
  L.ok('3.3 the member: + Acad from the set — set shut, question on top', !s.setOpen && s.dlg != null && s.dlgOnTop, JSON.stringify({ dlg: s.dlg }))
  await press(page, '#dlgCancel', T)
  await toggleEdit(page, T)
  s = await note(page, 'member done')
  L.ok('3.4 the member: Done editing — tabs back', !s.editing && s.tabs)
  L.ok('3.5 the member: no console or page error', errors.length === 0, errors.join(' | '))
  allErrors.push(...errors.map(e => 'member: ' + e))
  await browser.close()
}

/* ============ 5 — a turn mid-edit with NOTHING else done first (no pinch, no pan) ============
   Part 1's turn came after a pinch to 230%, which could explain an empty canvas. Here: enter
   Edit chart layout, note the ball in the middle of the chart, turn the phone, and ask what a
   person needs — the editing canvas fits the new chart box (not wider than the screen), and the
   ball that was in the middle is still in sight. Both directions. */
const canvasFit = page => page.evaluate(() => {
  const b = document.getElementById('board'), svg = document.getElementById('flowSvg')
  const br = b.getBoundingClientRect(), sr = svg.getBoundingClientRect()
  return { board: [Math.round(b.clientWidth), Math.round(b.clientHeight)], canvas: [Math.round(sr.width), Math.round(sr.height)], canvasRight: Math.round(sr.right), screenW: innerWidth, boardBottom: Math.round(Math.min(br.bottom, innerHeight)), canvasBottom: Math.round(sr.bottom) }
})
const inSight = (page, id) => page.evaluate(id => {
  const g = document.querySelector(`#flowSvg .ball[data-id="${CSS.escape(id)}"]`); if (!g) return null
  const r = g.getBoundingClientRect(), b = document.getElementById('board').getBoundingClientRect()
  const x = r.left + r.width / 2, y = r.top + r.height / 2
  return { x: Math.round(x), y: Math.round(y), inside: x >= b.left && x <= Math.min(b.right, innerWidth) && y >= b.top && y <= Math.min(b.bottom, innerHeight) }
}, id)
for (const [from, to, tag] of [[SIDE, UP, 'sideways→upright'], [UP, SIDE, 'upright→sideways']]) {
  const { browser, page, errors } = await open({ size: from, touch: true })
  await toggleEdit(page, true)
  const mid = await pickBall(page)
  const c0 = await canvasFit(page)
  await page.setViewportSize(to); await sleep(800)
  const c1 = await canvasFit(page), seen = mid ? await inSight(page, mid.id) : null
  await shot(page, `lo-2c-f21-turn-${tag.replace('→', '-to-')}`)
  L.note(`5 ${tag}: before the turn`, JSON.stringify({ ballInMiddle: mid && mid.id, canvas: c0 }))
  L.ok(`5 ${tag}: after the turn the editing canvas fits the chart box (no wider than the screen, no taller than the box)`, c1.canvasRight <= c1.screenW + 1 && c1.canvas[0] <= c1.board[0] + 1 && c1.canvas[1] <= c1.board[1] + 1, JSON.stringify(c1))
  L.ok(`5 ${tag}: the ball that was in the middle of the chart (${mid && mid.id}) is still in sight`, !!seen && seen.inside, JSON.stringify(seen))
  /* the way out a person has: ⤢ Fit (the folded row's, or the strip's) */
  await press(page, (await page.locator('#foldFit:visible').count()) ? '#foldFit' : '#fitBtn', true); await sleep(500)
  const back = await page.evaluate(() => { const b = document.getElementById('board').getBoundingClientRect(); return [...document.querySelectorAll('#flowSvg .ball')].filter(g => { const r = g.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2; return x >= b.left && x <= Math.min(b.right, innerWidth) && y >= b.top && y <= Math.min(b.bottom, innerHeight) }).length })
  const c2 = await canvasFit(page)
  L.note(`5 ${tag}: after ⤢ Fit`, JSON.stringify({ ballsInSight: back, canvas: c2 }))
  await shot(page, `lo-2c-f22-turn-${tag.replace('→', '-to-')}-after-fit`)
  L.ok(`5 ${tag}: no console or page error`, errors.length === 0, errors.join(' | '))
  allErrors.push(...errors.map(e => 'turn ' + tag + ': ' + e))
  await browser.close()
}

/* the chart never 0px — every state, at 844×390 and 1280×480 */
const zero = chartLog.filter(([, h]) => h <= 0)
L.ok('4.1 the chart\'s visible room is never 0px in any state walked', zero.length === 0, `min ${Math.min(...chartLog.map(x => x[1]))}px over ${chartLog.length} states; ` + chartLog.map(([w, h]) => `${w}=${h}`).join(' · '))

save('lo-2c-fold', { rows: L.rows, chart: chartLog, errors: allErrors })
const fails = L.rows.filter(r => r.pass === false)
console.log(fails.length ? `\n${fails.length} FAIL` : '\nALL PASS')
process.exit(fails.length ? 1 : 0)
