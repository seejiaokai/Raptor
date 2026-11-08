/* CHAT 9 — the Tracker's walk, part B: S5–S15 (the other openers, his PC, the keys, a second press, the narrow desktop,
   the phone on its side, the short desktop, the pinch, less motion, a press during the slide, a second event). */
import * as L from './trk-chat9-lib.mjs'
const { scn, ok, note, row, mkWorld, closeW, geo, limitOf, r1, inter, pic, tapXY, land, closePop, setScroll, placeAt, pressTraced, traceStart, traceStop, analyse, fmtAn, checkW, wsay, undoState, sleep, PHONE, SIDE, PC, PCREAL, NARROW, SHORTPC, BIG, SHORT500, typeFind, finger, shownRow, keysTo } = L

const popHeading = page => page.evaluate(() => { const t = document.getElementById('popTitle'); return t ? t.textContent : null })
const gradeState = page => page.evaluate(() => { const u = document.getElementById('trUndoBtn'); const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === 'ACG-09'); return { undoOff: u && u.disabled, undoTitle: u && u.title, wedges: g ? [...g.querySelectorAll('path.wedge')].map(p => p.getAttribute('fill')).join(',') : '' } })
const stats = page => page.evaluate(() => ({ st: document.getElementById('board').scrollTop, sel: document.getElementById('activeSel') && document.getElementById('activeSel').selectedOptions[0].textContent }))
const closeAnyPop = async w => { const g = await geo(w.page, null); if (g.pop && g.pop.shown) await closePop(w) }
/* a ball's other-student wedge point: a point on the ring's other half */
const wedgePoint = (page, id, which) => page.evaluate(([id, which]) => {
  const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id); const w = g.querySelector(`path.wedge[data-wi="${which}"]`); const r = w.getBoundingClientRect()
  return { x: (r.left + r.right) / 2, y: which === 0 ? r.top + 1.5 : r.bottom - 1.5, rect: [r.left, r.top, r.right, r.bottom].map(Math.round), mine: g.querySelector('path.mine') && g.querySelector('path.mine').dataset.wi }
}, [id, which])

/* ---------------- S5 ---------------- */
await scn('s05', 'The other openers, and the taps that must not open it', async () => {
  const w = await mkWorld({ size: PHONE, touch: true }); const page = w.page
  const s0 = await stats(page)
  await page.locator('#activeSel').selectOption({ label: 'STUDENT B' }); await sleep(1600)
  const s1 = await stats(page)
  /* the ball nearest the landing point of D984 (the chart box's landing band) */
  const near = await page.evaluate(() => { const bd = document.getElementById('board').getBoundingClientRect(); const c = bd.top + (433 - 165); return [...document.querySelectorAll('#flowSvg .ball')].map(x => { const r = x.getBoundingClientRect(); return { id: x.dataset.id, d: Math.abs((r.top + r.bottom) / 2 - c), y: Math.round((r.top + r.bottom) / 2) } }).sort((a, b) => a.d - b.d).slice(0, 3) })
  note('1 Crew → Student B (D984)', `${s0.sel} → ${s1.sel}; scrollTop ${s0.st} → ${s1.st}; balls nearest the landing band ${JSON.stringify(near)}`, await pic(w, 's05-studentB-landed'))
  let id = near[0].id; let g0 = await geo(page, id)
  /* an event that needs a slide: if the landed one fits below, scroll it down first so the slide case is walked */
  const r = await pressTraced(w, id); const c = await checkW(w, id, { slid: r.an.slid }); const h = await popHeading(page)
  ok('1 tap the landed event: window names Student B', c.fails.length === 0 && /STUDENT B/i.test(h || ''), `${id}: heading "${h}"; ${fmtAn(r.an)} | ${wsay(c)}`, await pic(w, 's05-studentB-open'))
  await closePop(w)
  /* 2 another student's wedge */
  await page.locator('#activeSel').selectOption({ label: 'STUDENT A' }); await sleep(1500)
  const gg = await geo(page, 'ACG-09'); await setScroll(w, gg.st + (gg.ball.y - 420)); const gb = await geo(page, 'ACG-09')
  const wp = await wedgePoint(page, 'ACG-09', 1); const st0 = (await stats(page)).st
  await page.touchscreen.tap(wp.x, wp.y); const pA = await pic(w, 's05-wedge-tap-now'); await sleep(900)
  const after = await stats(page); const gp = await geo(page, 'ACG-09')
  ok('2 another student’s wedge picks him; nothing opens; the chart does not move (A3)', after.sel === 'STUDENT B' && !(gp.pop && gp.pop.shown) && Math.abs(after.st - st0) <= 1, `wedge point ${Math.round(wp.x)},${Math.round(wp.y)} (ring ${wp.rect}); crew ${await Promise.resolve('STUDENT A')} → ${after.sel}; scrollTop ${st0} → ${after.st}; window shown ${!!(gp.pop && gp.pop.shown)}`, 's05-wedge-tap-now,' + await pic(w, 's05-wedge-tap-set'))
  /* his own wedge (now the picked one): the window with its slide if needed */
  const mineWi = (await wedgePoint(page, 'ACG-09', 1)).mine
  const wp2 = await wedgePoint(page, 'ACG-09', Number(mineWi)); await page.touchscreen.tap(wp2.x, wp2.y); await sleep(1400)
  const gp2 = await geo(page, 'ACG-09'); const h2 = await popHeading(page)
  note('2b his own wedge', `mine wedge ${mineWi}: window ${gp2.pop && gp2.pop.shown ? 'opened (' + h2 + ')' : 'did not open'}; scrollTop ${gp2.st}`, await pic(w, 's05-ownwedge'))
  await closeAnyPop(w)
  /* 3 ⓘ details mode */
  await page.locator('#detailsBtn').tap(); await sleep(300)
  const gd = await placeAt(w, 'ACG-09', 433); const stD = gd.st
  await tapXY(w, gd.ball.x, gd.ball.y); await sleep(900)
  const gdd = await geo(page, 'ACG-09')
  const bub = await page.evaluate(() => { const els = [...document.querySelectorAll('body *')].filter(e => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return (cs.position === 'fixed' || cs.position === 'absolute') && r.width > 60 && r.height > 20 && /Type:|Crew|Prerequisites/.test(e.textContent) && e.id !== 'pop' && e.children.length < 12 && r.top >= 0 }).map(e => { const r = e.getBoundingClientRect(); return { id: e.id, cls: String(e.className).slice(0, 20), t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right) } }); return els.slice(-2) })
  ok('3 ⓘ on: the bubble, not the marking window, and no slide', !(gdd.pop && gdd.pop.shown) && Math.abs(gdd.st - stD) <= 1, `scrollTop ${stD} → ${gdd.st}; marking window shown ${!!(gdd.pop && gdd.pop.shown)}; bubble ${JSON.stringify(bub)}; tabs foot ${r1(gdd.tabs && gdd.tabs.b)}; bubble over the bars or tabs: ${bub.some(b => b.t < limitOf(gdd))}`, await pic(w, 's05-details-bubble'))
  await page.touchscreen.tap(30, 750).catch(() => {}); await sleep(300)
  await page.locator('#detailsBtn').tap(); await sleep(300)
  /* 4 Edit chart layout */
  await page.locator('#sylMenuBtn').tap(); await sleep(300); await page.locator('#arrangeBtn').tap(); await sleep(500)
  const ga = await placeAt(w, 'ACG-09', 433); await tapXY(w, ga.ball.x, ga.ball.y); await sleep(1000); const ga2 = await geo(page, 'ACG-09')
  ok('4 Edit chart layout: a tap arranges — no window, no slide', !(ga2.pop && ga2.pop.shown) && Math.abs(ga2.st - ga.st) <= 1, `scrollTop ${ga.st} → ${ga2.st}; window shown ${!!(ga2.pop && ga2.pop.shown)}`, await pic(w, 's05-arrange'))
  await page.locator('#sylMenuBtn').tap(); await sleep(300); await page.locator('#arrangeBtn').tap(); await sleep(500)
  ok('4b arrange mode left', !(await page.evaluate(() => /Done editing/.test(document.getElementById('arrangeBtn') ? document.getElementById('arrangeBtn').textContent : '')) ), 'the menu row reads Edit chart layout again')
  /* 5 Show All */
  await page.locator('#showAllTab').tap(); await sleep(700)
  const rowSel = page.locator('#page-tracker .sid', { hasText: /^ACG-09$/ }).first()
  const cnt = await rowSel.count()
  if (cnt) { await rowSel.tap(); await sleep(1000) }
  const gs = await geo(page, 'ACG-09')
  note('5 Show All: the row for ACG-09 pressed', `row found ${cnt}; marking window shown ${!!(gs.pop && gs.pop.shown)}; what opened: ${await page.evaluate(() => [...document.querySelectorAll('.modal, #dlgModal, #infoModal')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.id).join(',') || 'nothing visible')}`, await pic(w, 's05-showall-row'))
  await page.keyboard.press('Escape'); await sleep(300)
  ok('errors', w.errors.length === 0, w.errors.join(' / ') || 'none')
  await closeW(w)
})

