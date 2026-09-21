/* B5 — undo across a publish. The ruling: undoing a publish is silent until the
   shared database registers it, and then it is just a line in the history; an
   issued version id is never erased or reused. */
import { open, board, publish, oilMode, shot, tap, readDay, lwCell, STATE } from './lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
const R = {}
const state = () => page.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  const e = b.querySelector('.dbeak')
  return { beak: e ? e.innerText.replace(/\s+/g, ' ').trim() : 'none', ver: (b.querySelector('.verchip') || {}).innerText || '' }
})
const barsOf = async (n) => (await readDay(page, di)).pucks.filter(p => n.includes(p.who)).map(p => `${p.who}:${p.bar || '-'}`)
const history = () => page.evaluate(async () => {
  const b = document.querySelector('#schedBoard')
  const h = [...b.querySelectorAll('button')].find(x => /History/.test(x.innerText || ''))
  if (h) h.click()
  await new Promise(r => setTimeout(r, 700))
  const panel = document.querySelector('#sbHist') || document.querySelector('[class*=hist]')
  const lines = panel ? (panel.innerText || '').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 14) : ['NO HISTORY PANEL']
  if (h) h.click()
  return lines
})

/* ORIG, then an OIL denial, then AL1 */
R.s0 = await state()
R.pub0 = await publish(page, di); await page.waitForTimeout(700)
R.s1 = await state()
R.money1 = await lwCell(page, ['plasma'], '2026-07-18'); await board(page, di)

await oilMode(page, true)
await page.locator('#schedBoard [data-oilp]:visible').filter({ hasText: 'Fable' }).first().click()
await page.waitForTimeout(700)
await oilMode(page, false); await page.waitForTimeout(500)
R.s2 = await state()
R.pub1 = await publish(page, di); await page.waitForTimeout(900)
R.s3 = await state()
R.bars3 = await barsOf(['Fable'])
R.money3 = await lwCell(page, ['plasma'], '2026-07-18'); await board(page, di)
await shot(page, 'B5-after-AL1')

/* now UNDO the publish, through the board's own Undo */
await tap(page, 'button:has-text("Undo")')
await page.waitForTimeout(1200)
R.s4 = await state()
R.bars4 = await barsOf(['Fable'])
R.history4 = await history()
R.money4 = await lwCell(page, ['plasma'], '2026-07-18'); await board(page, di)
await shot(page, 'B5-after-undo-of-publish')

/* and REDO it */
await tap(page, 'button:has-text("Redo")')
await page.waitForTimeout(1200)
R.s5 = await state()
R.bars5 = await barsOf(['Fable'])
R.money5 = await lwCell(page, ['plasma'], '2026-07-18')
R.errors = errors.slice(0, 8)
console.log(JSON.stringify(R, null, 1))
await browser.close()
