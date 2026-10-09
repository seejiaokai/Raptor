import { launch, open, shot, sleep, press } from './it-A-lib.mjs'
const browser = await launch()
for (const size of ['phone', 'desk']) {
  const { ctx, page } = await open(browser, size)
  await page.evaluate(() => window.go('editsched')); await sleep(page, 500)
  await press(page, page.locator(`#eWeek [data-sbday="2"]:visible`).first())
  await page.waitForSelector('#schedBoard'); await sleep(page, 500)
  console.log(size, JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => /done|close|✓|✕/i.test(b.id + b.textContent + (b.getAttribute('aria-label') || '') + (b.title || ''))).map(b => b.id + '|' + b.className + '|' + b.textContent.trim().slice(0, 12) + '|' + (b.getAttribute('aria-label') || '') + '|' + (b.title || '') + '|' + (document.querySelector('#schedBoard').contains(b)))))
  )
  await ctx.close()
}
await browser.close()
