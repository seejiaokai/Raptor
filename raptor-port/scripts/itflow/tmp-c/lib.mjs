import { chromium } from 'playwright'
import { existsSync } from 'node:fs'
export const OUT = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-docs-rulings-slim-down-e83c74/bd625616-9217-44be-8d31-64893dff3b57/scratchpad/research-c'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export async function open({ who = 'ad', phone = false } = {}) {
  const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
  const ctx = await browser.newContext(phone ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { viewport: { width: 1440, height: 900 }, acceptDownloads: true })
  const page = await ctx.newPage()
  const errs = []; page.on('pageerror', e => errs.push(String(e)))
  await page.goto('http://localhost:4185/?fresh=1')
  await page.fill('#luser', who); await page.fill('#lpass', who === 'ad' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(600)
  return { browser, ctx, page, errs }
}
export async function go(page, p) {
  await page.evaluate(p => window.go(p), p)
  await page.waitForFunction(p => window.CURPAGE === p, p)
  await page.waitForTimeout(500)
}
export async function box(page, sel) { const b = await page.locator(sel).first().boundingBox(); return b && { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) } }
