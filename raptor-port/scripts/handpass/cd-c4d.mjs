/* C4 final — post a man out after the day went out; and the man who is
   already posted out but stands on the published Saturday.  F21 / C18. */
import { open, board, shot, go } from './lib.mjs'
import { warCells, bars, PUB_STATE } from './cd-lib.mjs'

const SAT = '2026-07-18'
const say = (...a) => console.log(...a)
const sheetTexts = p => p.evaluate(() => [...document.querySelectorAll('[class*=sheet]')].filter(e => e.offsetParent)
  .map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 900)))
async function press(page, sel) {
  const el = page.locator(sel).first()
  if (!(await el.count())) return 'no ' + sel
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(250)
  const b = await el.boundingBox(); if (!b) return 'no box'
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
  await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up()
  await page.waitForTimeout(1100)
  return 'pressed'
}

const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, 5)
const PIS = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Piston'))
const TOR = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Torch'))
say('on the board, Torch (already posted out) wears:', JSON.stringify((await bars(page)).filter(b => b.who === 'Torch').slice(0, 2)))
say('WAR before anything (Piston, Torch):', JSON.stringify(await warCells(page, [[PIS, SAT], [TOR, SAT]])))

/* post Piston out */
await go(page, 'leavewar'); await page.waitForTimeout(1000)
await press(page, `[data-testid="cell-${PIS}-${SAT}"]`)
const po = page.locator('button').filter({ hasText: /^PO$/ }).first()
say('the PO button is offered:', await po.count() > 0)
if (await po.count()) {
  await po.click(); await page.waitForTimeout(1100)
  say('after PO the sheet says:', JSON.stringify(await sheetTexts(page)).slice(0, 1200))
  await shot(page, 'CD-C4-11-post-out-sheet')
  const go2 = page.locator('button').filter({ hasText: /^(Post out|Confirm|Save|Yes|Apply)/i }).first()
  if (await go2.count() && await go2.isVisible()) { say('pressing:', (await go2.innerText()).trim()); await go2.click(); await page.waitForTimeout(1200) }
}
await page.keyboard.press('Escape'); await page.waitForTimeout(600)
say('WAR after posting Piston out:', JSON.stringify(await warCells(page, [[PIS, SAT], [TOR, SAT]])))
await shot(page, 'CD-C4-12-war-after-post-out')

/* his ledger — is the credit deleted or just hidden? */
await page.locator('[data-testid="oil-tracker"]').first().click(); await page.waitForTimeout(1100)
const tr = await page.evaluate(c => {
  const s = document.querySelector('[data-testid="oil-sheet"]') || [...document.querySelectorAll('.sheet')].find(e => e.offsetParent)
  if (!s) return null
  const lines = (s.innerText || '').split('\n').map(x => x.trim()).filter(Boolean)
  const at = lines.findIndex(l => l === c)
  return at < 0 ? { seen: false } : { seen: true, block: lines.slice(at, at + 8) }
}, 'Piston')
say('OIL tracker for Piston after the post-out:', JSON.stringify(tr))
await shot(page, 'CD-C4-13-tracker-after-post-out')
await page.keyboard.press('Escape'); await page.waitForTimeout(600)

/* put him back */
await press(page, `[data-testid="cell-${PIS}-${SAT}"]`)
const pi = page.locator('button').filter({ hasText: /^PI$|Undo|Cancel posting/i }).first()
if (await pi.count() && await pi.isVisible()) {
  say('pressing to undo the post-out:', (await pi.innerText()).trim())
  await pi.click(); await page.waitForTimeout(1200)
  const g2 = page.locator('button').filter({ hasText: /^(Post in|Confirm|Save|Yes|Apply|Undo)/i }).first()
  if (await g2.count() && await g2.isVisible()) { await g2.click(); await page.waitForTimeout(1200) }
}
await page.keyboard.press('Escape'); await page.waitForTimeout(600)
say('WAR after bringing him back:', JSON.stringify(await warCells(page, [[PIS, SAT]])))
await shot(page, 'CD-C4-14-war-after-return')
say('errors:', JSON.stringify(errors.slice(0, 5)))
await browser.close()
