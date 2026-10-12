// A MOCK-UP, NOT A BUILD — [CAL-PHONE-SWIPE-FIT] (owner D786, 13 Oct 26): the pictures he asked to see, at phone size,
// before anything is built. Two things, each on the app's REAL Calendar window (Inputs ⚙ → Calendar…):
//   (1) THE "FROM" DATE BOX of "Every Thursday" — on his iPhone the phone's own date box runs off the window's right
//       edge. Drawn: the box replaced by a field of the app's own ("Thu 5 Nov 2026") that opens the app's own small
//       month under it — the calendar the holiday form already uses (D671).
//   (2) THE SWIPE — a finger's sideways path over the month, and over the Holidays list. A swipe has no still look of
//       its own; the picture only shows where it works and which way it goes.
// HOW: the real built app is driven to the real state by real taps, a picture is taken AS BUILT, and only THEN the
// proposed parts are put on it (class "mockx"). NOTHING INJECTED IS IN THE APP. The small month is the app's own:
// it is copied, as drawn, out of the real "Add a holiday" window after two real taps (to November, on the 5th), and
// set into "Every Thursday". What is REAL and what is DRAWN is said beside every picture on the page.
// This browser is Chromium on Windows: the date box FITS here — the fault is the iPhone's own date box, so the
// as-built picture does not show it. His own photo does.
//
// The script serves the built app itself (dist/) and stops when it ends — it leaves no preview server behind.
//   npm run build
//   node scripts/handpass/calswipe-mock.mjs [out dir]        (default docs/mock/2026-10-13-cal-swipe-fit)
import { chromium } from '@playwright/test'
import { createServer } from 'node:http'
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = process.argv[2] || 'docs/mock/2026-10-13-cal-swipe-fit'
const DPR = +(process.env.HP_DPR || 2)
mkdirSync(OUT, { recursive: true })

/* ---- the built app, served from dist/ for the length of this run ---- */
const DIST = resolve('dist')
if (!existsSync(join(DIST, 'index.html'))) { console.error('no dist/index.html — run npm run build first'); process.exit(1) }
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.map': 'application/json' }
const server = createServer((req, res) => {
  const path = decodeURIComponent((req.url || '/').split('?')[0])
  let file = normalize(join(DIST, path))
  if (!file.startsWith(DIST) || !existsSync(file) || statSync(file).isDirectory()) file = join(DIST, 'index.html')
  res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' })
  res.end(readFileSync(file))
})
await new Promise(done => server.listen(0, '127.0.0.1', done))
const URL = `http://127.0.0.1:${server.address().port}/`

const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const WIN = '[data-testid="win-days"]', EVERY = '[data-testid="win-every"]', HOL = '[data-testid="win-holiday"]'
const FROM = '2026-11-05'

