/* Phase C — the top bar's HEIGHT on every page, measured on two builds side by side (the plan's B10.2: "no page's bar
   taller than today"), at 1440×900, 1366×768, 844×390 and 390×844, for an admin. Usage: node … <urlA> <urlB> */
import { chromium } from '@playwright/test'
const [A, B] = [process.argv[2] || 'http://localhost:4192', process.argv[3] || 'http://localhost:4173']
const SIZES = [[1440, 900], [1366, 768], [1280, 800], [1500, 900], [1536, 864], [1600, 900], [1920, 1080], [844, 390], [390, 844]]
const PAGES = ['editsched', 'viewsched', 'inputs', 'quals', 'logic', 'leavewar', 'tracker', 'help', 'admin']
const browser = await chromium.launch()
async function heights(url, W, H) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, ...(W < 700 ? { hasTouch: true, isMobile: true } : {}) })
  const page = await ctx.newPage()
  await page.goto(url + '/'); await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(500)
  const out = {}
  for (const p of PAGES) { await page.evaluate(x => window.go(x), p); await page.waitForTimeout(500); out[p] = await page.evaluate(() => Math.round(document.querySelector('.topbar').getBoundingClientRect().height)) }
  await ctx.close(); return out
}
for (const [W, H] of SIZES) {
  const a = await heights(A, W, H), b = await heights(B, W, H)
  console.log(`${W}×${H}  ` + PAGES.map(p => `${p} ${a[p]}→${b[p]}${b[p] > a[p] + 1 ? ' ▲' : ''}`).join(' · '))
}
await browser.close()
