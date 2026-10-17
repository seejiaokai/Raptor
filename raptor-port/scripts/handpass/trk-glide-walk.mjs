/* RETIRED 18 Oct 26 by D992 ([TRK-CHART-FPS]): a finger is now the phone's own scroll and glide.js is gone, so most of this
   walk's checks test code that no longer exists — kept as the record of the glide's walk; the walk of today is trk-fps-walk.mjs.
   [TRK-SCROLL-GLIDE] the walk — the Tracker's finger glide (owner D985–D989, 17 Oct 26).
   Real fingers through Chromium's touch input (CDP Input.dispatchTouchEvent — the pointer events a phone sends) and a
   real mouse, on the production bundle. Each step prints PASS / FAIL with the values it judged; the pictures go to
   GLIDE_SHOTS (default docs/img/handpass/2026-10-17-trk-glide/walk), the results to docs/handpass/parts/trk-glide/.
     HP_URL       the preview (default http://localhost:4181)
     GLIDE_SHOTS  a re-walk's own picture folder */
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, rmSync, readdirSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_SHOTS ||= process.env.GLIDE_SHOTS || resolve(HERE, '../../docs/img/handpass/2026-10-17-trk-glide/walk')
process.env.HP_OUT ||= resolve(HERE, '../../docs/handpass/parts/trk-glide')
/* one run, one folder: its pictures emptied first (the files, not the folder — a shell may be standing in it) */
mkdirSync(process.env.HP_SHOTS, { recursive: true })
for (const f of readdirSync(process.env.HP_SHOTS)) if (f.endsWith('.png')) rmSync(resolve(process.env.HP_SHOTS, f))
/* THE BUILD IT DRIVES IS PROVED FIRST (walk-scripts.md §1). The shared driver's default address is another chat's port:
   on 17 Oct 26 a break run that passed no address drove a different checkout's build — one with no glide — and every
   result was void. The address must be given, and the bundle it serves must be this checkout's own `dist`. */
if (!process.env.HP_URL) { console.error('HP_URL not set — give the address of the preview serving the dist of THIS checkout'); process.exit(2) }
{
  const served = ((await (await fetch(process.env.HP_URL + '/')).text()).match(/assets\/index-[^"']+\.js/) || [])[0]
  const local = readdirSync(resolve(HERE, '../../dist/assets')).find(f => /^index-.*\.js$/.test(f))
  if (!served || served !== 'assets/' + local) { console.error(`the preview at ${process.env.HP_URL} serves ${served}, this checkout built assets/${local} — not this build`); process.exit(2) }
}
const { open, shot, save, PHONE, DESK } = await import('./trk-lib.mjs')
console.log('trk-glide-walk v22 —', process.env.HP_URL)

const rows = []
const note = (id, name, pass, detail) => { rows.push({ id, name, pass, detail }); console.log(`${pass === null ? 'NOT WALKED' : pass ? 'PASS' : 'FAIL'}  ${id} ${name}  ${JSON.stringify(detail)}`) }
const wait = ms => new Promise(r => setTimeout(r, ms))

/* one finger: down at (x,y), moved by (dx,dy) over `steps` moves 16ms apart, resting `rest` ms before it lifts */
async function finger(cdp, { x, y, dx = 0, dy = 0, steps = 6, rest = 0, lift = true, id = 7 }) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id }] })
  for (let i = 1; i <= steps; i++) {
    await wait(16)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * i / steps, y: y + dy * i / steps, id }] })
  }
  if (rest) await wait(rest)
  if (lift) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}
const tap = async (cdp, x, y) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 9 }] }); await wait(60); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }) }
const pos = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); const k = e.firstElementChild; return { x: Math.round(e.scrollLeft), y: Math.round(e.scrollTop), maxY: e.scrollHeight - e.clientHeight, maxX: e.scrollWidth - e.clientWidth, tf: k ? k.style.transform : '' } }, sel)
const box = (page, sel) => page.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 } }, sel)
const popOpen = page => page.evaluate(() => !!document.getElementById('pop'))
/* a point on the chart's empty space (no ball, no line under it), near (fx, fy) of the board's box */
const emptyAt = (page, fx = 0.15, fy = 0.5) => page.evaluate(([fx, fy]) => {
  const b = document.getElementById('board').getBoundingClientRect(), bot = Math.min(b.bottom, innerHeight)
  for (const gx of [fx, 0.05, 0.3, 0.6, 0.9]) for (let dy = 0; dy < 200; dy += 10) for (const s of [1, -1]) {
    const x = b.left + Math.min(b.width, innerWidth - b.left) * gx, y = b.top + (bot - b.top) * fy + s * dy
    const t = document.elementFromPoint(x, y)
    if (t && document.getElementById('board').contains(t) && !t.closest('.ball') && !t.closest('.edgehit')) return { x, y }
  }
  return null
}, [fx, fy])
/* put away any window a stray press opened (Escape twice), then spend one finger tap on empty chart — the test browser's
   flick quirk (walk-scripts.md §4) */
async function settle(page, cdp) {
  await page.keyboard.press('Escape'); await wait(150); await page.keyboard.press('Escape'); await wait(150)
  const z = await emptyAt(page); if (z) { await tap(cdp, z.x, z.y); await wait(300) }
  /* the chart can shift under the point (the keyboard ring brought back by Escape scrolls it): a pop-up the tap opened goes too */
  if (await page.evaluate(() => !!document.getElementById('pop'))) { await page.keyboard.press('Escape'); await wait(250) }
}
/* the ball nearest the middle of the board, fully in view */
const ballMid = (page, inset = 20) => page.evaluate(inset => {
  const bd = document.getElementById('board').getBoundingClientRect(), bot = Math.min(bd.bottom, innerHeight)
  let best = null
  for (const g of document.querySelectorAll('#flowSvg .ball')) {
    const r = g.getBoundingClientRect(); if (!r.width || r.top < bd.top + inset || r.bottom > bot - inset || r.left < bd.left + 10 || r.right > Math.min(bd.right, innerWidth) - 10) continue
    const d = Math.abs(r.top + r.height / 2 - (bd.top + bot) / 2); if (!best || d < best.d) best = { id: g.dataset.id, x: r.left + r.width / 2, y: r.top + r.height / 2, d }
  }
  return best
}, inset)

