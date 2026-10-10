// Pictures that STATE THE PROBLEM for the choices of [SEEN-BATCH-2] list B (his ask, 10 Oct 26: "show me mock ups of the
// 10 small choices to state the problem"). Each is the real built app, driven through its own controls; nothing is drawn.
//   node scripts/handpass/b2-pics.mjs            (LOOK_URL=http://localhost:4241/ by default)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = 'docs/mock/img/batch2-choices'
mkdirSync(OUT, { recursive: true })
const URL = (process.env.LOOK_URL || 'http://localhost:4241/') + '?fresh=1'
const only = process.argv.slice(2)
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const WIN = '[data-testid="win-inputedit"]', DAYWIN = '[data-testid="win-inputsday"]'

async function open(viewport, who = 'ad', pass = 'a', touch = false) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  page.on('pageerror', e => console.log('pageerror: ' + String(e).slice(0, 200)))
  await page.goto(URL)
  await page.fill('#luser', who); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  await page.evaluate(() => window.go('inputs'))
  return { ctx, page }
}
const shot = (p, name) => p.screenshot({ path: join(OUT, name + '.png') }).then(() => console.log('saved ' + name))
const press = (touch, loc) => (touch ? loc.tap() : loc.click())
async function month(p, y, m, touch) {
  for (let i = 0; i < 60; i++) {
    const [name, year] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) return
    await press(touch, p.locator(d > 0 ? '#icNext' : '#icPrev'))
  }
}
const scene = async (name, fn) => { if (only.length && !only.includes(name)) return; try { await fn() } catch (e) { console.log(`SCENE ${name} FAILED: ` + String(e.message || e).split('\n').slice(0, 4).join(' | ')) } }
const PHONE = { width: 390, height: 844 }, DESK = { width: 1440, height: 900 }

/* 2 — a day opened under a filter says "No inputs on this day" while the filter hides some */
await scene('s2', async () => {
  const { ctx, page } = await open(PHONE, 'ad', 'a', true)
  await month(page, 2026, 7, true)
  const pickd = { iso: '2026-07-20', person: 'Tally' }
  const cell = page.locator(`#inpCal [data-icday="${pickd.iso}"]`)
  await cell.tap({ position: { x: 8, y: 8 } }); await page.locator(DAYWIN).waitFor(); await page.waitForTimeout(300)
  await shot(page, '02-day-no-filter')
  await page.keyboard.press('Escape'); await page.waitForTimeout(250)
  await page.locator('#inFiltersBtn').tap(); await page.waitForTimeout(200)
  await page.selectOption('#inFPerson', { label: pickd.person }); await page.waitForTimeout(250)
  await page.locator('#inFiltersBtn').tap(); await page.waitForTimeout(200)
  await cell.tap({ position: { x: 8, y: 8 } }); await page.locator(DAYWIN).waitFor(); await page.waitForTimeout(300)
  await shot(page, '02-day-under-filter')
  await ctx.close()
})

/* 3 — the List's dates picker stays open after its end date is tapped; and 12 — its days are small for a finger */
await scene('s3', async () => {
  const { ctx, page } = await open(PHONE, 'ad', 'a', true)
  await page.locator('#inListBtn').tap(); await page.waitForTimeout(250)
  await page.locator('#inRangeBtn').tap(); await page.waitForTimeout(250)
  await shot(page, '12-list-picker-days')
  const days = page.locator('#inRangePop .rc-d')
  await days.nth(12).tap(); await page.waitForTimeout(150)
  await days.nth(18).tap(); await page.waitForTimeout(300)
  await shot(page, '03-picker-still-open')
  await page.keyboard.press('Escape'); await page.mouse.click(300, 760).catch(() => {}); await page.waitForTimeout(200)
  await page.locator('#inNew').tap(); await page.locator(WIN).waitFor(); await page.waitForTimeout(300)
  await shot(page, '12-window-days')
  await ctx.close()
})

/* 6 — a member filing for "Several people" cannot leave himself out */
await scene('s6', async () => {
  const { ctx, page } = await open(PHONE, 'us', 'us', true)
  await page.locator('#inListBtn').tap(); await page.waitForTimeout(250)
  await page.locator('#inNew').tap(); await page.locator(WIN).waitFor(); await page.waitForTimeout(200)
  await page.locator('[data-testid="pp-several"]').tap(); await page.waitForTimeout(300)
  await page.locator(`${WIN} [data-testid="pp"]`).getByText('Anvil', { exact: true }).tap(); await page.waitForTimeout(200)
  const me = page.locator(`${WIN} [data-testid="pp"]`).getByText('Ranger', { exact: true })
  console.log('s6 picked before: ' + await page.locator(`${WIN} [data-testid="pp-count"]`).innerText().catch(() => '?'))
  if (await me.count()) { await me.scrollIntoViewIfNeeded(); await me.tap().catch(() => {}); await page.waitForTimeout(300) }
  console.log('s6 picked after tapping his own puck: ' + await page.locator(`${WIN} [data-testid="pp-count"]`).innerText().catch(() => '?') + ' · note: ' + await page.locator(`${WIN} [data-testid="pp-why"]`).innerText().catch(() => 'none'))
  await shot(page, '06-member-cannot-unpick')
  await ctx.close()
})

/* 9 — Escape while typing a planning note closes the whole day */
await scene('s9', async () => {
  const { ctx, page } = await open(PHONE, 'ad', 'a', true)
  await month(page, 2026, 7, true)
  await page.locator('#inpCal [data-icday="2026-07-20"]').tap({ position: { x: 8, y: 8 } }); await page.locator(DAYWIN).waitFor(); await page.waitForTimeout(300)
  await page.locator('#icAddPuck').tap(); await page.waitForTimeout(200)
  await page.keyboard.type('brief the new guy before the wave'); await page.waitForTimeout(200)
  await shot(page, '09-note-being-typed')
  await page.keyboard.press('Escape'); await page.waitForTimeout(400)
  console.log('s9 day window still open after Escape: ' + !!(await page.locator(DAYWIN).count()))
  await shot(page, '09-after-escape')
  await ctx.close()
})

/* 11 — several days picked on the month open the window at once */
await scene('s11', async () => {
  const { ctx, page } = await open(DESK, 'ad', 'a', false)
  await month(page, 2026, 7, false)
  const box = async iso => { const b = await page.locator(`#inpCal [data-icday="${iso}"]`).boundingBox(); return { x: b.x + b.width - 14, y: b.y + b.height - 10 } }
  const a = await box('2026-07-07'), b = await box('2026-07-09')
  await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move((a.x + b.x) / 2, a.y, { steps: 6 }); await page.mouse.move(b.x, b.y, { steps: 6 }); await page.waitForTimeout(200)
  await shot(page, '11-days-being-dragged')
  await page.mouse.up(); await page.waitForTimeout(500)
  console.log('s11 window open straight after the drag: ' + !!(await page.locator(WIN).count()))
  await shot(page, '11-window-at-once')
  await ctx.close()
})

await browser.close()
