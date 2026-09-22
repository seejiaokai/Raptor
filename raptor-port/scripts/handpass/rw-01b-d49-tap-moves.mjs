/* RE-WALK 1b — the tap MOVES the board, which is what "does nothing" meant.
   Scroll the board away from the flying lines first, then tap the warning and
   measure whether the line came back into view. */
import { open, board, type, shot, STATE } from './lib.mjs'
const { browser, page, errors } = await open({ state: STATE })
const DI = 5
await board(page, DI)
await type(page, `[data-bfld="ff:${DI}.0.0.ld"]`,
  await page.evaluate(i => window.DAYS[i].waves[0].formations[0].to, DI))
await page.waitForTimeout(700)

const scroller = () => page.evaluate(() => {
  const w = document.querySelector('#schedBoard .sb-boardwrap')
  let el = w
  while (el && el.scrollHeight <= el.clientHeight + 4) el = el.parentElement
  return el ? { tag: el.tagName + '.' + String(el.className).split(' ')[0], top: Math.round(el.scrollTop), max: Math.round(el.scrollHeight - el.clientHeight) } : null
})
/* push the flying lines off screen */
await page.evaluate(() => {
  const w = document.querySelector('#schedBoard .sb-boardwrap')
  let el = w
  while (el && el.scrollHeight <= el.clientHeight + 4) el = el.parentElement
  if (el) el.scrollTop = el.scrollHeight
})
await page.waitForTimeout(400)
const before = await scroller()
const seenBefore = await page.evaluate(() => {
  const b = document.querySelector('#schedBoard .badtm')
  if (!b) return '(no marked box)'
  const r = b.getBoundingClientRect()
  return { top: Math.round(r.top), onScreen: r.top >= 0 && r.bottom <= window.innerHeight }
})
console.log('scrolled to the bottom:', JSON.stringify(before), '| the marked box:', JSON.stringify(seenBefore))
await shot(page, 'RW-01b-scrolled-away')

const rows = await page.evaluate(() => [...document.querySelectorAll('.wln')].filter(e => e.offsetParent !== null)
  .map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 70)))
const hit = rows.findIndex(x => /takes off and lands at the same time/.test(x))
console.log('tapping the warning at index', hit)
await page.evaluate(i => { const els = [...document.querySelectorAll('.wln')].filter(e => e.offsetParent !== null); els[i].click() }, hit)
await page.waitForTimeout(1600)
const after = await scroller()
const seenAfter = await page.evaluate(() => {
  const b = document.querySelector('#schedBoard .badtm')
  if (!b) return '(no marked box)'
  const r = b.getBoundingClientRect()
  return { top: Math.round(r.top), onScreen: r.top >= 0 && r.bottom <= window.innerHeight }
})
console.log('after the tap:', JSON.stringify(after), '| the marked box:', JSON.stringify(seenAfter))
console.log('THE BOARD MOVED:', before && after ? (before.top !== after.top) : 'no scroller found')
await shot(page, 'RW-01b-after-tap')
console.log('errors:', errors.slice(0, 6))
await browser.close()