/* ---------------- S6 ---------------- */
await scn('s06', 'His PC', async () => {
  for (const [name, size, dpr] of [['pc', PC, 1.25], ['pcreal', PCREAL, 1.25], ['big', BIG, 1]]) {
    const w = await mkWorld({ size, dpr }); const page = w.page
    const g = await land(w, 'ACG-09', 'enter')
    ok(`${name} 1 landed by the bar's Find + Enter`, g.ball.found && g.ball.y > g.board.t && g.ball.y < g.board.b, `ACG-09 ${r1(g.ball.t)}–${r1(g.ball.b)}, board ${r1(g.board.t)}–${r1(g.board.b)}, scrollTop ${g.st}, found ring ${g.ball.found}`, await pic(w, `s06-${name}-landed`))
    const u0 = await undoState(page); const errN = w.errors.length
    const r = await pressTraced(w, 'ACG-09'); const c = await checkW(w, 'ACG-09', { undo: u0, errN, slid: r.an.slid })
    const popH = c.g.pop ? c.g.pop.b - c.g.pop.t : 0; const fits = g.ball.b + 4 + popH <= g.board.b + 0.5
    ok(`${name} 2 click: slide only if it would not fit (limit = the Tracker bar's foot ${r1(c.L)})`, c.fails.length === 0 && r.an.slid === !fits && r.an.shownDuring === 0 && r.an.moved === 0 && r.an.unseenPressable === 0, `fits below: ${fits}; ${fmtAn(r.an)} | ${wsay(c)}`, await pic(w, `s06-${name}-open`))
    await closePop(w); const stC = (await geo(page)).st; await sleep(1000); const stC2 = (await geo(page)).st
    const r2 = await pressTraced(w, 'ACG-09'); const c2 = await checkW(w, 'ACG-09', { slid: false })
    ok(`${name} 3 closed (W7) and clicked again: no slide`, Math.abs(stC - stC2) <= 1 && !r2.an.slid && c2.fails.length === 0, `scrollTop after close ${stC} → ${stC2}; second click ${fmtAn(r2.an)} | ${wsay(c2)}`)
    await closePop(w)
    if (name === 'pc') {
      /* 5 zoom */
      const zr = []
      for (const [lab, n, key] of [['in×3', 3, '#fzIn'], ['out×3 from there', 6, '#fzOut']]) {
        for (let k = 0; k < n; k++) { await page.locator(key).click(); await sleep(300) }
        await sleep(400); const pct = await page.evaluate(() => document.getElementById('fzPct').textContent)
        await land(w, 'ACG-09', 'enter')
        const gz = await geo(page, 'ACG-09'); const rz = await pressTraced(w, 'ACG-09'); const cz = await checkW(w, 'ACG-09', { slid: rz.an.slid })
        zr.push(`${lab} (${pct}): ${rz.an.slid ? 'slide ' + rz.an.slideLen : 'no slide'} ${cz.fails.length ? 'FAIL ' + cz.fails.join(';') : 'ok'}; ${cz.facts[0] || ''}`)
        await pic(w, `s06-pc-zoom-${lab.slice(0, 3).replace('×', 'x')}`); await closePop(w)
      }
      await page.locator('#fzReset').click(); await sleep(400)
      const fit = await page.evaluate(() => { const b = [...document.querySelectorAll('#page-tracker button')].find(x => /Fit/.test(x.textContent)); return !!b })
      ok('pc 5 zoom in ×3 / out ×3', zr.every(s => !/FAIL/.test(s)), zr.join(' | ') + `; "⤢ Fit" button exists on the chart bar: ${fit} (only in Edit chart layout)`)
    }
    ok(`${name} errors`, w.errors.length === 0, w.errors.join(' / ') || 'none')
    await closeW(w)
  }
  /* PC-REAL: how many of S2's places need the slide */
  const w = await mkWorld({ size: PCREAL, dpr: 1.25 }); await land(w, 'ACG-09', 'enter')
  const g = await geo(w.page); const L0 = limitOf(g); const need = []
  for (let y = Math.ceil(L0 + 20); y <= g.board.b - 14; y += 40) {
    const gg = await placeAt(w, 'ACG-09', y); if (Math.abs(gg.ball.y - y) > 3) continue
    const r = await pressTraced(w, 'ACG-09', { wait: 1300 }); need.push(`${Math.round(y)}:${r.an.slid ? 'S' : '-'}`); await closePop(w)
  }
  note('4 PC-REAL (730 tall): places needing the slide', need.join(' '))
  await closeW(w)
})

