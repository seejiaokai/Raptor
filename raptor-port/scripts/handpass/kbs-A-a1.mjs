import { open, go, version, scenario, keysUp, keysDown } from './kbs-A-lib.mjs'
version('a1')
const { browser, page, errors } = await open()
await go(page, 'editsched')
await page.evaluate(() => window.openScheduler(0))
await page.waitForSelector('#schedBoard'); await page.waitForTimeout(800)
// A1: remarks box of a flying line low in the board's panel
const box = page.locator('#schedBoard textarea.nts:visible').nth(2)
console.log('box value', await box.inputValue())
await scenario(page, 'A1', box, { what: 'board remarks of a flying line', inWindow: true })
console.log('errors', errors)
await browser.close()
