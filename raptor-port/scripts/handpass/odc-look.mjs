// THE HOST'S OWN SHORT LOOK — [ONE-DATE-CALENDAR] step one (D786, D795, D796, D797), 13 Oct 26.
// It drives the REAL built bundle (dist) in a real browser, reaches every date box by the app's own controls, opens the
// calendar on each, MEASURES what a picture alone normalises (the box inside its form and the screen; the card on the
// screen; the element at the card's centre) and saves a picture a step. It writes only under this checkout.
//   npm run build && node scripts/handpass/odc-look.mjs [phone|desktop|narrow|side] [out dir]
// VERSION 5
import { chromium } from '@playwright/test'
import { createServer } from 'node:http'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs'
import { dirname, extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..', '..')
const SIZES = { phone: [390, 844, true], narrow: [320, 568, true], wide: [440, 956, true], side: [844, 390, true], desktop: [1440, 900, false], laptop: [1280, 700, false] }
const WHICH = process.argv[2] || 'phone'
const [W, H, TOUCH] = SIZES[WHICH]
const OUT = resolve(ROOT, process.argv[3] || `docs/img/handpass/2026-10-13-one-date-calendar/look-${WHICH}`)
if (existsSync(OUT)) for (const f of readdirSync(OUT)) rmSync(join(OUT, f))
mkdirSync(OUT, { recursive: true })
console.log(`odc-look VERSION 5 — ${WHICH} ${W}x${H} touch=${TOUCH} -> ${OUT}`)

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const DIST = resolve(ROOT, 'dist')
if (!existsSync(join(DIST, 'index.html'))) { console.error('no dist/index.html — run npm run build first'); process.exit(1) }
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2' }
const server = createServer((req, res) => {
  let file = normalize(join(DIST, decodeURIComponent((req.url || '/').split('?')[0])))
  if (!file.startsWith(DIST) || !existsSync(file) || statSync(file).isDirectory()) file = join(DIST, 'index.html')
  res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' }); res.end(readFileSync(file))
})
await new Promise(done => server.listen(0, '127.0.0.1', done))
const URL0 = `http://127.0.0.1:${server.address().port}/`
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: TOUCH, hasTouch: TOUCH })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push('pageerror ' + String(e).slice(0, 200)))
page.on('console', m => { if (m.type() === 'error') errors.push('console ' + m.text().slice(0, 200)) })
page.on('response', r => { if (r.status() >= 400) errors.push(`http ${r.status()} ${r.url().slice(0, 120)}`) })

let n = 0, fails = 0
const shot = async name => { const f = `${String(++n).padStart(2, '0')}-${name}.png`; await page.screenshot({ path: join(OUT, f) }); console.log(`  picture ${f}`) }
const check = (ok, what, seen) => { if (!ok) fails++; console.log(`  ${ok ? 'PASS' : 'FAIL'} ${what} — saw ${typeof seen === 'string' ? seen : JSON.stringify(seen)}`) }
const press = async sel => { const l = page.locator(sel).first(); if (TOUCH) await l.tap(); else await l.click(); await page.waitForTimeout(260) }
const vis = sel => page.evaluate(s => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }, sel)
const rect = sel => page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) } }, sel)
const text = sel => page.locator(sel).first().innerText()