/* ---------------- S7 ---------------- */
await scn('s07', 'By keyboard (D980)', async () => {
  for (const [name, size, dpr] of [['pc', PC, 1.25], ['narrow', NARROW, 1]]) {
    const w = await mkWorld({ size, dpr, bars: name === 'narrow' }); const page = w.page
    await land(w, 'ACG-09', 'enter')
    /* the chart takes the keys: Tab from the box until the board is the active element */
    await page.keyboard.press('Escape').catch(() => {})
    await page.locator('#fileMenuBtn, #flexBtn').first().focus().catch(() => {})
    let tabs = 0; let ae = ''
    for (; tabs < 25; tabs++) { await page.keyboard.press('Tab'); ae = await page.evaluate(() => document.activeElement && (document.activeElement.id || document.activeElement.tagName)); if (ae === 'board') break }
    tabs++
    ok(`${name} 1 the chart takes the keys on a Tab`, ae === 'board', `active element after ${tabs} Tab press(es) from the control before the chart: ${ae}`)
    /* arrows to ACG-09 */
    const ring = () => page.evaluate(() => { const k = document.querySelector('#flowSvg .kbdring'); return k ? k.dataset.id : null })
    let at = await ring(); let n = 0; const path = [at]
    for (const key of ['ArrowDown', 'ArrowRight', 'ArrowLeft', 'ArrowUp']) {
      for (n = 0; n < 24 && at !== 'ACG-09'; n++) { await page.keyboard.press(key); await sleep(120); const nx = await ring(); if (nx === at) break; at = nx; path.push(at) }
      if (at === 'ACG-09') break
    }
    const g = await geo(page, 'ACG-09'); const popH = 430; const fits = g.ball && g.ball.b + 4 + popH <= g.board.b
    note(`${name} 1b arrows to ACG-09`, `ring on ${at}; path ${path.slice(-8).join('>')}; ACG-09 ${g.ball ? r1(g.ball.t) + '–' + r1(g.ball.b) : '-'}, would fit below: ${fits}`, await pic(w, `s07-${name}-ring`))
    if (at !== 'ACG-09') { ok(`${name} keys reached ACG-09`, false, 'the ring never reached ACG-09'); await closeW(w); continue }
    if (g.ball.b + 4 + 430 <= g.board.b) { await setScroll(w, g.st - ((g.board.b - 40) - g.ball.b)); }  /* lower the event so the window needs a slide */
    const u0 = await undoState(page); const errN = w.errors.length
    await traceStart(page, 'ACG-09'); await page.keyboard.press('Enter'); await sleep(1600)
    const rows = await traceStop(page); const an = analyse(rows); const c = await checkW(w, 'ACG-09', { undo: u0, errN, slid: an.slid })
    const firstIn = rows.findIndex(r => r.ae.endsWith('@pop')); const inWhileHidden = rows.some(r => r.ae.endsWith('@pop') && !shownRow(r)); const bodyAfter = rows.slice(an.shownT != null ? rows.findIndex(shownRow) : 0).some(r => r.ae === 'BODY')
    ok(`${name} 2 Enter: slide then window; the keys inside from its first shown frame`, c.fails.length === 0 && firstIn >= 0 && !inWhileHidden && !bodyAfter && (rows.findIndex(shownRow) <= firstIn), `${fmtAn(an)}; keys first in the window at ${firstIn >= 0 ? rows[firstIn].t + 'ms' : 'never'} (window first shown ${an.shownT}ms), inside while unseen: ${inWhileHidden}; on the page body once shown: ${bodyAfter}; frame ae path ${[...new Set(rows.map(r => r.ae))].join('>')} | ${wsay(c)}`, await pic(w, `s07-${name}-open`))
    /* 3 Tab round the window */
    const stops = []; for (let i = 0; i < 14; i++) { await page.keyboard.press('Tab'); await sleep(60); stops.push(await page.evaluate(() => { const a = document.activeElement; const p = document.getElementById('pop'); const r = a.getBoundingClientRect(); const pr = p ? p.getBoundingClientRect() : null; return (a.id || (a.textContent || '').trim().slice(0, 10) || a.tagName) + (p && p.contains(a) ? '' : '(OUT)') + (pr && (r.bottom > pr.bottom + 1 || r.top < pr.top - 1) ? '(clipped)' : '') })) }
    const outs = stops.filter(s => /OUT|clipped/.test(s)); const cyc = new Set(stops).size
    ok(`${name} 3 Tab / Shift+Tab round the window, each stop in view`, outs.length === 0 && cyc >= 6, `stops ${stops.join(' > ')}`, await pic(w, `s07-${name}-tab`))
    for (let i = 0; i < 4; i++) await page.keyboard.press('Shift+Tab')
    /* 4 Escape */
    await page.keyboard.press('Escape'); await sleep(600)
    const ge = await geo(page, 'ACG-09'); const kr = await ring(); const stE = ge.st
    const top = await page.evaluate(() => { const k = document.querySelector('#flowSvg .kbdring'); if (!k) return null; const r = k.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + 2); return { top: r.top, hit: e ? (e.id || e.tagName + '.' + String(e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className).slice(0, 14)) : null } })
    await sleep(900)
    ok(`${name} 4 Escape: window gone, the keys back on ACG-09 and its ring clear of the bar`, !(ge.pop && ge.pop.shown) && kr === 'ACG-09' && ge.ae === 'board' && top && top.top >= (limitOf(ge) - 0.5) && Math.abs((await geo(page)).st - stE) <= 1, `ring on ${kr}; active ${ge.ae}; ring top ${top && r1(top.top)} vs limit ${r1(limitOf(ge))}; element at the ring's top point: ${top && top.hit}; scrollTop ${stE} → ${(await geo(page)).st}`, await pic(w, `s07-${name}-escape`))
    /* 5 ↓ then Enter within 100ms */
    const before = await ring(); await page.keyboard.press('ArrowDown'); await sleep(30); await page.keyboard.press('Enter'); await sleep(1700)
    const after = await ring(); const gx = await geo(page, after); const hx = await popHeading(page)
    const cx = await checkW(w, after, { slid: undefined })
    ok(`${name} 5 ↓ then Enter within 100ms (D989): the window for the event the ring is on, whole`, !!(gx.pop && gx.pop.shown) && (hx || '').startsWith(after) && cx.fails.length === 0, `ring ${before} → ${after}; heading "${hx}"; ${wsay(cx)}`, await pic(w, `s07-${name}-down-enter`))
    await page.keyboard.press('Escape'); await sleep(500)
    ok(`${name} errors`, w.errors.length === 0, w.errors.join(' / ') || 'none')
    await closeW(w)
  }
  /* 7 Enter on the chart's last event */
  const w = await mkWorld({ size: PHONE, touch: true, dpr: 2 })
  await setScroll(w, 1e6); await sleep(300)
  await w.page.locator('#board').focus(); await sleep(200)
  let at = null; for (let i = 0; i < 60; i++) { await w.page.keyboard.press('ArrowDown'); await sleep(40); const k = await w.page.evaluate(() => { const k = document.querySelector('#flowSvg .kbdring'); return k && k.dataset.id }); if (k === at && i > 20) break; at = k }
  const gl = await geo(w.page, at)
  await w.page.keyboard.press('Enter'); await sleep(1500); const cl = await checkW(w, at, { slid: false })
  note('7 Enter on the last event reached by the arrows (' + at + ')', wsay(cl), await pic(w, 's07-phone-last-enter'))
  await closeW(w)
})

