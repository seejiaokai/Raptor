// RX1-9 — PHONE 390 x 844 by touch: the input of three (Ranger, Hex, Hunter) on the opened day's card and on the List's card; its window
import { launchP, openPhone, fileInputP, press, errs, WIN } from './or-RW1-plib.mjs'
import { shotX, log, sleep } from './or-RX1-lib.mjs'
const browser = await launchP()
const { page: p } = await openPhone(browser)
log('viewport', await p.evaluate(() => ({ w: innerWidth, h: innerHeight, dpr: devicePixelRatio, touch: navigator.maxTouchPoints })))
const made = await fileInputP(p, { type: 'Personal', people: ['Ranger', 'Hex', 'Hunter'], from: '2026-07-16', to: '2026-07-16', timed: ['19:00', '20:00'] })
log('filed', made)
const iid = made[0].iid
await sleep(500)
log('toast', await p.evaluate(() => (document.getElementById('toastEl') || {}).innerText))
const measure = sel => p.evaluate(sel => {
  const c = [...document.querySelectorAll(sel)].find(e => e.offsetParent); if (!c) return null
  const W = innerWidth, H = innerHeight, r = c.getBoundingClientRect()
  const leaves = [...c.querySelectorAll('*')].filter(e => e.children.length === 0 && e.textContent.trim())
  const cut = leaves.filter(e => e.scrollWidth > e.clientWidth + 1 || e.getBoundingClientRect().right > W + 0.5 || e.getBoundingClientRect().left < -0.5 || getComputedStyle(e).textOverflow === 'ellipsis').map(e => e.textContent.trim().slice(0, 30))
  return { text: c.innerText.replace(/\s+/g, ' ').trim(), card: { x: Math.round(r.x), right: Math.round(r.right), w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), bottom: Math.round(r.bottom) }, vw: W, vh: H, insideX: r.x >= 0 && r.right <= W, overflowX: c.scrollWidth > c.clientWidth + 1, cutLeaves: cut, leafBoxes: leaves.map(e => { const b = e.getBoundingClientRect(); return e.textContent.trim().slice(0, 14) + '@' + Math.round(b.x) + '-' + Math.round(b.right) + ',y' + Math.round(b.y) }) }
}, sel)
/* the Inputs calendar on the phone: open Thu 16 */
await p.evaluate(() => window.go('inputs')); await sleep(500)
if (await p.locator('#inCalBtn[aria-pressed="false"]').count()) { await press(p.locator('#inCalBtn')); await sleep(400) }
await shotX(p, 'rx1-9-1-calendar-month')
log('month bar(s) for the input', await p.evaluate(iid => [...document.querySelectorAll(`.ib-bar[data-iid="${iid}"]`)].map(e => ({ text: e.textContent.trim(), title: e.getAttribute('title'), box: (() => { const b = e.getBoundingClientRect(); return Math.round(b.x) + '-' + Math.round(b.right) + ',h' + Math.round(b.height) })() })), iid))
await p.locator('[data-icday="2026-07-16"]').tap({ position: { x: 8, y: 8 } }); await p.waitForSelector('[data-testid="win-inputsday"]'); await sleep(500)
const winBox = await p.evaluate(() => { const w = document.querySelector('[data-testid="win-inputsday"]'); const r = w.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), bottom: Math.round(r.bottom), vh: innerHeight } })
log('day window box', winBox)
log('opened-day card', await measure(`[data-testid="win-inputsday"] [data-popiid="${iid}"]`))
await shotX(p, 'rx1-9-2-day-card')
/* tap the card: the input's own window */
await press(p.locator(`[data-testid="win-inputsday"] [data-popiid="${iid}"]`).first()); await p.waitForSelector(WIN); await sleep(600)
const wb = await p.evaluate(sel => { const w = document.querySelector(sel); const r = w.getBoundingClientRect(); const body = w.querySelector('[class*=body]') || w; return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), bottom: Math.round(r.bottom), vw: innerWidth, vh: innerHeight, scrollH: body.scrollHeight, clientH: body.clientHeight } }, WIN)
log('input window box', wb, 'fraction of screen height', (wb.h / wb.vh).toFixed(2))
const sev = p.locator(`${WIN} [data-testid="pp-several"]`)
const sb = await sev.boundingBox()
log('Several people switch box', sb, 'in view', sb && sb.y >= wb.y && sb.y + sb.height <= wb.bottom && sb.x >= 0 && sb.x + sb.width <= wb.vw)
log('pressed people in window', await p.locator(WIN).evaluate(w => [...w.querySelectorAll('[data-pp][aria-pressed="true"]')].map(b => (window.PEOPLE[b.getAttribute('data-pp')] || {}).cs)), '| head', await p.locator(WIN).evaluate(w => (w.querySelector('.win-title, [class*=title]') || w).innerText.replace(/\s+/g, ' ').slice(0, 60)))
await shotX(p, 'rx1-9-3-input-window')
/* can "Several people" be reached: press it and see */
const picked0 = await p.locator(WIN).evaluate(w => (w.innerText.match(/\d+ picked[^\n]*/) || [''])[0])
await press(sev); await sleep(400)
log('after tapping Several people: picked text before/after', picked0, await p.locator(WIN).evaluate(w => (w.innerText.match(/\d+ picked[^\n]*/) || [''])[0]), '| pressed now', await p.locator(WIN).evaluate(w => [...w.querySelectorAll('[data-pp][aria-pressed="true"]')].length))
await shotX(p, 'rx1-9-4-after-several-tap')
await press(sev); await sleep(300)
await press(p.locator('#inpEditCancel')); await sleep(400)
if (await p.locator('[data-testid="win-inputsday-x"]').count()) { await press(p.locator('[data-testid="win-inputsday-x"]')); await sleep(300) }
/* the List's card */
await press(p.locator('#inListBtn')); await sleep(500)
if (await p.locator('#inRangeAll').count() === 0) { await press(p.locator('#inRangeBtn')); await sleep(300) }
await press(p.locator('#inRangeAll')); await sleep(600)
const lc = p.locator(`[data-iid="${iid}"]`).first()
await lc.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(400)
log('list card', await measure(`[data-iid="${iid}"]`))
await shotX(p, 'rx1-9-5-list-card')
log('errs', errs)
await browser.close()
