/* [TRK-CHART-FPS] the walk — the Tracker's chart and Info half scrolled by the phone itself, the pinch stretched as a
   picture (owner D992, 18 Oct 26; D991: speed is part of how good the app feels).
   Real fingers through Chromium's touch input (CDP Input.dispatchTouchEvent — the pointer and touch events a phone
   sends) and a real mouse, on the production bundle. Each step prints PASS / FAIL with the values it judged; the pictures
   go to FPS_SHOTS (default docs/img/handpass/2026-10-18-trk-chart-fps/walk), the results to docs/handpass/parts/trk-fps/.
   This test browser makes no glide from scripted fingers (walk-scripts.md §4): the phone's own glide, bounce and
   touch-to-stop are on his look card, not here.
     HP_URL     the preview serving THIS checkout's dist (required)
     FPS_SHOTS  a re-walk's own picture folder */
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, rmSync, readdirSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_SHOTS ||= process.env.FPS_SHOTS || resolve(HERE, '../../docs/img/handpass/2026-10-18-trk-chart-fps/walk')
process.env.HP_OUT ||= resolve(HERE, '../../docs/handpass/parts/trk-fps')
mkdirSync(process.env.HP_SHOTS, { recursive: true })
for (const f of readdirSync(process.env.HP_SHOTS)) if (f.endsWith('.png')) rmSync(resolve(process.env.HP_SHOTS, f))
/* THE BUILD IT DRIVES IS PROVED FIRST (walk-scripts.md §1): the address must be given, and it must serve this checkout's dist */
if (!process.env.HP_URL) { console.error('HP_URL not set — give the address of the preview serving the dist of THIS checkout'); process.exit(2) }
{
  const served = ((await (await fetch(process.env.HP_URL + '/')).text()).match(/assets\/index-[^"']+\.js/) || [])[0]
  const local = readdirSync(resolve(HERE, '../../dist/assets')).find(f => /^index-.*\.js$/.test(f))
  if (!served || served !== 'assets/' + local) { console.error(`the preview at ${process.env.HP_URL} serves ${served}, this checkout built assets/${local} — not this build`); process.exit(2) }
}
const { open, shot, save, PHONE, DESK } = await import('./trk-lib.mjs')
console.log('trk-fps-walk v2 —', process.env.HP_URL)

const rows = []
const note = (id, name, pass, detail) => { rows.push({ id, name, pass, detail }); console.log(`${pass === null ? 'NOT WALKED' : pass ? 'PASS' : 'FAIL'}  ${id} ${name}  ${JSON.stringify(detail)}`) }
const wait = ms => new Promise(r => setTimeout(r, ms))
const T = (cdp, type, touchPoints) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints })
/* one finger: down, moved by (dx, dy) in `steps` moves 16ms apart, held `rest` ms, lifted */
async function finger(cdp, { x, y, dx = 0, dy = 0, steps = 12, rest = 120, id = 1 }) {
  await T(cdp, 'touchStart', [{ x, y, id }])
  for (let i = 1; i <= steps; i++) { await wait(16); await T(cdp, 'touchMove', [{ x: x + dx * i / steps, y: y + dy * i / steps, id }]) }
  if (rest) await wait(rest)
  await T(cdp, 'touchEnd', [])
}
const tap = async (cdp, x, y) => { await T(cdp, 'touchStart', [{ x, y, id: 9 }]); await wait(60); await T(cdp, 'touchEnd', []) }
const sc = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); return { x: Math.round(e.scrollLeft), y: Math.round(e.scrollTop), maxY: e.scrollHeight - e.clientHeight } }, sel)
const wrap = page => page.evaluate(() => { const w = document.querySelector('#board .flowwrap'); return { zoom: w.style.zoom, tf: w.style.transform } })
const popOpen = page => page.evaluate(() => !!document.getElementById('pop'))
const ballAt = (page, id) => page.evaluate(id => { const g = document.querySelector(`#flowSvg .ball[data-id="${id}"]`); if (!g) return null; const r = g.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), w: Math.round(r.width) } }, id)
/* a point on the chart's empty space near (fx, fy) of the board's box */
const emptyAt = (page, fx = 0.15, fy = 0.5) => page.evaluate(([fx, fy]) => {
  const b = document.getElementById('board').getBoundingClientRect(), bot = Math.min(b.bottom, innerHeight)
  for (const gx of [fx, 0.05, 0.3, 0.6, 0.9]) for (let dy = 0; dy < 200; dy += 10) for (const s of [1, -1]) {
    const x = b.left + Math.min(b.width, innerWidth - b.left) * gx, y = b.top + (bot - b.top) * fy + s * dy
    const t = document.elementFromPoint(x, y)
    if (t && document.getElementById('board').contains(t) && !t.closest('.ball') && !t.closest('.edgehit')) return { x, y }
  }
  return null
}, [fx, fy])
/* the ball nearest the middle of the board, well inside it */
const ballMid = (page, inset = 140) => page.evaluate(inset => {
  const bd = document.getElementById('board').getBoundingClientRect(), bot = Math.min(bd.bottom, innerHeight)
  let best = null
  for (const g of document.querySelectorAll('#flowSvg .ball')) {
    const r = g.getBoundingClientRect(); if (!r.width || r.top < bd.top + inset || r.bottom > bot - inset || r.left < bd.left + 10 || r.right > Math.min(bd.right, innerWidth) - 10) continue
    const d = Math.hypot(r.top + r.height / 2 - (bd.top + bot) / 2, r.left + r.width / 2 - (bd.left + Math.min(bd.right, innerWidth)) / 2); if (!best || d < best.d) best = { id: g.dataset.id, x: r.left + r.width / 2, y: r.top + r.height / 2, d }
  }
  return best
}, inset)
/* two fingers about (cx, cy): from d0 apart to d1, the pair sliding (dx, dy); `lift: false` leaves them down */
async function pinch(cdp, { cx, cy, d0, d1, dx = 0, dy = 0, steps = 14, lift = true }) {
  const two = (d, i) => [{ x: cx - d / 2 + dx * i / steps, y: cy + dy * i / steps, id: 2 }, { x: cx + d / 2 + dx * i / steps, y: cy + dy * i / steps, id: 3 }]
  await T(cdp, 'touchStart', two(d0, 0))
  for (let i = 1; i <= steps; i++) { await wait(16); await T(cdp, 'touchMove', two(d0 + (d1 - d0) * i / steps, i)) }
  if (lift) { await T(cdp, 'touchEnd', []); await wait(400) }
  return { x: cx + dx, y: cy + dy }
}
const zoomPct = page => page.textContent('#fzPct')

