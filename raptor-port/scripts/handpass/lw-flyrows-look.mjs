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
  /* a picked block and its panel — Mon 5 to Fri 9 on a phone (a no-fly day in the middle), Mon 12 to Fri 16 on a desktop */
  async pick(page, size) {
    if (size === 'phone') await drag(page, size, cell(page, 'req-p', '2026-01-05'), cell(page, 'req-w', '2026-01-09'))
    else await drag(page, size, cell(page, 'req-p', '2026-01-12'), cell(page, 'req-w', '2026-01-16'))
    await page.locator('[data-testid="req-panel"]').waitFor()
    await page.locator('[data-testid="req-panel-num"]').fill('18')
  },
  async pickrun(page, size) {
    await SHOTS.pick(page, size)
    await press(page, size, page.locator('[data-testid="req-panel-run"]'))
  },
  /* a block that mixes a weekend with ordinary days: left out, with Include */
  async pickweekend(page, size) {
    await drag(page, size, cell(page, 'req-p', '2026-01-09'), cell(page, 'req-p', '2026-01-12'))
    await page.locator('[data-testid="req-panel"]').waitFor()
  },
  /* D669: `rest` above IS the app as it opens — no counters, the four rows alone. This one has a squadron's own
     counters made (three, through the "+ Counter" writer) and Rearrange on: the grip, and the delete cross where the
     eye was */
  async cross(page, size) {
    await page.evaluate(() => {
      const mk = (id, label, filter, threshold) => window.lwSaveManningRule({ id, label, count: { kind: 'people', filter }, threshold })
      mk('pilots', 'PILOTS', { seats: ['pilot'] }, { amber: 26, red: 20 })
      mk('wsos', 'WSOS', { seats: ['wso'] }, { amber: 16, red: 12 })
      mk('sxo', 'SXO', { quals: ['sxo'] }, { amber: 1, red: 1 })
    })
    await press(page, size, page.locator('[data-testid="roster-arrange"]'))
  },
  /* an Available row's name opens the counter form in its own mode (D640): the name and who it counts — no amber or
     red, no "Sets / teams", no Delete */
  async availform(page, size) {
    await press(page, size, page.locator('[data-testid="fly-name-avail-p"]'))
    await page.locator('[data-testid="counter-form"]').waitFor()
    await press(page, size, page.locator('[data-testid="cf-catmode"]'))
    await press(page, size, page.locator('[data-testid="cf-cat-OCU"]'))
  },
  /* the people's-days panel, up with no veil over the grid */
  async people(page, size) {
    /* the row brought to the upper half first: the panel is docked at the foot, and a press ON it is the panel's own */
    await page.evaluate(() => window.scrollBy(0, document.querySelector('[data-testid="cell-slipway-2026-01-06"]').getBoundingClientRect().top - 300))
    await page.waitForTimeout(200)
    await drag(page, size, cell(page, 'cell-slipway', '2026-01-06'), cell(page, 'cell-slipway', '2026-01-08'))
    await page.locator('[data-testid="select-sheet"]').waitFor()
  },
}

/* a real drag: a mouse past the 4px slop on a desktop; a held finger (180ms) through CDP on a phone */
async function drag(page, size, from, to) {
  const mid = async l => { const b = await l.boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 } }
  const a = await mid(from), b = await mid(to)
  if (size === 'phone') {
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [a] })
    await page.waitForTimeout(260)
    for (let i = 1; i <= 6; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a.x + ((b.x - a.x) * i) / 6, y: a.y + ((b.y - a.y) * i) / 6 }] })
      await page.waitForTimeout(20)
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await cdp.detach()
  } else {
    await page.mouse.move(a.x, a.y); await page.mouse.down()
    await page.mouse.move(a.x + 8, a.y); await page.mouse.move(b.x, b.y, { steps: 6 }); await page.mouse.up()
  }
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
