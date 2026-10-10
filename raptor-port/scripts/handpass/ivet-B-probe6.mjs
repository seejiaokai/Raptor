import * as L from './ivet-B-lib.mjs'
const { sleep, WIN } = L
const browser = await L.launch()
const { page } = await L.open(browser, L.PHONE, { fresh: true, touch: true })
await L.toList(page, true)
const m = (await L.fileInput(page, true, { type: 'Meeting', d1: '2026-07-29', rmk: 'P6' }))[0]
await page.locator(`[data-testid="inl-row-${m.iid}"] [data-testid="inl-open"]`).tap(); await page.locator(WIN).waitFor(); await sleep(500)
console.log('lit while window open', await page.evaluate(() => document.querySelectorAll('.innew').length))
await page.screenshot({ path: L.OUT + '/s-lit-behind-window-A.png' })
await sleep(7000)
console.log('lit after 7s', await page.evaluate(() => document.querySelectorAll('.innew').length))
await page.screenshot({ path: L.OUT + '/s-lit-behind-window-B.png' })
await browser.close()
