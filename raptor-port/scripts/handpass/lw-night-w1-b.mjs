// WALKER 1 — scenarios 6 and 7 (the foot note: a phone in Chromium and in WebKit; a desktop; a phone on its side).
// Usage, from raptor-port/:  LW_PORT=4180 [WHICH=phone-chromium,phone-webkit,desk,land] node scripts/handpass/lw-night-w1-b.mjs
import * as H from './lw-night-w1-lib.mjs'
import path from 'node:path'
import { readdirSync, unlinkSync } from 'node:fs'
const { L, T, rec } = H
console.log('lw-night-w1-b v1', L.OUT, 'port', L.PORT)
const WHICH = (process.env.WHICH || 'phone-chromium,phone-webkit,desk,land').split(',')
for (const f of readdirSync(L.OUT)) if (f.endsWith('.png') && /^s0[67]-/.test(f) && WHICH.some(s => f.includes(`-${s}-`))) unlinkSync(path.join(L.OUT, f))
const RED = { border: /240, 85, 95/, bg: /46, 20, 24/, ink: /255, 170, 176/ }
const judge = (id, size, conds, said, pics) => {
  const bad = conds.filter(c => !c[1])
  rec(id, size, bad.length ? 'FAIL' : 'PASS', (bad.length ? 'FAILED: ' + bad.map(c => `${c[0]} (saw ${c[2]})`).join('; ') + ' — ' : '') + said, pics)
}
const footConds = (b, words) => [
  ['the note is at the foot', b.where === 'foot', b.where],
  [`words "${words}"`, b.text === words, b.text],
  ['"Show ›" in it', b.showText === 'Show ›', b.showText],
  ['data-level red', b.level === 'red', b.level],
  ['border red', RED.border.test(b.border || ''), b.border],
  ['fill #2e1418', RED.bg.test(b.bg || ''), b.bg],
  ['words #FFAAB0', RED.ink.test(b.color || ''), b.color],
  ['Show › words red-family', RED.ink.test(b.showColor || ''), b.showColor],
  ['box inside the screen', b.inside, JSON.stringify(b.rect)],
  ['the note’s centre hit is the note', b.hitIsBubble, b.hitTag],
  ['no bubble under the (hidden) button as well', !b.all.mid, JSON.stringify(b.all)],
  ['no sideways page scroll', b.docOverflowX <= 0 && b.pageScrollX === 0, `overflow ${b.docOverflowX} scrollX ${b.pageScrollX}`],
]
const rowsOpen = P => P.evaluate(() => { const e = document.querySelector('[data-testid^="avail-p-2026"]'); return !!e && e.getBoundingClientRect().height > 0 })
async function foldRows(w) {
  const P = w.page
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(250)
  if (await rowsOpen(P)) { await L.press(w, T('counts-toggle')); await P.waitForTimeout(600) }
  return !(await rowsOpen(P))
}
async function f1(w, iso) {
  const P = w.page
  const a0 = await H.availP(w, iso)
  const req = await H.setReq(w, iso, Number(a0)); await P.waitForTimeout(300)
  const cell = await H.rowCell(P, `avail-p-${iso}`)
  if (H.levelOf(cell) !== 'ok') throw new Error(`F1 ${iso}: Available P ${cell.text} ${H.levelOf(cell)}`)
  return { a0, req, cell }
}
/* the placed bid's cell against the note: visible in the viewport? overlap? */
const cellVsNote = (P, who, iso) => P.evaluate(([who, iso]) => {
  const c = document.querySelector(`[data-testid="cell-${who}-${iso}"]`), n = document.querySelector('[data-testid="manning-bubble-foot"]')
  if (!c || !n) return { err: 'missing', cell: !!c, note: !!n }
  const a = c.getBoundingClientRect(), b = n.getBoundingClientRect()
  const ox = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)), oy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
  const inViewport = a.bottom > 0 && a.top < innerHeight && a.right > 0 && a.left < innerWidth
  return { cell: [Math.round(a.left), Math.round(a.top), Math.round(a.right), Math.round(a.bottom)], note: [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)], overlapPx: Math.round(ox * oy), cellInViewport: inViewport, cellFullyVisible: a.top >= 0 && a.bottom <= innerHeight, noteTopMinusCellBottom: Math.round(b.top - a.bottom) }
}, [who, iso])
async function swipeDown(w, dy) { /* a finger moving up the screen (the page goes down), resting before it lifts (walk-scripts §4) */
  const P = w.page
  if (!w.cdp) { await P.evaluate(d => window.scrollBy(0, d), dy); await P.waitForTimeout(400); return 'scrollBy' }
  const x = 55, y0 = Math.min(700, (await P.evaluate(() => innerHeight)) - 70), n = 10
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0, id: 1 }] })
  for (let i = 1; i <= n; i++) { await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 - (dy * i) / n, id: 1 }] }); await P.waitForTimeout(16) }
  await P.waitForTimeout(110)
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await P.waitForTimeout(500)
  return 'finger'
}
const btnOut = P => P.evaluate(() => document.querySelector('[data-testid="counts-toggle"]').getBoundingClientRect().bottom <= 0)
const focusNow = P => P.evaluate(() => { const a = document.activeElement; return a ? (a.dataset?.testid || a.id || a.tagName) : null })

