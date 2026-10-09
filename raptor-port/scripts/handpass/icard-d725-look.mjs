// THE BIGGER DAYS OF THE WINDOW'S CALENDAR ON A PHONE (owner D725, 10 Oct 26 — "1 ok bigger").
// One saved one-person input opened from the phone's Inputs list, its window photographed AS BUILT, then with D725's
// one rule taken out of the page's own stylesheet (so the "before" is the same input, the same window, the same
// build — not an older picture), and a NEW input's window as built. It prints each day's measured size and whether
// Save is in sight; the gate that holds the size is e2e/inputs-calendar.spec.ts ("a finger's size").
//
//   node scripts/handpass/icard-d725-look.mjs <out dir>          (the built bundle on :4180)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
const OUT = process.argv[2] || 'docs/img/handpass/2026-10-10-input-card-check/d725'
mkdirSync(OUT, { recursive: true })
const URL = (process.env.LOOK_URL || 'http://localhost:4180/') + '?fresh=1'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errors = []
const WIN = '[data-testid="win-inputedit"]'

const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true })
const page = await ctx.newPage()
page.on('pageerror', e => errors.push('pageerror: ' + e.message))
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
page.on('response', r => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()) })
await page.goto(URL)
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day')
await page.evaluate(() => window.go('inputs'))

const size = () => page.evaluate(() => {
  const r = s => document.querySelector(s).getBoundingClientRect()
  const d = r('#inpEdCal .rc-d:not(.wk)'), n = r('#inpEdCal .rc-nav'), cal = r('#inpEdCal'), win = r('[data-testid="win-inputedit"]'), save = r('#inpEditSave')
  return {
    day: Math.round(d.width) + ' x ' + Math.round(d.height), arrow: Math.round(n.height), calendar: Math.round(cal.width) + ' x ' + Math.round(cal.height),
    insideWindow: cal.left >= win.left - 0.5 && cal.right <= win.right + 0.5,
    saveInSight: save.bottom <= win.bottom + 0.5 && save.bottom <= innerHeight + 0.5,
    pageWiderThanScreen: document.documentElement.scrollWidth > innerWidth + 1,
  }
})

/* a saved one-person input, from the list */
await page.locator('#inListBtn').tap()
if (!(await page.locator('#inRangePop').count())) await page.locator('#inRangeBtn').tap()
await page.locator('#inRangeAll').tap(); await page.waitForTimeout(300)
const iid = await page.evaluate(() => window.INPUTS.find(r => r.type === 'Appointment' && !r.grp)?.iid ?? '')
await page.locator(`[data-iid="${iid}"]`).first().locator('[data-testid="inl-open"]').tap()
await page.locator('#inpEdCal').waitFor(); await page.waitForTimeout(500)
console.log('saved input, as built :', JSON.stringify(await size()))
await page.screenshot({ path: join(OUT, 'phone-window-saved-after.png') })
await page.locator('#inpEdCal').screenshot({ path: join(OUT, 'phone-calendar-after.png') })

/* the same window without D725's rule — the "before" */
const removed = await page.evaluate(() => {
  let n = 0
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules } catch { continue }
    for (let i = rules.length - 1; i >= 0; i--) {
      const m = rules[i]
      if (!(m instanceof CSSMediaRule) || !/820px/.test(m.conditionText)) continue   // the build writes "(width <= 820px)"
      for (let j = m.cssRules.length - 1; j >= 0; j--) if (/\.inpedwin #inpEdCal/.test(m.cssRules[j].selectorText || '')) { m.deleteRule(j); n++ }
    }
  }
  return n
})
await page.waitForTimeout(300)
console.log('rules taken out for the "before":', removed)
console.log('saved input, before   :', JSON.stringify(await size()))
await page.screenshot({ path: join(OUT, 'phone-window-saved-before.png') })
await page.locator('#inpEdCal').screenshot({ path: join(OUT, 'phone-calendar-before.png') })
await ctx.close()

