// His D1529 (31 Oct 26 — "A — a day at a time"): the walk of a man held at Edit Schedule's week side. Walked on the BUILT
// app (vite preview of dist) with a real mouse, against the §7.11 lessons: a gesture at two speeds (a fast pass, a slow
// pass, a hold), both sides and both ends, the crew panel shown and hidden (lesson 17), a window open over the side
// (lesson 4), the page scrolled part-way, a second desktop size (lesson 11), the drop after a step landing on the day the
// week brought in, and below the desktop width (nothing changes). Sizes: his PC 1536 × 730 at 1.25; 1366 × 700 at 1.25;
// 800 × 700.
// Usage: node scripts/handpass/week-drag-step-walk.mjs [port]   (pictures → docs/img/handpass/2026-10-31-week-drag-edge-pan/walk)
import { chromium } from 'playwright'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const here = path.dirname(fileURLToPath(import.meta.url))
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = path.resolve(here, '../../docs/img/handpass/2026-10-31-week-drag-edge-pan', process.env.WALK_OUT || 'walk')
mkdirSync(OUT, { recursive: true })
const PORT = process.argv[2] || '4173'
const rows = []
const rec = (name, ok, said, pics = []) => { rows.push({ name, result: ok ? 'PASS' : 'FAIL', said, pics }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  ${said}`) }

async function open(viewport) {
  const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
  const page = await (await browser.newContext({ viewport, deviceScaleFactor: 1.25 })).newPage()
  const errs = []
  page.on('pageerror', e => errs.push(String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)) })
  await page.goto(`http://localhost:${PORT}/?fresh=1`)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.addStyleTag({ content: '#toastEl, .toast { visibility: hidden !important; }' })
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(1500)
  return { browser, page, errs }
}
const sl = (page) => page.evaluate(() => Math.round(document.getElementById('eWeek').scrollLeft))
const geo = (page) => page.evaluate(() => {
  const w = document.getElementById('eWeek'), r = w.getBoundingClientRect(), ds = w.querySelectorAll('.day:not(.peek)')
  return { left: Math.round(r.left), right: Math.round(r.right), step: Math.round(ds[1].offsetLeft - ds[0].offsetLeft), week: window.CURWEEK }
})
const front = (page) => page.evaluate(() => {
  const w = document.getElementById('eWeek'), wl = w.getBoundingClientRect().left
  let best = null, bd = Infinity
  for (const d of w.querySelectorAll('.day[data-day]')) { const g = Math.abs(d.getBoundingClientRect().left - wl); if (g < bd) { bd = g; best = d } }
  return best ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][+best.dataset.day] : '?'
})
const settle = async (page) => { let last = -1, still = 0; for (let i = 0; i < 80 && still < 4; i++) { const s = await sl(page); still = s === last ? still + 1 : 0; last = s; await page.waitForTimeout(50) } return last }
/* a sideways wheel over the week is what a hand does to move it, and it is pan.ts's own reset of the arrows' memory of where
   their last press was heading — a bare jump would leave that memory in place (an older, accepted leftover, pan.ts) */
