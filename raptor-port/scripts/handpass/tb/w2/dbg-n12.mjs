import { L, openBoard, sleep, clearToast, toastShown, toastNow } from './w2lib.mjs'
console.log('dbg-n12 v2')
const w = await L.world('phone')
const p = w.page
try {
  await openBoard(w, 5)
  await w.press('#schedBoard [data-oilmode="5"]:visible')
  await sleep(500)
  await w.press('#schedBoard [data-oilblank="5"]:visible')
  await sleep(800)
  await clearToast(p)
  console.log('after clear', JSON.stringify(await toastNow(p)))
  const pk = p.locator('#schedBoard .puck[data-person="plasma"]').first()
  await pk.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await sleep(300)
  const bb = await pk.boundingBox()
  console.log('puck box', JSON.stringify(bb), await pk.evaluate(e => e.parentElement.outerHTML.slice(0, 300)))
  const probe = async label => { const t = await toastShown(p, 1500); console.log(label, JSON.stringify(t && [t.text, t.opacity])); await clearToast(p) }
  await pk.tap(); await probe('tap()')
  await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await probe('touchscreen.tap')
  await pk.click(); await probe('click()')
  const ob = p.locator('#schedBoard .puck[data-person="plasma"]').first()
  await p.locator('#schedBoard [data-oilitem]').first().tap().catch(e => console.log('item tap fail')); await probe('item tap')
} finally { await L.close(w) }
