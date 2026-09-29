import { chromium } from 'playwright'
import { existsSync } from 'node:fs'
export const OUT = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-docs-rulings-slim-down-e83c74/bd625616-9217-44be-8d31-64893dff3b57/scratchpad/research-e'
export async function start(who = 'ad') {
  const CH = '/opt/pw-browsers/chromium'
  const browser = await chromium.launch(existsSync(CH) ? { executablePath: CH } : {})
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true })
  await ctx.clock.setFixedTime(new Date('2026-09-29T09:00:00'))
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e)))
  await page.goto('http://localhost:4185/?fresh=1')
  await page.fill('#luser', who); await page.fill('#lpass', who === 'ad' ? 'a' : who)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(p => window.go(p), 'tracker')
  await page.waitForFunction(() => window.CURPAGE === 'tracker')
  await page.waitForSelector('#flowSvg .ball', { timeout: 20000 })
  await page.waitForTimeout(800)
  const shot = (n, clip) => page.screenshot({ path: `${OUT}/${n}.png`, ...(clip ? { clip: { x: clip.x, y: clip.y, width: clip.w, height: clip.h } } : {}) })
  const box = async sel => { const b = await page.locator(sel).first().boundingBox(); return b && Object.fromEntries(Object.entries(b).map(([k, v]) => [k, Math.round(v)])) }
  const ballBox = async id => { const l = page.locator(`#flowSvg .ball[data-id="${id}"]`); const b = await l.boundingBox(); return b && Object.fromEntries(Object.entries(b).map(([k, v]) => [k, Math.round(v)])) }
  const clickBall = id => page.locator(`#flowSvg .ball[data-id="${id}"]`).click()
  return { browser, page, errors, shot, box, ballBox, clickBall }
}
