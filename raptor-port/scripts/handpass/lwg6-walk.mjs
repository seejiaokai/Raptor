/* The walk of the Leave War group 6 build (chat 8, 8 Nov 26 — brief docs/superpowers/briefs/2026-11-08-lw-group6-walk.md).
   D1788 the day panel's foot "↓ N more"; D1789 the pinned dates rows (Leave War grid, Quals). Walks the running build.
   Run from raptor-port/ against a preview of dist on port 4395:
     HP_URL=http://localhost:4395 node scripts/handpass/lwg6-walk.mjs            (everything)
     WALK_ONLY=s1,s2 ...                                                          (some parts; see `want(...)` below)
   Pictures: docs/img/handpass/2026-11-08-lw-group6/<name>.png, results: lwg6-results.json beside them. Scratch: LWG6_SCRATCH. */
console.log('lwg6-walk v1')
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { chromium, webkit } from '@playwright/test'
process.env.HP_URL ||= 'http://localhost:4395'
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(HERE, '../../docs/img/handpass/2026-11-08-lw-group6'); mkdirSync(OUT, { recursive: true })
process.env.HP_SHOTS ||= OUT
const { BASE, login, go } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const SCRATCH = process.env.LWG6_SCRATCH || `${tmpdir()}/lwg6`; mkdirSync(SCRATCH, { recursive: true })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const PC = { width: 1536, height: 864 }, PHONE = { width: 402, height: 874 }
const ONLY = (process.env.WALK_ONLY || '').split(',').filter(Boolean)
const want = q => !ONLY.length || ONLY.includes(q)
const T = id => `[data-testid="${id}"]`
const DAY = '2026-11-30'
const PANEL_RUNS = [['dice', 'mamba'], ['nact', 'slash'], ['taipan', 'harpoon']]
const PAIR_DAYS = ['2026-12-01', '2026-12-02']
const browsers = {}
async function engine(name) {
  if (!browsers[name]) {
    browsers[name] = name === 'webkit' ? await webkit.launch({ headless: true })
      : await chromium.launch({ headless: true, ...(name === 'chromium-sb' ? { ignoreDefaultArgs: ['--hide-scrollbars'] } : {}), ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
  }
  return browsers[name]
}
const ERRORS = []   // every console error, page error and 4xx, with where
const RESULTS = []
const rec = (sc, size, verdict, note, pics = []) => {
  RESULTS.push({ sc, size, verdict, note, pics })
  console.log(`[${verdict}] ${sc} ${size} — ${typeof note === 'string' ? note : JSON.stringify(note)}${pics.length ? '  pics: ' + pics.join(', ') : ''}`)
}
const RFILE = `${OUT}/lwg6-results.json`
const flush = () => {
  const prev = existsSync(RFILE) ? JSON.parse(readFileSync(RFILE, 'utf8')) : { results: [], errors: [] }
  const keep = prev.results.filter(r => !RESULTS.some(n => n.sc === r.sc && n.size === r.size))
  writeFileSync(RFILE, JSON.stringify({ results: [...keep, ...RESULTS], errors: [...prev.errors, ...ERRORS] }, null, 1))
}

/* ---------- worlds ---------- */
async function world({ vp, touch = false, eng = 'chromium', who = 'a', state = null, dsf = 1, label = '' }) {
  const b = await engine(eng)
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: dsf, ...(touch ? { isMobile: true, hasTouch: true } : {}), ...(state ? { storageState: state } : {}) })
  const page = await ctx.newPage()
  const tag = `${label || eng}`
  page.on('pageerror', e => { ERRORS.push(`[${tag}] PAGEERROR ${e.message}`); console.log('PAGE ERROR', tag, e.message) })
  page.on('console', m => { if (m.type() === 'error') { ERRORS.push(`[${tag}] console ${m.text()}`) } })
  page.on('response', r => { if (r.status() >= 400) ERRORS.push(`[${tag}] HTTP ${r.status()} ${r.url()}`) })
  await page.goto(BASE + '/'); await login(page, who)
  await page.addStyleTag({ content: '*{scroll-behavior:auto!important} .toast,.snack{display:none!important}' })
  return { ctx, page, touch, vp, eng, cdp: eng.startsWith('chromium') ? await ctx.newCDPSession(page) : null, tag }
}
const tap = async (w, sel, n = 0) => {
  const l = w.page.locator(sel).filter({ visible: true }).nth(n)
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (w.touch) await l.tap(); else await l.click()
  await sleep(350)
}
const vis = async (page, sel) => { const l = page.locator(sel).first(); return (await l.count()) > 0 && await l.isVisible() }
const txt = async (page, sel) => (await page.locator(sel).count()) ? (await page.locator(sel).first().innerText()).replace(/\s+/g, ' ').trim() : null
async function toWar(w) {
  await go(w.page, 'leavewar'); await w.page.waitForSelector('[data-testid^="month-"]'); await sleep(900)
  if (await w.page.locator(T('lw-tab-grid')).count()) { await tap(w, T('lw-tab-grid')); await sleep(300) }
}
async function toMonth(w, mon, probeIso) {
  for (let i = 0; i < 4; i++) {
    await w.page.evaluate(() => window.scrollTo(0, 0)); await sleep(200)
    await tap(w, T('month-' + mon)); await sleep(1200)
    if (await w.page.locator(`td[data-testid$="-${probeIso}"]`).count()) return
  }
  throw new Error('month ' + mon + ' never drew ' + probeIso)
}
async function shot(w, name, clipBox) {
  const o = { path: `${OUT}/${name}.png` }
  if (clipBox) {
    const x = Math.max(0, Math.round(clipBox.x)), y = Math.max(0, Math.round(clipBox.y))
    o.clip = { x, y, width: Math.min(Math.round(clipBox.w), w.vp.width - x), height: Math.min(Math.round(clipBox.h), w.vp.height - y) }
  }
  await w.page.screenshot(o)
  return name
}
const boxOf = (page, sel) => page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height } }, sel)
async function winShot(w, name, sel = T('win-lwday')) {
  const b = await boxOf(w.page, sel); if (!b) return null
  return shot(w, name, w.touch ? { x: 0, y: b.y - 10, w: w.vp.width, h: b.h + 20 } : { x: b.x - 30, y: b.y - 20, w: b.w + 60, h: b.h + 40 })
}

/* ---------- the set-up: 19 men away on Mon 30 Nov through the drag window (as the pictures round did), two-entry days ---------- */
async function dragCells(w, [p1, a], [p2, z]) {
  const P = w.page
  const A = P.locator(T(`cell-${p1}-${a}`)).first()
  await A.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
  const ba = await A.boundingBox(), bz = await P.locator(T(`cell-${p2}-${z}`)).first().boundingBox()
  if (!ba || !bz) throw new Error(`drag: no box for ${p1} ${a} / ${p2} ${z}`)
  await P.mouse.move(ba.x + ba.width / 2, ba.y + ba.height / 2); await P.mouse.down()
  await P.mouse.move(bz.x + bz.width / 2, bz.y + bz.height / 2, { steps: 12 }); await P.mouse.up()
  await sleep(600)
  if (!(await vis(P, T('select-sheet')))) throw new Error(`drag ${p1} ${a} → ${p2} ${z}: the drag window did not open`)
}
async function selPress(w, id) {
  await tap(w, T(id)); await sleep(400)
  if (/^sel-[A-Z]+$/.test(id) && await vis(w.page, T('select-sheet')) && /again/i.test((await txt(w.page, T('select-sheet'))) || '')) { await tap(w, T(id)); await sleep(500) }
}
async function closeSel(w) { if (await vis(w.page, T('select-sheet'))) { await tap(w, T('sel-cancel')); await sleep(300) } }
const STATE_FILE = `${SCRATCH}/lwg6-state.json`
async function setUp() {
  if (existsSync(STATE_FILE) && !process.env.LWG6_RESET) { console.log('state reused'); return STATE_FILE }
  const w = await world({ vp: PC, label: 'setup' })
  await w.ctx.clock.install({ time: new Date('2026-07-13T09:00:00') }).catch(() => {})
  await toWar(w)
  await toMonth(w, 'NOV', DAY)
  const said = []
  for (const [a, z] of PANEL_RUNS) {
    await dragCells(w, [a, DAY], [z, DAY]); said.push(await txt(w.page, T('sel-who')))
    await selPress(w, 'sel-LL'); await closeSel(w)
  }
  await toMonth(w, 'DEC', PAIR_DAYS[0])
  await dragCells(w, ['dice', PAIR_DAYS[0]], ['dice', PAIR_DAYS[1]]); await selPress(w, 'sel-file-CSE'); await closeSel(w)
  await dragCells(w, ['dice', PAIR_DAYS[0]], ['dice', PAIR_DAYS[1]]); await selPress(w, 'sel-LL'); await closeSel(w)
  await sleep(1500)
  await w.ctx.storageState({ path: STATE_FILE })
  console.log('set-up', JSON.stringify(said))
  await w.ctx.close()
  return STATE_FILE
}

