// [WEEK-ARROWS-NO-BLOCK] — his D1522 (30 Oct 26): the desktop week's ‹ › arrows stay see-through; a design in which they
// block nothing behind them is drawn for him, before and after, before anything is built. Bounds: the day at the front sits
// flush at the left (D275 — he turned down a gap beside the arrow), an arrow pressed again and again never moves (D1122), his
// button sizes (D487). Drawn on the real app (this branch's build), his PC's size: 1536 × 730 CSS px at 1.25.
//
// States, the busy ones first (the mock-up guide: choose the state by what it shows): View-only Sched with Monday's issues
// list open (D275's own picture: the arrow over the start of its lines); View-only and Edit Schedule after two › presses (the
// arrow over a day's first flying line); Edit Schedule, where › sits over the crew panel.
// Options, each ONE transform on the page (a stylesheet; nothing new is drawn but a reveal zone):
//   T  today — as built.
//   A  the foot bar's ‹ › only: the floating pair goes; the bar at the window's foot already carries ‹ › that step the days
//      the same way (Shell.tsx #hsL / #hsR → panDays), always on top of nothing.
//   B  shown when reached for: the floating pair is invisible until the pointer comes within 72px of the week's left or
//      right edge, or a key reaches it; then it is today's arrow, in today's place and size.
//   C  a slim tab on the very edge: 14px wide, today's 70px tall, flush with the window's edge, so it lies over the day
//      card's own edge and padding (measured below), not over its words — a size change, his word needed (D487).
// Usage: node scripts/handpass/week-arrows-draw.mjs [port]
import { chromium } from 'playwright'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const here = path.dirname(fileURLToPath(import.meta.url))
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = path.resolve(here, '../../docs/img/handpass/2026-10-30-week-arrows')
mkdirSync(OUT, { recursive: true })
const PORT = process.argv[2] || '4173'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctx = await browser.newContext({ viewport: { width: 1536, height: 730 }, deviceScaleFactor: 1.25 })
const page = await ctx.newPage()
const errs = []
page.on('pageerror', e => errs.push(String(e).slice(0, 200)))
await page.goto(`http://localhost:${PORT}/?fresh=1`)
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.addStyleTag({ content: '#toastEl, .toast { visibility: hidden !important; }' })

const OPT = {
  T: '',
  A: '.week-nav{display:none!important} .hscroll .hs-arrow{outline:2px solid #3BC6E8;outline-offset:2px}',
  B: '.week-nav{opacity:0!important;pointer-events:none} body.wa-reach .week-nav{opacity:.75!important;pointer-events:auto}',
  C: '.week-nav{width:14px!important;border-radius:0 8px 8px 0!important;font-size:15px!important} .week-nav.prev{left:0!important;border-left:none!important} .week-nav.next{right:0!important;border-radius:8px 0 0 8px!important;border-right:none!important}',
}
async function use(opt, reach = false) {
  await page.evaluate(([css, reach]) => {
    let s = document.getElementById('wa-opt')
    if (!s) { s = document.createElement('style'); s.id = 'wa-opt'; document.head.appendChild(s) }
    s.textContent = css
    document.body.classList.toggle('wa-reach', !!reach)
  }, [OPT[opt], reach])
  await page.waitForTimeout(250)
}
/* what each floating arrow lies over: the words of the elements under its box (the arrow itself left out) */
const under = () => page.evaluate(() => [...document.querySelectorAll('.week-nav')].filter(b => b.offsetWidth).map(b => {
  const r = b.getBoundingClientRect(), pe = b.style.pointerEvents
  b.style.pointerEvents = 'none'
  const words = new Set()
  for (let y = r.top + 4; y < r.bottom - 2; y += 8) for (let x = r.left + 3; x < r.right - 2; x += 6) {
    const e = document.elementFromPoint(x, y)
    if (!e || e.closest('.week-nav')) continue
    const own = [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim()
    if (own) words.add(own.slice(0, 24))
    else if (e.matches('input,textarea') && e.value) words.add(e.value.slice(0, 24))
  }
  b.style.pointerEvents = pe
  return { which: b.id, box: [r.left, r.top, r.width, r.height].map(Math.round), words: [...words] }
}))
/* the front day card's own edge: where its words start, from the window's left */
const margin = () => page.evaluate(() => {
  const days = [...document.querySelectorAll('#vWeek .day, #eWeek .day')].filter(d => d.offsetWidth && d.getBoundingClientRect().right > 0)
  const d = days.find(x => x.getBoundingClientRect().left > -5) || days[0]
  if (!d) return null
  const r = d.getBoundingClientRect()
  let first = Infinity
  for (const e of d.querySelectorAll('*')) { const q = e.getBoundingClientRect(); const own = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()); if (own && q.width && q.top > 0 && q.top < innerHeight) first = Math.min(first, q.left) }
  return { card: Math.round(r.left), words: Math.round(first) }
})
const shot = (name, clip) => page.screenshot({ path: path.join(OUT, name + '.png'), ...(clip ? { clip } : {}) })
const LEFT = { x: 0, y: 150, width: 460, height: 560 }, RIGHT = { x: 1076, y: 150, width: 460, height: 560 }
const record = []

