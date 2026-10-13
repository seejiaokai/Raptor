/* W2 N3 — publish a weekday, change one seat, publish as AL1, Unpublish.  node n3-al.mjs desk */
import { L, openBoard, sleep, clearToast, toastShown, toastNow, signDay, pressDay, head } from './w2lib.mjs'
console.log('n3-al v1')
const w = await L.world('desk')
const p = w.page
const DI = 1
try {
  await openBoard(w, DI)
  console.log('sign', JSON.stringify(await signDay(p, DI)))
  let r = await pressDay(w, 'data-beak', DI)
  console.log('publish note:', JSON.stringify(r.toast && r.toast.text))
  await sleep(500)
  console.log('head', JSON.stringify(await head(p, DI)))
  /* a different man in a seat: a real drag of Warden's puck (FCP of 1A) onto ROutlaw's puck (FCP of 2A) swaps the two */
  const from = '#schedBoard [data-slot="1.0.0.0.p"] .puck', to = '#schedBoard [data-slot="1.0.0.1.p"] .puck'
  await p.locator(from).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
  const before = [await p.locator(from).first().innerText(), await p.locator(to).first().innerText()]
  const fb = await p.locator(from).first().boundingBox(), tb = await p.locator(to).first().boundingBox()
  await p.mouse.move(fb.x + fb.width / 2, fb.y + fb.height / 2); await p.mouse.down()
  await p.mouse.move(fb.x + fb.width / 2 + 6, fb.y + fb.height / 2 + 6, { steps: 3 })
  await p.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2, { steps: 14 })
  await p.mouse.move(tb.x + tb.width / 2 + 1, tb.y + tb.height / 2 + 1)
  await p.mouse.up(); await sleep(700)
  const after = [await p.locator(from).first().innerText(), await p.locator(to).first().innerText()]
  console.log('seats before', JSON.stringify(before), 'after', JSON.stringify(after), 'changed:', JSON.stringify(before) !== JSON.stringify(after))
  const h2 = await head(p, DI)
  console.log('head after change', JSON.stringify(h2))
  console.log('sign again', JSON.stringify(await signDay(p, DI)))
  r = await pressDay(w, 'data-alpub', DI)
  console.log('alpub', JSON.stringify(r.pressed ? { label: r.label } : r))
  await sleep(700)
  const receipt = await p.evaluate(() => (document.querySelector('#schedBoard .so-state, #schedBoard .signedline, #schedBoard [class*=receipt]') || {}).innerText)
  const pic1 = await L.pic(w, 'n3-desk-after-al1')
  const bodyReceipt = await p.evaluate(() => (document.querySelector('#schedBoard').innerText.match(/Published AL\d.*/) || [''])[0])
  console.log('RECEIPT:', JSON.stringify(bodyReceipt), '| note:', JSON.stringify(r.toast && r.toast.text))
  console.log('head after AL1', JSON.stringify(await head(p, DI)))
  await sleep(2800)
  const u = await pressDay(w, 'data-unpub', DI)
  await sleep(300)
  console.log('unpub first press', JSON.stringify(u.pressed ? { label: u.label, toast: u.toast } : u))
  const pic2 = await L.pic(w, 'n3-desk-after-unpublish')
  const t = await toastNow(p)
  console.log('NOTE now:', JSON.stringify(t && [t.text, t.opacity]))
  const want = 'Tuesday: AL1 withdrawn. Its changes are back on the working copy as pending, and Original is the issued schedule. Publishing reissues AL1.'
  console.log(`== N3 unpublish ${u.toast && u.toast.text === want ? 'PASS' : 'FAIL'}\n   want ${JSON.stringify(want)}\n   saw  ${JSON.stringify(u.toast && u.toast.text)}`)
} finally { await L.close(w) }
