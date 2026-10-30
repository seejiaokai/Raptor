// His D1526 (30 Oct 26 — "sliding tab but make it still slightly transparent"): the walk of the built week arrows. The
// arrows are a slim 14 × 70 tab on the window's edge, sliding out to the full 38-wide arrow (0.9, still see-through) while
// the pointer is near. Walked on the BUILT app (vite preview of dist) with a real mouse and keyboard, against the §7.11
// lessons: a gesture at two speeds (a slow approach, a fast swipe), a state left and come back to (the page left while the
// arrow was open), a press beside an open window (the changes window on the right edge), more than one page (View-only,
// Edit Schedule), the failed-save band, a drag carried to the edge (the view still follows), the keyboard, and where the
// arrows must not be (a phone, 820 wide). Sizes: his PC 1536 × 730 at 1.25; 1366 × 700 at 1.25; WebKit iPhone 402.
// Usage: node scripts/handpass/week-arrows-walk.mjs [port]   (pictures → docs/img/handpass/2026-10-30-week-arrows/walk)
import { chromium, webkit, devices } from 'playwright'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const here = path.dirname(fileURLToPath(import.meta.url))
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = path.resolve(here, '../../docs/img/handpass/2026-10-30-week-arrows', process.env.WALK_OUT || 'walk')
mkdirSync(OUT, { recursive: true })
const PORT = process.argv[2] || '4173'
const URL = `http://localhost:${PORT}/?fresh=1`
const rows = []
const rec = (name, ok, said, pics = []) => { rows.push({ name, result: ok ? 'PASS' : 'FAIL', said, pics }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  ${said}`) }
const LEFT = { x: 0, y: 150, width: 460, height: 560 }, RIGHT = { x: 1076, y: 150, width: 460, height: 560 }

async function open(browserType, ctxOpts) {
  const browser = await browserType.launch(browserType === chromium && existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
  const ctx = await browser.newContext(ctxOpts)
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)) })
  await page.goto(URL)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.addStyleTag({ content: '#toastEl, .toast { visibility: hidden !important; }' })
  return { browser, page, errs }
}
const nav = (page, id) => page.evaluate(i => {
  const b = document.getElementById(i); if (!b) return null
  const r = b.getBoundingClientRect(), cs = getComputedStyle(b)
  return { left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), top: Math.round(r.top), mid: Math.round(r.top + r.height / 2),
    opacity: +cs.opacity, near: b.classList.contains('near'), shown: cs.display !== 'none', edge: document.documentElement.clientWidth }
}, id)
const settled = async (page, id, w) => { for (let i = 0; i < 30; i++) { const n = await nav(page, id); if (n && n.width === w) return n; await page.waitForTimeout(50) } return nav(page, id) }
const shot = (page, name, clip) => page.screenshot({ path: path.join(OUT, name + '.png'), ...(clip ? { clip } : {}) })
const frontDay = (page, wk) => page.evaluate(w => {
  const el = document.getElementById(w), wl = el.getBoundingClientRect().left
  let best = null, bd = Infinity
  for (const d of el.querySelectorAll('.day[data-day]')) { const g = Math.abs(d.getBoundingClientRect().left - wl); if (g < bd) { bd = g; best = d } }
  return best ? +best.dataset.day : -1
}, wk)
const settleWeek = async (page, wk) => { let last = -1, still = 0; for (let i = 0; i < 60 && still < 3; i++) { const s = await page.evaluate(w => Math.round(document.getElementById(w).scrollLeft), wk); still = s === last ? still + 1 : 0; last = s; await page.waitForTimeout(50) } }

/* ---------- A. his PC, View-only ---------- */
{
  const { browser, page, errs } = await open(chromium, { viewport: { width: 1536, height: 730 }, deviceScaleFactor: 1.25 })
  await page.evaluate(() => window.go('viewsched')); await page.waitForTimeout(800)
  await page.click('#weekNext'); await settleWeek(page, 'vWeek'); await page.click('#weekNext'); await settleWeek(page, 'vWeek')
  await page.mouse.move(700, 120)
  const p0 = await settled(page, 'weekPrev', 14), n0 = await settled(page, 'weekNext', 14)
  await shot(page, 'a1-rest-left', LEFT); await shot(page, 'a1-rest-right', RIGHT)
  rec('A1 at rest: both slim tabs, flush on the edges, see-through', p0.width === 14 && n0.width === 14 && p0.left === 0 && n0.right === n0.edge && Math.abs(p0.opacity - .75) < .01,
    `‹ ${p0.left}+${p0.width}, › ends ${n0.right} of ${n0.edge}, ${p0.opacity}`, ['a1-rest-left', 'a1-rest-right'])

  for (let i = 1; i <= 10; i++) await page.mouse.move(300 - 25.2 * i, p0.mid, { steps: 1 })
  const p1 = await settled(page, 'weekPrev', 38)
  await shot(page, 'a2-open-left', LEFT)
  rec('A2 a slow approach from the week opens ‹ to the full arrow, still slightly see-through', p1.width === 38 && p1.left === 0 && Math.abs(p1.opacity - .9) < .01,
    `‹ ${p1.left}+${p1.width} at ${p1.opacity}`, ['a2-open-left'])

  await page.mouse.move(700, p0.mid); const pa = await settled(page, 'weekPrev', 14)
  await page.mouse.move(2, p0.mid); const pb = await settled(page, 'weekPrev', 38)
  await page.mouse.move(700, p0.mid); const pc = await settled(page, 'weekPrev', 14)
  rec('A3 a fast swipe straight to the edge opens it, straight back closes it', pa.width === 14 && pb.width === 38 && pc.width === 14, `${pa.width} → ${pb.width} → ${pc.width}`)

  await page.mouse.move(n0.edge - 19, n0.mid); const at = await settled(page, 'weekNext', 38)
  const seq = [await frontDay(page, 'vWeek')], boxes = []
  for (let i = 0; i < 3; i++) { await page.mouse.down(); await page.mouse.up(); await page.waitForTimeout(400); await settleWeek(page, 'vWeek'); seq.push(await frontDay(page, 'vWeek')); const n = await nav(page, 'weekNext'); boxes.push([n.left, n.width, n.near]) }
  await shot(page, 'a4-pressed-right', RIGHT)
  rec('A4 › pressed three times without moving: open, in place, a day a press', boxes.every(b => b[0] === at.left && b[1] === 38 && b[2]) && new Set(seq).size === 4,
    `front day ${seq.join(' → ')}; boxes ${JSON.stringify(boxes)}`, ['a4-pressed-right'])

  await page.mouse.move(700, 120); await settled(page, 'weekNext', 14)
  await page.keyboard.press('Escape')
  await page.evaluate(() => document.activeElement && document.activeElement.blur())
  await page.keyboard.press('Shift')                         // the last thing he did is a key, so focus shows (:focus-visible)
  await page.focus('#weekPrev')
  const k = await settled(page, 'weekPrev', 38)
  const fv = await page.evaluate(() => document.getElementById('weekPrev').matches(':focus-visible'))
  const before = await frontDay(page, 'vWeek'); await page.keyboard.press('Enter'); await settleWeek(page, 'vWeek'); const after = await frontDay(page, 'vWeek')
  await shot(page, 'a5-keyboard-left', LEFT)
  rec('A5 reached by the keyboard it opens, and Enter steps a day', fv && k.width === 38 && after !== before, `focus shown ${fv}, width ${k.width}, front day ${before} → ${after}`, ['a5-keyboard-left'])
  await page.evaluate(() => document.activeElement && document.activeElement.blur())

  await page.mouse.move(20, p0.mid); await settled(page, 'weekPrev', 38)
  await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(600)
  const gone = await nav(page, 'weekPrev')
  await page.evaluate(() => window.go('viewsched')); await page.waitForTimeout(800)
  const back = await nav(page, 'weekPrev')
  rec('A6 left open, the page left and come back to: hidden away, slim again on return', !gone.shown && back.shown && back.width === 14 && !back.near, `away shown ${gone.shown}; back ${back.width} near ${back.near}`)

  rec('A — no page errors', errs.length === 0, errs.join(' | ') || 'none')
  await browser.close()
}

/* ---------- B. 1366, the failed-save band ---------- */
{
  const { browser, page, errs } = await open(chromium, { viewport: { width: 1366, height: 700 }, deviceScaleFactor: 1.25 })
  await page.evaluate(() => window.go('viewsched')); await page.waitForTimeout(800)
  await page.mouse.move(700, 120)
  const before = await settled(page, 'weekPrev', 14)
  /* the band's own classes, set by hand: what is checked is only that the arrow, moved down by it, still opens where it is
     (the band's coming and going on a real failed save is walked in the steady-tests evidence, §5) */
  await page.evaluate(() => { document.querySelector('.topbar').classList.add('save-failed'); document.getElementById('shell')?.classList.add('save-failed') })
  await page.waitForTimeout(300)
  const moved = await nav(page, 'weekPrev')
  await page.mouse.move(40, moved.mid); const open1 = await settled(page, 'weekPrev', 38)
  await page.mouse.move(40, before.mid - 60); const shut = await settled(page, 'weekPrev', 14)
  await shot(page, 'b1-band-open-left', { x: 0, y: 100, width: 420, height: 560 })
  rec('B1 moved down by the "Not saved" band, it opens where it now is', moved.top > before.top && open1.width === 38 && shut.width === 14,
    `top ${before.top} → ${moved.top}; open ${open1.width}; above it ${shut.width}`, ['b1-band-open-left'])
  rec('B — no page errors', errs.length === 0, errs.join(' | ') || 'none')
  await browser.close()
}

/* ---------- C. his PC, Edit Schedule — a drag carried to the edge ---------- */
{
  const { browser, page, errs } = await open(chromium, { viewport: { width: 1536, height: 730 }, deviceScaleFactor: 1.25 })
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(1200)
  await page.click('#weekNext'); await settleWeek(page, 'eWeek'); await page.click('#weekNext'); await settleWeek(page, 'eWeek')
  await page.mouse.move(700, 120)
  const r = await settled(page, 'weekPrev', 14)
  await shot(page, 'c1-rest-left', LEFT)
  rec('C1 Edit Schedule draws the same slim tab', r.width === 14 && r.left === 0, `‹ ${r.left}+${r.width}`, ['c1-rest-left'])

  const puck = await page.evaluate(() => {
    const w = document.getElementById('eWeek'), wl = w.getBoundingClientRect().left
    const ps = [...w.querySelectorAll('[data-drag="1"]')].filter(p => { const b = p.getBoundingClientRect(); return b.width && b.left > wl + 60 && b.right < innerWidth - 60 && b.top > 160 && b.bottom < innerHeight - 60 })
    const b = ps[0]?.getBoundingClientRect(); return b ? { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) } : null
  })
  if (!puck) rec('C2 a drag carried to the left edge still pans the week back', false, 'no puck found in the front day')
  else {
    const s0 = await page.evaluate(() => Math.round(document.getElementById('eWeek').scrollLeft))
    await page.mouse.move(puck.x, puck.y); await page.mouse.down()
    for (let i = 1; i <= 12; i++) await page.mouse.move(puck.x + (4 - puck.x) * i / 12, puck.y + (r.mid - puck.y) * i / 12)
    for (let i = 0; i < 8; i++) { await page.mouse.move(4 + (i % 2), r.mid); await page.waitForTimeout(150) }
    await shot(page, 'c2-drag-at-edge', LEFT)
    const s1 = await page.evaluate(() => Math.round(document.getElementById('eWeek').scrollLeft))
    const during = await nav(page, 'weekPrev')
    await page.mouse.move(puck.x, puck.y, { steps: 6 })
    await page.keyboard.press('Escape'); await page.mouse.up(); await page.waitForTimeout(500)
    /* A mouse drag on the week scrolls the page up and down only: carried to the left or right edge it never pans the week
       sideways — measured the same with today's arrows, with the new tab and with no arrows at all (30 Oct 26), so it is
       not this change's; filed as [WEEK-DRAG-EDGE-PAN]. What this step proves: the arrow opening under a drag changes
       nothing — the week stays where it was, and Escape puts the man back. */
    const back = await page.evaluate(() => !document.querySelector('.dragimg') && !document.body.classList.contains('tdrag'))
    rec('C2 a man dragged to the left edge with the arrow open under it: the drag behaves as it does today (no sideways pan; Escape puts him back)', s1 === s0 && back,
      `scroll ${s0} → ${s1}; arrow ${during.width} wide during the drag; ghost gone after Escape ${back}`, ['c2-drag-at-edge'])
  }
  const n0 = await nav(page, 'weekNext')
  /* the changes window open on the right edge: the arrow stays under it (the window is above it) */
  await page.click('#histBtn').catch(() => {}); await page.waitForTimeout(600)
  const winBox = await page.evaluate(() => { const w = document.querySelector('.chgwin, .floatwin'); if (!w) return null; const r = w.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)] })
  await page.mouse.move(n0.edge - 30, n0.mid); await page.waitForTimeout(350)
  const top = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.closest('.week-nav') ? 'arrow' : e.closest('.chgwin, .floatwin') ? 'window' : e.tagName) : null }, [n0.edge - 30, n0.mid])
  await shot(page, 'c3-window-right', RIGHT)
  rec('C3 with the changes window open on the right, the pointer inside it near the edge reaches the window, not the arrow', !winBox || top === 'window',
    `window ${JSON.stringify(winBox)}; under the pointer: ${top}`, ['c3-window-right'])
  await page.click('#histBtn').catch(() => {}); await page.waitForTimeout(300)
  rec('C — no page errors', errs.length === 0, errs.join(' | ') || 'none')
  await browser.close()
}

/* ---------- D. where there are no arrows: an iPhone, and 820 wide ---------- */
{
  const { browser, page, errs } = await open(webkit, { ...devices['iPhone 13'], viewport: { width: 402, height: 874 } })
  await page.evaluate(() => window.go('viewsched')); await page.waitForTimeout(800)
  const p = await nav(page, 'weekPrev'), n = await nav(page, 'weekNext')
  await shot(page, 'd1-phone')
  rec('D1 an iPhone (402) draws no floating arrows', !p.shown && !n.shown, `‹ shown ${p.shown}, › shown ${n.shown}`, ['d1-phone'])
  rec('D — no page errors', errs.length === 0, errs.join(' | ') || 'none')
  await browser.close()
}
{
  const { browser, page, errs } = await open(chromium, { viewport: { width: 820, height: 700 } })
  await page.evaluate(() => window.go('viewsched')); await page.waitForTimeout(800)
  const at820 = await nav(page, 'weekPrev')
  await page.setViewportSize({ width: 821, height: 700 }); await page.waitForTimeout(500)
  await page.mouse.move(400, 120)
  const at821 = await settled(page, 'weekPrev', 14)
  rec('D2 hidden at 820 wide, the slim tab at 821', !at820.shown && at821.shown && at821.width === 14, `820 shown ${at820.shown}; 821 ${at821.width}`)
  rec('D2 — no page errors', errs.length === 0, errs.join(' | ') || 'none')
  await browser.close()
}

/* ---------- E. an iPad on its side, by finger, in Safari's engine (the fresh read's finding) ---------- */
{
  const { browser, page, errs } = await open(webkit, { ...devices['iPad Pro 11 landscape'] })
  await page.evaluate(() => window.go('viewsched')); await page.waitForTimeout(800)
  const bx = await page.locator('#weekNext').boundingBox()
  const s0 = await page.evaluate(() => Math.round(document.getElementById('vWeek').scrollLeft))
  await page.touchscreen.tap(bx.x + bx.width / 2, bx.y + bx.height / 2)
  await page.waitForTimeout(800)
  const s1 = await page.evaluate(() => Math.round(document.getElementById('vWeek').scrollLeft))
  const n = await nav(page, 'weekNext')
  await shot(page, 'e1-ipad-after-tap', { x: n.edge - 420, y: Math.max(0, n.mid - 280), width: 420, height: 560 })
  rec('E1 an iPad on its side: a finger tap on › steps the day and the tab stays slim (Safari holds a tapped button in hover)', s1 !== s0 && n.width === 14,
    `scroll ${s0} → ${s1}; › ${n.width} wide after the tap`, ['e1-ipad-after-tap'])
  rec('E — no page errors', errs.length === 0, errs.join(' | ') || 'none')
  await browser.close()
}

writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(rows, null, 1))
console.log(`${rows.filter(r => r.result === 'PASS').length}/${rows.length} pass`)
