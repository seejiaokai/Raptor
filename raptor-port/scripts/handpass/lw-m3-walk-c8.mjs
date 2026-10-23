// Scenario 28: an OIL award's "entered" date in the day's list. The browser's own zone and clock are set (a context option),
// so the local date and the UTC date differ. usage: node lw-m3-walk-c8.mjs <desk|phone> <chromium|webkit> <zone> <ISO instant>
import * as L from './lw-m3-walk-c-lib.mjs'
import { devices } from '@playwright/test'
const size = process.argv[2] || 'desk', engine = process.argv[3] || 'chromium'
const zone = process.argv[4] || 'Asia/Singapore', instant = process.argv[5] || '2026-10-22T20:30:00Z'
const tag = zone.replace(/\W/g, '')
const P = `s28-${size}-${engine}-${tag}-`
console.log('lw-m3-walk-c8 v1', size, engine, zone, instant)
L.clearPrefix(P)
const b = await L.getBrowser(engine)
const phone = size === 'phone'
const ctx = await b.newContext(phone
  ? (engine === 'webkit' ? { ...devices['iPhone 13'], viewport: L.PHONE, timezoneId: zone } : { viewport: L.PHONE, hasTouch: true, isMobile: true, deviceScaleFactor: 3, userAgent: devices['iPhone 13'].userAgent, timezoneId: zone })
  : { viewport: L.DESK, timezoneId: zone })
const page = await ctx.newPage()
const errs = []
page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)) })
page.on('pageerror', e => errs.push(String(e).slice(0, 200)))
const cdp = phone && engine === 'chromium' ? await ctx.newCDPSession(page) : null
const w = { ctx, page, cdp, errs, phone, size, engine }
await page.clock.install({ time: new Date(instant) })
await page.clock.resume()
await page.goto(L.URL); await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day')
await page.evaluate(() => window.go('leavewar')); await page.waitForSelector('[data-testid="row-stiff"]'); await page.waitForTimeout(1000)
console.log('browser says', await page.evaluate(() => new Date().toString() + ' | UTC ' + new Date().toISOString()))
await L.gotoMonth(w, 'AUG')
const cell = L.T(L.cellId('stiff', '2026-08-20'))
await L.press(w, cell); await page.waitForTimeout(500)
await L.press(w, L.T('bid-oil')); await page.waitForTimeout(400)
await L.shot(w, P + '01-oil-form')
console.log('form text', (await page.locator(L.T('bid-picker')).innerText()).replace(/\n+/g, ' | ').slice(0, 1500))
await page.fill(L.T('oil-why'), 'walk C evening award')
await page.fill(L.T('oil-days'), '1')
await L.press(w, L.T('oil-give')); await page.waitForTimeout(700)
console.log('cell after give', JSON.stringify(await L.cellInfo(page, 'stiff', '2026-08-20')), 'err', await L.txt(page, L.T('oil-err')))
if (await L.vis(page, L.T('bid-cancel'))) { await L.press(w, L.T('bid-cancel')); await page.waitForTimeout(300) }
// add a second record to the same day (an LL, approved by the admin's tick) so the cell opens the day's list
await L.press(w, cell); await page.waitForTimeout(500)
await L.press(w, L.T('bid-LL')); await page.waitForTimeout(700)
if (await L.vis(page, L.T('bid-picker'))) { await L.press(w, L.T('bid-LL')); await page.waitForTimeout(700) }
console.log('cell with award + LL', JSON.stringify(await L.cellInfo(page, 'stiff', '2026-08-20')))
if (await L.vis(page, L.T('bid-cancel'))) { await L.press(w, L.T('bid-cancel')); await page.waitForTimeout(300) }
await L.press(w, cell); await page.waitForTimeout(700)
console.log('day list up:', await L.vis(page, L.T('daylist')))
await L.shot(w, P + '02-award-window')
const ent = await page.locator('[data-testid^="oil-detail-entered-"]').first().innerText().catch(() => null)
console.log('ENTERED LINE:', ent)
console.log('window text', (await page.locator('[role=dialog], .bidsheet, [data-testid="daylist"], [data-testid="bid-picker"]').first().innerText().catch(() => '')).replace(/\n+/g, ' | ').slice(0, 1500))
console.log('errors', JSON.stringify(errs))
await L.closeBrowser()