/* ================= PHONE ================= */
{
  const { browser, page, errors } = await open({ size: PHONE, who: 'a', touch: true })
  const cdp = await page.context().newCDPSession(page)
  await page.waitForSelector('#flowSvg .ball'); await wait(600)
  /* W1 — a finger drag scrolls the chart, by the browser's own scrolling: nothing of the app's draws it */
  await page.evaluate(() => { document.getElementById('board').scrollTop = 1500 }); await wait(250)
  const ta = await page.evaluate(() => getComputedStyle(document.getElementById('board')).touchAction)
  await shot(page, 'w1-phone-chart-before-drag')
  { const z = await emptyAt(page), a = await sc(page, '#board'); await finger(cdp, { x: z.x, y: z.y, dy: -260 }); await wait(250); const b = await sc(page, '#board')
    await shot(page, 'w1-phone-chart-after-drag')
    note('W1', 'phone chart: a finger drag scrolls it by the phone\'s own scrolling, nothing of the app\'s left on it', ta === 'pan-x pan-y' && b.y - a.y > 180 && (await wrap(page)).tf === '', { touchAction: ta, from: a.y, to: b.y }) }
  /* W2 — a pinch out: mid-pinch the chart is a stretched picture (its zoom unchanged) with the ball under the fingers;
     at the lift it is laid out at the new zoom, the ball still under where the fingers ended (order §7.8) */
  { const s = await ballMid(page), w0 = await wrap(page), p0 = await zoomPct(page)
    const end = await pinch(cdp, { cx: s.x, cy: s.y, d0: 60, d1: 220, dx: 30, dy: -20, lift: false })
    const mid = await ballAt(page, s.id), wm = await wrap(page)
    await shot(page, 'w2-phone-pinch-out-mid-picture')
    await T(cdp, 'touchEnd', []); await wait(500)
    const after = await ballAt(page, s.id), w1 = await wrap(page), p1 = await zoomPct(page)
    await shot(page, 'w2-phone-pinch-out-after-lift')
    const offMid = Math.hypot(mid.x - end.x, mid.y - end.y), offEnd = Math.hypot(after.x - end.x, after.y - end.y)
    note('W2', 'phone pinch out: a stretched picture while the fingers move, laid out at the lift, the ball under the fingers both times',
      wm.zoom === w0.zoom && /scale\(/.test(wm.tf) && offMid <= 6 && w1.tf === '' && +w1.zoom > +w0.zoom && offEnd <= 6 && p1 !== p0,
      { ball: s.id, fingersEnd: end, mid, after, offMid: Math.round(offMid), offEnd: Math.round(offEnd), zoom: [p0, p1], midWrap: wm }) }
  /* W3 — a pinch in keeps the ball under the fingers too */
  { const s = await ballMid(page, 100), p0 = await zoomPct(page)
    const end = await pinch(cdp, { cx: s.x, cy: s.y, d0: 220, d1: 90, dx: -20, dy: 25 })
    const after = await ballAt(page, s.id), off = Math.hypot(after.x - end.x, after.y - end.y)
    await shot(page, 'w3-phone-pinch-in-after-lift')
    note('W3', 'phone pinch in: the ball stays under the fingers', off <= 6 && (await zoomPct(page)) !== p0 && (await wrap(page)).tf === '', { ball: s.id, fingersEnd: end, after, off: Math.round(off), zoom: [p0, await zoomPct(page)] }) }
  /* W4 — after a pinch the finger left down does nothing until it lifts (D134); the second finger lifts by leaving the move */
  { const s = await ballMid(page, 100)
    await pinch(cdp, { cx: s.x, cy: s.y, d0: 80, d1: 160, lift: false })
    await T(cdp, 'touchMove', [{ x: s.x + 80, y: s.y, id: 3 }]); await wait(300)
    const y0 = await sc(page, '#board')
    for (let i = 1; i <= 10; i++) { await wait(16); await T(cdp, 'touchMove', [{ x: s.x + 80, y: s.y - i * 25, id: 3 }]) }
    const y1 = await sc(page, '#board'); await T(cdp, 'touchEnd', []); await wait(400)
    note('W4', 'phone: after a pinch the finger left down does nothing until it lifts (D134)', y1.y === y0.y && y1.x === y0.x, { before: y0, after: y1 }) }
  /* W5 — the next one-finger drag scrolls again, and a tap on an event opens its pop-up */
  { const z = await emptyAt(page), a = await sc(page, '#board'); await finger(cdp, { x: z.x, y: z.y, dy: -200 }); await wait(250); const b = await sc(page, '#board')
    note('W5', 'phone: the next finger drag after a pinch scrolls again', Math.abs(b.y - a.y) > 120, { from: a.y, to: b.y }) }
  await page.evaluate(() => document.getElementById('fzReset').click()); await wait(500)
  { const s = await ballMid(page); await tap(cdp, s.x, s.y); await wait(500)
    const p = await popOpen(page); await shot(page, 'w5-phone-tap-opens-event')
    note('W5b', 'phone: a tap on an event opens its pop-up', p, { ball: s.id })
    await page.keyboard.press('Escape'); await wait(300) }
  /* W6 — a drag that starts on an event scrolls the chart and opens nothing */
  { const s = await ballMid(page), a = await sc(page, '#board'); await finger(cdp, { x: s.x, y: s.y, dy: -200 }); await wait(500); const b = await sc(page, '#board')
    note('W6', 'phone: a drag that starts on an event scrolls the chart and opens nothing', b.y - a.y > 120 && !(await popOpen(page)), { ball: s.id, from: a.y, to: b.y })
    if (await popOpen(page)) { await page.keyboard.press('Escape'); await wait(300) } }
  /* W7 — the app's own moves land right straight after a finger scroll (stopGlide runs on a box that has just scrolled):
     the zoom's + keeps the middle of the view, a search lands its event in view */
  { const z = await emptyAt(page); await finger(cdp, { x: z.x, y: z.y, dy: -200, rest: 0 })
    const mid0 = await page.evaluate(() => { const bd = document.getElementById('board'), r = bd.getBoundingClientRect(); const x = r.left + bd.clientWidth / 2, y = r.top + bd.clientHeight / 2; let best = null; for (const g of document.querySelectorAll('#flowSvg .ball')) { const q = g.getBoundingClientRect(), d = Math.hypot(q.left + q.width / 2 - x, q.top + q.height / 2 - y); if (!best || d < best.d) best = { id: g.dataset.id, d } } return best })
    await page.evaluate(() => document.getElementById('fzIn').click()); await wait(400)
    const mid1 = await page.evaluate(id => { const bd = document.getElementById('board'), r = bd.getBoundingClientRect(), q = document.querySelector(`#flowSvg .ball[data-id="${id}"]`).getBoundingClientRect(); return { inView: q.top >= r.top && q.bottom <= Math.min(r.bottom, innerHeight) } }, mid0.id)
    note('W7', 'phone: the zoom\'s + pressed straight after a finger scroll keeps the middle of the view', mid1.inView && (await page.evaluate(() => document.getElementById('board').style.overflow)) === '', { ball: mid0.id, ...mid1 }) }
  await page.evaluate(() => document.getElementById('fzReset').click()); await wait(500)
  /* W8 — the Info half: a finger drag scrolls it by the phone's own scrolling */
  await page.evaluate(() => document.querySelector('#viewtabs button[data-view=info]').click()); await wait(500)
  /* a world whose Info half fits its screen is zoomed in by the half's own +, as a person would, until it can scroll */
  for (let i = 0; i < 6 && await page.evaluate(() => { const d = document.getElementById('side'); return d.scrollHeight - d.clientHeight < 300 }); i++) { await page.click('#szIn'); await wait(150) }
  { const ta2 = await page.evaluate(() => getComputedStyle(document.getElementById('side')).touchAction)
    const r = await page.evaluate(() => { const s = document.getElementById('side').getBoundingClientRect(); return { x: s.left + s.width - 20, y: s.top + Math.min(s.height, innerHeight - s.top) * 0.6 } })
    const zi = await page.evaluate(() => +document.getElementById('side').style.zoom || 1)
    const a = await sc(page, '#side'); await finger(cdp, { x: r.x, y: r.y, dy: -240 }); await wait(250); const b = await sc(page, '#side')
    await shot(page, 'w8-phone-info-after-drag')
    note('W8', 'phone Info: a finger drag scrolls it by the phone\'s own scrolling', ta2 === 'pan-x pan-y' && a.maxY > 100 && (b.y - a.y) * zi > 150, { touchAction: ta2, from: a.y, to: b.y, room: a.maxY, zoom: zi, screenTravel: Math.round((b.y - a.y) * zi) }) }
  /* W9 — the Info half's event chip: a tap jumps to the Flow chart and lands that event in view */
  { await page.evaluate(() => { document.getElementById('side').scrollTop = 0 }); await wait(200)
    const c = await page.evaluate(() => { const ch = [...document.querySelectorAll('.c-next .branch')].pop(); if (!ch) return null; const r = ch.getBoundingClientRect(); return { id: ch.textContent.trim(), x: r.left + r.width / 2, y: r.top + r.height / 2 } })
    if (c) { await tap(cdp, c.x, c.y); await wait(700)
      const w = await page.evaluate(id => { const g = document.querySelector(`#flowSvg .ball[data-id="${id}"]`), bd = document.getElementById('board').getBoundingClientRect(); const r = g && g.getBoundingClientRect(); return { flow: document.querySelector('#page-tracker .tr-root').classList.contains('tab-flow'), inView: !!r && r.top >= bd.top && r.bottom <= Math.min(bd.bottom, innerHeight) } }, c.id)
      await shot(page, 'w9-phone-chip-tap-lands')
      note('W9', 'phone Info: a tap on an event chip lands that event on the chart', w.flow && w.inView, { chip: c.id, ...w }) }
    else note('W9', 'phone Info chip', null, 'no Next-event chip') }
  /* W10 — Edit chart layout keeps its own: a finger pans its canvas (not the page), a pinch zooms its view */
  await page.evaluate(() => { const m = document.getElementById('sylMenuBtn'); m && m.click() }); await wait(200)
  await page.evaluate(() => { const a = document.getElementById('arrangeBtn'); a && a.click() }); await wait(800)
  if (await page.evaluate(() => !!document.querySelector('#flowSvg.arrange'))) {
    const vb = () => page.evaluate(() => document.getElementById('viewport').getAttribute('transform'))
    const sv = await page.evaluate(() => { const r = document.getElementById('flowSvg').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: Math.min(r.height, innerHeight - r.top) } })
    const spot = await page.evaluate(sv => { for (let y = sv.y + sv.h * 0.7; y > sv.y + 40; y -= 12) for (const fx of [0.1, 0.5, 0.9]) { const x = sv.x + sv.w * fx, t = document.elementFromPoint(x, y); if (t && t.closest('#flowSvg') && !t.closest('.ball') && !t.closest('.edgehit') && !t.closest('.linehandle') && !t.closest('.endhandle')) return { x, y } } return null }, sv)
    if (spot) {
      const v0 = await vb(); await finger(cdp, { x: spot.x, y: spot.y, dx: 40, dy: -80 }); await wait(300); const v1 = await vb()
      await pinch(cdp, { cx: spot.x, cy: spot.y - 80, d0: 60, d1: 160 }); const v2 = await vb()
      await shot(page, 'w10-phone-edit-layout-pan-and-pinch')
      note('W10', 'phone Edit chart layout: a finger pans its canvas and a pinch zooms its view, as before', v1 !== v0 && v2 !== v1 && (await wrap(page)).tf === '', { v0, v1, v2 })
    } else note('W10', 'phone Edit chart layout', null, 'no empty canvas')
    await page.evaluate(() => { const m = document.getElementById('sylMenuBtn'); m && m.click() }); await wait(200)
    await page.evaluate(() => { const a = document.getElementById('arrangeBtn'); a && a.click() }); await wait(600)
  } else note('W10', 'phone Edit chart layout', null, 'could not open Edit chart layout')
  note('E1', 'phone: no errors', errors.length === 0, errors.slice(0, 5))
  await browser.close()
}

