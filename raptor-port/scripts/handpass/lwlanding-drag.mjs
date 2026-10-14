/* [LW-LANDING-LINE-FIGURES] (owner D883, 15 Oct 26 — "a blue line through even through the counters"): the Leave
   War's landing line while a row is dragged in Rearrange, by a REAL drag — a mouse on the desktop, a finger (touch
   events sent to the browser) on a phone — with the figures drawer open, then closed, and for a group heading.
   Each step asserts the RIGHT result (a PASS means correct), so a re-run on a fixed build is the re-walk:
     - the row under the pointer wears the mark, in the grid AND in the drawer's copy of it;
     - every cell across that row — the name, each figure box, the days in view — draws the 3px line (its computed
       shadow), and what the screen actually shows at each figure column's centre, just inside the row's edge, is a
       cell drawing that line (so the drawer cannot be covering a line drawn underneath it);
     - no row but that one wears the mark; the line goes with the drag.
   The drag is never let go on a row: the desktop presses Escape and lets go where it started, the phone sends a
   touch-cancel — nothing is moved.
   usage: DL_BASE=http://localhost:4173 DL_SHOTS=docs/img/handpass/2026-10-15-lw-landing-line node scripts/handpass/lwlanding-drag.mjs */
import { mkdirSync } from 'node:fs'
import * as L from './dl-lib.mjs'

mkdirSync(L.SHOTS, { recursive: true })
const results = []
const ok = (size, step, pass, saw) => { results.push({ size, step, pass, saw }); console.log(`${pass ? 'PASS' : 'FAIL'} [${size}] ${step} — ${saw}`) }

/** What the landing row draws, read off the page: the mark on the grid's row and on the drawer's copy, every cell's
 *  line, and what is actually ON TOP at each drawer column's centre just inside the row's top (or bottom) edge. */
const readLanding = page => page.evaluate(() => {
  const LINE = /0px (-?)3px 0px 0px inset/
  const real = [...document.querySelectorAll('#page-leavewar .mx-wrap .mx tbody tr.dragover')]
  const drawn = [...document.querySelectorAll('#page-leavewar .mxdrawer tbody tr.dragover')]
  const row = real[0]
  if (!row) return { none: true, real: 0, drawn: drawn.length }
  const after = row.classList.contains('after')
  const key = row.getAttribute('data-testid')
  const twin = document.querySelector(`#page-leavewar .mxdrawer [data-drawer-key="${key}"]`)
  const vw = window.innerWidth
  const cellsIn = tr => [...tr.children].filter(td => { const r = td.getBoundingClientRect(); return r.width > 0 && r.right > 0 && r.left < vw })
  const lineOf = td => { const m = getComputedStyle(td).boxShadow.match(LINE); return m ? (m[1] ? 'bottom' : 'top') : null }
  const realCells = cellsIn(row).map(td => ({ cls: td.className.split(' ')[0] || td.tagName, line: lineOf(td) }))
  const twinCells = twin ? cellsIn(twin).map(td => ({ cls: td.className.split(' ').slice(0, 3).join('.'), line: lineOf(td) })) : []
  /* what the eye meets: at each drawer cell's centre column, 1px inside the row's landing edge */
  const hits = []
  /* While Rearrange is on the drawer stands down to the pointer (`pointer-events: none`, so the drag hit-tests the
     real row under it) — and `elementFromPoint` skips such a box. Lend it the pointer for this read only. */
  const drawerBox = document.querySelector('#page-leavewar .mxdrawer')
  const pe = drawerBox ? drawerBox.style.pointerEvents : ''
  if (drawerBox) drawerBox.style.pointerEvents = 'auto'
  if (twin) for (const td of cellsIn(twin)) {
    const r = td.getBoundingClientRect(), rr = row.getBoundingClientRect()
    const y = after ? rr.bottom - 1.5 : rr.top + 1.5
    const el = document.elementFromPoint(r.left + r.width / 2, y)
    const cell = el && el.closest('td,th')
    hits.push({ inDrawer: !!(cell && cell.closest('.mxdrawer')), line: cell ? lineOf(cell) : null })
  }
  if (drawerBox) drawerBox.style.pointerEvents = pe
  const name = row.querySelector('.cs')?.textContent || row.querySelector('.gname')?.textContent || key
  return { none: false, key, name, after, realCount: real.length, drawnCount: drawn.length, twinMarked: !!(twin && twin.classList.contains('dragover')), realCells, twinCells, hits }
})

