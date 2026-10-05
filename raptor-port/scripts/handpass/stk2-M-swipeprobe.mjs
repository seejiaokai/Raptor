/* probe: which touch swipe moves the phone week to the next day (Walker M) */
import * as G from './stk2-M-lib.mjs'
const { L, W } = G
const w = await G.world({ phone: true }); const p = w.p
await L.go(p, 'editsched'); await W.showDay(p, 1)
const cdp = await w.ctx.newCDPSession(p)
const sl = () => p.evaluate(() => document.querySelector('#eWeek').scrollLeft)
console.log('start', await sl())
for (const y of [60, 100, 150, 200, 250, 290, 420, 520, 650, 780]) {
  const b = await sl()
  await cdp.send('Input.synthesizeScrollGesture', { x: 330, y, xDistance: -300, yDistance: 0, speed: 1200, gestureSourceType: 'touch' })
  await G.sleep(900)
  const a = await sl()
  console.log('y', y, b, '->', a, 'at', JSON.stringify(await p.evaluate(([x, yy]) => { const e = document.elementFromPoint(x, yy); return e ? (e.tagName + '.' + String(e.className).slice(0, 30)) : null }, [330, y])))
  if (a !== b) { await p.evaluate(v => { document.querySelector('#eWeek').scrollLeft = v }, b); await G.sleep(500) }
}
// real touch events
const tp = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] })
for (const y of [100, 290, 520]) {
  const b = await sl()
  await tp('touchStart', 350, y)
  for (let x = 350; x >= 50; x -= 25) { await tp('touchMove', x, y); await G.sleep(20) }
  await tp('touchEnd', 50, y)
  await G.sleep(900)
  console.log('touch y', y, b, '->', await sl())
  await p.evaluate(v => { document.querySelector('#eWeek').scrollLeft = v }, b); await G.sleep(400)
}
await w.browser.close()
