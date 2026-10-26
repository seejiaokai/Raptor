import { L, snap } from './h.mjs'
const tag = process.env.TAG, W = +process.env.VW, H = +process.env.VH, state = process.env.STATE || null
console.log('s6b v1', tag, W, H, state)
const { browser, ctx, page, errors } = await L.open({ width: W, height: H, state })
const T = async (name, fn) => { try { await fn() } catch (e) { console.log('STEP FAIL', name, String(e.message).split('\n')[0]) } }
const closeWins = async () => { for (let i = 0; i < 4; i++) { const x = page.locator('.floatwin .win-x:visible').first(); if (await x.count()) { await x.click(); await page.waitForTimeout(250) } } }
const phone = W < 500
await T('lw', async () => {
  await L.go(page, 'leavewar'); await page.waitForTimeout(1500)
  if (!(await page.locator('[data-testid="fly-row-req-w"]:visible').count())) { await page.locator('[data-testid="counts-toggle"]:visible').first().click(); await page.waitForTimeout(500) }
  await page.evaluate(() => window.scrollTo(0, 0))
  const rowsTxt = async () => JSON.stringify(await page.evaluate(() => ['fly-row-req-p', 'fly-row-req-w', 'fly-row-avail-p', 'fly-row-avail-w'].map(t => { const e = document.querySelector(`[data-testid="${t}"]`); const cells = e ? [...e.children].map(c => c.innerText.trim()) : []; return t + ': first ' + cells.slice(0, 8).join(' ') + ' … last ' + cells.slice(-6).join(' ') })))
  console.log(tag, 'LW rows (Jan view):', await rowsTxt())
  await snap(page, `${tag}-lw-manning-jan`, { scrollTo: '[data-testid="fly-row-req-w"]', marks: ['union:[data-testid="fly-row-req-w"], [data-testid="fly-row-avail-w"]'] })
  await page.locator('[data-testid="month-DEC"]:visible').first().click(); await page.waitForTimeout(1200)
  console.log(tag, 'LW rows (Dec view):', await rowsTxt())
  await snap(page, `${tag}-lw-manning-dec`, { scrollTo: '[data-testid="fly-row-req-w"]', marks: ['union:[data-testid="fly-row-req-w"], [data-testid="fly-row-avail-w"]'] })
  console.log(tag, 'LW groups:', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[data-testid^="group-"]')].map(e => e.innerText.replace(/\s+/g, ' ').trim()))))
  await snap(page, `${tag}-lw-wso-groups`, { scrollTo: '[data-testid="group-IWSO"]', marks: ['[data-testid="group-IWSO"]', '[data-testid="group-OPSW"]'] })
})
await T('sans', async () => {
  await closeWins()
  await L.go(page, 'inputs'); await page.waitForTimeout(800)
  await closeWins()
  await page.locator('#inSansMode').click(); await page.waitForTimeout(900)
  await snap(page, `${tag}-sans-calendar`, { scrollTo: '[data-testid="sc-day-2026-10-22"]', marks: ['txt:#page-inputs::Pilots · WSOs still needed', '[data-testid="sc-day-2026-10-22"] .sc-figs'] })
  await page.locator('[data-testid="sc-day-2026-10-22"]').click(); await page.waitForTimeout(800)
  console.log(tag, 'SANS sheet:', await page.evaluate(() => document.querySelector('.sansday .sd-work')?.innerText.replace(/\s+/g, ' ')))
  await snap(page, `${tag}-sans-daysheet`, { scrollTo: '.sansday .sd-work', marks: ['union:.sansday .sd-work th:nth-child(3), .sansday .sd-work td:nth-child(3)'] })
  await closeWins()
  // a December day (after the archive date) too
  await page.locator('#page-inputs button[aria-label*="ext"], #icNext').first().click().catch(() => {})
})
await closeWins()
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