const judge = (size, label, s) => {
  if (s.none) { ok(size, `${label}: a row wears the landing mark`, false, `no row marked (drawer rows marked: ${s.drawn})`); return }
  const want = s.after ? 'bottom' : 'top'
  ok(size, `${label}: one row wears the mark, in the grid and in the drawer`, s.realCount === 1 && (s.twinCells.length === 0 || (s.twinMarked && s.drawnCount === 1)), `${s.name} (${s.key}) — grid rows ${s.realCount}, drawer rows ${s.drawnCount}, its drawer copy ${s.twinMarked ? 'marked' : s.twinCells.length ? 'NOT marked' : 'absent (drawer closed)'}`)
  const badReal = s.realCells.filter(c => c.line !== want)
  ok(size, `${label}: every grid cell in view draws the line on its ${want} edge`, badReal.length === 0 && s.realCells.length > 0, `${s.realCells.length} cells${badReal.length ? `; without: ${badReal.map(c => c.cls).join(', ')}` : ''}`)
  if (s.twinCells.length) {
    const badTwin = s.twinCells.filter(c => c.line !== want)
    ok(size, `${label}: every figure box in the drawer draws it too`, badTwin.length === 0, `${s.twinCells.length} boxes${badTwin.length ? `; without: ${badTwin.map(c => c.cls).join(', ')}` : ''}`)
    const badHit = s.hits.filter(h => !h.inDrawer || h.line !== want)
    ok(size, `${label}: what shows at each figure column's centre is the drawer, drawing the line`, badHit.length === 0, `${s.hits.length} columns${badHit.length ? `; ${badHit.length} show no line` : ''}`)
  }
}

async function drawerOpen(w, want) {
  const isOpen = await w.page.evaluate(() => !!document.querySelector('#page-leavewar [data-testid="figdrawer"]'))
  if (isOpen !== want) { await w.press('[data-testid="figures-toggle"]'); await L.sleep(500) }
  return w.page.evaluate(() => !!document.querySelector('#page-leavewar [data-testid="figdrawer"]'))
}

/** The grip's centre and a target point in another row's upper (or lower) part — found by what they are. */
const points = (page, { group, lower }) => page.evaluate(({ group, lower }) => {
  if (group) {
    const grips = [...document.querySelectorAll('#page-leavewar .mx-wrap [data-testid^="gdrag-"]')]
    const a = grips[0], bRow = grips[1] && grips[1].closest('tr')
    if (!a || !bRow) return null
    bRow.scrollIntoView({ block: 'center' })
    const g = a.getBoundingClientRect(), b = bRow.querySelector('td').getBoundingClientRect()
    return { gx: g.x + g.width / 2, gy: g.y + g.height / 2, bx: b.x + Math.min(b.width / 2, 60), by: b.y + b.height * (lower ? 0.75 : 0.3), hovered: bRow.getAttribute('data-testid'), next: bRow.nextElementSibling?.getAttribute('data-testid') ?? null }
  }
  const rows = [...document.querySelectorAll('#page-leavewar .mx-wrap .mx tbody tr[data-testid^="row-"]')].filter(r => !r.classList.contains('me'))
  const a = rows[2], b = rows[6]
  if (!a || !b) return null
  b.scrollIntoView({ block: 'center' })
  const grip = a.querySelector('[data-testid^="drag-"]')
  const g = grip.getBoundingClientRect(), br = b.querySelector('.who').getBoundingClientRect()
  return { gx: g.x + g.width / 2, gy: g.y + g.height / 2, bx: br.x + br.width / 2, by: br.y + br.height * (lower ? 0.75 : 0.3), hovered: b.getAttribute('data-testid'), next: b.nextElementSibling?.getAttribute('data-testid') ?? null }
}, { group, lower })

/** Press, travel, hold (the caller reads and pictures), then let go WITHOUT a drop. */
async function holdDrag(w, pts) {
  const p = w.page
  if (!w.phone) {
    await p.mouse.move(pts.gx, pts.gy); await p.mouse.down(); await L.sleep(120)
    for (let i = 1; i <= 12; i++) { await p.mouse.move(pts.gx + (pts.bx - pts.gx) * i / 12, pts.gy + (pts.by - pts.gy) * i / 12); await L.sleep(40) }
    await L.sleep(400)
    return async () => { await p.keyboard.press('Escape'); await p.mouse.move(pts.gx, pts.gy); await p.mouse.up(); await L.sleep(300) }
  }
  const cdp = await w.ctx.newCDPSession(p)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pts.gx, y: pts.gy, id: 1 }] }); await L.sleep(150)
  for (let i = 1; i <= 12; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: pts.gx + (pts.bx - pts.gx) * i / 12, y: pts.gy + (pts.by - pts.gy) * i / 12, id: 1 }] }); await L.sleep(40) }
  await L.sleep(400)
  return async () => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] }); await L.sleep(300) }
}