/* ---------- measuring the day window ---------- */
const MEASURE = () => {
  const win = document.querySelector('[data-testid="win-lwday"]'); if (!win) return null
  const body = win.querySelector('.win-body'), br = body.getBoundingClientRect()
  const rows = [...win.querySelectorAll('.lwday-away .ll-row')]
  let whole = 0, cut = 0, below = 0, above = 0
  for (const r of rows) {
    const b = r.getBoundingClientRect()
    if (b.top < br.top - 1) above++
    if (b.bottom <= br.bottom + 1) whole++; else if (b.top < br.bottom) cut++; else below++
  }
  const foot = win.querySelector('[data-testid="lwday-more"]')
  const wr = win.getBoundingClientRect()
  let f = null
  if (foot) {
    const fr = foot.getBoundingClientRect(), words = foot.querySelector('.bl-more'), wd = words.getBoundingClientRect()
    const cs = getComputedStyle(foot), ws = getComputedStyle(words)
    const rg = document.createRange(); rg.selectNodeContents(words); const ink = rg.getBoundingClientRect()
    f = {
      text: foot.innerText.replace(/\s+/g, ' ').trim(), top: +fr.top.toFixed(1), bottom: +fr.bottom.toFixed(1), left: +fr.left.toFixed(1), right: +fr.right.toFixed(1), h: +fr.height.toFixed(1),
      outsideBody: !foot.closest('.win-body'), straightAfterBody: foot.previousElementSibling === body, gapToBody: +(fr.top - br.bottom).toFixed(1),
      fontSize: ws.fontSize, color: ws.color, fontWeight: ws.fontWeight, borderTop: `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`, bg: cs.backgroundColor,
      margin: `${cs.marginLeft}/${cs.marginRight}`, padding: cs.padding, cursor: ws.cursor, tag: foot.tagName, tabindex: foot.getAttribute('tabindex'), role: foot.getAttribute('role'),
      focusableInside: !!foot.querySelector('a,button,input,select,textarea,[tabindex]'), onclick: typeof foot.onclick,
      wordsLeftFromFoot: +(wd.left - fr.left).toFixed(1), inkInsideFoot: ink.left >= fr.left - .5 && ink.right <= fr.right + .5 && ink.top >= fr.top - .5 && ink.bottom <= fr.bottom + .5,
      inkBox: [+ink.left.toFixed(1), +ink.top.toFixed(1), +ink.right.toFixed(1), +ink.bottom.toFixed(1)], oneLine: ink.height < parseFloat(ws.lineHeight || '99') * 1.6 || ink.height < 22,
      footFromWinBottom: +(wr.bottom - fr.bottom).toFixed(1), footLeftFromWin: +(fr.left - wr.left).toFixed(1), winRightFromFoot: +(wr.right - fr.right).toFixed(1),
    }
  }
  return {
    title: win.querySelector('.win-ttl')?.textContent, head: win.querySelector('[data-testid="lwday-away-h"]')?.textContent || null,
    lines: rows.length, whole, cut, below, above, expectN: cut + below,
    win: { top: Math.round(wr.top), bottom: Math.round(wr.bottom), h: Math.round(wr.height), tall: win.classList.contains('is-tall') },
    body: { h: Math.round(br.height), top: Math.round(br.top), bottom: Math.round(br.bottom), scrollTop: Math.round(body.scrollTop), scrollH: body.scrollHeight },
    foot: f,
    lastRowWhole: rows.length ? rows[rows.length - 1].getBoundingClientRect().bottom <= br.bottom + 1 : null,
  }
}
/* read, and if the foot's number does not yet equal the measured lines, read again every 50ms for up to 3s: the lag is recorded
   (headless WebKit stalls the page for about 300ms after a screenshot — measured: 46ms without one, 313-345ms with one) */
async function measure(w) {
  const t0 = Date.now(); let m = await w.page.evaluate(MEASURE)
  while (m && footN(m) !== m.expectN && Date.now() - t0 < 3000) { await sleep(50); m = await w.page.evaluate(MEASURE) }
  if (m) m.lagMs = Date.now() - t0
  return m
}
function footN(m) { const mm = m?.foot?.text?.match(/^↓ (\d+) more$/); return mm ? +mm[1] : (m?.foot ? NaN : 0) }
/* assert: the foot's number equals cut + below (or no foot when 0) */
const check = (m, label) => {
  const n = footN(m), ok = n === m.expectN
  return { ok, note: `${label}${m.lagMs > 150 ? ' [foot caught up after ' + m.lagMs + 'ms]' : ''}: away ${m.lines}, whole ${m.whole}, cut ${m.cut}, below ${m.below}, foot ${m.foot ? '“' + m.foot.text + '”' : 'none'}${ok ? '' : ' <-- MISMATCH, expected ' + m.expectN}` }
}
async function openDay(w, iso = DAY) {
  const h = w.page.locator(T('head-' + iso)).first()
  await h.evaluate(e => e.scrollIntoView({ block: 'nearest', inline: 'center' })); await sleep(300)
  await tap(w, T('head-' + iso)); await sleep(700)
  if (!(await vis(w.page, T('win-lwday')))) throw new Error('the day panel did not open for ' + iso)
}
/* a finger swipe on the list (Chromium: raw touch events by CDP, resting before the lift; WebKit cannot — the list is set by scrollTop and it is said) */
async function scrollList(w, delta) {
  const P = w.page
  const b = await boxOf(P, `${T('win-lwday')} .win-body`)
  const before = await P.evaluate(() => document.querySelector('[data-testid="win-lwday"] .win-body').scrollTop)
  if (!w.touch) {
    await P.mouse.move(b.x + b.w / 2, b.y + b.h / 2)
    const steps = Math.ceil(Math.abs(delta) / 100)
    for (let i = 0; i < steps; i++) { await P.mouse.wheel(0, Math.sign(delta) * Math.min(100, Math.abs(delta) - i * 100)); await sleep(80) }
    await sleep(500); return 'wheel'
  }
  if (w.cdp) {
    const x = b.x + b.w / 2; let y = Math.sign(delta) > 0 ? b.y + b.h - 40 : b.y + 40
    let left = Math.abs(delta)
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
    while (left > 0) { const d = Math.min(10, left); y -= Math.sign(delta) * d; left -= d; await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] }); await sleep(16) }
    await sleep(90)
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await sleep(900)
    const after = await P.evaluate(() => document.querySelector('[data-testid="win-lwday"] .win-body').scrollTop)
    if (Math.abs(after - before) < 2) { await P.evaluate(d => { document.querySelector('[data-testid="win-lwday"] .win-body').scrollTop += d }, delta); await sleep(400); return 'finger moved nothing -> scrollTop set' }
    return 'finger'
  }
  await P.evaluate(d => { document.querySelector('[data-testid="win-lwday"] .win-body').scrollTop += d }, delta); await sleep(500)
  return 'scrollTop set (WebKit: touch drives no browser scroll)'
}
const listTo = (w, to) => w.page.evaluate(to => { const b = document.querySelector('[data-testid="win-lwday"] .win-body'); b.scrollTop = to === 'end' ? b.scrollHeight : to }, to)

