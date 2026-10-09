import * as B from './cal-B-lib.mjs'
const w = await B.world(process.argv[2] || 'short')
const p = w.page
const info = id => p.evaluate(id => { const e = document.querySelector(`[data-testid="${id}"]`); if (!e) return null; const cs = getComputedStyle(e); const b = e.getBoundingClientRect(); return { oy: cs.overflowY, sh: e.scrollHeight, ch: e.clientHeight, top: Math.round(b.top), bottom: Math.round(b.bottom), maxH: cs.maxHeight } }, id)
await B.press(w, B.tid(w, 'fly-name-avail-p')); await B.sleep(400)
console.log('form', JSON.stringify(await info('counter-form')))
const sv = await B.tid(w, 'cform-save').boundingBox(); console.log('save before', JSON.stringify(sv))
/* a finger swipe up on the sheet body */
const c = await B.cdp(w)
const f = await B.tid(w, 'counter-form').boundingBox()
const a = { x: f.x + f.width / 2, y: f.y + f.height - 120 }
await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [a] })
for (let i = 1; i <= 8; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a.x, y: a.y - i * 30 }] }); await B.sleep(20) }
await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await B.sleep(500)
console.log('form after swipe', JSON.stringify(await info('counter-form')))
const sv2 = await B.tid(w, 'cform-save').boundingBox(); console.log('save after', JSON.stringify(sv2), 'page scrollY', await p.evaluate(() => scrollY))
await B.pic(p, 'probe-short-swipe')
await B.close(w)
