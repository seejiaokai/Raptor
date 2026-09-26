/* W1 probe (26 Sep 26): the calendar's month swipe and the chip tap on a FULL phone emulation (isMobile + hasTouch —
   the device's viewport, touch and gesture handling), to confirm the two finger findings are not an artefact of
   touch emulation on a desktop page. Finger by CDP touch, as w1-05. */
process.env.AB_WHO = 'w1'
const L = await import('./w1-lib.mjs')
const { chromium } = await import('@playwright/test')
const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push(e.message))
await page.goto('http://localhost:4175/')
await L.login(page, 'a')
const cdp = await ctx.newCDPSession(page)
await L.calOpen(page, '2026-07')
await page.evaluate(() => { window.__ev = []; for (const t of ['pointerdown', 'pointerup', 'pointercancel', 'click']) window.addEventListener(t, e => window.__ev.push(t + '@' + (e.target.id || String(e.target.className).split(' ')[0])), true) })
const p = await L.emptyAt(page, '2026-07-08')
for (const [label, hold, steps, ms] of [['quick', 0, 8, 16], ['slow', 120, 14, 30]]) {
  await L.finger(page, cdp, p, { x: Math.max(8, p.x - 150), y: p.y + 4 }, { holdMs: hold, steps, stepMs: ms })
  console.log(`SWIPE ${label}: month ${await L.calMonth(page)} · ${(await page.evaluate(() => { const a = window.__ev; window.__ev = []; return a })).join(' ')}`)
  if ((await L.calMonth(page)) !== 'July 2026') await L.calOpen(page, '2026-07')
}
/* the Monday chip of 20 Jul (Vapor) — outside the dialog's box */
const iid = await page.evaluate(() => document.querySelector('#inpCal [data-icday="2026-07-20"] [data-iid]').getAttribute('data-iid'))
const c = await L.chipAt(page, iid, '2026-07-20')
await L.finger(page, cdp, c, null, { holdMs: 60 })
console.log('TAP chip: dialog', JSON.stringify(await L.addDialog(page)), '·', (await page.evaluate(() => window.__ev)).join(' '))
await L.shot(page, 'w1-11-mobile-ctx-after-tap')
console.log('errors', errors)
await browser.close()
