/* [UI-CONSISTENCY-LOOK] round 3, answers 5–7 built — the pictures for his page: the built titles, list and bars, and the one
   question the build leaves (D1170): where a narrow desktop (1100 wide) wraps the Tracker's bar onto two rows, the bar as it
   was (its old button sizes put back on the page), as built (2 taller), and the alternative drawn (the rows 2 closer on a narrow
   desktop only). The bar's second row is ringed in amber.
   Run: HP_URL=http://localhost:<port> node scripts/handpass/cr3-built57.mjs → docs/img/handpass/2026-10-21-consistency-round3/built57/ */
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, login, go } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = 'docs/img/handpass/2026-10-21-consistency-round3/built57'
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const ctx = await browser.newContext({ viewport: { width: 1100, height: 800 }, deviceScaleFactor: 2 })
await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
const page = await ctx.newPage()
await page.goto(BASE + '/'); await login(page, 'a')
await go(page, 'tracker'); await page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await sleep(600)
/* ring the bar's second row: every control whose box sits below the first row's */
const ring = () => page.evaluate(() => {
  document.querySelectorAll('.zz-r2').forEach(e => e.classList.remove('zz-r2'))
  const items = [...document.querySelectorAll('#page-tracker header .controls>*')].filter(c => c.getBoundingClientRect().height > 0)
  const top = Math.min(...items.map(c => c.getBoundingClientRect().top))
  for (const c of items) if (c.getBoundingClientRect().top > top + 32) c.classList.add('zz-r2')
  let st = document.querySelector('#zzRingSt'); if (!st) { st = document.createElement('style'); st.id = 'zzRingSt'; document.head.appendChild(st) }
  st.textContent = '.zz-r2{outline:2px solid #ffb020;outline-offset:2px;border-radius:7px}'
  return Math.round(document.querySelector('#page-tracker header').getBoundingClientRect().height * 10) / 10
})
const shot = async (name, h) => { await page.screenshot({ path: `${OUT}/${name}.png`, clip: { x: 0, y: 95, width: 1100, height: 110 } }); console.log(name, h) }
const style = css => page.evaluate(css => { let s = document.querySelector('#zzLook'); if (!s) { s = document.createElement('style'); s.id = 'zzLook'; document.head.appendChild(s) } s.textContent = css }, css)
await style('#page-tracker header button.sm,#page-tracker header .findbox{height:auto!important}'); await sleep(150)
await shot('w1100-before', await ring())
await style(''); await sleep(150)
await shot('w1100-built', await ring())
await style('#page-tracker header .controls{row-gap:6px!important}'); await sleep(150)
await shot('w1100-closer', await ring())
await ctx.close(); await browser.close()