/* ---------------- S8 ---------------- */
await scn('s08', 'A second press while the chart slides', async () => {
  const cases = [
    ['a1 phone two taps 300ms apart', PHONE, true, async (w, g) => { await w.page.touchscreen.tap(g.ball.x, g.ball.y); await sleep(300); await w.page.touchscreen.tap(g.ball.x, g.ball.y) }],
    ['a2 phone two taps 600ms apart', PHONE, true, async (w, g) => { await w.page.touchscreen.tap(g.ball.x, g.ball.y); await sleep(600); await w.page.touchscreen.tap(g.ball.x, g.ball.y) }],
    ['b1 pc double click', PC, false, async (w, g) => { await w.page.mouse.dblclick(g.ball.x, g.ball.y) }],
    ['b2 pc two clicks 250ms apart', PC, false, async (w, g) => { await w.page.mouse.click(g.ball.x, g.ball.y); await sleep(250); await w.page.mouse.click(g.ball.x, g.ball.y) }],
    ['c1 pc keys Enter, Enter within 150ms', PC, false, async (w, g) => { await w.page.keyboard.press('Enter'); await sleep(100); await w.page.keyboard.press('Enter') }],
    ['c2 pc keys Enter, Space within 150ms', PC, false, async (w, g) => { await w.page.keyboard.press('Enter'); await sleep(100); await w.page.keyboard.press('Space') }],
  ]
  for (const [lab, size, touch, act] of cases) {
    const w = await mkWorld({ size, touch, dpr: touch ? 2 : 1.25 }); const page = w.page
    let g = await land(w, 'ACG-09', touch ? 'pick' : 'enter')
    if (lab.startsWith('c')) { /* keys on ACG-09 and lower it so it needs a slide */
      await keysTo(w, 'ACG-09')
      g = await geo(page, 'ACG-09'); if (g.ball.b + 434 <= g.board.b) { await setScroll(w, g.st - (g.board.b - 40 - g.ball.b)); g = await geo(page, 'ACG-09') }
    } else if (!touch && g.ball.b + 434 <= g.board.b) { g = await placeAt(w, 'ACG-09', g.board.b - 40) }
    const u0 = await undoState(page); const gs0 = await gradeState(page); await traceStart(page, 'ACG-09')
    await act(w, g); await sleep(1800)
    const rows = await traceStop(page); const an = analyse(rows); const c = await checkW(w, 'ACG-09', { undo: u0, slid: an.slid }); const gs1 = await gradeState(page)
    const pTxt = await page.evaluate(() => { const p = document.getElementById('pop'); return p && getComputedStyle(p).display !== 'none' ? [...p.querySelectorAll('.opts button')].map(b => b.textContent.trim() + (b.classList.contains('on') || b.classList.contains('active') || b.getAttribute('aria-pressed') === 'true' ? '*' : '')).join(',') : 'no window' })
    const unchanged = gs0.wedges === gs1.wedges && JSON.stringify(gs0.undoOff) === JSON.stringify(gs1.undoOff) && gs0.undoTitle === gs1.undoTitle
    const closedByPress = an.shownT == null && !(c.g.pop && c.g.pop.shown)   /* Q6: a press that closed it — the window never opened */
    ok(`${lab}: no grade written; invariants`, unchanged && (c.fails.length === 0 || (closedByPress && c.fails.join() === 'no window shown')) && an.unseenPressable === 0 && an.shownDuring === 0, `slide ${an.slideLen}px; ${fmtAn(an)}; wedges ${gs0.wedges === gs1.wedges ? 'unchanged' : gs0.wedges + ' → ' + gs1.wedges}; undo ${gs0.undoOff}/${gs0.undoTitle} → ${gs1.undoOff}/${gs1.undoTitle}; after 1.8s window ${c.g.pop && c.g.pop.shown ? 'shown' : 'gone'} (${pTxt}) | ${wsay(c)}`, await pic(w, `s08-${lab.split(' ')[0]}`))
    await closeW(w)
  }
})

/* ---------------- S9 ---------------- */
await scn('s09', 'The narrow desktop with a mouse', async () => {
  const w = await mkWorld({ size: NARROW, dpr: 1, bars: true }); const page = w.page
  const g0 = await geo(page)
  const barW = await page.evaluate(() => { const b = document.getElementById('board'); return { sbw: b.offsetWidth - b.clientWidth, sbh: b.offsetHeight - b.clientHeight } })
  ok('1 tabs show, and the chart’s scroll bars (D1406)', !!g0.tabs && (barW.sbw > 0 || barW.sbh > 0), `tabs ${g0.tabs ? r1(g0.tabs.t) + '–' + r1(g0.tabs.b) : 'none'}; chart bar width ${barW.sbw}, height ${barW.sbh}`, await pic(w, 's09-open'))
  const g = await land(w, 'ACG-09', 'pick')
  ok('2 Find (strip): lands, strip goes', g.ball.found && !(await page.evaluate(() => document.getElementById('hSearchPanel').classList.contains('on'))), `ACG-09 ${r1(g.ball.t)}–${r1(g.ball.b)}; found ${g.ball.found}`, await pic(w, 's09-landed'))
  const u0 = await undoState(page); const r = await pressTraced(w, 'ACG-09'); const c = await checkW(w, 'ACG-09', { undo: u0, slid: r.an.slid })
  const pop = c.g.pop; const bd = await page.evaluate(() => { const b = document.getElementById('board'); const r = b.getBoundingClientRect(); return { right: r.right, sb: b.offsetWidth - b.clientWidth } })
  ok('3 click: slide under the TABS; window whole', r.an.slid && c.fails.length === 0 && Math.abs(c.L - c.g.tabs.b) < 1, `limit ${r1(c.L)} = tabs foot ${r1(c.g.tabs.b)}; ${fmtAn(r.an)} | ${wsay(c)}; window ${r1(pop.l)}–${r1(pop.r)} wide, chart's scroll bar at x ${r1(bd.right - bd.sb)}–${r1(bd.right)}: overlaps ${pop.r > bd.right - bd.sb}`, await pic(w, 's09-open-window'))
  const st = (await geo(page)).st
  await page.mouse.move(pop.l - 60, 500); await page.mouse.wheel(0, 300); await sleep(900)
  const g2 = await geo(page, 'ACG-09')
  note('4 wheel over the chart with the window open', `scrollTop ${st} → ${g2.st}; window ${g2.pop && g2.pop.shown ? 'stays at ' + r1(g2.pop.t) + '–' + r1(g2.pop.b) + ' while ACG-09 is now ' + r1(g2.ball.t) + '–' + r1(g2.ball.b) : 'closed'}; over the event's new place: ${g2.pop && g2.pop.shown ? inter(g2.pop, g2.ball) : false}`, await pic(w, 's09-wheel'))
  ok('errors', w.errors.length === 0, w.errors.join(' / ') || 'none')
  await closeW(w)
})

