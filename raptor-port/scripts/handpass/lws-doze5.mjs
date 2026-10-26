// [LW-DOZE-GUARDS] — do the grid's measurements run while the Leave War page dozes, and what do they read? VERSION 1
// The night of 21 Oct 26 (job 2). Desktop 1400 × 900: the open-bidding box against its first and last dates, the
// desktop bottom scrollbar; then another page in front, the window resized (the measures' resize listeners fire while
// the page dozes) and back. Run: node lws-doze5.mjs
import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'
const URL0 = process.env.HP_URL || 'http://localhost:4292/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push('pageerror ' + String(e).slice(0, 200)))
await page.goto(URL0 + '?fresh=1')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
const read = () => page.evaluate(() => {
  const box = document.querySelector('.lw-bidbox'), wrap = document.querySelector('.mx-wrap')
  const sec = document.getElementById('page-leavewar')
  const heads = [...document.querySelectorAll('.mx-wrap [data-testid^="head-"]')]
  const first = heads.find(h => h.closest('th')?.classList.contains('inbid') || false)
  const r = e => { if (!e) return null; const b = e.getBoundingClientRect(); return { l: Math.round(b.left), r: Math.round(b.right), w: Math.round(b.width), t: Math.round(b.top), h: Math.round(b.height) } }
  return { cls: sec.className, box: r(box), boxStyle: box ? box.getAttribute('style') : null, wrap: r(wrap), sl: wrap ? wrap.scrollLeft : null, hbar: r(document.querySelector('.lw-hbar, [data-testid="lw-hbar"]')) }
})
await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(1500)
const a = await read(); console.log('on screen     ', JSON.stringify(a))
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(800)
const b = await read(); console.log('dozing        ', JSON.stringify(b))
await page.setViewportSize({ width: 1000, height: 900 }); await page.waitForTimeout(800)
const c = await read(); console.log('dozing, resized', JSON.stringify(c))
await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(1500)
const d = await read(); console.log('back on screen', JSON.stringify(d))
// what a fresh measure says: a resize on screen to the same size forces one
await page.setViewportSize({ width: 1001, height: 900 }); await page.waitForTimeout(300); await page.setViewportSize({ width: 1000, height: 900 }); await page.waitForTimeout(800)
const e = await read(); console.log('re-measured   ', JSON.stringify(e))
console.log('errors', JSON.stringify(errors))
await browser.close()
