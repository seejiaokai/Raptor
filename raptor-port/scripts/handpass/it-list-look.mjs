// A LOOK for the owner's question of 9 Oct 26 ("Why is the designed inputs so different from the one we agreed on?" — he
// had seen a walker's picture of the Inputs LIST on a phone, taken before the List's fix): the SAME titled input on the
// two screens side by side, on the current build — the Inputs List's card, and the opened day's card that the drawing
// showed. Through the app's own controls.   node scripts/handpass/it-list-look.mjs <out dir>
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
const OUT = process.argv[2] || 'docs/img/handpass/2026-10-09-input-title-check/look'
mkdirSync(OUT, { recursive: true })
const URL = (process.env.LOOK_URL || 'http://localhost:4180/') + '?fresh=1'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const page = await ctx.newPage()
await page.goto(URL)
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day')
await page.evaluate(() => window.go('inputs'))
for (let i = 0; i < 40; i++) {
  const [name, year] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
  const d = 2026 * 12 + 6 - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
  if (!d) break
  await page.locator(d > 0 ? '#icNext' : '#icPrev').click()
}
/* a Saturday Event for ALL AVAIL titled "Sports day", as in the drawing */
await page.locator('#inpCal [data-icday="2026-07-18"]').tap({ position: { x: 8, y: 8 } })
await page.locator('#icPopAdd').tap(); await page.locator('[data-testid="win-inputedit"]').waitFor()
await page.selectOption('#inpEditType', 'Event'); await page.selectOption('#inpEditPerson', 'allavail')
await page.fill('#inpEditOwnTitle', 'Sports day')
await page.locator('#inpEditSave').tap()
const sheet = page.locator('[data-testid="oilconf"]'); await sheet.waitFor()
await sheet.locator('[data-testid="oil-yes"]').tap(); await sheet.locator('[data-testid="oilconf-save"]').tap()
await page.waitForTimeout(500)
/* the opened day, as built */
const day = page.locator('[data-testid="win-inputsday"]')
if (!(await day.count())) await page.locator('#inpCal [data-icday="2026-07-18"]').tap({ position: { x: 8, y: 8 } })
await day.waitFor(); await page.waitForTimeout(300)
const b = await day.boundingBox()
await page.screenshot({ path: join(OUT, 'day-card-as-built.png'), clip: { x: b.x, y: b.y, width: b.width, height: Math.min(270, b.height) } })
await page.keyboard.press('Escape')
/* the List, as built */
await page.locator('#inListBtn').tap()
if (!(await page.locator('#inRangePop').count())) await page.locator('#inRangeBtn').tap()
await page.locator('#inRangeAll').tap(); await page.waitForTimeout(300)
const card = page.locator('#inBody tr').filter({ has: page.locator('[data-testid="in-title"]', { hasText: 'Sports day' }) }).first()
await card.scrollIntoViewIfNeeded(); await page.waitForTimeout(200)
const demo = page.locator('#inBody tr').filter({ has: page.locator('[data-testid="in-title"]', { hasText: 'Sports afternoon' }) }).first()
await card.screenshot({ path: join(OUT, 'list-card-as-built.png') })
if (await demo.count()) { await demo.scrollIntoViewIfNeeded(); await demo.screenshot({ path: join(OUT, 'list-card-long-title.png') }) }
await ctx.close(); await browser.close()
console.log('done')
