/* RE-WALK 5 — the next-week peek. D49's mark reaches it too (the roll-call
   written with the fix found the peek was missing it: that column keeps its own
   copy of the week's flying-line markup, on purpose, so a shared change does not
   arrive there). Driven at desktop width, where the peek is drawn. */
import { open, go, shot, STATE } from './lib.mjs'

const { browser, page, errors } = await open({ width: 1500, height: 950, state: STATE })
await go(page, 'editsched')
await page.waitForTimeout(900)

/* make NEXT week's Monday carry a nought-minute line, then look at the peek */
const planted = await page.evaluate(() => {
  const w = window
  /* the peek reads the stashed/seeded NEXT week, never the live one, so plant it
     the way the app itself would: load next week, type the times, come back */
  return typeof w.shiftWeek === 'function' ? 'shiftWeek available' : 'no shiftWeek'
})
console.log('bridge:', planted)

const peek = await page.evaluate(() => {
  const days = [...document.querySelectorAll('#eWeek .day.peek')]
  return {
    peeks: days.length,
    marked: days.reduce((n, d) => n + d.querySelectorAll('.badtm').length, 0),
    lines: days.reduce((n, d) => n + d.querySelectorAll('.form').length, 0),
  }
})
console.log('the peek as the seed stands (no nought-minute line next week):', JSON.stringify(peek))
await shot(page, 'RW-05-peek-control')

/* now plant one: go to next week, type the landing time equal to the take-off,
   come back, and read the peek */
/* next week through the app's own week strip, not a bridge call */
const wks = await page.evaluate(() => [...document.querySelectorAll('[data-wk]')].map(b => ({ v: b.dataset.wk, t: (b.innerText || '').trim(), on: b.className.includes('on') })))
console.log('the week strip:', JSON.stringify(wks))
const here = wks.findIndex(w => w.on)
await page.locator(`[data-wk="${wks[here + 1].v}"]:visible`).first().click()
await page.waitForTimeout(2000)
const typed = await page.evaluate(() => {
  const w = window
  const f = (w.DAYS[0].waves && w.DAYS[0].waves[0] && w.DAYS[0].waves[0].formations || [])[0]
  if (!f) return '(next Monday has no flying line)'
  f.ld = f.to
  w.afterSchedMutate()
  return `${f.cs}: ${f.to} / ${f.ld}`
})
console.log('typed on next Monday:', typed)
await page.waitForTimeout(600)
await page.locator(`[data-wk="${wks[here].v}"]:visible`).first().click()
await page.waitForTimeout(2200)
const after = await page.evaluate(() => {
  const days = [...document.querySelectorAll('#eWeek .day.peek')]
  const m = days.flatMap(d => [...d.querySelectorAll('.badtm')])
  return {
    peeks: days.length,
    marked: m.length,
    boxes: m.map(e => ({ cls: e.className.slice(0, 30), says: (e.getAttribute('title') || '').slice(0, 60), txt: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 16) })),
  }
})
console.log('THE PEEK, with a nought-minute line next Monday:', JSON.stringify(after, null, 1))
/* a walk that left no picture did not happen — bring the peek column itself
   on screen, it lives past the seventh day in the week scroller */
await page.evaluate(() => {
  const m = document.querySelector('#eWeek .day.peek .badtm')
  if (m) m.scrollIntoView({ block: 'center', inline: 'center' })
})
await page.waitForTimeout(900)
await shot(page, 'RW-05-peek-marked')
console.log('errors:', errors.slice(0, 6))
await browser.close()
