import { L, snap } from './h.mjs'
import fs from 'node:fs'
console.log('s6 v1')
const { browser, ctx, page, errors } = await L.open({ width: 1400, height: 900 })
const T = async (name, fn) => { try { await fn() } catch (e) { console.log('STEP FAIL', name, String(e.message).split('\n')[0]) } }
async function s6(tag) {
  const vp = page.viewportSize()
  await T(tag + ' lw', async () => {
    await L.go(page, 'leavewar'); await page.waitForTimeout(1500)
    if (!(await page.locator('[data-testid="fly-row-req-w"]:visible').count())) { await page.locator('[data-testid="counts-toggle"]:visible').first().click(); await page.waitForTimeout(500) }
    await page.evaluate(() => window.scrollTo(0, 0))
    console.log(tag, 'LW rows:', JSON.stringify(await page.evaluate(() => ['fly-row-req-p', 'fly-row-req-w', 'fly-row-avail-p', 'fly-row-avail-w'].map(t => { const e = document.querySelector(`[data-testid="${t}"]`); return t + ': ' + (e ? e.innerText.replace(/\s+/g, ' ').slice(0, 40) : 'ABSENT') }))))
    await snap(page, `${tag}-s6-lw-manning-w-rows`, { scrollTo: '[data-testid="fly-row-req-w"]', marks: ['union:[data-testid="fly-row-req-w"], [data-testid="fly-row-avail-w"]'] })
    console.log(tag, 'LW groups:', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[data-testid^="group-"]')].map(e => e.innerText.replace(/\s+/g, ' ').trim()))))
    await snap(page, `${tag}-s6-lw-wso-groups`, { scrollTo: '[data-testid="group-IWSO"]', marks: ['[data-testid="group-IWSO"]', '[data-testid="group-OPSW"]'] })
  })
  await T(tag + ' sans', async () => {
    await L.go(page, 'inputs'); await page.waitForTimeout(800)
    await page.locator('#inSansMode').click(); await page.waitForTimeout(900)
    await snap(page, `${tag}-s6-sans-calendar`, { scrollTo: '[data-testid="sc-day-2026-10-22"]', marks: ['txt:#page-inputs::Pilots · WSOs still needed', '[data-testid="sc-day-2026-10-22"] .sc-figs'] })
    await page.locator('[data-testid="sc-day-2026-10-22"]').click(); await page.waitForTimeout(800)
    console.log(tag, 'SANS sheet:', await page.evaluate(() => document.querySelector('.sansday .sd-work')?.innerText.replace(/\s+/g, ' ')))
    await snap(page, `${tag}-s6-sans-daysheet`, { scrollTo: '.sansday .sd-work', marks: ['union:.sansday .sd-work th:nth-child(3), .sansday .sd-work td:nth-child(3)'] })
    await page.locator('.sansday .win-x').click().catch(() => {}); await page.waitForTimeout(300)
    await page.locator('#page-inputs button:has-text("⚙"):visible').first().click(); await page.waitForTimeout(700)
    await snap(page, `${tag}-s6-sans-settings`, { marks: ['txt:.floatwin::added together'] })
  })
}
await s6('desk-wso')
// phone, same world
await page.setViewportSize({ width: 390, height: 844 })
await s6('phone-wso')
// archive every WSO (desktop viewport), through Admin -> Users
await page.setViewportSize({ width: 1400, height: 900 })
await T('archive', async () => {
  await L.go(page, 'admin'); await page.waitForTimeout(800)
  const rows = () => page.locator('#page-admin button:has-text("WSO"):not(:has-text("Archived"))')
  let n = await rows().count(), guard = 0
  console.log('WSO rows before', n)
  while (n > 0 && guard++ < 60) {
    await rows().first().click(); await page.waitForTimeout(250)
    await page.getByRole('button', { name: 'Archive', exact: true }).click(); await page.waitForTimeout(400)
    n = await rows().count()
  }
  console.log('WSO rows after', n)
  await snap(page, 'nowso-admin-users', {})
})
await s6('desk-nowso')
await page.setViewportSize({ width: 390, height: 844 })
await s6('phone-nowso')
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