const setWeek = async (page, px) => { await page.evaluate(x => { const w = document.getElementById('eWeek'); w.dispatchEvent(new WheelEvent('wheel', { deltaX: 1, bubbles: true })); w.scrollTo({ left: x, behavior: 'instant' }) }, px); await settle(page) }
const crewMan = (page, nth = 0) => page.evaluate(n => {
  const ps = [...document.querySelectorAll('#eRoster .rpuck[data-person]')].filter(p => { const b = p.querySelector('.puck')?.getBoundingClientRect(); return b && b.width && b.top > 250 && b.bottom < innerHeight - 40 })
  const p = ps[n]; if (!p) return null
  const b = p.querySelector('.puck').getBoundingClientRect(); return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2), id: p.dataset.person, name: p.textContent.trim() }
}, nth)
const shot = (page, name, clip) => page.screenshot({ path: path.join(OUT, name + '.png'), ...(clip ? { clip } : {}) })
/* the mark on a picture: a ring and a label in plain words, nothing the pointer can hit; removed after */
const mark = (page, ring, label, lx, ly) => page.evaluate(([g, t, x, y]) => {
  const m = document.createElement('div'); m.className = 'pic-mark'
  m.innerHTML = `<div style="position:fixed;left:${g.x}px;top:${g.y}px;width:${g.w}px;height:${g.h}px;border:3px solid #ffb020;border-radius:10px;box-shadow:0 0 0 2px rgba(0,0,0,.6)"></div>`
    + `<div style="position:fixed;left:${x}px;top:${y}px;max-width:330px;padding:8px 11px;background:#ffb020;color:#111;font:600 14px/1.35 system-ui,sans-serif;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,.6)">${t}</div>`
  Object.assign(m.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: 99999 })
  document.body.appendChild(m)
}, [ring, label, lx, ly])
const unmark = (page) => page.evaluate(() => document.querySelectorAll('.pic-mark').forEach(n => n.remove()))
const cancel = async (page) => { await page.keyboard.press('Escape'); await page.mouse.up(); await page.waitForTimeout(400) }
const onDay = (page, id, day) => page.evaluate(([who, d]) => !!document.querySelector(`#eWeek .day[data-day="${d}"] [data-fill] [data-person="${who}"], #eWeek .day[data-day="${d}"] .puck[data-person="${who}"]`) ||
  [...document.querySelectorAll(`#eWeek .day[data-day="${d}"] [data-fill]`)].some(c => c.textContent.includes(who)), [id, day])