/* ---------------- S10 ---------------- */
await scn('s10', 'The phone on its side', async () => {
  const w = await mkWorld({ size: SIDE, touch: true }); const page = w.page
  const g0 = await geo(page)
  note('1 heights', `top bar ${r1(g0.topbar.b - g0.topbar.t)}, Tracker bar ${g0.hdr ? r1(g0.hdr.b - g0.hdr.t) : 'none'}, tabs ${g0.tabs ? r1(g0.tabs.b - g0.tabs.t) : 'none'}, chart box ${r1(g0.board.b - g0.board.t)} (viewport ${g0.vh}), limit ${r1(limitOf(g0))}`, await pic(w, 's10-open'))
  const g = await land(w, 'ACG-09', 'pick'); const u0 = await undoState(page)
  const r = await pressTraced(w, 'ACG-09'); const c = await checkW(w, 'ACG-09', { undo: u0, slid: r.an.slid }); const p = c.g.pop
  ok('2 ACG-09 as high as it may go, the window under it scrolling inside itself', r.an.slid && p && p.scrolls && Math.abs(c.g.ball.t - c.L - 22.2) < 3 && p.b <= c.g.vh + 0.5 && c.fails.length === 0, `limit ${r1(c.L)}, event top ${r1(c.g.ball.t)} (${r1(c.g.ball.t - c.L)} below it); window ${r1(p.t)}–${r1(p.b)}, content ${p.sh} in ${p.ch}, foot margin ${r1(c.g.vh - p.b)}; ${fmtAn(r.an)} | ${wsay(c)}`, await pic(w, 's10-open-window'))
  /* 3 inner scroll */
  const st0 = c.g.st; await finger(w, (p.l + p.r) / 2, p.b - 25, 0, -120); const af = await geo(page, 'ACG-09')
  ok('3 a finger drag inside the window scrolls it; the chart does not move', af.pop.st > 0 && Math.abs(af.st - st0) <= 1, `window scrollTop ${p.st} → ${af.pop.st}; chart ${st0} → ${af.st}`, await pic(w, 's10-inner'))
  await finger(w, (p.l + p.r) / 2, p.b - 25, 0, -200); const af2 = await geo(page, 'ACG-09')
  ok('3b dragged on past its end: the chart still does not move', Math.abs(af2.st - st0) <= 1, `chart ${st0} → ${af2.st}; window scrollTop ${af2.pop.st} of ${af2.pop.sh - af2.pop.ch}`)
  /* Edit details + Close reached and pressed */
  const cw = await checkW(w, 'ACG-09', { slid: true }); ok('3c Close and Edit details reached by a tap', cw.fails.length === 0, wsay(cw))
  /* 4 the calendar */
  await page.evaluate(() => { document.getElementById('pop').scrollTop = 0 }); await sleep(200)
  await page.locator('#popDoneDate').tap(); await sleep(700)
  const cal = await page.evaluate(() => { const c = document.querySelector('.dcal, .datecal, [class*="dcal"]'); if (!c) return null; const r = c.getBoundingClientRect(); const pts = [[r.left + 4, r.top + 4], [r.right - 4, r.top + 4], [r.left + 4, r.bottom - 4], [r.right - 4, r.bottom - 4]]; return { r: [r.left, r.top, r.right, r.bottom].map(Math.round), vw: innerWidth, vh: innerHeight, corners: pts.map(([x, y]) => { const e = document.elementFromPoint(x, y); return !!e && c.contains(e) }), sc: c.scrollHeight > c.clientHeight + 1 } })
  ok('4 Done on: the calendar whole on screen (or scrollable)', !!cal && cal.r[1] >= 0 && (cal.r[3] <= cal.vh + 1 || cal.sc) && cal.corners.every(Boolean), JSON.stringify(cal), await pic(w, 's10-calendar'))
  const days = page.locator('.dcal-d:not(.is-out):not(.is-blank)'); const nd = await days.count()
  if (nd) { await days.nth(2).tap(); await sleep(900) }
  const calGone = !(await page.evaluate(() => { const c = document.querySelector('.dcal'); return !!c && c.getBoundingClientRect().width > 0 }))
  const ag = await geo(page, 'ACG-09')
  ok('4b pick a past day: the calendar goes, the window where it was, the chart unmoved', calGone && !!(ag.pop && ag.pop.shown) && Math.abs(ag.pop.t - p.t) <= 1 && Math.abs(ag.st - st0) <= 1, `calendar days ${nd}; window ${ag.pop && r1(ag.pop.t)} (was ${r1(p.t)}); chart ${st0} → ${ag.st}`, await pic(w, 's10-picked'))
  /* a grade was not pressed, but a date pick may have changed the record: Undo state */
  await closePop(w)
  /* 5 the chart's last event */
  await setScroll(w, 1e6); const gEnd = await geo(page, null); const low = 'ST-18'; await placeAt(w, low, limitOf(gEnd) + 70); note('5 premise', `at the chart's end (scrollTop ${gEnd.st} of ${gEnd.sh - gEnd.ch}) the last event ${low} sits above the chart box (the chart ends with about ${Math.round(gEnd.ch - 54)}px of blank below it), so no event is ever short of room to slide; ${low} is placed 70px under the limit instead`)
  const sl = (await geo(page)).st; const rl = await pressTraced(w, low); const cl = await checkW(w, low, { slid: rl.an.slid })
  note('5 the chart’s last event (' + low + '): B or the short-screen rule (Q3)', `${fmtAn(rl.an)}; scrollTop ${sl} → ${cl.g.st}; event ${r1(cl.g.ball.t)}–${r1(cl.g.ball.b)}, limit ${r1(cl.L)}; ${wsay(cl)}; W1–W3 fails: ${cl.fails.join(';') || 'none'}`, await pic(w, 's10-last'))
  ok('5 W1–W3 for it', cl.fails.length === 0, wsay(cl))
  await closePop(w)
  /* 6 turn the phone */
  await land(w, 'ACG-09', 'pick'); await pressTraced(w, 'ACG-09'); const t0 = await geo(page, 'ACG-09')
  await page.setViewportSize(PHONE); await sleep(1200); const t1 = await geo(page, 'ACG-09'); await pic(w, 's10-turn-upright')
  const ov1 = t1.pop && t1.pop.shown ? { top: r1(t1.pop.t), foot: r1(t1.pop.b), overBars: t1.pop.t < limitOf(t1) - 0.5, off: t1.pop.b > t1.vh + 0.5 && !t1.pop.scrolls } : 'closed'
  await page.setViewportSize(SIDE); await sleep(1200); const t2 = await geo(page, 'ACG-09'); await pic(w, 's10-turn-back')
  const ov2 = t2.pop && t2.pop.shown ? { top: r1(t2.pop.t), foot: r1(t2.pop.b), overBars: t2.pop.t < limitOf(t2) - 0.5, off: t2.pop.b > t2.vh + 0.5 && !t2.pop.scrolls } : 'closed'
  ok('6 turned upright and back with a window open: never over the bars or off the screen with no way to close it', (ov1 === 'closed' || (!ov1.overBars && !ov1.off)) && (ov2 === 'closed' || (!ov2.overBars && !ov2.off)), `upright: ${JSON.stringify(ov1)}; back on its side: ${JSON.stringify(ov2)}`, 's10-turn-upright,s10-turn-back')
  ok('errors', w.errors.length === 0, w.errors.join(' / ') || 'none')
  await closeW(w)
})