/* ---------- scenarios 1-5 (one function; desktop and phone share it) ---------- */
async function dayScenarios(w, size) {
  let pics5note = ''
  const P = w.page, ph = w.touch
  const pre = `${size}`
  await toWar(w); await toMonth(w, 'NOV', DAY)
  await openDay(w)
  await P.evaluate(() => { const a = document.activeElement; a && a.blur && a.blur() })
  // ---- 1
  let m = await measure(w); let c = check(m, 'top')
  const f = m.foot
  const pics1 = [await winShot(w, `${pre}-s1-day-top`)]
  const exp1 = []
  if (!f) exp1.push('no foot at the top')
  else {
    if (!f.outsideBody) exp1.push('foot is inside .win-body')
    if (!f.straightAfterBody) exp1.push('foot is not straight after .win-body')
    if (f.gapToBody > 1.5 || f.gapToBody < -1.5) exp1.push('gap to body ' + f.gapToBody)
    if (f.fontSize !== '12px') exp1.push('font ' + f.fontSize)
    if (!/^1px solid/.test(f.borderTop)) exp1.push('border ' + f.borderTop)
    if (f.focusableInside || f.tabindex !== null || f.tag === 'BUTTON' || f.tag === 'A') exp1.push('focusable markup')
    if (!f.inkInsideFoot) exp1.push('words outside foot box')
    if (!f.oneLine) exp1.push('words not on one line')
  }
  if (!c.ok) exp1.push(c.note)
  // Tab never lands on it (desktop keyboard); a click changes nothing
  let tabNote = 'not tried on a phone'
  if (!ph) {
    await P.evaluate(() => document.activeElement && document.activeElement.blur())
    let landed = 0, seen = []
    for (let i = 0; i < 80; i++) { await P.keyboard.press('Tab'); const r = await P.evaluate(() => { const a = document.activeElement; return { in: !!a.closest('[data-testid="lwday-more"]'), d: a.tagName + (a.getAttribute('data-testid') ? '#' + a.getAttribute('data-testid') : '') } }); if (r.in) landed++; if (i < 14) seen.push(r.d) }
    tabNote = `80 Tabs: landed on the foot ${landed} times (first stops: ${seen.slice(0, 8).join(' > ')})`
    if (landed) exp1.push('Tab landed on the foot')
    await P.evaluate(() => document.activeElement && document.activeElement.blur())
  }
  const fb = await boxOf(P, T('lwday-more')), before = await measure(w)
  if (ph) { await P.touchscreen.tap(fb.x + fb.w / 2, fb.y + fb.h / 2) } else { await P.mouse.click(fb.x + 30, fb.y + fb.h / 2) }
  await sleep(500)
  const after = await measure(w)
  const same = after.body.scrollTop === before.body.scrollTop && after.win.top === before.win.top && after.win.h === before.win.h && after.foot?.text === before.foot?.text && after.title === before.title
  if (!same) exp1.push(`click/tap on the foot changed something: ${JSON.stringify({ b: [before.body.scrollTop, before.win.top, before.win.h, before.foot?.text], a: [after.body.scrollTop, after.win.top, after.win.h, after.foot?.text] })}`)
  pics1.push(await winShot(w, `${pre}-s1-day-after-foot-press`))
  rec('1 long Away list, top', size, exp1.length ? 'FAIL' : 'PASS', `${c.note}; foot facts ${JSON.stringify({ ...f, inkBox: undefined })}; ${tabNote}; press on foot: ${same ? 'nothing changed' : 'CHANGED'}${exp1.length ? ' || ' + exp1.join('; ') : ''}`, pics1)
  // ---- 2 part way
  const how = await scrollList(w, ph ? 110 : 20)
  m = await measure(w); c = check(m, 'part way')
  const p2 = await winShot(w, `${pre}-s2-part-way`)
  rec('2 part way', size, c.ok && m.body.scrollTop > 0 && m.foot ? 'PASS' : 'FAIL', `${how}; scrollTop ${m.body.scrollTop}; ${c.note}`, [p2])
  // ---- 3 the end
  await listTo(w, 'end'); await sleep(500)
  m = await measure(w); c = check(m, 'end')
  const p3 = await winShot(w, `${pre}-s3-end`)
  const endOk = !m.foot && m.lastRowWhole && m.expectN === 0
  await listTo(w, 0); await sleep(500)
  const top2 = await measure(w), c2 = check(top2, 'back at top')
  const p3b = await winShot(w, `${pre}-s3-back-top`)
  rec('3 the end', size, endOk && c2.ok && top2.foot && footN(top2) === footN(before) ? 'PASS' : 'FAIL', `${c.note}; last row whole ${m.lastRowWhole}; scrolled back: ${c2.note}`, [p3, p3b])
  // ---- 4 a day that fits, ‹ ›
  const startTitle = top2.title, startN = footN(top2)
  const trail = []; let fitIdx = -1
  for (let i = 1; i <= 12; i++) {
    if (ph) {
      const bx = await boxOf(P, T('lwday-next'))
      await P.locator(T('lwday-next')).tap()
      if (i === 1) { const pRight = await winShot(w, `${pre}-s4-right-after-tap-next`) ; trail.push('pic right after tap: ' + pRight) }
    } else await P.locator(T('lwday-next')).click()
    await sleep(500)
    const mm = await measure(w); trail.push(`${mm.title}: away ${mm.lines}, foot ${mm.foot ? mm.foot.text : 'none'}, exp ${mm.expectN}`)
    if (!check(mm, 'x').ok) trail.push('MISMATCH!')
    if (!mm.foot && mm.lines > 0 && fitIdx < 0) { fitIdx = i; await winShot(w, `${pre}-s4-fits-no-foot`); break }
    if (!mm.foot && fitIdx < 0) { fitIdx = i; await winShot(w, `${pre}-s4-fits-no-foot`); break }
  }
  let back = 0
  for (let i = 0; i < 14 && (await measure(w)).title !== startTitle; i++) {
    if (ph) await P.locator(T('lwday-prev')).tap(); else await P.locator(T('lwday-prev')).click()
    await sleep(500); back++
    if (ph && i === 0) await winShot(w, `${pre}-s4-right-after-tap-prev`)
  }
  const back0 = await measure(w), cb = check(back0, 'stepped back')
  const p4 = await winShot(w, `${pre}-s4-stepped-back`)
  const stepOk = fitIdx > 0 && cb.ok && back0.title === startTitle && footN(back0) === startN
  // close by ✕, reopen from another date's heading, close by Escape
  await P.locator(T('win-lwday-x')).click().catch(async () => { await P.locator(T('win-lwday-x')).tap() }); await sleep(500)
  const closedX = !(await vis(P, T('win-lwday')))
  await openDay(w, '2026-11-25').catch(async e => { trail.push('reopen failed ' + e.message) })
  const reopened = await vis(P, T('win-lwday'))
  const ringed = await P.evaluate(() => { const e = document.querySelector('[data-testid="head-2026-11-25"]'); return e ? { cls: e.className, outline: getComputedStyle(e).outlineStyle + ' ' + getComputedStyle(e).outlineWidth, boxShadow: getComputedStyle(e).boxShadow.slice(0, 60) } : null })
  await winShot(w, `${pre}-s4-reopened-other-date`)
  await P.keyboard.press('Escape'); await sleep(500)
  const closedEsc = !(await vis(P, T('win-lwday')))
  rec('4 a day that fits; ✕; Escape', size, stepOk && closedX && reopened && closedEsc ? 'PASS' : 'FAIL', `trail ${trail.join(' | ')}; stepped back ${back} to “${back0.title}” foot ${back0.foot?.text}; ✕ closed ${closedX}; reopened from 25 Nov ${reopened}, its heading ${JSON.stringify(ringed)}; Escape closed ${closedEsc}`, [p4])
  // ---- 5 resized (desktop: the page taller, and the window dragged by its bar; phone: its two resting heights)
  await openDay(w)
  if (!ph) {
    const base = await measure(w)
    await P.setViewportSize({ width: PC.width, height: 1100 }); await sleep(700)
    const tall = await measure(w); const ct = check(tall, 'page 1100 tall')
    const p5 = await shot(w, `${pre}-s5-page-taller`)
    await P.setViewportSize(PC); await sleep(500)
    // drag the window up by its bar (more room above?) and down
    const bar = await boxOf(P, `${T('win-lwday')} .win-bar`)
    const winTop0 = (await measure(w)).win
    await P.mouse.move(bar.x + 120, bar.y + bar.h / 2); await P.mouse.down(); await P.mouse.move(bar.x + 120, bar.y + bar.h / 2 + 260, { steps: 10 }); await P.mouse.up(); await sleep(600)
    const low = await measure(w); const cl = check(low, 'window dragged 260 lower')
    const p5b = await winShot(w, `${pre}-s5-window-dragged-lower`)
    const bar2 = await boxOf(P, `${T('win-lwday')} .win-bar`)
    await P.mouse.move(bar2.x + 120, bar2.y + bar2.h / 2); await P.mouse.down(); await P.mouse.move(bar2.x + 120, 30, { steps: 12 }); await P.mouse.up(); await sleep(600)
    const high = await measure(w); const ch = check(high, 'window dragged to the top')
    const p5c = await winShot(w, `${pre}-s5-window-dragged-top`)
    const ok = ct.ok && cl.ok && ch.ok
    rec('5 window resized', size, ok ? 'PASS' : 'FAIL', `the window has no resize handle; page 864->1100: win h ${base.win.h}->${tall.win.h}, body ${base.body.h}->${tall.body.h}, ${ct.note}; dragged lower: win h ${low.win.h}, ${cl.note}; dragged to the top: win h ${high.win.h}, ${ch.note}`, [p5, p5b, p5c])
  } else {
    const a = await measure(w), ca = check(a, 'first rest')
    const pA = await winShot(w, `${pre}-s5-rest-first`)
    const wasTall = a.win.tall; await toggleRest(w); await sleep(250)
    const pRight = await winShot(w, `${pre}-s5-rest-toggle-right-after-tap`)
    await sleep(700)
    const b = await measure(w), cb2 = check(b, 'second rest')
    const pB = await winShot(w, `${pre}-s5-rest-second`)
    await toggleRest(w); await sleep(900)
    const c3 = await measure(w), cc = check(c3, 'back to first rest')
    if (w.usedMouseForBar) pics5note = ' (the touch tap on the bar toggled nothing in this test browser; a mouse click on it did)'
    rec('5 two resting heights', size, ca.ok && cb2.ok && cc.ok ? 'PASS' : 'FAIL', `first rest${pics5note}: win ${a.win.h} (tall ${a.win.tall}), body ${a.body.h}, ${ca.note}; other rest: win ${b.win.h} (tall ${b.win.tall}), body ${b.body.h}, ${cb2.note}; back: win ${c3.win.h}, ${cc.note}`, [pA, pRight, pB])
  }
  await P.keyboard.press('Escape').catch(() => {}); await sleep(300)
}

