import { chromium } from 'playwright'
export const OUT = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-docs-rulings-slim-down-e83c74/bd625616-9217-44be-8d31-64893dff3b57/scratchpad/research-d'
export const browser = await chromium.launch()
export async function fresh(who = 'ad') {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  page.on('pageerror', e => console.log('PAGEERR', String(e)))
  await page.goto('http://localhost:4185/?fresh=1')
  await page.fill('#luser', who)
  await page.fill('#lpass', who === 'ad' ? 'a' : who)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(500)
  return page
}
export async function go(page, p) {
  await page.evaluate(p => window.go(p), p)
  await page.waitForFunction(p => window.CURPAGE === p, p)
  await page.waitForTimeout(800)
}
export async function box(page, sel) { if (!(await page.locator(sel).count())) return null; const b = await page.locator(sel).first().boundingBox(); return b && Object.fromEntries(Object.entries(b).map(([k,v])=>[k,Math.round(v)])) }
export async function snap(page, name, clip) { await page.screenshot({ path: `${OUT}/${name}.png`, ...(clip ? { clip: { x: clip.x, y: clip.y, width: clip.w, height: clip.h } } : {}) }) }
