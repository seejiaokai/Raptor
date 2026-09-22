/* D4 part three — is the phantom change after a reload peculiar to a weekend
   day that earns OIL, or does every published day do it?  Publish Wednesday
   (an ordinary weekday, no OIL anywhere) beside Saturday and reload both. */
import { open, board, shot, login } from './lib.mjs'
import { dayHead, signAndPublish, BASE_STATE } from './cd-lib.mjs'

const say = (...a) => console.log(...a)
const { browser, page, errors } = await open({ state: BASE_STATE })

for (const di of [2, 5]) {
  await board(page, di)
  const r = await signAndPublish(page, di)
  say(`day ${di} published:`, JSON.stringify((r.head || r).headRow || r))
}
await page.reload(); await page.waitForTimeout(1200)
if (await page.locator('#luser').count() && await page.locator('#luser').isVisible()) await login(page, 'a')
for (const di of [2, 5]) {
  await board(page, di)
  const h = await dayHead(page, di)
  say(`day ${di} after reload:`, h.headRow)
  await shot(page, 'CD-D4-07-day' + di + '-after-reload')
}

/* and a second reload, to see whether it keeps growing */
await page.reload(); await page.waitForTimeout(1200)
if (await page.locator('#luser').count() && await page.locator('#luser').isVisible()) await login(page, 'a')
for (const di of [2, 5]) {
  await board(page, di)
  say(`day ${di} after a SECOND reload:`, (await dayHead(page, di)).headRow)
}
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
