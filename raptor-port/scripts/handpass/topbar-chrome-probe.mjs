// THE TOP BAR IN CHROME ON HIS IPHONE — the roll-call and the try at reproducing it (15 Nov 26, [TOPBAR-LOOSE-APPROVALS-QUALS],
// his D2025). Nothing in the app is changed by this script; it only measures a built folder.
//   TB_DIST    the built folder to serve (required) — served from inside the test browser, no server, no port held
//   TB_OUT     the folder for the log and pictures (required)
//   TB_ENGINE  webkit (default) or chromium — his iPhone's engine, or Chromium's phone emulation (touch flings by CDP)
//   TB_ORIGIN  the address it is served at (default http://localhost:4293 — the app's test hooks answer only on localhost)
// Run from raptor-port/:  TB_DIST=<dist> TB_OUT=<folder> node scripts/handpass/topbar-chrome-probe.mjs
// It writes rollcall-<engine>.json (how each page holds its top bar and what is pinned under it, at 402 × 874), flick-<engine>.json
// (every frame of a flick to the very foot of Approvals, Quals and Edit Schedule: the bar's top against the visible top,
// the window's and the visible screen's heights, the scroll) and pictures of Quals, Edit Schedule and Approvals' slim bar
// with and without ?barprobe (barprobe-* and noprobe-*); TB_PICS_ONLY=1 takes only the pictures (log-pics-<engine>.txt).
import { createRequire } from 'node:module'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { serveDist } from '../drawcheck/lib.mjs'

const require = createRequire(new URL('../../package.json', import.meta.url))
const { chromium, webkit, devices } = require('@playwright/test')
const DIST = process.env.TB_DIST, OUT = process.env.TB_OUT && path.resolve(process.env.TB_OUT)
const ENGINE = process.env.TB_ENGINE || 'webkit'
const ORIGIN = process.env.TB_ORIGIN || 'http://localhost:4293'
if (!DIST || !existsSync(path.join(DIST, 'index.html'))) throw new Error('TB_DIST must name a built folder: ' + DIST)
if (!OUT) throw new Error('TB_OUT must name a folder')
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const LAUNCH = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const sleep = ms => new Promise(r => setTimeout(r, ms))
const errors = []

