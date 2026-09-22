/* C4 part two — post a man out after the day went out, and hide the SANS men.
   The credit must not move; only the row may hide.  F21 / C18. */
import { open, board, shot, go } from './lib.mjs'
import { warCells, PUB_STATE } from './cd-lib.mjs'

const SAT = '2026-07-18'
const say = (...a) => console.log(...a)
const sheets = p => p.evaluate(() => [...document.querySelectorAll('.sheet,[role=dialog]')].filter(e => e.offsetParent)
  .map(e => ({ text: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 700), buttons: [...e.querySelectorAll('button')].filter(b => b.offsetParent).map(b => (b.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 26)) })))

const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, 5)
const PIS = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Piston'))
say('WAR Piston with the day out:', JSON.stringify(await warCells(page, [[PIS, SAT]])))

/* the day cell's own sheet — where post-out lives */
await go(page, 'leavewar'); await page.waitForTimeout(900)
await page.locator(`[data-testid="cell-${PIS}-${SAT}"]`).first().click()
await page.waitForTimeout(1000)
say('THE CELL SHEET:', JSON.stringify(await sheets(page), null, 1).slice(0, 1600))
await shot(page, 'CD-C4-05-cell-sheet')
await page.keyboard.press('Escape'); await page.waitForTimeout(500)

/* the person sheet — tap his name in the frozen column */
await page.locator(`[data-testid="person-${PIS}"]`).first().click()
await page.waitForTimeout(1100)
say('THE PERSON SHEET:', JSON.stringify(await sheets(page), null, 1).slice(0, 1600))
await shot(page, 'CD-C4-06-person-sheet')
const po = page.locator('button').filter({ hasText: /post(ed)? out|leaving|posting/i }).first()
if (await po.count() && await po.isVisible()) {
  say('pressing:', (await po.innerText()).replace(/\s+/g, ' ').trim())
  await po.click(); await page.waitForTimeout(1000)
  say('then it shows:', JSON.stringify(await sheets(page), null, 1).slice(0, 1400))
  await shot(page, 'CD-C4-07-post-out')
}
await page.keyboard.press('Escape'); await page.waitForTimeout(500)

/* Show SANS — the ⚙ settings on the war */
const gear = page.locator('button').filter({ hasText: /^⚙/ }).first()
if (await gear.count()) {
  await gear.click(); await page.waitForTimeout(900)
  const s = await sheets(page)
  say('⚙ SETTINGS:', JSON.stringify(s).slice(0, 900))
  const sans = page.locator('button,label').filter({ hasText: /SANS/i }).first()
  if (await sans.count()) { say('the SANS control reads:', (await sans.innerText()).replace(/\s+/g, ' ').trim()) }
  await shot(page, 'CD-C4-08-settings')
  await page.keyboard.press('Escape'); await page.waitForTimeout(500)
}
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
