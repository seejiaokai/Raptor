// A LOOK at the SANS calendar in the RUNNING build, phone and desktop — the builder's own eye, and the built side of
// D624's mock-up-beside-built evidence (the approved drawings: the month, a day opened, the highlight, the settings,
// "How this works"). Not a gate: it asserts nothing; a person opens the pictures.
//
//   npm run build && npx vite preview --port 4180 --strictPort      (NOT 4173 — the browser tests reuse a server left there)
//   node scripts/handpass/sans-look.mjs <out dir> [shot names…]
//
// The month drawn is October 2026 with made-up commitments of the demo squadron's own SANS people: a required figure
// running from 1 Oct, two no-fly days, two night-flying days, a public holiday and an Off day — so every kind of date
// the approved month shows is on it. The figures are the demo squadron's, so the pictures may go into the repo.
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const OUT = process.argv[2] || 'test-results/sans-look'
const ONLY = process.argv.slice(3)
mkdirSync(OUT, { recursive: true })
const want = name => !ONLY.length || ONLY.some(o => name.includes(o))

const SIZES = {
  desk: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  wide: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 },
  phone: { ...devices['iPhone 13'] },
  short: { ...devices['iPhone 13'], viewport: { width: 390, height: 568 } },
}
const tid = (page, id) => page.locator(`[data-testid="${id}"]`)
const press = (size, loc) => (size === 'desk' || size === 'wide' ? loc.click() : loc.tap())

async function open(browser, size, who = 'ad') {
  const ctx = await browser.newContext(SIZES[size])
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e)))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  await page.goto((process.env.LOOK_URL || 'http://localhost:4180/') + '?fresh=1')
  await page.fill('#luser', who === 'ad' ? 'ad' : 'us'); await page.fill('#lpass', who === 'ad' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  await page.evaluate(() => {
    const P = window.PEOPLE
    const sans = Object.keys(P).filter(id => P[id].san && !P[id].archived && !P[id].deleted && !P[id].special && !P[id].pers)
    const at = (d, h, m) => new Date(2026, 8, d, h, m).getTime()
    const admin = Object.keys(P).find(id => P[id].cs === 'Saber') || sans[0]
    /* a spread of commitments over the month: who, which days, which letters, which hours */
    const plan = [
      [0, 5, 9, { f: true, o: true }, {}], [1, 5, 16, { f: true }, { allday: false, s: 600, e: 900 }], [2, 6, 23, { f: true, o: true, a: true }, { allday: false, half: 'am' }],
      [3, 5, 30, { f: true, a: true }, {}], [4, 7, 21, { f: true }, { allday: false, half: 'pm' }], [5, 12, 29, { o: true, a: true }, {}],
      [6, 7, 15, { f: true, o: true }, {}], [7, 13, 27, { a: true }, { allday: false, half: 'am' }], [8, 6, 20, { f: true }, {}],
    ]
    const two = n => String(n).padStart(2, '0')
    let k = 0
    for (const [who, from, to, sansTicks, extra] of plan) {
      const id = sans[who % sans.length]
      if (!id) continue
      k += 1
      window.fileInput({ person: id, type: 'SANS Availability', date: 'Oct ' + from, endDate: 'Oct ' + to, yr: 2026, allday: true, sans: sansTicks,
        mod: k === 2 ? '2026-10-08' : '2026-09-1' + (k % 9), by: k === 3 ? admin : id, at: at(10 + k, 9 + k, 14), modBy: k === 5 ? admin : (k === 3 ? admin : id), modAt: k === 5 ? at(19, 8, 10) : at(10 + k, 9 + k, 14), ...extra })
    }
    void two
    /* required figures a little over what the demo roster leaves available, so the three colours all show */
    const d = window.lwDayFacts ? window.lwDayFacts('2026-10-07') : null
    const base = d && d.availP != null ? { p: Math.ceil(d.availP), w: Math.ceil(d.availW) } : { p: 20, w: 20 }
    window.setFlyRun('2026-10-01', { p: base.p + 5, w: base.w + 3 })
    window.setFlyRun('2026-10-12', { p: base.p + 4, w: base.w + 5 })
    window.setFlyRun('2026-10-26', { p: base.p + 6, w: base.w + 7 })
    window.setFlyDays([{ iso: '2026-10-14', cls: 'nf' }, { iso: '2026-10-22', cls: 'nf' }, { iso: '2026-10-15', cls: 'night' }, { iso: '2026-10-16', cls: 'night' }, { iso: '2026-10-18', cls: 'day', p: 4, w: 4 }])
    window.lwSetDayEvent('2026-10-20', 0, 'PH')
    window.lwSetDayEvent('2026-10-30', 0, 'Off day')
  })
  await page.evaluate(() => window.go('inputs'))
  await page.click('#inSansMode')
  await tid(page, 'sanscal').waitFor()
  /* to October 2026 */
  const MON = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  const at = async () => { const [m, y] = (await tid(page, 'sc-month').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MON.indexOf(m) }
  let d = 2026 * 12 + 9 - await at()
  for (; d > 0; d--) await press(size, tid(page, 'sc-next'))
  for (; d < 0; d++) await press(size, tid(page, 'sc-prev'))
  await page.waitForTimeout(400)
  return { ctx, page, errors }
}
const shot = async (page, name, full = false) => { await page.mouse.move(0, 0).catch(() => {}); await page.screenshot({ path: join(OUT, name + '.png'), fullPage: full }) }

const browser = await chromium.launch(launchOptions)
const errorsAll = []
for (const size of ['phone', 'short', 'desk', 'wide']) {
  if (!want(size)) continue
  const { ctx, page, errors } = await open(browser, size)
  await shot(page, `${size}-month`)
  if (size === 'short') await shot(page, `${size}-month-full`, true)
  await press(size, tid(page, 'sc-day-2026-10-07'))
  await tid(page, 'win-sansday').waitFor()
  await page.waitForTimeout(300)
  await shot(page, `${size}-day`)
  if (size === 'phone') {
    /* pulled up by a tap on its bar, then back */
    await page.locator('[data-testid="win-sansday"] .win-ttl').tap()
    await page.waitForTimeout(300)
    await shot(page, `${size}-day-tall`)
  }
  for (const extra of ['hl', 'gear', 'how']) {
    const b = tid(page, 'sc-' + extra)
    if (await b.count()) {
      if (await tid(page, 'win-sansday').count()) await press(size, tid(page, 'win-sansday-x'))
      await press(size, b); await page.waitForTimeout(300)
      await shot(page, `${size}-${extra}`)
      if (extra === 'how') await press(size, b)
      else await page.keyboard.press('Escape')
    }
  }
  errorsAll.push(...errors.map(e => `${size}: ${e}`))
  await ctx.close()
}
/* a SANS member, and a member who is not SANS, on a phone: what each may do */
if (want('member')) {
  const { ctx, page, errors } = await open(browser, 'phone', 'us')
  await tid(page, 'sc-day-2026-10-07').tap()
  await tid(page, 'win-sansday').waitFor(); await page.waitForTimeout(300)
  await shot(page, 'member-day')
  errorsAll.push(...errors.map(e => `member: ${e}`))
  await ctx.close()
}
await browser.close()
console.log(errorsAll.length ? 'PAGE ERRORS:\n' + errorsAll.join('\n') : 'no page errors')
console.log('pictures in', OUT)