/* a tap on the window's bar toggles the phone's two resting heights; headless WebKit's touch gives no pointer events, so if the tap changes nothing a mouse click is used and the note says so */
async function toggleRest(w) {
  const P = w.page, was = await P.evaluate(() => document.querySelector('[data-testid="win-lwday"]').classList.contains('is-tall'))
  await P.locator(`${T('win-lwday')} .win-ttl`).tap(); await sleep(500)
  let now = await P.evaluate(() => document.querySelector('[data-testid="win-lwday"]').classList.contains('is-tall'))
  if (now === was) { const b = await boxOf(P, `${T('win-lwday')} .win-ttl`); await P.mouse.click(b.x + b.w / 2, b.y + b.h / 2); w.usedMouseForBar = true; await sleep(500) }
}
/* ---------- the bell (8) ---------- */
async function bellScenario(w, size) {
  const P = w.page
  await go(P, 'schedule').catch(() => {})
  const btn = w.touch ? '#bellBtnM, .bellbtn' : '.bellbtn'
  await tap(w, btn); await sleep(600)
  if (!(await vis(P, T('bell-list')))) { rec('8 the bell', size, 'RECORDED', 'the bell list did not open', []); return }
  const m = await P.evaluate(() => {
    const sc = document.querySelector('.bl-scroll'), lines = [...document.querySelectorAll('.bell-list .bl-line')]
    const br = sc ? sc.getBoundingClientRect() : null
    let out = 0; if (br) for (const l of lines) if (l.getBoundingClientRect().bottom > br.bottom + 1) out++
    const more = document.querySelector('[data-testid="bell-more"]'), foot = document.querySelector('.bl-foot')
    return { lines: lines.length, expect: out, more: more ? more.innerText.replace(/\s+/g, ' ').trim() : null, foot: foot ? foot.innerText.replace(/\s+/g, ' ').trim() : null, footBoxH: foot ? Math.round(foot.getBoundingClientRect().height) : null }
  })
  const p = await shot(w, `${size}-s8-bell-open`)
  const markAll = P.getByRole('button', { name: /Mark all read/i }).first()
  let pressed = false
  if (await markAll.count() && await markAll.isVisible()) { if (w.touch) await markAll.tap(); else await markAll.click(); pressed = true; await sleep(500) }
  const p2 = await shot(w, `${size}-s8-bell-after-mark-all`)
  const overflows = m.lines > 0 && m.expect > 0
  rec('8 the bell', size, m.more ? ((+(m.more.match(/(\d+)/) || [])[1]) === m.expect ? 'PASS' : 'FAIL') : 'RECORDED', `lines ${m.lines}, not wholly in view ${m.expect}, foot “${m.foot}” more “${m.more}”${overflows ? '' : ' (the list does not overflow in the demo: no "more" cue to compare)'}; Mark all read pressed ${pressed}`, [p, p2])
  await P.keyboard.press('Escape'); await sleep(300)
  if (await vis(P, T('bell-list'))) { await tap(w, btn); await sleep(300) }
}

/* ---------- main (part 1) ---------- */
const state = await setUp()
if (want('desk')) {
  const w = await world({ vp: PC, state, label: 'desk', dsf: 1 }); await w.ctx.clock.install({ time: new Date('2026-07-13T09:00:00') }).catch(() => {})
  await w.page.reload(); await login(w.page, 'a').catch(() => {})
  await dayScenarios(w, 'pc').catch(e => { rec('desk scenarios', 'pc', 'NOT WALKED', e.stack.split('\n').slice(0, 3).join(' | ')) })
  await bellScenario(w, 'pc').catch(e => rec('8 the bell', 'pc', 'NOT WALKED', e.message))
  await w.ctx.close()
}
for (const eng of ['chromium', 'webkit']) {
  if (!want('ph-' + eng)) continue
  const w = await world({ vp: PHONE, touch: true, eng, state, dsf: 3, label: 'ph-' + eng })
  await dayScenarios(w, 'ph-' + eng).catch(e => rec('phone scenarios', 'ph-' + eng, 'NOT WALKED', e.stack.split('\n').slice(0, 3).join(' | ')))
  await bellScenario(w, 'ph-' + eng).catch(e => rec('8 the bell', 'ph-' + eng, 'NOT WALKED', e.message))
  await w.ctx.close()
}
/* ================= part 2: the drawing check (6/7), the other windows (9), the pinned rows (10-12), the plain-user round (13) ================= */
const DRAWINGS = resolve(HERE, '../../docs/img/handpass/2026-11-07-pictures-round')
/* a contact sheet of painted frames, each cut to a band (x,y,w,h) and numbered, so the frames can be looked at */
async function sheetOf(name, frames, band, z = 1) {
  const b = await engine('chromium')
  const ctx = await b.newContext({ viewport: { width: 1000, height: 400 }, deviceScaleFactor: 1 })
  const p = await ctx.newPage()
  const html = `<html><body style="margin:0;background:#0b0f14;color:#e8edf2;font:600 13px system-ui;display:flex;flex-wrap:wrap;gap:6px;padding:6px">${frames.map(f => `
    <div><div>${f.label}</div><div style="border:${f.bad ? '3px solid #ffb020' : '1px solid #2a323b'};width:${band.w * z}px;height:${band.h * z}px;overflow:hidden;position:relative">
    <img src="data:image/png;base64,${f.data}" style="position:absolute;left:0;top:0;transform-origin:0 0;transform:translate(${-band.x * z}px,${-band.y * z}px) scale(${z})"></div></div>`).join('')}</body></html>`
  await p.setContent(html); await sleep(300)
  const h = await p.evaluate(() => document.body.scrollHeight)
  await p.setViewportSize({ width: 1000, height: h })
  await p.screenshot({ path: `${OUT}/${name}.png`, fullPage: true })
  await ctx.close(); return name
}
/* the drawing's cue box: the amber ring is drawn on it, inside its edge; read the ring's bounding box in the lower half of the picture */
async function ringBox(file) {
  const b = await engine('chromium'); const ctx = await b.newContext(); const p = await ctx.newPage()
  const data = readFileSync(file).toString('base64')
  const r = await p.evaluate(async d => {
    const img = new Image(); img.src = 'data:image/png;base64,' + d; await img.decode()
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0)
    const px = g.getImageData(0, 0, c.width, c.height).data
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1
    for (let y = Math.floor(c.height * .55); y < c.height; y++) for (let x = 0; x < c.width; x++) { const i = (y * c.width + x) * 4; if (px[i] > 230 && px[i + 1] > 150 && px[i + 1] < 200 && px[i + 2] < 70) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y } }
    return { w: img.width, h: img.height, x0, y0, x1, y1 }
  }, data)
  await ctx.close(); return r
}
/* the first bright pixel (the words) inside the drawing's amber ring, from its left */
async function inkLeft(file, rb) {
  const b = await engine('chromium'); const ctx = await b.newContext(); const p = await ctx.newPage()
  const r = await p.evaluate(async ([d, rb]) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + d; await img.decode()
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0)
    const px = g.getImageData(0, 0, c.width, c.height).data
    for (let x = rb.x0 + 8; x < rb.x1; x++) for (let y = rb.y0 + 8; y < rb.y1 - 8; y++) { const i = (y * c.width + x) * 4; if (px[i] > 100 && px[i + 1] > 100 && px[i + 2] > 100) return x }
    return -1
  }, [readFileSync(file).toString('base64'), rb])
  await ctx.close(); return r
}
async function drawingCompare(kind) {   // kind: 'ph' | 'pc'
  const touch = kind === 'ph', vp = touch ? PHONE : PC
  const w = await world({ vp, touch, state, dsf: 2, label: 'draw-' + kind })
  await toWar(w); await toMonth(w, 'NOV', DAY); await openDay(w)
  await w.page.evaluate(() => { const a = document.activeElement; a && a.blur && a.blur() }); await sleep(300)
  const m = await measure(w), wb = await boxOf(w.page, T('win-lwday'))
  // the same framing as the drawing's own picture
  const clipBox = touch ? { x: 0, y: Math.max(0, wb.y - 64), w: vp.width, h: (wb.b - wb.y) + 64 + 8 } : { x: wb.x - 30, y: wb.y - 40, w: wb.w + 60, h: wb.h + 80 }
  const mine = `${kind}-draw-mine-top`; await shot(w, mine, clipBox)
  const dfile = `${DRAWINGS}/q-morebelow-${kind}-A-top.png`
  const rb = await ringBox(dfile)
  // the drawing's cue (ring = its box, drawn inside its edge), in css px from the picture's top-left
  const dr = { left: rb.x0 / 2, right: (rb.x1 + 1) / 2, top: rb.y0 / 2, bottom: (rb.y1 + 1) / 2 }
  const dh = dr.bottom - dr.top
  const fromWinBottomD = (rb.h / 2) - dr.bottom - (touch ? 8 : 40)    // the picture runs 8 (phone) / 40 (desktop) css px under the window's foot
  const f = m.foot
  const diffs = []
  const cmp = (what, a, b2) => { const d = +(a - b2).toFixed(1); diffs.push({ what, drawing: +a.toFixed(1), build: +b2.toFixed(1), diff: d, over2: Math.abs(d) > 2 }) }
  cmp('foot box height', dh, f.h)
  cmp('foot width', dr.right - dr.left, f.right - f.left)
  const winLeftInPic = touch ? wb.x - clipBox.x : 30
  cmp('foot left from window left', dr.left - winLeftInPic, f.footLeftFromWin)
  cmp('foot top in the same frame', dr.top, f.top - clipBox.y)
  cmp('foot bottom in the same frame', dr.bottom, f.bottom - clipBox.y)
  // the words: size and colour (the drawing's CSS: 12px, var(--ink-3)), left offset inside the foot = 7 padding + 4 (drawing)
  const ink3 = await w.page.evaluate(() => { const e = document.createElement('i'); e.style.color = 'var(--ink-3)'; document.body.appendChild(e); const c = getComputedStyle(e).color; e.remove(); return c })
  diffs.push({ what: 'words size', drawing: '12px', build: f.fontSize, over2: f.fontSize !== '12px' })
  diffs.push({ what: 'words colour', drawing: ink3, build: f.color, over2: ink3 !== f.color })
  cmp('words ink left in the same frame', (await inkLeft(dfile, rb)) / 2, f.inkBox[0] - clipBox.x)
  diffs.push({ what: 'hairline', drawing: '1px solid var(--edge)', build: f.borderTop, over2: !/^1px solid/.test(f.borderTop) })
  // side by side: the drawing's picture and mine, same scale, the foot band cut out (lower 90 css px of each)
  const tile = async (file, label) => ({ label, data: readFileSync(file).toString('base64') })
  const dh2 = rb.h
  const band = { x: 0, y: Math.max(0, dh2 - 180), w: rb.w, h: Math.min(180, dh2) }
  const mineFile = `${OUT}/${mine}.png`
  const sheetName = await sheetOf(`${kind}-draw-sidebyside`, [await tile(dfile, `DRAWING q-morebelow-${kind}-A-top (foot band, 2x)`), await tile(mineFile, 'BUILD (foot band, 2x)')], band, 1)
  const over = diffs.filter(d => d.over2)
  rec(`${kind === 'ph' ? '6' : '7'} drawing check (${kind})`, kind === 'ph' ? 'ph-chromium dsf2' : 'pc dsf2', over.length ? 'FAIL' : 'PASS', `foot “${f.text}” ${JSON.stringify(diffs)}`, [mine, sheetName])
  await w.ctx.close()
}
if (want('draw')) {
  await drawingCompare('pc').catch(e => rec('7 drawing check (pc)', 'pc', 'NOT WALKED', e.stack.split('\n').slice(0, 3).join(' | ')))
  await drawingCompare('ph').catch(e => rec('6 drawing check (ph)', 'ph', 'NOT WALKED', e.stack.split('\n').slice(0, 3).join(' | ')))
}

