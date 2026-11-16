// rwlib: re-walk helpers (sizes + touch), builds on wlib. v1
import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
import { BASE, STATE, IMG, errors, rec, say, state, go, bringIn } from './wlib.mjs'
import path from 'node:path'
const require = createRequire(process.cwd() + '/package.json')
const pw = require('playwright')
export { errors, rec, say, state, go, bringIn }
export async function rwlaunch(kind, w, h, touch) {
  const type = kind === 'webkit' ? pw.webkit : pw.chromium
  const browser = await type.launch({ headless: true })
  const opts = touch ? { viewport: { width: w, height: h }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : { viewport: { width: w, height: h } }
  if (existsSync(STATE)) opts.storageState = STATE
  const ctx = await browser.newContext(opts)
  const page = await ctx.newPage()
  const tag = `[${kind}${touch ? '-ph' : ''}${w}]`
  page.on('console', m => { if (m.type() === 'error') errors.push(tag + ' console: ' + m.text()) })
  page.on('pageerror', e => errors.push(tag + ' PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push(tag + ' HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(BASE + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await page.waitForTimeout(500)
  if (await page.locator('#luser').count()) {
    await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
    await page.click('#loginForm button[type=submit]')
  }
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(600)
  return { browser, ctx, page }
}
export const shot = (page, name) => page.screenshot({ path: path.join(IMG, name + '.png') })
export const D0 = '#eWeek .day[data-day="0"]'
export const gcount = (day = 0) => `#eWeek .day[data-day="${day}"] [data-fill="g:${day}.0.+"] .oilcount`
export async function act(page, loc, touch) {
  await bringIn(loc)
  const b = await loc.boundingBox()
  const x = b.x + b.width / 2, y = b.y + b.height / 2
  if (touch) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y)
}
export const blur = page => page.evaluate(() => { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur() })
export const esc = async page => { await page.keyboard.press('Escape'); await page.waitForTimeout(350) }
export const menuState = page => page.evaluate(() => ({
  drawer: !!document.querySelector('.drawer, #drawer, [class*=drawer]:not([hidden])') && !!document.querySelector('.drawer.open, #drawer.open, .drawer-open, .drawer:not([hidden])'),
  more: !!document.querySelector('#sbMoreMenu'),
}))
