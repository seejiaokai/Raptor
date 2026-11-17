// Pictures of the Leave War's Balances page today and as proposed (D2153, D2154). Run against a local vite preview.
// node bal.mjs <outdir> [port] [only]
import { createRequire } from 'module'
const require = createRequire('C:/Users/User/projects/Raptor/raptor-port/package.json')
const { chromium, devices } = require('@playwright/test')
const OUT = process.argv[2]
const PORT = process.argv[3] || '4197'
const ONLY = process.argv[4] || ''
const { OPTS } = await import('./options.mjs')

async function open(ctx) {
  const page = await ctx.newPage()
  await page.goto(`http://localhost:${PORT}/`)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForFunction(() => window.CURPAGE === 'leavewar')
  await page.waitForTimeout(1200)
  await page.locator('#page-leavewar .intab', { hasText: 'Balances' }).first().click()
  await page.waitForSelector('[data-testid="bal-scroll"]')
  await page.waitForTimeout(800)
  return page
}

// bring Ranger's row (he has pending days) into view
async function toRanger(page) {
  await page.evaluate(() => {
    const r = [...document.querySelectorAll('[data-testid^="bal-row-"]')].find(t => t.innerText.includes('Ranger'))
    const s = document.querySelector('[data-testid="bal-scroll"]')
    if (r && s) s.scrollTop = Math.max(0, r.offsetTop - 160)
  })
  await page.waitForTimeout(300)
}

async function apply(page, opt) {
  if (!opt) return
  await page.addStyleTag({ content: opt.css })
  if (opt.js) await page.evaluate(opt.js)
  await page.waitForTimeout(300)
}

async function run(ctx, dev) {
  for (const opt of [null, ...OPTS]) {
    const id = opt ? opt.id : 'today'
    if (ONLY && id !== ONLY && id !== 'today') continue
    const page = await open(ctx)
    await apply(page, opt)
    await page.screenshot({ path: `${OUT}/${dev}-${id}.png` })
    // a close crop round Ranger's row and the headings
    const box = await page.evaluate(() => {
      const r = [...document.querySelectorAll('[data-testid^="bal-row-"]')].find(t => t.innerText.includes('Ranger'))
      const card = document.querySelector('.bp-card').getBoundingClientRect()
      const rr = r.getBoundingClientRect()
      return { x: card.x, y: card.y, w: card.width, h: Math.min(rr.bottom + 90, card.bottom) - card.y }
    })
    await page.screenshot({ path: `${OUT}/${dev}-${id}-crop.png`, clip: { x: box.x, y: box.y, width: box.w, height: box.h } })
    if (dev === 'phone') {
      await page.evaluate(() => { const h = document.querySelector('.bp-hs'); h.scrollLeft = 10000 })
      await page.waitForTimeout(300)
      await page.screenshot({ path: `${OUT}/${dev}-${id}-slid.png`, clip: { x: box.x, y: box.y, width: box.w, height: box.h } })
    }
    await page.close()
  }
}

const browser = await chromium.launch()
if (!process.env.PHONE_ONLY) { const ctx = await browser.newContext({ viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 }); await run(ctx, 'desk'); await ctx.close() }
if (!process.env.DESK_ONLY) { const ctx = await browser.newContext({ ...devices['iPhone 13'], viewport: { width: 402, height: 874 }, deviceScaleFactor: 3 }); await run(ctx, 'phone'); await ctx.close() }
await browser.close()
console.log('done')
