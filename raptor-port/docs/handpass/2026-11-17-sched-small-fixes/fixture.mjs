// fixture v4: ALL AVAIL on Monday's rows by the real controls (programme and sim: tap the seat then the puck; ground and duty: drag the puck); save the world
import { launch, go, pic, say, IMG, panelChip, dragAA } from './wlib.mjs'
import path from 'node:path'
say('fixture v4')
const { browser, ctx, page } = await launch('chromium', false)
await go(page, 'editsched')
for (const k of ['a:0.0.+', 's:0.amt.0.+']) {
  const seat = page.locator(`#eWeek .day[data-day="0"] [data-fill="${k}"]`).first()
  // eslint-disable-next-line react-doctor/async-await-in-loop -- one step after another in one browser: each waits for the page to answer the last
  await seat.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' }))
  await page.waitForTimeout(400)
  const b = await seat.boundingBox()
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  await page.waitForTimeout(400)
  const chip = await panelChip(page)
  const cb = await chip.boundingBox()
  await page.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2)
  await page.waitForTimeout(600)
}
await dragAA(page, 0, 'g:0.0.+')
await dragAA(page, 0, 'd:0.0.0.+')
say('oilcount parents', await page.evaluate(() => JSON.stringify([...document.querySelectorAll('#eWeek .oilcount')].map(c => (c.closest('.day') ? 'day' + c.closest('.day').dataset.day : '?') + ':' + (c.closest('[data-fill]') || { dataset: {} }).dataset.fill))))
await ctx.storageState({ path: path.join(IMG, '..', 'state.json') })
await browser.close()
