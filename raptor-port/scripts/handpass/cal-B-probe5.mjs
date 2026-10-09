import * as B from './cal-B-lib.mjs'
const w = await B.world('phone')
const p = w.page
await B.makeCounter(w, 'Delta', { seat: 'pilot', amber: 5, red: 3 })
await B.press(w, B.tid(w, 'roster-arrange')); await B.sleep(500)
const hold = async (id, onto, half) => {
  const g = await B.tid(w, `manning-drag-${id}`).boundingBox()
  const t = await B.tid(w, onto).locator('td.who').first().boundingBox()
  const a = { x: g.x + g.width / 2, y: g.y + g.height / 2 }, b = { x: t.x + Math.min(t.width / 2, 30), y: half === 'upper' ? t.y + 3 : t.y + t.height - 3 }
  const c = await B.cdp(w); await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [a] }); for (let i = 1; i <= 6; i++) await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a.x + ((b.x - a.x) * i) / 6, y: a.y + ((b.y - a.y) * i) / 6 }] }); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await B.sleep(500)
}
await hold('delta', 'fly-row-avail-p', 'upper')
console.log('order after drag', JSON.stringify(await B.blockOrder(w)))
for (const wait of [3000, 1500]) {
  await B.sleep(wait)
  const b = await B.tid(w, 'manning-delete-delta').boundingBox()
  console.log('wait', wait, 'box', JSON.stringify(b), 'at center', await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '.' + e.className + ' ' + (e.getAttribute('data-testid') || '') : null }, [b.x + b.width / 2, b.y + b.height / 2]))
  await B.touchTap(w, b.x + b.width / 2, b.y + b.height / 2); await B.sleep(500)
  const o = await B.blockOrder(w)
  console.log('order after tap', JSON.stringify(o))
  if (!o.includes('count-delta')) break
}
await B.close(w)
