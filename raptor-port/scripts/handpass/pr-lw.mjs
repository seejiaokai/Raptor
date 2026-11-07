/* The pictures round, group lw (chat 3, the night of 7–8 Nov 26 — his D1747; the brief
   docs/superpowers/briefs/2026-11-07-pictures-round-brief.md). Three Leave War questions, each pictured on the running app
   and each fix drawn ON it (nodes and styles in the page, nothing saved). Pictures: q-<short>-*.png in HP_SHOTS.
     twobox    [LW-TWO-BOX-LETTERS] — found OVERTAKEN by [LW-CELL-COMBOS] (his D1727, live 6 Nov 26, pull request 650): two
               whole days side by side are turned to read bottom to top. Pictured as it is today only, to show it: a course
               beside a leave (CSE | LL) and a hand-given FO beside a leave of three letters (CCL | FO), made through the
               drag window; the phone at its opening zoom and the desktop, with an enlarged copy of each day.
     morebelow [LW-MORE-BELOW-CUE] — his D1295: the day panel "Away · 19" on Mon 30 Nov says nothing about the rest below.
               19 leaves placed on Mon 30 Nov through the drag window (as his own preview had); the panel today on his
               iPhone's size and a desktop's; drawn: A the bell's own foot ("↓ N more", built as this very cue's model —
               ui/topbits.tsx), B the History bubble's "more" button look; each at the top, part way, after one tap
               (measured) and at the end (gone); then where the same cue would go on the Inputs calendar's day.
     blink     [LW-FROZEN-BAR-GAP] — the frozen dates bar one painted frame late: an in-page frame log (each frame's
               requestAnimationFrame, before its paint) of where the real dates header stands against the top bar and
               whether the frozen copy is there, while the page is scrolled down past it — on a desktop by the mouse
               wheel and by a slow scroll, on a phone by a finger's push (raw touch events: Chrome's synthesized scroll
               gesture moves nothing here, measured 8 Nov 26); and the painted frames themselves (Chrome's screencast),
               saved to PR_SCRATCH. No clock is installed here: a held clock fakes the frame timer. PR_BLINK=phone skips
               the desktop.
     blinksheet  the chosen painted frames laid side by side (PR_DESK=2,3,5 PR_PHONE=4,5,6,7, picked by looking).
   Run from raptor-port/: HP_URL=http://localhost:4291 HP_SHOTS=docs/img/handpass/2026-11-07-pictures-round node scripts/handpass/pr-lw.mjs
        PR_ONLY=morebelow,blink redoes only those. Measures: <HP_SHOTS>/q-lw-measured.json. */
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, SHOTS, login, go } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = SHOTS; mkdirSync(OUT, { recursive: true })
/* working files (the saved world, the raw painted frames) stay out of the pictures folder */
const { tmpdir } = await import('node:os')
const SCRATCH = process.env.PR_SCRATCH || `${tmpdir()}/pr-lw`; mkdirSync(SCRATCH, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const PC = { width: 1536, height: 864 }, PHONE = { width: 402, height: 874 }
const ONLY = process.env.PR_ONLY || ''
const want = q => !ONLY || ONLY.split(',').includes(q)
const made = [], measured = {}
const T = id => `[data-testid="${id}"]`
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

/* the marks: a ring drawn on the element itself (an outline takes no room), and a tag naming the point in its own
   ::after — amber words on the app's dark; `data-zz-at` places it (top / bottom / right / inside-right) */
const MARK_CSS = `
.toast,.snack{display:none!important} *{scroll-behavior:auto!important}
.zz-ring{outline:3px solid #ffb020!important;outline-offset:2px!important}
.zz-ring-in{outline:3px solid #ffb020!important;outline-offset:-3px!important}
[data-zz-tag]::after{content:attr(data-zz-tag);position:absolute;z-index:9999;left:0;top:-25px;background:#0E141B;color:#ffb020;
  border:1.5px solid #ffb020;font:700 12.5px/1.25 -apple-system,system-ui,Segoe UI,sans-serif;letter-spacing:0;text-transform:none;
  padding:2px 6px;border-radius:5px;white-space:nowrap;pointer-events:none;writing-mode:horizontal-tb;transform:none}
[data-zz-at=bottom]::after{top:auto;bottom:-25px}
[data-zz-at=right]::after{left:auto;right:0}
[data-zz-at=inright]::after{left:auto;right:4px;top:50%;transform:translateY(-50%)}
[data-zz-at=inleft]::after{left:4px;top:50%;transform:translateY(-50%)}
[data-zz-at=wrap]::after{white-space:normal;width:max-content;max-width:330px}
`
async function world(vp, touch, { state = null, clock = true, dsf = 2 } = {}) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: dsf, ...(touch ? { isMobile: true, hasTouch: true } : {}), ...(state ? { storageState: state } : {}) })
  if (clock) await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => { errs.push(e.message); console.log('PAGE ERROR', e.message) })
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
  await page.goto(BASE + '/'); await login(page, 'a')
  await page.addStyleTag({ content: MARK_CSS })
  return { ctx, page, errs, touch, vp }
}
const tap = async (w, sel, opts = {}) => {
  const l = w.page.locator(sel).filter({ visible: true }).first()
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (w.touch) await l.tap(opts); else await l.click(opts)
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
/* a tap on a neutral place, so no control keeps a touched or focused look (the method's traps) */
const settle = page => page.evaluate(() => { const a = document.activeElement; if (a && a.blur) a.blur() })
const unmark = page => page.evaluate(() => {
  document.querySelectorAll('.zz-ring,.zz-ring-in').forEach(e => e.classList.remove('zz-ring', 'zz-ring-in'))
  document.querySelectorAll('[data-zz-tag]').forEach(e => { e.removeAttribute('data-zz-tag'); e.removeAttribute('data-zz-at'); if (e.dataset.zzPos) { e.style.position = ''; delete e.dataset.zzPos } })
})
/* ring the n-th VISIBLE match of sel; tag it (the tag needs a positioned box: a static one is made relative, said back) */
const mark = (page, sel, tag = '', at = '', inside = false, n = 0) => page.evaluate(([sel, tag, at, inside, n]) => {
  const els = [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 })
  const e = els[n]; if (!e) throw new Error('mark: nothing at ' + sel)
  e.classList.add(inside ? 'zz-ring-in' : 'zz-ring')
  if (tag) {
    if (getComputedStyle(e).position === 'static') { e.style.position = 'relative'; e.dataset.zzPos = '1' }
    e.setAttribute('data-zz-tag', tag); if (at) e.setAttribute('data-zz-at', at)
  }
  return true
}, [sel, tag, at, inside, n])
const tagOnly = (page, sel, tag, at = '') => page.evaluate(([sel, tag, at]) => {
  const e = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().height > 0); if (!e) throw new Error('tag: nothing at ' + sel)
  if (getComputedStyle(e).position === 'static') { e.style.position = 'relative'; e.dataset.zzPos = '1' }
  e.setAttribute('data-zz-tag', tag); if (at) e.setAttribute('data-zz-at', at)
}, [sel, tag, at])
const boxOf = (page, sel) => page.evaluate(sel => {
  const els = [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 })
  if (!els.length) return null
  const rs = els.map(e => e.getBoundingClientRect())
  return { x: Math.min(...rs.map(r => r.left)), y: Math.min(...rs.map(r => r.top)), r: Math.max(...rs.map(r => r.right)), b: Math.max(...rs.map(r => r.bottom)) }
}, sel)
async function clip(w, name, x, y, wdt, h) {
  const vp = w.vp
  let X = Math.max(0, Math.round(x)), Y = Math.max(0, Math.round(y))
  const W = Math.min(Math.round(wdt), vp.width - X), H = Math.min(Math.round(h), vp.height - Y)
  await w.page.screenshot({ path: `${OUT}/${name}.png`, clip: { x: X, y: Y, width: W, height: H } })
  made.push(name)
}
/* an enlarged copy of a small region, drawn sharp by Chrome itself at `scale` (not a blown-up picture) */
async function enlarged(w, name, x, y, wdt, h, scale = 4) {
  const cdp = await w.ctx.newCDPSession(w.page)
  /* the protocol's clip is in the DOCUMENT's coordinates: add how far the page is scrolled */
  const [sx, sy] = await w.page.evaluate(() => [scrollX, scrollY])
  const r = await cdp.send('Page.captureScreenshot', { format: 'png', clip: { x: Math.max(0, x) + sx, y: Math.max(0, y) + sy, width: wdt, height: h, scale } })
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.data, 'base64')); made.push(name)
  await cdp.detach()
}
const tryQ = async (label, fn) => { try { await fn() } catch (e) { console.log('SKIPPED', label, '—', e.stack.split('\n').slice(0, 3).join(' | ')) } }

