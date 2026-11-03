/* [WEEK-CROSS-END-CARDS] — the pictures for the swipeable mock-up (3 Nov 26, his "show me a mock up to test the feel first
   before building"). Real pictures of the built app at his iPhone's size (402 x 874, 3x):
   - every day card of three weeks (6, 13 and 20 Jul 2026), full height, parked on its own snap point;
   - the phone page's top (everything above the week strip) for each of those weeks;
   - the four end cards the proposal needs (Sun 12 Jul, Mon 13 Jul, Sun 19 Jul, Mon 20 Jul): the DESKTOP's next-week
     preview markup (ui/peek.ts, taken from a 1440-wide page, where it is drawn) put into the phone's strip and pictured
     at phone width. Its desktop-only line "Next week: click a day to load it" is taken out — on a phone the card is
     scrolled onto, not clicked. The desktop's dark veil over a preview is a desktop rule, so these come out plain; the
     mock-up page draws the veil itself for its "dimmed" switch.
   Also measured: how long the app takes to load a week (window.loadWeek) on this PC, for the mock-up's pause at rest.
   Run against a served build: PORT=4237 node scripts/handpass/ws-endcards-mock.mjs
   Then the pictures are made small enough for a phone (Python with Pillow, from the set's folder), into mock/img/ beside
   the page (mock/index.html, which carries each picture's height from raw/sizes.json):
     for every raw/<name>.png but the tops: Image.open(f).convert('RGB').save('mock/img/<name>.webp', quality=78, method=6)
     raw/top-13-07.png: its first 47 CSS px (141 px at 3x) -> mock/img/topbar.webp (the bar that stays put),
                        the rest -> mock/img/toolrow.webp, both quality=82
   raw/ is not kept: it is 14 MB and this script makes it again. */
import { createRequire } from 'node:module'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
const require = createRequire('C:/Users/User/projects/Raptor/raptor-port/package.json')
const { chromium } = require('playwright')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const BASE = `http://localhost:${process.env.PORT || 4237}`
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-03-week-cross-end-cards/raw'
mkdirSync(OUT, { recursive: true })
const WEEKS = ['06/07/2026', '13/07/2026', '20/07/2026']
const tag = w => w.slice(0, 5).replace('/', '-')   // '13/07/2026' -> '13-07'
const problems = []

async function open(browser, viewport, phone) {
  const context = await browser.newContext({ baseURL: BASE, viewport, deviceScaleFactor: phone ? 3 : 1, isMobile: phone, hasTouch: phone })
  const page = await context.newPage()
  page.on('console', m => { if (m.type() === 'error') problems.push('console.error ' + m.text().slice(0, 200)) })
  page.on('pageerror', e => problems.push('pageerror ' + String(e.message).slice(0, 200)))
  page.on('response', r => { if (r.status() >= 400) problems.push('HTTP ' + r.status() + ' ' + r.url().slice(0, 120)) })
  await page.goto('/')
  await page.waitForSelector('#luser')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('editsched'))
  await page.waitForFunction(() => window.CURPAGE === 'editsched')
  await page.waitForSelector('#eWeek .day[data-day="6"]', { state: 'attached' })
  await page.waitForTimeout(500)
  return { context, page }
}
async function load(page, wk) {
  const ms = await page.evaluate(w => { const t = performance.now(); window.loadWeek(w); return performance.now() - t }, wk)
  await page.waitForFunction(w => window.CURWEEK === w, wk)
  await page.waitForTimeout(600)
  return ms
}
/* park the strip on a day with no animation, the way the walk scripts do, then let it rest */
async function park(page, d) {
  await page.evaluate(day => {
    const w = document.querySelector('#eWeek')
    const ds = w.querySelectorAll('.day:not(.peek)')
    w.style.scrollBehavior = 'auto'
    w.scrollLeft = ds[day].offsetLeft - ds[0].offsetLeft + 12
    w.style.scrollBehavior = ''
  }, d)
  await page.waitForTimeout(400)
}

const browser = await chromium.launch({ headless: true, ...launchOptions })