/* ---- 9: no other window grows a foot ---- */
const WINS = () => [...document.querySelectorAll('.floatwin, [role="dialog"], .sheet, [data-testid$="-sheet"], [data-testid="bid-picker"]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }).map(e => {
  const body = e.querySelector('.win-body') || e.querySelector('.sheet-body') || null
  const after = body ? [...(body.parentElement.children)].slice([...body.parentElement.children].indexOf(body) + 1).map(c => c.className || c.tagName) : null
  return { id: e.getAttribute('data-winid') || e.getAttribute('data-testid') || e.className.slice(0, 30), hasWinBody: !!e.querySelector('.win-body'), afterBody: after, hasMoreCue: !!e.querySelector('[data-testid="lwday-more"], .lwday-more, .bl-more, .zz-cue') }
})
async function otherWindows(size, vp, touch) {
  const w = await world({ vp, touch, state, dsf: touch ? 3 : 1, label: 'win9-' + size }); const P = w.page
  const out = []
  const look = async (label, pics) => { await sleep(500); const ws = await P.evaluate(WINS); out.push({ label, windows: ws }); if (pics) await shot(w, `${size}-s9-${pics}`) }
  try {
    await go(P, 'editsched'); await sleep(700)
    if (await P.locator('#histBtn').count() && await P.locator('#histBtn').first().isVisible()) { await tap(w, '#histBtn'); await look('changes window (History clock)', 'changes'); await tap(w, '#histBtn'); await sleep(300) } else out.push({ label: 'changes window', note: 'the history clock is not shown at this size' })
    const chip = P.locator('#eWeek [data-oilsent]').filter({ visible: true }).first()
    if (await chip.count()) { await chip.scrollIntoViewIfNeeded(); if (touch) await chip.tap(); else await chip.click(); await look('ALL AVAIL window (count chip)', 'allavail'); await P.keyboard.press('Escape'); await sleep(300) } else out.push({ label: 'ALL AVAIL window', note: 'no count chip found on the edit week' })
  } catch (e) { out.push({ label: 'edit schedule windows', note: 'failed: ' + e.message.split('\n')[0] }) }
  try {
    await go(P, 'inputs'); await sleep(900)
    await P.waitForSelector('#inpCal .ic-mon'); await sleep(400)
    const day = P.locator('#inpCal [data-icday]').filter({ visible: true }).first()
    await day.scrollIntoViewIfNeeded(); if (touch) await day.tap({ position: { x: 8, y: 8 } }); else await day.click({ position: { x: 8, y: 8 } })
    await sleep(800)
    if (await vis(P, T('win-inputsday'))) await look("the Inputs calendar's day window (not in the brief's list; looked at too)", 'inputsday'); else out.push({ label: 'inputs day', note: 'did not open' })
    const add = P.getByRole('button', { name: /\+ Input/ }).filter({ visible: true }).first()
    if (await add.count()) { if (touch) await add.tap(); else await add.click(); await look("an input's own window (+ Input)", 'inputwin'); await P.keyboard.press('Escape'); await sleep(400); if (await P.getByRole('button', { name: /Discard|Leave|Yes/ }).count()) { await P.getByRole('button', { name: /Discard|Leave|Yes/ }).first().click().catch(() => {}); await sleep(300) } } else out.push({ label: 'input window', note: 'no + Input button' })
  } catch (e) { out.push({ label: 'input window', note: 'failed: ' + e.message.split('\n')[0] }) }
  try {
    await toWar(w); await toMonth(w, 'NOV', DAY)
    // an empty cell: a person with no entry on 2026-11-20
    const cell = P.locator('td[data-testid^="cell-"][data-testid$="-2026-11-20"]').first()
    await cell.scrollIntoViewIfNeeded(); await sleep(200)
    if (touch) await cell.tap(); else await cell.click()
    await sleep(700)
    if (await vis(P, T('bid-picker'))) await look('Leave War bid window (empty cell)', 'bidwin'); else out.push({ label: 'bid window', note: 'did not open: ' + JSON.stringify(await P.evaluate(WINS)) })
    await P.keyboard.press('Escape'); await sleep(400)
    if (await vis(P, T('bid-picker'))) { await tap(w, T('bid-cancel')); await sleep(300) }
    // the day's list: dice has two entries on 1 Dec
    await toMonth(w, 'DEC', PAIR_DAYS[0])
    const c2 = P.locator(T('cell-dice-' + PAIR_DAYS[0])).first(); await c2.scrollIntoViewIfNeeded(); await sleep(200)
    if (touch) await c2.tap(); else await c2.click()
    await look("the day's list (a day with two entries)", 'daylist')
  } catch (e) { out.push({ label: 'Leave War windows', note: 'failed: ' + e.message.split('\n')[0] }) }
  const grown = out.filter(o => o.windows && o.windows.some(x => x.hasMoreCue || (x.afterBody && x.afterBody.some(c => c !== 'win-foot cw-foot'))))
  rec('9 no other window grows a foot', size, grown.length ? 'FAIL' : 'RECORDED', JSON.stringify(out), [])
  await w.ctx.close()
}
if (want('s9')) {
  await otherWindows('pc', PC, false).catch(e => rec('9 other windows', 'pc', 'NOT WALKED', e.message))
  await otherWindows('ph-chromium', PHONE, true).catch(e => rec('9 other windows', 'ph-chromium', 'NOT WALKED', e.message))
}

