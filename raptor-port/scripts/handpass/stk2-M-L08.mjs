/* L-08 — a second line while one question is open. SURF = week | board | phone */
import * as G from './stk2-M-lib.mjs'
import { tap, type, put } from './lib.mjs'
const { L, W } = G
const SURF = process.env.SURF || 'week'
const TAG = SURF === 'phone' ? 'ph' : 'dk'
const w = await G.world({ phone: SURF === 'phone' }); const p = w.p
const out = { SURF }
const A = process.env.A_KEY || 'fr:1.0.0.0'            // Tuesday wave 1, VL
const B = SURF === 'phone' ? 'fr:2.0.1.0' : 'fr:1.1.1.0' // desktop: Tuesday wave 2 RU "RED AIR"; phone: Wednesday wave 1 RU "RED AIR"
out.A = A; out.B = B
await G.logicEditOn(p)
await p.locator('#lgMissionMix').setChecked(true); await G.sleep(400)
await G.logicDone(p)
await L.go(p, 'editsched'); await W.showDay(p, 1)

const ROOT = SURF === 'board' ? '#schedBoard' : '#eWeek'
const attr = SURF === 'board' ? 'data-bfld' : 'data-txt'
const box = key => p.locator(`${ROOT} [${attr}="${key}"]:visible`).first()
async function snapshot(label) {
  const r = await p.evaluate(([root, attr, A, B]) => {
    const rect = e => { const b = e.getBoundingClientRect(); return { l: Math.round(b.left), t: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom) } }
    const keyed = [...document.querySelectorAll(`${root} [${attr}]`)].filter(e => e.offsetParent !== null && /^fr:/.test(e.getAttribute(attr)))
    const nearestAbove = e => { const er = e.getBoundingClientRect(); let best = null, bd = 1e9; for (const k of keyed) { const kr = k.getBoundingClientRect(); const d = er.top - kr.bottom; if (d > -4 && d < bd && Math.abs(kr.left - er.left) < 260) { bd = d; best = k } } return best ? best.getAttribute(attr) : null }
    const ui = [...document.querySelectorAll('[data-role-ui]')].map(e => ({ text: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 100), rect: rect(e), under: nearestAbove(e), isQ: e.classList.contains('mission-role-question'), visible: !!(e.offsetWidth || e.offsetHeight), cls: e.className.slice(0, 50) }))
    const choose = [...document.querySelectorAll('[data-role-choose]')].map(e => ({ text: e.innerText.trim(), rect: rect(e), under: nearestAbove(e), visible: !!(e.offsetWidth || e.offsetHeight) }))
    const bx = (k) => { const e = [...document.querySelectorAll(`${root} [${attr}="${k}"]`)].find(x => x.offsetParent !== null); return e ? { rect: rect(e), text: e.innerText.trim(), focused: document.activeElement === e } : null }
    return { ui, choose, boxA: bx(A), boxB: bx(B), active: document.activeElement ? (document.activeElement.getAttribute(attr) || document.activeElement.tagName) : null, vw: innerWidth, vh: innerHeight }
  }, [ROOT, attr, A, B])
  r.pic = await G.pic(p, `L08${TAG}${SURF}-${label}`)
  console.log('SNAP', label, JSON.stringify(r))
  out['snap_' + label] = r
  return r
}
if (SURF === 'board') { await G.boardOn(p, 1) }
else { await W.showDay(p, 1) }

/* A: type DS FOR VL in line A's Remarks and leave the box */
const a = box(A)
await a.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
await a.click()
if (SURF === 'board') { await a.fill(''); await p.keyboard.type('DS FOR VL', { delay: 8 }) } else { await p.keyboard.press('Control+A'); await p.keyboard.type('DS FOR VL', { delay: 8 }) }
await p.keyboard.press('Tab'); await G.sleep(700)
await snapshot('1-A-question-open')

if (SURF === 'phone') {
  /* swipe to the next day: a real touch scroll gesture */
  const cdp = await w.ctx.newCDPSession(p)
  const dayOf = () => p.evaluate(() => { const ds = [...document.querySelectorAll('#eWeek .day')]; const vis = ds.map(d => { const r = d.getBoundingClientRect(); return { di: +d.dataset.day, l: Math.round(r.left), r: Math.round(r.right) } }).filter(x => x.r > 0 && x.l < innerWidth); return vis })
  out.dayBefore = await dayOf()
  const tp = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] })
  await tp('touchStart', 340, 600)
  for (let x = 340; x >= 60; x -= 20) { await tp('touchMove', x, 600); await G.sleep(16) }
  await tp('touchEnd', 60, 600)
  await G.sleep(1200)
  out.swipeScrollLeft = await p.evaluate(() => { const d = document.querySelector('#eWeek .day'); const sc = d && (d.closest('.week') || d.parentElement); return sc ? sc.scrollLeft : null })
  out.dayAfter = await dayOf()
  console.log('days in view before/after swipe', JSON.stringify(out.dayBefore), JSON.stringify(out.dayAfter))
  await snapshot('2-after-swipe')
}
/* B: click into B's Remarks box */
const b = box(B)
await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
await G.sleep(300)
await b.click(); await G.sleep(700)
await snapshot('3-B-box-edited')
/* A's question: still present? */
out.finalQuestions = await p.evaluate(() => document.querySelectorAll('.mission-role-question').length)
out.finalChoose = await p.evaluate(() => [...document.querySelectorAll('[data-role-choose]')].map(e => e.innerText.trim()))
console.log('final', out.finalQuestions, JSON.stringify(out.finalChoose), 'errors', w.errors)
G.save('L08' + SURF + '-' + TAG, { out, errors: w.errors })
await w.browser.close()
