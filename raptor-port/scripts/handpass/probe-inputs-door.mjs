/* The board's "+ INPUTS" door, end to end — including the OIL question that
   comes up ON TOP of the form when the type is one that can earn. */
import { open, board, tap, shot, SHOTS } from './lib.mjs'

const di = 5
const { browser, page, errors } = await open({})
await board(page, di)

const out = { steps: [] }
const S = (s, v) => { out.steps.push(s + ' :: ' + JSON.stringify(v)); return v }

await tap(page, `[data-inpadd="${di}.g"]`)
await page.waitForTimeout(700)
const pop = page.locator('#inpEditPop')
S('dialog open', await pop.isVisible())
out.before = await page.evaluate(() => Object.keys(window.INPUTS).length)

await pop.locator('select').nth(0).selectOption('haowen')
await pop.locator('select').nth(1).selectOption('Training')
const cb = pop.locator('input[type=checkbox]').first()
if (await cb.isChecked()) await cb.click()
await pop.locator('input[type=time]').nth(0).fill('09:00')
await pop.locator('input[type=time]').nth(1).fill('12:00')
await page.waitForTimeout(250)
await shot(page, 'req-01-form')

await page.locator('#inpEditSave').click()
await page.waitForTimeout(900)

const oil = page.locator('[data-testid="oilconf"]')
S('OIL question shown', await oil.count() > 0 && await oil.isVisible())
if (await oil.count()) {
  out.oilText = (await oil.innerText()).replace(/\n+/g, ' | ')
  out.oilButtons = await oil.locator('button').evaluateAll(bs => bs.map(b => (b.innerText || '').trim()))
  await shot(page, 'req-02-oil-question')
}

console.log(JSON.stringify(out, null, 1))
console.log('errors:', errors.slice(0, 6))
console.log('shots in ' + SHOTS)
await browser.close()
