import * as L from './on-RX1-lib.mjs'
const W = await L.world({ tag: 'R7b', size: 'p844' })
const { page, tid, shot, press } = W
const J = o => JSON.stringify(o)
const sleep = L.sleep
const iid = await L.fileIt(W, L.SAT, { type: 'OD', people: ['bane'], title: 'OD thing' })
await page.evaluate(() => window.go('editsched')); await sleep(900)
const day = page.locator('#page-editsched .day:not(.peek)').nth(L.SAT_DI)
const row = day.locator(`[data-inprow="${iid}"]`).first()
await row.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(500)
const hex = await L.idOf(page, 'Hex')
const seatStyle = () => page.evaluate(([di, iid]) => {
  const d = [...document.querySelectorAll('#page-editsched .day:not(.peek)')][di]
  const seat = d.querySelector(`[data-inprow="${iid}"] .seat`)
  const cs = getComputedStyle(seat), pc = getComputedStyle(seat.querySelector('.puck'))
  const r = seat.getBoundingClientRect()
  return { cls: seat.className, seatShadow: cs.boxShadow.slice(0, 90), seatOutline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor, seatBorder: cs.borderStyle + ' ' + cs.borderColor, puckShadow: pc.boxShadow.slice(0, 90), puckOutline: pc.outlineStyle + ' ' + pc.outlineWidth + ' ' + pc.outlineColor, seatBefore: getComputedStyle(seat, '::after').content, box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], vw: innerWidth }
}, [L.SAT_DI, iid])
console.log('unarmed', J(await seatStyle()))
const pk = await row.locator('.puck').first().boundingBox()
await page.touchscreen.tap(pk.x + pk.width / 2, pk.y + pk.height / 2); await sleep(800)
console.log('armed', J(await seatStyle()))
await page.locator(`#eRoster .rpuck .puck[data-person="${hex}"]`).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
await page.locator(`#eRoster .rpuck .puck[data-person="${hex}"]`).first().tap(); await sleep(900)
console.log('question up', await tid('oilconf').count(), J(await seatStyle()))
await page.keyboard.press('Escape'); await sleep(700)
console.log('bar up', await tid('oilbar').count(), J(await seatStyle()))
// put the drawer away by its tab to see the row
await page.locator('#rosTab').tap(); await sleep(900)
console.log('drawer away; bar', await tid('oilbar').count(), J(await seatStyle()))
await row.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
await W.hush(); await shot('RX1-7-5-row-armed-drawer-away'); await W.unhush()
console.log('errors', J(W.errors))
await W.ctx.close(); process.exit(0)
