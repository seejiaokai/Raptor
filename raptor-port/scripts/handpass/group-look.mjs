// A LOOK at an input filed for several people in the RUNNING build, phone and desktop — the builder's own eye on the
// people picker (D656: the pucks "drawn compact", four across on a phone), a shared input's line on an opened day, the
// List's one row and the editor window on the entry. Not a gate: it asserts nothing; a person opens the pictures.
//
//   npm run build && npx vite preview --port 4180 --strictPort
//   node scripts/handpass/group-look.mjs <out dir>
//
// It uses the demo's own shared input (state/demoseed.ts seedDemoGroup — Thursday 23 Jul 26).
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const OUT = process.argv[2] || 'test-results/group-look'
mkdirSync(OUT, { recursive: true })
const SIZES = {
  desk: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  phone: { ...devices['iPhone 13'] },
}

const browser = await chromium.launch(launchOptions)
for (const size of Object.keys(SIZES)) {
  const ctx = await browser.newContext(SIZES[size])
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e)))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  const press = loc => (size === 'desk' ? loc.click() : loc.tap())
  const shot = name => page.screenshot({ path: join(OUT, `${size}-${name}.png`) })
  await page.goto((process.env.LOOK_URL || 'http://localhost:4180/') + '?fresh=1')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  await page.evaluate(() => window.go('inputs'))
  await page.locator('#inpCal').waitFor()
  const MON = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  const at = async () => { const [m, y] = (await page.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MON.findIndex(x => x.startsWith(m)) }
  let d = 2026 * 12 + 6 - await at()
  for (; d > 0; d--) await press(page.locator('#icNext'))
  for (; d < 0; d++) await press(page.locator('#icPrev'))
  await page.waitForSelector('[data-icday="2026-07-23"]')
  await page.waitForTimeout(400)
  await shot('1-month')
  await page.locator('[data-icday="2026-07-23"]').focus()
  await page.keyboard.press('Enter')
  await page.waitForSelector('[data-testid="win-inputsday"]')
  await page.waitForTimeout(300)
  await shot('2-day')
  await press(page.locator('[data-testid="win-inputsday"] [data-testid="idy-people"]').first())
  await page.waitForSelector('[data-testid="win-inputedit"]')
  await page.waitForTimeout(300)
  await shot('3-editor-entry')
  /* a new input from the day's own "+ Input", several people picked */
  await press(page.locator('#inpEditCancel'))
  await press(page.locator('#icPopAdd'))
  await page.waitForSelector('#inpEditPop [data-testid="pp-several"]')
  await press(page.locator('#inpEditPop [data-testid="pp-several"]'))
  await press(page.locator('#inpEditPop [data-testid="pp-all-wsos"]'))
  await page.waitForTimeout(250)
  await shot('4-picker')
  const box = await page.evaluate(() => {
    const g = document.querySelector('#inpEditPop [data-ppgroup="pilots"] .pp-pucks')
    const kids = [...g.children].map(k => k.getBoundingClientRect())
    const firstRow = kids.filter(r => Math.abs(r.top - kids[0].top) < 2).length
    const w = document.querySelector('#inpEditPop')
    return { across: firstRow, puckW: Math.round(kids[0].width), puckH: Math.round(kids[0].height), sideways: w.scrollWidth > w.clientWidth, pageSideways: document.documentElement.scrollWidth > window.innerWidth }
  })
  console.log(size, JSON.stringify(box), errors.length ? 'ERRORS ' + errors.join(' | ') : 'no console errors')
  await ctx.close()
}
await browser.close()
