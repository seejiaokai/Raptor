// [LW-DOZE-GUARDS] part 2 — what a Leave War change costs while its page dozes (a measure there forces the hidden
// grid's layout). Desktop 1400 × 900; times one war write through the bridge, on screen and dozing. VERSION 1
import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'
const URL0 = process.env.HP_URL || 'http://localhost:4292/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const page = await (await browser.newContext({ viewport: { width: 1400, height: 900 } })).newPage()
await page.goto(URL0 + '?fresh=1')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(2500)
const time = (code) => page.evaluate(async c => {
  const t0 = performance.now(); window.lwSetCell('ramp', '2026-03-1' + c, c % 2 ? 'LL' : '')
  const t1 = performance.now(); await new Promise(r => requestAnimationFrame(() => setTimeout(r, 0))); const t2 = performance.now()
  return [Math.round(t1 - t0), Math.round(t2 - t0)]
}, code)
const on = []; for (let i = 1; i <= 6; i++) { on.push(await time(i)); await page.waitForTimeout(300) }
console.log('on screen: [sync ms, to next frame ms]', JSON.stringify(on))
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(1500)
const off = []; for (let i = 1; i <= 6; i++) { off.push(await time(i)); await page.waitForTimeout(300) }
console.log('dozing:    [sync ms, to next frame ms]', JSON.stringify(off))
await browser.close()