/* ---- 10-12: the pinned dates rows (D1789) ---- */
const PIN_LOG = (which) => {
  window.__fr = []; window.__frOn = true
  const tick = t => {
    const tb = document.querySelector('.topbar')?.getBoundingClientRect().bottom ?? 0
    let head, sh
    if (which === 'lw') { head = [...document.querySelectorAll('#page-leavewar tbody.mxhead')].find(h => !h.closest('.mxfixed')); sh = document.querySelector('[data-testid="sticky-head"]') }
    else { head = document.querySelector('#qtbl thead'); sh = document.querySelector('[data-testid="qsticky-head"]') }
    const hr = head ? head.getBoundingClientRect() : null, shr = sh ? sh.getBoundingClientRect() : null
    window.__fr.push({ t: +t.toFixed(1), y: Math.round(scrollY), headTop: hr && +hr.top.toFixed(1), headBot: hr && +hr.bottom.toFixed(1), tb: +tb.toFixed(1), frozen: !!(shr && shr.height > 0), shTop: shr && +shr.top.toFixed(1) })
    if (window.__frOn) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
const readLog = page => page.evaluate(() => { window.__frOn = false; return window.__fr })
const judge = f => f.headTop >= f.tb - .5 ? 'header' : f.frozen ? 'frozen' : f.headBot > f.tb + .5 ? `CUT (${Math.round(f.headBot - f.tb)}px left)` : 'NONE'
function summarise(log) {
  const v = log.map(f => ({ ...f, v: judge(f) })), gap = v.filter(f => /CUT|NONE/.test(f.v))
  const first = v.findIndex(f => f.v !== 'header')
  const both = v.filter(f => f.headTop < f.tb - .5 && f.headBot > f.tb + .5 && f.frozen).length   // real row half under the bar while the pinned one is drawn too (fine: pinned covers it)
  return { frames: v.length, gapFrames: gap.length, gaps: gap.slice(0, 6).map(f => f.v + ' y=' + f.y), firstChange: first < 0 ? null : v.slice(Math.max(0, first - 1), first + 3).map(f => `y=${f.y} ${f.v}`), medianFrameMs: v.length > 1 ? +[...v.slice(1).map((f, i) => f.t - v[i].t)].sort((a, b) => a - b)[Math.floor((v.length - 1) / 2)].toFixed(1) : null }
}
/* settled state: which row stands, and the pinned dates against the grid's columns */
const PIN_STATE = which => {
  const tb = document.querySelector('.topbar').getBoundingClientRect().bottom
  if (which === 'lw') {
    const head = [...document.querySelectorAll('#page-leavewar tbody.mxhead')].find(h => !h.closest('.mxfixed')), hr = head.getBoundingClientRect()
    const sh = document.querySelector('[data-testid="sticky-head"]'), shr = sh ? sh.getBoundingClientRect() : { top: 0, height: 0 }
    const shown = shr.height > 0
    const cells = [...(sh || document.createElement('i')).querySelectorAll('[data-testid^="head-20"]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > 0 && r.left < innerWidth })
    // columns: the same date's grid cell (first row) against the pinned date cell
    const out = []
    for (const c of cells.slice(2, 5)) {
      const iso = c.getAttribute('data-testid').replace('head-', '')
      const g = document.querySelector(`td[data-testid^="cell-"][data-testid$="-${iso}"]`)
      if (g) out.push({ iso, pinnedLeft: +c.getBoundingClientRect().left.toFixed(1), gridLeft: +g.getBoundingClientRect().left.toFixed(1) })
    }
    return { y: Math.round(scrollY), tb: Math.round(tb), realTop: Math.round(hr.top), realBot: Math.round(hr.bottom), pinnedShown: shown, pinnedTop: Math.round(shr.top), pinnedH: Math.round(shr.height), verdict: hr.top >= tb - .5 ? 'real row below the bar' : shown ? 'pinned row under the bar' : (hr.bottom > tb + .5 ? 'CUT' : 'MISSING'), cols: out, maxColDiff: out.length ? Math.max(...out.map(o => Math.abs(o.pinnedLeft - o.gridLeft))) : null }
  }
  const th = document.querySelector('#qtbl thead'), hr = th.getBoundingClientRect(), sh = document.querySelector('[data-testid="qsticky-head"]'), shr = sh ? sh.getBoundingClientRect() : { top: 0, height: 0 }
  const shown = shr.height > 0
  const pin = [...(sh || document.createElement('i')).querySelectorAll('th')].filter(e => e.getBoundingClientRect().width > 0), real = [...th.querySelectorAll('th')].filter(e => e.getBoundingClientRect().width > 0)
  const n = Math.min(pin.length, real.length, 6), cols = []
  for (let i = 0; i < n; i++) cols.push({ pinnedLeft: +pin[i].getBoundingClientRect().left.toFixed(1), realLeft: +real[i].getBoundingClientRect().left.toFixed(1) })
  return { y: Math.round(scrollY), tb: Math.round(tb), realTop: Math.round(hr.top), realBot: Math.round(hr.bottom), pinnedShown: shown, pinnedTop: Math.round(shr.top), pinnedH: Math.round(shr.height), verdict: hr.top >= tb - .5 ? 'real heading below the bar' : shown ? 'pinned heading under the bar' : (hr.bottom > tb + .5 ? 'CUT' : 'MISSING'), cols, maxColDiff: cols.length ? Math.max(...cols.map(o => Math.abs(o.pinnedLeft - o.realLeft))) : null }
}
async function screencastRun(w, fn, label, band, z = 1, keep = null) {
  const frames = []
  w.cdp.on('Page.screencastFrame', async f => { frames.push(f.data); try { await w.cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }) } catch {} })
  await w.cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1, maxWidth: w.vp.width * (w.touch ? 2 : 1), maxHeight: w.vp.height * (w.touch ? 2 : 1) })
  await sleep(400)
  const r = await fn()
  await sleep(400)
  await w.cdp.send('Page.stopScreencast')
  w.cdp.removeAllListeners('Page.screencastFrame')
  return { frames, r }
}
const SCALE = w => (w.touch ? 2 : 1)
async function gridDesk(label, opts = {}) {
  const w = await world({ vp: PC, who: 'a', dsf: 1, eng: 'chromium-sb', label: 'pin-desk' + label }); const P = w.page
  await toWar(w); await P.evaluate(() => scrollTo(0, 0)); await sleep(600)
  if (opts.zoomOut) { await P.mouse.move(700, 500); await P.keyboard.down('Control'); for (let i = 0; i < 12; i++) { await P.mouse.wheel(0, 200); await sleep(60) } await P.keyboard.up('Control'); await sleep(700) }
  if (opts.rearrange) {
    await tap(w, T('lw-settings')).catch(async () => { await P.locator('[aria-label*="Settings"], .gearbtn, #lwGear').first().click() })
    await sleep(400)
    const r = P.getByText(/Rearrange the grid/i).first(); if (await r.count()) { await r.click(); await sleep(500) }
    await P.keyboard.press('Escape').catch(() => {}); await sleep(300)
  }
  await P.evaluate(() => scrollTo(0, 0)); await sleep(500)
  const st0 = await P.evaluate(PIN_STATE, 'lw')
  const pics = [], states = []
  const tag = 'pc-s10' + label
  // wheel in 100px steps from the top, a picture at each; until the page is well past the row
  for (let i = 0; i < 14; i++) {
    await P.mouse.move(700, 600); await P.mouse.wheel(0, 100); await sleep(300)
    const s = await P.evaluate(PIN_STATE, 'lw'); states.push(s)
    if (Math.abs(s.realTop - s.tb) < 140 || i < 2) pics.push(await shot(w, `${tag}-wheel-${String(i).padStart(2, '0')}`, { x: 0, y: 0, w: PC.width, h: 300 }))
    if (s.y > st0.realTop + 260) break
  }
  // fine steps (20px) across the moment the real row reaches the top bar
  await P.evaluate(() => scrollTo(0, 0)); await sleep(500)
  await P.evaluate(y => scrollTo(0, y), Math.max(0, st0.realTop - st0.tb - 70)); await sleep(500)
  const fine = []
  for (let i = 0; i < 9; i++) { await P.mouse.move(700, 600); await P.mouse.wheel(0, 20); await sleep(260); const s = await P.evaluate(PIN_STATE, 'lw'); fine.push(s); states.push(s); if (i % 2 === 0) pics.push(await shot(w, tag + '-fine-' + String(i).padStart(2, '0'), { x: 0, y: 0, w: PC.width, h: 300 })) }
  const bad = states.filter(s => /CUT|MISSING/.test(s.verdict))
  const colMax = Math.max(0, ...states.map(s => s.maxColDiff || 0))
  const frameRuns = {}
  for (let k = 0; k < 3; k++) { await P.evaluate(() => scrollTo(0, 0)); await sleep(600); await P.mouse.move(700, 600); await P.evaluate(PIN_LOG, 'lw'); for (let i = 0; i < 8; i++) { await P.mouse.wheel(0, 100); await sleep(60) } await sleep(400); frameRuns['wheel-' + k] = summarise(await readLog(P)) }
  // dragging the page's scroll bar: real mouse on the right-edge thumb
  await P.evaluate(() => scrollTo(0, 0)); await sleep(500)
  const dragStates = []
  await P.evaluate(PIN_LOG, 'lw')
  const dh = await P.evaluate(() => document.documentElement.scrollHeight - innerHeight), sbwNote = await P.evaluate(() => innerWidth - document.documentElement.clientWidth), sbw = await P.evaluate(() => innerWidth - document.documentElement.clientWidth), thumbH = Math.max(30, (PC.height - 34) * PC.height / (dh + PC.height))
  const tx = PC.width - Math.max(4, sbw / 2); let ty = 17 + thumbH / 2 + 2
  await P.mouse.move(tx, ty); await P.mouse.down()
  for (let i = 0; i < 30; i++) { ty += 4; await P.mouse.move(tx, ty); await sleep(25); if (i % 3 === 0) dragStates.push(await P.evaluate(PIN_STATE, 'lw')) }
  await P.mouse.up(); await sleep(300)
  const dragSum = summarise(await readLog(P)), dragMoved = await P.evaluate(() => Math.round(scrollY))
  pics.push(await shot(w, `${tag}-scrollbar-drag-end`, { x: 0, y: 0, w: PC.width, h: 300 }))
  const dragBad = dragStates.filter(s => /CUT|MISSING/.test(s.verdict))
  // and back up by the wheel
  const upStates = []
  for (let i = 0; i < 16; i++) { await P.mouse.move(700, 600); await P.mouse.wheel(0, -100); await sleep(250); upStates.push(await P.evaluate(PIN_STATE, 'lw')) }
  const upBad = upStates.filter(s => /CUT|MISSING/.test(s.verdict))
  pics.push(await shot(w, `${tag}-back-up`, { x: 0, y: 0, w: PC.width, h: 300 }))
  // the painted frames (screencast) of a quick push over the moment
  await P.evaluate(() => scrollTo(0, 0)); await sleep(600)
  const sc = await screencastRun(w, async () => { await P.mouse.move(700, 600); await P.evaluate(PIN_LOG, 'lw'); for (let i = 0; i < 4; i++) { await P.mouse.wheel(0, 100); await sleep(80) } await sleep(300); return summarise(await readLog(P)) })
  const fr = sc.frames.map((d, i) => ({ label: 'frame ' + i, data: d }))
  const sheetName = fr.length ? await sheetOf(`${tag}-painted-frames`, fr.slice(0, 24), { x: 0, y: 0, w: 700, h: 220 }, 1) : null
  const allGaps = Object.values(frameRuns).reduce((a, r) => a + r.gapFrames, 0) + dragSum.gapFrames + sc.r.gapFrames
  const ok = bad.length === 0 && dragBad.length === 0 && upBad.length === 0 && colMax <= 2 && allGaps === 0 && dragMoved > 0
  rec(`10 pinned dates row ${opts.zoomOut ? '(zoomed out)' : opts.rearrange ? '(Rearrange on)' : ''}`, 'pc', ok ? 'PASS' : 'FAIL', `start ${JSON.stringify({ y: st0.y, realTop: st0.realTop, tb: st0.tb })}; wheel steps ${states.length}: verdicts ${[...new Set(states.map(s => s.verdict))].join(' / ')}, bad ${bad.length}; maxColDiff ${colMax}px; in-page frame logs (rAF, before paint): ${JSON.stringify(frameRuns)}; scrollbar (${sbwNote}px wide) drag moved page to y=${dragMoved}, states bad ${dragBad.length}/${dragStates.length}, frames ${JSON.stringify(dragSum)}; wheel back up bad ${upBad.length}/${upStates.length}; painted-frames run ${JSON.stringify(sc.r)} with ${sc.frames.length} frames on sheet; transition states ${JSON.stringify(states.filter(s => Math.abs(s.realTop - s.tb) < 110).slice(0, 4).map(s => ({ y: s.y, realTop: s.realTop, tb: s.tb, v: s.verdict, pinnedTop: s.pinnedTop })))}`, [...pics.slice(0, 6), sheetName].filter(Boolean))
  await w.ctx.close()
}
if (want('s10')) {
  await gridDesk('').catch(e => rec('10 pinned dates desktop', 'pc', 'NOT WALKED', e.stack.split('\n').slice(0, 3).join(' | ')))
  await gridDesk('-zoomed-out', { zoomOut: true }).catch(e => rec('10 pinned dates desktop zoomed out', 'pc', 'NOT WALKED', e.stack.split('\n').slice(0, 3).join(' | ')))
  await gridDesk('-rearrange', { rearrange: true }).catch(e => rec('10 pinned dates desktop Rearrange', 'pc', 'NOT WALKED', e.stack.split('\n').slice(0, 3).join(' | ')))
}

