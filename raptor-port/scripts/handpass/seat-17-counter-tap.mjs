/* What does tapping the counter ACTUALLY show today? The owner asked whether
   there is a design for it. The code says the shape "is not yet ruled". */
import { open, board, tap, shot, STATE } from './lib.mjs'
const di = 5
const { browser, page, errors } = await open({ width: 375, height: 812, state: STATE })
await board(page, di)
await tap(page, `[data-fill="d:${di}.2.1.+"]`)
await page.waitForTimeout(250)
await page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first().click()
await page.waitForTimeout(700)
const chip = page.locator('#schedBoard .oilcount:visible').last()
await chip.evaluate(e => e.scrollIntoView({ block: 'center' }))
await chip.click()
await page.waitForTimeout(700)
const t = await page.evaluate(() => {
  const e = document.getElementById('toastEl')
  if (!e) return 'nothing'
  const r = e.getBoundingClientRect()
  return { what: e.tagName + '#' + e.id, w: Math.round(r.width), h: Math.round(r.height),
    offRight: Math.round(r.right - window.innerWidth), offLeft: Math.round(-r.left),
    chars: (e.textContent || '').length, text: (e.textContent || '').slice(0, 120) }
})
console.log('tapping the counter shows:', JSON.stringify(t, null, 1))
await shot(page, 'COUNTER-tap-as-it-is-now-phone')
await browser.close()
