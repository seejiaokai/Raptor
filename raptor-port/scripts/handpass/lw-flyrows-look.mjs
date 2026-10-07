// A LOOK at the Leave War's four rows being typed and picked — pictures of the RUNNING build, phone and desktop, for
// the builder's own eye and for the evidence sheet of the calendar job's bug check (D624: each approved mock-up beside
// the built screen at the same size). Not a gate: it asserts nothing; a person opens the pictures.
//
//   npm run build && npx vite preview --port 4180 --strictPort      (NOT 4173 — the browser tests reuse a server left there)
//   node scripts/handpass/lw-flyrows-look.mjs <out dir> [shot names…]
//
// The figures are the demo squadron's, so the pictures may go into the repo.
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const OUT = process.argv[2] || 'test-results/flyrows-look'
const ONLY = process.argv.slice(3)
mkdirSync(OUT, { recursive: true })
const want = name => !ONLY.length || ONLY.some(o => name.includes(o))

const SIZES = {
  desk: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  phone: { ...devices['iPhone 13'] },
}

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
  /* the fifth mock-ups' figures: 16 and 16 running from Fri 2 Jan, Wed 7 and Wed 21 no-fly */
  await page.evaluate(() => {
    window.setFlyRun('2026-01-02', { p: 16, w: 16 })
    window.setFlyDays([{ iso: '2026-01-07', cls: 'nf' }, { iso: '2026-01-21', cls: 'nf' }])
  })
  await page.waitForTimeout(250)
  return { ctx, page, errors }
}
const cell = (page, row, iso) => page.locator(`[data-testid="${row}-${iso}"]`)
const press = (page, size, loc) => (size === 'phone' ? loc.tap() : loc.click())

const SHOTS = {
  /* the four rows at rest */
  async rest(page, size) {},
  /* typing one cell: the box on a desktop, the number pad on a phone */
  async type(page, size) {
    await press(page, size, cell(page, 'req-p', size === 'phone' ? '2026-01-08' : '2026-01-15'))
    if (size === 'phone') { await page.locator('[data-testid="fly-pad-1"]').tap(); await page.locator('[data-testid="fly-pad-8"]').tap() }
    else await page.keyboard.type('18')
  },
  /* the same, with "From <date> on" picked */
  async typerun(page, size) {
    await SHOTS.type(page, size)
    await press(page, size, page.locator('[data-testid="fly-edit-run"]'))
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
