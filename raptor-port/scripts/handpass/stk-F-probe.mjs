import * as F from './stk-F-lib.mjs'
import * as X from './stk-F-fx.mjs'
const c = await F.open('phone'); const { p } = c
await F.go(p, 'editsched'); await F.sleep(500)
const dayBtn = p.locator('#eWeek [data-sbday="2"]:visible').first(); await dayBtn.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await F.sleep(200)
let bb = await dayBtn.boundingBox(); await c.press(bb.x + bb.width / 2, bb.y + bb.height / 2)
await p.waitForSelector('#schedBoard:not([hidden])'); await F.sleep(600)
const tap = async sel => { const b = await p.locator(sel).first().boundingBox(); console.log('tap', sel, JSON.stringify(b)); await c.press(b.x + b.width / 2, b.y + b.height / 2) }
await tap('#sbMore'); await F.sleep(300); await tap('#sbMoreWide'); await F.sleep(900)
const left = () => p.evaluate(() => document.querySelector('#schedBoard').scrollLeft)
await p.mouse.move(200, 20); await p.mouse.wheel(1000, 0); await F.sleep(500); await p.mouse.wheel(-500, 0); await F.sleep(500); console.log('left', await left())
await tap('#sbMore'); await F.sleep(500)
console.log('menu', await p.evaluate(() => { const m = document.querySelector('#sbMoreMenu'); if (!m) return null; const r = m.getBoundingClientRect(); return { box: [r.left, r.top, r.width, r.height].map(Math.round), items: [...m.querySelectorAll('button')].map(b => { const q = b.getBoundingClientRect(); const h = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); return b.id + ' ' + JSON.stringify([q.left, q.top, q.width, q.height].map(Math.round)) + ' own=' + (h === b || b.contains(h)) }) } }))
await F.pic(p, 'probe-more-open')
await tap('#sbMoreInsights'); await F.sleep(800)
console.log('modal visible', await p.locator('#insightModal:visible').count(), 'left now', await left())
await F.pic(p, 'probe-after-tap')
await c.browser.close()