/* ================= the set-up: the entries the questions need, made through the drag window ================= */
const PANEL_DAY = '2026-11-30'            // his case: Mon 30 Nov, "AWAY · 19"
const PAIR_DAYS = ['2026-12-01', '2026-12-02']
/* nineteen men, in grid order, in three drags of a column (each drag stays on one screen) */
const PANEL_RUNS = [['dice', 'mamba'], ['nact', 'slash'], ['taipan', 'harpoon']]
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
  /* "below zero — tap the same leave again" */
  if (/^sel-[A-Z]+$/.test(id) && await vis(w.page, T('select-sheet')) && /again/i.test((await txt(w.page, T('select-sheet'))) || '')) { await tap(w, T(id)); await sleep(500) }
}
async function closeSel(w) { if (await vis(w.page, T('select-sheet'))) { await tap(w, T('sel-cancel')); await sleep(300) } }
async function setUp() {
  const w = await world(PC, false, { dsf: 1 })
  await toWar(w)
  await toMonth(w, 'NOV', PANEL_DAY)
  const said = []
  for (const [a, z] of PANEL_RUNS) {
    await dragCells(w, [a, PANEL_DAY], [z, PANEL_DAY])
    said.push(await txt(w.page, T('sel-who')))
    await selPress(w, 'sel-LL'); await closeSel(w)
  }
  // the two-entry days: a course beside a leave (dice), a leave of three letters beside a hand-given FO (shaft)
  await toMonth(w, 'DEC', PAIR_DAYS[0])
  await dragCells(w, ['dice', PAIR_DAYS[0]], ['dice', PAIR_DAYS[1]]); await selPress(w, 'sel-file-CSE'); await closeSel(w)
  await dragCells(w, ['dice', PAIR_DAYS[0]], ['dice', PAIR_DAYS[1]]); await selPress(w, 'sel-LL'); await closeSel(w)
  await dragCells(w, ['shaft', PAIR_DAYS[0]], ['shaft', PAIR_DAYS[1]]); await selPress(w, 'sel-CCL'); await closeSel(w)
  await dragCells(w, ['shaft', PAIR_DAYS[0]], ['shaft', PAIR_DAYS[1]])
  await tap(w, T('sel-oil')); await sleep(300)
  if (await w.page.locator(T('sel-oil-pick-fo')).count()) await tap(w, T('sel-oil-pick-fo'))
  await tap(w, T('sel-oil-give')); await sleep(700); await closeSel(w)
  const cells = await w.page.evaluate(days => Object.fromEntries(['dice', 'shaft'].flatMap(p => days.map(d => [`${p} ${d}`,
    [...(document.querySelector(`[data-testid="cell-${p}-${d}"]`)?.querySelectorAll('.c') || [])].map(c => c.textContent + ':' + [...c.classList].filter(k => /^(left|right|whole|bx-\w+|s-\w)$/.test(k)).join('.')).join(' + ')]))), PAIR_DAYS)
  measured.setup = { drags: said, cells, errs: w.errs.slice(0, 5) }
  console.log('set-up', JSON.stringify(measured.setup))
  await sleep(1200)          // the saves land
  const state = await w.ctx.storageState()
  await w.ctx.close()
  return state
}

