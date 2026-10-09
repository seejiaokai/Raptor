import { launch, open } from './it-A-lib.mjs'
const browser = await launch()
const { ctx, page } = await open(browser, 'desk')
console.log(JSON.stringify(await page.evaluate(() => window.INPUTS.find(r => r.type === 'Event'))))
await browser.close()