/* 1. View-only Sched, Monday's issues list open */
await page.evaluate(() => window.go('viewsched')); await page.waitForTimeout(900)
const bar = page.locator('#vWeek .day').first().locator('.warnbar, .wbar, [data-warnbar], .day-issues, .issues').first()
if (await bar.count()) { await bar.click().catch(() => {}); await page.waitForTimeout(500) }
await page.mouse.move(700, 120)
for (const o of ['T', 'A', 'B', 'C']) {
  await use(o)
  if (o === 'T' || o === 'C') record.push({ state: 'view, Monday list open', opt: o, under: await under(), margin: await margin() })
  await shot(`v1-${o}-left`, LEFT); await shot(`v1-${o}-right`, RIGHT)
  if (o === 'A') await shot('v1-A-foot', { x: 0, y: 640, width: 1536, height: 90 })
  if (o === 'B') { await use('B', true); await page.mouse.move(30, 380); await shot('v1-B-reached-left', LEFT); await page.mouse.move(1510, 380); await shot('v1-B-reached-right', RIGHT); await page.mouse.move(700, 120) }
}
await use('T'); await shot('v1-T-full')

/* 2. View-only after two › presses */
await page.click('#weekNext'); await page.waitForTimeout(700); await page.click('#weekNext'); await page.waitForTimeout(900)
await page.mouse.move(700, 120)
for (const o of ['T', 'A', 'B', 'C']) {
  await use(o)
  if (o === 'T' || o === 'C') record.push({ state: 'view, two › presses', opt: o, under: await under(), margin: await margin() })
  await shot(`v2-${o}-left`, LEFT)
}

/* 3. Edit Schedule, two › presses — › over the crew panel */
await use('T')
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(1200)
await page.click('#weekNext'); await page.waitForTimeout(700); await page.click('#weekNext'); await page.waitForTimeout(900)
await page.mouse.move(700, 120)
for (const o of ['T', 'A', 'B', 'C']) {
  await use(o)
  if (o === 'T' || o === 'C') record.push({ state: 'edit, two › presses', opt: o, under: await under(), margin: await margin() })
  await shot(`e3-${o}-left`, LEFT); await shot(`e3-${o}-right`, RIGHT)
}
await use('T'); await shot('e3-T-full')
await use('A'); await shot('e3-A-full')
writeFileSync(path.join(OUT, 'measures.json'), JSON.stringify({ record, errs }, null, 1))
console.log(JSON.stringify(record, null, 1).slice(0, 4000)); console.log('errors:', errs.length ? errs : 'none')
await browser.close()