/* ================= Q1 — two whole days side by side (overtaken: pictured as it stands) ================= */
async function twobox(state, tag, vp, touch) {
  const w = await world(vp, touch, { state })
  await toWar(w)
  await toMonth(w, 'DEC', PAIR_DAYS[0])
  const P = w.page
  const sel = PAIR_DAYS.flatMap(d => ['dice', 'shaft'].map(p => `[data-testid="cell-${p}-${d}"]`)).join(',')
  await P.locator(T(`cell-dice-${PAIR_DAYS[0]}`)).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(400)
  /* the page may stop short of centring it (the grid's own scroller, the frozen bars): bring the pair to the upper third */
  measured[`twobox-${tag}-scroll`] = await P.evaluate(id => {
    const e = document.querySelector(`[data-testid="${id}"]`); let r = e.getBoundingClientRect()
    const before = { top: Math.round(r.top), sy: Math.round(scrollY), ih: innerHeight }
    if (r.top > innerHeight * .45) { scrollBy(0, r.top - innerHeight * .35); r = e.getBoundingClientRect() }
    let sc = e.parentElement; while (sc && !(sc.scrollHeight > sc.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(sc).overflowY))) sc = sc.parentElement
    if (r.top > innerHeight * .45 && sc) { sc.scrollTop += r.top - innerHeight * .35; r = e.getBoundingClientRect() }
    return { before, after: { top: Math.round(r.top), sy: Math.round(scrollY) }, scroller: sc ? sc.className || sc.tagName : null }
  }, `cell-dice-${PAIR_DAYS[0]}`); await sleep(400)
  console.log('twobox scroll', tag, JSON.stringify(measured[`twobox-${tag}-scroll`]))
  /* each box: its letters inside it along its length (the cell-combos walk's own measure), its size and turn */
  measured[`twobox-${tag}`] = await P.evaluate(sel => [...document.querySelectorAll(sel)].map(td => ({
    cell: td.dataset.testid,
    boxes: [...td.querySelectorAll('.c')].filter(c => c.textContent).map(c => {
      const r = c.getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(c); const t = rg.getBoundingClientRect()
      const turned = getComputedStyle(c).writingMode !== 'horizontal-tb', tol = .75
      return { text: c.textContent, turned, w: +r.width.toFixed(1), h: +r.height.toFixed(1), font: getComputedStyle(c).fontSize,
        inside: turned ? t.top >= r.top - tol && t.bottom <= r.bottom + tol : t.left >= r.left - tol && t.right <= r.right + tol }
    }),
    zoom: getComputedStyle(td.closest('table')).zoom,
  })), sel)
  await settle(P)
  const b = await boxOf(P, sel)
  // the rows' names in the crop too: from the names column's left edge
  const nm = await boxOf(P, '[data-testid="row-dice"], [data-testid="row-shaft"]')
  const x0 = touch ? (nm ? Math.min(nm.x, b.x) - 4 : b.x - 160) : b.x - 300
  await mark(P, `[data-testid="cell-dice-${PAIR_DAYS[0]}"]`, 'Today: both whole, turned', '', true)
  await mark(P, `[data-testid="cell-shaft-${PAIR_DAYS[1]}"]`, '', '', true)
  await clip(w, `q-twobox-${tag}-today`, x0, b.y - 60, touch ? b.r - x0 + 120 : b.r - x0 + 300, b.b - b.y + 110)
  await unmark(P)
  await enlarged(w, `q-twobox-${tag}-today-x4`, b.x - 4, b.y - 4, b.r - b.x + 8, b.b - b.y + 8, tag === 'ph' ? 5 : 4)
  await w.ctx.close()
}