async function step(w, label, opts, picName) {
  const before = await w.page.evaluate(() => [...document.querySelectorAll('#page-leavewar .mx-wrap .mx tbody tr[data-testid^="row-"]')].map(r => r.getAttribute('data-testid')).join(','))
  const pts = await points(w.page, opts)
  if (!pts) { ok(w.key, `${label}: found two rows to drag between`, false, 'none'); return }
  const release = await holdDrag(w, pts)
  /* DL_BEFORE=1: the picture of the build BEFORE this fix, which never put the mark on the drawer's copy of the row —
     the same page with that one class taken off for the picture (nothing is judged in this mode). */
  if (process.env.DL_BEFORE) {
    await w.page.evaluate(() => document.querySelectorAll('#page-leavewar .mxdrawer tr.dragover').forEach(t => t.classList.remove('dragover', 'after')))
    const box = await w.page.evaluate(() => { const r = document.querySelector('#page-leavewar .mx-wrap tr.dragover').getBoundingClientRect(); return { y: r.y, h: r.height } })
    await L.pic(w, picName.replace(/^L(\d)/, 'B$1'), { clip: { x: 0, y: Math.max(0, box.y - 70), width: Math.min(w.S.w, w.phone ? w.S.w : 1100), height: box.h + 140 } })
    await release(); return
  }
  const s = await readLanding(w.page)
  judge(w.key, label, s)
  /* ONE LINE A GAP (owner D890): over the lower half of a row with a man's row after it, the line is the one the row
     below would draw over its upper half — on that row's top edge — never this row's foot */
  if (opts.lower && !opts.group && !s.none) {
    const want = pts.next && pts.next.startsWith('row-') ? pts.next : pts.hovered
    ok(w.key, `${label}: one line a gap — drawn on the top of the row below (${want})`, s.key === want && s.after === (want === pts.hovered), `hovered ${pts.hovered}, marked ${s.key} on its ${s.after ? 'bottom' : 'top'} edge`)
  }
  if (!s.none) {
    const box = await w.page.evaluate(k => { const r = document.querySelector(`#page-leavewar .mx-wrap [data-testid="${k}"]`).getBoundingClientRect(); return { y: r.y, h: r.height } }, s.key)
    const width = Math.min(w.S.w, w.phone ? w.S.w : 1100)
    await L.pic(w, picName, { clip: { x: 0, y: Math.max(0, box.y - 70), width, height: box.h + 140 } })
  }
  await release()
  const after = await w.page.evaluate(() => ({ marked: document.querySelectorAll('#page-leavewar tr.dragover').length, order: [...document.querySelectorAll('#page-leavewar .mx-wrap .mx tbody tr[data-testid^="row-"]')].map(r => r.getAttribute('data-testid')).join(',') }))
  ok(w.key, `${label}: the line goes with the drag, and nothing moved`, after.marked === 0 && after.order === before, `rows still marked ${after.marked}; order ${after.order === before ? 'unchanged' : 'CHANGED'}`)
}

for (const size of ['desk', 'phone']) {
  const w = await L.world(size)
  try {
    await L.go(w, 'leavewar'); await w.page.waitForSelector('#page-leavewar [data-testid^="row-"]', { timeout: 20000 }); await L.sleep(800)
    const opened = await drawerOpen(w, true)
    ok(size, 'the figures drawer is open', opened, opened ? 'open' : 'could not open it')
    await w.press('[data-testid="roster-arrange"]'); await L.sleep(600)
    ok(size, 'Rearrange is on', await w.page.evaluate(() => !!document.querySelector('#page-leavewar .mx-outer.mx-arranging')), '')
    await step(w, 'a man\'s row, upper half (drawer open)', {}, `L1-man-upper-drawer-${size}`)
    await step(w, 'a man\'s row, lower half (drawer open)', { lower: true }, `L2-man-lower-drawer-${size}`)
    if (!w.phone) await step(w, 'a group heading (drawer open)', { group: true }, `L3-group-drawer-${size}`)
    await w.press('[data-testid="roster-arrange"]'); await L.sleep(400)
    const closed = !(await drawerOpen(w, false))
    ok(size, 'the figures drawer is closed', closed, '')
    await w.press('[data-testid="roster-arrange"]'); await L.sleep(600)
    await step(w, 'a man\'s row (drawer closed: the one figure column)', {}, `L4-man-closed-${size}`)
    if (w.errors.length) ok(size, 'no console or page errors', false, w.errors.join(' | ').slice(0, 300))
    else ok(size, 'no console or page errors', true, '0')
  } catch (e) { ok(size, 'the walk ran to its end', false, String(e).slice(0, 300)) } finally { await L.close(w) }
}
const fails = results.filter(r => !r.pass)
console.log(`\n${results.length - fails.length} / ${results.length} PASS`)
process.exit(fails.length ? 1 : 0)
