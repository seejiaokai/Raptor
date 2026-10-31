// [LW-PINCH-IN-CORNER] and [QUALS-PINCH-MID] — the walk of 31 Oct 26 (`claude/pinch-fixes-1031`, evidence
// docs/handpass/2026-10-31-pinch-fixes.md). Two fingers pinch the Leave War grid and Quals on a phone (402 × 874 at 3x, his
// iPhone's size), at the top of the page, part-way down and with the heading row frozen under the top bar, in and out, the
// fingers drifting down as a person's do. With the fingers still DOWN each scenario reads what is drawn on top and takes a
// picture; then it lifts, reads again and takes another. Every check is written as the RIGHT behaviour (a PASS is correct),
// so the same script run on origin/main's build is the "before" (the faults red) and on this branch's build the "after".
//   node scripts/handpass/pinch1031-walk.mjs <dist> <out-dir> [lw|quals]
//   ENGINE=webkit node … — Safari's engine; it takes no touch input from outside the page, so the same touches are made
//   inside the page (lw-pz-repro.mjs's way): it shows what WebKit DRAWS mid-pinch, not how an iPhone delivers the fingers.
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { serveDist, LAUNCH } from '../drawcheck/lib.mjs'
const require = createRequire(import.meta.url)
const { chromium, webkit } = require('@playwright/test')
const [, , DIST = 'dist', OUT0 = 'C:/pinch1031', ONLY] = process.argv
const ENGINE = process.env.ENGINE === 'webkit' ? 'webkit' : 'chromium'
const OUT = join(OUT0, ENGINE)
mkdirSync(OUT, { recursive: true })
console.log(`pinch1031-walk v4 — ${ENGINE}, ${DIST}`)
const sleep = ms => new Promise(r => setTimeout(r, ms))
const ORIGIN = 'http://localhost:4196'
const results = []
const check = (id, what, ok, detail) => { results.push({ id, what, ok: !!ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id} ${what}${ok ? '' : ' — ' + JSON.stringify(detail)}`) }

const browser = ENGINE === 'webkit' ? await webkit.launch() : await chromium.launch(LAUNCH)
async function fresh(pageName) {
  const ctx = await browser.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true, isMobile: ENGINE === 'chromium', timezoneId: 'Asia/Singapore' })
  await serveDist(ctx, ORIGIN, DIST)
  const p = await ctx.newPage()
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
  await p.goto(ORIGIN + '/')
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { timeout: 20000 })
  await p.addStyleTag({ content: '#toastEl{visibility:hidden!important}' })
  await p.evaluate(x => window.go(x), pageName); await p.waitForFunction(x => window.CURPAGE === x, pageName); await sleep(900)
  const cdp = ENGINE === 'chromium' ? await ctx.newCDPSession(p) : null
  /* Chromium: real fingers over CDP. WebKit: the same touches made inside the page, on the element under each finger, as
     Safari targets them (lw-pz-repro.mjs) */
  const touch = (type, pts) => cdp
    ? cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x: Math.round(x), y: Math.round(y), id: i + 1 })) })
    : p.evaluate(([type, pts]) => {
        const w = window; w.__tt = w.__tt || {}
        const ev = { touchStart: 'touchstart', touchMove: 'touchmove', touchEnd: 'touchend' }[type]
        if (type === 'touchStart') pts.forEach(([x, y], i) => { if (!w.__tt[i + 1]) w.__tt[i + 1] = document.elementFromPoint(x, y) || document.body })
        const mk = (id, x, y) => ({ identifier: id, target: w.__tt[id], clientX: x, clientY: y, pageX: x + scrollX, pageY: y + scrollY, screenX: x, screenY: y })
        const fire = (tgt, touches, changed) => {
          const e = new Event(ev, { bubbles: true, cancelable: true })
          const list = a => Object.assign([...a], { item: i => a[i] })
          Object.defineProperty(e, 'touches', { value: list(touches) })
          Object.defineProperty(e, 'targetTouches', { value: list(touches) })
          Object.defineProperty(e, 'changedTouches', { value: list(changed) })
          tgt.dispatchEvent(e)
        }
        if (type === 'touchEnd') { fire(w.__tt[1], [], Object.keys(w.__tt).map(Number).map(id => mk(id, 0, 0))); w.__tt = {}; return }
        const now = pts.map(([x, y], i) => mk(i + 1, x, y))
        fire(w.__tt[now.length] || w.__tt[1], now, type === 'touchStart' ? [now[now.length - 1]] : now)
      }, [type, pts])
  /** two fingers about (cx, cy), d0 → d1 apart, drifting down; `mid` read with them down, `after` once lifted. With
   *  `turn`, the fingers go out to d1 and come back to d0 before the lift, level (the code read's finding 1, fix round 2) */
  const pinch = async (name, cx, cy, d0, d1, mid, after, turn = false) => {
    const at = turn
      ? i => { const d = i <= 10 ? d0 + (d1 - d0) * i / 10 : d1 + (d0 - d1) * (i - 10) / 10; return [[cx - d / 2, cy], [cx + d / 2, cy]] }
      : i => { const d = d0 + (d1 - d0) * i / 10, dy = i * 3; return [[cx - d / 2, cy + dy], [cx + d / 2, cy + dy * 1.3]] }
    await touch('touchStart', [at(0)[0]]); await sleep(30)
    await touch('touchStart', at(0)); await sleep(30)
    for (let i = 1; i <= (turn ? 20 : 10); i++) { await touch('touchMove', at(i)); await sleep(turn ? 30 : 20) }
    await sleep(120)
    const m = await mid(cy + 30)
    await p.screenshot({ path: join(OUT, `${name}-mid.png`) })
    await touch('touchEnd', []); await sleep(700)
    const a = await after(cy + 30)
    await p.screenshot({ path: join(OUT, `${name}-lift.png`) })
    return { m, a }
  }
  return { ctx, p, errs, pinch }
}
const done = async (id, s) => { check(id, 'no page errors', s.errs.length === 0, s.errs); await s.ctx.close() }

/* ---------------------------------------------------------------- the Leave War grid */
/* what is drawn on top over the date row's corner and LVE heading (the grid's own, when in sight) and over the frozen
   copy's corner (when the dates are frozen under the top bar): never the names' frozen copy — and the names, the corner
   and the frozen corner at the grid's left edge. The names copy takes no taps at rest; it is made to for the read only. */
/* …and, read from the other side (fix round 1, 31 Oct 26 — the first walk passed L2 and L7 while their pictures showed the
   names column blank mid-pinch: this read only asked that nothing of the names was drawn where it must not be): every
   point down the names column from the date row's foot to the fingers is a name, a group heading or another pinned row's
   name cell — never a day cell showing through. The frozen date row's own box, see-through below its shrunken row while
   pinching, is looked through. */
const lwRead = yTo => {
  const q = s => document.querySelector(s)
  const wrap = q('#page-leavewar .mx-wrap').getBoundingClientRect()
  const corner = q('#page-leavewar .mx-wrap > table.mx > tbody.mxhead th.who').getBoundingClientRect()
  const lve = q('#page-leavewar .mx-wrap > table.mx > tbody.mxhead th.bal').getBoundingClientRect()
  const band = q('#page-leavewar [data-testid="frozen-cols"]')
  /* a frozen row kept but hidden while the fingers are down (fix round 3) counts as absent */
  const sticky0 = q('#page-leavewar [data-testid="sticky-head"]')
  const sticky = sticky0 && getComputedStyle(sticky0).visibility !== 'hidden' ? sticky0 : null
  const frozenCorner = sticky?.querySelector('.mxfixed-frozen')?.getBoundingClientRect() ?? null
  const bar = q('.topbar')?.getBoundingClientRect().bottom ?? 0
  const was = band ? band.style.pointerEvents : ''
  if (band) band.style.pointerEvents = 'auto'
  const over = []
  /* not the frozen copy's corner: while the fingers are down its contents grow past its own box (overflow-y visible), and
     Chrome's hit test stops at that box — the points below it answered "names" though the picture shows the frozen row
     whole on top (the script's first run, 31 Oct 26). The frozen row stands above the names by its stacking (z 55 over 4);
     the pictures judge it. */
  for (const r of [corner, lve]) {
    const x = r.left + Math.min(r.width / 2, 30)
    for (let y = Math.max(Math.ceil(r.top) + 1, Math.ceil(bar) + 1); y < Math.min(r.bottom - 1, innerHeight); y += 3) {
      if (document.elementFromPoint(x, y)?.closest('[data-testid="frozen-cols"]')) over.push(Math.round(y))
    }
  }
  const footY = Math.max(Math.ceil((frozenCorner ?? corner).bottom) + 6, Math.ceil(bar) + 6)
  const blank = []
  for (let y = footY; y < Math.min(yTo ?? 0, innerHeight - 4); y += 6) {
    let hit = null
    for (const el of document.elementsFromPoint(wrap.left + 15, y)) { if (el.closest('[data-testid="sticky-head"]') && !el.closest('th')) continue; hit = el; break }
    if (!hit?.closest('[data-testid="frozen-cols"], td.who, td.grphd, td.catsub-in, [data-testid="sticky-head"] th')) blank.push(`${y} ${hit ? hit.tagName.toLowerCase() + '.' + String(hit.className).split(' ')[0] : 'nothing'}`)
  }
  if (band) band.style.pointerEvents = was
  /* the frozen date row over its columns — each date heading of the frozen copy in sight against the grid's own, left and
     width (fix round 2: a pinch that turns pinned the copy anew over the stretched grid, measured off stretched cells) */
  const realTh = [...document.querySelectorAll('#page-leavewar .mx-wrap > table.mx > tbody.mxhead th')].map(t => t.getBoundingClientRect())
  const lineOff = []
  if (sticky) [...sticky.querySelectorAll('.mxfixed-scroll tbody.mxhead th')].forEach((r0, i) => {
    const r = r0.getBoundingClientRect(), q = realTh[i]
    if (i < 2 || !q || q.width < 2 || r.right < 0 || r.left > innerWidth) return
    if (Math.abs(r.left - q.left) > 3 || Math.abs(r.width - q.width) > 2) lineOff.push(`${i}: ${Math.round(r.left)}/${Math.round(r.width)} over ${Math.round(q.left)}/${Math.round(q.width)}`)
  })
  const bandR = band && getComputedStyle(band).visibility !== 'hidden' ? band.getBoundingClientRect() : null
  return {
    over, blank, lineOff: lineOff.slice(0, 6), stuck: !!sticky,
    /* (fix round 3) a date row IS drawn under the top bar — the frozen row shown, or the grid's own in sight below the bar —
       and never both */
    dateRow: !!sticky || corner.top >= bar - 1, twoRows: !!sticky && corner.top > bar + 2 && corner.top < innerHeight, inSight: corner.bottom > bar && corner.top < innerHeight,
    cornerT: Math.round(corner.top), cornerB: Math.round(corner.bottom), bandT: bandR ? Math.round(bandR.top) : null,
    cornerOff: Math.round((corner.left - wrap.left) * 10) / 10, bandOff: bandR ? Math.round((bandR.left - wrap.left) * 10) / 10 : null,
    frozenOff: frozenCorner ? Math.round((frozenCorner.left - wrap.left) * 10) / 10 : null,
    zoom: parseFloat(q('#page-leavewar .mx-wrap > table.mx').style.zoom || '1'),
    transformed: !!q('#page-leavewar .mx-wrap > table.mx').style.transform,
  }
}
const lwJudge = (id, when, r) => {
  check(id, `${when}: nothing of the names' frozen copy drawn over the date row's corner or LVE heading`, r.over.length === 0, r)
  check(id, `${when}: the names drawn all the way down the column from the date row's foot to the fingers`, r.blank.length === 0, r)
  if (r.inSight) check(id, `${when}: the corner at the grid's left edge`, Math.abs(r.cornerOff) < 1.5, r)
  if (r.bandOff !== null) check(id, `${when}: the names at the grid's left edge`, Math.abs(r.bandOff) < 1.5, r)
  if (r.frozenOff !== null) check(id, `${when}: the frozen dates' corner at the left edge`, Math.abs(r.frozenOff) < 1.5, r)
  if (r.stuck) check(id, `${when}: the frozen date row over its columns`, r.lineOff.length === 0, r)
  check(id, `${when}: a date row drawn under the top bar (frozen, or the grid's own in sight)`, r.dateRow, r)
  check(id, `${when}: never two date rows`, !r.twoRows, r)
}
/* the date row at about 150 down the screen, part-way down the page */
const lwPartWay = async (p, manningOpen) => {
  if (manningOpen !== null) {
    const open = await p.evaluate(() => !!document.querySelector('#page-leavewar tbody.counts td.who'))
    if (open !== manningOpen) { await p.locator('[data-testid="counts-toggle"]').click(); await sleep(400) }
  }
  await p.evaluate(() => { const c = document.querySelector('#page-leavewar .mx-wrap > table.mx > tbody.mxhead th.who').getBoundingClientRect(); window.scrollTo(0, Math.max(0, scrollY + c.top - 150)) })
  await sleep(400)
}
const K_IN = 230 / 110
/** the fingers' height for a pinch in that carries the names' first row up past the date row's foot (the walk's case) */
const lwFingers = async p => {
  const g = await p.evaluate(() => {
    const c = document.querySelector('#page-leavewar .mx-wrap > table.mx > tbody.mxhead th.who').getBoundingClientRect()
    const b = document.querySelector('#page-leavewar [data-testid="frozen-cols"]')
    return { cB: c.bottom, bT: b && getComputedStyle(b).visibility !== 'hidden' ? b.getBoundingClientRect().top : c.bottom + 40, h: innerHeight }
  })
  return Math.min(g.h - 120, Math.max(g.bT + 40, (K_IN * g.bT - g.cB + 40) / (K_IN - 1)))
}

const LW = [
  ['L1', 'part-way down, Manning folded, a pinch IN (the walk\'s fault)', async s => { await lwPartWay(s.p, false); return [200, await lwFingers(s.p), 110, 230] }],
  ['L2', 'part-way down, Manning folded, a pinch OUT', async s => { await lwPartWay(s.p, false); return [200, 520, 230, 100] }],
  ['L3', 'part-way down, Manning open, a pinch IN', async s => { await lwPartWay(s.p, true); return [200, 600, 110, 230] }],
  ['L4', 'at the top of the page, a pinch IN', async s => { await s.p.evaluate(() => window.scrollTo(0, 0)); await sleep(300); return [200, 560, 110, 230] }],
  ['L5', 'at the top of the page, a pinch OUT', async s => { await s.p.evaluate(() => window.scrollTo(0, 0)); await sleep(300); return [200, 560, 230, 100] }],
  ['L6', 'the dates frozen under the top bar (45% down), a pinch IN', async s => { await s.p.evaluate(() => window.scrollTo(0, Math.round((document.scrollingElement.scrollHeight - innerHeight) * 0.45))); await sleep(500); return [200, 450, 110, 230] }],
  ['L7', 'the dates frozen under the top bar (45% down), a pinch OUT', async s => { await s.p.evaluate(() => window.scrollTo(0, Math.round((document.scrollingElement.scrollHeight - innerHeight) * 0.45))); await sleep(500); return [200, 450, 230, 90] }],
  ['L8', 'the dates just frozen (260 down), a pinch OUT that turns back to a pinch IN, lifted at the zoom it began at (the code read, finding 1)', async s => { await s.p.evaluate(() => window.scrollTo(0, 260)); await sleep(500); return [200, 450, 230, 80, true] }],
]
if (!ONLY || ONLY === 'lw') for (const [id, what, reach] of LW) {
  const s = await fresh('leavewar')
  try {
    await s.p.waitForSelector('#page-leavewar .mx-wrap [data-testid^="head-"]')
    const [cx, cy, d0, d1, turn] = await reach(s)
    const rest = await s.p.evaluate(lwRead, cy + 30)
    await s.p.screenshot({ path: join(OUT, `${id}-rest.png`) })
    console.log(`— ${id} ${what} (fingers ${Math.round(cx)},${Math.round(cy)} ${d0}→${d1}; at rest ${JSON.stringify({ cornerT: rest.cornerT, cornerB: rest.cornerB, bandT: rest.bandT, stuck: rest.stuck })})`)
    lwJudge(id, 'at rest', rest)
    const { m, a } = await s.pinch(id, cx, cy, d0, d1, y => s.p.evaluate(lwRead, y), y => s.p.evaluate(lwRead, y), !!turn)
    check(id, 'read mid-pinch (the grid stretched as a picture)', m.transformed, m)
    lwJudge(id, 'mid-pinch', m)
    lwJudge(id, 'after the lift', a)
    if (turn) {
      check(id, 'lifted at the zoom it began at', Math.abs(a.zoom - rest.zoom) < 0.002, { rest: rest.zoom, after: a.zoom })
      check(id, 'after the lift the date row is frozen again', a.stuck, a)
    }
  } catch (e) { check(id, 'NOT WALKED', false, String(e).slice(0, 300)) }
  await done(id, s)
}

/* ---------------------------------------------------------------- Quals */
/* from the pinned heading row's foot (the copy under the top bar while it is up, else the table's own heading row, as
   drawn) down to the fingers: what shows at each point must be a cell of the table or of the pinned row — a see-through
   box (the pinned row's box while the fingers are down, the table's wrap) is looked through; anything else is a band. And
   every name in sight at the table's left edge, the pinned name heading at that edge and as wide as the names, each
   pinned heading over its column. */
const qRead = yTo => {
  const wrap = document.querySelector('#page-quals .qwrap').getBoundingClientRect()
  const mirror0 = document.querySelector('[data-testid="qsticky-head"]')
  const mirror = mirror0 && getComputedStyle(mirror0).visibility !== 'hidden' ? mirror0 : null
  const tbl = document.getElementById('qtbl')
  const heads = [...(mirror ?? tbl.tHead).querySelectorAll('th')].map(t => t.getBoundingClientRect()).filter(r => r.width > 0)
  const foot = Math.max(...heads.map(r => r.bottom))
  const isCell = el => !!el.closest('#qtbl td, #qtbl th, [data-testid="qsticky-head"] th')
  const clear = el => { const cs = getComputedStyle(el); return /rgba\(.*,\s*0\)$/.test(cs.backgroundColor) || cs.backgroundColor === 'transparent' }
  const bare = []
  /* from the heading row's foot, never above the top bar (mid-turn the frozen row may have unpinned while the table's own
     heading row stands above the screen) */
  const barB = document.querySelector('.topbar')?.getBoundingClientRect().bottom ?? 0
  for (let y = Math.max(Math.ceil(foot), Math.ceil(barB)) + 1; y < Math.min(yTo, innerHeight - 4); y += 4) {
    let what = 'nothing'
    for (const el of document.elementsFromPoint(200, y)) {
      if (isCell(el)) { what = null; break }
      if (!clear(el)) { what = el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.split(' ')[0] : ''); break }
    }
    if (what) bare.push(`${y} ${what}`)
  }
  const names = [...tbl.querySelectorAll('td.qname')].map(td => td.getBoundingClientRect()).filter(r => r.bottom > foot && r.top < innerHeight)
  const head = (mirror?.querySelector('.qfixed-frozen th[data-sort="cs"]') ?? mirror?.querySelector('th[data-sort="cs"]') ?? tbl.querySelector('thead th[data-sort="cs"]')).getBoundingClientRect()
  const real = [...tbl.querySelectorAll('thead tr:last-child > th')].slice(1, 8).map(t => t.getBoundingClientRect())
  const mir = mirror ? [...mirror.querySelectorAll('.qfixed-scroll thead tr:last-child > th')].slice(1, 8).map(t => t.getBoundingClientRect()) : []
  const barQ = document.querySelector('.topbar')?.getBoundingClientRect().bottom ?? 0
  const ownTop = tbl.querySelector('thead th[data-sort="cs"]').getBoundingClientRect().top
  return {
    bare, stuck: !!mirror,
    /* (fix round 3) a heading row IS drawn under the top bar — the frozen row shown, or the table's own in sight — never both */
    headingRow: !!mirror || ownTop >= barQ - 1, twoRows: !!mirror && ownTop > barQ + 2 && ownTop < innerHeight, foot: Math.round(foot), names: names.length,
    namesOff: names.filter(r => Math.abs(r.left - wrap.left) > 1.5).map(r => Math.round(r.left)),
    headOff: Math.round((head.left - wrap.left) * 10) / 10, headWidthOff: names[0] ? Math.round((head.right - names[0].right) * 10) / 10 : null,
    columnsOff: mir.map((r, i) => (Math.abs(r.left - real[i].left) > 3 || Math.abs(r.width - real[i].width) > 2) ? `${i + 1}: ${Math.round(r.left)}/${Math.round(r.width)} over ${Math.round(real[i].left)}/${Math.round(real[i].width)}` : null).filter(Boolean),
    zoom: parseFloat(getComputedStyle(tbl).zoom || '1'), transformed: !!tbl.style.transform,
  }
}
const qJudge = (id, when, r) => {
  check(id, `${when}: no band under the pinned heading row`, r.bare.length === 0, r)
  check(id, `${when}: every name in sight at the table's left edge`, r.names > 0 && r.namesOff.length === 0, r)
  check(id, `${when}: the pinned name heading at the left edge`, Math.abs(r.headOff) < 1.5, r)
  if (r.headWidthOff !== null) check(id, `${when}: the name heading as wide as the names under it`, Math.abs(r.headWidthOff) < 2, r)
  if (r.stuck) check(id, `${when}: every pinned heading over its column, as wide as it`, r.columnsOff.length === 0, r)
  check(id, `${when}: a heading row drawn under the top bar (frozen, or the table's own in sight)`, r.headingRow, r)
  check(id, `${when}: never two heading rows`, !r.twoRows, r)
}
const qScroll = (y, x = 0, view = null) => async s => {
  if (view) { await s.p.locator('.segview button', { hasText: view }).first().click(); await sleep(500) }
  await s.p.evaluate(([y, x]) => { window.scrollTo(0, y < 1 && y > 0 ? Math.round((document.scrollingElement.scrollHeight - innerHeight) * y) : y); document.querySelector('#page-quals .qwrap').scrollLeft = x }, [y, x])
  await sleep(500)
}
const QS = [
  ['Q1', 'part-way down (420), a pinch OUT (the walk\'s band)', qScroll(420), [200, 450, 230, 80]],
  ['Q2', 'part-way down (420), a pinch IN (the walk\'s names off the left)', qScroll(420), [200, 450, 90, 250]],
  ['Q3', 'at the top of the page, a pinch IN', qScroll(0), [200, 450, 90, 250]],
  ['Q4', 'at the top of the page, a pinch OUT', qScroll(0), [200, 450, 230, 80]],
  ['Q5', 'part-way down, the table scrolled sideways 150, a pinch IN', qScroll(420, 150), [200, 450, 90, 250]],
  ['Q6', 'part-way down, the table scrolled sideways 150, a pinch OUT', qScroll(420, 150), [200, 450, 230, 80]],
  ['Q7', 'All, 60% down the page (the heading row stays frozen through the pinch), a pinch OUT', qScroll(0.6, 0, 'All'), [200, 500, 200, 110]],
  ['Q8', 'All, 60% down the page, a pinch IN', qScroll(0.6, 0, 'All'), [200, 500, 90, 250]],
  ['Q9', 'part-way down (420), a pinch OUT that turns back to a pinch IN, lifted at the zoom it began at (the code read, finding 1)', qScroll(420), [200, 450, 230, 80, true]],
]
if (!ONLY || ONLY === 'quals') for (const [id, what, reach, [cx, cy, d0, d1, turn]] of QS) {
  const s = await fresh('quals')
  try {
    await s.p.waitForSelector('#qtbl td.qname')
    await reach(s)
    const rest = await s.p.evaluate(qRead, cy)
    await s.p.screenshot({ path: join(OUT, `${id}-rest.png`) })
    console.log(`— ${id} ${what} (fingers ${cx},${cy} ${d0}→${d1}; at rest pinned row ${rest.stuck ? 'frozen under the top bar' : 'the table\'s own'})`)
    qJudge(id, 'at rest', rest)
    const { m, a } = await s.pinch(id, cx, cy, d0, d1, y => s.p.evaluate(qRead, y), y => s.p.evaluate(qRead, y), !!turn)
    check(id, 'read mid-pinch (the table stretched as a picture)', m.transformed, m)
    qJudge(id, 'mid-pinch', m)
    qJudge(id, 'after the lift', a)
    if (turn) {
      check(id, 'lifted at the zoom it began at', Math.abs(a.zoom - rest.zoom) < 0.002, { rest: rest.zoom, after: a.zoom })
      check(id, 'after the lift the heading row is frozen again', a.stuck, a)
    }
  } catch (e) { check(id, 'NOT WALKED', false, String(e).slice(0, 300)) }
  await done(id, s)
}

await browser.close()
writeFileSync(join(OUT, 'results.json'), JSON.stringify(results, null, 1))
const fails = results.filter(r => !r.ok)
console.log(`\n${ENGINE}: ${results.length - fails.length} of ${results.length} checks pass${fails.length ? ' — FAILS: ' + [...new Set(fails.map(f => f.id))].join(', ') : ''}`)
console.log('DONE')