/* ================= Q2 — the day panel says when more is below ================= */
/* A: the bell's own foot, copied whole (02-shell.css .bl-foot / .bl-more: a hairline over it, "↓ N more" 12px in the
   third ink, at the left), outside the list that scrolls, so it covers no line. B: the History bubble's "more" button
   (10-board-history.css .hb-more: the second panel colour, a hairline border, the accent's words, 10.5px bold), across the
   foot. Each counts the lines not wholly in view below — the bell's own rule, so it goes exactly at the list's end. */
const CUE_CSS = `
.zz-cue{flex:none;display:flex;align-items:center;justify-content:flex-end;gap:10px;margin:0 12px;padding:6px 7px 6px;border-top:1px solid var(--edge);cursor:pointer;background:var(--panel)}
.zz-cue .zz-more{margin-right:auto;padding-left:4px;font-size:12px;color:var(--ink-3);white-space:nowrap}
.zz-cueb{flex:none;margin:4px 12px 10px;width:auto;display:block;background:var(--panel-2);border:1px solid var(--edge);border-radius:7px;
  color:var(--accent);font:inherit;font-size:10.5px;font-weight:700;padding:7px 8px;cursor:pointer;text-align:center}
.zz-cue[hidden],.zz-cueb[hidden]{display:none}
`
/* draw the cue into the open window `win` whose list scrolls in `.win-body`, its lines `lineSel`; kept up to date on scroll */
const drawCue = (page, win, lineSel, look) => page.evaluate(([win, lineSel, look]) => {
  const wn = [...document.querySelectorAll(win)].find(e => e.getBoundingClientRect().height); if (!wn) throw new Error('no window ' + win)
  wn.querySelectorAll('.zz-cue,.zz-cueb').forEach(e => e.remove())
  const body = wn.querySelector('.win-body')
  const cue = document.createElement(look === 'A' ? 'div' : 'button')
  cue.className = look === 'A' ? 'zz-cue' : 'zz-cueb'
  cue.setAttribute('role', 'button'); cue.setAttribute('data-zz-new', 'the cue (drawn)')
  if (look === 'A') cue.innerHTML = '<span class="zz-more"></span>'
  body.after(cue)
  const count = () => {
    const bottom = body.getBoundingClientRect().bottom + 1
    let n = 0
    for (const l of body.querySelectorAll(lineSel)) if (l.getBoundingClientRect().bottom > bottom) n++
    const words = `↓ ${n} more`
    if (look === 'A') cue.querySelector('.zz-more').textContent = words; else cue.textContent = words
    cue.hidden = n === 0
    return n
  }
  /* a tap scrolls the list down by what is in view, less one line, so the last line seen stays in sight */
  cue.addEventListener('click', () => { body.scrollBy({ top: body.clientHeight - 30 }); setTimeout(count, 30) })
  body.addEventListener('scroll', count)
  window.__zzCount = count
  return count()
}, [win, lineSel, look])
const panelFacts = (page, win, lineSel) => page.evaluate(([win, lineSel]) => {
  const wn = [...document.querySelectorAll(win)].find(e => e.getBoundingClientRect().height); if (!wn) return null
  const body = wn.querySelector('.win-body'), br = body.getBoundingClientRect(), lines = [...body.querySelectorAll(lineSel)]
  const whole = lines.filter(l => { const r = l.getBoundingClientRect(); return r.top >= br.top - .5 && r.bottom <= br.bottom + 1 }).length
  const partly = lines.filter(l => { const r = l.getBoundingClientRect(); return r.bottom > br.bottom + 1 && r.top < br.bottom }).length
  const below = lines.filter(l => l.getBoundingClientRect().top >= br.bottom).length
  const wr = wn.getBoundingClientRect()
  return { title: wn.querySelector('.win-ttl')?.textContent, lines: lines.length, wholeInView: whole, cutAtFoot: partly, whollyBelow: below,
    winTop: Math.round(wr.top), winH: Math.round(wr.height), bodyH: Math.round(body.clientHeight), bodyScrollH: body.scrollHeight, scrollTop: Math.round(body.scrollTop),
    head: wn.querySelector('[data-testid="lwday-away-h"], [data-testid="idy-count"]')?.textContent || null }
}, [win, lineSel])
const scrollBody = (page, win, to) => page.evaluate(([win, to]) => {
  const wn = [...document.querySelectorAll(win)].find(e => e.getBoundingClientRect().height); const b = wn.querySelector('.win-body')
  b.scrollTop = to === 'end' ? b.scrollHeight : to; return Math.round(b.scrollTop)
}, [win, to])