/* ================= PHONE ================= */
{
  const { browser, page, errors } = await open({ size: PHONE, who: 'a', touch: true })
  const cdp = await page.context().newCDPSession(page)
  await page.waitForSelector('#flowSvg .ball'); await wait(600)
  await page.evaluate(() => { document.getElementById('board').scrollTop = 1500 }); await wait(200)
  let e = await emptyAt(page)

  /* G1 — a flick glides on after the lift and comes to rest (D985) */
  let a = await pos(page, '#board')
  await finger(cdp, { x: e.x, y: e.y, dy: -240, steps: 6 })
  const atLift = await pos(page, '#board'); await wait(120); const mid = await pos(page, '#board')
  await shot(page, 'g1-phone-chart-mid-glide')
  await wait(2500); const end1 = await pos(page, '#board'); await wait(300); const end2 = await pos(page, '#board')
  note('G1', 'phone chart: a flick carries on after the lift, then stops', mid.y > atLift.y + 20 && end1.y > mid.y && end1.y === end2.y,
    { start: a.y, atLift: atLift.y, at120ms: mid.y, rest: end1.y, restLater: end2.y })
  await shot(page, 'g1-phone-chart-at-rest')

  /* G2 — a drag that rests before lifting does not glide (it meant to stop there) */
  e = await emptyAt(page); a = await pos(page, '#board')
  await finger(cdp, { x: e.x, y: e.y, dy: -150, steps: 8, rest: 150 })
  const l2 = await pos(page, '#board'); await wait(700); const r2 = await pos(page, '#board')
  note('G2', 'phone chart: a drag held still before the lift stops where it is', Math.abs(r2.y - l2.y) <= 1 && Math.abs((l2.y - a.y) - 150) <= 3,
    { start: a.y, atLift: l2.y, after: r2.y, followedFinger: l2.y - a.y })

  /* G3 — the view follows the finger exactly while it is down */
  e = await emptyAt(page); a = await pos(page, '#board')
  await finger(cdp, { x: e.x, y: e.y, dy: -100, steps: 5, lift: false })
  await wait(50); const held = await pos(page, '#board')
  await wait(120); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })   /* the lift, after a rest */
  note('G3', 'phone chart: while the finger is down the chart follows it exactly', Math.abs((held.y - a.y) - 100) <= 2, { start: a.y, held: held.y })

  /* G4 / G4m — a press while it glides stops it, and the event under it does not open (D986). Events at 200%: the chart
     still moves between aiming and pressing, so a press is retried (up to 4 times) until one provably lands on an event —
     what it landed on, and the chart's place at that instant, are read as it lands, before the app sees it. */
  for (let i = 0; i < 12 && (await page.textContent('#fzPct')) !== '200%'; i++) { await page.evaluate(() => document.getElementById('fzIn').click()); await wait(120) }
  async function pressMidGlide(how) {
    let last = null; const tries = []
    for (let k = 0; k < 4; k++) {
      await page.evaluate(() => { const b = document.getElementById('board'); b.scrollTop = Math.min(b.scrollHeight - b.clientHeight - 1500, 3000) }); await wait(200)
      const e0 = await emptyAt(page, 0.1, 0.7)
      if (!e0) { console.log('no empty point:', JSON.stringify(await page.evaluate(() => [[50, 400], [200, 500], [300, 700]].map(([x, y]) => { const t = document.elementFromPoint(x, y); return t ? (t.id || t.tagName) + '.' + (t.getAttribute('class') || '') + ' in ' + (t.closest('[id]') || {}).id : null })))); continue }   /* a re-render under the search found no clear point this time: try again */
      /* the place at the lift: a flick this fast would glide on ~1000px by itself, so a press that lands past this place
         and leaves the chart well short of that throw is what stopped it (two reads a frame apart can read the same) */
      await finger(cdp, { x: e0.x, y: e0.y, dy: -200, steps: 5 }); const p0 = await pos(page, '#board'); await wait(50)
      const bb = await ballMid(page, 140)
      await page.evaluate(() => { window.__pressOn = null; window.addEventListener('pointerdown', e => { const g = e.target.closest && e.target.closest('.ball'); window.__pressOn = { on: g ? g.dataset.id : null, y: Math.round(document.getElementById('board').scrollTop) } }, { capture: true, once: true }) })
      if (how === 'finger') await tap(cdp, bb.x, bb.y); else await page.mouse.click(bb.x, bb.y)
      await wait(80); const s1 = await pos(page, '#board'); await wait(500); const s2 = await pos(page, '#board')
      const opened = await popOpen(page), at = await page.evaluate(() => window.__pressOn)
      last = { attempt: k + 1, aimed: bb.id, pressedOn: at && at.on, gliding: [p0.y, at && at.y], justAfter: s1.y, later: s2.y, popOpened: opened }
      tries.push(last)
      if (k === 0 || (at && at.on)) await shot(page, `g4-phone-${how}-press-stops-glide-nothing-opens`)
      if (opened) { await page.keyboard.press('Escape'); await wait(300) }
      await settle(page, cdp)   /* a stray window put away; the test browser's flick quirk, as G5 */
      /* a valid trial: it landed on an event AND the chart was still moving when it did */
      if (at && at.on && at.y > p0.y) return { ok: Math.abs(s2.y - s1.y) <= 1 && s2.y - p0.y < 400 && !opened, ...last, tries }
    }
    return { ok: null, tries }
  }
  const r4 = await pressMidGlide('finger')
  note('G4', 'phone chart: a touch on an event mid-glide stops the glide and opens nothing', r4.ok, r4)
  const r4m = await pressMidGlide('mouse')
  note('G4m', 'phone chart: a press on an event mid-glide (mouse) stops it and opens nothing', r4m.ok, r4m)
  /* G5 — the second tap works as normal. First one throwaway finger tap on empty chart: after a scripted flick the TEST
     browser sends no click for the next finger tap at all (counted at the window, before the app — walk-scripts.md §4;
     shown 17 Oct 26 by a probe), and a mouse press does not clear that. Not a phone's behaviour. */
  await settle(page, cdp)
  /* the click is counted at the window, before the app: a tap the TEST browser sent no click for (its flick quirk) is
     tried again — only a tap whose click was sent and still opened nothing is the app's */
  let b5, opened5 = false, sent5 = 0, tries5 = 0
  if (await popOpen(page)) { await page.keyboard.press('Escape'); await wait(250) }   /* start with nothing open */
  for (; tries5 < 3 && !opened5; tries5++) {
    b5 = await ballMid(page, 60)
    await page.evaluate(() => { window.__clicks = 0; window.addEventListener('click', () => window.__clicks++, { capture: true, once: true }) })
    await tap(cdp, b5.x, b5.y); await wait(500)
    opened5 = await popOpen(page); sent5 = await page.evaluate(() => window.__clicks)
    if (sent5) break
  }
  await shot(page, 'g5-phone-second-tap-opens')
  note('G5', 'phone chart: the next tap on an event opens its marking pop-up', opened5, { ball: b5.id, popOpened: opened5, clickSent: sent5, tries: tries5 + 1 })
  await page.keyboard.press('Escape'); await wait(300)
  if (await popOpen(page)) { await page.evaluate(() => document.querySelector('#pop button:last-child')?.click()); await wait(300) }

  await page.evaluate(() => document.getElementById('fzReset').click()); await wait(400)
  /* G6 — a touch that stops a glide and drags on carries the view from where it stopped — no jump */
  e = await emptyAt(page, 0.15, 0.6)
  await finger(cdp, { x: e.x, y: e.y, dy: -240, steps: 5 }); await wait(100)
  const e6 = await emptyAt(page, 0.15, 0.5)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: e6.x, y: e6.y, id: 8 }] })
  await wait(30); const caught = await pos(page, '#board')
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: e6.x, y: e6.y + 40, id: 8 }] }); await wait(30)
  const dragged = await pos(page, '#board')
  await wait(150); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  note('G6', 'phone chart: catching a glide and dragging on moves from where it stopped', Math.abs((caught.y - dragged.y) - 40) <= 2, { caught: caught.y, after40pxDown: dragged.y })
  await wait(600)

  /* G7 — a flick to the top end bounces past it and springs back (D987) */
  await page.evaluate(() => { document.getElementById('board').scrollTop = 250 }); await wait(150)
  e = await emptyAt(page, 0.15, 0.4)
  await finger(cdp, { x: e.x, y: e.y, dy: 220, steps: 5 })
  let peak = 0, sawTop = false
  for (let i = 0; i < 40; i++) { await wait(20); const p = await pos(page, '#board'); const m = /translate\(([-\d.]+)px, ?([-\d.]+)px\)/.exec(p.tf); if (m) peak = Math.max(peak, +m[2]); if (p.y === 0) sawTop = true; if (i === 6) await shot(page, 'g7-phone-bounce-at-top') }
  await wait(800); const r7 = await pos(page, '#board')
  note('G7', 'phone chart: a glide reaching the top runs a little past it and springs back', sawTop && peak > 5 && peak < 200 && r7.y === 0 && r7.tf === '',
    { peakStretchPx: Math.round(peak), restScroll: r7.y, transformLeft: r7.tf })

  /* G8 — a finger pulled past the top stretches less than it moved, and springs back on the lift (D987) */
  e = await emptyAt(page, 0.15, 0.3)
  await finger(cdp, { x: e.x, y: e.y, dy: 160, steps: 8, lift: false })
  const st8 = await pos(page, '#board'); const m8 = /translate\(([-\d.]+)px, ?([-\d.]+)px\)/.exec(st8.tf)
  await shot(page, 'g8-phone-pulled-past-top')
  await wait(120); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await wait(900); const r8 = await pos(page, '#board')
  note('G8', 'phone chart: pulled past the top it gives less than the finger, then springs back', !!m8 && +m8[2] > 20 && +m8[2] < 160 && r8.y === 0 && r8.tf === '',
    { fingerPx: 160, stretchPx: m8 ? Math.round(+m8[2]) : null, restScroll: r8.y, transformLeft: r8.tf })

  /* G9 — the bottom end too */
  await page.evaluate(() => { const b = document.getElementById('board'); b.scrollTop = b.scrollHeight - b.clientHeight - 200 }); await wait(150)
  e = await emptyAt(page, 0.15, 0.6)
  await finger(cdp, { x: e.x, y: e.y, dy: -220, steps: 5 })
  let peak9 = 0
  for (let i = 0; i < 40; i++) { await wait(20); const p = await pos(page, '#board'); const m = /translate\(([-\d.]+)px, ?([-\d.]+)px\)/.exec(p.tf); if (m) peak9 = Math.min(peak9, +m[2]) }
  await wait(800); const r9 = await pos(page, '#board')
  note('G9', 'phone chart: a glide reaching the bottom bounces and settles on the end', peak9 < -5 && Math.abs(r9.y - r9.maxY) <= 1 && r9.tf === '', { peakStretchPx: Math.round(peak9), rest: r9.y, max: r9.maxY, transformLeft: r9.tf })
  await shot(page, 'g9-phone-chart-bottom-at-rest')

  /* G10 — the app's own move wins: a zoom press mid-glide stops the glide (D989) */
  await page.evaluate(() => { document.getElementById('board').scrollTop = 1200 }); await wait(150)
  e = await emptyAt(page)
  await finger(cdp, { x: e.x, y: e.y, dy: -240, steps: 5 }); await wait(40)
  const z0a = await pos(page, '#board'); await wait(30); const z0b = await pos(page, '#board')
  /* pressed through its own handler: Chromium eats a finger tap straight after a scripted flick (walk-scripts.md §4) */
  await page.evaluate(() => document.getElementById('fzIn').click())
  await wait(100); const z1 = await pos(page, '#board'); await wait(600); const z2 = await pos(page, '#board')
  note('G10', 'phone chart: pressing zoom + mid-glide stops the glide, the zoom lands', z0b.y > z0a.y && Math.abs(z2.y - z1.y) <= 1 && z2.tf === '', { glidingBefore: [z0a.y, z0b.y], justAfter: z1.y, later: z2.y, zoom: await page.textContent('#fzPct') })
  await page.evaluate(() => document.getElementById('fzReset').click()); await wait(400)

  /* R2 — the app's own move while the chart still bounces at its top: the spring does not write the old end back over
     it (the code read's finding 2) */
  await page.evaluate(() => { document.getElementById('board').scrollTop = 200 }); await wait(150)
  e = await emptyAt(page, 0.15, 0.4)
  await finger(cdp, { x: e.x, y: e.y, dy: 220, steps: 5 })
  let sawStretch = false
  for (let i = 0; i < 15 && !sawStretch; i++) { await wait(10); sawStretch = /translate/.test((await pos(page, '#board')).tf) }
  /* a student picked mid-bounce: his landing is away from the top, so a spring writing the old end back would show */
  await page.selectOption('#activeSel', { index: 1 })
  await wait(60); const r2a = await pos(page, '#board'); await wait(900); const r2b = await pos(page, '#board')
  note('R2', 'phone chart: a student picked mid-bounce lands and stays (the spring does not undo the landing)', sawStretch && r2a.y > 50 && r2b.y === r2a.y && r2b.tf === '', { stretchedWhenPicked: sawStretch, rightAfter: r2a.y, later: r2b.y, tf: r2b.tf })
  await page.selectOption('#activeSel', { index: 0 }); await wait(600)
  /* G11 — the app's own move wins: picking a student mid-glide lands on his event, as D984 says */
  e = await emptyAt(page)
  await page.evaluate(() => { document.getElementById('board').scrollTop = 2500 }); await wait(150)
  await finger(cdp, { x: e.x, y: e.y, dy: -240, steps: 5 }); await wait(60)
  await page.selectOption('#activeSel', { index: 1 }); await wait(900)
  const g1 = await pos(page, '#board'); await wait(500); const g2 = await pos(page, '#board')
  await shot(page, 'g11-phone-pick-mid-glide-lands')
  note('G11', 'phone chart: a student picked mid-glide lands the chart, and it stays', Math.abs(g2.y - g1.y) <= 1 && g1.y < 2000, { landed: g1.y, later: g2.y })

  /* G12 — two fingers stop a glide; the pinch zooms; nothing is left stretched (D989) */
  e = await emptyAt(page)
  await page.evaluate(() => { document.getElementById('board').scrollTop = 1500 }); await wait(150)
  const z0 = await page.textContent('#fzPct')
  await finger(cdp, { x: e.x, y: e.y, dy: -240, steps: 5 }); await wait(50)
  const c = await box(page, '#board')
  const pts = d => [{ x: c.cx - d / 2, y: c.cy, id: 1 }, { x: c.cx + d / 2, y: c.cy, id: 2 }]
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts(80) })
  for (let i = 1; i <= 10; i++) { await wait(16); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts(80 + 8 * i) }) }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await wait(150); const p1 = await pos(page, '#board'); await wait(500); const p2 = await pos(page, '#board')
  const z12 = await page.textContent('#fzPct')
  note('G12', 'phone chart: two fingers stop a glide, the pinch zooms, nothing stays stretched', Math.abs(p2.y - p1.y) <= 1 && z12 !== z0 && p2.tf === '', { zoomBefore: z0, zoomAfter: z12, justAfter: p1.y, later: p2.y, tf: p2.tf })
  await page.evaluate(() => document.getElementById('fzReset').click()); await wait(400)

  /* G12b — a second finger landing while the first holds the chart stretched past its top: the pinch takes over and the
     stretch goes at once (the first finger's own touch stops a glide, so this is the one place the pinch's stop shows) */
  {
    await page.evaluate(() => { document.getElementById('board').scrollTop = 0 }); await wait(200)
    const z0b = await page.textContent('#fzPct')
    const c2 = await box(page, '#board'), x1 = c2.x + c2.w * 0.3, y1 = c2.y + 120
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x1, y: y1, id: 1 }] })
    for (let i = 1; i <= 6; i++) { await wait(16); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x1, y: y1 + 20 * i, id: 1 }] }) }
    const held = await pos(page, '#board')
    const y2 = y1 + 120
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x1, y: y2, id: 1 }, { x: x1 + 80, y: y2, id: 2 }] })
    for (let i = 1; i <= 8; i++) { await wait(16); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x1 - 6 * i, y: y2, id: 1 }, { x: x1 + 80 + 6 * i, y: y2, id: 2 }] }) }
    const during = await pos(page, '#board')
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await wait(600)
    const after = await pos(page, '#board'), z1b = await page.textContent('#fzPct')
    note('G12b', 'phone chart: a pinch begun while the chart is held stretched drops the stretch at once', /translate/.test(held.tf) && during.tf === '' && after.tf === '' && z1b !== z0b, { heldStretch: held.tf, duringPinch: during.tf, after: after.tf, zoom: [z0b, z1b] })
    await page.evaluate(() => document.getElementById('fzReset').click()); await wait(400)
  }
  /* G16 — End pressed mid-glide (a keyboard on an iPad): the chart goes to its right end and the glide stops (D989) */
  {
    for (let i = 0; i < 12 && (await page.textContent('#fzPct')) !== '200%'; i++) { await page.evaluate(() => document.getElementById('fzIn').click()); await wait(120) }
    await page.evaluate(() => { const b = document.getElementById('board'); b.scrollTop = 2000; b.scrollLeft = 0; b.focus({ preventScroll: true }) }); await wait(200)
    const e16 = await emptyAt(page, 0.1, 0.6)
    await finger(cdp, { x: e16.x, y: e16.y, dy: -200, steps: 5 }); await wait(40)
    const a16 = await pos(page, '#board')
    await page.keyboard.press('End'); await wait(80)
    const b16 = await pos(page, '#board'); await wait(600); const c16 = await pos(page, '#board')
    note('G16', 'chart: End pressed mid-glide goes to the right end and the glide stops there', b16.x > 0 && c16.x === b16.x && c16.y === b16.y && c16.tf === '', { beforeEnd: [a16.x, a16.y], rightAfter: [b16.x, b16.y], later: [c16.x, c16.y], maxX: c16.maxX })
    await page.evaluate(() => document.getElementById('fzReset').click()); await wait(400)
  }
  /* G16b — End pressed while the chart bounces at its top: the chart goes to its right end and stays (the spring does
     not write the old place back — the fix read's finding 3) */
  {
    for (let i = 0; i < 12 && (await page.textContent('#fzPct')) !== '200%'; i++) { await page.evaluate(() => document.getElementById('fzIn').click()); await wait(120) }
    await page.evaluate(() => { const b = document.getElementById('board'); b.scrollTop = 150; b.scrollLeft = 0; b.focus({ preventScroll: true }) }); await wait(200)
    const e16 = await emptyAt(page, 0.1, 0.4)
    await finger(cdp, { x: e16.x, y: e16.y, dy: 200, steps: 5 })
    let st16 = false
    for (let i = 0; i < 15 && !st16; i++) { await wait(10); st16 = /translate/.test((await pos(page, '#board')).tf) }
    await page.keyboard.press('End'); await wait(60)
    const b16 = await pos(page, '#board'); await wait(900); const c16 = await pos(page, '#board')
    note('G16b', 'chart: End pressed mid-bounce goes to the right end and stays', st16 && b16.x > 0 && c16.x === b16.x && c16.tf === '', { stretchedWhenPressed: st16, rightAfter: [b16.x, b16.y], later: [c16.x, c16.y], tf: c16.tf })
    await page.evaluate(() => document.getElementById('fzReset').click()); await wait(400)
  }
  /* G13 — a tap on an event with no glide running opens it, as always */
  await wait(400)
  const b13 = await ballMid(page)
  await tap(cdp, b13.x, b13.y); await wait(500)
  note('G13', 'phone chart: a tap on an event (nothing gliding) opens its pop-up', await popOpen(page), { ball: b13.id })
  await page.keyboard.press('Escape'); await wait(300)

  /* G14 — a drag that ends on an event does not open it (the old rule kept) */
  e = await emptyAt(page)
  await finger(cdp, { x: e.x, y: e.y, dx: 0, dy: -80, steps: 6, rest: 150 })
  await wait(400)
  note('G14', 'phone chart: a drag then lift opens nothing', !(await popOpen(page)), {})

  /* G15 — switching to Info mid-glide: no error, and the chart is where it was left on the way back */
  e = await emptyAt(page)
  await finger(cdp, { x: e.x, y: e.y, dy: -240, steps: 5 }); await wait(60)
  await page.evaluate(() => document.querySelector('#viewtabs button[data-view=info]').click()); await wait(700)
  const onInfo = await page.evaluate(() => document.querySelector('#page-tracker .tr-root').classList.contains('tab-info'))
  await page.evaluate(() => document.querySelector('#viewtabs button[data-view=flow]').click()); await wait(500)
  const f1 = await pos(page, '#board'); await wait(500); const f2 = await pos(page, '#board')
  note('G15', 'phone: a tab switch mid-glide leaves the chart still, nothing stretched', onInfo && f1.y === f2.y && f2.tf === '', { reachedInfo: onInfo, a: f1.y, b: f2.y, tf: f2.tf })

  /* F1 — a list inside Info that scrolls by itself (the Failures card's chips) keeps the finger: it scrolls, Info does
     not. Its failures are recorded through the marking pop-up's own "Fails +", as a person does. */
  await wait(400)
  { const z = await emptyAt(page); await tap(cdp, z.x, z.y); await wait(300) }   /* the test browser's flick quirk, as G5 */
  const bf = await ballMid(page)
  await tap(cdp, bf.x, bf.y); await wait(500)
  if (await popOpen(page)) {
    for (let i = 0; i < 24; i++) { await page.click('#popFailPlus'); await wait(40) }
    await page.keyboard.press('Escape'); await wait(400)
    await page.evaluate(() => document.querySelector('#viewtabs button[data-view=info]').click()); await wait(500)
    /* the list placed in view, 120px under Info's top (a point under the screen's foot would land on nothing) */
    const fc = await page.evaluate(() => { const c = document.getElementById('failChips'), sd = document.getElementById('side'); sd.scrollTop += c.getBoundingClientRect().top - sd.getBoundingClientRect().top - 120; const r = c.getBoundingClientRect(); return { range: c.scrollHeight - c.clientHeight, x: r.left + 6, y: r.top + r.height / 2, bottom: r.bottom } })
    const sideBefore = await pos(page, '#side'), chipsBefore = await page.evaluate(() => document.getElementById('failChips').scrollTop)
    await finger(cdp, { x: fc.x, y: fc.y, dy: -40, steps: 8, rest: 120 }); await wait(400)
    const sideAfter = await pos(page, '#side'), chipsAfter = await page.evaluate(() => document.getElementById('failChips').scrollTop)
    await shot(page, 'f1-phone-info-failures-list-scrolls-itself')
    note('F1', 'phone Info: a finger on the Failures list scrolls that list, not Info', fc.range > 10 && chipsAfter > chipsBefore && sideAfter.y === sideBefore.y,
      { listRange: fc.range, listBefore: chipsBefore, listAfter: chipsAfter, infoBefore: sideBefore.y, infoAfter: sideAfter.y })
    await page.evaluate(() => document.querySelector('#viewtabs button[data-view=flow]').click()); await wait(400)
  } else note('F1', 'phone Info: the Failures list keeps the finger', null, 'the marking pop-up did not open')

  /* ---- the Info tab ---- */
  await page.evaluate(() => document.querySelector('#viewtabs button[data-view=info]').click()); await wait(400)   /* not a finger tap: the test browser eats the first after a flick */
  /* demo data fits the phone at 100%: the panel's own + makes it taller than the screen */
  for (let i = 0; i < 4; i++) { await page.locator('#sideZoomCtl button', { hasText: '+' }).click(); await wait(80) }
  await wait(300)
  const sd = await box(page, '#side')
  const i0 = await pos(page, '#side')
  /* I1 — a flick glides on Info too */
  const ex = sd.x + 12, ey = sd.y + sd.h * 0.6
  await page.evaluate(() => { document.getElementById('side').scrollTop = 0 })
  await finger(cdp, { x: ex, y: ey, dy: -60, steps: 4 })
  const il = await pos(page, '#side'); await wait(150); const im = await pos(page, '#side'); await shot(page, 'i1-phone-info-gliding')
  await wait(1500); const ir = await pos(page, '#side')
  note('I1', 'phone Info: a flick carries on after the lift', im.y > il.y || ir.y > il.y, { range: i0.maxY, atLift: il.y, at150: im.y, rest: ir.y, tf: ir.tf })
  /* I2 — Info bounces at its end and settles */
  note('I2', 'phone Info: at the end it settles on the end with nothing stretched', (Math.abs(ir.y - ir.maxY) <= 1 || ir.y < ir.maxY) && ir.tf === '', { rest: ir.y, max: ir.maxY, tf: ir.tf })
  /* I3 — a touch on a button while Info glides stops it and the button does not act (D986). The button is one the
     finger provably lands on (the zoom bar floats over the foot of Info: a fixed point can land on its "+"); whether
     it acted is read by a counter on the button itself, which a press taken before it never reaches. */
  const sideButton = () => page.evaluate(() => {
    const s = document.getElementById('side').getBoundingClientRect()
    for (const b of document.querySelectorAll('#side button')) {
      const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2
      if (y < s.top + 30 || y > s.bottom - 90 || !r.width) continue
      const hit = document.elementFromPoint(x, y)
      if (hit && (hit === b || b.contains(hit))) { b.__walkClicks = b.__walkClicks || 0; if (!b.__walkWired) { b.__walkWired = true; b.addEventListener('click', () => b.__walkClicks++) } b.dataset.walk = '1'; return { x, y, text: b.textContent.trim().slice(0, 24) } }
    }
    return null
  })
  const clicksOn = () => page.evaluate(() => { const b = document.querySelector('#side button[data-walk="1"]'); return b ? b.__walkClicks : -1 })
  const closeAll = async () => { await page.keyboard.press('Escape'); await wait(250); await page.keyboard.press('Escape'); await wait(250) }
  await page.evaluate(() => { document.getElementById('side').scrollTop = 0 }); await wait(200)
  await finger(cdp, { x: ex, y: ey, dy: -50, steps: 4 }); await wait(30)
  const g3a = await pos(page, '#side'); await wait(20); const g3b = await pos(page, '#side')
  const btn = await sideButton()
  if (btn && g3b.y > g3a.y) {
    await tap(cdp, btn.x, btn.y); await wait(80); const h1 = await pos(page, '#side'); await wait(400); const h2 = await pos(page, '#side')
    const c3 = await clicksOn()
    const focused = await page.evaluate(() => document.activeElement === document.querySelector('#side button[data-walk="1"]'))
    await shot(page, 'i3-phone-info-touch-stops-nothing-opens')
    note('I3', 'phone Info: a touch on a button mid-glide stops the glide; the button gets no press', c3 === 0 && !focused && Math.abs(h2.y - h1.y) <= 1, { button: btn.text, tookFocus: focused, glidingBefore: [g3a.y, g3b.y], justAfter: h1.y, later: h2.y, buttonPresses: c3 })
    /* I4 — the next tap presses it as normal (a throwaway tap first: the test browser's flick quirk, as G5) */
    await tap(cdp, ex, ey); await wait(300)
    const btn2 = await page.evaluate(() => { const b = document.querySelector('#side button[data-walk="1"]'); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
    await tap(cdp, btn2.x, btn2.y); await wait(500)
    const c4 = await clicksOn()
    await shot(page, 'i4-phone-info-next-tap-presses')
    note('I4', 'phone Info: the next tap on it presses it as normal', c4 === 1, { button: btn.text, buttonPresses: c4 })
    await closeAll()
  } else note('I3', 'phone Info: a touch on a button mid-glide', null, { why: btn ? 'not gliding when the button was found' : 'no button the finger could land on', glidingBefore: [g3a.y, g3b.y] })
  /* I3m — the same by a press the test browser does not eat (a mouse) */
  await page.evaluate(() => { document.getElementById('side').scrollTop = 0; document.querySelectorAll('#side button[data-walk]').forEach(b => { b.removeAttribute('data-walk') }) }); await wait(200)
  await finger(cdp, { x: ex, y: ey, dy: -50, steps: 4 }); await wait(30)
  const ia = await pos(page, '#side'); await wait(20); const ib = await pos(page, '#side')
  const btn3 = await sideButton()
  if (btn3 && ib.y > ia.y) {
    const before = await clicksOn()
    await page.mouse.click(btn3.x, btn3.y); await wait(500)
    const after = await clicksOn()
    note('I3m', 'phone Info: a press on a button mid-glide (mouse) is taken; the button gets none', after === before, { button: btn3.text, glidingBefore: [ia.y, ib.y], pressesBefore: before, pressesAfter: after })
    await closeAll()
  } else note('I3m', 'phone Info: a mouse press mid-glide', null, { glidingBefore: [ia.y, ib.y] })
  /* R1 — a window open over Info (the lull calendar) never moves while Info stretches under a finger on its backdrop
     (the code read's finding 1) */
  await page.evaluate(() => { const s = document.getElementById('side'); s.scrollTop = s.scrollHeight }); await wait(200)
  await page.evaluate(() => document.getElementById('setLullBtn').click()); await wait(500)
  const lc = () => page.evaluate(() => { const c = document.querySelector('.lullcal'); if (!c) return null; const r = c.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top) } })
  const lc0 = await lc()
  if (lc0) {
    const bk = await page.evaluate(() => { const c = document.querySelector('.lullcal').getBoundingClientRect(); return { x: 12, y: Math.min(innerHeight - 20, c.bottom + 30) } })
    await finger(cdp, { x: bk.x, y: bk.y, dy: -60, steps: 6, lift: false }); await wait(40)
    const lc1 = await lc(); await shot(page, 'r1-phone-info-lull-window-held-still')
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await wait(700)
    const lc2 = await lc()
    note('R1', 'phone Info: the lull calendar stays put while a finger drags its backdrop', !!lc1 && lc1.x === lc0.x && lc1.y === lc0.y && (!lc2 || (lc2.x === lc0.x && lc2.y === lc0.y)), { before: lc0, during: lc1, after: lc2 })
    await page.keyboard.press('Escape'); await wait(300)
    if (await page.evaluate(() => !!document.querySelector('.lullcal'))) { await page.evaluate(() => document.querySelector('.lullback')?.click()); await wait(300) }
  } else note('R1', 'phone Info: the lull calendar stays put', null, 'the lull calendar did not open')

  /* R3 — a long press that stops Info's glide leaves that chip's next tap working (the code read's finding 3) */
  const chipAt = () => page.evaluate(() => { const sd = document.getElementById('side').getBoundingClientRect(); for (const c of document.querySelectorAll('#side .evchip')) { const r = c.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2; if (y > sd.top + 30 && y < sd.bottom - 90 && x > 0 && x < innerWidth) { const h = document.elementFromPoint(x, y); if (h && (h === c || c.contains(h))) return { x, y, id: c.dataset.ev } } } return null })
  await page.evaluate(() => { document.getElementById('side').scrollTop = 0 }); await wait(200)
  await finger(cdp, { x: ex, y: ey, dy: -50, steps: 4 }); await wait(20)
  const ch = await chipAt()
  if (ch) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: ch.x, y: ch.y, id: 4 }] }); await wait(650)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await wait(400)
    { const z = { x: ex, y: ey }; await tap(cdp, z.x, z.y); await wait(400) }   /* the test browser's flick quirk, as G5; also puts the bubble away */
    const ch2 = await chipAt()
    await tap(cdp, ch2.x, ch2.y); await wait(700)
    const jumped = await page.evaluate(() => document.querySelector('#page-tracker .tr-root').classList.contains('tab-flow'))
    await shot(page, 'r3-phone-info-chip-after-long-press-stop')
    note('R3', 'phone Info: after a long press stopped the glide, one tap on that chip takes you to its event', jumped, { chip: ch.id, wentToChart: jumped })
    if (jumped) { await page.evaluate(() => document.querySelector('#viewtabs button[data-view=info]').click()); await wait(400) }
  } else note('R3', 'phone Info: chip after a long-press stop', null, 'no chip the finger could land on')

  /* R5 — a finger that moves a few pixels on a chip and lifts opens nothing: its late click is taken (finding 5) */
  { await tap(cdp, ex, ey); await wait(400) }   /* no glide running, and the test browser's quirk cleared */
  await page.evaluate(() => { document.getElementById('side').scrollTop = 60 }); await wait(200)
  const c5 = await chipAt()
  if (c5) {
    await finger(cdp, { x: c5.x, y: c5.y, dy: -7, steps: 3, rest: 80 }); await wait(600)
    const onInfo5 = await page.evaluate(() => document.querySelector('#page-tracker .tr-root').classList.contains('tab-info'))
    note('R5', 'phone Info: a 7px drag that starts on a chip opens nothing', onInfo5, { chip: c5.id, stillOnInfo: onInfo5 })
    if (!onInfo5) { await page.evaluate(() => document.querySelector('#viewtabs button[data-view=info]').click()); await wait(400) }
  } else note('R5', 'phone Info: a short drag on a chip', null, 'no chip in view')

  for (let i = 0; i < 4; i++) { await page.locator('#sideZoomCtl button', { hasText: '−' }).click(); await wait(80) }
  await page.evaluate(() => document.querySelector('#viewtabs button[data-view=flow]').click()); await wait(300)

  note('E1', 'phone: no console error, page error or failed request', errors.length === 0, errors.slice(0, 5))
  await browser.close()
}

