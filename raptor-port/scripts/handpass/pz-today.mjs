/* [BOARD-PHONE-PINCH-ZOOM] (D1107, D1108) — pictures of TODAY at his iPhone's size (402 × 874, touch, 3x), before the
   design questions: the Scheduler Board in its desktop layout (opened, then panned to its right end) and Quals. Prints
   the sizes the questions rest on (the board's laid-out width, Quals' table width, what a whole-width fit would scale to).
   Run: HP_URL=http://localhost:<port> HP_SHOTS=<folder> node scripts/handpass/pz-today.mjs */
console.log('pz-today v1')
import { existsSync, mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, SHOTS, login, go } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
mkdirSync(SHOTS, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const ctx = await browser.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true })
await ctx.clock.install({ time: new Date('2026-07-14T09:00:00') })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
await page.goto(BASE + '/')
await login(page, 'a')
await go(page, 'editsched')
await page.locator('#eWeek [data-sbday="0"]:visible').first().tap()
await page.waitForSelector('#schedBoard:not([hidden])')
await page.waitForTimeout(500)
await page.locator('#sbMore').tap()
await page.locator('#sbMoreWide').tap()
await page.waitForTimeout(700)
await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' })
const m = await page.evaluate(() => {
  const b = document.getElementById('schedBoard')
  return { scrollW: b.scrollWidth, clientW: b.clientWidth, top: document.querySelector('#schedBoard .sb-top').getBoundingClientRect().height }
})
console.log('board desktop layout:', JSON.stringify(m), 'fit scale', (m.clientW / m.scrollW).toFixed(3))
await page.screenshot({ path: `${SHOTS}/today-board-wide-left.png` })
await page.evaluate(() => { const b = document.getElementById('schedBoard'); b.scrollLeft = b.scrollWidth })
await page.waitForTimeout(300)
await page.screenshot({ path: `${SHOTS}/today-board-wide-right.png` })
/* scrolled down too: where the crew list sits against the day */
await page.evaluate(() => { const b = document.getElementById('schedBoard'); b.scrollLeft = 0 })
await page.locator('#sbMore').tap(); await page.locator('#sbMoreWide').tap()   // back to the phone layout
await page.waitForTimeout(400)
await page.screenshot({ path: `${SHOTS}/today-board-phone-layout.png` })
await page.locator('#sbDone').tap()
await page.waitForTimeout(400)
await go(page, 'quals')
await page.waitForTimeout(600)
const q = await page.evaluate(() => {
  const t = document.querySelector('#page-quals table') || document.querySelector('#page-quals .qtable')
  const s = t && t.closest('[class*=scroll], .qwrap, .tablewrap') || t?.parentElement
  return t ? { tableW: Math.round(t.getBoundingClientRect().width), scroller: s ? s.className : null, scrollerW: s ? s.clientWidth : null } : null
})
console.log('quals:', JSON.stringify(q), q ? 'fit scale ' + (q.scrollerW / q.tableW).toFixed(3) : '')
await page.screenshot({ path: `${SHOTS}/today-quals.png` })
console.log('errors:', errors.length ? errors : 'none')
await browser.close()