/* ---- 11 and 12 on a phone ---- */
async function finger(w, y0, y1, px, x = 60, rest = 90) {
  let y = y0
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
  while ((y1 < y0 ? y > y1 : y < y1)) { y += (y1 < y0 ? -px : px); await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] }); await sleep(16) }
  await sleep(rest)
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}
async function pinchTogether(w, cx, cy, from = 120, to = 40) {
  const steps = 14
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx - from, y: cy, id: 1 }, { x: cx + from, y: cy, id: 2 }] })
  for (let i = 1; i <= steps; i++) { const d = from + (to - from) * i / steps; await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx - d, y: cy, id: 1 }, { x: cx + d, y: cy, id: 2 }] }); await sleep(20) }
  await sleep(90)
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}
async function phonePinned(which, eng) {
  const w = await world({ vp: PHONE, touch: true, eng, who: 'a', dsf: 2, label: `pin-${which}-${eng}` }); const P = w.page
  const size = 'ph-' + eng, tag = `${size}-s${which === 'lw' ? 11 : 12}`
  if (which === 'lw') await toWar(w); else { await go(P, 'quals'); await sleep(1200) }
  await P.evaluate(() => scrollTo(0, 0)); await sleep(600)
  const st0 = await P.evaluate(PIN_STATE, which), res = {}, pics = [], tag2 = which === 'lw' ? 'dates row' : 'heading'
  const settled = async n => { const s = await P.evaluate(PIN_STATE, which); res[n] = { y: s.y, v: s.verdict, maxColDiff: s.maxColDiff, realTop: s.realTop, tb: s.tb, pinnedTop: s.pinnedTop }; return s }
  if (eng === 'chromium') {
    for (const [k, px] of [['slow-drag', 6], ['flick', 45], ['push', 20]]) {
      for (let rep = 0; rep < 2; rep++) {
        await P.evaluate(() => scrollTo(0, 0)); await sleep(700)
        await P.evaluate(PIN_LOG, which)
        await finger(w, 760, 260, px, 60, k === 'flick' ? 5 : 90)
        // right after the lift (no wait), then settled
        if (rep === 0) pics.push(await shot(w, `${tag}-${k}-right-after`, { x: 0, y: 0, w: PHONE.width, h: 260 }))
        await sleep(1300)
        const log = await readLog(P); res[`${k}-${rep}`] = summarise(log)
        const s = await settled(`${k}-${rep}-settled`)
        if (rep === 0) pics.push(await shot(w, `${tag}-${k}-settled`, { x: 0, y: 0, w: PHONE.width, h: 260 }))
      }
    }
    // painted frames of a quick flick
    await P.evaluate(() => scrollTo(0, 0)); await sleep(800)
    const sc = await screencastRun(w, async () => { await P.evaluate(PIN_LOG, which); await finger(w, 760, 260, 45, 60, 5); await sleep(900); return summarise(await readLog(P)) })
    const fr = sc.frames.map((d, i) => ({ label: 'frame ' + i, data: d }))
    const sheetName = fr.length ? await sheetOf(`${tag}-painted-frames`, fr.slice(0, 24), { x: 0, y: 0, w: 268, h: 130 }, 1.5) : null
    if (sheetName) pics.push(sheetName)
    res.paintedRun = { ...sc.r, screencastFrames: sc.frames.length }
    // pinched out once, then scrolled
    await P.evaluate(() => scrollTo(0, 0)); await sleep(600)
    const z0 = await P.evaluate(() => { const t = document.querySelector('#page-leavewar table, #qtbl'); return t ? getComputedStyle(t).zoom + '|' + getComputedStyle(t).transform : null })
    await pinchTogether(w, 201, 500); await sleep(900)
    const z1 = await P.evaluate(() => { const t = document.querySelector('#page-leavewar table, #qtbl'); return t ? getComputedStyle(t).zoom + '|' + getComputedStyle(t).transform : null })
    pics.push(await shot(w, `${tag}-after-pinch`, { x: 0, y: 0, w: PHONE.width, h: 400 }))
    await P.evaluate(PIN_LOG, which)
    await finger(w, 760, 260, 20, 60, 90); await sleep(1200)
    res.afterPinchScroll = { ...summarise(await readLog(P)), zoomBefore: z0, zoomAfter: z1 }
    await settled('after-pinch-settled')
    pics.push(await shot(w, `${tag}-after-pinch-scrolled`, { x: 0, y: 0, w: PHONE.width, h: 300 }))
    if (which === 'qu') {
      // sideways first, then down
      await P.evaluate(() => scrollTo(0, 0)); await sleep(500)
      await finger(w, 300, 300, 1, 60, 1).catch(() => {})
    }
  } else {
    // WebKit: touch drives no browser scroll — the page is stepped by script, as a stand-in, and it is said
    for (let i = 0; i < 12; i++) { await P.evaluate(() => scrollBy(0, 40)); await sleep(120); const s = await P.evaluate(PIN_STATE, which); res['step-' + i] = { y: s.y, v: s.verdict, maxColDiff: s.maxColDiff } }
    pics.push(await shot(w, `${tag}-scripted-scroll`, { x: 0, y: 0, w: PHONE.width, h: 260 }))
    res.note = 'WebKit: a finger push cannot be walked (touches drive no browser scroll); the page was stepped 40px at a time by script'
  }
  const bad = Object.entries(res).filter(([k, v]) => v && (/CUT|MISSING/.test(v.v || '') || v.gapFrames > 0))
  rec(`${which === 'lw' ? '11 pinned dates row' : '12 Quals heading'}`, size, bad.length ? 'FAIL' : 'RECORDED', `start ${JSON.stringify({ y: st0.y, realTop: st0.realTop, tb: st0.tb, verdict: st0.verdict })}; ${JSON.stringify(res)}; runs with a cut/missing ${tag2} frame or state: ${bad.map(b => b[0]).join(', ') || 'none'}`, pics)
  await w.ctx.close()
}
if (want('s11')) {
  await phonePinned('lw', 'chromium').catch(e => rec('11 pinned dates phone', 'ph-chromium', 'NOT WALKED', e.stack.split('\n').slice(0, 3).join(' | ')))
  await phonePinned('lw', 'webkit').catch(e => rec('11 pinned dates phone', 'ph-webkit', 'NOT WALKED', e.stack.split('\n').slice(0, 3).join(' | ')))
}
if (want('s12')) {
  await phonePinned('qu', 'chromium').catch(e => rec('12 Quals phone', 'ph-chromium', 'NOT WALKED', e.stack.split('\n').slice(0, 3).join(' | ')))
  await phonePinned('qu', 'webkit').catch(e => rec('12 Quals phone', 'ph-webkit', 'NOT WALKED', e.stack.split('\n').slice(0, 3).join(' | ')))
  // desktop Quals: sideways first, then down and back up
  const w = await world({ vp: PC, who: 'a', dsf: 1, label: 'quals-desk' }); const P = w.page
  try {
    await go(P, 'quals'); await sleep(1200); await P.evaluate(() => scrollTo(0, 0)); await sleep(500)
    const st0 = await P.evaluate(PIN_STATE, 'qu'), states = [], pics = []
    await P.mouse.move(700, 500); await P.mouse.wheel(400, 0); await sleep(400); states.push(await P.evaluate(PIN_STATE, 'qu'))
    pics.push(await shot(w, 'pc-s12-sideways', { x: 0, y: 0, w: PC.width, h: 300 }))
    for (let i = 0; i < 12; i++) { await P.mouse.wheel(0, 100); await sleep(300); const s = await P.evaluate(PIN_STATE, 'qu'); states.push(s); if (Math.abs(s.realTop - s.tb) < 140) pics.push(await shot(w, `pc-s12-down-${String(i).padStart(2, '0')}`, { x: 0, y: 0, w: PC.width, h: 300 })) }
    for (let i = 0; i < 12; i++) { await P.mouse.wheel(0, -100); await sleep(250); states.push(await P.evaluate(PIN_STATE, 'qu')) }
    const bad = states.filter(s => /CUT|MISSING/.test(s.verdict)), col = Math.max(0, ...states.map(s => s.maxColDiff || 0))
    const frameRuns = []
    for (let k = 0; k < 3; k++) { await P.evaluate(() => scrollTo(0, 0)); await sleep(600); await P.evaluate(PIN_LOG, 'qu'); for (let i = 0; i < 8; i++) { await P.mouse.wheel(0, 100); await sleep(60) } await sleep(400); frameRuns.push(summarise(await readLog(P))) }
    rec('12 Quals heading', 'pc', bad.length === 0 && col <= 2 && frameRuns.every(r => r.gapFrames === 0) ? 'PASS' : 'FAIL', `start ${JSON.stringify({ y: st0.y, realTop: st0.realTop, tb: st0.tb })}; sideways, down and up: ${states.length} states, verdicts ${[...new Set(states.map(s => s.verdict))].join(' / ')}, bad ${bad.length}; maxColDiff ${col}px; rAF frame logs ${JSON.stringify(frameRuns)}`, pics.slice(0, 5))
  } catch (e) { rec('12 Quals desktop', 'pc', 'NOT WALKED', e.stack.split('\n').slice(0, 3).join(' | ')) }
  await w.ctx.close()
}

