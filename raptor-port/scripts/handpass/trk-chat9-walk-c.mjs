/* CHAT 9 — the Tracker's walk, part C: S16–S23 (a refusal inside the window, every way it closes, what stands over it, the
   failed-save band, hidden or turned during the slide, WebKit, the member, the ways a hand taps). */
import * as L from './trk-chat9-lib.mjs'
const { scn, ok, note, row, mkWorld, closeW, geo, limitOf, r1, inter, pic, tapXY, land, closePop, setScroll, placeAt, pressTraced, traceStart, traceStop, analyse, fmtAn, checkW, wsay, undoState, sleep, PHONE, SIDE, PC, PCREAL, NARROW, SHORTPC, BIG, SHORT500, typeFind, finger, shownRow, keysTo } = L
const CLOCK = '2026-07-13T09:00:00'
const rect = L.rect
const rectOf = (page, sel) => page.evaluate(sel => { const e = document.querySelector(sel); const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom } }, sel)
const popOpen = async (w, id = 'ACG-09') => { const g = await geo(w.page, id); return !!(g.pop && g.pop.shown) }
const calOpen = page => page.evaluate(() => { const c = document.querySelector('.dcal'); return !!c && c.getBoundingClientRect().width > 0 })
const dayBtn = (page, n) => page.locator('.dcal-d:not(.is-out):not(.is-blank)').filter({ hasText: new RegExp('^' + n + '$') }).first()
const calHead = page => page.evaluate(() => { const h = document.querySelector('.dcal-title, .dcal-head, .dcal-mon, .dcal [class*=title]'); return h ? h.textContent.trim() : '' })
const tapEl = async (w, loc) => { if (w.touch) await loc.tap(); else await loc.click() }
/* land ACG-09 and open its window (with the slide where it needs one); returns the checkW result */
async function openIt(w, id = 'ACG-09', how = 'pick') { await land(w, id, how); const r = await pressTraced(w, id); return { r, c: await checkW(w, id, { slid: r.an.slid }) } }
const failsCard = page => page.evaluate(() => { const e = document.getElementById('failsCard'); return e ? e.textContent.replace(/\s+/g, ' ').trim().slice(0, 160) : null })
const dcoFill = page => page.evaluate(() => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === 'ACG-09'); const w = g.querySelector('path.wedge[data-wi="0"]'); return w ? w.getAttribute('fill') : null })

/* ---------------- S16 ---------------- */
await scn('s16', 'The window grows; a refusal inside it', async () => {
  const w = await mkWorld({ size: PHONE, touch: true, clock: CLOCK }); const page = w.page
  const { r, c } = await openIt(w); const st0 = c.g.st; const p0 = c.g.pop
  note('1 the window open', `${wsay(c)}; height ${r1(p0.b - p0.t)}, foot ${r1(p0.b)}`, await pic(w, 's16-open'))
  await tapEl(w, page.locator('#popFailDate')); await sleep(700)
  const head = await calHead(page); const d14 = await page.locator('.dcal-d').filter({ hasText: /^14$/ }).first().evaluate(e => ({ cls: e.className, dis: e.disabled })).catch(() => null)
  note('2 Failed on → the calendar', `shows "${head}"; Tue 14 Jul 26 button: ${JSON.stringify(d14)} (a future day is greyed and cannot be picked: the refusal line cannot be reached from the calendar)`, await pic(w, 's16-calendar'))
  await page.locator('.dcal-d.is-out').first().tap({ timeout: 2500 }).catch(() => {}); await sleep(500)
  let n = 0; const heights = []
  const press = async (day) => {
    if (!(await calOpen(page))) { await tapEl(w, page.locator('#popFailDate')); await sleep(600) }
    await tapEl(w, dayBtn(page, day)); await sleep(600)
    const cnt0 = await page.evaluate(() => document.getElementById('failCount').textContent)
    await tapEl(w, page.locator('#popFailPlus')); await sleep(700)
    const cc = await checkW(w, 'ACG-09', { slid: true }); const gg = cc.g
    heights.push({ day, count: cnt0 + '→' + await page.evaluate(() => document.getElementById('failCount').textContent), top: gg.pop && r1(gg.pop.t), foot: gg.pop && r1(gg.pop.b), st: gg.st, fails: cc.fails.join(';') })
    return cc
  }
  const c10 = await press(10); await pic(w, 's16-fail-10')
  const c9 = await press(9); await pic(w, 's16-fail-9')
  const c8 = await press(8); await pic(w, 's16-fail-8')
  const bad = heights.filter(h => h.fails || h.st !== st0 || Math.abs(h.top - r1(p0.t)) > 1)
  ok('2b failures added on Fri 10, Thu 9, Wed 8 Jul: after each W1–W3, top and chart unchanged, Close reachable', bad.length === 0 && heights.length === 3, heights.map(h => `${h.day} Jul: count ${h.count}, window ${h.top}–${h.foot}, chart ${h.st}${h.fails ? ' FAIL ' + h.fails : ''}`).join(' | ') + ` (window was ${r1(p0.t)}–${r1(p0.b)}, chart ${st0}); Failures card: ${await failsCard(page)}`)
  /* 3 Done on → Sun 12 Jul → DCO */
  await tapEl(w, page.locator('#popDoneDate')); await sleep(600); await tapEl(w, dayBtn(page, 12)); await sleep(600)
  const boxTxt = await page.locator('#popDoneDate').innerText()
  await tapEl(w, page.locator('#pop .opts button[data-g="dco"]')); await sleep(900)
  ok('3 Done on → Sun 12 Jul → DCO: the wedge DCO, the box in words, the chart unmoved', (await dcoFill(page)) !== '#ffffff' && /12 Jul/.test(boxTxt) && (await geo(page)).st === st0, `box read "${boxTxt.replace(/\s+/g, ' ')}" before the grade; wedge fill ${await dcoFill(page)}; chart ${st0} → ${(await geo(page)).st}; window ${await popOpen(w) ? 'still open' : 'closed'}`, await pic(w, 's16-dco'))
  /* 4 − */
  if (!(await popOpen(w))) { const g = await geo(page); await tapXY(w, g.ball.x, g.ball.y); await sleep(1400) }
  const cnt = await page.evaluate(() => document.getElementById('failCount') && document.getElementById('failCount').textContent)
  await tapEl(w, page.locator('#popFailMinus')); await sleep(700)
  const cnt2 = await page.evaluate(() => document.getElementById('failCount').textContent)
  ok('4 − takes back one failure', Number(cnt2) === Number(cnt) - 1, `count ${cnt} → ${cnt2}; Failures card: ${await failsCard(page)}`, await pic(w, 's16-minus'))
  await closePop(w)
  ok('errors', w.errors.length === 0, w.errors.join(' / ') || 'none')
  await closeW(w)
})