async function session(tag, width, height) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: DPR, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  await page.clock.setFixedTime(new Date('2026-10-13T09:00:00'))
  const errors = []
  page.on('pageerror', e => errors.push(String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`) })
  const tap = async sel => { await page.locator(sel).tap(); await page.waitForTimeout(280) }
  const say = (step, what) => console.log(`${tag} ${step}: ${typeof what === 'string' ? what : JSON.stringify(what)}`)
  const shot = async name => { await page.screenshot({ path: join(OUT, `${tag}-${name}.png`) }); say('picture', `${tag}-${name}.png`) }
  const unpaint = () => page.evaluate(() => {
    document.querySelectorAll('.mockx').forEach(e => e.remove())
    document.querySelectorAll('[data-mockhid]').forEach(e => { e.style.display = ''; e.removeAttribute('data-mockhid') })
  })
  /* how far anything inside a window reaches past the window's own right edge, in CSS pixels (0 = it fits) */
  const fit = sel => page.evaluate(s => {
    const w = document.querySelector(s); if (!w) return null
    const edge = w.getBoundingClientRect().right
    let over = 0, who = ''
    w.querySelectorAll('*').forEach(e => { const r = e.getBoundingClientRect(); if (r.width && r.right - edge > over) { over = r.right - edge; who = e.className || e.tagName } })
    const body = w.querySelector('.win-body')
    return { winRight: Math.round(edge), screen: innerWidth, pastEdge: Math.round(over * 10) / 10, who, sideways: body ? body.scrollWidth - body.clientWidth : null }
  }, sel)

  await page.goto(URL + '?fresh=1')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important} #toastEl{visibility:hidden !important}' })

  /* Inputs ⚙ → Calendar… (real taps); the settings window goes, the Calendar window stays (D641) */
  await page.evaluate(() => window.go('inputs'))
  await tap('#inGear'); await tap('[data-testid="iset-days"]')
  await page.locator('[data-testid="win-inputsset-x"]').evaluate(e => e.click()).catch(() => {})
  await page.waitForSelector(WIN)
  const month = () => page.locator('[data-testid="days-month"]').innerText()
  const stamp = t => { const [m, y] = t.trim().split(/\s+/); return +y * 12 + ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'].indexOf(m.toLowerCase()) }
  for (let i = 0; i < 40 && stamp(await month()) !== 2026 * 12 + 10; i++) await tap(stamp(await month()) < 2026 * 12 + 10 ? '[data-testid="days-next"]' : '[data-testid="days-prev"]')
  say('REAL — the month on screen', await month())
  await shot('1-month-asbuilt')

  /* THE APP'S OWN SMALL MONTH, copied as drawn: Holidays → + Add → November → the 5th (real taps), then Cancel */
  await tap('[data-testid="days-tab-holidays"]')
  await shot('5-holidays-asbuilt')
  await tap('[data-testid="hol-add"]')
  for (let i = 0; i < 30 && !(await page.locator(`[data-testid="holcal-day-${FROM}"]`).count()); i++) await tap('[data-testid="holcal-next-month"]')
  await tap(`[data-testid="holcal-day-${FROM}"]`)
  say('REAL — the holiday form fits its window', await fit(HOL))
  const cal = await page.locator('.hol-cal .rpick').evaluate(e => e.outerHTML)
  await tap('[data-testid="hol-cancel"]')

  /* "Every Thursday", as built: Month → the Thursday heading (real taps) */
  await tap('[data-testid="days-tab-month"]')
  await tap('[data-testid="days-wd-3"]')
  await page.waitForSelector(EVERY)
  say('REAL — the From box holds', await page.locator('#everyFrom').inputValue())
  say('REAL — "Every Thursday" in THIS browser (the iPhone differs)', await fit(EVERY))
  await shot('2-every-asbuilt')

  /* DRAWN: the From box as a field of the app's own, closed */
  const field = open => page.evaluate(open => {
    const inp = document.querySelector('#everyFrom')
    inp.style.display = 'none'; inp.setAttribute('data-mockhid', '1')
    const b = document.createElement('button')
    b.type = 'button'; b.className = 'every-date mockx'
    b.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;text-align:left;cursor:pointer' + (open ? ';border-color:var(--accent)' : '')
    b.innerHTML = '<span>Thu 5 Nov 2026</span><span aria-hidden="true" style="flex:0 0 auto;font-size:11px;color:' + (open ? 'var(--accent)' : 'var(--ink-3)') + '">' + (open ? '&#9652;' : '&#9662;') + '</span>'
    inp.after(b)
    return b.getBoundingClientRect().width
  }, open)
  await field(false)
  say('DRAWN — closed', await fit(EVERY))
  await shot('3-every-field-closed')

  /* DRAWN: the field open — the app's own small month under it, the Thursdays picked out, 5 Nov chosen */
  await unpaint()
  await field(true)
  await page.evaluate(html => {
    const b = document.querySelector('.every-date.mockx')
    const box = document.createElement('div')
    box.className = 'hol-cal mockx'
    box.style.cssText = 'margin-top:6px;padding:8px 8px 6px;border:1px solid var(--edge);border-radius:10px;background:var(--bg)'
    box.innerHTML = html
    const ft = box.querySelector('.rpick-ft'); if (ft) ft.remove()
    /* the weekday the window is about: its letter in the accent, its dates in full ink; the other days stay quieter */
    const dow = box.querySelectorAll('.rdow'); if (dow[3]) { dow[3].style.color = 'var(--accent)'; dow[3].style.fontWeight = '800' }
    box.querySelectorAll('.rday').forEach(d => {
      const iso = (d.getAttribute('data-testid') || '').slice(-10)
      const thu = new Date(iso + 'T12:00:00Z').getUTCDay() === 4
      if (!thu && !d.classList.contains('on')) d.style.color = 'var(--ink-3)'
      if (thu && !d.classList.contains('on')) { d.style.color = 'var(--ink)'; d.style.fontWeight = '800'; d.style.boxShadow = 'inset 0 0 0 1px var(--edge-2)' }
    })
    b.after(box)
    box.scrollIntoView({ block: 'nearest' })
  }, cal)
  await page.waitForTimeout(200)
  say('DRAWN — open', await fit(EVERY))
  await shot('4-every-field-open')
  await unpaint()
  await tap('[data-testid="every-cancel"]')

  /* DRAWN: a finger's sideways path — over the month, then over the Holidays list */
  const swipe = sel => page.evaluate(sel => {
    const r = document.querySelector(sel).getBoundingClientRect()
    const y = Math.round(r.top + r.height * 0.56), x1 = Math.round(r.right - r.width * 0.16), x0 = Math.round(r.left + r.width * 0.2)
    const ns = 'http://www.w3.org/2000/svg'
    const svg = document.createElementNS(ns, 'svg')
    svg.setAttribute('class', 'mockx'); svg.setAttribute('width', innerWidth); svg.setAttribute('height', innerHeight)
    svg.style.cssText = 'position:fixed;inset:0;z-index:99999;pointer-events:none'
    svg.innerHTML =
      `<defs><linearGradient id="mxg" x1="1" x2="0"><stop offset="0" stop-color="#3BC6E8" stop-opacity=".05"/><stop offset="1" stop-color="#3BC6E8" stop-opacity=".9"/></linearGradient></defs>` +
      `<rect x="${x0}" y="${y - 5}" width="${x1 - x0}" height="10" rx="5" fill="url(#mxg)"/>` +
      `<path d="M${x0 + 13} ${y - 12} L${x0 - 3} ${y} L${x0 + 13} ${y + 12}" fill="none" stroke="#3BC6E8" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<circle cx="${x1}" cy="${y}" r="19" fill="#3BC6E8" fill-opacity=".16" stroke="#3BC6E8" stroke-opacity=".7" stroke-width="2"/>`
    document.body.appendChild(svg)
  }, sel)
  await swipe('[data-testid="days-grid"]')
  await shot('6-swipe-month')
  await unpaint()
  await tap('[data-testid="days-tab-holidays"]')
  await swipe('[data-testid="days-part-holidays"]')
  await shot('7-swipe-year')
  await unpaint()

  console.log(tag, errors.length ? 'ERRORS ' + errors.join(' | ') : 'no console errors, page errors or failed requests')
  await ctx.close()
}

try {
  await session('p390', 390, 844)
  await session('p320', 320, 568)
} finally {
  await browser.close()
  server.close()
}
