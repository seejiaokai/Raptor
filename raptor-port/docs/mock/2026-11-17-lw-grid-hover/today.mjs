import { createRequire } from 'module'
const require = createRequire('C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/package.json')
const { chromium, devices } = require('@playwright/test')
const OUT = process.argv[2]
const URL = 'http://localhost:4191/'

async function open(ctx) {
  const page = await ctx.newPage()
  await page.goto(URL)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForFunction(() => window.CURPAGE === 'leavewar')
  await page.waitForSelector('[data-testid="row-drifter"], #page-leavewar .mx tbody tr td.who', { timeout: 15000 })
  await page.waitForTimeout(1200)
  return page
}

// find a day cell in Drifter's row, the 9th visible day
async function cellOf(page, name, nth) {
  return page.evaluate(([name, nth]) => {
    const tr = [...document.querySelectorAll('#page-leavewar .mx tbody tr')].find(t => (t.querySelector('td.who')?.innerText || '').includes(name))
    const tds = [...tr.querySelectorAll('td')].filter(td => !td.classList.contains('who') && !td.classList.contains('bal') && !td.classList.contains('lwph'))
    const wrapR = document.querySelector('#page-leavewar .mx-wrap').getBoundingClientRect()
    const vis = tds.filter(td => { const r = td.getBoundingClientRect(); return r.left > wrapR.left + 220 && r.right < wrapR.right - 10 })
    const r = vis[nth].getBoundingClientRect()
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
  }, [name, nth])
}

const browser = await chromium.launch()
// desktop, his PC's size
{
  const ctx = await browser.newContext({ viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 })
  const page = await open(ctx)
  await page.evaluate(() => { const w = document.querySelector('#page-leavewar .mx-wrap'); w.scrollTop = 140 })
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/d0-desk-rest.png` })
  const c = await cellOf(page, 'Drifter', 8)
  await page.mouse.move(c.x, c.y)
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/d1-desk-hover.png` }); await page.screenshot({ path: `${OUT}/d2-desk-hover-crop.png`, clip: { x: 0, y: 225, width: 900, height: 620 } })
  const info = await page.evaluate(() => [...document.querySelectorAll(':hover')].map(e => e.tagName + '.' + e.className).slice(-3))
  console.log('desk hover', JSON.stringify(info), JSON.stringify(c))
  await ctx.close()
}
// phone, his iPhone's size
{
  const ctx = await browser.newContext({ ...devices['iPhone 13'], deviceScaleFactor: 3 })
  const page = await open(ctx)
  await page.screenshot({ path: `${OUT}/p0-phone-rest.png` })
  await page.evaluate(() => { const w = document.querySelector('#page-leavewar .mx-wrap'); w.scrollTop = 260 })
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/p1-phone-scrolled.png` })
  const c = await cellOf(page, 'Drifter', 2)
  await page.touchscreen.tap(c.x, c.y)
  await page.waitForTimeout(900)
  await page.screenshot({ path: `${OUT}/p2-phone-tap.png` })
  console.log('phone tap', JSON.stringify(c))
  await ctx.close()
}
await browser.close()