async function morebelow(state, tag, vp, touch) {
  const w = await world(vp, touch, { state })
  const P = w.page
  await P.addStyleTag({ content: CUE_CSS })
  await toWar(w)
  await toMonth(w, 'NOV', PANEL_DAY)
  await P.locator(T('head-' + PANEL_DAY)).first().evaluate(e => e.scrollIntoView({ block: 'nearest', inline: 'center' })); await sleep(300)
  await tap(w, T('head-' + PANEL_DAY)); await sleep(700)
  if (!(await vis(P, T('win-lwday')))) throw new Error('the day panel did not open')
  const WIN = '.floatwin.lwday', LINE = '.lwday-away .ll-row'
  await settle(P)
  const today = await panelFacts(P, WIN, LINE)
  measured[`morebelow-${tag}-today`] = today
  console.log('panel', tag, JSON.stringify(today))
  const wb = await boxOf(P, WIN)
  const frame = async name => { await clip(w, name, 0, Math.max(0, wb.y - (touch ? 64 : 40)), vp.width, (wb.b - wb.y) + (touch ? 64 : 80)) }
  const frameD = async name => { await clip(w, name, wb.x - 30, wb.y - 40, wb.r - wb.x + 60, wb.b - wb.y + 80) }
  const shoot = touch ? frame : frameD
  // today: the window ringed, the point named on its "Away" heading
  await mark(P, WIN)
  const n0 = today.lines - today.wholeInView
  await tagOnly(P, '[data-testid="lwday-away-h"]', today.cutAtFoot + today.whollyBelow > 0 ? `${today.wholeInView} of ${today.lines} in view, no sign of ${n0} more` : `all ${today.lines} in view`, 'inright')
  await shoot(`q-morebelow-${tag}-today`); await unmark(P)
  if (today.cutAtFoot + today.whollyBelow === 0) { console.log('morebelow', tag, ': the whole list fits — no cue would show'); await w.ctx.close(); return }
  // today, at the list's end — what he sees once he scrolls: the same, with no sign before
  await scrollBody(P, WIN, 'end'); await settle(P)
  await mark(P, WIN); await tagOnly(P, `${WIN} .win-bar`, 'Today, at the end: found only by scrolling', 'bottom')
  await shoot(`q-morebelow-${tag}-today-end`); await unmark(P)
  // A and B: at the top, after one tap on the cue, and at the end
  for (const look of ['A', 'B']) {
    await scrollBody(P, WIN, 0)
    const n = await drawCue(P, WIN, LINE, look); await sleep(150); await settle(P)
    const sel = look === 'A' ? '.zz-cue' : '.zz-cueb'
    const atTop = await panelFacts(P, WIN, LINE)
    const name = look === 'A' ? 'the bell’s own foot' : 'History’s “more” button'
    measured[`morebelow-${tag}-${look}-top`] = { ...atTop, cue: await txt(P, sel) }
    await mark(P, sel, '', '', look === 'A'); await tagOnly(P, '[data-testid="lwday-away-h"]', `Drawn ${look}: ${name}`, 'inright')
    await shoot(`q-morebelow-${tag}-${look}-top`); await unmark(P)
    // part way: the list moved up by a finger's short push (about three lines)
    await scrollBody(P, WIN, 3 * 30); await sleep(100); await P.evaluate(() => window.__zzCount && window.__zzCount()); await settle(P)
    measured[`morebelow-${tag}-${look}-mid`] = { ...(await panelFacts(P, WIN, LINE)), cue: await txt(P, sel) }
    if (await vis(P, sel)) { await mark(P, sel, '', '', look === 'A'); await tagOnly(P, `${WIN} .win-bar`, `Drawn ${look}: part way down, “${await txt(P, sel)}”`, 'bottom'); await shoot(`q-morebelow-${tag}-${look}-mid`); await unmark(P) }
    // one tap on the cue, from the top
    await scrollBody(P, WIN, 0); await sleep(100); await P.evaluate(() => window.__zzCount && window.__zzCount())
    await tap(w, sel); await sleep(300); await P.evaluate(() => window.__zzCount && window.__zzCount()); await settle(P)
    measured[`morebelow-${tag}-${look}-tapped`] = { ...(await panelFacts(P, WIN, LINE)), cueShown: await vis(P, sel), cue: await txt(P, sel) }
    // the end: gone
    await scrollBody(P, WIN, 'end'); await sleep(100); await P.evaluate(() => window.__zzCount && window.__zzCount()); await settle(P)
    measured[`morebelow-${tag}-${look}-end`] = { ...(await panelFacts(P, WIN, LINE)), cueShown: await vis(P, sel) }
    await mark(P, WIN); await tagOnly(P, `${WIN} .win-bar`, `Drawn ${look}: at the list’s end the cue is gone`, 'bottom')
    await shoot(`q-morebelow-${tag}-${look}-end`); await unmark(P)
    await P.evaluate(() => document.querySelectorAll('.zz-cue,.zz-cueb').forEach(e => e.remove()))
    console.log('cue', tag, look, n)
  }
  await w.ctx.close()
}

/* the existing model: the bell's own "↓ N more" (built 27 Oct 26 as the copy of this very cue), as it is today */
async function bell(state, tag, vp, touch) {
  const w = await world(vp, touch, { state })
  const P = w.page
  const btn = touch ? '#bellBtnM, .bellbtn' : '.bellbtn'
  await tap(w, btn); await sleep(500)
  if (!(await vis(P, T('bell-list')))) { console.log('bell: the list did not open'); await w.ctx.close(); return }
  const more = await txt(P, T('bell-more'))
  measured[`bell-${tag}`] = { more, lines: await P.locator('.bell-list .bl-line').count() }
  if (more) {
    await settle(P); await mark(P, T('bell-more'), 'Built: the bell’s “more” cue', '', false)
    const b = await boxOf(P, T('bell-list'))
    await clip(w, `q-morebelow-${tag}-bell`, b.x - 12, b.y - 30, b.r - b.x + 24, b.b - b.y + 42)
  } else console.log('bell', tag, ': no "more" cue in view (the list fits)')
  await w.ctx.close()
}