/* ---------- W. his PC, 1536 × 730 ---------- */
{
  const { browser, page, errs } = await open({ width: 1536, height: 730 })
  const g = await geo(page)
  console.log(`week ${g.left}–${g.right}, a day ${g.step} wide, week ${g.week}`)
  const CLIP_R = { x: 760, y: 200, width: 776, height: 530 }, CLIP_L = { x: 0, y: 200, width: 776, height: 530 }

  /* W1 hold at the right: one day after the wait, a second while held */
  await setWeek(page, 0)
  let m = await crewMan(page)
  await page.mouse.move(m.x, m.y); await page.mouse.down()
  await page.mouse.move(g.right - 14, 430, { steps: 14 })
  const t0 = Date.now(); await page.waitForTimeout(300)
  const at300 = await sl(page)
  let one = -1, tOne = 0
  for (let i = 0; i < 60 && one < 0; i++) { const s = await sl(page); if (s >= g.step - 2) { one = s; tOne = Date.now() - t0 } else await page.waitForTimeout(25) }
  await page.waitForTimeout(250)
  const f1 = await front(page)
  await mark(page, { x: g.right - 50, y: 370, w: 54, h: 120 }, `Held here — the week stepped one day: ${f1} is now at the front.`, g.right - 420, 500)
  await shot(page, 'w1-one-day', CLIP_R); await unmark(page)
  rec('W1 held at the right side: nothing for the first moment, then the week steps one day', at300 === 0 && one >= g.step - 2 && one <= g.step + 2 && f1 === 'Tuesday',
    `at 0.3 s ${at300}; stepped after ${tOne} ms to ${one}; front ${f1}`, ['w1-one-day'])
  for (let i = 0; i < 40; i++) { if ((await sl(page)) >= 2 * g.step - 2) break; await page.waitForTimeout(50) }
  await page.mouse.move(700, 430, { steps: 4 })
  const two = await settle(page)
  const f2 = await front(page)
  rec('W2 still held: it steps a second day; moved away, it stops on a whole day', Math.abs(two - 2 * g.step) <= 2 && f2 === 'Wednesday', `${two} (${f2} at the front)`)
  await page.waitForTimeout(900)
  rec('W3 away from the side nothing more moves', (await sl(page)) === two, `${await sl(page)}`)

  /* W4 the drop after the steps lands on the day the week brought in */
  const cell = await page.evaluate(() => {
    const d = document.querySelector('#eWeek .day[data-day="3"]'); if (!d) return null
    const cs = [...d.querySelectorAll('[data-fill^="g:"], [data-fill^="a:"]')].map(c => ({ c, b: c.getBoundingClientRect() })).filter(o => o.b.width > 40 && o.b.top > 260 && o.b.bottom < innerHeight - 30 && o.b.left > 0 && o.b.right < 1250)
    const o = cs[0]; if (!o) return null
    return { x: Math.round(o.b.left + o.b.width / 2), y: Math.round(o.b.top + o.b.height / 2), fill: o.c.dataset.fill }
  })
  if (!cell) rec('W4 drop on the day brought in', false, 'no Thursday cell on screen')
  else {
    await page.mouse.move(cell.x, cell.y, { steps: 6 }); await page.waitForTimeout(250)
    const marked = await page.evaluate(f => !!document.querySelector(`[data-fill="${f}"].dragover`), cell.fill)
    await shot(page, 'w4-over-thursday', CLIP_L)
    await page.mouse.up(); await page.waitForTimeout(600)
    const landed = await page.evaluate(([f, who]) => { const c = document.querySelector(`[data-fill="${f}"]`); return c ? c.textContent.includes(who) : false }, [cell.fill, m.name.replace(/[A-Z]{1,2}$/, '')])
    await shot(page, 'w4-dropped-thursday', CLIP_L)
    rec('W4 after the steps, the cell under him on Thursday is marked, and he lands there', marked && landed, `marked ${marked}; ${m.name} in Thursday's row ${landed}`, ['w4-over-thursday', 'w4-dropped-thursday'])
    await page.evaluate(() => window.undo && window.undo()); await page.keyboard.press('Control+z'); await page.waitForTimeout(500)
  }

  /* W5 a fast pass through the right side into Tuesday, and a slow one (about a third of a second in the band) */
  await setWeek(page, 0)
  m = await crewMan(page, 1)
  await page.mouse.move(m.x, m.y); await page.mouse.down()
  await page.mouse.move(g.right - 14, 430, { steps: 3 }); await page.mouse.move(800, 430, { steps: 3 })
  await page.waitForTimeout(900)
  const fast = await sl(page)
  await page.mouse.move(g.right - 14, 430, { steps: 4 }); await page.waitForTimeout(300); await page.mouse.move(800, 430, { steps: 4 })
  await page.waitForTimeout(900)
  const slow = await sl(page)
  await cancel(page)
  rec('W5 a name passing through the side moves nothing — fast, or a third of a second slow', fast === 0 && slow === 0, `after the fast pass ${fast}, after the slow pass ${slow}`)

  /* W6 the left side over the ‹ arrow: back a day at a time from Thursday, then the Monday end */
  await setWeek(page, 3 * g.step)
  const puck = await page.evaluate(() => {
    const w = document.getElementById('eWeek')
    const ps = [...w.querySelectorAll('.day[data-day="3"] [data-drag="1"]')].map(p => p.getBoundingClientRect()).filter(b => b.width && b.left > 60 && b.right < 1200 && b.top > 280 && b.bottom < innerHeight - 40)
    const b = ps[0]; return b ? { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) } : null
  })
  if (!puck) rec('W6 left side', false, 'no man on Thursday on screen')
  else {
    await page.mouse.move(puck.x, puck.y); await page.mouse.down()
    await page.mouse.move(8, 430, { steps: 14 })
    let back1 = -1; for (let i = 0; i < 60; i++) { const s = await sl(page); if (s <= 2 * g.step + 2) { back1 = s; break } await page.waitForTimeout(25) }
    await page.waitForTimeout(250)
    const fb = await front(page)
    const arrow = await page.evaluate(() => Math.round(document.getElementById('weekPrev').getBoundingClientRect().width))
    await mark(page, { x: 0, y: 370, w: 54, h: 120 }, `Held over ‹ — the week stepped back a day: ${fb} is at the front.`, 70, 500)
    await shot(page, 'w6-left-one-day', CLIP_L); await unmark(page)
    rec('W6 held at the left over the ‹ arrow: the week steps back a day', Math.abs(back1 - 2 * g.step) <= 2 && fb === 'Wednesday', `${back1}, ${fb} at the front; the arrow ${arrow} wide`, ['w6-left-one-day'])
    await page.waitForTimeout(2600)
    const end = await settle(page), fe = await front(page), wk = await page.evaluate(() => window.CURWEEK)
    await mark(page, { x: 0, y: 370, w: 54, h: 120 }, 'Held on: Tuesday, then Monday — and there it stops. No other week loads.', 70, 500)
    await shot(page, 'w7-monday-end', CLIP_L); await unmark(page)
    rec('W7 held on at the left: it walks back to Monday and stops there — no other week', end === 0 && fe === 'Monday' && wk === g.week, `${end}, ${fe}, week ${wk}`, ['w7-monday-end'])
    await cancel(page)
  }

  /* W8 the Sunday end */
  await setWeek(page, 6 * g.step)
  m = await crewMan(page)
  await page.mouse.move(m.x, m.y); await page.mouse.down()
  await page.mouse.move(g.right - 14, 430, { steps: 10 }); await page.waitForTimeout(2000)
  const sun = await sl(page), fs_ = await front(page), wk2 = await page.evaluate(() => window.CURWEEK)
  await cancel(page)
  rec('W8 Sunday at the front, held at the right: nothing moves, no other week', Math.abs(sun - 6 * g.step) <= 2 && fs_ === 'Sunday' && wk2 === g.week, `${sun}, ${fs_}, week ${wk2}`)

  /* W9 over the crew panel, beside the week's side: nothing */
  await setWeek(page, 0)
  m = await crewMan(page)
  await page.mouse.move(m.x, m.y); await page.mouse.down()
  await page.mouse.move(g.right + 25, 430, { steps: 6 }); await page.waitForTimeout(1500)
  const overCrew = await sl(page)
  await cancel(page)
  rec('W9 held over the crew panel beside the week: nothing moves', overCrew === 0, `${overCrew}`)

  /* W10 the page scrolled part-way down: the side still steps */
  await setWeek(page, 0)
  await page.evaluate(() => window.scrollTo(0, 600)); await page.waitForTimeout(300)
  m = await crewMan(page)
  if (!m) rec('W10 the page part-way down', false, 'no crew man on screen')
  else {
    await page.mouse.move(m.x, m.y); await page.mouse.down()
    await page.mouse.move(g.right - 14, 400, { steps: 10 })
    let s10 = 0; for (let i = 0; i < 60; i++) { s10 = await sl(page); if (s10 >= g.step - 2) break; await page.waitForTimeout(25) }
    await cancel(page)
    rec('W10 with the page scrolled part-way down, the side still steps a day', s10 >= g.step - 2, `${s10}; page scrolled ${await page.evaluate(() => Math.round(scrollY))}`)
  }
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300)

  /* W11 the changes window open over the right side: held over the window, nothing */
  await setWeek(page, 0)
  await page.click('#histBtn').catch(() => {}); await page.waitForTimeout(700)
  const win = await page.evaluate(() => { const e = document.querySelector('.chgwin, .floatwin'); if (!e) return null; const b = e.getBoundingClientRect(); return { l: Math.round(b.left), r: Math.round(b.right), t: Math.round(b.top), b: Math.round(b.bottom) } })
  if (!win || win.l > g.right - 20) rec('W11 a window over the week\'s side', true, `the changes window ${win ? `${win.l}–${win.r}` : 'did not open'} — not over the week's side at this size, nothing to hold over`)
  else {
    m = await crewMan(page)
    const y = Math.min(win.b - 20, Math.max(win.t + 40, 430))
    await page.mouse.move(m ? m.x : 1300, m ? m.y : 400); await page.mouse.down()
    await page.mouse.move(g.right - 14, y, { steps: 8 }); await page.waitForTimeout(1500)
    const s11 = await sl(page)
    await shot(page, 'w11-over-window', CLIP_R)
    await cancel(page)
    rec('W11 held over the changes window at the week\'s side: nothing moves', s11 === 0, `${s11}; window ${win.l}–${win.r}`, ['w11-over-window'])
  }
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  await page.evaluate(() => document.querySelectorAll('.chgwin .x, .floatwin .x, .chgwin [aria-label="Close"], .floatwin [aria-label="Close"]').forEach(b => b.click())); await page.waitForTimeout(300)

  /* W12 the crew panel hidden: the week's right side reaches the window; held there it steps */
  await setWeek(page, 0)
  const tab = await page.$('.crew-tab, #crewTab, [aria-label*="crew" i]')
  if (tab) { await tab.click(); await page.waitForTimeout(700) }
  const g2 = await geo(page)
  const hidden = await page.evaluate(() => { const r = document.getElementById('eRoster').getBoundingClientRect(); return r.left >= innerWidth - 40 })
  const man = await page.evaluate(() => {
    const ps = [...document.querySelectorAll('#eWeek .day[data-day="0"] [data-drag="1"]')].map(p => p.getBoundingClientRect()).filter(b => b.width && b.top > 280 && b.bottom < innerHeight - 40 && b.left > 60)
    const b = ps[0]; return b ? { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) } : null
  })
  if (!hidden || !man) rec('W12 the crew panel hidden', false, `hidden ${hidden}; a Monday man ${!!man}; week right ${g2.right}`)
  else {
    await page.mouse.move(man.x, man.y); await page.mouse.down()
    await page.mouse.move(1536 - 6, 430, { steps: 14 })
    let s12 = 0; for (let i = 0; i < 60; i++) { s12 = await sl(page); if (s12 >= g2.step - 2) break; await page.waitForTimeout(25) }
    await page.waitForTimeout(250)
    await mark(page, { x: 1536 - 54, y: 370, w: 54, h: 120 }, 'Crew panel hidden: held at the window\'s edge, the week steps a day.', 1536 - 420, 500)
    await shot(page, 'w12-panel-hidden', CLIP_R); await unmark(page)
    await cancel(page)
    rec('W12 with the crew panel hidden, held at the window\'s right edge, the week steps a day', s12 >= g2.step - 2, `${s12}; week right ${g2.right}`, ['w12-panel-hidden'])
  }
  if (tab) { await tab.click(); await page.waitForTimeout(500) }

  /* W13 the arrows still work by a press, as before */
  await setWeek(page, 0)
  await page.click('#weekNext'); const a1 = await settle(page)
  rec('W13 a press of › still moves one day', Math.abs(a1 - g.step) <= 2, `${a1}`)
  rec('W14 no page errors on his PC\'s size', errs.length === 0, errs.join(' | ') || 'none')
  await browser.close()
}