/* ================= PHONE ON ITS SIDE (a short screen) ================= */
{
  const { browser, page, errors } = await open({ size: { width: 844, height: 390 }, who: 'a', touch: true })
  const cdp = await page.context().newCDPSession(page)
  await page.waitForSelector('#flowSvg .ball'); await wait(600)
  await page.evaluate(() => { document.getElementById('board').scrollTop = 800 }); await wait(150)
  const e = await emptyAt(page, 0.1, 0.5)
  if (e) {
    await finger(cdp, { x: e.x, y: e.y, dy: -120, steps: 4 })
    const l = await pos(page, '#board'); await wait(150); const m = await pos(page, '#board'); await shot(page, 's1-short-screen-gliding'); await wait(2000); const r = await pos(page, '#board')
    note('S1', 'phone on its side: the chart glides and stops', m.y > l.y && r.tf === '', { atLift: l.y, at150: m.y, rest: r.y })
  } else note('S1', 'phone on its side: the chart glides', null, 'no empty point on the chart')
  note('E2', 'short screen: no errors', errors.length === 0, errors.slice(0, 5))
  await browser.close()
}

/* ================= iPAD (Info half beside the chart) ================= */
{
  const { browser, page, errors } = await open({ size: { width: 1180, height: 820 }, who: 'a', touch: true })   /* an iPad on its side: Info beside the chart */
  const cdp = await page.context().newCDPSession(page)
  await page.waitForSelector('#flowSvg .ball'); await wait(600)
  /* the Info half's own + (shown beside the chart) makes it taller than its box; where the layout has no + in view, as is */
  if (await page.locator('#szIn').isVisible()) { for (let i = 0; i < 4; i++) { await page.click('#szIn'); await wait(80) } }
  await wait(300)
  const sd = await box(page, '#side'), s0 = await pos(page, '#side')
  if (s0.maxY > 50 && sd.w > 0) {
    await finger(cdp, { x: sd.x + 14, y: sd.y + sd.h * 0.6, dy: -80, steps: 4 })
    const l = await pos(page, '#side'); await wait(150); const m = await pos(page, '#side'); await shot(page, 'p1-ipad-info-half-gliding'); await wait(2000); const r = await pos(page, '#side')
    note('P1', 'iPad: the Info half glides beside the chart', m.y > l.y && r.tf === '', { range: s0.maxY, atLift: l.y, at150: m.y, rest: r.y })
  } else note('P1', 'iPad: the Info half glides', null, { range: s0.maxY, why: 'Info fits its box at this size' })
  const e = await emptyAt(page, 0.2, 0.5)
  await page.evaluate(() => { document.getElementById('board').scrollTop = 600 }); await wait(150)
  await finger(cdp, { x: e.x, y: e.y, dy: -200, steps: 5 })
  const l = await pos(page, '#board'); await wait(150); const m = await pos(page, '#board'); await shot(page, 'p2-ipad-chart-gliding'); await wait(2500); const r = await pos(page, '#board')
  note('P2', 'iPad: the chart glides', m.y > l.y && r.tf === '', { atLift: l.y, at150: m.y, rest: r.y })
  note('E3', 'iPad: no errors', errors.length === 0, errors.slice(0, 5))
  await browser.close()
}

