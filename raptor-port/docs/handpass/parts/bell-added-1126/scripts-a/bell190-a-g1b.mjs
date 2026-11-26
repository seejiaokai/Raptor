// bell190 walker A — group 1b: the phone's other tap order on the Board — Ranger tapped in the crew drawer FIRST, then
// Tally's only puck (does any tap order put a man on another man's puck on a phone?)
import * as L from './bell190-a-lib.mjs'
console.log('bell190-a-g1b v1', L.LIBV)
const R = L.recorder('bell190-a-g1b')
const { ID, J } = L
const c = 'A1-only-board-phone-crew-first'
let w = await L.newWorld('desk')
try {
  await L.signIn(w, 'ad')
  const iid = await L.fileInput(w, L.WED, { type: 'Training', people: [ID.Tally], from: '09:00', to: '11:00' })
  w = await L.handOver(w, 'phone'); await L.signIn(w, 'ad')
  const p = w.page
  console.log('phone base', w.base, 'bundle ok')
  await L.openBoard(w, 2)
  const place = await L.rowPlace(p, 2, iid, ID.Tally)
  const n0 = await L.allNotices(p)
  const pb = 'a-' + c
  /* open the crew drawer by its AIRCREW tab */
  const tab = p.locator('#schedBoard .ros-tab').filter({ visible: true }).first()
  if (await tab.count()) { await tab.tap(); await L.sleep(90); await L.shot(w, pb + '-1-drawer-lift'); await L.sleep(700) }
  const m = p.locator('#sbRoster .rpuck[data-person="bane"]').filter({ visible: true }).first()
  await m.scrollIntoViewIfNeeded(); const mb = await m.boundingBox()
  await p.touchscreen.tap(mb.x + mb.width / 2, mb.y + mb.height / 2); await L.sleep(90)
  await L.shot(w, pb + '-2-ranger-lift'); await L.sleep(700)
  const sel = await p.evaluate(() => ({ armed: window.armedKey && window.armedKey(), drawerOpen: document.body.classList.contains('ros-open') }))
  const t = p.locator('#schedBoard ' + place.sel).filter({ visible: true }).first()
  if (await t.count()) { await t.scrollIntoViewIfNeeded(); const bb = await t.boundingBox(); await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await L.sleep(90); await L.shot(w, pb + '-3-tally-lift'); await L.sleep(800) }
  const r1 = await L.rec(p, iid)
  const f = L.newSince(n0, await L.allNotices(p))
  R(c, 'crew name first, then Tally\'s puck', 'RECORD', { afterRangerTap: sel, input: r1.people, note: await L.toast(p), lines: f.map(L.fmtN) }, '', [pb + '-1-drawer-lift.png', pb + '-2-ranger-lift.png', pb + '-3-tally-lift.png'])
} catch (e) { R(c, 'script', 'BLOCKED', String(e.stack || e).slice(0, 400)) }
await L.closeAll()
