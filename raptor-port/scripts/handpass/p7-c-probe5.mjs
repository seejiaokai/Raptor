/* p7 walker C — probe 5: the PHONE board and week — where the crew list is, how a seat is armed and emptied. */
process.env.HP_PHONE = '1'
import { boot, world } from './p6-lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await world(L, { phone: true })
const DI = 1
await W.boardOn(p, DI)
await L.shot(p, 'probe5-phone-board')
const vis = sel => p.evaluate(s => [...document.querySelectorAll(s)].filter(e => e.offsetParent !== null).map(e => (e.id || e.className) + ' :: ' + (e.innerText || '').replace(/\s+/g, ' ').slice(0, 60) + ' @' + JSON.stringify(e.getBoundingClientRect().toJSON ? [Math.round(e.getBoundingClientRect().x), Math.round(e.getBoundingClientRect().y), Math.round(e.getBoundingClientRect().width), Math.round(e.getBoundingClientRect().height)] : '')), sel)
console.log('roster visible?', await vis('#sbRoster'), await vis('#sbRoster .rpuck[data-person="all"], #sbRoster .rpuck[data-person="allavail"]'))
console.log('tabs', await p.evaluate(() => [...document.querySelectorAll('#schedBoard button, #schedBoard [role=tab]')].filter(e => e.offsetParent !== null).map(e => (e.id || e.className) + ':' + (e.innerText || e.title || '').replace(/\s+/g, ' ').slice(0, 24)).slice(0, 60)))
const seat = p.locator('#schedBoard [data-slot="1.0.0.0.p"]:visible').first()
console.log('seat count', await seat.count())
if (await seat.count()) {
  await seat.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(300)
  await L.shot(p, 'probe5-phone-seat')
  const pk = seat.locator('.puck').first()
  await pk.tap(); await L.sleep(500)
  await L.shot(p, 'probe5-phone-puck-tapped')
  console.log('after tap: ARM', await p.evaluate(() => window.armedKey()), 'popups', await vis('.pop, .sheet, .menu, [role=dialog], .ctx, .pkmenu'))
  // long press
  const b = await pk.boundingBox()
  const cdp = await p.context().newCDPSession(p)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: b.x + b.width / 2, y: b.y + b.height / 2 }] })
  await L.sleep(900)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await L.sleep(500)
  await L.shot(p, 'probe5-phone-longpress')
  console.log('after long press: seat', await p.evaluate(() => document.querySelector('#schedBoard [data-slot="1.0.0.0.p"]')?.outerHTML.slice(0, 300)), 'popups', await vis('.pop, .sheet, .menu, [role=dialog], .ctx, .pkmenu'))
}
console.log('errors', errors)
await browser.close()