/* the box is inside the screen and inside the form that holds it (D786 — "fit the phone size which might be variable") */
async function boxFits(sel, holder, name) {
  const b = await rect(sel), h = await rect(holder)
  check(!!b && !!h && b.l >= 0 && b.r <= W && b.l >= h.l - 1 && b.r <= h.r + 1, `${name}: its box is inside its form and the screen`, { box: b, form: h, screen: W })
}
/* what a press opened is proved ON SCREEN before anything in it is pressed (the checking order, §7.2) */
async function cardOnTop(name) {
  await page.waitForSelector('[data-testid="dcal-card"]', { timeout: 3000 })
  await page.waitForTimeout(220)
  const r = await page.evaluate(() => {
    const c = document.querySelector('[data-testid="dcal-card"]'); const b = c.getBoundingClientRect()
    const at = (x, y) => { const h = document.elementFromPoint(x, y); return !!h && (h === c || c.contains(h)) }
    return { l: Math.round(b.left), t: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom), w: Math.round(b.width), h: Math.round(b.height),
      centre: at(b.left + b.width / 2, b.top + b.height / 2), corners: [at(b.left + 6, b.top + 6), at(b.right - 6, b.top + 6), at(b.left + 6, b.bottom - 6), at(b.right - 6, b.bottom - 6)],
      scrollW: c.scrollWidth, clientW: c.clientWidth, scrollH: c.scrollHeight, clientH: c.clientHeight, month: document.querySelector('[data-testid="dcal"]').getAttribute('data-month') }
  })
  check(r.l >= 0 && r.t >= 0 && r.r <= W && r.b <= H, `${name}: the calendar is wholly on the screen`, r)
  check(r.centre && r.corners.every(Boolean), `${name}: the calendar is on top at its centre and its four corners`, { centre: r.centre, corners: r.corners })
  check(r.scrollW <= r.clientW && r.scrollH <= r.clientH, `${name}: nothing in the card is cut or scrolls`, { scrollW: r.scrollW, clientW: r.clientW, scrollH: r.scrollH, clientH: r.clientH })
  return r
}
const pick = async iso => { await press(`[data-testid="dcal-day-${iso}"]`); await page.waitForTimeout(200) }
const closeCal = async () => { if (await vis('[data-testid="dcal-scrim"]')) { await page.mouse.click(4, 4); await page.waitForTimeout(250) } }
/* a real finger: touch events through the browser's own input pipeline. THE FINGER RESTS BEFORE IT LIFTS, as a finger
   does: a scripted swipe that lifts at full speed leaves the test browser believing a fling is under way, and it then
   SWALLOWS THE NEXT TAP, seconds later — found 13 Oct 26, and the same on the Inputs calendar built before this job
   (so it is the script's world, not this change; a real phone is the proof — his look). */
const cdp = await ctx.newCDPSession(page)
async function swipe(sel, dx, dy = 0, frac = 0.5) {
  /* the part of the element a finger can reach: inside the screen and inside the window body that scrolls it */
  const b = await page.evaluate(s => {
    const e = document.querySelector(s); const r = e.getBoundingClientRect()
    const w = e.closest('.win-body'); const wr = w ? w.getBoundingClientRect() : { top: 0, bottom: innerHeight }
    const t = Math.max(r.top, wr.top, 0), bt = Math.min(r.bottom, wr.bottom, innerHeight)
    return { l: r.left, w: r.width, t, h: bt - t }
  }, sel)
  if (b.h < 20) throw new Error(`nothing of ${sel} is in reach of a finger (${JSON.stringify(b)})`)
  const x0 = b.l + b.w / 2 - dx / 2, y0 = b.t + Math.min(b.h - 6, Math.max(6, b.h * frac))
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] })
  for (let i = 1; i <= 6; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + dx * i / 6, y: y0 + dy * i / 6 }] })
  await page.waitForTimeout(90)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForTimeout(380)
}
async function step(name, fn) {
  console.log(`\n== ${name}`)
  try { await fn() } catch (e) { fails++; console.log(`  FAIL (the step could not finish) ${String(e).split('\n')[0].slice(0, 220)}`); await shot('STOPPED-' + name.replace(/[^a-z0-9]+/gi, '-').slice(0, 30)).catch(() => {}) }
}

await page.goto(URL0)
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })

await step('the Calendar window, and "Every Thursday"', async () => {
  await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(300)
  await press('#inGear'); await press('[data-testid="iset-days"]')
  if (await vis('[data-testid="win-inputsset-x"]')) await page.locator('[data-testid="win-inputsset-x"]').evaluate(e => e.click())
  await page.waitForSelector('[data-testid="win-days"]')
  console.log(`  the Calendar window is on: ${await text('[data-testid="days-month"]')}`)
  await shot('calendar-window')
  if (TOUCH) {
    const m0 = await text('[data-testid="days-month"]')
    await swipe('[data-testid="days-grid"]', -140)
    const m1 = await text('[data-testid="days-month"]')
    check(m1 !== m0, 'a finger slid left on the month turns it to the next', `${m0} -> ${m1}`)
    await swipe('[data-testid="days-grid"]', 140)
    check(await text('[data-testid="days-month"]') === m0, 'a finger slid right goes back', await text('[data-testid="days-month"]'))
    /* the empty room under the month, at the foot of the window */
    const parts = await rect('[data-testid="days-parts"]'), win = await rect('[data-testid="win-days"]'), grid = await rect('[data-testid="days-grid"]')
    check(parts.b >= win.b - 24, 'the swiped part reaches the foot of the window', { parts, win, grid })
    await swipe('[data-testid="days-parts"]', -140, 0, 0.97)
    check(await text('[data-testid="days-month"]') !== m0, 'a swipe in the room at the foot of the part turns the month too', await text('[data-testid="days-month"]'))
    await swipe('[data-testid="days-parts"]', 140, 0, 0.97)
    /* a move more down than sideways is the page's own */
    await swipe('[data-testid="days-grid"]', -60, 120)
    check(await text('[data-testid="days-month"]') === m0, 'a finger moved more down than sideways turns nothing', await text('[data-testid="days-month"]'))
  }
  await press('[data-testid="days-wd-3"]')
  await page.waitForSelector('[data-testid="win-every"]')
  await boxFits('[data-testid="every-from"]', '[data-testid="win-every"] .win-body', 'From')
  console.log(`  From reads: ${await text('[data-testid="every-from"]')}`)
  await shot('every-thursday')
  await press('[data-testid="every-from"]')
  const c = await cardOnTop('From')
  await shot('every-from-calendar')
  const nav0 = await rect('[data-testid="dcal-next"]')
  for (let i = 0; i < 12; i++) await press('[data-testid="dcal-next"]')
  const nav1 = await rect('[data-testid="dcal-next"]')
  check(nav0.l === nav1.l && nav0.t === nav1.t, 'the next arrow stays where it is through twelve months', { before: nav0, after: nav1 })
  for (let i = 0; i < 12; i++) await press('[data-testid="dcal-prev"]')
  await press('[data-testid="dcal-title"]')
  const lists = await rect('[data-testid="dcal-lists"]'), c2 = await rect('[data-testid="dcal-card"]')
  check(c2.h === c.h, 'the card keeps its height when the lists take the dates’ place', { dates: c.h, lists: c2.h })
  await shot('every-from-lists')
  /* scroll the year list by one row and let it settle */
  const yr0 = await text('[data-testid="dcal-title"]')
  await page.locator('[data-testid="dcal-years"]').evaluate(e => { e.scrollTop += 44 })
  await page.waitForTimeout(500)
  const yr1 = await text('[data-testid="dcal-title"]')
  check(yr1 !== yr0, 'the year list scrolled one row chooses the next year', `${yr0} -> ${yr1}`)
  await page.locator('[data-testid="dcal-years"]').evaluate(e => { e.scrollTop -= 44 })
  await page.waitForTimeout(500)
  await press('[data-testid="dcal-title"]')
  await pick(`${c.month}-19`)
  check(!(await vis('[data-testid="dcal-card"]')), 'a tap on a date closes the calendar', await text('[data-testid="every-from"]'))
  await press('[data-testid="every-until-date"]')
  await boxFits('[data-testid="every-until"]', '[data-testid="win-every"] .win-body', 'Until')
  await press('[data-testid="every-until"]')
  await cardOnTop('Until')
  await shot('every-until-calendar')
  await closeCal()
  check(await vis('[data-testid="win-every"]'), 'a tap outside the calendar leaves the "Every …" window up', await text('[data-testid="every-until"]'))
  await shot('every-both-boxes')
  await press('[data-testid="every-cancel"]')
  if (await vis('[data-testid="days-tab-holidays"]')) {
    await press('[data-testid="days-tab-holidays"]')
    const y0 = await text('[data-testid="hol-year"]')
    if (TOUCH) {
      await swipe('[data-testid="days-parts"]', -140, 0, 0.5)
      check(await text('[data-testid="hol-year"]') === String(+y0 + 1), 'a finger slid left on the Holidays list goes to the next year', `${y0} -> ${await text('[data-testid="hol-year"]')}`)
      await swipe('[data-testid="days-parts"]', 140, 0, 0.9)
      check(await text('[data-testid="hol-year"]') === y0, 'and right, in the room under the list, back', await text('[data-testid="hol-year"]'))
    }
    await shot('holidays-list')
  }
  await page.locator('[data-testid="win-days-x"]').evaluate(e => e.click())
})

await step('Admin → Users: a new person’s Post in', async () => {
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(400)
  await page.evaluate(() => { const b = [...document.querySelectorAll('#page-admin button')].find(b => b.getBoundingClientRect().width > 0 && /^Users/.test(b.textContent.trim())); if (b) b.click() })
  await page.waitForTimeout(300)
  await page.locator('#accAddPostIn').scrollIntoViewIfNeeded()
  await boxFits('#accAddPostIn', '#admUsers', 'Post in')
  await press('#accAddPostIn')
  await cardOnTop('Post in')
  await shot('users-postin')
  await closeCal()
})