/* ---------------- S11 ---------------- */
await scn('s11', 'A short desktop', async () => {
  for (const [name, size, dpr] of [['768x432', SHORTPC, 2], ['1000x500', SHORT500, 1]]) {
    const w = await mkWorld({ size, dpr, bars: false }); const page = w.page
    const g = await land(w, 'ACG-09', size.width <= 1050 ? 'pick' : 'enter'); const u0 = await undoState(page)
    const r = await pressTraced(w, 'ACG-09'); const c = await checkW(w, 'ACG-09', { undo: u0, slid: r.an.slid }); const p = c.g.pop
    ok(`${name} 2 click: slide, window scrolls inside, W1–W8`, c.fails.length === 0 && p && p.shown, `limit ${r1(c.L)}, viewport ${c.g.vh}; ${fmtAn(r.an)} | ${wsay(c)}`, await pic(w, `s11-${name}-open`))
    if (p && p.scrolls) { await page.mouse.move((p.l + p.r) / 2, (p.t + p.b) / 2); const st0 = c.g.st; await page.mouse.wheel(0, 500); await sleep(700); const af = await geo(page, 'ACG-09'); ok(`${name} 3 the wheel scrolls the window, not the chart`, af.pop.st > p.st && Math.abs(af.st - st0) <= 1, `window ${p.st} → ${af.pop.st}; chart ${st0} → ${af.st}`, await pic(w, `s11-${name}-wheel`)) }
    await closePop(w)
    /* once by Enter */
    const at = await keysTo(w, 'ACG-09')
    const rk = await geo(page, at); await page.keyboard.press('Enter'); await sleep(1500); const ck = await checkW(w, at, { slid: true })
    ok(`${name} 4 by Enter (ring on ${at})`, ck.fails.length === 0, wsay(ck), await pic(w, `s11-${name}-enter`))
    await closeW(w)
  }
})

/* ---------------- S12 ---------------- */
await scn('s12', 'The chart pinched', async () => {
  const w = await mkWorld({ size: PHONE, touch: true }); const page = w.page
  await land(w, 'ACG-09', 'pick')
  const cdp = await w.ctx.newCDPSession(page)
  const T = pts => cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts })
  const pinch = async (cx, cy, d0, d1, steps = 14) => {
    const pts = d => [{ x: cx - d / 2, y: cy, id: 1 }, { x: cx + d / 2, y: cy, id: 2 }]
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts(d0) })
    for (let i = 1; i <= steps; i++) { await T(pts(d0 + (d1 - d0) * i / steps)); await sleep(20) }
    await sleep(100)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [{ x: cx + d1 / 2, y: cy, id: 2 }] })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(900)
  }
  const z0 = await page.evaluate(() => document.getElementById('fzPct').textContent)
  await pinch(200, 600, 80, 220); const z1 = await page.evaluate(() => document.getElementById('fzPct').textContent)
  await pic(w, 's12-pinched-out')
  let g = await geo(page, 'ACG-09'); const ok1 = z1 !== z0
  if (!g.ball || g.ball.t < limitOf(g) || g.ball.b > g.vh) { const st = g.st; await page.evaluate(() => { document.getElementById('board').scrollTop += 0 }) }
  if (g.ball && g.ball.y < limitOf(g) + 20 || g.ball.y > g.vh - 20) await placeAt(w, 'ACG-09', 560)
  g = await geo(page, 'ACG-09'); const r = await pressTraced(w, 'ACG-09'); const c = await checkW(w, 'ACG-09', { slid: r.an.slid })
  ok(`1 pinched to ${z1} (from ${z0}): tap ACG-09 — W1–W8, W2 from the ball's edge at this zoom`, ok1 && c.fails.length === 0, `ball ${r1(g.ball.t)}–${r1(g.ball.b)} (${r1(g.ball.b - g.ball.t)} tall); ${fmtAn(r.an)} | ${wsay(c)}`, await pic(w, 's12-zoomed-open'))
  await closePop(w)
  await pinch(200, 600, 220, 40); const z2 = await page.evaluate(() => document.getElementById('fzPct').textContent)
  await pinch(200, 600, 220, 40); const z3 = await page.evaluate(() => document.getElementById('fzPct').textContent)
  await pic(w, 's12-pinched-in')
  const mid = await page.evaluate(() => { const bd = document.getElementById('board').getBoundingClientRect(); return [...document.querySelectorAll('#flowSvg .ball')].map(x => { const r = x.getBoundingClientRect(); return { id: x.dataset.id, y: (r.top + r.bottom) / 2, x: (r.left + r.right) / 2, t: r.top, b: r.bottom } }).filter(b => b.t > bd.top + 60 && b.b < bd.bottom - 40).sort((a, b) => Math.abs(a.y - (bd.top + bd.bottom) / 2) - Math.abs(b.y - (bd.top + bd.bottom) / 2))[0] })
  if (mid) { const rr = await pressTraced(w, mid.id); const cc = await checkW(w, mid.id, { slid: rr.an.slid }); ok(`2 pinched in to ${z3}: tap ${mid.id}`, cc.fails.length === 0, `${fmtAn(rr.an)} | ${wsay(cc)}`, await pic(w, 's12-smallest-open')) } else ok('2 smallest', null, 'no event in view to tap')
  ok('errors', w.errors.length === 0, w.errors.join(' / ') || 'none')
  await closeW(w)
})