/* ---------- S6: at the foot, a phone (Chromium and WebKit) ---------- */
async function s6(engine) {
  const size = `phone-${engine}`
  const w = await H.startWorld('phone', engine)
  const P = w.page
  const ids = await H.peopleIds(P)
  const iso = '2026-12-16'
  const who1 = ids.Vapor, who2 = ids.Diesel
  try {
    const f = await f1(w, iso)
    const folded = await foldRows(w)
    /* scroll down by finger until the Manning button is off screen */
    let how = '', tries = 0
    while (!(await btnOut(P)) && tries++ < 6) how = await swipeDown(w, 420)
    const out = await btnOut(P)
    /* open the man's day low on the roster */
    await L.openCellR(w, who1, iso); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
    await H.setSwitch(w, false)
    const outAtOpen = await btnOut(P)
    if (!outAtOpen) await H.setManningView(w, false)
    const outAtTap = await btnOut(P)
    let seen = await H.tapPic(w, T('bid-LL'), `s06-${size}-ask-tap`)
    await P.waitForTimeout(500)
    let asked = false
    if (await L.vis(P, T('bid-picker'))) { asked = true; seen = await H.tapPic(w, T('bid-LL'), `s06-${size}-after-tap`); await P.waitForTimeout(600) } else { await P.screenshot({ path: path.join(L.OUT, `s06-${size}-after-tap.png`) }).catch(() => {}) }
    const k = await H.kinds(w, who1, iso)
    const b = await H.bubbleNow(P)
    const cv = await cellVsNote(P, who1, iso)
    const whole = await H.settled(w, `s06-${size}-settled-full`)
    const crop = await H.cropPic(w, `s06-${size}-settled-note`, [T('manning-bubble-foot'), T(`cell-${who1}-${iso}`)], 14)
    judge('S6 first bid out of view', size, [
      ['fixture: Required P typed equals Available P, ok', f.cell.text === f.a0, `${f.a0}`],
      ['Manning folded at the start, then the button scrolled out of view', folded && outAtTap, `folded=${folded} outAfterScroll=${out} (${how}) outAtOpen=${outAtOpen} outAtTap=${outAtTap}`],
      ['LL pending', k.some(x => /^LL\|k-ll\|s-w/.test(x)), JSON.stringify(k)],
      ...footConds(b, 'This bid turns Available P red.'),
      ['the bid just placed is not under the note', !cv.err && cv.overlapPx === 0, JSON.stringify(cv)],
      ['the bid just placed is on screen', !cv.err && cv.cellInViewport, JSON.stringify(cv)],
    ], `Available P ${f.a0} → ${await H.availNow(P, iso).catch(() => '?')}; right after the tap: ${H.bubbleLine(seen)}; settled: ${H.bubbleLine(b)}; cell vs note ${JSON.stringify(cv)}`, [`s06-${size}-after-tap.png`, whole, crop].filter(Boolean))

    /* Show › */
    const before = await rowsOpen(P), sy0 = await P.evaluate(() => scrollY)
    const showSeen = await H.tapPic(w, T('manning-bubble-show'), `s06-${size}-show-after-tap`)
    await P.waitForTimeout(1600)
    const after = await H.bubbleNow(P)
    const inView = !(await btnOut(P)) && (await P.evaluate(() => { const r = document.querySelector('[data-testid="counts-toggle"]').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight }))
    const open = await rowsOpen(P)
    const foc = await focusNow(P)
    const showPic = await H.settled(w, `s06-${size}-show-settled`)
    judge('S6 Show ›', size, [
      ['the note is gone', after.where === 'none', H.bubbleLine(after)],
      ['the page is at the Manning button (in view)', inView, `inView=${inView}`],
      ['the Manning rows are open', open, `before=${before} after=${open}`],
      ['the keyboard focus is on the Manning button', foc === 'counts-toggle', foc],
    ], `after the Show tap: ${H.bubbleLine(after)}; right after the tap: ${H.bubbleLine(showSeen)}; focus ${foc}; rows open ${before}→${open}`, [`s06-${size}-show-after-tap.png`, showPic])

    /* a second bid out of view → the note again, "takes … lower, still red" */
    await foldRows(w)
    let t2 = 0
    while (!(await btnOut(P)) && t2++ < 6) await swipeDown(w, 420)
    await L.openCellR(w, who2, iso); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
    await H.setSwitch(w, false)
    if (!(await btnOut(P))) await H.setManningView(w, false)
    let seen2 = await H.tapPic(w, T('bid-LL'), `s06-${size}-second-ask-tap`)
    await P.waitForTimeout(500)
    if (await L.vis(P, T('bid-picker'))) { seen2 = await H.tapPic(w, T('bid-LL'), `s06-${size}-second-after-tap`); await P.waitForTimeout(600) }
    const b2 = await H.bubbleNow(P), cv2 = await cellVsNote(P, who2, iso), k2 = await H.kinds(w, who2, iso)
    const crop2 = await H.cropPic(w, `s06-${size}-second-settled-note`, [T('manning-bubble-foot'), T(`cell-${who2}-${iso}`)], 14)
    judge('S6 second bid out of view', size, [
      ['LL pending', k2.some(x => /^LL\|k-ll\|s-w/.test(x)), JSON.stringify(k2)],
      ...footConds(b2, 'This bid takes Available P lower, still red.'),
      ['the bid just placed is not under the note', !cv2.err && cv2.overlapPx === 0, JSON.stringify(cv2)],
    ], `right after the tap: ${H.bubbleLine(seen2)}; settled: ${H.bubbleLine(b2)}; cell vs note ${JSON.stringify(cv2)}`, [`s06-${size}-second-after-tap.png`, crop2].filter(Boolean))
  } catch (e) { rec('S6', size, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 500)) }
  rec('errors-6-' + size, size, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
  await w.ctx.close()
}

