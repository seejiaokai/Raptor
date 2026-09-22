/* [OIL-SEATS-CAN-EARN] walk — the LEAVE WAR side, step 7: the clash, opened.
   The cell reads "LL !" — the amber mark that says there is more on this day
   than the code shown. A scheduler's next move is to TAP it, so this taps it
   with a real mouse (the grid arms on pointer-down; a scripted .click() never
   reaches it) and reads what comes up: both records, or only one.
   Also asks whether the OIL credit is reachable at all once leave outranks it. */
import { open, go, shot } from './lib.mjs'

const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-22-oil-seats'
const WHO = 'shaft'   // Anvil IP — leave filed on the published Saturday he was paid for
const { browser, page, errors } = await open({ state: OUT + '/state-lw-leave.json' })
await go(page, 'leavewar')
await page.waitForTimeout(2200)

/* THE CLASH STRIP itself — the amber band across the top of the war, which is
   what a scheduler actually sees first. Read as words, so a later session can
   assert on it instead of squinting at the picture. */
const strip = await page.evaluate(() => [...document.querySelectorAll('#page-leavewar *')]
  .filter(e => e.children.length <= 3 && /clash/i.test(e.textContent || '') && e.getBoundingClientRect().height > 0)
  .map(e => (e.textContent || '').replace(/\s+/g, ' ').trim()).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3))
console.log('THE CLASH STRIP reads:', JSON.stringify(strip, null, 1))

const cell = page.locator(`[data-testid="cell-${WHO}-2026-07-18"]`).first()
await cell.scrollIntoViewIfNeeded()
await page.waitForTimeout(400)
console.log('the cell reads:', JSON.stringify(await cell.innerText()), '| class', await cell.getAttribute('class'),
  '| title', JSON.stringify(await cell.getAttribute('title')))
await shot(page, 'LW-21-clash-cell')
await cell.click()
await page.waitForTimeout(1200)
/* A sheet is position:fixed, so `offsetParent` is null on it and an
   offsetParent filter reports "nothing opened" for a sheet that is plainly
   on screen. Measure the box instead. */
const onScreen = () => page.evaluate(() => [...document.querySelectorAll('.bidsheet, [role=dialog]')]
  .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 })
  .map(e => ({ id: e.getAttribute('data-testid') || e.id || e.className.slice(0, 30),
    t: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 700) })))
const up = await onScreen()
console.log('\nTAPPING IT OPENS:', JSON.stringify(up, null, 1).slice(0, 1800))
await shot(page, 'LW-22-clash-tapped')

/* a CONTROL: a man in the same crowd with no leave — one record, so the tap
   should behave differently. */
await page.keyboard.press('Escape'); await page.waitForTimeout(600)
const ctl = page.locator(`[data-testid="cell-nact-2026-07-18"]`).first()   // Warden IP
await ctl.scrollIntoViewIfNeeded(); await page.waitForTimeout(300)
console.log('\ncontrol (Warden, credited, no leave) reads:', JSON.stringify(await ctl.innerText()))
await ctl.click(); await page.waitForTimeout(1200)
const up2 = await onScreen()
console.log('tapping the control opens:', JSON.stringify(up2, null, 1).slice(0, 1200))
await shot(page, 'LW-23-control-tapped')
console.log('\nerrors:', errors.slice(0, 8))
await browser.close()
