/* LOOK — [STANDBY-FLIES] the Flies tick drawn on the real app, for his word before the build (D853, 19 Oct 26).
   The real board and week, an SC wave added on the Saturday with its crew seated through the app's own fill. The SC AM
   shift has its R typed (06:30); the SC PM shift has none. ONE transform, drawn in: beside each MAIN / SPARE badge a
   second chip cloned from the real badge — on the AM shift a solid "✓ FLIES" on every row (B or R typed: the whole shift
   flies, D1044–D1045); on the PM shift a dashed "FLIES" a tap would fill, and its SPARE (Viper) ticked by hand (D1046).
   The badge and the new chip sit side by side in a small row of their own (new: the badge stood alone). An orange
   dashed box marks the place. "Today" pictures are the same frames without the transform.
   Run: HP_URL=http://localhost:4322 node scripts/handpass/look-standby-flies.mjs
   Pictures: docs/img/handpass/2026-10-19-standby-flies/mock/ */
import { existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

console.log('look-standby-flies v8')
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const BASE = process.env.HP_URL || 'http://localhost:4322'
const OUT = resolve(ROOT, 'docs/img/handpass/2026-10-19-standby-flies/mock')
mkdirSync(OUT, { recursive: true })
const DI = 5                                  // the Saturday — his own example (a weekend SC shift)
const HAND = [1, 2]                           // the PM shift's first SPARE row, ticked by hand
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errors = []

/* an SC wave on the Saturday, its crew seated through the app's own fill */
async function setUp(p) {
  await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(600)
  return p.evaluate((DI) => {
    window.addWave(DI, 'sc')
    const gi = window.DAYS[DI].waves.findIndex(w => w.kind === 'sc')
    const ids = Object.keys(window.PEOPLE).filter(i => !window.PEOPLE[i].special)
    const used = new Set()
    const pick = seat => { const i = ids.find(x => window.PEOPLE[x].seat === seat && !used.has(x)); used.add(i); return i }
    const rows = [[0, 0], [0, 1], [0, 2], [0, 3], [1, 0], [1, 2]]   // the AM shift whole; PM one MAIN and one SPARE
    rows.forEach(([li, ai]) => { window.fillSlot(`${DI}.${gi}.${li}.${ai}.p`, pick('FCP')); window.fillSlot(`${DI}.${gi}.${li}.${ai}.w`, pick('RCP')) })
    return gi
  }, DI)
}

async function typeR(p, gi) {
  const r = p.locator(`#sbBoard [data-bfld="ff:${DI}.${gi}.0.rl"]:visible`).first()
  /* set through the box's own change handler — a typed tap on the emulated phone zooms the page to the small box */
  await r.evaluate(e => { e.focus({ preventScroll: true }); e.value = '06:30'; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); e.blur() }); await p.waitForTimeout(600)
  const rl = await p.evaluate(([DI, gi]) => window.DAYS[DI].waves[gi].formations[0].rl, [DI, gi])
  if (!rl) throw new Error('the R did not take')
  console.log('AM rally', rl)
}

/* the transform: a chip cloned from the real badge, beside it; returns how many it drew */
function drawFlies({ DI, gi, hand, sel }) {
  let n = 0
  const pre = `${DI}.${gi}.`
  const root = document.querySelector(sel)
  const solidSrc = root.querySelector(`[data-sarole="${pre}0.0"]`)       // a MAIN badge: the solid recipe
  const hollowSrc = root.querySelector(`[data-sarole="${pre}0.2"]`)      // a SPARE badge: the dashed recipe
  const groups = {}
  for (const b of root.querySelectorAll(`[data-sarole^="${pre}"]`)) {
    if (b.offsetParent === null) continue
    const [, , li, ai] = b.getAttribute('data-sarole').split('.').map(Number)
    const flies = li === 0 || (li === hand[0] && ai === hand[1])
    const c = (flies ? solidSrc : hollowSrc).cloneNode(false)
    c.removeAttribute('data-sarole'); c.classList.add('mock-new'); c.textContent = flies ? '✓ FLIES' : 'FLIES'
    if (flies) c.style.cssText = 'border-style:solid;opacity:1;background:rgba(105,190,180,.16);border-color:rgba(105,190,180,.35);color:var(--ink-2)'
    const wrap = document.createElement('span')
    wrap.style.cssText = 'display:inline-flex;gap:4px;align-self:flex-start;align-items:center'
    b.parentNode.insertBefore(wrap, b); wrap.appendChild(b); wrap.appendChild(c)
    ;(groups[li] = groups[li] || []).push(wrap); n++
  }
  for (const ws of Object.values(groups)) {                                 // the place marked, per shift
    const rs = ws.map(w => w.getBoundingClientRect())
    const x0 = Math.min(...rs.map(r => r.left)), y0 = Math.min(...rs.map(r => r.top))
    const x1 = Math.max(...rs.map(r => r.right)), y1 = Math.max(...rs.map(r => r.bottom))
    const m = document.createElement('div'); m.className = 'mock-mark'
    m.style.cssText = `position:fixed;left:${x0 - 5}px;top:${y0 - 5}px;width:${x1 - x0 + 10}px;height:${y1 - y0 + 10}px;border:2px dashed #ff9a3c;border-radius:6px;pointer-events:none;z-index:2147483000`
    document.body.appendChild(m)
  }
  return n
}

