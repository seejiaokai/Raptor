/* D698 — the row of three tabs and the row of buttons under it, measured on the Inputs calendar, its List and the SANS
   calendar. Prints the tabs' frame, each tab, and every button of the row under them (top, height), and saves a
   picture of each. Run against a served build:  node scripts/handpass/cal-rows-measure.mjs [baseURL] [outDir] [width] */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
const CHROMIUM = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
const base = process.argv[2] || 'http://localhost:4180', out = process.argv[3] || 'docs/img/handpass/2026-10-09-cal-rows', W = +(process.argv[4] || 390)
mkdirSync(out, { recursive: true })
const phone = W <= 820
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctx = await browser.newContext({ viewport: { width: W, height: phone ? 844 : 800 }, deviceScaleFactor: 2, isMobile: phone, hasTouch: phone })
const page = await ctx.newPage()
await page.goto(base + '/?fresh=1')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day')
await page.evaluate(() => window.go('inputs'))
await page.waitForSelector('#inpCal')
const read = (name, rowSel) => page.evaluate(([name, rowSel]) => {
  const r = n => { const b = n.getBoundingClientRect(); return `${b.top.toFixed(1)}+${b.height.toFixed(1)}` }
  const tab = document.querySelector('#inMemberMode, #inSansMode'), frame = tab && tab.parentElement
  const row = document.querySelector(rowSel)
  const kids = row ? [...row.querySelectorAll('button, .ic-mon, .sc-month, .inputs-views')].filter(n => n.offsetParent).map(n => `${(n.id || n.className.toString().split(' ').slice(0, 2).join('.') || n.tagName).slice(0, 22)}=${r(n)}`) : []
  return `${name}: tabs frame ${frame ? r(frame) + ' .' + frame.className : '-'} | tabs ${[...(frame ? frame.querySelectorAll('button') : [])].map(r).join(' ')} | row ${row ? r(row) : '-'} | ${kids.join(' ')}`
}, [name, rowSel])
console.log(await read('INPUTS', '.ic-head'))
await page.screenshot({ path: `${out}/inputs-${W}.png`, clip: { x: 0, y: 0, width: Math.min(W, 900), height: 330 } })
await page.click('#inListBtn'); await page.waitForTimeout(250)
console.log(await read('LIST  ', '.inputs-top'))
await page.screenshot({ path: `${out}/list-${W}.png`, clip: { x: 0, y: 0, width: Math.min(W, 900), height: 330 } })
await page.click('#inSansMode'); await page.waitForSelector('[data-testid="sanscal"]')
console.log(await read('SANS  ', '.sc-head'))
await page.screenshot({ path: `${out}/sans-${W}.png`, clip: { x: 0, y: 0, width: Math.min(W, 900), height: 330 } })
/* the Medical tab's own row is not part of D698 - printed so a look can see it did not move */
await page.click('#inMedBtn'); await page.waitForTimeout(300)
console.log(await read('MEDICAL', '.medview .ic-head, .medview'))
await page.screenshot({ path: `${out}/medical-${W}.png`, clip: { x: 0, y: 0, width: Math.min(W, 900), height: 330 } })
await browser.close()