/* 1 · the desktop's preview markup: loading week W shows week W+1 as its preview */
const desk = await open(browser, { width: 1440, height: 900 }, false)
const peekOf = {}
for (const [load_, wk, day] of [['29/06/2026', '06/07/2026', 6], ['06/07/2026', '13/07/2026', 0], ['06/07/2026', '13/07/2026', 6], ['13/07/2026', '20/07/2026', 0]]) {
  await load(desk.page, load_)
  const html = await desk.page.evaluate(d => {
    const el = document.querySelector(`#eWeek .day.peek[data-peek-day="${d}"]`)
    if (!el) return null
    const c = el.cloneNode(true); c.querySelectorAll('.peek-nextwk').forEach(n => n.remove())
    return c.outerHTML
  }, day)
  if (!html) throw new Error(`no preview card for ${wk} day ${day} (loaded ${load_})`)
  peekOf[`${tag(wk)}-${day}`] = html
}
await desk.context.close()

/* 2 · the phone: every day card of the three weeks, the page's top, and the end cards drawn at phone width */
const ph = await open(browser, { width: 402, height: 874 }, true)
const { page } = ph
const loadMs = []
const sizes = {}
for (const wk of WEEKS) {
  loadMs.push(Math.round(await load(page, wk)))
  await page.evaluate(() => window.scrollTo(0, 0))
  await park(page, 0)
  const top = await page.evaluate(() => Math.round(document.querySelector('#eWeek').getBoundingClientRect().top))
  await page.screenshot({ path: `${OUT}/top-${tag(wk)}.png`, clip: { x: 0, y: 0, width: 402, height: top } })
  sizes[`top-${tag(wk)}`] = [402, top]
  /* a card taller than the screen is pictured by scrolling the page, and every bar that stays put (the top bar) is then
     drawn across it — so they are hidden for the card pictures, and shown again for the next week's top */
  await page.evaluate(() => {
    const keep = document.querySelector('#eWeek')
    for (const el of document.querySelectorAll('body *')) {
      const p = getComputedStyle(el).position
      if ((p === 'fixed' || p === 'sticky') && !keep.contains(el)) { el.dataset.mockHid = '1'; el.style.visibility = 'hidden' }
    }
  })
  for (let d = 0; d < 7; d++) {
    await park(page, d)
    const el = page.locator(`#eWeek .day[data-day="${d}"]`)
    const box = await el.boundingBox()
    await el.screenshot({ path: `${OUT}/${tag(wk)}-${d}.png` })
    sizes[`${tag(wk)}-${d}`] = [Math.round(box.width), Math.round(box.height)]
  }
  await page.evaluate(() => document.querySelectorAll('[data-mock-hid]').forEach(el => { el.style.visibility = ''; delete el.dataset.mockHid }))
}
/* the end cards: the preview markup put after Sunday in the phone's strip, pictured, then removed */
await load(page, '13/07/2026')
await page.evaluate(() => {
  for (const el of document.querySelectorAll('body *')) {
    const p = getComputedStyle(el).position
    if (p === 'fixed' || p === 'sticky') el.style.visibility = 'hidden'
  }
})
for (const [k, html] of Object.entries(peekOf)) {
  /* its own strip, a sibling of the week with the week's own class, because the app's redraw removes anything after
     Sunday inside the real one (peek.ts mountPeek) */
  await page.evaluate(h => {
    document.querySelectorAll('.mock-strip').forEach(n => n.remove())
    const w = document.querySelector('#eWeek')
    const s = document.createElement('div'); s.className = 'week mock-strip'
    s.innerHTML = h; s.firstElementChild.classList.add('mock-endcard')
    w.after(s)
  }, html)
  await page.waitForTimeout(400)
  const el = page.locator('.mock-strip .mock-endcard')
  if (await el.count() !== 1) throw new Error('the end card was wiped before its picture: ' + k)
  const box = await el.boundingBox()
  await el.screenshot({ path: `${OUT}/end-${k}.png` })
  sizes[`end-${k}`] = [Math.round(box.width), Math.round(box.height)]
  await page.evaluate(() => document.querySelectorAll('.mock-strip').forEach(n => n.remove()))
}
await browser.close()
writeFileSync(`${OUT}/sizes.json`, JSON.stringify({ sizes, loadMs }, null, 1))
console.log(JSON.stringify({ loadMs, n: Object.keys(sizes).length, problems }, null, 1))