/* ---------- S7: the foot on a desktop (keys, a wheel) and on a phone's side ---------- */
async function s7desk() {
  const size = 'desk'
  const w = await H.startWorld('desk')
  const P = w.page
  const ids = await H.peopleIds(P)
  const iso = '2026-12-17'
  try {
    const f = await f1(w, iso)
    await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(250)
    await P.mouse.move(700, 500); await P.mouse.wheel(0, 1200); await P.waitForTimeout(500)
    let out = await btnOut(P)
    if (!out) { await P.evaluate(() => window.scrollBy(0, document.querySelector('[data-testid="counts-toggle"]').getBoundingClientRect().bottom + 60)); await P.waitForTimeout(300); out = await btnOut(P) }
    const sy = await P.evaluate(() => scrollY)
    await L.openCellR(w, ids.Vapor, iso); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
    await H.setSwitch(w, false)
    if (!(await btnOut(P))) await H.setManningView(w, false)
    const outAtTap = await btnOut(P)
    let seen = await H.tapPic(w, T('bid-LL'), `s07-${size}-ask-click`)
    await P.waitForTimeout(500)
    if (await L.vis(P, T('bid-picker'))) { seen = await H.tapPic(w, T('bid-LL'), `s07-${size}-after-click`); await P.waitForTimeout(600) }
    const b = await H.bubbleNow(P), cv = await cellVsNote(P, ids.Vapor, iso), k = await H.kinds(w, ids.Vapor, iso)
    const whole = await H.settled(w, `s07-${size}-settled-full`)
    judge('S7 desktop foot note', size, [
      ['LL pending', k.some(x => /^LL\|k-ll\|s-w/.test(x)), JSON.stringify(k)],
      ['button out of view at the tap', outAtTap, `out=${out} outAtTap=${outAtTap} scrollY ${sy}`],
      ...footConds(b, 'This bid turns Available P red.'),
      ['the bid just placed is not under the note', !cv.err && cv.overlapPx === 0, JSON.stringify(cv)],
    ], `${H.bubbleLine(b)}; cell vs note ${JSON.stringify(cv)}`, [`s07-${size}-after-click.png`, whole])
    /* Tab until Show is reached: count, and whether the note stays */
    let n = 0, reached = false, goneAt = null, trail = []
    await P.evaluate(() => document.activeElement?.blur?.())
    for (; n < 400; n++) {
      await P.keyboard.press('Tab'); await P.waitForTimeout(25)
      const foc = await focusNow(P)
      if (n < 6) trail.push(foc)
      const here = (await H.bubbleNow(P)).where
      if (here !== 'foot' && goneAt === null) { goneAt = n + 1; break }
      if (foc === 'manning-bubble-show') { reached = true; n++; break }
    }
    const bAtShow = await H.bubbleNow(P)
    const focPic = await H.settled(w, `s07-${size}-tab-at-show`)
    rec('S7 Tab to Show', size, 'RECORD', `Tab pressed ${n} time(s) from the page with nothing focused: ${reached ? 'reached "Show ›"' : 'did NOT reach Show'}${goneAt ? `; the note went at Tab ${goneAt}` : '; the note stayed up the whole way'}; first focus stops: ${trail.join(' → ')}; at Show: ${H.bubbleLine(bAtShow)}`, [focPic])
    if (reached) {
      await P.keyboard.press('Enter'); await P.waitForTimeout(1500)
      const after = await H.bubbleNow(P)
      const inV = await P.evaluate(() => { const r = document.querySelector('[data-testid="counts-toggle"]').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight })
      const foc = await focusNow(P)
      const pic = await H.settled(w, `s07-${size}-enter-settled`)
      judge('S7 Enter on Show', size, [
        ['note gone', after.where === 'none', H.bubbleLine(after)],
        ['page at the Manning button', inV, `inView=${inV}`],
        ['rows open', await rowsOpen(P), 'rowsOpen'],
        ['focus on the Manning button', foc === 'counts-toggle', foc],
      ], `after Enter on Show: ${H.bubbleLine(after)}; focus ${foc}`, [pic])
    }
    /* a wheel scroll that brings the button back leaves the note until a click (RECORD) */
    await P.mouse.move(700, 500); await P.mouse.wheel(0, 1200); await P.waitForTimeout(400)
    if (!(await btnOut(P))) await H.setManningView(w, false)
    await L.openCellR(w, ids.Diesel, iso); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
    await H.setSwitch(w, false)
    if (!(await btnOut(P))) await H.setManningView(w, false)
    await H.tapPic(w, T('bid-LL'), null)
    await P.waitForTimeout(500)
    if (await L.vis(P, T('bid-picker'))) { await H.tapPic(w, T('bid-LL'), null); await P.waitForTimeout(600) }
    const up0 = await H.bubbleNow(P)
    await P.mouse.move(700, 500); await P.mouse.wheel(0, -4000); await P.waitForTimeout(700)
    const up1 = await H.bubbleNow(P)
    const btnBack = !(await btnOut(P))
    const wp = await H.settled(w, `s07-${size}-wheel-back`)
    rec('S7 wheel back', size, 'RECORD', `note up out of view: ${H.bubbleLine(up0)}; after a wheel scroll that brings the Manning button back into view (button in view: ${btnBack}): ${H.bubbleLine(up1)}`, [wp])
    await P.mouse.click(700, 8); await P.waitForTimeout(250)
    const up2 = await H.bubbleNow(P)
    rec('S7 wheel back then a click', size, up2.where === 'none' ? 'PASS' : 'FAIL', `a click then: ${H.bubbleLine(up2)}`, [])
  } catch (e) { rec('S7 desk', size, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 500)) }
  rec('errors-7-desk', size, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
  await w.ctx.close()
}
async function s7land() {
  const size = 'land'
  const b0 = await L.getBrowser('chromium')
  const ctx = await b0.newContext({ viewport: { width: 402, height: 874 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3, userAgent: (await import('@playwright/test')).devices['iPhone 13'].userAgent })
  const page = await ctx.newPage()
  const errs = []
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)) })
  page.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 200)))
  page.on('response', r => { if (r.status() >= 400) errs.push(`http ${r.status()}: ` + r.url().slice(0, 120)) })
  const w = { ctx, page, cdp: await ctx.newCDPSession(page), errs, phone: true, size, engine: 'chromium' }
  const P = page
  try {
    await L.signIn(w, 'admin'); await H.hideTransient(P)
    const ids = await H.peopleIds(P)
    const iso = '2026-12-18'
    const f = await f1(w, iso)
    await foldRows(w)
    /* turned on its side after the set-up (the number pad of F1 needs the tall screen) */
    await P.setViewportSize({ width: 874, height: 402 }); await P.waitForTimeout(1200)
    await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
    let t = 0
    while (!(await btnOut(P)) && t++ < 8) await swipeDown(w, 200)
    console.log('   land: scrollY', await P.evaluate(() => scrollY), 'btnOut', await btnOut(P), 'vp', JSON.stringify(P.viewportSize()))
    await P.locator(T(`cell-${ids.Vapor}-${iso}`)).evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await P.waitForTimeout(300)
    const cc = await L.centre(P, T(`cell-${ids.Vapor}-${iso}`)); console.log('   land: cell centre', JSON.stringify({ x: cc.x, y: cc.y }), 'hit', await P.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.dataset.testid || e.className || e.tagName) : null }, [cc.x, cc.y]))
    await L.openCellR(w, ids.Vapor, iso); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
    await H.setSwitch(w, false)
    if (!(await btnOut(P))) await H.setManningView(w, false)
    let seen = await H.tapPic(w, T('bid-LL'), `s07-${size}-ask-tap`)
    await P.waitForTimeout(500)
    if (await L.vis(P, T('bid-picker'))) { seen = await H.tapPic(w, T('bid-LL'), `s07-${size}-after-tap`); await P.waitForTimeout(600) }
    const b = await H.bubbleNow(P), cv = await cellVsNote(P, ids.Vapor, iso)
    const whole = await H.settled(w, `s07-${size}-settled-full`)
    judge('S7 on its side: the note fits', size, [...footConds(b, 'This bid turns Available P red.'), ['the bid just placed is not under the note', !cv.err && cv.overlapPx === 0, JSON.stringify(cv)]], `874×402; ${H.bubbleLine(b)}; cell vs note ${JSON.stringify(cv)}`, [`s07-${size}-after-tap.png`, whole])
    const showSeen = await H.tapPic(w, T('manning-bubble-show'), `s07-${size}-show-after-tap`)
    await P.waitForTimeout(1600)
    const after = await H.bubbleNow(P)
    const inV = await P.evaluate(() => { const r = document.querySelector('[data-testid="counts-toggle"]').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight })
    const open = await rowsOpen(P)
    judge('S7 on its side: Show can be pressed', size, [['note gone', after.where === 'none', H.bubbleLine(after)], ['Manning button in view', inV, `${inV}`], ['rows open', open, `${open}`]], `after Show: ${H.bubbleLine(after)}`, [`s07-${size}-show-after-tap.png`])
  } catch (e) { await P.screenshot({ path: path.join(L.OUT, 's07-land-stopped.png') }).catch(() => {}); const d = await L.sheetDump(P).catch(() => null); rec('S7 land', size, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 300) + ' | sheet: ' + JSON.stringify(d)?.slice(0, 200), ['s07-land-stopped.png']) }
  rec('errors-7-land', size, errs.length ? 'FAIL' : 'PASS', errs.length ? errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
  await ctx.close()
}

if (WHICH.includes('phone-chromium')) { console.log('-- S6 phone chromium'); await s6('chromium') }
if (WHICH.includes('phone-webkit')) { console.log('-- S6 phone webkit'); await s6('webkit') }
if (WHICH.includes('desk')) { console.log('-- S7 desk'); await s7desk() }
if (WHICH.includes('land')) { console.log('-- S7 land'); await s7land() }
await L.closeBrowser()
H.saveResults(`b-${WHICH.join('-')}`)
const R = H.results, c = r => R.filter(x => x.verdict === r).length
console.log('DONE', R.length, 'records:', c('PASS'), 'PASS', c('FAIL'), 'FAIL', c('RECORD'), 'RECORD', c('NOT DONE'), 'NOT DONE')
