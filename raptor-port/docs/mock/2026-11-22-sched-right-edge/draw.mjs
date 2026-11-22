/* [SCHED-RIGHT-EDGE] — the before-and-after drawing (his D1625: drawn and shown before it is built; 22 Nov 26).
 *
 * TODAY, on a desktop, Edit Schedule keeps a 26px lane at the window's right for the folded CREW tab and the next-day
 * arrow (`.edit-board{padding-right:26px}`, src/ui/scheduler/03-week.css) — on his PC (125% display) it reads as a
 * black border beside the days. PROPOSED: with the crew panel folded, the days run to the window's edge and the tab
 * and the arrow lie over them; only the strip's far end keeps the 26px, so the tab never covers the last column.
 *
 * A pure-style proposal, so it is drawn with the exact rule to be built (PROPOSED below), injected into the running
 * build, and every figure the page prints is measured in this same run, before and after.
 *
 * Run (from raptor-port/, the build served on HP_URL):
 *   HP_URL=http://localhost:4391 node docs/mock/2026-11-22-sched-right-edge/draw.mjs
 * Pictures and measures.json land in shots/ beside this script. His PC is a browser STARTED at 125% (a real screen
 * scaling, not an emulated picture scale); the phone is his iPhone's 402 x 874 in WebKit.
 * After the build: MOCK_BUILT=1 runs the same steps with nothing injected, into built/, for the side-by-side check. */
import { existsSync, mkdirSync, writeFileSync, rmSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, webkit, devices } from '@playwright/test'

const HERE = dirname(fileURLToPath(import.meta.url))
const BUILT = process.env.MOCK_BUILT === '1'
const OUT = join(HERE, BUILT ? 'built' : 'shots')
const BASE = process.env.HP_URL || 'http://localhost:4391'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
if (existsSync(OUT)) for (const f of readdirSync(OUT)) rmSync(join(OUT, f))
mkdirSync(OUT, { recursive: true })
const STATES = BUILT ? ['built'] : ['today', 'proposed']

/* THE EXACT RULE TO BE BUILT. The open panel keeps its lane (the tab stands beside the panel, never over its pucks);
   folded, the lane goes and the week's own end takes the 26px (8 + 26 = 34), so the far end still clears the tab. */
export const PROPOSED = `@media (min-width:821px){
  body.ros-collapsed .edit-board{padding-right:0}
  body.ros-collapsed .edit-board .week{padding-right:34px}
}`

const errors = []
const measures = {}

async function signIn(page) {
  page.on('pageerror', e => { errors.push(String(e)); console.log('PAGE ERROR', String(e)) })
  page.on('console', m => { if (m.type() === 'error') { errors.push(m.text()); console.log('CONSOLE ERROR', m.text()) } })
  await page.goto(BASE + '/?fresh=1')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}.toast{display:none !important}' })
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  /* the top bar's own tab on a desktop, pressed as he presses it; the phone's menu is a drawer, so there the app's own
     page switch is called — the same switch the tab makes */
  const tab = page.locator('.topbar').getByText('Edit Schedule', { exact: true }).first()
  if (await tab.isVisible().catch(() => false)) await tab.click(); else await page.evaluate(() => window.go('editsched'))
  await page.waitForFunction(() => window.CURPAGE === 'editsched')
  await page.waitForSelector('#page-editsched .week .day')
  await page.waitForTimeout(500)
}

/* everything the page states, read off the running screen */
const measure = page => page.evaluate(() => {
  const q = s => document.querySelector(s)
  const box = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { left: +r.left.toFixed(2), right: +r.right.toFixed(2), top: +r.top.toFixed(2), bottom: +r.bottom.toFixed(2), width: +r.width.toFixed(2) } }
  const wk = q('#page-editsched .week')
  const days = [...wk.querySelectorAll('.day')].map(d => ({ day: d.hasAttribute('data-day') ? d.getAttribute('data-day') : 'next week ' + d.getAttribute('data-peek-day'), ...box(d) }))
  const rail = q('.ros-rail'), next = q('.week-nav.next'), hs = q('#hscroll')
  return {
    innerWidth, innerHeight, dpr: devicePixelRatio, folded: document.body.classList.contains('ros-collapsed'),
    board: box(q('#page-editsched .edit-board')), week: box(wk), weekScrollLeft: wk.scrollLeft, weekScrollMaxFree: wk.scrollWidth - wk.clientWidth,
    weekPadRight: getComputedStyle(wk).paddingRight, boardPadRight: getComputedStyle(q('#page-editsched .edit-board')).paddingRight,
    rail: rail && getComputedStyle(rail).display !== 'none' ? box(rail) : null,
    nextArrow: next && !next.hidden && getComputedStyle(next).display !== 'none' ? box(next) : null,
    scrollBar: hs && hs.classList.contains('on') ? box(hs) : null,
    days,
  }
})

