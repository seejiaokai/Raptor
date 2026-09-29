import { chromium } from 'playwright'
import { existsSync } from 'node:fs'
export const OUT = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-docs-rulings-slim-down-e83c74/bd625616-9217-44be-8d31-64893dff3b57/scratchpad/research-f'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export async function open({ who = 'ad' } = {}) {
  const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const errs = []; page.on('pageerror', e => errs.push(String(e)))
  page.on('dialog', d => { errs.push('dialog: ' + d.message()); d.accept() })
  await page.goto('http://localhost:4185/?fresh=1')
  await signIn(page, who)
  return { browser, ctx, page, errs }
}
export async function signIn(page, who) {
  await page.fill('#luser', who); await page.fill('#lpass', who === 'ad' ? 'a' : who)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(600)
}
export async function signOut(page) {
  await page.locator('#logout:visible, #accOut:visible, #guestOut:visible').first().click()
  await page.waitForSelector('#luser')
}
export async function go(page, p) {
  await page.evaluate(p => window.go(p), p)
  await page.waitForFunction(p => window.CURPAGE === p, p)
  await page.waitForTimeout(600)
}
export async function box(page, sel) { const l = typeof sel === 'string' ? page.locator(sel).first() : sel; if (!(await l.count())) return null; const b = await l.boundingBox(); return b && { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) } }
export async function txt(page, sel, n = 300) { const l = page.locator(sel).first(); if (!(await l.count())) return '(none)'; return (await l.innerText()).replace(/\s+/g, ' ').slice(0, n) }
export async function shot(page, name, clip) { await page.screenshot({ path: `${OUT}/${name}.png`, ...(clip ? { clip: { x: clip.x, y: clip.y, width: clip.w, height: clip.h } } : {}) }) }