/* frame from the AM shift's first row to the PM shift's last, in the given surface */
async function shoot(p, gi, name, sel, mock) {
  const pre = `${DI}.${gi}.`
  const first = p.locator(`${sel} [data-sarole="${pre}0.0"]:visible`).first()
  await first.evaluate(e => { e.scrollIntoView({ block: 'start' }); let a = e.parentElement; while (a && !(a.scrollHeight > a.clientHeight && /auto|scroll/.test(getComputedStyle(a).overflowY))) a = a.parentElement; if (a) a.scrollTop -= 180; else window.scrollBy(0, -180) }); await p.waitForTimeout(300)
  if (mock) {
    const n = await p.evaluate(drawFlies, { DI, gi, hand: HAND, sel })
    if (n < 8) throw new Error(`drew ${n} chips — premise gone`)
    console.log(name, 'chips drawn', n)
  }
  const top = await first.boundingBox()
  const bot = await p.locator(`${sel} [data-sarole="${pre}1.3"]:visible`).first().boundingBox()
  const vw = p.viewportSize().width
  const sy = 0
  const y = Math.max(0, top.y + sy - 120)
  await p.screenshot({ path: resolve(OUT, name), clip: { x: 0, y, width: vw, height: Math.min(bot.y + sy + 70 - y, 2600) } })
  if (mock) await p.evaluate(() => {
    document.querySelectorAll('.mock-mark').forEach(m => m.remove())
    document.querySelectorAll('.mock-new').forEach(c => { const w = c.parentNode; w.parentNode.insertBefore(w.firstChild, w); w.remove() })
  })
}

async function login(ctx) {
  const p = await ctx.newPage()
  p.on('pageerror', e => errors.push(e.message))
  await p.goto(BASE + '/')
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.addStyleTag({ content: '#toastEl{display:none !important}' })
  return p
}

try {
  {  /* 1–2: his iPhone's width, the Scheduler Board */
    const ctx = await browser.newContext({ viewport: { width: 402, height: 1900 }, deviceScaleFactor: 3, isMobile: false, hasTouch: true, colorScheme: 'dark' })
    const p = await login(ctx)
    const gi = await setUp(p)
    await p.evaluate(DI => window.openScheduler(DI), DI); await p.waitForSelector('#schedBoard'); await p.waitForTimeout(900)
    await typeR(p, gi)
    await shoot(p, gi, '1-phone-board-today.png', '#sbBoard', false)
    await shoot(p, gi, '2-phone-board-flies.png', '#sbBoard', true)
    await ctx.close()
  }
  {  /* 3–6: a desktop — the board, then Edit Schedule's week */
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1400 }, deviceScaleFactor: 2, colorScheme: 'dark' })
    const p = await login(ctx)
    const gi = await setUp(p)
    await p.evaluate(DI => window.openScheduler(DI), DI); await p.waitForSelector('#schedBoard'); await p.waitForTimeout(900)
    await typeR(p, gi)
    await shoot(p, gi, '3-desktop-board-today.png', '#sbBoard', false)
    await shoot(p, gi, '4-desktop-board-flies.png', '#sbBoard', true)
    await p.evaluate(() => window.closeScheduler ? window.closeScheduler() : document.querySelector('#sbDone')?.click()); await p.waitForTimeout(900)
    await shoot(p, gi, '5-desktop-week-today.png', '#page-editsched', false)
    await shoot(p, gi, '6-desktop-week-flies.png', '#page-editsched', true)
    await ctx.close()
  }
} finally {
  await browser.close()
  console.log('page errors', errors.length, errors.slice(0, 3).join(' | '))
}
