/* The Tracker bar's three dropdowns on a phone: is the cut-off text the app or the test browser's WebKit?
   Same build, same size (402x874): WebKit and Chromium side by side, plus the dropdown's measured text box. */
import { chromium, webkit } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('trk-ur-selects v1')
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const OUT = resolve(ROOT, 'docs/img/handpass/2026-11-02-tracker-user-round/selects'); mkdirSync(OUT, { recursive: true })
const BASE = process.env.UR_URL || 'http://localhost:4241'
for (const [nm, eng, mobile] of [['webkit', webkit, true], ['chromium', chromium, true]]) {
  const b = await eng.launch({ headless: true })
  const ctx = await b.newContext({ viewport: { width: 402, height: 874 }, hasTouch: true, isMobile: mobile, deviceScaleFactor: 2 })
  const p = await ctx.newPage()
  await p.goto(BASE + '/'); await p.fill('#luser', 'us'); await p.fill('#lpass', 'us'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await p.waitForTimeout(400)
  await p.click('#burger'); await p.waitForTimeout(300); await p.locator('#drawer a[data-page="tracker"]').first().click()
  await p.waitForSelector('#flowSvg .ball', { state: 'attached', timeout: 20000 }); await p.waitForTimeout(600)
  const m = await p.evaluate(() => [...document.querySelectorAll('#activeSel, #courseSel, #sylSel')].map(s => { const cs = getComputedStyle(s); return { id: s.id, h: s.getBoundingClientRect().height, font: cs.fontSize, lh: cs.lineHeight, pad: cs.paddingTop + '/' + cs.paddingBottom, appearance: cs.appearance || cs.webkitAppearance } }))
  console.log(nm, JSON.stringify(m))
  await p.screenshot({ path: resolve(OUT, `tracker-bar-${nm}.png`), clip: { x: 0, y: 40, width: 402, height: 80 } })
  /* another page's dropdown, for comparison: Quals' */
  await b.close()
}