async function open(query = '') {
  const eng = ENGINE === 'webkit' ? webkit : chromium
  const browser = await eng.launch(ENGINE === 'webkit' ? {} : LAUNCH)
  const ctx = await browser.newContext({ ...devices['iPhone 13'], viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true })
  await serveDist(ctx, ORIGIN, DIST)
  const page = await ctx.newPage()
  page.on('pageerror', e => errors.push('pageerror: ' + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 200)) })
  await page.goto(ORIGIN + '/' + query)
  await page.waitForSelector('#luser')
  await page.evaluate(() => window.lwSetMemberToday && window.lwSetMemberToday('2026-01-05'))
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await sleep(600)
  return { browser, page }
}
/* every page, by its name in the app; the Leave War's own pages by their tabs */
const PAGES = [
  ['Edit Schedule', 'editsched'], ['View-only Sched', 'viewsched'], ['Inputs', 'inputs'], ['Quals', 'quals'], ['Logic', 'logic'],
  ['Leave War grid', 'leavewar', 'lw-tab-grid'], ['Approvals', 'leavewar', 'lw-tab-approvals'], ['Balances', 'leavewar', 'lw-tab-balances'],
  ['Tracker', 'tracker'], ['Help', 'help'], ['Admin', 'admin'],
]
async function goTo(page, [, p, tab]) {
  await page.evaluate(x => window.go(x), p)
  await page.waitForFunction(x => window.CURPAGE === x, p)
  if (p === 'leavewar') await page.waitForSelector('[data-testid^="row-"]', { state: 'attached', timeout: 20000 })
  if (p === 'tracker') await page.waitForSelector('#page-tracker #board *, #trk-nocourse', { state: 'attached', timeout: 20000 }).catch(() => {})
  if (tab) { await page.locator(`[data-testid="${tab}"]`).first().click(); await sleep(500) }
  await page.evaluate(() => window.scrollTo(0, 0))
  await sleep(500)
}
/* the roll-call of one page: the bar, what scrolls, the page's height, what is pinned under the bar */
const measure = page => page.evaluate(() => {
  const bar = document.querySelector('#shell > .topbar')
  const cs = getComputedStyle(bar), b = bar.getBoundingClientRect()
  const se = document.scrollingElement
  /* only the page on screen (the Leave War and the Tracker stay laid out, dozing, once visited), and what is fixed outside
     every page (the app's own windows and rails) */
  const on = document.querySelector('#shell > .page.on')
  const inScope = e => on.contains(e) || !e.closest('#shell > .page')
  const seen = e => (e.checkVisibility ? e.checkVisibility({ opacityProperty: true, visibilityProperty: true }) : true)
  const uniq = list => [...new Map(list.map(x => [JSON.stringify(x), x])).values()]
  const scrollers = [...document.querySelectorAll('#shell *')].filter(inScope).filter(e => {
    const s = getComputedStyle(e)
    return /(auto|scroll)/.test(s.overflowY) && e.scrollHeight > e.clientHeight + 1 && e.clientHeight > 200 && e.getClientRects().length
  }).map(e => ({ el: e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : ''), h: e.clientHeight, content: e.scrollHeight }))
  const pinned = [...document.querySelectorAll('#shell *')].filter(inScope).filter(e => {
    if (e === bar || bar.contains(e) || !seen(e)) return false
    const s = getComputedStyle(e)
    if (s.position !== 'fixed' && s.position !== 'sticky') return false
    const r = e.getBoundingClientRect()
    return r.width > 40 && r.height > 8 && r.top < 260 && r.bottom > 0
  }).map(e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return { el: (e.dataset.testid ? '[' + e.dataset.testid + ']' : e.tagName.toLowerCase()) + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : ''), pos: s.position, top: Math.round(r.top), h: Math.round(r.height) } })
  const hs = getComputedStyle(document.documentElement), bs = getComputedStyle(document.body)
  return {
    bar: { position: cs.position, top: Math.round(b.top), height: Math.round(b.height), willChange: cs.willChange },
    windowScrolls: se.scrollHeight > se.clientHeight + 1, pageH: se.scrollHeight, winH: innerHeight, screens: +(se.scrollHeight / innerHeight).toFixed(2),
    overscroll: { html: hs.overscrollBehaviorY, body: bs.overscrollBehaviorY }, scrollers: uniq(scrollers), pinned: uniq(pinned),
  }
})
/* every frame from now until stopped: the bar's top against the visible top, the screen's sizes, the scroll */
const startFrames = page => page.evaluate(() => {
  window.__tbFrames = []; window.__tbOn = true
  const bar = document.querySelector('#shell > .topbar'), t0 = performance.now()
  const tick = () => {
    if (!window.__tbOn) return
    const vv = visualViewport, b = bar.getBoundingClientRect(), se = document.scrollingElement
    const row = [...document.querySelectorAll('[data-testid="qsticky-head"]')].find(e => Number(getComputedStyle(e).opacity) > 0.5)
    window.__tbFrames.push({ t: Math.round(performance.now() - t0), sY: Math.round(scrollY * 10) / 10, max: se.scrollHeight - innerHeight, iH: innerHeight, vvH: Math.round(vv.height * 10) / 10, vvTop: Math.round(vv.offsetTop * 10) / 10, bar: Math.round((b.top - vv.offsetTop) * 10) / 10, row: row ? Math.round((row.getBoundingClientRect().top - b.bottom) * 10) / 10 : null })
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
})
const stopFrames = page => page.evaluate(() => { window.__tbOn = false; return window.__tbFrames })
/* a flick to the very foot: Chromium by a real touch fling (CDP), WebKit by a smooth scroll (below) */
async function flickToFoot(page) {
  if (ENGINE === 'chromium') {
    /* raw touches, fast, then let go — the page flings on by itself (synthesizeScrollGesture moved nothing here) */
    const cdp = await page.context().newCDPSession(page)
    for (let k = 0; k < 3; k++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 200, y: 700 }] })
      for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 200, y: 700 - i * 70 }] }); await sleep(8) }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
      await sleep(250)
    }
  } else {
    /* mobile WebKit takes no wheel and Playwright has no touch swipe there, so the page is glided to its foot by the
       browser's own smooth scroll — it moves every frame as a flick does, but it cannot spring past the end */
    await page.evaluate(() => window.scrollTo({ top: 1e6, behavior: 'smooth' }))
  }
}
function summary(name, fr) {
  const gap = fr.reduce((m, f) => Math.max(m, Math.abs(f.bar)), 0)
  const rowGap = fr.filter(f => f.row !== null).reduce((m, f) => Math.max(m, Math.abs(f.row)), 0)
  const past = fr.reduce((m, f) => Math.max(m, f.sY - f.max), -1e9)
  const ih = [...new Set(fr.map(f => f.iH))], vvh = [...new Set(fr.map(f => f.vvH))], vvt = [...new Set(fr.map(f => f.vvTop))]
  return { page: name, frames: fr.length, lastScroll: fr.at(-1)?.sY, foot: fr.at(-1)?.max, worstBarGap: gap, worstRowGap: rowGap, mostPastFoot: past, innerHeights: ih, visibleHeights: vvh, visibleTops: vvt }
}