/* ---------------- S13 ---------------- */
await scn('s13', 'Less motion', async () => {
  for (const [name, o] of [['phone', { size: PHONE, touch: true }], ['pc', { size: PC, dpr: 1.25 }], ['phone-webkit', { size: PHONE, touch: true, engine: 'webkit' }]]) {
    const w = await mkWorld({ ...o, reduced: true }); const page = w.page
    const rm = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
    const g = await land(w, 'ACG-09', o.size.width <= 1050 ? 'pick' : 'enter'); const u0 = await undoState(page)
    let g2 = g; if (!o.touch && g.ball.b + 434 <= g.board.b) g2 = await placeAt(w, 'ACG-09', g.board.b - 40)
    const stBefore = (await geo(page, 'ACG-09')).st; await traceStart(page, 'ACG-09'); await tapXY(w, g2.ball.x, g2.ball.y); await sleep(1500)
    const rows = await traceStop(page); const an = analyse(rows); const c = await checkW(w, 'ACG-09', { undo: u0, slid: an.slid })
    const frames = an.steps; const ms = an.shownT != null && an.rest != null ? an.shownT - an.rest : null
    ok(`${name} (reduced motion matched: ${rm}): the chart jumps (≤1 frame), the window shows within 2 frames, in the same place`, rm && (an.slid || (await geo(page)).st !== stBefore) && frames <= 1 && c.fails.length === 0 && an.shownDuring === 0 && (an.delay == null || an.delay <= 40), `scrollTop ${stBefore} → ${(await geo(page)).st}; ${fmtAn(an)}; scroll changed in ${frames} frame(s) seen by the recorder; op/vis path of the window ${[...new Set(rows.map(r => r.disp + '/' + r.vis + '/' + r.op))].join(' > ')} (no fade if 1/…/1 alone); | ${wsay(c)}`, await pic(w, `s13-${name}`))
    await closeW(w)
  }
})

/* ---------------- S14 ---------------- */
await scn('s14', 'Something else pressed during the slide', async () => {
  const cases = [
    ['a tap on another ball one row down', PHONE, true, async (w, g) => { const o = await w.page.evaluate(() => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === 'ACG-09').getBoundingClientRect(); const bs = [...document.querySelectorAll('#flowSvg .ball')].map(x => { const r = x.getBoundingClientRect(); return { id: x.dataset.id, x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 } }).filter(b => b.y > g.bottom + 20 && Math.abs(b.x - (g.left + g.right) / 2) < 120 && b.y < innerHeight - 60).sort((a, b) => a.y - b.y); return o = bs[0] }).catch(() => null); if (o) await w.page.touchscreen.tap(o.x, o.y) }],
    ['b tap on the Info tab', PHONE, true, async (w) => { await w.page.locator('#viewtabs button', { hasText: 'Info' }).tap() }],
    ['c 60px finger drag on empty chart', PHONE, true, async (w) => { await finger(w, 60, 600, 0, -60, 6) }],
    ['d tap on the top bar’s Undo (one grade made earlier)', PHONE, true, async (w) => { await w.page.locator('#trUndoBtn').tap() }],
    ['e three notches of the wheel over the chart', PC, false, async (w) => { await w.page.mouse.move(300, 500); for (let i = 0; i < 3; i++) await w.page.mouse.wheel(0, 100) }],
    ['f Escape', PC, false, async (w) => { await w.page.keyboard.press('Escape') }],
    ['g click on the Course pencil', PC, false, async (w) => { await w.page.locator('#courseMenuBtn').click() }],
  ]
  for (const [lab, size, touch, act] of cases) {
    const w = await mkWorld({ size, touch, dpr: touch ? 2 : 1.25 }); const page = w.page
    let g = await land(w, 'ACG-09', touch ? 'pick' : 'enter')
    if (!touch && g.ball.b + 434 <= g.board.b) g = await placeAt(w, 'ACG-09', g.board.b - 40)
    let note2 = ''
    if (lab.startsWith('d')) {  /* one grade made earlier on another event, so Undo is live */
      const o = await page.evaluate(() => { const bs = [...document.querySelectorAll('#flowSvg .ball')].filter(x => x.dataset.id !== 'ACG-09').map(x => { const r = x.getBoundingClientRect(); return { id: x.dataset.id, x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 } }).filter(b => b.y > 200 && b.y < 380 && b.x > 0 && b.x < innerWidth); return bs[0] })
      await page.touchscreen.tap(o.x, o.y); await sleep(1200); await page.locator('#pop .opts button[data-g="dco"]').tap(); await sleep(900); await closeAnyPop(w); note2 = `grade DCO made on ${o.id}; `
      g = await geo(page, 'ACG-09'); if (g.ball.y < 200 || g.ball.y > 800) g = await placeAt(w, 'ACG-09', 560)
    }
    const u0 = await undoState(page); const gs0 = await gradeState(page)
    await traceStart(page, 'ACG-09'); await tapXY(w, g.ball.x, g.ball.y); await sleep(lab.startsWith('f') ? 40 : 80); const mid = (await geo(page, 'ACG-09')).st
    await act(w, g).catch(e => { note2 += 'act error ' + e.message.split('\n')[0] + '; ' }); await sleep(2000)
    const rows = await traceStop(page); const an = analyse(rows); const gx = await geo(page, 'ACG-09'); const cur = await page.evaluate(() => window.CURPAGE)
    const gs1 = await gradeState(page); const stillMoving = rows.filter(r => r.t <= 140 && r.st !== rows[0].st).length > 0
    const pop = gx.pop
    const consistent = !pop || !pop.shown ? true : (pop.t >= limitOf(gx) - 0.5 && gx.ball && !inter(pop, gx.ball))
    const unseen = an.unseenPressable === 0 && !(pop && pop.disp !== 'none' && !pop.shown && pop.vis !== 'hidden' && pop.pe !== 'none')
    const wedgesSame = lab.startsWith('d') ? true : gs0.wedges === gs1.wedges
    ok(`${lab}`, consistent && unseen && wedgesSame && w.errors.length === 0, `${note2}the chart was still sliding when the 2nd press landed: ${stillMoving} (scrollTop at ~80ms ${mid}); after 2s: window ${pop && pop.shown ? 'shown at ' + r1(pop.t) + '–' + r1(pop.b) : 'gone'}; page ${cur}; scrollTop ${rows[0].st} → ${gx.st}; wedges ${wedgesSame ? 'unchanged' : gs0.wedges + ' → ' + gs1.wedges}; undo ${JSON.stringify(u0)} → ${JSON.stringify(gs1.undoOff + '/' + gs1.undoTitle)}; unseen-yet-pressable frames ${an.unseenPressable}; errors ${w.errors.join(' / ') || 'none'}`, await pic(w, `s14-${lab[0]}`))
    /* the next ordinary tap on ACG-09 opens at once */
    if (cur === 'tracker') { await closeAnyPop(w); await page.evaluate(() => { const v = document.querySelector('#viewtabs button'); }); const gn = await geo(page, 'ACG-09'); if (gn.ball && gn.ball.y > 200 && gn.ball.y < 800 && !(await page.locator('#viewtabs button.active', { hasText: 'Info' }).count())) { await tapXY(w, gn.ball.x, gn.ball.y); await sleep(1500); const gz = await geo(page, 'ACG-09'); ok(`${lab[0]} next ordinary tap on ACG-09 opens it at once`, !!(gz.pop && gz.pop.shown), `window ${gz.pop && gz.pop.shown ? 'shown ' + r1(gz.pop.t) + '–' + r1(gz.pop.b) : 'did not open'}`) } }
    await closeW(w)
  }
})