/* what lies under the folded tab: every control of the days that the tab's own box crosses. Today the lane hides that
   strip from top to bottom, so today's answer is "nothing"; the proposal's answer is what the tab newly lies over. */
const underTab = page => page.evaluate(() => {
  const rail = document.querySelector('.ros-rail').getBoundingClientRect()
  const wk = document.querySelector('#page-editsched .week').getBoundingClientRect()
  const hit = (r, b) => r.right > b.left && r.left < b.right && r.bottom > b.top && r.top < b.bottom
  const out = { weekRight: +wk.right.toFixed(1), railLeft: +rail.left.toFixed(1), underTheTab: [], inItsColumn: 0, shownInItsColumnPx: +(Math.max(0, wk.right - rail.left)).toFixed(1) }
  for (const el of document.querySelectorAll('#page-editsched .week .day :is(button,a,input,select,textarea,[role=button],.puck,[contenteditable=true])')) {
    const r = el.getBoundingClientRect()
    if (!(r.width > 0) || r.left >= wk.right) continue          // not drawn, or past the strip's own edge (cut off)
    if (hit(r, rail)) out.underTheTab.push((el.className + ' "' + (el.textContent || el.value || '').trim().slice(0, 18) + '" ' + (Math.min(r.right, wk.right) - Math.max(r.left, rail.left)).toFixed(0) + 'px of ' + r.width.toFixed(0)).trim())
    if (r.right > rail.left && r.left < rail.right) out.inItsColumn++
  }
  return out
})

async function setProposed(page, on) {
  if (BUILT) return
  await page.evaluate(({ css, on }) => {
    let s = document.getElementById('mock-right-edge')
    if (on && !s) { s = document.createElement('style'); s.id = 'mock-right-edge'; s.textContent = css; document.head.appendChild(s) }
    if (!on && s) s.remove()
    window.dispatchEvent(new Event('resize'))   // the app re-measures the strip's tail and its scroll bar on a resize
  }, { css: PROPOSED, on })
  await page.waitForTimeout(350)
}
async function fold(page, want) {
  const is = await page.evaluate(() => document.body.classList.contains('ros-collapsed'))
  if (is !== want) { await page.click('.ros-rail'); await page.waitForTimeout(600) }
  await page.mouse.move(700, 500)   // off the tab and clear of both arrows, so nothing is drawn hovered
  await page.waitForTimeout(250)
}
const shot = async (page, name) => { await page.screenshot({ path: join(OUT, name + '.png') }); console.log('  picture', name) }

