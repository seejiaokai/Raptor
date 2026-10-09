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
const arranging = () => p.evaluate(() => document.querySelector('[data-testid="roster-arrange"]').className)
await hold('delta', 'fly-row-avail-p', 'upper')
console.log('arrange btn class before tap', await arranging())
await B.press(w, B.tid(w, 'roster-arrange')); await B.sleep(500)
console.log('after 1st tap on Rearrange button', await arranging())
await B.press(w, B.tid(w, 'roster-arrange')); await B.sleep(500)
console.log('after 2nd tap', await arranging())
await B.pic(p, 'probe-swallow')
await B.close(w)