/* ================= DESKTOP, a mouse (D988) ================= */
{
  const { browser, page, errors } = await open({ size: DESK, who: 'a' })
  await page.waitForSelector('#flowSvg .ball'); await wait(600)
  await page.evaluate(() => { document.getElementById('board').scrollTop = 600 }); await wait(150)
  const e = await emptyAt(page, 0.1, 0.5)
  const a = await pos(page, '#board')
  await page.mouse.move(e.x, e.y); await page.mouse.down()
  for (let i = 1; i <= 5; i++) { await page.mouse.move(e.x, e.y - 50 * i); await wait(16) }
  await page.mouse.up()
  const l = await pos(page, '#board'); await wait(600); const r = await pos(page, '#board')
  note('D1', 'desktop: a fast mouse drag stops where it is let go — no glide', l.y === r.y && Math.abs((l.y - a.y) - 250) <= 3, { start: a.y, atLift: l.y, later: r.y })
  /* D2 — a mouse dragged past the top never stretches */
  await page.evaluate(() => { document.getElementById('board').scrollTop = 30 }); await wait(150)
  const e2 = await emptyAt(page, 0.1, 0.4)
  await page.mouse.move(e2.x, e2.y); await page.mouse.down()
  for (let i = 1; i <= 6; i++) { await page.mouse.move(e2.x, e2.y + 30 * i); await wait(16) }
  const held = await pos(page, '#board')
  await shot(page, 'd2-desktop-mouse-past-top-no-stretch')
  await page.mouse.up(); await wait(400); const r2 = await pos(page, '#board')
  note('D2', 'desktop: a mouse dragged past the top does not stretch', held.y === 0 && held.tf === '' && r2.tf === '', { held: held.y, tf: held.tf })
  /* D3 — the mouse on the Info half: the same */
  const sd = await box(page, '#side'), s0 = await pos(page, '#side')
  if (s0.maxY > 50) {
    await page.mouse.move(sd.x + 12, sd.y + sd.h * 0.7); await page.mouse.down()
    for (let i = 1; i <= 4; i++) { await page.mouse.move(sd.x + 12, sd.y + sd.h * 0.7 - 40 * i); await wait(16) }
    await page.mouse.up(); const ls = await pos(page, '#side'); await wait(500); const rs = await pos(page, '#side')
    note('D3', 'desktop: a mouse drag on the Info half stops where let go', ls.y === rs.y && ls.y > 0, { atLift: ls.y, later: rs.y })
  } else note('D3', 'desktop Info half mouse drag', null, { range: s0.maxY })
  /* R4 — a mouse drag that starts on the Failures card's list still moves the Info half, as before (finding 4) */
  {
    const b4 = await ballMid(page)
    await page.mouse.click(b4.x, b4.y); await wait(500)
    if (await popOpen(page)) {
      for (let i = 0; i < 40; i++) { await page.click('#popFailPlus'); await wait(25) }
      await page.keyboard.press('Escape'); await wait(400)
      const fl = await page.evaluate(() => { const c = document.getElementById('failChips'), sd = document.getElementById('side'); sd.scrollTop += c.getBoundingClientRect().top - sd.getBoundingClientRect().top - 120; const r = c.getBoundingClientRect(); return { range: c.scrollHeight - c.clientHeight, x: r.left + 4, y: r.top + r.height / 2 } })
      const s0 = await pos(page, '#side')
      await page.mouse.move(fl.x, fl.y); await page.mouse.down()
      /* downward: the Info half sits 120px above the list's top, so it has room to come back up */
      for (let i = 1; i <= 4; i++) { await page.mouse.move(fl.x, fl.y + 15 * i); await wait(16) }
      await page.mouse.up(); await wait(300)
      const s1 = await pos(page, '#side')
      note('R4', 'desktop: a mouse drag on the Failures list moves the Info half, as before', fl.range > 10 && s0.y - s1.y >= 40, { listRange: fl.range, infoBefore: s0.y, infoAfter: s1.y, infoMax: s0.maxY })
    } else note('R4', 'desktop Failures list mouse drag', null, 'the pop-up did not open')
  }
  /* D4 — a click on an event still opens it after the change */
  const b = await ballMid(page)
  await page.mouse.click(b.x, b.y); await wait(500)
  note('D4', 'desktop: a click on an event opens its pop-up', await popOpen(page), { ball: b.id })
  await page.keyboard.press('Escape'); await wait(300)
  /* D5 — Edit chart layout: a finger is not this walk's; a mouse drag on its canvas pans as before and does not glide */
  await page.click('#sylMenuBtn'); await wait(150); await page.click('#arrangeBtn')
  await wait(700)
  const arr = await page.evaluate(() => !!document.querySelector('#flowSvg.arrange'))
  if (arr) {
    const vb = () => page.evaluate(() => document.getElementById('viewport').getAttribute('transform'))
    const sv = await box(page, '#flowSvg'), v0 = await vb()
    await page.mouse.move(sv.x + 30, sv.y + sv.h - 40); await page.mouse.down()
    for (let i = 1; i <= 5; i++) { await page.mouse.move(sv.x + 30, sv.y + sv.h - 40 - 30 * i); await wait(16) }
    await page.mouse.up(); const v1 = await vb(); await wait(500); const v2 = await vb()
    await shot(page, 'd5-desktop-edit-layout-pans-no-glide')
    note('D5', 'desktop Edit chart layout: the canvas pans and stops at the release', v1 !== v0 && v1 === v2, { before: v0, atRelease: v1, later: v2 })
    await page.click('#sylMenuBtn'); await wait(150); await page.click('#arrangeBtn'); await wait(500)
  } else note('D5', 'Edit chart layout', null, 'could not open Edit chart layout')
  note('E4', 'desktop: no errors', errors.length === 0, errors.slice(0, 5))
  await browser.close()
}

save('walk', rows)
const f = rows.filter(r => r.pass === false).length, n = rows.filter(r => r.pass === null).length
console.log(`\n${rows.length - f - n} passed, ${f} failed, ${n} not walked`)
process.exit(f ? 1 : 0)
