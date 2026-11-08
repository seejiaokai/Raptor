// Chat 7, the picture for his question Q1 (D1625: drawn before anything is built): the Inputs list at 821 wide, no
// window open — as built (Remarks about 57 wide, words broken in two) and with Type narrowed too (a style laid over the
// running app for the picture only; nothing of it is in the app).
// Run: node q1-mock.mjs <port>   (a build of this branch served on that port)
import { chromium } from 'playwright'
import { existsSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = dirname(fileURLToPath(import.meta.url))
const BASE = 'http://localhost:' + (process.argv[2] || '4180')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launch = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const TYPE_W = Number(process.argv[3] || 112)
const res = {}

const browser = await chromium.launch(launch)
for (const w of [821, 900]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 760 }, deviceScaleFactor: 2 })
  await ctx.clock.install({ time: new Date('2026-07-13T09:00:00+08:00') })
  const page = await ctx.newPage()
  await page.goto(BASE + '/')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(500)
  await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(700)
  if (!(await page.locator('#intbl').isVisible().catch(() => false))) { await page.locator('#inListBtn').first().click(); await page.waitForTimeout(500) }
  const cols = () => page.evaluate(() => [...document.querySelectorAll('#intbl thead th')].map(t => Math.round(t.getBoundingClientRect().width)))
  // the widest thing the Type column holds, at its own width (a chip, or an event's title)
  const widest = () => page.evaluate(() => Math.max(...[...document.querySelectorAll('#intbl tbody td:nth-child(4) > *')].map(e => Math.round(e.getBoundingClientRect().width))))
  res[w] = { built: { cols: await cols(), widestType: await widest() } }
  await page.screenshot({ path: join(OUT, `q1-${w}-built.png`) })
  await page.addStyleTag({ content: `.intbl thead th:nth-child(4){width:${TYPE_W}px !important}` })
  await page.waitForTimeout(300)
  res[w].typeNarrowed = { typeWidth: TYPE_W, cols: await cols(), widestType: await widest() }
  await page.screenshot({ path: join(OUT, `q1-${w}-type${TYPE_W}.png`) })
  await ctx.close()
}
await browser.close()
writeFileSync(join(OUT, 'q1-mock.json'), JSON.stringify(res, null, 1))
console.log(JSON.stringify(res))
