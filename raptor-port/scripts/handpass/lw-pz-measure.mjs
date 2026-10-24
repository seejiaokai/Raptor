// [LW-PHONE-PINCH-ZOOM] questions (23 Oct 26): measure the Leave War grid on his iPhone's size (402 x 874) at each of
// today's zoom steps — how wide a day is, how many days and people show — to size the pinch's limits before asking him.
// The build served on http://localhost:4180/ (launch.json "raptor-preview"). Read only: nothing is saved.
import { chromium, devices } from '@playwright/test'
import { existsSync } from 'node:fs'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launch = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const URL = process.env.URL || 'http://localhost:4180/?fresh=1'
const W = Number(process.env.W || 402), H = Number(process.env.H || 874)
const T = id => `[data-testid="${id}"]`
const b = await chromium.launch(launch)
const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 3, userAgent: devices['iPhone 13'].userAgent })
const page = await ctx.newPage()
page.on('pageerror', e => console.log('pageerror', String(e).slice(0, 200)))
await page.goto(URL)
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.tap('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day'); await page.evaluate(() => window.go('leavewar'))
await page.waitForSelector('[data-testid="row-stiff"]'); await page.waitForTimeout(800)
const read = () => page.evaluate(() => {
  const wrap = document.querySelector('#page-leavewar .mx-wrap')
  const cells = [...document.querySelectorAll('#page-leavewar .mx-wrap tbody tr[data-testid="row-stiff"] td[data-testid^="cell-stiff-"]')]
  const wr = wrap.getBoundingClientRect()
  const dayW = cells.length > 3 ? cells[3].getBoundingClientRect().width : 0
  const fz = [...document.querySelectorAll('#page-leavewar .mx-wrap tbody tr[data-testid="row-stiff"] > *')].filter(c => !/^cell-/.test(c.dataset.testid || '') && !c.classList.contains('lw-ph')).slice(0, 2).reduce((a, c) => a + c.getBoundingClientRect().width, 0)
  const who = { width: fz }
  const rows = [...document.querySelectorAll('#page-leavewar .mx-wrap tbody tr[data-testid^="row-"]')]
  const rowH = rows[1] ? rows[1].getBoundingClientRect().height : 0
  const nameFont = rows[1] ? parseFloat(getComputedStyle(rows[1].querySelector('.cs') || rows[1]).fontSize) : 0
  const tbl = wrap.querySelector('table')
  const z = tbl ? getComputedStyle(tbl).zoom : '?'
  return { zoom: z, wrapW: Math.round(wr.width), frozenW: who ? Math.round(who.width) : 0, dayW: +dayW.toFixed(1), daysOnScreen: dayW ? +((wr.width - (who ? who.width : 0)) / dayW).toFixed(1) : 0, rowH: +rowH.toFixed(1), firstCells: [...document.querySelectorAll('#page-leavewar .mx-wrap tbody tr[data-testid="row-stiff"] > *')].slice(0, 3).map(c => c.className + ':' + Math.round(c.getBoundingClientRect().width)).join(' | '), peopleOnScreen: rowH ? +((innerHeight - wr.top) / rowH).toFixed(1) : 0, nameFontCss: nameFont }
})
const out = []
out.push(await read())
for (let i = 0; i < 1; i++) { await page.tap(T('lw-zoom-out')); await page.waitForTimeout(500); out.push(await read()) }
for (let i = 0; i < 4; i++) { await page.tap(T('lw-zoom-in')); await page.waitForTimeout(500); out.push(await read()) }
console.log(JSON.stringify(out, null, 1))
await b.close()
