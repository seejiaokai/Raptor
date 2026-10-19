/* [RALLY-PER-FORMATION] — walker A's FAIL (A): the desktop board from 821 to 1199 wide. Measures the remarks box's width and a
   jet line's height on the built board, and the SAME board laid out as it was before the R box (the R boxes hidden and the old
   ten-track template put back in the page — the old line was exactly this line without its R), at 821, 900, 1000, 1100, 1199,
   1200 and 1440. Run: HP_URL=http://localhost:4298 node scripts/handpass/rally-narrow.mjs */
import { existsSync } from 'node:fs'
import { chromium } from '@playwright/test'
console.log('rally-narrow v1')
const BASE = process.env.HP_URL || 'http://localhost:4298'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const OLD = { wide: '18px 64px 74px 52px 52px 52px 1fr 1fr 1.2fr 92px', gap: '8px' }
for (const width of [821, 1000, 1100, 1200, 1300, 1439, 1440, 1600]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } }), p = await ctx.newPage()
  await p.goto(BASE + '/'); await p.waitForSelector('#luser')
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' })
  await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(500)
  await p.evaluate(() => window.openScheduler(0)); await p.waitForSelector('#sbBoard .sb-line'); await p.waitForTimeout(600)
  const read = () => p.evaluate(() => { const l = document.querySelector('#sbBoard .sb-line'); return { rmk: Math.round(l.querySelector('.nts').getBoundingClientRect().width), lineH: Math.round(l.getBoundingClientRect().height), sideways: document.querySelector('#sbBoard').scrollWidth > document.querySelector('#sbBoard').clientWidth + 1 } })
  const now = await read()
  await p.evaluate(o => { document.querySelectorAll('#sbBoard [data-bfld$=".rl"], #sbBoard .sb-rlnone').forEach(e => { e.style.display = 'none' }); document.querySelectorAll('#sbBoard .sb-line, #sbBoard .sb-lcols').forEach(e => { e.style.gridTemplateColumns = o.wide; e.style.gap = o.gap }) }, OLD)
  await p.waitForTimeout(100)
  const before = await read()
  console.log(`${width}: now remarks ${now.rmk}px, line ${now.lineH}px, sideways ${now.sideways} | before the R box: remarks ${before.rmk}px, line ${before.lineH}px`)
  await ctx.close()
}
await browser.close()