/* lesson 46's other windows: where the same cue would go — the Inputs calendar's day (the same 30 Nov: the 19 leaves
   are its inputs too, an absence being one record), on a phone, at its open (tall) height and at its lower rest */
async function others(state, tag, vp, touch) {
  const w = await world(vp, touch, { state })
  const P = w.page
  await P.addStyleTag({ content: CUE_CSS })
  await go(P, 'inputs'); await sleep(900)
  await P.waitForSelector('#inpCal .ic-mon')
  const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  for (let i = 0; i < 24; i++) {
    const [name, year] = (await P.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = 2026 * 12 + 10 - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) break
    await tap(w, d > 0 ? '#icNext' : '#icPrev'); await sleep(150)
  }
  const ISO = PANEL_DAY
  const c = P.locator(`#inpCal [data-icday="${ISO}"]`).first(); await c.scrollIntoViewIfNeeded()
  if (touch) await c.tap({ position: { x: 8, y: 8 } }); else await c.click({ position: { x: 8, y: 8 } })
  await sleep(900)
  const WIN = '.floatwin.inputsday', LINE = '.sd-list .icard'
  if (!(await vis(P, T('win-inputsday')))) throw new Error('the Inputs day did not open')
  await settle(P)
  const f0 = await panelFacts(P, WIN, LINE)
  measured[`others-${tag}-inputsday`] = f0
  console.log('inputs day', JSON.stringify(f0))
  if (f0 && f0.cutAtFoot + f0.whollyBelow > 0) {
    const wb0 = await boxOf(P, WIN)
    await mark(P, WIN); await tagOnly(P, `${WIN} .win-bar`, `Today: ${f0.wholeInView} of ${f0.lines} cards in view, nothing says more are below`, 'bottom')
    await clip(w, `q-morebelow-${tag}-inputsday-today`, 0, wb0.y - 10, vp.width, wb0.b - wb0.y + 10); await unmark(P)
    await drawCue(P, WIN, LINE, 'A'); await sleep(150); await settle(P)
    measured[`others-${tag}-inputsday-cue`] = await txt(P, '.zz-cue')
    await mark(P, '.zz-cue', '', '', true)
    await tagOnly(P, `${WIN} .win-bar`, `Drawn A: the same cue, “${await txt(P, '.zz-cue')}”`, 'bottom')
    const wb = await boxOf(P, WIN)
    await clip(w, `q-morebelow-${tag}-inputsday-A`, 0, wb.y - 10, vp.width, wb.b - wb.y + 10)
    await unmark(P)
  } else console.log('inputs day: the list fits — no cue would show')
  await w.ctx.close()
}

/* ================= Q3 — the frozen dates bar, one painted frame late ================= */
/* each frame, just before it is painted (a requestAnimationFrame runs after the frame's scroll events and before its
   paint): the page's scroll, where the real dates header stands against the top bar's foot, and whether the frozen copy
   is drawn. A frame whose header has begun to pass under the bar while no frozen copy is drawn paints the header cut, or,
   once it is wholly under, paints none. */
