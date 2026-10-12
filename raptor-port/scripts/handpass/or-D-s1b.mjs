// D1b — the same on the Scheduler Board: arm the row's "+ add" with a tap, then tap a name (and ALL AVAIL) in the crew list
import { open, fileInput, shot, sleep, log, goBoard, errs, browser, csId, toastBox, inputsOf, schedSurfaces } from './or-D-lib.mjs'
const { ctx, page } = await open()
await fileInput(page, { type: 'Meeting', people: ['Drifter', 'Hunter'], from: '2026-07-15', to: '2026-07-15', timed: ['14:00', '15:00'], title: 'Range brief' })
await goBoard(page)
const row = () => page.locator('#schedBoard .sb-panel.grnd .sb-arow:visible', { hasText: 'Drifter' }).first()
async function armAndTap(what) {
  await row().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(500)
  const b = await row().locator('.ppl').boundingBox()
  await page.touchscreen.tap(b.x + b.width - 10, b.y + b.height - 8); await sleep(700)
  log(`D1b armed (${what}): body =`, await page.evaluate(() => document.body.className), '| planning chip:', await page.evaluate(() => (document.querySelector('.ros-arm') || {}).innerText))
  await shot(page, `D1b-arm-${what}`)
  let t
  if (what === 'ALL AVAIL') t = page.locator('#sbRoster .puck[data-person="allavail"], #sbRoster [data-ph="allavail"]').filter({ visible: true }).first()
  else { const id = await csId(page, what); t = page.locator(`#sbRoster .rpuck .puck[data-person="${id}"]`).filter({ visible: true }).first() }
  await t.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(900)
  await t.tap(); await sleep(700)
  log(`D1b tapped ${what} in the crew list: note =`, JSON.stringify(await toastBox(page)), '| people =', JSON.stringify((await inputsOf(page, 'Range brief'))[0].people), '| body =', await page.evaluate(() => document.body.className))
  await shot(page, `D1b-after-${what.replace(' ', '')}`)
}
await armAndTap('Anvil')
await armAndTap('ALL AVAIL')
log('D1b board + week:', JSON.stringify(await schedSurfaces(page, 'Range brief')))
log(errs)
await ctx.close(); await browser.close()
