import { open, go, version, shot, tapBox, scenario } from './kbs-A-lib.mjs'
version('a16')
const { browser, page, errors } = await open()
await page.touchscreen.tap(30, 30); await page.waitForTimeout(800)
await tapBox(page, page.locator('a:visible', { hasText: /^Help$/ }).first()); await page.waitForTimeout(1200)
await scenario(page, 'A16', page.locator('#bugText'), { what: 'Help report a problem text box', skipLow: true })
console.log('errors', errors); await browser.close()