const FRAME_LOG = () => {
  window.__fr = []; window.__frOn = true
  const tick = t => {
    const tb = document.querySelector('.topbar')?.getBoundingClientRect().bottom ?? 0
    const head = [...document.querySelectorAll('#page-leavewar tbody.mxhead')].find(h => !h.closest('.mxfixed'))
    const hr = head ? head.getBoundingClientRect() : null
    const sh = document.querySelector('[data-testid="sticky-head"]')
    const shr = sh ? sh.getBoundingClientRect() : null
    window.__fr.push({ t: +t.toFixed(1), y: Math.round(scrollY), headTop: hr && +hr.top.toFixed(1), headBot: hr && +hr.bottom.toFixed(1), tb: +tb.toFixed(1), frozen: !!(shr && shr.height > 0) })
    if (window.__frOn) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
const readLog = page => page.evaluate(() => { window.__frOn = false; return window.__fr })
/* a frame's verdict: the header in view (not yet under the bar), the frozen copy shown, or the gap — cut (part of the real
   header still shows under the bar, its top rows gone) or none (wholly under the bar, nothing in its place) */
const judge = f => f.headTop >= f.tb - .5 ? 'header' : f.frozen ? 'frozen' : f.headBot > f.tb + .5 ? `CUT (${Math.round(f.headBot - f.tb)}px of ${Math.round(f.headBot - f.headTop)} left)` : 'NONE'
function summarise(log) {
  const v = log.map(f => ({ ...f, v: judge(f) }))
  const gap = v.filter(f => /CUT|NONE/.test(f.v))
  const first = v.findIndex(f => f.v !== 'header')
  const span = first < 0 ? [] : v.slice(Math.max(0, first - 2), first + 4).map(f => `${f.t} y=${f.y} ${f.v}`)
  const dts = v.slice(1).map((f, i) => f.t - v[i].t).sort((a, b) => a - b)
  return { frames: v.length, gapFrames: gap.length, gaps: gap.map(f => f.v), around: span, frameMs: dts.length ? +dts[Math.floor(dts.length / 2)].toFixed(1) : null }
}
async function blinkDesk() {
  const w = await world(PC, false, { clock: false, dsf: 1 })
  const P = w.page
  await toWar(w)
  await P.evaluate(() => window.scrollTo(0, 0)); await sleep(500)
  const headH = await P.evaluate(() => { const h = [...document.querySelectorAll('#page-leavewar tbody.mxhead')].find(h => !h.closest('.mxfixed')); const r = h.getBoundingClientRect(); return { top: Math.round(r.top), h: Math.round(r.height), tb: Math.round(document.querySelector('.topbar').getBoundingClientRect().bottom) } })
  measured['blink-desk-header'] = headH
  const runs = {}
  // 1. the mouse wheel, one notch at a time (a desktop's ordinary scroll), the pointer over the grid
  for (let k = 0; k < 3; k++) {
    await P.evaluate(() => window.scrollTo(0, 0)); await sleep(600)
    await P.mouse.move(700, 600)
    await P.evaluate(FRAME_LOG)
    for (let i = 0; i < 8; i++) { await P.mouse.wheel(0, 100); await sleep(60) }
    await sleep(400)
    runs[`wheel-${k}`] = summarise(await readLog(P))
  }
  // 2. a slow scroll, a few pixels a frame, as a trackpad's gentle drag
  for (let k = 0; k < 2; k++) {
    await P.evaluate(() => window.scrollTo(0, 0)); await sleep(600)
    await P.evaluate(FRAME_LOG)
    await P.evaluate(() => new Promise(res => { let n = 0; const step = () => { window.scrollBy(0, 6); if (++n < 90) requestAnimationFrame(step); else res() }; requestAnimationFrame(step) }))
    await sleep(300)
    runs[`slow-${k}`] = summarise(await readLog(P))
  }
  measured['blink-desk'] = runs
  console.log('blink desk', JSON.stringify(runs, null, 1))
  // 3. the painted frames themselves (Chrome's screencast), one wheel notch past the header
  await P.evaluate(() => window.scrollTo(0, 0)); await sleep(800)
  const cdp = await w.ctx.newCDPSession(P)
  const frames = []
  cdp.on('Page.screencastFrame', async f => { frames.push({ data: f.data, ts: f.metadata.timestamp }); try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }) } catch {} })
  await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1, maxWidth: PC.width, maxHeight: PC.height })
  await sleep(500)
  await P.evaluate(FRAME_LOG)
  await P.mouse.move(700, 600)
  for (let i = 0; i < 3; i++) { await P.mouse.wheel(0, 100); await sleep(90) }
  await sleep(600)
  await cdp.send('Page.stopScreencast')
  const log = summarise(await readLog(P))
  measured['blink-desk-screencast-log'] = log
  const dir = `${SCRATCH}/frames-desk`; mkdirSync(dir, { recursive: true })
  frames.forEach((f, i) => writeFileSync(`${dir}/f${String(i).padStart(3, '0')}.png`, Buffer.from(f.data, 'base64')))
  measured['blink-desk-screencast-frames'] = frames.length
  console.log('screencast frames', frames.length, JSON.stringify(log))
  await w.ctx.close()
  return { frames, headH }
}
async function blinkPhone() {
  const w = await world(PHONE, true, { clock: false, dsf: 2 })
  const P = w.page
  await toWar(w)
  await P.evaluate(() => window.scrollTo(0, 0)); await sleep(500)
  const cdp = await w.ctx.newCDPSession(P)
  const runs = {}
  /* a finger on the names column (the grid's own sideways scroll is not started), pushed up 500px in steps of `px`
     every frame, then lifted. Raw touch events: Chrome's synthesized scroll gesture does not scroll this page headless
     (measured 8 Nov 26: 0px moved), while a finger's own touches do. */
  for (const [k, px] of [['finger-slow', 6], ['finger', 20], ['finger-fast', 45]]) {
    for (let rep = 0; rep < 2; rep++) {
      await P.evaluate(() => window.scrollTo(0, 0)); await sleep(700)
      await P.evaluate(FRAME_LOG)
      let y = 760
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 60, y }] })
      while (y > 260) { y -= px; await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 60, y }] }); await sleep(16) }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
      await sleep(1200)
      const log = await readLog(P)
      runs[`${k}-${rep}`] = { ...summarise(log), movedTo: log.length ? log[log.length - 1].y : null }
    }
  }
  measured['blink-phone'] = runs
  console.log('blink phone', JSON.stringify(runs, null, 1))
  // the painted frames of one quick push, as on the desktop
  await P.evaluate(() => window.scrollTo(0, 0)); await sleep(800)
  const frames = []
  cdp.on('Page.screencastFrame', async f => { frames.push(f.data); try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }) } catch {} })
  await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1, maxWidth: PHONE.width * 2, maxHeight: PHONE.height * 2 })
  await sleep(500)
  await P.evaluate(FRAME_LOG)
  let y = 760
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 60, y }] })
  while (y > 260) { y -= 45; await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 60, y }] }); await sleep(16) }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await sleep(1000)
  await cdp.send('Page.stopScreencast')
  measured['blink-phone-screencast-log'] = summarise(await readLog(P))
  const dir = `${SCRATCH}/frames-phone`; mkdirSync(dir, { recursive: true })
  frames.forEach((d, i) => writeFileSync(`${dir}/f${String(i).padStart(3, '0')}.png`, Buffer.from(d, 'base64')))
  console.log('phone screencast frames', frames.length, JSON.stringify(measured['blink-phone-screencast-log']))
  await w.ctx.close()
}
/* lay the chosen painted frames side by side on one sheet, each named, cut to the band under the top bar */
async function sheet(name, items, band) {
  const ctx = await browser.newContext({ viewport: { width: 1000, height: 400 }, deviceScaleFactor: 2 })
  const p = await ctx.newPage()
  const html = `<html><body style="margin:0;background:#0b0f14;color:#e8edf2;font:600 15px system-ui">${items.map(it => `
    <div style="padding:8px 10px 2px;color:${it.bad ? '#ffb020' : '#e8edf2'}">${it.label}</div>
    <div style="margin:0 10px 6px;border:${it.bad ? '3px solid #ffb020' : '1px solid #2a323b'};width:${band.w}px;height:${band.h}px;overflow:hidden;position:relative">
      <img src="data:image/png;base64,${it.data}" style="position:absolute;left:${-band.x}px;top:${-band.y}px"></div>`).join('')}</body></html>`
  await p.setContent(html); await sleep(300)
  const h = await p.evaluate(() => document.body.scrollHeight)
  await p.setViewportSize({ width: band.w + 26, height: h })
  await p.screenshot({ path: `${OUT}/${name}.png`, fullPage: true }); made.push(name)
  await ctx.close()
}