/* ---- 13: the plain-user round, as an admin and as the member ---- */
async function plainRound(who, size, vp, touch) {
  const w = await world({ vp, touch, state, who, dsf: touch ? 3 : 1, label: `plain-${who}-${size}` }); const P = w.page
  const notes = []
  try {
    await toWar(w); await toMonth(w, 'NOV', DAY)
    await openDay(w, '2026-11-26')
    const ring = await P.evaluate(() => { const e = document.querySelector('[data-testid="head-2026-11-26"]'); const cs = getComputedStyle(e); const k = e.querySelector('*'); return { cls: e.className, outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor, shadow: cs.boxShadow.slice(0, 80), childCls: k && k.className } })
    notes.push('date heading while its window is open: ' + JSON.stringify(ring))
    await shot(w, `${size}-s13-${who}-day-open`)
    for (let i = 0; i < 3; i++) { if (touch) await P.locator(T('lwday-next')).tap(); else await P.locator(T('lwday-next')).click(); await sleep(400) }
    notes.push('stepped to ' + await txt(P, `${T('win-lwday')} .win-ttl`))
    // the grid behind still pressable: tap another empty cell with the window open
    const cell = P.locator('td[data-testid^="cell-"][data-testid$="-2026-11-18"]').first()
    await cell.scrollIntoViewIfNeeded().catch(() => {})
    const dayStill = await vis(P, T('win-lwday'))
    if (touch) await cell.tap().catch(() => {}); else await cell.click().catch(() => {})
    await sleep(700)
    notes.push(`grid behind pressable: bid window ${await vis(P, T('bid-picker'))} with the day window ${await vis(P, T('win-lwday'))} (day window was open ${dayStill})`)
    await shot(w, `${size}-s13-${who}-cell-pressed-with-day-open`)
    if (await vis(P, T('bid-picker'))) { await P.keyboard.press('Escape'); await sleep(400); if (await vis(P, T('bid-picker'))) await tap(w, T('bid-cancel')) }
    if (await vis(P, T('win-lwday'))) { await P.locator(T('win-lwday-x')).click().catch(() => P.locator(T('win-lwday-x')).tap()); await sleep(400) }
    notes.push('✕ closed ' + !(await vis(P, T('win-lwday'))))
    await openDay(w, '2026-11-26'); await P.keyboard.press('Escape'); await sleep(400); notes.push('Escape closed ' + !(await vis(P, T('win-lwday'))))
    // the bell open and close
    const btn = touch ? '#bellBtnM, .bellbtn' : '.bellbtn'
    await tap(w, btn); await sleep(500); const opened = await vis(P, T('bell-list')); await shot(w, `${size}-s13-${who}-bell`); await tap(w, btn); await sleep(400)
    notes.push(`bell opened ${opened}, closed ${!(await vis(P, T('bell-list')))}`)
    // the grid scrolled down and up
    await P.evaluate(() => scrollTo(0, 0)); await sleep(300)
    await P.mouse.move(Math.min(700, vp.width / 2), 600)
    const y0 = await P.evaluate(() => scrollY)
    await P.evaluate(() => scrollBy(0, 500)); await sleep(500); const y1 = await P.evaluate(() => scrollY); const s1 = await P.evaluate(PIN_STATE, 'lw')
    await shot(w, `${size}-s13-${who}-grid-down`, { x: 0, y: 0, w: vp.width, h: 300 })
    await P.evaluate(() => scrollTo(0, 0)); await sleep(500); const y2 = await P.evaluate(() => scrollY)
    notes.push(`grid scrolled ${y0}->${y1}->${y2}; at the bottom ${s1.verdict}`)
    // tap a cell to open the bid window and close it
    const c2 = P.locator('td[data-testid^="cell-"][data-testid$="-2026-11-24"]').first(); await c2.scrollIntoViewIfNeeded().catch(() => {})
    if (touch) await c2.tap(); else await c2.click(); await sleep(700)
    const bidOpen = await vis(P, T('bid-picker')); await shot(w, `${size}-s13-${who}-bid-window`)
    if (bidOpen) { await tap(w, T('bid-cancel')); await sleep(400) }
    notes.push(`cell tapped: bid window opened ${bidOpen}, closed ${!(await vis(P, T('bid-picker')))}${!bidOpen && who !== 'a' ? ' (a member: not his row / closed day: see picture)' : ''}`)
    // Quals down and up
    await go(P, 'quals'); await sleep(1000); await P.evaluate(() => scrollTo(0, 0)); await sleep(300)
    await P.evaluate(() => scrollBy(0, 600)); await sleep(500); const q1 = await P.evaluate(PIN_STATE, 'qu'); await shot(w, `${size}-s13-${who}-quals-down`, { x: 0, y: 0, w: vp.width, h: 300 })
    await P.evaluate(() => scrollTo(0, 0)); await sleep(500); const q2 = await P.evaluate(PIN_STATE, 'qu')
    notes.push(`Quals down: ${q1.verdict}, back up: ${q2.verdict}`)
  } catch (e) { notes.push('STOPPED: ' + e.stack.split('\n').slice(0, 2).join(' | ')) }
  rec(`13 plain-user round (${who === 'a' ? 'admin' : 'member'})`, size, notes.some(n => /STOPPED/.test(n)) ? 'NOT WALKED' : 'RECORDED', notes.join(' || '), [])
  await w.ctx.close()
}
if (want('s13')) {
  for (const who of ['a', 'u']) {
    await plainRound(who, 'pc', PC, false)
    await plainRound(who, 'ph-chromium', PHONE, true)
  }
}

/* ---- 11b: more painted flicks on a phone (Chromium), each laid out for counting by eye; and Quals sideways first ---- */
if (want('s11b')) {
  for (const which of ['lw', 'qu']) {
    const w = await world({ vp: PHONE, touch: true, who: 'a', dsf: 2, label: 'flick-' + which }); const P = w.page
    if (which === 'lw') await toWar(w); else { await go(P, 'quals'); await sleep(1200) }
    for (let run = 0; run < 4; run++) {
      await P.evaluate(() => scrollTo(0, 0)); await sleep(900)
      const sc = await screencastRun(w, async () => { await P.evaluate(PIN_LOG, which); await finger(w, 760, 260, [45, 30, 60, 38][run], 60, 5); await sleep(900); return summarise(await readLog(P)) })
      const fr = sc.frames.map((d, i) => ({ label: 'f' + i, data: d }))
      const name = await sheetOf(`ph-chromium-s11b-${which}-flick-${run}`, fr.slice(0, 40), { x: 0, y: 40, w: 268, h: 70 }, 1.2)
      rec(`11b painted flick ${which}-${run}`, 'ph-chromium', 'RECORDED', `${sc.frames.length} painted frames (sheet: count a cut or missing dates row by eye); rAF log ${JSON.stringify(sc.r)}`, [name])
    }
    await w.ctx.close()
  }
}
flush()
for (const b of Object.values(browsers)) await b.close()
console.log('ERRORS', ERRORS.length, JSON.stringify(ERRORS.slice(0, 20), null, 1))