const log = []
/* TB_PICS_ONLY=1 skips the roll-call and the flicks: only the panel's pictures, with and without the switch */
const PICS_ONLY = !!process.env.TB_PICS_ONLY
if (!PICS_ONLY) {
const { browser, page } = await open()
const roll = {}
for (const p of PAGES) {
  try {
    await goTo(page, p)
    const top = await measure(page)
    /* and at the page's foot, where a pinned row has come up under the bar */
    await page.evaluate(() => window.scrollTo(0, 1e6)); await page.waitForTimeout(400)
    const foot = await measure(page)
    roll[p[0]] = { ...top, pinnedAtFoot: foot.pinned }
  } catch (e) { roll[p[0]] = { error: String(e).slice(0, 200) } }
  log.push(p[0] + ': ' + JSON.stringify(roll[p[0]]))
}
writeFileSync(path.join(OUT, `rollcall-${ENGINE}.json`), JSON.stringify(roll, null, 1))
const flicks = {}
for (const p of PAGES.filter(x => ['Approvals', 'Quals', 'Edit Schedule'].includes(x[0]))) {
  await goTo(page, p)
  /* a long page starts a screen from its foot, so the flick reaches the very foot as on his phone */
  await page.evaluate(() => window.scrollTo(0, Math.max(0, document.scrollingElement.scrollHeight - innerHeight * 2)))
  await sleep(300)
  await startFrames(page)
  await flickToFoot(page)
  await sleep(2500)
  const fr = await stopFrames(page)
  flicks[p[0]] = { summary: summary(p[0], fr), frames: fr }
  log.push('FLICK ' + JSON.stringify(flicks[p[0]].summary))
}
writeFileSync(path.join(OUT, `flick-${ENGINE}.json`), JSON.stringify(flicks, null, 1))
const noPanel = await page.evaluate(() => !document.querySelector('[data-testid="barprobe"]'))
log.push('without ?barprobe, no panel in the page: ' + noPanel)
await browser.close()
}

/* the trial switch, with and without it: Quals and Edit Schedule flicked to their foot, and the Leave War grid with
   Approvals' slim bar showing (a request's dates tapped) — the panel must stand clear of the slim bar's Back and Close */
const SHOTS = [['quals', 'Quals'], ['schedule', 'Edit Schedule'], ['approvals-slim', 'Approvals']]
const boxOf = (page, sel) => page.evaluate(s => { const r = document.querySelector(s)?.getBoundingClientRect(); return r ? [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] : null }, sel)
for (const query of ['?barprobe', '']) {
  const t = await open(query)
  for (const [file, name] of SHOTS) {
    await goTo(t.page, PAGES.find(x => x[0] === name))
    if (file === 'approvals-slim') {
      await t.page.locator('[data-testid="appr-dates"]').first().click()
      await t.page.waitForSelector('[data-testid="appr-slim"]')
      await sleep(1200)
    } else {
      await flickToFoot(t.page)
      await sleep(1200)
    }
    const text = await t.page.evaluate(() => document.querySelector('[data-testid="barprobe"]')?.textContent ?? null)
    const box = await boxOf(t.page, '[data-testid="barprobe"]')
    const slim = await boxOf(t.page, '[data-testid="appr-slim"]')
    const clear = box && slim ? box[1] + box[3] <= slim[1] : null
    log.push(`${query || 'without the switch'} on ${file}: panel ${JSON.stringify(box)} slim bar ${JSON.stringify(slim)}` + (clear === null ? '' : ` panel clear above it: ${clear}`) + (text ? '\n' + text : ''))
    await t.page.screenshot({ path: path.join(OUT, `${query ? 'barprobe' : 'noprobe'}-${ENGINE}-${file}.png`) })
  }
  await t.browser.close()
}
log.push('errors: ' + (errors.length ? errors.join(' | ') : 'none'))
writeFileSync(path.join(OUT, `log-${PICS_ONLY ? 'pics-' : ''}${ENGINE}.txt`), log.join('\n') + '\n')
console.log(log.join('\n'))
