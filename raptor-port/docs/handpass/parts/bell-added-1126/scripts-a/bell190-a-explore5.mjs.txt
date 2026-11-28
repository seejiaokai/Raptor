// bell190 walker A — exploration 5: the phone's Board, tap a row's "+ add", then a crew name
import * as L from './bell190-a-lib.mjs'
console.log('bell190-a-explore5 v1')
const d = await L.newWorld('desk')
await L.signIn(d, 'ad')
const iid = await L.fileInput(d, L.WED, { type: 'Training', people: [L.ID.Tally], from: '09:00', to: '11:00' })
const w = await L.handOver(d, 'phone')
await L.signIn(w, 'ad')
const p = w.page
console.log('input there?', L.J(await L.rec(p, iid)))
await L.go(p, 'editsched')
await L.shot(w, 'explore5-phone-week')
const sb = p.locator('[data-sbday="2"]').filter({ visible: true }).first()
console.log('sbday visible', await sb.count())
if (await sb.count()) { await sb.scrollIntoViewIfNeeded(); await sb.tap(); await L.sleep(1000) }
await L.shot(w, 'explore5-phone-board')
const fill = p.locator('#schedBoard [data-fill="g:2.2.+"]').filter({ visible: true }).first()
console.log('fill', await fill.count())
if (await fill.count()) {
  await fill.scrollIntoViewIfNeeded(); const bb = await fill.boundingBox(); console.log('fill box', L.J(bb))
  await p.touchscreen.tap(bb.x + bb.width - 20, bb.y + bb.height / 2); await L.sleep(120)
  await L.shot(w, 'explore5-phone-armtap-lift'); await L.sleep(700)
  console.log('armed', await p.evaluate(() => window.armedKey && window.armedKey()))
  await L.shot(w, 'explore5-phone-armed')
  const ros = await p.evaluate(() => [...document.querySelectorAll('#sbRoster .rpuck[data-person="bane"], .eroster .rpuck[data-person="bane"]')].map(e => { const r = e.getBoundingClientRect(); return `${e.closest('[id]')?.id} ${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)} vis=${getComputedStyle(e).visibility}` }))
  console.log('ranger in roster', L.J(ros))
}
console.log('errs', w.errs)
await L.closeAll()
