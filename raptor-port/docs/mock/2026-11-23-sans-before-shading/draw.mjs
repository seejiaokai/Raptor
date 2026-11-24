/* D2343 — THE SANS CALENDAR SHADES A MAN'S OWN DAYS BEFORE HIS SANS DATE (his "We can do the extra shading too",
   23 Nov 26; drawn before it is built, D1625). The world: the demo week, the clock held at Wed 15 Jul 26 09:00. The
   admin (Saber) posts Hex out as SANS from Fri 17 Jul through the Leave War's own sheet — saved, not yet run (a
   look-ahead). Then Hex signs in and opens Inputs → SANS.
   Frames, at his iPhone's 402 x 874 (WebKit, touch, 3x) and a desktop's 1536 x 864 (Chromium, 1x):
     1 today — Hex's SANS calendar as built (nothing marks the days he cannot commit for)
     2 proposed A — his days before Fri 17 faded: the day's own colour wash taken off, its figures dimmed
     3 proposed B — the same days striped, the Leave War's posting hatch, figures dimmed
     4 the admin's SANS calendar, unchanged by either (the shading is the man's own view only)
     5 today — Hex taps Thu 16, a day before his date: the day opens with no "+ Commitment" (the guardrail, D2340)
   The transform is ONE class on the existing day cells (`mk-before`), a style injected; nothing the app drew is
   removed. Run from raptor-port/ with the built app served at http://localhost:4180 (vite preview). */
import { chromium, webkit } from 'playwright'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, 'img'); mkdirSync(OUT, { recursive: true })
const BASE = process.env.BASE || 'http://localhost:4180'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const HEX = 'rocky', DATE = '2026-07-17'
const sleep = ms => new Promise(r => setTimeout(r, ms))

const STYLE = {
  A: `.sc-day.mk-before{background:var(--panel-2)!important;cursor:default}
      .sc-day.mk-before > *{opacity:.38}`,
  B: `.sc-day.mk-before{background:repeating-linear-gradient(45deg, var(--panel), var(--panel) 4px, rgba(58, 67, 79, .75) 4px, rgba(58, 67, 79, .75) 6px)!important;cursor:default}
      .sc-day.mk-before > *{opacity:.55}`,
}

async function signIn(page, user, pass) {
  await page.goto(BASE + '/')
  await page.waitForSelector('#luser')
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  try { await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }) }
  catch (e) { await page.screenshot({ path: join(OUT, `debug-signin-${user}.png`) }); console.log('  page text:', (await page.locator('body').innerText()).slice(0, 400)); throw e }
  await sleep(800)
}
async function tap(page, sel, touch) {
  const l = page.locator(sel).first()
  await l.waitFor({ state: 'visible', timeout: 8000 })
  await l.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(200)
  if (touch) await l.tap(); else await l.click()
  await sleep(400)
}
const go = async (page, p) => { await page.evaluate(x => window.go(x), p); await page.waitForFunction(x => window.CURPAGE === x, p); await sleep(500) }
async function postOutSans(page, touch) {
  await go(page, 'leavewar'); await sleep(900)
  if (await page.locator('[data-testid="month-JUL"]:visible').count()) { await tap(page, '[data-testid="month-JUL"]:visible', touch); await sleep(800) }
  await tap(page, `[data-testid="cell-${HEX}-${DATE}"]`, touch)
  await tap(page, '[data-testid="bid-more"]:visible', touch)
  await tap(page, '[data-testid="bid-postout"]:visible', touch)
  await tap(page, '[data-testid="po-sans"]:visible', touch)
  await tap(page, '[data-testid="po-confirm"]:visible', touch); await sleep(900)
  const ran = await page.evaluate(id => !!window.PEOPLE[id].san, HEX)
  if (ran) throw new Error('premise: the posting must not have run yet (a look-ahead)')
}
async function openSans(page, touch) {
  await go(page, 'inputs')
  await tap(page, '#inSansMode', touch)
  await page.waitForSelector('[data-testid="sanscal"]'); await sleep(700)
  const has = await page.locator(`[data-testid="sc-day-${DATE}"]`).count()
  if (!has) throw new Error('premise: July 2026 is not the month shown')
}
/* a neutral tap so no control is left hovered or focused before a picture */
const settle = async page => { await page.mouse.move(2, 2); await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur()); await sleep(250) }
async function shade(page, opt) {
  await page.evaluate(({ css, date }) => {
    let st = document.getElementById('mk-style'); if (!st) { st = document.createElement('style'); st.id = 'mk-style'; document.head.appendChild(st) }
    st.textContent = css
    for (const d of document.querySelectorAll('[data-testid="sanscal"] .sc-day[data-icday]')) d.classList.toggle('mk-before', d.getAttribute('data-icday') < date)
  }, { css: STYLE[opt], date: DATE })
  const n = await page.locator('[data-testid="sanscal"] .sc-day.mk-before').count()
  if (n < 10) throw new Error('premise: too few days shaded (' + n + ')')
  return n
}
const unshade = page => page.evaluate(() => { document.getElementById('mk-style')?.remove(); for (const d of document.querySelectorAll('.sc-day.mk-before')) d.classList.remove('mk-before') })
async function shot(page, name) {
  const top = await page.locator('[data-testid="sanscal"]').evaluate(e => e.getBoundingClientRect().top + window.scrollY)
  await page.evaluate(y => window.scrollTo(0, Math.max(0, y - 60)), top); await sleep(400)
  await page.screenshot({ path: join(OUT, name + '.png') })
  console.log('  saved', name)
}