await step('Admin → Data: the two single dates and the range', async () => {
  await page.evaluate(() => { const b = [...document.querySelectorAll('#page-admin button')].find(b => b.getBoundingClientRect().width > 0 && /^Data/.test(b.textContent.trim())); if (b) b.click() })
  await page.waitForTimeout(300)
  if (!(await vis('#admWipeDate'))) { await page.evaluate(() => window.go('admin')); await page.waitForTimeout(300); await page.evaluate(() => { const b = [...document.querySelectorAll('#page-admin button')].find(b => /^Data/.test(b.textContent.trim())); if (b) b.click() }); await page.waitForTimeout(300) }
  await page.locator('#admWipeDate').scrollIntoViewIfNeeded()
  await boxFits('#admWipeDate', '#admData', 'Older than')
  await press('#admWipeDate')
  const c = await cardOnTop('Older than')
  await shot('admin-older-than')
  await pick(`${c.month}-01`)
  await page.selectOption('#admWipeMode', 'range'); await page.waitForTimeout(250)
  await page.locator('#admWipeRun').scrollIntoViewIfNeeded()
  await boxFits('#admWipeRun', '#admData', 'the range calendar')
  await press(`[data-testid="admWipeRun-day-${c.month}-09"]`); await press(`[data-testid="admWipeRun-day-${c.month}-12"]`)
  console.log(`  the range says: ${await text('[data-testid="admWipeRun-foot"]')}`)
  await page.locator('#admWipe').scrollIntoViewIfNeeded()
  await shot('admin-range')
})

await step('Medical: the upchit date', async () => {
  await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(300)
  await press('#inMedBtn')
  const pend = page.locator('.medsec.med-pend .medcard')
  console.log(`  pending upchits on the Medical page: ${await pend.count()}`)
  await pend.first().scrollIntoViewIfNeeded(); await press('.medsec.med-pend .medcard')
  await page.waitForSelector('#docViewPop:not([hidden])'); await press('#docViewUpchit')
  await page.waitForSelector('#inpEditUpDate')
  await boxFits('#inpEditUpDate', '[data-testid="win-inputedit"] .win-body', 'Upchit date')
  await shot('upchit-form')
  await press('#inpEditUpDate')
  await cardOnTop('Upchit date')
  await shot('upchit-calendar')
  await closeCal()
  check(await vis('[data-testid="win-inputedit"]'), 'a tap outside the calendar leaves the upchit form up', '')
  await page.locator('[data-testid="win-inputedit-x"]').evaluate(e => e.click())
})

await step('the Leave War: PO from, PI from', async () => {
  await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(700)
  await page.evaluate(() => window.lwSetRole && window.lwSetRole('admin')); await page.waitForTimeout(300)
  const jul = page.locator('[data-testid="month-JUL"]'); if (await jul.count()) { await press('[data-testid="month-JUL"]'); await page.waitForTimeout(600) }
  const cell = page.locator('[data-testid="cell-slipway-2026-07-14"]')
  await cell.first().scrollIntoViewIfNeeded(); await press('[data-testid="cell-slipway-2026-07-14"]'); await page.waitForTimeout(400)
  await press('[data-testid="bid-postout"]')
  await page.waitForSelector('[data-testid="po-date"]')
  await page.locator('[data-testid="po-date"]').scrollIntoViewIfNeeded()
  await boxFits('[data-testid="po-date"]', '.bidsheet', 'PO from')
  await shot('lw-po-box')
  await press('[data-testid="po-date"]')
  await cardOnTop('PO from')
  await shot('lw-po-calendar')
  await pick('2026-07-20')
  check(await vis('.bidsheet'), 'a date picked over the sheet leaves the sheet up', await text('[data-testid="po-date"]'))
  check((await text('[data-testid="po-date"]')).includes('20 Jul 2026'), 'and the box reads the date picked', await text('[data-testid="po-date"]'))
  await shot('lw-po-picked')
})

console.log(`\n${fails ? fails + ' FAILED' : 'no failed check'} · ${n} pictures · ${errors.length ? 'ERRORS: ' + errors.join(' | ') : 'no console, page or 4xx errors'}`)
await browser.close(); server.close()
process.exit(fails ? 1 : 0)