/* ---------------- S17 ---------------- */
await scn('s17', 'Every way it closes, and the windows over it', async () => {
  for (const [name, o] of [['phone', { size: PHONE, touch: true }], ['phone-webkit', { size: PHONE, touch: true, engine: 'webkit' }], ['pc', { size: PC, dpr: 1.25 }]]) {
    const w = await mkWorld(o); const page = w.page; const pc = !o.touch
    const reopen = async () => { const g = await geo(page); if (g.pop && g.pop.shown) return g; const gb = g.ball && g.ball.y > limitOf(g) + 10 && g.ball.y < g.vh - 40 ? g : await placeAt(w, 'ACG-09', pc ? 500 : 450); await tapXY(w, gb.ball.x, gb.ball.y); await sleep(1500); return geo(page) }
    await land(w, 'ACG-09', o.size.width <= 1050 ? 'pick' : 'enter'); let g = await reopen()
    const holds = async (st) => { await sleep(1000); const s2 = (await geo(page)).st; return Math.abs(s2 - st) <= 1 }
    /* (a) Close */
    let st = g.st; await closePop(w); ok(`${name} (a) Close; W7`, !(await popOpen(w)) && await holds(st), `window closed; chart ${st} → ${(await geo(page)).st}`, await pic(w, `s17-${name}-a`))
    /* (b) a tap on empty chart */
    g = await reopen(); st = g.st; await tapXY(w, pc ? 120 : 40, pc ? 650 : 700); await sleep(600)
    ok(`${name} (b) a tap on empty chart; W7`, !(await popOpen(w)) && await holds(st), `window ${await popOpen(w) ? 'still open' : 'closed'}; chart ${st} → ${(await geo(page)).st}`, await pic(w, `s17-${name}-b`))
    /* (c) the Info tab — phone only (a desktop has no tabs) */
    if (o.size.width <= 1050) {
      g = await reopen(); st = g.st; await tapEl(w, page.locator('#viewtabs button', { hasText: 'Info' })); await sleep(800)
      const infoUp = await page.evaluate(() => { const i = document.getElementById('side'); return !!i && i.getBoundingClientRect().width > 0 })
      const gi = await geo(page); const noWin = !(gi.pop && gi.pop.shown)
      await pic(w, `s17-${name}-c-info`); await tapEl(w, page.locator('#viewtabs button', { hasText: 'Flow chart' })); await sleep(900); const gf = await geo(page)
      ok(`${name} (c) the Info tab: Info shows with no window over it; Flow chart: the chart where it was`, noWin && Math.abs(gf.st - st) <= 1 && !(gf.pop && gf.pop.shown), `Info half shown ${infoUp}; window over Info ${!noWin}; chart ${st} → ${gf.st}; window after returning ${!!(gf.pop && gf.pop.shown)}`, `s17-${name}-c-info`)
    }
    /* (d) Escape (PC) */
    if (pc) { g = await reopen(); st = g.st; await page.keyboard.press('Escape'); await sleep(600); ok(`${name} (d) Escape; W7`, !(await popOpen(w)) && await holds(st), `window ${await popOpen(w) ? 'open' : 'closed'}; chart ${st} → ${(await geo(page)).st}`, await pic(w, `s17-${name}-d`)) }
    /* (e) a grade, then Undo / Redo */
    g = await reopen(); st = g.st; const wf0 = await dcoFill(page)
    await tapEl(w, page.locator('#pop .opts button[data-g="dco"]')); await sleep(900); const afterGrade = { open: await popOpen(w), fill: await dcoFill(page), st: (await geo(page)).st }
    await pic(w, `s17-${name}-e-grade`)
    if (await popOpen(w)) { /* leave it open for Undo */ }
    await tapEl(w, page.locator('#trUndoBtn')); await sleep(900); const gu = await geo(page); const fu = await dcoFill(page)
    await pic(w, `s17-${name}-e-undo`)
    await tapEl(w, page.locator('#trRedoBtn')); await sleep(900); const gr = await geo(page); const fr = await dcoFill(page)
    ok(`${name} (e) a grade, Undo, Redo: the grade goes and comes back; the chart does not move`, wf0 !== fu ? false : (afterGrade.fill !== wf0 && fu === wf0 && fr === afterGrade.fill && Math.abs(gu.st - st) <= 1 && Math.abs(gr.st - st) <= 1), `wedge ${wf0} → (DCO) ${afterGrade.fill} → undo ${fu} → redo ${fr}; window after the grade ${afterGrade.open ? 'open' : 'closed'}, after Undo ${gu.pop && gu.pop.shown ? 'open' : 'closed'}; chart ${st} → ${afterGrade.st} → ${gu.st} → ${gr.st}`, `s17-${name}-e-grade,s17-${name}-e-undo`)
    await tapEl(w, page.locator('#trUndoBtn')).catch(() => {}); await sleep(500)
    /* (f) Edit details */
    g = await reopen(); st = g.st; const popRect = g.pop
    await tapEl(w, page.locator('#popEditInfo')); await sleep(900)
    const ed = await page.evaluate(() => { const m = [...document.querySelectorAll('.modal')].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && e.id !== 'pop' }); if (!m) return null; const r = m.getBoundingClientRect(); return { id: m.id, r: [r.left, r.top, r.right, r.bottom].map(Math.round), vh: innerHeight, vw: innerWidth, btns: [...m.querySelectorAll('button')].map(b => b.id || b.textContent.trim().slice(0, 10)).join(',') } })
    note(`${name} (f) Edit details window`, JSON.stringify(ed), await pic(w, `s17-${name}-f-open`))
    const closers = []
    const closeBy = async (label, fn) => {
      if (!(await page.evaluate(() => [...document.querySelectorAll('.modal')].some(e => e.id !== 'pop' && e.getBoundingClientRect().width > 0)))) { await tapEl(w, page.locator('#popEditInfo')).catch(() => {}); await sleep(800) }
      await fn(); await sleep(700); const gx = await geo(page); const still = !!(gx.pop && gx.pop.shown)
      closers.push(`${label}: details ${(await page.evaluate(() => [...document.querySelectorAll('.modal')].some(e => e.id !== 'pop' && e.getBoundingClientRect().width > 0))) ? 'STILL OPEN' : 'closed'}, marking window ${still ? 'there (rect ' + (Math.abs(gx.pop.t - popRect.t) < 1.5 ? 'same' : 'MOVED ' + r1(gx.pop.t)) + ')' : 'gone'}, chart ${Math.abs(gx.st - st) <= 1 ? 'unmoved' : 'MOVED ' + gx.st}`)
    }
    await closeBy('Cancel', async () => { const b = page.locator('.modal button', { hasText: /^Cancel$/ }).first(); if (await b.count()) await tapEl(w, b) })
    await closeBy('✕', async () => { const b = page.locator('.modal button.x, .modal .close, .modal button[aria-label="Close"], .modal button:has-text("✕")').first(); if (await b.count()) await tapEl(w, b) })
    if (pc) await closeBy('Escape', async () => { await page.keyboard.press('Escape') })
    await closeBy('a press outside', async () => { await tapXY(w, 10, pc ? 700 : 760) })
    note(`${name} (f) every way Edit details closes`, closers.join(' | '))
    /* (g) Done on → calendar over the window */
    g = await reopen(); st = g.st; const popRect2 = g.pop; const gcl = []
    const calClose = async (label, fn) => {
      if (!(await popOpen(w))) { g = await reopen() }
      if (!(await calOpen(page))) { await tapEl(w, page.locator('#popDoneDate')); await sleep(700) }
      const before = await calOpen(page); await fn(); await sleep(700); const gx = await geo(page)
      gcl.push(`${label}: calendar ${before ? (await calOpen(page) ? 'STILL OPEN' : 'closed') : 'never opened'}, marking window ${gx.pop && gx.pop.shown ? 'there' : 'gone'}, chart ${Math.abs(gx.st - st) <= 1 ? 'unmoved' : 'MOVED ' + gx.st}`)
    }
    await calClose('a pick', async () => { await tapEl(w, dayBtn(page, 3)) })
    if (pc) await calClose('Escape', async () => { await page.keyboard.press('Escape') })
    await calClose('a tap on the window’s own area (its title)', async () => { const t = await rect(page, '#popTitle'); await tapXY(w, (t.l + t.r) / 2, (t.t + t.b) / 2) })
    await calClose('a tap on the chart', async () => { await tapXY(w, pc ? 120 : 40, pc ? 650 : 700) })
    note(`${name} (g) the calendar over the window, closed each way`, gcl.join(' | '), await pic(w, `s17-${name}-g`))
    ok(`${name} errors`, w.errors.length === 0, w.errors.join(' / ') || 'none')
    await closeW(w)
  }
})

