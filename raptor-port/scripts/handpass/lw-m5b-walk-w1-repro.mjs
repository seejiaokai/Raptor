// W1 repro pictures for two findings (29 Oct 26): F1 a touch while a group's colour palette is open presses a neighbour; F3 a chip for a qualification nobody holds does nothing.
// Run from raptor-port: node scripts/handpass/lw-m5b-walk-w1-repro.mjs
import { chromium, serveDist } from '../drawcheck/lib.mjs'
import { existsSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('lw-m5b-walk-w1-repro v1')
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../../docs/img/handpass/2026-10-29-lw-m5b/w1')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctx = await browser.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true, timezoneId: 'Asia/Singapore' })
await serveDist(ctx, 'http://localhost:4197', 'C:/dcm5bdraw/walkdist')
const page = await ctx.newPage()
await page.clock.setFixedTime(new Date('2026-01-08T09:00:00+08:00'))
await page.goto('http://localhost:4197/')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day')
const T = id => page.locator(`[data-testid="${id}"]`)
const ord = () => page.evaluate(() => [...document.querySelectorAll('[data-testid="settings-sheet"] .set-grow')].map(r => r.dataset.grow || r.dataset.testid.replace('grow-', '')).join(','))
// F3 set-up: a new qualification column nobody holds
await page.evaluate(() => window.go('quals')); await page.waitForTimeout(500)
await page.locator('#qEdit').tap(); await page.waitForTimeout(250); await page.locator('#qEditQuals').tap(); await page.waitForTimeout(300)
await page.getByPlaceholder(/LOW LEVEL/i).fill('NIGHT VISION GOGGLES'); await page.getByRole('button', { name: /^Add$/ }).tap(); await page.waitForTimeout(400)
await page.locator('#qSave').tap(); await page.waitForTimeout(300)
await page.evaluate(() => window.go('leavewar')); await page.waitForSelector('[data-testid="row-slipway"]')
await T('settings-open').tap(); await page.waitForTimeout(600)
await page.evaluate(() => { window.__clicks = []; for (const ev of ['pointerdown', 'pointerup', 'click']) document.addEventListener(ev, e => { const t = e.target.closest('[data-testid]'); window.__clicks.push(ev + ' ' + (t ? t.dataset.testid : e.target.tagName)) }, true) })
// F1: adding Management opens its colour palette; then touch "+ SC DAY"
await T('gadd-q:mgmt').tap(); await page.waitForTimeout(800)
await page.screenshot({ path: join(OUT, 'w1-finding-F1-1-palette-open-after-add.png') })
await page.evaluate(() => { window.__clicks = [] })
const before = await ord()
const bb = await T('gadd-q:scDay').boundingBox(); console.log('SC DAY chip box', JSON.stringify(bb))
await T('gadd-q:scDay').tap(); const t0 = Date.now(); await page.screenshot({ path: join(OUT, 'w1-finding-F1-2-right-after-touching-SC-DAY.png') })
await page.waitForTimeout(800)
console.log('rows before', before); console.log('rows after touching SC DAY', await ord())
console.log('events', JSON.stringify(await page.evaluate(() => window.__clicks)))
await page.screenshot({ path: join(OUT, 'w1-finding-F1-3-settled.png') })
// F3: the chip of a qualification nobody holds
await page.evaluate(() => { window.__clicks = [] })
const n0 = await ord(); await T('gadd-q:nightvisiong').scrollIntoViewIfNeeded().catch(() => {})
await page.screenshot({ path: join(OUT, 'w1-finding-F3-1-before.png') })
await T('gadd-q:nightvisiong').tap(); await page.waitForTimeout(800)
const n1 = await ord(); await page.screenshot({ path: join(OUT, 'w1-finding-F3-2-after-tap.png') })
console.log('F3 rows before / after pressing the chip', n0 === n1 ? 'UNCHANGED ' + n1 : n0 + ' -> ' + n1, JSON.stringify(await page.evaluate(() => window.__clicks)))
await browser.close()
