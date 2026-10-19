/* host probe — his report 20 Oct 26 "Login page not loading" (the readout link, ?kbdebug=1): at his iPhone's size, with
   an iPhone's user agent, open the build with and without ?kbdebug=1 — does the sign-in card come up, and is any error
   thrown? HP_URL points at the build. */
import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'
const CH = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const base = process.env.HP_URL || 'http://localhost:4334/'
const browser = await chromium.launch({ headless: true, ...(existsSync(CH) ? { executablePath: CH } : {}) })
for (const q of ['', '?kbdebug=1']) {
  const ctx = await browser.newContext({ viewport: { width: 402, height: 762 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0 Mobile/15E148 Safari/604.1' })
  const page = await ctx.newPage(); const errs = []
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
  page.on('response', r => { if (r.status() >= 400) errs.push('HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(base + q); await page.waitForTimeout(2500)
  const login = await page.locator('#luser').count()
  console.log(JSON.stringify(q || '(plain)'), 'sign-in box:', login ? 'YES' : 'NO', 'readout:', await page.locator('[data-kbdebug]').count(), 'errors:', errs.length ? errs : 'none')
  await page.screenshot({ path: `docs/img/handpass/2026-10-19-keyboard-scroll/walk/host-login${q ? '-kbdebug' : ''}.png` })
  await ctx.close()
}
await browser.close()
