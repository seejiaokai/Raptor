// The HOST's reproduction of RX1-7's passing note: "one later Undo tap (drawer open) did not visibly undo".
// A phone 390 x 844 by touch: the Unavailable row's armed tap, answered, then Undo — with the drawer open, and put away.
import * as L from './on-RX1-lib.mjs'
const W = await L.world({ tag: 'H7', size: 'p844' })
const { page, tid, press } = W
const J = o => JSON.stringify(o)
const sleep = L.sleep
const iid = await L.fileIt(W, L.SAT, { type: 'OD', people: ['bane'], title: 'OD thing' })
const rec = () => L.recOf(page, iid)
const start = await rec()
console.log('filed', start)
await page.evaluate(() => window.go('editsched')); await sleep(900)
const day = page.locator('#page-editsched .day:not(.peek)').nth(L.SAT_DI)
const row = day.locator(`[data-inprow="${iid}"]`).first()
await row.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(500)
const hex = await L.idOf(page, 'Hex')
const undoInfo = () => page.evaluate(() => {
  const out = {}
  for (const id of ['undoBtn', 'redoBtn']) {
    const b = document.getElementById(id); if (!b) { out[id] = 'NONE'; continue }
    const r = b.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    out[id] = { disabled: b.disabled, title: b.title, box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], shown: r.width > 0, under: h ? (h.id || h.className || h.tagName).toString().slice(0, 60) : null, onTop: !!h && (h === b || b.contains(h)) }
  }
  const ros = document.querySelector('#eRoster'); const rb = ros && ros.getBoundingClientRect()
  out.drawer = rb ? [Math.round(rb.left), Math.round(rb.top), Math.round(rb.width), Math.round(rb.height)] : null
  return out
})
console.log('undo before', J(await undoInfo()))
const pk = await row.locator('.puck').first().boundingBox()
await page.touchscreen.tap(pk.x + pk.width / 2, pk.y + pk.height / 2); await sleep(800)
const hp = page.locator(`#eRoster .rpuck .puck[data-person="${hex}"]`).first()
await hp.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
await hp.tap(); await sleep(900)
console.log('question', await tid('oilconf').count(), await tid('oilconf-lead').innerText().catch(() => 'NO'))
await press(tid('oil-yes')); await sleep(200)
await press(tid('oilconf-save')); await sleep(1000)
console.log('after Swap', await rec(), 'toast', await L.toast(page))
const u1 = await undoInfo(); console.log('undo after swap, drawer as left', J(u1))
// 1 — a tap exactly where the Undo button is, as a finger would, drawer as the app left it
const b = u1.undoBtn
if (b && b.box) { await page.touchscreen.tap(b.box[0] + b.box[2] / 2, b.box[1] + b.box[3] / 2); await sleep(800) }
console.log('after a finger on Undo (drawer as left):', await rec(), 'back to start', (await rec()) === start, 'toast', await L.toast(page))
console.log('undo now', J(await undoInfo()))
if ((await rec()) !== start) {
  // 2 — put the drawer away the way a person does, then Undo
  const tab = page.locator('#rosTab')
  console.log('rosTab', await tab.count(), await tab.isVisible().catch(() => false))
  if (await tab.count()) { await tab.tap().catch(e => console.log('rosTab tap failed', String(e).slice(0, 120))); await sleep(700) }
  const u2 = await undoInfo(); console.log('undo, drawer put away', J(u2))
  if (u2.undoBtn && u2.undoBtn.box) { await page.touchscreen.tap(u2.undoBtn.box[0] + u2.undoBtn.box[2] / 2, u2.undoBtn.box[1] + u2.undoBtn.box[3] / 2); await sleep(800) }
  console.log('after Undo (drawer away):', await rec(), 'back to start', (await rec()) === start, 'toast', await L.toast(page))
}
await page.screenshot({ path: 'docs/img/handpass/2026-10-13-oil-ask-notify/RX1/H7-after-undo.png' })
console.log('errors', J(W.errors))
await W.ctx.close(); process.exit(0)
