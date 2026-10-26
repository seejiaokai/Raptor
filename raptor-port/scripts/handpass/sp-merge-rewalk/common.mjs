import { existsSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
/* copied 26 Oct 26 for the re-walk after main was merged in (his D1402) — this checkout, the served build, the pictures folder */
const REPO = 'C:/Users/User/projects/Raptor/.claude/worktrees/sync-main-handoff-fe9391/raptor-port'
const require = createRequire(REPO + '/package.json')
const { chromium } = require('@playwright/test')
export const IMG = REPO + '/docs/img/handpass/2026-10-21-schedule-pages/merge-rewalk-1026'
export const BASE = process.env.HP_URL || 'http://localhost:4338'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
mkdirSync(IMG, { recursive: true })
console.log('common.mjs v1')

export async function launch(size) {
  const browser = await chromium.launch({ headless: true, ...launchOptions })
  const phone = size === 'phone'
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36' }
    : { viewport: { width: 1400, height: 900 } })
  const errors = []
  const hook = page => {
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
    page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
    page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  }
  const page = await ctx.newPage(); hook(page)
  await page.goto(BASE + '/')
  return { browser, ctx, page, errors, hook }
}
export async function login(page, who = 'a') {
  await page.waitForSelector('#luser')
  await page.fill('#luser', who === 'a' ? 'ad' : 'us')
  await page.fill('#lpass', who === 'a' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(600)
}
export async function go(page, to) {
  await page.evaluate(p => window.go(p), to)
  await page.waitForFunction(p => window.CURPAGE === p, to)
  await page.waitForTimeout(500)
}
export const shot = async (page, name, opts = {}) => { await page.screenshot({ path: `${IMG}/${name}.png`, ...opts }); console.log('shot', name) }