/* a NEW input's window, as built (a fresh page — the rule is back) */
const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true })
const p2 = await ctx2.newPage()
p2.on('pageerror', e => errors.push('pageerror: ' + e.message))
await p2.goto(URL)
await p2.fill('#luser', 'ad'); await p2.fill('#lpass', 'a')
await p2.click('#loginForm button[type=submit]'); await p2.waitForSelector('#vWeek .day')
await p2.evaluate(() => window.go('inputs'))
await p2.locator('#inpCal [data-icday]').nth(10).tap({ position: { x: 10, y: 10 } })
await p2.locator('#icPopAdd').tap(); await p2.locator('#inpEdCal').waitFor(); await p2.waitForTimeout(500)
const d = await p2.evaluate(() => { const r = document.querySelector('#inpEdCal .rc-d:not(.wk)').getBoundingClientRect(); return Math.round(r.width) + ' x ' + Math.round(r.height) })
console.log('new input, as built   : day', d)
await p2.screenshot({ path: join(OUT, 'phone-window-new-after.png') })
/* a tap on a day of the bigger calendar does what it did: it picks the day */
const before = await p2.locator('#inpEdCal .rc-d.s').count()
await p2.locator('#inpEdCal .rc-d:not(.wk)').nth(8).tap(); await p2.waitForTimeout(250)
console.log('a tap on a day picks it:', (await p2.locator('#inpEdCal .rc-d.s').count()) >= 1, '(start marks before', before + ')')
await ctx2.close()

/* the other sizes: the smallest phone, a big one, each side of the 820px line, a desktop (unchanged — its picture too).
   And the OTHER calendars that share the day's markup keep their size: the list's date filter is measured beside it. */
for (const [w, h, touch] of [[320, 568, true], [430, 932, true], [820, 1180, true], [821, 1180, false], [1440, 900, false]]) {
  const c = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: touch, hasTouch: touch })
  const p = await c.newPage()
  p.on('pageerror', e => errors.push(w + ' pageerror: ' + e.message))
  await p.goto(URL)
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a')
  await p.click('#loginForm button[type=submit]'); await p.waitForSelector('#vWeek .day')
  await p.evaluate(() => window.go('inputs'))
  await p.click('#inListBtn')
  if (!(await p.locator('#inRangePop').count())) await p.click('#inRangeBtn')
  const filter = await p.evaluate(() => { const d = document.querySelector('#inRangePop .rc-d:not(.wk)'); if (!d) return 'not drawn'; const r = d.getBoundingClientRect(); return Math.round(r.width) + ' x ' + Math.round(r.height) })
  await p.click('#inRangeAll'); await p.waitForTimeout(300)
  const id = await p.evaluate(() => window.INPUTS.find(r => r.type === 'Appointment' && !r.grp)?.iid ?? '')
  await p.locator(`[data-iid="${id}"]`).first().locator('[data-testid="in-open"], [data-testid="inl-open"]').click()
  await p.locator('#inpEdCal').waitFor(); await p.waitForTimeout(400)
  const m = await p.evaluate(() => {
    const r = s => document.querySelector(s).getBoundingClientRect()
    const d = r('#inpEdCal .rc-d:not(.wk)'), cal = r('#inpEdCal'), win = r('[data-testid="win-inputedit"]'), save = r('#inpEditSave')
    return { day: Math.round(d.width) + ' x ' + Math.round(d.height), insideWindow: cal.left >= win.left - 0.5 && cal.right <= win.right + 0.5, saveInSight: save.bottom <= win.bottom + 0.5 && save.bottom <= innerHeight + 0.5, pageWiderThanScreen: document.documentElement.scrollWidth > innerWidth + 1 }
  })
  console.log(`${w} x ${h}:`, JSON.stringify(m), '· the list’s date filter’s day:', filter)
  if (w === 320 || w === 1440) await p.screenshot({ path: join(OUT, w === 320 ? 'phone-320-window.png' : 'desktop-window.png') })
  await c.close()
}
await browser.close()
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors, no page errors, no 4xx')
