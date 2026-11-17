// The hover ring (D2151, D2152) at his PC's size: today, the proposed hollow cyan ring on the day under the mouse,
// and a tapped day's own mark beside it for comparison. Run against a local vite preview.
// node ring.mjs <outdir> [port]
import { createRequire } from 'module'
const require = createRequire('C:/Users/User/projects/Raptor/raptor-port/package.json')
const { chromium } = require('@playwright/test')
const OUT = process.argv[2]
const PORT = process.argv[3] || '4197'
// the tapped day's own ring strength (matrix.css .mx td.selcell): inset 1px rgba(59,198,232,.6), with no fill
const RING = `#page-leavewar .mx tbody td:not(.who):not(.bal):hover { box-shadow: inset 0 0 0 1px rgba(59,198,232,.6) !important; }`

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
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
  }, [name, nth])
}

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 })
for (const id of ['today', 'ring']) {
  const page = await open(ctx)
  if (id === 'ring') await page.addStyleTag({ content: RING })
  // a tapped day for comparison: Ranger's, two rows above; its window is closed with Escape so only its mark shows
  const t = await cellOf(page, 'Drifter', 1)
  const c = await cellOf(page, 'Drifter', 4)
  await page.mouse.move(c.x, c.y)
  await page.waitForTimeout(500)
  const clip = { x: Math.max(0, t.x - 260), y: Math.max(0, c.y - 110), width: 520, height: 220 }
  await page.screenshot({ path: `${OUT}/r-${id}-hover.png`, clip })
  await page.screenshot({ path: `${OUT}/r-${id}-full.png` })
  // tap the comparison day; the one-day window opens and the day wears its selected mark
  await page.mouse.click(t.x, t.y)
  await page.waitForTimeout(700)
  // the open window takes the mouse, so the hovered day is drawn by the same rule on a marker class
  if (id === 'ring') await page.evaluate(([x, y]) => {
    const s = document.createElement('style'); s.textContent = '.mk-hov{box-shadow:inset 0 0 0 1px rgba(59,198,232,.6) !important}'; document.head.appendChild(s)
    document.elementsFromPoint(x, y).find(e => e.tagName === 'TD')?.classList.add('mk-hov')
  }, [c.x, c.y])
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUT}/r-${id}-beside-tapped.png`, clip })
  await page.close()
}
await browser.close()
console.log('done')
