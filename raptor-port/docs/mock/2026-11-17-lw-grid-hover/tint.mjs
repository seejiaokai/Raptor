// The row tint over the name and balance cells (his D2171): today, and the proposed tint on the row under the mouse,
// at his PC's size, the mouse on one day of a person's row. Run against a local vite preview.
// node tint.mjs <outdir> [port]
import { createRequire } from 'module'
const require = createRequire('C:/Users/User/projects/Raptor/raptor-port/package.json')
const { chromium } = require('@playwright/test')
const OUT = process.argv[2]
const PORT = process.argv[3] || '4197'
// the proposed rule: the same faint tint as the day cells, laid OVER the pinned cells' solid fill as an image, so they
// stay solid (nothing pinned leaks); his own row keeps its own highlight
const TINT = `@media (hover: hover) { #page-leavewar .mx tbody:where(:not(.mstripe)) tr:not(.me):hover > td:is(.who, .bal) {
  background-image: linear-gradient(rgba(59,198,232,.05), rgba(59,198,232,.05)); } }`

async function open(ctx) {
  const page = await ctx.newPage()
  await page.goto(`http://localhost:${PORT}/`)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForFunction(() => window.CURPAGE === 'leavewar')
  await page.waitForSelector('#page-leavewar .mx tbody tr td.who', { timeout: 15000 })
  await page.waitForTimeout(1200)
  await page.evaluate(() => { document.querySelector('#page-leavewar .mx-wrap').scrollTop = 140 })
  await page.waitForTimeout(400)
  return page
}

async function cellOf(page, name, nth) {
  return page.evaluate(([name, nth]) => {
    const tr = [...document.querySelectorAll('#page-leavewar .mx tbody tr')].find(t => (t.querySelector('td.who')?.innerText || '').includes(name))
    const tds = [...tr.querySelectorAll('td')].filter(td => !td.classList.contains('who') && !td.classList.contains('bal') && !td.classList.contains('lwph'))
    const wrapR = document.querySelector('#page-leavewar .mx-wrap').getBoundingClientRect()
    const vis = tds.filter(td => { const r = td.getBoundingClientRect(); return r.left > wrapR.left + 220 && r.right < wrapR.right - 10 })
    const r = vis[nth].getBoundingClientRect()
    const w = tr.querySelector('td.who').getBoundingClientRect()
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, left: w.left }
  }, [name, nth])
}

const NAME = process.argv[4] || 'Cinch'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 })
for (const id of ['today', 'tint']) {
  const page = await open(ctx)
  if (id === 'tint') await page.addStyleTag({ content: TINT })
  const c = await cellOf(page, NAME, 6)
  await page.mouse.move(c.x, c.y)
  await page.waitForTimeout(500)
  const clip = { x: Math.max(0, c.left), y: Math.max(0, c.y - 90), width: 720, height: 180 }
  await page.screenshot({ path: `${OUT}/t-${id}-hover.png`, clip })
  await page.screenshot({ path: `${OUT}/t-${id}-full.png` })
  await page.close()
}
await browser.close()
console.log('done')
