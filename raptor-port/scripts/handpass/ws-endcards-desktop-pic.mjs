/* [WEEK-CROSS-END-CARDS] — the picture for his question "should we do that for desktop as well?" (3 Nov 26, after he chose
   the full-day end card on the phone, D1574). Edit Schedule at his PC's size (1536 x 864 at 125%), the week walked to
   Sunday at the front with the ‹ › arrows' own reading of the end (Sunday's front place), so next week's preview fills the
   rest of the screen as he sees it. The preview's days are ringed and tagged on the elements themselves (an outline and a
   ::before tag); everything else is the built app as it is.
   Run against a served build: PORT=4237 node scripts/handpass/ws-endcards-desktop-pic.mjs */
import { createRequire } from 'node:module'
import { existsSync, mkdirSync } from 'node:fs'
const require = createRequire('C:/Users/User/projects/Raptor/raptor-port/package.json')
const { chromium } = require('playwright')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-03-week-cross-end-cards/desktop'
mkdirSync(OUT, { recursive: true })
const b = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const page = await b.newPage({ baseURL: `http://localhost:${process.env.PORT || 4237}`, viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25 })
const problems = []
page.on('pageerror', e => problems.push(e.message)); page.on('console', m => m.type() === 'error' && problems.push(m.text()))
await page.goto('/'); await page.waitForSelector('#luser')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.evaluate(() => window.go('editsched')); await page.waitForFunction(() => window.CURPAGE === 'editsched')
await page.waitForSelector('#eWeek .day.peek', { state: 'attached' }); await page.waitForTimeout(600)
/* Sunday at the front: the arrows' own end (pan.ts weekScrollMax on a desktop = the last live day's front place) */
await page.evaluate(() => {
  const w = document.querySelector('#eWeek'); const ds = w.querySelectorAll('.day:not(.peek)')
  w.style.scrollBehavior = 'auto'; w.scrollLeft = ds[6].offsetLeft - ds[0].offsetLeft; w.style.scrollBehavior = ''
})
await page.waitForTimeout(700)
const n = await page.evaluate(() => {
  const st = document.createElement('style'); st.id = 'mock-mark'
  st.textContent = `#eWeek .day.peek{outline:3px solid #f5a524;outline-offset:-3px}
  #eWeek .day.peek[data-peek-day="0"]::before{content:"NEXT WEEK — THE PREVIEW TODAY";position:absolute;z-index:3;top:8px;right:10px;
  background:#f5a524;color:#1b1200;font:800 12px system-ui;letter-spacing:.05em;padding:4px 8px;border-radius:5px}`
  document.head.appendChild(st)
  return document.querySelectorAll('#eWeek .day.peek').length
})
await page.mouse.move(5, 500)
await page.waitForTimeout(300)
if (!await page.$('#mock-mark')) throw new Error('the mark was wiped before the picture')
await page.screenshot({ path: `${OUT}/desktop-preview-today.png` })
await b.close()
console.log(JSON.stringify({ peekDays: n, problems }))
