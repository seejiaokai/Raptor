// The member / guest build (5 Nov 26) — the code read's gap: the "Not saved" band's words at a 320-wide phone (an SE's
// width), WebKit and Chromium, with the app's letters and with wider ones (Verdana, as GitHub's and his iPhone's run wider).
// Measures whether "keep this page open" is cut short (its box narrower than its words) and whether Retry is on screen.
// Usage (from raptor-port/): WALK_DIR=<frozen dist> node scripts/handpass/mgb-band-320.mjs
import { chromium, webkit } from '@playwright/test'
import { serveFrozen } from './isr-serve.mjs'
console.log('[mgb-band-320 v1]')
const URL = 'http://localhost:4251/'
const REFUSE = () => {
  const w = window; if (w.__lsWrap) return; w.__lsWrap = true; w.__lsRefuse = false
  const set = Storage.prototype.setItem
  Storage.prototype.setItem = function (k, v) { if (w.__lsRefuse) throw new DOMException('forced', 'QuotaExceededError'); return set.call(this, k, v) }
}
for (const [name, engine] of [['webkit', webkit], ['chromium', chromium]]) for (const wide of [false, true]) {
  const b = await engine.launch()
  const ctx = await b.newContext({ viewport: { width: 320, height: 640 }, isMobile: name === 'webkit', hasTouch: true, deviceScaleFactor: 2 })
  await serveFrozen(ctx, URL)
  await ctx.addInitScript(REFUSE)
  if (wide) await ctx.addInitScript(() => { const s = document.createElement('style'); s.textContent = '*{font-family:Verdana,sans-serif !important}'; (document.head || document.documentElement).appendChild(s) })
  const page = await ctx.newPage()
  await page.goto(URL); await page.waitForSelector('#luser')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('.topbar')
  await page.evaluate(() => { window.__lsRefuse = true; window.go('admin') }); await page.waitForTimeout(500)
  await page.locator('.adm-cat').filter({ hasText: 'Users' }).first().click(); await page.waitForTimeout(300)
  await page.locator('#admGuestView').click(); await page.waitForTimeout(1500)
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(800)
  await page.waitForSelector('.topbar > .savestat.failed', { timeout: 8000 })
  const m = await page.evaluate(() => {
    const band = document.querySelector('.topbar > .savestat.failed'), rest = band.querySelector('.sv-rest'), lead = band.querySelector('.sv-msg b'), btn = band.querySelector('button').getBoundingClientRect()
    return { restCut: rest.scrollWidth > rest.clientWidth + 0.5, restW: rest.clientWidth, restNeeds: rest.scrollWidth, leadCut: lead.scrollWidth > lead.clientWidth + 0.5, retryIn: btn.left >= 0 && btn.right <= innerWidth, h: Math.round(band.getBoundingClientRect().height) }
  })
  console.log(`${name}${wide ? ' wide letters' : ''}: ${JSON.stringify(m)}`)
  await page.screenshot({ path: `docs/img/handpass/2026-11-05-member-guest-build/look/B3-band-320-${name}${wide ? '-wide' : ''}.png`, clip: { x: 0, y: 0, width: 320, height: 200 } })
  await b.close()
}
process.exit(0)
