/* C1 part two — the request changes hands while a denial sits on it.
   Does the new man inherit a decision nobody made about him, and does it cost
   him real money?  Also: what the day's history says about each gesture. */
import { open, board, shot, tap } from './lib.mjs'
import { dayHead, modeSnap, tapOilPerson, warCells, publishAL, showInputs, PUB_STATE } from './cd-lib.mjs'

const di = 5, SAT = '2026-07-18'
const TRAIN = 'imubcmj77qa4e76', TAL = 'haowen'
const say = (...a) => console.log(...a)
const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, di)

/* deny Talisman, issue it */
await page.locator('#sbOil').click(); await page.waitForTimeout(800)
await tapOilPerson(page, 'Talisman')
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
say('AL1:', JSON.stringify((await publishAL(page, di)).head.headRow))
await board(page, di)

/* hand the request to Jester */
await showInputs(page, di)
await tap(page, `[data-inpedit="${TRAIN}"]`); await page.waitForTimeout(900)
await page.locator('#inpEditPop select').nth(0).selectOption('ipman')
await page.waitForTimeout(300)
await page.locator('#inpEditSave').click(); await page.waitForTimeout(1000)
const c = page.locator('[data-testid="oilconf"]')
if (await c.count() && await c.isVisible()) {
  say('OIL question on the handover:', (await c.innerText()).replace(/\s+/g, ' ').slice(0, 200))
  await c.locator('button').filter({ hasText: /^Yes/ }).first().click(); await page.waitForTimeout(300)
  await c.getByRole('button', { name: 'Save', exact: true }).click(); await page.waitForTimeout(1000)
}
await page.waitForTimeout(700)
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('MODE Jester straight after the handover:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Jester').slice(0, 1)))
await shot(page, 'CD-C1-08-jester-inherits-the-deny')
await page.locator('#sbOil').click(); await page.waitForTimeout(600)

/* the money: issue it and read Jester's Leave War cell */
const p = await publishAL(page, di)
say('PUBLISH:', p.label, '->', p.head && p.head.headRow)
say('WAR Jester + Talisman:', JSON.stringify(await warCells(page, [['ipman', SAT], [TAL, SAT]])))
await shot(page, 'CD-C1-09-war-after-handover')
await board(page, di)

/* now put Jester back on by hand, then hand the request BACK to Talisman */
await page.locator('#sbOil').click(); await page.waitForTimeout(800)
await tapOilPerson(page, 'Jester')
say('MODE Jester after the admin puts him back on:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Jester').slice(0, 1)))
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
await showInputs(page, di)
await tap(page, `[data-inpedit="${TRAIN}"]`); await page.waitForTimeout(900)
await page.locator('#inpEditPop select').nth(0).selectOption(TAL)
await page.waitForTimeout(300)
await page.locator('#inpEditSave').click(); await page.waitForTimeout(1000)
const c2 = page.locator('[data-testid="oilconf"]')
if (await c2.count() && await c2.isVisible()) {
  await c2.locator('button').filter({ hasText: /^Yes/ }).first().click(); await page.waitForTimeout(300)
  await c2.getByRole('button', { name: 'Save', exact: true }).click(); await page.waitForTimeout(1000)
}
await page.waitForTimeout(700)
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('MODE Talisman when the request comes back to him:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Talisman').slice(0, 2)))
await shot(page, 'CD-C1-10-back-to-talisman')
await page.locator('#sbOil').click(); await page.waitForTimeout(600)
say('HEAD:', (await dayHead(page, di)).headRow)

/* the history, read the way a scheduler reads it */
await page.locator('#sbHist').click(); await page.waitForTimeout(1000)
const hist = await page.evaluate(() => {
  const vis = e => !!(e.offsetParent || e.getClientRects().length)
  const panes = [...document.querySelectorAll('div,section,ul,aside')].filter(vis)
    .filter(e => (e.innerText || '').length > 40 && (e.innerText || '').length < 4000 && /histor|change|undo|OIL/i.test(e.innerText || ''))
    .sort((a, b) => (a.innerText || '').length - (b.innerText || '').length)
  return panes.slice(0, 2).map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 1500))
})
say('HISTORY PANE:', JSON.stringify(hist, null, 1))
await shot(page, 'CD-C1-11-history')
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
