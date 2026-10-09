// A LOOK at the Leave War's Manning block with counters AMONG the four fixed rows (owner, D674, 8 Oct 26 — "Can
// rearrange allow newly created counter rows be allowed to moved to anywhere in between the fixed blue dot rows? Even
// to below the 4 as well."). Pictures of the RUNNING build, phone and desktop, for the builder's own eye and for the
// evidence sheet of the calendar job's bug check. Not a gate: it asserts nothing; a person opens the pictures. The
// gate is e2e/leavewar.spec.ts "a counter row is dragged between the fixed rows and below all four…".
//
//   npm run build && npx vite preview --port 4180 --strictPort      (NOT 4173 — the browser tests reuse a server left there)
//   node scripts/handpass/lw-counters-among-look.mjs <out dir>
//
// The counters are made through the real "+ Counter" writer and MOVED BY THE REAL DRAG (a mouse on the desktop, a
// finger through CDP on the phone) — never set in the store — so each picture is of something an admin can do.
// The figures are the demo squadron's, so the pictures may go into the repo.
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const OUT = process.argv[2] || 'test-results/counters-among-look'
mkdirSync(OUT, { recursive: true })

const SIZES = {
  desk: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  phone: { ...devices['iPhone 13'] },
}
const COUNTERS = [['sc-d', 'SC D', 'pilot'], ['ip', 'IP', 'pilot'], ['ops-w', 'OPS W', 'wso']]

const browser = await chromium.launch(launchOptions)
for (const size of Object.keys(SIZES)) {
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
  await page.evaluate(rules => {
    window.setFlyRun('2026-01-02', { p: 16, w: 16 })
    for (const [id, label, seat] of rules) window.lwSaveManningRule({ id, label, count: { kind: 'people', filter: { seats: [seat] } }, threshold: { amber: 0, red: 0 } })
  }, COUNTERS)
  await page.waitForSelector('[data-testid="count-ops-w"]')
  const shot = async name => { await page.waitForTimeout(250); await page.screenshot({ path: join(OUT, `${size}-${name}.png`) }); console.log(`${size}-${name}.png`) }
  const tap = loc => (size === 'phone' ? loc.tap() : loc.click())
  const cdp = size === 'phone' ? await ctx.newCDPSession(page) : null
  const hold = async (id, onto, half) => {
    const g = await page.locator(`[data-testid="manning-drag-${id}"]`).boundingBox()
    const t = await page.locator(`[data-testid="${onto}"] td.who`).boundingBox()
    const a = { x: g.x + g.width / 2, y: g.y + g.height / 2 }
    const b = { x: t.x + Math.min(t.width / 2, 30), y: half === 'upper' ? t.y + 3 : t.y + t.height - 3 }
    if (cdp) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [a] })
      for (let i = 1; i <= 6; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a.x + ((b.x - a.x) * i) / 6, y: a.y + ((b.y - a.y) * i) / 6 }] })
    } else {
      await page.mouse.move(a.x, a.y); await page.mouse.down()
      await page.mouse.move(a.x, a.y + 4, { steps: 2 }); await page.mouse.move(b.x, b.y, { steps: 6 })
    }
  }
  const release = () => (cdp ? cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }) : page.mouse.up())

  await shot('1-as-it-starts')                                  // the counters above the four
  await tap(page.locator('[data-testid="roster-arrange"]'))
  await shot('2-rearrange')
  await hold('sc-d', 'fly-row-req-w', 'upper')
  await shot('3-held-over-required-w')                          // the landing bar along Required W
  await release()
  await shot('4-dropped-between')
  await hold('ip', 'fly-row-avail-w', 'lower')
  await shot('5-held-under-available-w')                        // the landing bar under the last row
  await release()
  await shot('6-dropped-below-all-four')
  await tap(page.locator('[data-testid="roster-arrange"]'))
  await shot('7-out-of-rearrange')
  /* typing a Required figure with a counter under the four: the strip (desktop) / the pad (phone) */
  await tap(page.locator('[data-testid="req-p-2026-01-08"]'))
  await shot('8-typing-a-required-figure')
  if (errors.length) console.log(`${size}: ERRORS\n  ` + errors.join('\n  '))
  await ctx.close()
}
await browser.close()
