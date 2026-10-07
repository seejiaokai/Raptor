// A LOOK at Days — the admin's window that says what kind of day each date is — in the RUNNING build, phone and
// desktop, for the builder's own eye and for the evidence sheet of the calendar job's bug check (D624: each approved
// mock-up beside the built screen at the same size). Not a gate: it asserts nothing; a person opens the pictures.
//
//   npm run build && npx vite preview --port 4180 --strictPort      (NOT 4173 — the browser tests reuse a server left there)
//   node scripts/handpass/days-look.mjs <out dir> [shot names…]
//
// The month drawn is the fourth mock-ups' own: November 2026, Thursdays no-fly from the 5th, Mon 9 a public holiday,
// Mon 23 to Wed 25 night flying. The figures are the demo squadron's, so the pictures may go into the repo.
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const OUT = process.argv[2] || 'test-results/days-look'
const ONLY = process.argv.slice(3)
mkdirSync(OUT, { recursive: true })
const want = name => !ONLY.length || ONLY.some(o => name.includes(o))

const SIZES = {
  /* 1440: a laptop — the two parts are tabs. wide: his PC at 125% (1536 across) — the two parts side by side */
  desk: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  wide: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 },
  phone: { ...devices['iPhone 13'] },
}
const tid = (page, id) => page.locator(`[data-testid="${id}"]`)
const press = (size, loc) => (size === 'phone' ? loc.tap() : loc.click())

async function open(browser, size) {
  const ctx = await browser.newContext(SIZES[size])
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e)))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  await page.goto((process.env.LOOK_URL || 'http://localhost:4180/') + '?fresh=1')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid="row-slipway"]')
  await page.waitForTimeout(500)
  await page.evaluate(() => {
    window.setFlyRule({ wd: 3, cls: 'nf', from: '2026-11-05' })
    window.setFlyDays([{ iso: '2026-11-23', cls: 'night' }, { iso: '2026-11-24', cls: 'night' }, { iso: '2026-11-25', cls: 'night' }])
    window.lwSetDayEvent('2026-11-09', 0, 'PH')
  })
  await page.waitForTimeout(250)
  return { ctx, page, errors }
}
/* the way in: the Leave War's ⚙, then "Days…"; then to November 2026 */
async function toDays(page, size) {
  await press(size, tid(page, 'settings-open'))
  await press(size, tid(page, 'settings-days'))
  await tid(page, 'win-days').waitFor()
  for (let i = 0; i < 24; i++) {
    const m = await tid(page, 'days-month').textContent()
    if (m === 'November 2026') break
    await press(size, tid(page, m && /2027|December 2026/.test(m) ? 'days-prev' : 'days-next'))
  }
}

const SHOTS = {
  /* the line in the Leave War's settings */
  async door(page, size) { await press(size, tid(page, 'settings-open')); await tid(page, 'settings-days').scrollIntoViewIfNeeded() },
  /* the month as the mock-up has it */
  async month(page, size) { await toDays(page, size) },
  /* a date set apart from its weekday's rule wears the dot: Thu 12 back to day flying, Sat 7 set to day flying */
  async dot(page, size) {
    await toDays(page, size)
    if (size === 'phone') { await tid(page, 'days-step-2026-11-12').tap(); await tid(page, 'days-step-2026-11-07').tap() }
    else { await tid(page, 'days-d-2026-11-12').click(); await tid(page, 'days-d-2026-11-07').click() }
  },
  /* "Every Thursday": a weekday's heading — the rule already made is listed beneath */
  async every(page, size) {
    await toDays(page, size)
    await press(size, tid(page, 'days-wd-3'))
    await tid(page, 'win-every').waitFor()
  },
  /* the same for a Saturday, ending on a date */
  async everydate(page, size) {
    await toDays(page, size)
    await press(size, tid(page, 'days-wd-5'))
    await press(size, tid(page, 'every-until-date'))
    await tid(page, 'every-until').fill('2026-12-26')
  },
  /* the year's Holidays: the list (beside the month on a wide screen, its own tab under that) */
  async holidays(page, size) {
    await toDays(page, size)
    if (await tid(page, 'days-tabs').count()) await press(size, tid(page, 'days-tab-holidays'))
  },
  /* "+ Add": the holiday form, filled in */
  async holadd(page, size) {
    await SHOTS.holidays(page, size)
    await press(size, tid(page, 'hol-add'))
    await tid(page, 'hol-name').fill('Deepavali eve')
    await tid(page, 'hol-short').fill('DE')
    await tid(page, 'hol-from').fill('2026-11-06')
  },
  /* a line opened to change or delete */
  async holchange(page, size) {
    await SHOTS.holidays(page, size)
    await press(size, page.locator('.hol-line[data-from="2026-11-09"]'))
  },
  /* a year no leave period covers */
  async holnone(page, size) {
    await SHOTS.holidays(page, size)
    await press(size, tid(page, 'hol-next'))
  },
  /* the window dragged aside on a desktop, the grid behind it still worked: a Required figure typed with Days up */
  async behind(page, size) {
    await toDays(page, size)
    if (size === 'phone') return
    const bar = page.locator('[data-testid="win-days"] .win-bar')
    const b = await bar.boundingBox()
    await page.mouse.move(b.x + 80, b.y + 12); await page.mouse.down()
    await page.mouse.move(b.x + 80, b.y + 300, { steps: 8 }); await page.mouse.up()
  },
}

const browser = await chromium.launch(launchOptions)
let bad = 0
for (const size of Object.keys(SIZES)) {
  for (const [name, run] of Object.entries(SHOTS)) {
    if (!want(`${size}-${name}`)) continue
    const { ctx, page, errors } = await open(browser, size)
    try {
      await run(page, size)
      await page.waitForTimeout(250)
      await page.screenshot({ path: join(OUT, `${size}-${name}.png`) })
      console.log(`${size}-${name}.png${errors.length ? '   CONSOLE ERRORS: ' + errors.join(' | ') : ''}`)
      if (errors.length) bad++
    } catch (e) { bad++; console.log(`${size}-${name}: FAILED — ${String(e).split('\n')[0]}`) }
    await ctx.close()
  }
}
await browser.close()
process.exit(bad ? 1 : 0)
