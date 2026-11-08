// Chat 7 walk, extra: does the expand button bring "+N more" back / show every input? (short screens, where the compact month cuts)
import { chromium } from 'playwright'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
const OUT = dirname(fileURLToPath(import.meta.url))
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
console.log('walk-more.mjs v1')
for (const [tag, W, H, phone] of [['w1536x560', 1536, 560, false], ['ph390x560', 390, 560, true]]) {
  const ctx = await browser.newContext(phone ? { viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : { viewport: { width: W, height: H }, deviceScaleFactor: 2 })
  await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
  const page = await ctx.newPage()
  const errs = []
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()) }); page.on('pageerror', e => errs.push(String(e)))
  await page.goto('http://localhost:4378/')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(500)
  await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(500)
  await (phone ? page.locator('#inCalBtn').tap() : page.locator('#inCalBtn').click()); await page.waitForTimeout(900)
  const read = () => page.evaluate(() => ({ pressed: document.querySelector('[data-testid="ib-expand"]').getAttribute('aria-pressed'), more: [...document.querySelectorAll('#inpCal *')].filter(e => e.children.length === 0 && /\+\s*\d+\s*more/i.test(e.textContent)).map(e => e.textContent.trim()).slice(0, 6), bars: document.querySelectorAll('#inpCal [data-iid]').length, scrollH: document.documentElement.scrollHeight }))
  const s0 = await read(); await page.screenshot({ path: join(OUT, `${tag}-more-1-compact.png`) })
  await (phone ? page.locator('[data-testid="ib-expand"]').tap() : page.locator('[data-testid="ib-expand"]').click()); await page.waitForTimeout(900)
  const s1 = await read(); await page.screenshot({ path: join(OUT, `${tag}-more-2-every.png`) })
  await (phone ? page.locator('[data-testid="ib-expand"]').tap() : page.locator('[data-testid="ib-expand"]').click()); await page.waitForTimeout(900)
  const s2 = await read(); await page.screenshot({ path: join(OUT, `${tag}-more-3-compact-again.png`) })
  console.log(tag, JSON.stringify({ s0, s1, s2, errs }))
  await ctx.close()
}
await browser.close()
