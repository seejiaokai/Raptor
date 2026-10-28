// The walk of the two fixes of 28 Oct 26 (his video and picture): the top row's asks now taken before the frame is painted,
// and the grid woken when it shows again. Every ask the top row makes, and every way back to the grid, pressed as a finger
// or a mouse would, with a picture each and a check of what stands on screen: the phone in WebKit at 402 x 874 (his
// iPhone's engine), the desktop in Chromium at 1536 x 730 at 1.25 (his PC). PASS / FAIL per step.
// Run from raptor-port/ against the build served on PORT (default 4173): node scripts/handpass/lw-appr-return-walk.mjs
import { webkit, chromium, devices } from '@playwright/test'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
const PORT = process.env.PORT || 4173
const OUT = path.resolve('docs/img/handpass/2026-10-28-lw-appr-oil/walk')
mkdirSync(OUT, { recursive: true })
const rows = []
let problems = 0
async function run(name, launcher, ctxOpts) {
  const b = await launcher.launch()
  const ctx = await b.newContext(ctxOpts)
  const P = await ctx.newPage()
  P.on('pageerror', e => { problems++; console.log(name, 'page error: ' + String(e).slice(0, 160)) })
  await P.goto(`http://localhost:${PORT}/?fresh=1`); await P.waitForSelector('#luser')
  await P.fill('#luser', 'ad'); await P.fill('#lpass', 'a'); await P.click('#loginForm button[type=submit]')
  await P.waitForSelector('#vWeek .day', { state: 'attached' })
  await P.evaluate(() => window.go('leavewar')); await P.waitForSelector('[data-testid="lw-tab-approvals"]')
  await P.waitForTimeout(1500)
  const state = () => P.evaluate(() => {
    const host = document.querySelector('#page-leavewar .lw-gridhost')
    const inView = (sel) => [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 140 && r.left < innerWidth }).length
    return {
      grid: !!host && !host.hidden, appr: !!document.querySelector('[data-testid="approvals-page"]:not([hidden])'),
      oil: !!document.querySelector('[data-testid="oil-window"]'), settings: !!document.querySelector('[data-testid="settings-sheet"], .settings-sheet, [aria-label="Settings"][role="dialog"]'),
      ring: !!document.querySelector('td.lw-ring'), slim: !!document.querySelector('[data-testid="appr-slim"]'),
      stripes: inView('#page-leavewar .mx tbody td.lwph'), days: inView('#page-leavewar .mx td[data-testid^="cell-"]'),
    }
  })
  /* the first frame after a press, before it is painted */
  const firstFrame = (sel) => P.evaluate((sel) => new Promise(ok => {
    document.querySelector(sel).click()
    requestAnimationFrame(() => { const host = document.querySelector('#page-leavewar .lw-gridhost'); ok({ grid: !!host && !host.hidden, oil: !!document.querySelector('[data-testid="oil-window"]'), appr: !!document.querySelector('[data-testid="approvals-page"]:not([hidden])') }) })
  }), sel)
  const step = async (id, what, ok, s) => {
    await P.screenshot({ path: path.join(OUT, `${name}-${id}.png`) })
    rows.push(`| ${name} | ${id} | ${what} | ${ok ? 'PASS' : 'FAIL'} | ${JSON.stringify(s).replace(/\|/g, '/')} |`)
  }
  const toAppr = async () => { await P.click('[data-testid="lw-tab-approvals"]'); await P.waitForSelector('[data-testid="approvals-page"]:not([hidden])'); await P.waitForTimeout(500) }
  let s, f
  /* 1. Approvals → OIL: the tracker on the first frame, no grid beforehand */
  await toAppr()
  f = await firstFrame('[data-testid="oil-tracker"]'); await P.waitForTimeout(500); s = await state()
  await step('1-appr-oil', 'Approvals → OIL tab: the tracker up on the first frame', (f.oil || !f.grid) && s.oil, { first: f, ...s })
  /* 2. OIL's ✕ → the grid, drawn */
  await P.click('[data-testid="oil-close"]'); await P.waitForTimeout(600); s = await state()
  await step('2-oil-close', 'OIL ✕ → the grid drawn, no stripes', !s.oil && s.grid && s.stripes === 0 && s.days > 0, s)
  /* 3. Approvals → ⚙ Settings → close → the grid */
  await toAppr()
  await P.click('[data-testid="settings-open"]'); await P.waitForTimeout(600); s = await state()
  await step('3-appr-settings', 'Approvals → ⚙: Settings open', s.settings || (await P.locator('text=Reset order').count()) > 0, s)
  await P.keyboard.press('Escape'); await P.waitForTimeout(500); s = await state()
  await step('4-settings-close', 'Settings closed → what stands is drawn', s.stripes === 0, s)
  /* 5. Approvals → Grid tab */
  await toAppr()
  f = await firstFrame('[data-testid="lw-tab-grid"]'); await P.waitForTimeout(600); s = await state()
  await step('5-appr-grid', 'Approvals → Grid tab: the grid drawn', s.grid && !s.appr && s.stripes === 0 && s.days > 0, { first: f, ...s })
  /* 6. Approvals → a request's dates: the ring and the slim bar, drawn */
  await toAppr()
  await P.locator('[data-testid="appr-dates"]').first().click(); await P.waitForSelector('[data-testid="appr-slim"]'); await P.waitForTimeout(900); s = await state()
  await step('6-appr-dates', 'A request\'s dates → the grid, the day ringed, the slim bar', s.ring && s.slim && s.stripes === 0, s)
  /* 7. My leave from the top row → his window */
  await P.locator('[data-testid="appr-slim"] .appr-back').click(); await P.waitForTimeout(500)
  await P.click('[data-testid="lw-tab-grid"]'); await P.waitForTimeout(500)
  const ml = P.locator('[data-testid="my-leave"], .myleave, button:has-text("MY LEAVE")').first()
  if (await ml.count()) { await ml.click(); await P.waitForTimeout(600) }
  s = await state()
  const personUp = await P.getByText('every figure', { exact: false }).count()
  await step('7-my-leave', 'My leave → his window opens', personUp > 0, { ...s, personUp })
  /* 8. the period changed from Approvals, back via OIL — his picture's path — the month in view drawn */
  await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  await P.locator('#page-leavewar button', { hasText: /^OCT$/ }).first().click(); await P.waitForTimeout(1500)
  await toAppr()
  const ids = await P.$$eval('[data-testid="war-picker"] option', os => os.map(o => o.value))
  await P.selectOption('[data-testid="war-picker"]', ids[1]); await P.waitForTimeout(800)
  await P.selectOption('[data-testid="war-picker"]', ids[0]); await P.waitForTimeout(3500)
  await P.click('[data-testid="oil-tracker"]'); await P.waitForTimeout(700)
  await P.click('[data-testid="oil-close"]'); await P.waitForTimeout(800); s = await state()
  await step('8-period-return', 'Period changed on Approvals, back via OIL: the month in view drawn without a touch', s.stripes === 0 && s.days > 0, s)
  await b.close()
}
await run('phone', webkit, { ...devices['iPhone 13'], viewport: { width: 402, height: 874 }, deviceScaleFactor: 2 })
await run('desk', chromium, { viewport: { width: 1536, height: 730 }, deviceScaleFactor: 1.25 })
console.log('| size | step | what | result | measured |\n|---|---|---|---|---|\n' + rows.join('\n'))
console.log(problems ? `${problems} page errors` : 'no page errors')
