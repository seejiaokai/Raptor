/* LOOK — a faint dash in the empty R and B boxes of SC, AVALON and BB lines (his question, 19 Oct 26: "Should I put a
   ghost dash on rally and go to indicate to new users that the norm is to indicate timings on TO and LD?" — "for SC BB
   and AVALON"). The real app, the Saturday's SC wave as in look-standby-flies.mjs (AM shift with R 06:30 typed; PM shift
   nothing typed) and an AVALON wave added. ONE transform, drawn in: every EMPTY R and B box on a standby line shows "–"
   in the app's own faint grey ghost (the "Remarks" placeholder's colour, --ink-3 at .55) — a typed box shows its time as
   today. The Flies chips are drawn in too, as approved (D1060). An orange dashed box marks the dashes.
   Run: HP_URL=http://localhost:4322 node scripts/handpass/look-standby-dash.mjs
   Pictures: docs/img/handpass/2026-10-19-standby-flies/ghost-dash/ */
import { existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

console.log('look-standby-dash v4')
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const BASE = process.env.HP_URL || 'http://localhost:4322'
const OUT = resolve(ROOT, 'docs/img/handpass/2026-10-19-standby-flies/ghost-dash')
mkdirSync(OUT, { recursive: true })
const DI = 5
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errors = []

async function setUp(p) {
  await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(600)
  return p.evaluate((DI) => {
    window.addWave(DI, 'sc')
    const gi = window.DAYS[DI].waves.findIndex(w => w.kind === 'sc')
    const ids = Object.keys(window.PEOPLE).filter(i => !window.PEOPLE[i].special)
    const used = new Set()
    const pick = seat => { const i = ids.find(x => window.PEOPLE[x].seat === seat && !used.has(x)); used.add(i); return i }
    ;[[0, 0], [0, 1], [0, 2], [0, 3], [1, 0], [1, 2]].forEach(([li, ai]) => { window.fillSlot(`${DI}.${gi}.${li}.${ai}.p`, pick('FCP')); window.fillSlot(`${DI}.${gi}.${li}.${ai}.w`, pick('RCP')) })
    return gi
  }, DI)
}

/* the transform, inside one surface: Flies chips (as approved) and a faint "–" in every empty R / B box of the wave */
function draw({ DI, gi, sel }) {
  const root = document.querySelector(sel), pre = `${DI}.${gi}.`
  const solidSrc = root.querySelector(`[data-sarole="${pre}0.0"]`), hollowSrc = root.querySelector(`[data-sarole="${pre}0.2"]`)
  for (const b of root.querySelectorAll(`[data-sarole^="${pre}"]`)) {
    const [, , li, ai] = b.getAttribute('data-sarole').split('.').map(Number)
    const flies = li === 0 || (li === 1 && ai === 2)
    const c = (flies ? solidSrc : hollowSrc).cloneNode(false)
    c.removeAttribute('data-sarole'); c.classList.add('mock-new'); c.textContent = flies ? '✓ FLIES' : 'FLIES'
    if (flies) c.style.cssText = 'border-style:solid;opacity:1;background:rgba(105,190,180,.16);border-color:rgba(105,190,180,.35);color:var(--ink-2)'
    const wrap = document.createElement('span'); wrap.style.cssText = 'display:inline-flex;gap:4px;align-self:flex-start;align-items:center'
    b.parentNode.insertBefore(wrap, b); wrap.appendChild(b); wrap.appendChild(c)
  }
  /* the dash: an input's placeholder (the board) or a text box's data-ph (the week) — the app's own grey ghost */
  const boxes = [...root.querySelectorAll(`[data-bfld^="ff:${pre}"][data-bfld$=".rl"], [data-bfld^="ff:${pre}"][data-bfld$=".br"], [data-txt^="ff:${pre}"][data-txt$=".rl"], [data-txt^="ff:${pre}"][data-txt$=".br"]`)]
    .filter(e => e.offsetParent !== null)
  let n = 0
  for (const e of boxes) {
    if (e.tagName === 'INPUT') { if (!e.value) { e.placeholder = '–'; e.classList.add('mock-dash'); n++ } }
    else if (!e.textContent.trim()) { e.setAttribute('data-ph', '–'); e.classList.add('mock-dash'); n++ }
  }
  const st = document.createElement('style'); st.className = 'mock-style'
  st.textContent = `${sel} input.tm::placeholder{color:var(--ink-3);opacity:.55}`
  document.head.appendChild(st)
  for (const e of root.querySelectorAll('.mock-dash')) {
    const r = e.getBoundingClientRect(), m = document.createElement('div'); m.className = 'mock-mark'
    m.style.cssText = `position:fixed;left:${r.left - 3}px;top:${r.top - 3}px;width:${r.width + 6}px;height:${r.height + 6}px;border:2px dashed #ff9a3c;border-radius:6px;pointer-events:none;z-index:2147483000`
    document.body.appendChild(m)
  }
  return n
}

async function shoot(p, gi, name, sel) {
  const pre = `${DI}.${gi}.`
  const first = p.locator(`${sel} [data-sarole="${pre}0.0"]:visible`).first()
  await first.evaluate(e => { e.scrollIntoView({ block: 'start' }); let a = e.parentElement; while (a && !(a.scrollHeight > a.clientHeight && /auto|scroll/.test(getComputedStyle(a).overflowY))) a = a.parentElement; if (a) a.scrollTop -= 180; else window.scrollBy(0, -180) })
  await p.waitForTimeout(300)
  const n = await p.evaluate(draw, { DI, gi, sel })
  if (n < (sel === '#sbBoard' ? 4 : 1)) throw new Error(`drew ${n} dashes — premise gone`)
  console.log(name, 'dashes', n)
  const top = await first.boundingBox()
  const bot = await p.locator(`${sel} [data-sarole="${pre}1.3"]:visible`).first().boundingBox()
  const y = Math.max(0, top.y - 120)
  await p.screenshot({ path: resolve(OUT, name), clip: { x: 0, y, width: p.viewportSize().width, height: Math.min(bot.y + 70 - y, 2600) } })
  await p.evaluate(() => { document.querySelectorAll('.mock-mark').forEach(m => m.remove()); document.querySelectorAll('.mock-dash').forEach(e => e.classList.remove('mock-dash')) })
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
async function typeR(p, gi) {
  const r = p.locator(`#sbBoard [data-bfld="ff:${DI}.${gi}.0.rl"]:visible`).first()
  await r.evaluate(e => { e.focus({ preventScroll: true }); e.value = '06:30'; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); e.blur() }); await p.waitForTimeout(600)
}

try {
  {
    const ctx = await browser.newContext({ viewport: { width: 402, height: 1900 }, deviceScaleFactor: 3, isMobile: false, hasTouch: true, colorScheme: 'dark' })
    const p = await login(ctx); const gi = await setUp(p)
    await p.evaluate(DI => window.openScheduler(DI), DI); await p.waitForSelector('#schedBoard'); await p.waitForTimeout(900)
    await typeR(p, gi)
    await shoot(p, gi, '1-phone-board-dash.png', '#sbBoard')
    await ctx.close()
  }
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1400 }, deviceScaleFactor: 2, colorScheme: 'dark' })
    const p = await login(ctx); const gi = await setUp(p)
    await p.evaluate(DI => window.openScheduler(DI), DI); await p.waitForSelector('#schedBoard'); await p.waitForTimeout(900)
    await typeR(p, gi)
    await shoot(p, gi, '2-desktop-board-dash.png', '#sbBoard')
    await p.evaluate(() => window.closeScheduler ? window.closeScheduler() : document.querySelector('#sbDone')?.click()); await p.waitForTimeout(900)
    await shoot(p, gi, '3-desktop-week-dash.png', '#page-editsched')
    await ctx.close()
  }
} finally {
  await browser.close()
  console.log('page errors', errors.length, errors.slice(0, 3).join(' | '))
}