/* ---------- his PC: a browser started at 125% (a real screen scaling), a 1536 x 864 window ---------- */
async function desktop(width, height, tag, pictures) {
  const browser = await chromium.launch({ headless: true, ...launchOptions, args: ['--force-device-scale-factor=1.25', `--window-size=${width},${height}`] })
  const m = measures[tag] = {}
  for (const state of STATES) {
    /* a page of its own for each state, so both start from the same week, the same scroll and the app's opening state */
    const ctx = await browser.newContext({ viewport: null })
    const page = await ctx.newPage()
    await signIn(page)
    await setProposed(page, state === 'proposed')
    // 4 (taken first — the app opens with the crew panel open): the lane stays beside the open panel, nothing changes
    await fold(page, false)
    m[state + '-open-start'] = await measure(page)
    if (pictures) await shot(page, `${tag}-${state}-4-panel-open`)
    // 1. folded, Monday at the front
    await fold(page, true)
    const start = m[state + '-folded-start'] = await measure(page)
    m[state + '-under-tab'] = await underTab(page)
    /* AS IT OPENS. Found while drawing (22 Nov 26): arriving from View-only Sched, the week opens 20px along — Monday hard
       against the window's left edge — where every arrow press lands a day 20px in. Today's behaviour on `main`, nothing
       to do with the right edge; pictured as it is, and put to him as a question of its own (close-ups L1 / L2). */
    if (pictures) {
      await shot(page, `${tag}-${state}-1-folded-start`)
      await page.screenshot({ path: join(OUT, `${tag}-${state}-R1-right-edge.png`), clip: { x: start.innerWidth - 420, y: 120, width: 420, height: 440 } })
      await page.screenshot({ path: join(OUT, `${tag}-${state}-L1-left-edge-as-opened.png`), clip: { x: 0, y: 250, width: 420, height: 300 } })
    }
    // 2. the next-day arrow, pressed until Sunday is at the front, then the previous-day arrow back: where each day lands
    const lands = []
    const press = async (sel, x) => {
      await page.mouse.move(x, Math.round(start.innerHeight * 0.52)); await page.waitForTimeout(150)
      await page.click(sel); await page.waitForTimeout(450)
      const mm = await measure(page)
      const front = mm.days.filter(d => d.left > -2).sort((p, q) => p.left - q.left)[0]
      lands.push({ arrow: sel.includes('next') ? 'next' : 'prev', front: front.day, left: front.left, scrollLeft: mm.weekScrollLeft })
    }
    for (let i = 0; i < 6; i++) {
      await press('.week-nav.next', start.innerWidth - 4)
      if (pictures && i === 0) { await page.mouse.move(700, 500); await page.waitForTimeout(300); await shot(page, `${tag}-${state}-2-after-one-press`) }
    }
    for (let i = 0; i < 6; i++) await press('.week-nav.prev', 4)
    if (pictures) {   // Monday again, brought back by the arrow: 20px in, not where it opened
      await page.mouse.move(700, 500); await page.waitForTimeout(300)
      await page.screenshot({ path: join(OUT, `${tag}-${state}-L2-left-edge-after-arrows.png`), clip: { x: 0, y: 250, width: 420, height: 300 } })
      await shot(page, `${tag}-${state}-5-folded-monday-by-arrow`)
    }
    m[state + '-arrow-presses'] = lands
    // 3. the strip's far end — the foot scroll bar's own track taken fully right
    await page.mouse.move(700, 500)
    await page.evaluate(() => { const t = document.getElementById('hsTrack'); t.scrollLeft = t.scrollWidth })
    await page.waitForTimeout(500)
    m[state + '-folded-end'] = await measure(page)
    if (pictures) await shot(page, `${tag}-${state}-3-folded-far-end`)
    await ctx.close()
  }
  await browser.close()
}

/* ---------- his iPhone: 402 x 874, WebKit, touch ---------- */
async function phone() {
  const browser = await webkit.launch({ headless: true })
  const m = measures.phone = {}
  for (const state of STATES) {
    const ctx = await browser.newContext({ ...devices['iPhone 15 Pro'], viewport: { width: 402, height: 874 } })
    const page = await ctx.newPage()
    await signIn(page)
    await setProposed(page, state === 'proposed')
    m[state] = await page.evaluate(() => {
      const wk = document.querySelector('#page-editsched .week'), r = wk.getBoundingClientRect()
      const d = wk.querySelector('.day').getBoundingClientRect()
      const tab = document.querySelector('#page-editsched .eroster .ros-tab')?.getBoundingClientRect()
      return { innerWidth, dpr: devicePixelRatio, weekRight: r.right, dayLeft: d.left, dayRight: d.right, tabLeft: tab?.left, tabRight: tab?.right, boardPadRight: getComputedStyle(document.querySelector('#page-editsched .edit-board')).paddingRight }
    })
    await shot(page, `phone-${state}`)
    await ctx.close()
  }
  await browser.close()
}

await desktop(1536, 864, 'pc', true)
/* other windows — the narrowest that still gets the desktop layout, a tablet on its side, a laptop, and the two widths
   where a whole day ends within 26px of the window's edge (1140, and 1707 = a 2560-wide screen at 150%) */
for (const w of [822, 1024, 1140, 1280, 1707, 1920]) await desktop(w, 864, 'w' + w, w === 1140)
await phone()
writeFileSync(join(OUT, 'measures.json'), JSON.stringify({ errors, measures }, null, 1))
console.log('errors:', errors.length)
