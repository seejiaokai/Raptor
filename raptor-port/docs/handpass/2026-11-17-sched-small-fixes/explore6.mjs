import { launch, go, pic, say, panelChip } from './wlib.mjs'
say('explore6 v3')
const { browser, page } = await launch('chromium', false)
await go(page, 'editsched')
for (const k of ['g:0.0.+', 'd:0.0.0.+']) {
  const seat = page.locator(`#eWeek .day[data-day="0"] [data-fill="${k}"]`).first()
  // eslint-disable-next-line react-doctor/async-await-in-loop -- one step after another in one browser: each waits for the page to answer the last
  await seat.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' }))
  await page.waitForTimeout(500)
  const chip = await panelChip(page)
  const cb = await chip.boundingBox()
  const b = await seat.boundingBox()
  await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2)
  await page.mouse.down()
  // eslint-disable-next-line react-doctor/async-await-in-loop -- one step after another in one browser: each waits for the page to answer the last
  for (let i = 1; i <= 12; i++) { await page.mouse.move(cb.x + (b.x + 40 - cb.x) * i / 12, cb.y + (b.y + b.height / 2 - cb.y) * i / 12); await page.waitForTimeout(30) }
  await pic(page, 'x-explore6c-drag-' + k.replace(/[:.+]/g, '_'))
  await page.mouse.up()
  await page.waitForTimeout(700)
  say(k, 'counts', await page.locator('#eWeek .day[data-day="0"] .oilcount').count())
  say('who', await page.evaluate(() => JSON.stringify(window.DAYS[0].ground.map(r => r.who)) + JSON.stringify(window.DAYS[0].dutywaves[0].rows.map(r => r.id))))
}
await browser.close()
