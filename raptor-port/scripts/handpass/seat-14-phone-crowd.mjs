/* The owner's question: what does a crowd opened on a sim row actually LOOK
   like on a phone, as things stand today? A full-page picture and a close one
   of just that row. */
import { open, board, tap, type, shot, STATE } from './lib.mjs'
const di = 5
const { browser, page, errors } = await open({ width: 375, height: 812, state: STATE })
await board(page, di)

/* a sim row with a real crowd on it, built by hand */
await tap(page, `[data-sblkadd="${di}"]`)
await page.waitForTimeout(700)
await type(page, `[data-bfld="sr:${di}.amt.4.str"]`, '09:00')
await type(page, `[data-bfld="sr:${di}.amt.4.end"]`, '11:00')
const pax = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-slot.empty[data-slot*="amt.4"]')]
  .filter(e => e.offsetParent !== null).map(e => e.getAttribute('data-slot')))
await tap(page, `[data-slot="${pax[0]}"]`)
await page.waitForTimeout(250)
await page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first().click()
await page.waitForTimeout(700)

/* into the mode, through the PHONE's own door */
const b = page.locator(`[data-oilmode="${di}"]`).first()
if (await b.count() && await b.isVisible()) { await b.click(); await page.waitForTimeout(900) }
else { await page.locator('#sbOil').click(); await page.waitForTimeout(900) }

const row = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('#schedBoard .pl-row, #schedBoard .sb-arow')]
    .filter(e => e.offsetParent !== null && e.querySelectorAll('[data-oilp]').length > 6)
  const hit = rows.sort((a, c) => c.querySelectorAll('[data-oilp]').length - a.querySelectorAll('[data-oilp]').length)[0]
  if (!hit) return null
  hit.scrollIntoView({ block: 'start' })
  const r = hit.getBoundingClientRect()
  return { n: hit.querySelectorAll('[data-oilp]').length, h: Math.round(r.height), w: Math.round(r.width),
    screen: window.innerHeight, pct: Math.round(r.height / window.innerHeight * 100) }
})
await page.waitForTimeout(400)
console.log('the sim row with the crowd open:', JSON.stringify(row))
await shot(page, 'PHONE-crowd-as-it-is-now')
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(300)
await shot(page, 'PHONE-crowd-page-top')
console.log('errors:', errors.slice(0, 5))
await browser.close()