/* ---------------- S15 ---------------- */
await scn('s15', 'A second event while a window is open', async () => {
  for (const [name, size, touch] of [['phone', PHONE, true], ['pc', PC, false]]) {
    const w = await mkWorld({ size, touch, dpr: touch ? 2 : 1.25 }); const page = w.page
    let g = await land(w, 'ACG-09', touch ? 'pick' : 'enter'); if (!touch && g.ball.b + 434 <= g.board.b) g = await placeAt(w, 'ACG-09', g.board.b - 40)
    const r = await pressTraced(w, 'ACG-09'); const c = await checkW(w, 'ACG-09', { slid: r.an.slid })
    /* a ball beside the window (not under it) lower on the screen, whose window would not fit below */
    const pick = await page.evaluate(() => { const p = document.getElementById('pop').getBoundingClientRect(); const bd = document.getElementById('board').getBoundingClientRect(); return [...document.querySelectorAll('#flowSvg .ball')].map(x => { const r = x.getBoundingClientRect(); return { id: x.dataset.id, x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2, l: r.left, r: r.right, t: r.top, b: r.bottom } }).filter(b => b.y > bd.top + 150 && b.y < bd.bottom - 30 && (b.r < p.left - 4 || b.l > p.right + 4) && b.id !== 'ACG-09').sort((a, b) => b.y - a.y)[0] })
    if (!pick) { note(name + ' 2', 'no ball beside the window to tap'); await closeW(w); continue }
    await traceStart(page, pick.id); await tapXY(w, pick.x, pick.y); await sleep(1600); const rows = await traceStop(page); const an = analyse(rows)
    const gz = await geo(page, pick.id); const h = await popHeading(page); const cz = gz.pop && gz.pop.shown ? await checkW(w, pick.id, { slid: an.slid }) : null
    const popAt = rows.filter(r => shownRow(r)); const during = rows.some((r, i) => shownRow(r) && r.st !== rows[Math.min(i + 1, rows.length - 1)].st)
    ok(`${name} 2 tap a ball beside the open window (${pick.id}): one tap`, !during && (!cz || cz.fails.length === 0) && (!gz.pop || !gz.pop.shown || (h || '').startsWith(pick.id)), `${gz.pop && gz.pop.shown ? 'its window opened, heading "' + h + '"' : 'the first window closed, nothing opened'}; first window showing while the chart moved: ${during}; ${fmtAn(an)}${cz ? ' | ' + wsay(cz) : ''}`, await pic(w, `s15-${name}-second`))
    await closeAnyPop(w)
    /* 3 same ball again */
    let g3 = await placeAt(w, 'ACG-09', touch ? 450 : 500); await tapXY(w, g3.ball.x, g3.ball.y); await sleep(1500); const open1 = (await geo(page, 'ACG-09')).pop; await tapXY(w, g3.ball.x, g3.ball.y).catch(() => {}); await sleep(900); const gx = await geo(page, 'ACG-09')
    note(name + ' 3 ACG-09’s own ball tapped while its window is open', `window ${open1 && open1.shown ? 'open' : 'did not open'} → after a second tap on the ball: ${gx.pop && gx.pop.shown ? 'still open (' + r1(gx.pop.t) + ')' : 'closed / not showing'}`, await pic(w, `s15-${name}-same`))
    await closeAnyPop(w)
    /* 4 lesson 4: Student B's wedge beside an open window */
    if (touch) {
      await page.locator('#activeSel').selectOption({ label: 'STUDENT A' }); await sleep(1200)
      let g4 = await geo(page, 'ACG-09'); if (g4.ball.y < 200 || g4.ball.y > 700) g4 = await placeAt(w, 'ACG-09', 450)
      await tapXY(w, g4.ball.x, g4.ball.y); await sleep(1500)
      const nb = await page.evaluate(() => { const p = document.getElementById('pop').getBoundingClientRect(); const bd = document.getElementById('board').getBoundingClientRect(); const bs = [...document.querySelectorAll('#flowSvg .ball')].filter(x => x.dataset.id !== 'ACG-09').map(x => { const w = x.querySelector('path.wedge[data-wi="1"]'); const r = w.getBoundingClientRect(); const br = x.getBoundingClientRect(); return { id: x.dataset.id, x: (r.left + r.right) / 2, y: r.bottom - 1.5, l: br.left, r: br.right } }).filter(b => b.y > bd.top + 100 && b.y < bd.bottom - 30 && (b.r < p.left - 4 || b.l > p.right + 4)); return bs[0] })
      if (nb) { await page.touchscreen.tap(nb.x, nb.y); await sleep(1100); const gh = await geo(page, 'ACG-09'); const heading = await popHeading(page); const sel = (await stats(page)).sel
        ok(name + ' 4 Student A’s window open, tap Student B’s wedge on ' + nb.id + ': never a window naming A while B is picked', !(gh.pop && gh.pop.shown) || !/STUDENT A/.test(heading || '') || sel === 'STUDENT A', `crew now ${sel}; window ${gh.pop && gh.pop.shown ? '"' + heading + '"' : 'closed'}`, await pic(w, `s15-${name}-lesson4`)) }
      else note(name + ' 4', 'no ball with a reachable wedge beside the window')
    }
    ok(name + ' errors', w.errors.length === 0, w.errors.join(' / ') || 'none')
    await closeW(w)
  }
})

console.log('part B done')