/* ================= A PHONE ON ITS SIDE (a short screen) ================= */
{
  const { browser, page, errors } = await open({ size: { width: 844, height: 390 }, who: 'a', touch: true })
  const cdp = await page.context().newCDPSession(page)
  await page.waitForSelector('#flowSvg .ball'); await wait(600)
  const z = await emptyAt(page, 0.15, 0.6), a = await sc(page, '#board')
  if (z) { await finger(cdp, { x: z.x, y: z.y, dy: -120 }); await wait(250) }
  const b = await sc(page, '#board'); await shot(page, 's1-short-screen-after-drag')
  note('S1', 'a phone on its side: a finger drag scrolls the chart', !!z && b.y - a.y > 60, { from: a.y, to: b.y })
  note('E2', 'short screen: no errors', errors.length === 0, errors.slice(0, 5))
  await browser.close()
}

/* ================= iPAD ON ITS SIDE (both halves side by side) ================= */
{
  const { browser, page, errors } = await open({ size: { width: 1180, height: 820 }, who: 'a', touch: true })
  const cdp = await page.context().newCDPSession(page)
  await page.waitForSelector('#flowSvg .ball'); await wait(600)
  const z = await emptyAt(page), a = await sc(page, '#board')
  await finger(cdp, { x: z.x, y: z.y, dy: -260 }); await wait(250); const b = await sc(page, '#board')
  const r = await page.evaluate(() => { const s = document.getElementById('side').getBoundingClientRect(); return { x: s.left + s.width - 20, y: s.top + Math.min(s.height, innerHeight - s.top) * 0.6, vis: s.width > 0 } })
  for (let i = 0; i < 6 && await page.evaluate(() => { const d = document.getElementById('side'); return d.scrollHeight - d.clientHeight < 300 }); i++) { await page.click('#szIn'); await wait(150) }
  const zi = await page.evaluate(() => +document.getElementById('side').style.zoom || 1)
  const i0 = await sc(page, '#side'); if (r.vis) { await finger(cdp, { x: r.x, y: r.y, dy: -240 }); await wait(250) }
  const i1 = await sc(page, '#side'); await shot(page, 'p1-ipad-both-halves-after-drag')
  note('P1', 'iPad on its side: a finger drag scrolls the chart', b.y - a.y > 180, { from: a.y, to: b.y })
  note('P2', 'iPad on its side: a finger drag scrolls the Info half beside it', r.vis && i0.maxY > 100 && (i1.y - i0.y) * zi > 150, { from: i0.y, to: i1.y, room: i0.maxY, zoom: zi })
  note('E3', 'iPad: no errors', errors.length === 0, errors.slice(0, 5))
  await browser.close()
}