const DEVICES = [
  { name: 'phone', engine: webkit, ctx: { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }, touch: true },
  { name: 'desktop', engine: chromium, ctx: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 }, touch: false },
]

for (const dev of DEVICES) {
  console.log(dev.name)
  const browser = await dev.engine.launch(dev.engine === chromium && existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
  /* the admin posts Hex out as SANS from Fri 17 — saved Wed 15, not yet run */
  const ca = await browser.newContext(dev.ctx)
  await ca.clock?.install?.({ time: new Date('2026-07-15T09:00:00') })
  const pa = await ca.newPage(); pa.on('pageerror', e => console.log('  PAGE ERROR', e.message))
  await signIn(pa, 'ad', 'a')
  await postOutSans(pa, dev.touch)
  await openSans(pa, dev.touch); await settle(pa)
  await shot(pa, `${dev.name}-4-admin-unchanged`)
  const state = await ca.storageState()
  await ca.close()
  /* Hex signs in, on the same saved world */
  const ch = await browser.newContext({ ...dev.ctx, storageState: state })
  await ch.clock?.install?.({ time: new Date('2026-07-15T09:00:00') })
  const ph = await ch.newPage(); ph.on('pageerror', e => console.log('  PAGE ERROR', e.message))
  await signIn(ph, 'hex', 'x')
  const who = await ph.evaluate(() => window.viewerId ? window.viewerId() : null)
  console.log('  signed in as', who)
  await openSans(ph, dev.touch); await settle(ph)
  await shot(ph, `${dev.name}-1-today`)
  console.log('  shaded A:', await shade(ph, 'A')); await settle(ph); await shot(ph, `${dev.name}-2-proposed-A-faded`)
  await unshade(ph)
  console.log('  shaded B:', await shade(ph, 'B')); await settle(ph); await shot(ph, `${dev.name}-3-proposed-B-striped`)
  await unshade(ph)
  await tap(ph, '[data-testid="sc-day-2026-07-16"]', dev.touch); await sleep(700)
  const add = await ph.locator('[data-testid="sanscal"] ~ * :text("+ Commitment"), :text("+ Commitment"):visible').count()
  console.log('  "+ Commitment" on Thu 16:', add)
  await settle(ph)
  await ph.screenshot({ path: join(OUT, `${dev.name}-5-today-thu16-opened.png`) }); console.log('  saved', `${dev.name}-5-today-thu16-opened`)
  await ch.close(); await browser.close()
}