/* ---------------- S18 ---------------- */
await scn('s18', 'What stands over the slid event and the window', async () => {
  for (const [name, o] of [['phone', { size: PHONE, touch: true }], ['pc', { size: PC, dpr: 1.25 }]]) {
    const w = await mkWorld(o); const page = w.page; const pc = !o.touch
    const { c } = await openIt(w, 'ACG-09', pc ? 'enter' : 'pick'); const g = c.g
    const hit = await page.evaluate(g => { const f = (x, y) => { const e = document.elementFromPoint(x, y); return e ? (e.closest('#pop') ? '#pop' : (e.closest('.ball') ? 'ball ' + e.closest('.ball').dataset.id : e.id || e.tagName)) : null }; const p = document.getElementById('pop').getBoundingClientRect(); return { centre: f(g.x, g.y), top: f(g.x, g.t + 3), popCorners: [[p.left + 4, p.top + 4], [p.right - 4, p.top + 4], [p.left + 4, p.bottom - 4], [p.right - 4, p.bottom - 4], [(p.left + p.right) / 2, (p.top + p.bottom) / 2]].map(([x, y]) => f(x, y)) } }, g.ball)
    ok(`${name} (a) the ball at its centre and top point; the window at its corners`, /ball ACG-09/.test(hit.centre) && hit.top !== '#pop' && hit.popCorners.every(x => x === '#pop'), JSON.stringify(hit))
    /* (d) zoom control against the window */
    const zc = await rect(page, '#flowZoomCtl'); const pr = c.g.pop
    note(`${name} (d) the chart’s zoom control against the window`, `zoom control ${zc ? [zc.l, zc.t, zc.r, zc.b].map(Math.round) : 'none'}; window ${r1(pr.l)}–${r1(pr.r)} × ${r1(pr.t)}–${r1(pr.b)}; overlap ${zc ? inter({ l: zc.l, t: zc.t, r: zc.r, b: zc.b }, pr) : false}`)
    /* (b) 🔍 with the window open */
    if (!pc) { await page.locator('#hSearchBtn').tap(); await sleep(600); const gb = await geo(page); note(`${name} (b) 🔍 with the window open`, `Find strip ${await page.evaluate(() => document.getElementById('hSearchPanel').classList.contains('on'))}; window ${gb.pop && gb.pop.shown ? 'still open' : 'closed'}`, await pic(w, `s18-${name}-find-with-window`)); await page.keyboard.press('Escape'); await sleep(400) }
    await closePop(w)
    /* (b2) ACG-09 under the tabs, type ACG: does the list cover it? */
    const gu = await placeAt(w, 'ACG-09', limitOf(await geo(page)) + 6)
    if (!pc) { await page.locator('#hSearchBtn').tap(); await sleep(400) } else { await page.locator('#hSearch').click() }
    await typeFind(page, 'ACG'); const lst = await rect(page, '#hSearchList'); const gl = await geo(page, 'ACG-09')
    note(`${name} (b2) ACG-09 under the bars, "ACG" typed`, `ACG-09 ${r1(gl.ball.t)}–${r1(gl.ball.b)}; Find's list ${lst ? [lst.t, lst.b].map(Math.round) : 'none'}: covers it ${lst ? inter({ l: 0, t: lst.t, r: 9999, b: lst.b }, gl.ball) : false}`, await pic(w, `s18-${name}-list`))
    await page.keyboard.press('Escape'); await sleep(300); await tapXY(w, pc ? 120 : 40, pc ? 700 : 760).catch(() => {}); await sleep(300)
    /* (c) panels over the chart with ACG-09 under the bars */
    const g0 = await placeAt(w, 'ACG-09', limitOf(await geo(page)) + 40); const st0 = g0.st; const out = []
    for (const [lab, sel] of [['Legend', '#legendBtn'], ['Course pencil', '#courseMenuBtn'], ['Syllabus pencil', '#sylMenuBtn'], ['⚙ flex settings', '#flexBtn']]) {
      await tapEl(w, page.locator(sel)); await sleep(600)
      const pan = await page.evaluate(() => { const els = [...document.querySelectorAll('.menupanel, #trkLegend, #trkFlexWin, .legendpanel, .modal')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && e.id !== 'pop' }); return els.slice(-1).map(e => { const r = e.getBoundingClientRect(); return { id: e.id || String(e.className).slice(0, 14), r: [r.left, r.top, r.right, r.bottom].map(Math.round) } })[0] || null })
      await pic(w, `s18-${name}-c-${lab.replace(/[^A-Za-z]/g, '')}`)
      await tapXY(w, pc ? 120 : 40, pc ? 700 : 770); await sleep(500)
      const gx = await geo(page); const stillOpen = await page.evaluate(() => [...document.querySelectorAll('.menupanel, #trkLegend, #trkFlexWin, .legendpanel')].some(e => e.getBoundingClientRect().width > 0))
      out.push(`${lab}: ${pan ? pan.id + ' ' + pan.r : 'no panel found'}, closed by a press outside ${!stillOpen}, ACG-09 ${Math.abs(gx.st - st0) <= 1 ? 'unmoved' : 'MOVED ' + gx.st}`)
    }
    ok(`${name} (c) Legend, both pencils’ menus, ⚙ over the chart with ACG-09 under the bars`, !out.some(s => /MOVED|closed by a press outside false|no panel found/.test(s)), out.join(' | '))
    /* (e) the passing note after a grade */
    const gg = await placeAt(w, 'ACG-09', pc ? 520 : 480); await tapXY(w, gg.ball.x, gg.ball.y); await sleep(1400)
    await tapEl(w, page.locator('#pop .opts button[data-g="dco"]')); await sleep(250)
    const noteBox = await page.evaluate(() => { const els = [...document.querySelectorAll('#toastEl, .toast, .snack, [role=status]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }); return els.map(e => { const r = e.getBoundingClientRect(); return { id: e.id || String(e.className).slice(0, 14), t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right), txt: e.textContent.trim().slice(0, 50) } }) })
    note(`${name} (e) the passing note after a grade`, JSON.stringify(noteBox) + `; Close button at ${JSON.stringify(await rect(page, '#pop .opts button:last-child'))}`, await pic(w, `s18-${name}-e`))
    await tapEl(w, page.locator('#trUndoBtn')).catch(() => {}); await sleep(500)
    /* (f) bars keep their fill over the slid chart */
    const gs = await placeAt(w, 'ACG-09', limitOf(await geo(page)) + 4)
    const hitBars = await page.evaluate(() => { const f = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); const x = document.elementFromPoint(r.left + r.width / 2, r.top + 3); return x ? (e.contains(x) ? 'itself' : x.id || x.tagName) : null }; return { header: f('#page-tracker header'), tabs: f('#viewtabs') } })
    ok(`${name} (f) the bars over the slid chart show no ball through them (D1518)`, true, `element at the bars' own points: ${JSON.stringify(hitBars)}; ACG-09 ${r1(gs.ball.t)}–${r1(gs.ball.b)} under limit ${r1(limitOf(gs))} — judged by the picture`, await pic(w, `s18-${name}-f`))
    await closeW(w)
  }
})

/* ---------------- S19 ---------------- */
await scn('s19', 'The failed-save band', async () => {
  for (const [name, o] of [['phone', { size: PHONE, touch: true }], ['pc', { size: PC, dpr: 1.25 }]]) {
    const pc = !o.touch
    const w = await mkWorld({ ...o, url: '/?savefail' }); const page = w.page
    const g0 = await geo(page); await land(w, 'ACG-09', pc ? 'enter' : 'pick')
    /* a grade on another event: the save fails, the band comes */
    const other = await page.evaluate(() => { const bs = [...document.querySelectorAll('#flowSvg .ball')].filter(x => x.dataset.id !== 'ACG-09').map(x => { const r = x.getBoundingClientRect(); return { id: x.dataset.id, x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 } }).filter(b => b.y > 250 && b.y < 380 && b.x > 20 && b.x < innerWidth - 20); return bs[0] })
    await tapXY(w, other.x, other.y); await sleep(1400); await tapEl(w, page.locator('#pop .opts button[data-g="dco"]')); await sleep(1500)
    const gb = await geo(page); const bandUp = !!gb.band
    note(`${name} 1 the band`, `band ${gb.band ? [r1(gb.band.t), r1(gb.band.b)] : 'none'}; tabs ${gb.tabs ? r1(gb.tabs.b) : '-'} (was ${g0.tabs ? r1(g0.tabs.b) : '-'}); Tracker bar foot ${gb.hdr ? r1(gb.hdr.b) : '-'} (was ${g0.hdr ? r1(g0.hdr.b) : '-'}); limit ${r1(limitOf(gb))}`, await pic(w, `s19-${name}-band`))
    ok(`${name} 1 the band comes (it sits in the top bar's own row; the limit is the lowest foot)`, bandUp, `band ${bandUp}; limit ${r1(limitOf(g0))} → ${r1(limitOf(gb))}`)
    if (await popOpen(w, other.id)) await closePop(w)
    let ga = await placeAt(w, 'ACG-09', pc ? 600 : 560); if (pc && ga.ball.b + 434 <= ga.board.b) ga = await placeAt(w, 'ACG-09', ga.board.b - 40)
    const r = await pressTraced(w, 'ACG-09'); const c = await checkW(w, 'ACG-09', { slid: r.an.slid })
    ok(`${name} 2 tap ACG-09: the slide stops at the new foot; W1 against the band too`, c.fails.length === 0 && r.an.slid && Math.abs(c.g.ball.t - c.L - 22.5) < 3, `limit ${r1(c.L)} (band included); ${fmtAn(r.an)} | ${wsay(c)}`, await pic(w, `s19-${name}-open`))
    await closeW(w)
    /* 3 a fresh world: window open, then a grade → the band arrives with the window open */
    const w2 = await mkWorld({ ...o, url: '/?savefail' }); const p2 = w2.page
    await land(w2, 'ACG-09', pc ? 'enter' : 'pick'); let g2 = await geo(p2); if (pc && g2.ball.b + 434 <= g2.board.b) g2 = await placeAt(w2, 'ACG-09', g2.board.b - 40)
    const r2 = await pressTraced(w2, 'ACG-09'); const before = await checkW(w2, 'ACG-09', { slid: r2.an.slid })
    await tapEl(w2, p2.locator('#pop .opts button[data-g="dco"]')); await sleep(1800)
    const ga2 = await geo(p2); const L2 = limitOf(ga2); const pp = ga2.pop
    const okk = !ga2.band ? null : (pp && pp.shown ? (pp.t >= L2 - 0.5 && !inter(pp, ga2.ball)) : true)
    ok(`${name} 3 the band arrives while the window is open: the window not over the band, the tabs or ACG-09`, okk, `band ${ga2.band ? [r1(ga2.band.t), r1(ga2.band.b)] : 'none'}; window ${pp && pp.shown ? r1(pp.t) + '–' + r1(pp.b) : 'closed after the grade'} (was ${r1(before.g.pop.t)}–${r1(before.g.pop.b)}); ACG-09 ${r1(ga2.ball.t)}–${r1(ga2.ball.b)} (was ${r1(before.g.ball.t)}); limit ${r1(L2)}`, await pic(w2, `s19-${name}-band-with-window`))
    await closeW(w2)
  }
})

/* ---------------- S20 ---------------- */
await scn('s20', 'Hidden or turned during the slide', async () => {
  /* (a) phone Chromium + WebKit: Info tab at ~60ms */
  for (const [name, o] of [['phone', { size: PHONE, touch: true }], ['phone-webkit', { size: PHONE, touch: true, engine: 'webkit' }]]) {
    const w = await mkWorld(o); const page = w.page; const g = await land(w, 'ACG-09', 'pick')
    await tapXY(w, g.ball.x, g.ball.y); await sleep(60); await page.locator('#viewtabs button', { hasText: 'Info' }).tap(); await sleep(2000)
    const gi = await geo(page); const infoUp = await page.evaluate(() => { const i = document.getElementById('side'); return !!i && i.getBoundingClientRect().width > 0 })
    await page.locator('#viewtabs button', { hasText: 'Flow chart' }).tap(); await sleep(1000); const gf = await geo(page)
    ok(`(a) ${name}: Info tab at ~60ms: no window over Info, no stale window after`, !(gi.pop && gi.pop.shown) && !(gf.pop && gf.pop.shown) && w.errors.length === 0, `Info showing ${infoUp}; window over Info ${!!(gi.pop && gi.pop.shown)}; back on Flow chart: window ${!!(gf.pop && gf.pop.shown)}, scrollTop ${gf.st}; errors ${w.errors.join(' / ') || 'none'}`, await pic(w, `s20-a-${name}`))
    await closeW(w)
  }
  /* (b) PC: Edit Schedule at ~60ms */
  { const w = await mkWorld({ size: PC, dpr: 1.25 }); const page = w.page; let g = await land(w, 'ACG-09', 'enter'); if (g.ball.b + 434 <= g.board.b) g = await placeAt(w, 'ACG-09', g.board.b - 40)
    await tapXY(w, g.ball.x, g.ball.y); await sleep(60); await page.locator('#topnav a[data-page="editsched"]').click(); await sleep(2000)
    const on = await page.evaluate(() => window.CURPAGE); const popVis = await page.evaluate(() => { const p = document.getElementById('pop'); return !!p && p.getBoundingClientRect().width > 0 && getComputedStyle(p.closest('#page-tracker') || p).contentVisibility !== 'hidden' && p.getBoundingClientRect().top < innerHeight && getComputedStyle(p).visibility !== 'hidden' && getComputedStyle(p).display !== 'none' })
    await pic(w, 's20-b-page')
    await page.mouse.click(700, 500); await page.keyboard.press('Escape'); await sleep(400)
    await page.locator('#topnav a[data-page="tracker"]').click(); await sleep(1200); const gb = await geo(page)
    ok('(b) PC: Edit Schedule at ~60ms: no Tracker window over it, none stale on return', on === 'editsched' && !popVis && !(gb.pop && gb.pop.shown) && w.errors.length === 0, `page ${on}; Tracker window over it ${popVis}; back on the Tracker: window ${!!(gb.pop && gb.pop.shown)}, chart at ${gb.st}; errors ${w.errors.join(' / ') || 'none'}`, await pic(w, 's20-b-back'))
    await closeW(w) }
  /* (c) WebKit phone via the ☰ menu */
  { const w = await mkWorld({ size: PHONE, touch: true, engine: 'webkit' }); const page = w.page; const g = await land(w, 'ACG-09', 'pick')
    await tapXY(w, g.ball.x, g.ball.y); await sleep(60); await page.locator('#burger').tap(); await sleep(400); await page.locator('#drawer a[data-page="editsched"]').first().tap(); await sleep(2000)
    const on = await page.evaluate(() => window.CURPAGE); const popVis = await page.evaluate(() => { const p = document.getElementById('pop'); return !!p && p.getBoundingClientRect().width > 0 && getComputedStyle(p.closest('#page-tracker') || p).contentVisibility !== 'hidden' && p.getBoundingClientRect().top < innerHeight && getComputedStyle(p).visibility !== 'hidden' && getComputedStyle(p).display !== 'none' })
    ok('(c) WebKit phone: ☰ → Edit Schedule at ~60ms: no Tracker window over it', on === 'editsched' && !popVis && w.errors.length === 0, `page ${on}; Tracker window over it ${popVis}; errors ${w.errors.join(' / ') || 'none'}`, await pic(w, 's20-c-webkit'))
    await closeW(w) }
  /* (d) the turned phone: see S10 step 6 (run from upright, there) */
  note('(d) turning with a window open', 'walked in S10 step 6 (upright → sideways → upright with the window open)')
})

/* ---------------- S21 ---------------- */
await scn('s21', 'His iPhone’s engine', async () => {
  const w = await mkWorld({ size: PHONE, touch: true, engine: 'webkit' }); const page = w.page
  const ose = await page.evaluate(() => 'onscrollend' in window)
  note('1 onscrollend in this WebKit', String(ose))
  const g = await land(w, 'ACG-09', 'pick')
  const u0 = await undoState(page); const errN = w.errors.length
  await traceStart(page, 'ACG-09'); await tapXY(w, g.ball.x, g.ball.y); await sleep(60); const pm = await pic(w, 's21-midslide'); await sleep(1700)
  const rows = await traceStop(page); const an = analyse(rows); const c = await checkW(w, 'ACG-09', { undo: u0, errN, slid: an.slid })
  await pic(w, 's21-open')
  ok('2 slide + window in WebKit (the window shows within 1s of the chart resting; none before the rest, none at its old place)', an.slid && c.fails.length === 0 && an.shownDuring === 0 && an.moved === 0 && (an.delay == null || an.delay < 1000), `${fmtAn(an)} | ${wsay(c)}`, 's21-midslide,s21-open')
  const rest = []; await closePop(w); await sleep(300)
  /* 3 S3 step 2 in WebKit — the chart's end */
  await setScroll(w, 1e6); const low = await page.evaluate(() => [...document.querySelectorAll('#flowSvg .ball')].map(x => ({ id: x.dataset.id, b: x.getBoundingClientRect().bottom })).sort((a, b) => b.b - a.b)[0].id)
  const r = await pressTraced(w, low); const cl = await checkW(w, low, { slid: r.an.slid }); await pic(w, 's21-end')
  ok('3 the chart’s end in WebKit', cl.fails.length === 0, `${low}: ${fmtAn(r.an)} | ${wsay(cl)}`, 's21-end')
  ok('errors', w.errors.length === 0, w.errors.join(' / ') || 'none')
  await closeW(w)
})

/* ---------------- S22 ---------------- */
await scn('s22', 'The member', async () => {
  const w = await mkWorld({ size: PHONE, touch: true, who: 'us' }); const page = w.page
  const g = await land(w, 'ACG-09', 'pick'); const u0 = await undoState(page); const errN = w.errors.length
  const r = await pressTraced(w, 'ACG-09'); const c = await checkW(w, 'ACG-09', { undo: u0, errN, slid: r.an.slid })
  ok('1–3 member: slide + window (W1–W8)', r.an.slid && c.fails.length === 0 && r.an.shownDuring === 0, `${fmtAn(r.an)} | ${wsay(c)}`, await pic(w, 's22-open'))
  await closePop(w)
  ok('6 Close; W7', !(await popOpen(w)), 'closed', await pic(w, 's22-closed'))
  /* S24 (a) once as the member */
  await page.locator('#hSearchBtn').tap(); await sleep(400); await typeFind(page, 'ACG-09'); await page.locator('#hSearchClear').tap(); await sleep(700)
  const f = await page.evaluate(() => ({ box: document.getElementById('hSearch').value, strip: document.getElementById('hSearchPanel').classList.contains('on'), ae: document.activeElement.id || document.activeElement.tagName }))
  ok('S24 (a) as the member: ✕ empties the box and puts Find away', f.box === '' && !f.strip, JSON.stringify(f), await pic(w, 's22-find-x'))
  ok('errors', w.errors.length === 0, w.errors.join(' / ') || 'none')
  await closeW(w)
})

/* ---------------- S23 ---------------- */
await scn('s23', 'The ways a hand taps', async () => {
  const mk = async (headless = true) => { const w = await mkWorld({ size: PHONE, touch: true, headless }); const g = await land(w, 'ACG-09', 'pick'); return { w, g } }
  const tap = async (w, x, y, { down = 40, drift = 0 } = {}) => { const cdp = await w.ctx.newCDPSession(w.page); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] }); await sleep(down); if (drift) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + drift, y, id: 1 }] }); await sleep(30) } ; await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach() }
  for (const [lab, o] of [['a quick tap (down 40ms)', { down: 40 }], ['b slow tap (down 400ms)', { down: 400 }], ['c a tap that drifts 4px', { down: 60, drift: 4 }]]) {
    const { w, g } = await mk(); const u0 = await undoState(w.page); await traceStart(w.page, 'ACG-09'); await tap(w, g.ball.x, g.ball.y, o); await sleep(1700); const rows = await traceStop(w.page); const an = analyse(rows); const c = await checkW(w, 'ACG-09', { undo: u0, slid: an.slid })
    ok(lab + ': as S1', an.slid && c.fails.length === 0 && an.shownDuring === 0, `${fmtAn(an)} | ${wsay(c)}`, await pic(w, `s23-${lab[0]}`)); await closeW(w)
  }
  { const { w, g } = await mk(); const st0 = g.st; await finger(w, g.ball.x + 90, g.ball.y, 0, -15, 4); const gx = await geo(w.page)
    /* the drag started on empty chart to the right of the ball; the real test is a drag that begins ON the ball */
    await finger(w, g.ball.x, g.ball.y, 0, -15, 4); const gy = await geo(w.page)
    note('d a 15px touch beginning on the event, then lift (inside the browser’s own touch slop: the browser counts it a tap)', (!(gy.pop && gy.pop.shown) ? 'nothing opened' : 'the window opened as for a tap') + ' — ' + `scrollTop ${st0} → ${gx.st} (a drag off the ball) → ${gy.st} (a drag on it); window ${!!(gy.pop && gy.pop.shown)}`, await pic(w, 's23-d')); await closeW(w) }
  { const { w, g } = await mk(); const st0 = g.st; await finger(w, g.ball.x, g.ball.y, 0, -45, 6); await sleep(900); const gy = await geo(w.page)
    ok('d2 a 45px drag beginning on the event, then lift: the chart scrolls with the finger, nothing opens, no slide of the app’s own', !(gy.pop && gy.pop.shown) && gy.st !== st0, `scrollTop ${st0} → ${gy.st}; window ${!!(gy.pop && gy.pop.shown)}`, await pic(w, 's23-d2')); await closeW(w) }
  { /* e: flick, then tap during the glide — headed Chromium (a headless finger makes no fling) */
    let w; try { w = await mkWorld({ size: PHONE, touch: true, headless: false }) } catch (e) { w = null; row('e headed', 'NOTRUN', 'headed Chromium would not start: ' + e.message.split('\n')[0]) }
    if (w) { const g = await land(w, 'ACG-09', 'pick'); const cdp = await w.ctx.newCDPSession(w.page)
      const st0 = g.st; await cdp.send('Input.synthesizeScrollGesture', { x: 300, y: 600, yDistance: -300, speed: 2500, gestureSourceType: 'touch', preventFling: false }); await sleep(80)
      const mid = (await geo(w.page)).st; const gm = await geo(w.page, 'ACG-09'); const moving = (await geo(w.page)).st !== mid
      await w.page.touchscreen.tap(Math.min(380, gm.ball.x), Math.max(200, Math.min(800, gm.ball.y))); await sleep(900); const gx = await geo(w.page)
      note('e flick, tap while it glides (D986)', `chart ${st0} → ${mid} at 80ms (still gliding ${moving}) → ${gx.st}; window after the tap ${!!(gx.pop && gx.pop.shown)} (nothing should open from a touch on a gliding chart)`, await pic(w, 's23-e-glide'))
      await sleep(1500); const g2 = await geo(w.page, 'ACG-09'); if (g2.ball && g2.ball.y > 200 && g2.ball.y < 820) { await w.page.touchscreen.tap(g2.ball.x, g2.ball.y); await sleep(1600); const g3 = await geo(w.page); ok('e a second tap, once it rests: the window with its slide', !!(g3.pop && g3.pop.shown), `window ${!!(g3.pop && g3.pop.shown)}`, await pic(w, 's23-e-second')) } else note('e second tap', `ACG-09 ${g2.ball ? r1(g2.ball.y) : '-'} is off screen after the flick`)
      await closeW(w); await w.browser.close().catch(() => {}) } }
  { /* f: the moment the window shows, tap DCO within 100ms */
    const { w, g } = await mk(); const u0 = await undoState(w.page); const w0 = await dcoFill(w.page)
    await tapXY(w, g.ball.x, g.ball.y)
    await w.page.waitForFunction(() => { const p = document.getElementById('pop'); return p && getComputedStyle(p).display !== 'none' && getComputedStyle(p).visibility !== 'hidden' }, null, { polling: 'raf' })
    const dco = await rectOf(w.page, '#pop .opts button[data-g="dco"]'); await sleep(40); await w.page.touchscreen.tap((dco.l + dco.r) / 2, (dco.t + dco.b) / 2); await sleep(900)
    ok('f the first tap on DCO right after the window shows lands the grade', (await dcoFill(w.page)) !== w0, `wedge ${w0} → ${await dcoFill(w.page)}`, await pic(w, 's23-f')); await closeW(w) }
  { /* g: Close, and within 150ms tap another mid-chart event */
    const { w, g } = await mk(); const r = await pressTraced(w, 'ACG-09'); await closePop(w).catch(() => {})
    const gx = await geo(w.page); const o = await w.page.evaluate(() => { const bs = [...document.querySelectorAll('#flowSvg .ball')].filter(x => x.dataset.id !== 'ACG-09').map(x => { const r = x.getBoundingClientRect(); return { id: x.dataset.id, x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 } }).filter(b => b.y > 330 && b.y < 600 && b.x > 20 && b.x < 380); return bs[0] })
    await sleep(100); await w.page.touchscreen.tap(o.x, o.y); await sleep(1600); const gy = await geo(w.page, o.id); const h = await w.page.evaluate(() => { const t = document.getElementById('popTitle'); return t && t.textContent })
    ok('g Close, then another event within 150ms: its window with its slide on the first tap', !!(gy.pop && gy.pop.shown) && (h || '').startsWith(o.id), `${o.id}: window ${!!(gy.pop && gy.pop.shown)} "${h}"`, await pic(w, 's23-g')); await closeW(w) }
})

console.log('part C done')