/* ================= run ================= */
let STATE = null
const needState = want('twobox') || want('morebelow')
if (needState) { STATE = await setUp(); writeFileSync(`${SCRATCH}/lw-state.json`, JSON.stringify(STATE)) }
if (want('twobox')) {
  await tryQ('twobox ph', () => twobox(STATE, 'ph', PHONE, true))
  await tryQ('twobox pc', () => twobox(STATE, 'pc', PC, false))
}
if (want('morebelow')) {
  await tryQ('morebelow ph', () => morebelow(STATE, 'ph', PHONE, true))
  await tryQ('morebelow pc', () => morebelow(STATE, 'pc', PC, false))
  await tryQ('bell ph', () => bell(STATE, 'ph', PHONE, true))
  await tryQ('others ph', () => others(STATE, 'ph', PHONE, true))
}
if (want('blink')) {
  if (process.env.PR_BLINK !== 'phone') await tryQ('blink desk', async () => {
    const { frames } = await blinkDesk()
    writeFileSync(`${SCRATCH}/frames-desk/_count.txt`, String(frames.length))
  })
  await tryQ('blink phone', () => blinkPhone())
}
/* the frames sheets: PR_ONLY=blinksheet PR_DESK=2,3,5 PR_PHONE=4,5,6,7 — the frames chosen by looking at them (8 Nov 26:
   the desktop's frame 3 and the phone's 5 and 6 are the ones with the header cut or gone) */
if (want('blinksheet')) {
  const pick = (dir, list) => list.split(',').map(n => readFileSync(`${SCRATCH}/${dir}/f${n.padStart(3, '0')}.png`).toString('base64'))
  if (process.env.PR_DESK) {
    const d = pick('frames-desk', process.env.PR_DESK)
    await sheet('q-blink-desk-today', [
      { data: d[0], label: 'Desktop today, frame 1: the dates header in its place' },
      { data: d[1], label: 'Frame 2, 1/60 s later: the header half under the top bar, its weekday names gone, no frozen bar yet', bad: true },
      { data: d[2], label: 'Frame 3: the frozen dates bar drawn, whole' },
    ], { x: 0, y: 0, w: 760, h: 200 })
  }
  if (process.env.PR_PHONE) {
    const d = pick('frames-phone', process.env.PR_PHONE)
    await sheet('q-blink-phone-today', [
      { data: d[0], label: 'iPhone size today, frame 1: the dates header just under the top bar' },
      { data: d[1], label: 'Frame 2: the header cut, no frozen bar yet', bad: true },
      { data: d[2], label: 'Frame 3: no dates header at all', bad: true },
      { data: d[3], label: 'Frame 4: the frozen dates bar drawn' },
    ], { x: 0, y: 0, w: 402, h: 130 })
  }
}
/* a run of some questions keeps the others' measures: merged into what the last runs wrote */
const MJ = `${OUT}/q-lw-measured.json`
const prev = existsSync(MJ) ? JSON.parse(readFileSync(MJ, 'utf8')) : { made: [], measured: {} }
writeFileSync(MJ, JSON.stringify({ made: [...new Set([...(prev.made || []), ...made])], measured: { ...(prev.measured || {}), ...measured } }, null, 1))
console.log('made', made.length, made.join(' '))
await browser.close()