/* ---------- X. 1366 × 700, the second desktop size ---------- */
{
  const { browser, page, errs } = await open({ width: 1366, height: 700 })
  const g = await geo(page)
  await setWeek(page, 0)
  const m = await crewMan(page)
  await page.mouse.move(m.x, m.y); await page.mouse.down()
  await page.mouse.move(g.right - 14, 420, { steps: 12 })
  let s = 0; for (let i = 0; i < 60; i++) { s = await sl(page); if (s >= g.step - 2) break; await page.waitForTimeout(25) }
  await page.waitForTimeout(250)
  await shot(page, 'x1-1366-one-day', { x: 600, y: 180, width: 766, height: 520 })
  await cancel(page)
  rec('X1 at 1366 wide: held at the right side, the week steps a day', s >= g.step - 2 && s <= g.step + 2, `${s} (a day ${g.step}); week ${g.left}–${g.right}`, ['x1-1366-one-day'])
  rec('X2 no page errors at 1366', errs.length === 0, errs.join(' | ') || 'none')
  await browser.close()
}

/* ---------- Y. 800 wide — below the desktop week: nothing changes ---------- */
{
  const { browser, page, errs } = await open({ width: 800, height: 700 })
  const s0 = await sl(page)
  const src = await page.evaluate(() => { const p = [...document.querySelectorAll('#eWeek [data-drag="1"]')].map(e => e.getBoundingClientRect()).find(b => b.width && b.top > 200 && b.bottom < innerHeight - 40 && b.left > 100 && b.right < 700); return p ? { x: Math.round(p.left + p.width / 2), y: Math.round(p.top + p.height / 2) } : null })
  if (src) { await page.mouse.move(src.x, src.y); await page.mouse.down(); await page.mouse.move(790, src.y, { steps: 10 }); await page.waitForTimeout(1500) }
  const s1 = await sl(page)
  await shot(page, 'y1-800-wide')
  await cancel(page)
  rec('Y1 at 800 wide (no desktop arrows), a mouse held at the right moves nothing new', !!src && s1 === s0, `${s0} → ${s1}${src ? '' : '; no man found'}`, ['y1-800-wide'])
  rec('Y2 no page errors at 800', errs.length === 0, errs.join(' | ') || 'none')
  await browser.close()
}

writeFileSync(path.join(OUT, 'walk.json'), JSON.stringify(rows, null, 1))
const fails = rows.filter(r => r.result === 'FAIL').length
console.log(`\n${rows.length - fails}/${rows.length} pass`)
