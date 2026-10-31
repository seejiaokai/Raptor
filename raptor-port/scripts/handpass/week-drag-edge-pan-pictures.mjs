// [WEEK-DRAG-EDGE-PAN] — the pictures put to him before anything is built (30 Oct 26 find; put to him 31 Oct 26).
// On his PC's size (1536 × 730 at 1.25), Edit Schedule: a man carried with a mouse and HELD at the week's right edge (a
// name from the crew panel) and at its left edge (a man moved from a later day), two seconds each, with the week's
// sideways position read before and after. Nothing is changed in the app; Escape puts the man back each time.
// Usage: node scripts/handpass/week-drag-edge-pan-pictures.mjs [port]
//   (pictures → docs/img/handpass/2026-10-31-week-drag-edge-pan/)
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(here, '../../docs/img/handpass/2026-10-31-week-drag-edge-pan')
mkdirSync(OUT, { recursive: true })
const PORT = process.argv[2] || '4173'
const log = []
const say = (s) => { log.push(s); console.log(s) }

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1536, height: 730 }, deviceScaleFactor: 1.25 })
const page = await ctx.newPage()
const errs = []
page.on('pageerror', e => errs.push(String(e).slice(0, 200)))
await page.goto(`http://localhost:${PORT}/?fresh=1`)
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.addStyleTag({ content: '#toastEl, .toast { visibility: hidden !important; }' })
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(1500)

const weekX = () => page.evaluate(() => Math.round(document.getElementById('eWeek').scrollLeft))
const box = () => page.evaluate(() => { const r = document.getElementById('eWeek').getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right) } })
const daysInView = () => page.evaluate(() => {
  const w = document.getElementById('eWeek'), r = w.getBoundingClientRect()
  return [...w.querySelectorAll('.day[data-day]')].filter(d => { const b = d.getBoundingClientRect(); return b.right > r.left + 40 && b.left < r.right - 40 })
    .map(d => d.querySelector('.dname, .dhd b, h2, b')?.textContent?.trim() || d.dataset.day)
})
/* the mark on the picture: a ring round the place and a label in plain words; pointer-events none, removed after */
const mark = (ring, label, lx, ly) => page.evaluate(([g, t, x, y]) => {
  const m = document.createElement('div'); m.className = 'pic-mark'
  m.innerHTML = `<div style="position:fixed;left:${g.x}px;top:${g.y}px;width:${g.w}px;height:${g.h}px;border:3px solid #ffb020;border-radius:10px;box-shadow:0 0 0 2px rgba(0,0,0,.6)"></div>`
    + `<div style="position:fixed;left:${x}px;top:${y}px;max-width:330px;padding:8px 11px;background:#ffb020;color:#111;font:600 14px/1.35 system-ui,sans-serif;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,.6)">${t}</div>`
  Object.assign(m.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: 99999 })
  document.body.appendChild(m)
}, [ring, label, lx, ly])
const unmark = () => page.evaluate(() => document.querySelectorAll('.pic-mark').forEach(n => n.remove()))
const hold = async (x, y, ms) => { for (let t = 0; t < ms; t += 150) { await page.mouse.move(x + (t / 150) % 2, y); await page.waitForTimeout(150) } }

/* 1. at rest */
await page.mouse.move(700, 160)
const b = await box()
say(`at rest: week box ${b.l}–${b.r}; days in view: ${(await daysInView()).join(', ')}; sideways position ${await weekX()}`)
await page.screenshot({ path: path.join(OUT, '1-at-rest.png') })

/* 2. a name from the crew panel carried to the week's right edge and held */
const crew = await page.evaluate(() => {
  const p = [...document.querySelectorAll('.eroster [data-drag], .eroster .puck')].find(e => { const r = e.getBoundingClientRect(); return r.width > 30 && r.top > 300 && r.top < 500 })
  if (!p) return null
  const r = p.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), t: p.textContent.trim() }
})
if (!crew) say('no crew name found in the crew panel')
else {
  const s0 = await weekX(), tx = b.r - 14, ty = 420
  await page.mouse.move(crew.x, crew.y); await page.mouse.down()
  for (let i = 1; i <= 14; i++) await page.mouse.move(crew.x + (tx - crew.x) * i / 14, crew.y + (ty - crew.y) * i / 14)
  await hold(tx, ty, 2000)
  const s1 = await weekX(), lifted = await page.evaluate(() => !!document.querySelector('.dragimg, .tdghost'))
  say(`right edge: carried "${crew.t}" to x ${tx}, held 2 s; picked up ${lifted}; sideways position ${s0} → ${s1}; days in view: ${(await daysInView()).join(', ')}`)
  await mark({ x: b.r - 50, y: ty - 60, w: 54, h: 120 },
    'Held here for 2 seconds with a name picked up — the week does not move. Thursday to Sunday cannot be reached in this drag.', b.r - 420, ty + 80)
  await page.screenshot({ path: path.join(OUT, '2-held-at-right-edge.png') }); await page.screenshot({ path: path.join(OUT, '2-held-at-right-edge-crop.png'), clip: { x: 760, y: 200, width: 776, height: 530 } })
  await unmark()
  await page.keyboard.press('Escape'); await page.mouse.up(); await page.waitForTimeout(500)
}

/* 3. a man on a later day carried back to the week's left edge and held */
await page.click('#weekNext'); await page.waitForTimeout(900); await page.click('#weekNext'); await page.waitForTimeout(900)
await page.mouse.move(700, 160); await page.waitForTimeout(400)
say(`after two › presses: days in view: ${(await daysInView()).join(', ')}; sideways position ${await weekX()}`)
const puck = await page.evaluate(() => {
  const w = document.getElementById('eWeek'), wl = w.getBoundingClientRect().left
  const ps = [...w.querySelectorAll('[data-drag="1"]')].filter(p => { const r = p.getBoundingClientRect(); return r.width && r.left > wl + 80 && r.right < 1200 && r.top > 300 && r.bottom < 700 })
  const p = ps[0]; if (!p) return null
  const r = p.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), t: p.textContent.trim() }
})
if (!puck) say('no man found on the front day')
else {
  const s0 = await weekX(), tx = b.l + 10, ty = 420
  await page.mouse.move(puck.x, puck.y); await page.mouse.down()
  for (let i = 1; i <= 14; i++) await page.mouse.move(puck.x + (tx - puck.x) * i / 14, puck.y + (ty - puck.y) * i / 14)
  await hold(tx, ty, 2000)
  const s1 = await weekX()
  say(`left edge: carried "${puck.t}" to x ${tx}, held 2 s; sideways position ${s0} → ${s1}; days in view: ${(await daysInView()).join(', ')}`)
  await mark({ x: b.l, y: ty - 60, w: 54, h: 120 },
    'Held here for 2 seconds with a man picked up — the week does not move. Monday and Tuesday cannot be reached in this drag.', b.l + 70, ty + 80)
  await page.screenshot({ path: path.join(OUT, '3-held-at-left-edge.png') }); await page.screenshot({ path: path.join(OUT, '3-held-at-left-edge-crop.png'), clip: { x: 0, y: 200, width: 776, height: 530 } })
  await unmark()
  await page.keyboard.press('Escape'); await page.mouse.up(); await page.waitForTimeout(500)
}
say(`page errors: ${errs.length ? errs.join(' | ') : 'none'}`)
writeFileSync(path.join(OUT, 'log.txt'), log.join('\n') + '\n')
await browser.close()