/* ================= DESKTOP (a mouse — the app's own drag, D988) ================= */
{
  const { browser, page, errors } = await open({ size: DESK, who: 'a' })
  await page.waitForSelector('#flowSvg .ball'); await wait(600)
  await page.evaluate(() => { document.getElementById('board').scrollTop = 600 }); await wait(200)
  const m = await page.evaluate(() => { const b = document.getElementById('board').getBoundingClientRect(); for (let y = b.top + b.height * 0.5; y < b.bottom - 20; y += 10) { const t = document.elementFromPoint(b.left + 40, y); if (t && !t.closest('.ball') && !t.closest('.edgehit')) return { x: b.left + 40, y } } return null })
  await page.mouse.move(m.x, m.y); await page.mouse.down()
  for (let i = 1; i <= 5; i++) { await page.mouse.move(m.x, m.y - 50 * i); await wait(16) }
  await page.mouse.up(); const dl = (await sc(page, '#board')).y; await wait(500); const dr = (await sc(page, '#board')).y
  await shot(page, 'd1-desktop-mouse-drag-stops')
  note('D1', 'desktop: a fast mouse drag on the chart stops where it is let go (D988)', dl === dr && dl >= 840, { lift: dl, later: dr })
  const s = await page.evaluate(() => { const r = document.getElementById('side').getBoundingClientRect(); return { x: r.left + r.width - 30, y: r.top + r.height * 0.6 } })
  const s0 = await sc(page, '#side')
  await page.mouse.move(s.x, s.y); await page.mouse.down()
  for (let i = 1; i <= 5; i++) { await page.mouse.move(s.x, s.y - 30 * i); await wait(16) }
  await page.mouse.up(); const s1 = await sc(page, '#side'); await wait(400); const s2 = await sc(page, '#side')
  note('D2', 'desktop: a mouse drag on the Info half moves it and stops at the release', (s0.maxY < 20 || (s1.y > s0.y && s1.y === s2.y)), { before: s0.y, atRelease: s1.y, later: s2.y, room: s0.maxY })
  const b = await ballMid(page, 60); await page.mouse.click(b.x, b.y); await wait(500)
  note('D3', 'desktop: a click on an event opens its pop-up', await popOpen(page), { ball: b.id })
  await page.keyboard.press('Escape'); await wait(300)
  note('E4', 'desktop: no errors', errors.length === 0, errors.slice(0, 5))
  await browser.close()
}

save('walk', rows)
const f = rows.filter(r => r.pass === false).length, n = rows.filter(r => r.pass === null).length
console.log(`\n${rows.length - f - n} passed, ${f} failed, ${n} not walked`)
process.exit(f ? 1 : 0)
