/* C4 part three — open the Leave War's own sheets with a real mouse press. */
import { open, board, shot, go } from './lib.mjs'
import { warCells, PUB_STATE } from './cd-lib.mjs'

const SAT = '2026-07-18'
const say = (...a) => console.log(...a)
const sheets = p => p.evaluate(() => [...document.querySelectorAll('.sheet,[role=dialog],[class*=sheet]')].filter(e => e.offsetParent)
  .map(e => ({ cls: e.className.slice(0, 30), text: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 2500), buttons: [...e.querySelectorAll('button')].filter(b => b.offsetParent).map(b => (b.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 28)) })))
async function press(page, sel) {
  const el = page.locator(sel).first()
  if (!(await el.count())) return 'no ' + sel
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(250)
  const b = await el.boundingBox()
  if (!b) return 'no box'
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
  await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up()
  await page.waitForTimeout(1100)
  return 'pressed ' + sel
}

const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, 5)
const PIS = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Piston'))
await go(page, 'leavewar'); await page.waitForTimeout(1000)
say(await press(page, `[data-testid="cell-${PIS}-${SAT}"]`))
say('CELL SHEET:', JSON.stringify((await sheets(page)).map(x=>x.text)).slice(0, 2500))
await shot(page, 'CD-C4-09-cell-sheet')
await page.keyboard.press('Escape'); await page.waitForTimeout(500)
say(await press(page, `[data-testid="person-${PIS}"]`))
say('PERSON SHEET:', JSON.stringify(await sheets(page), null, 1).slice(0, 1800))
await shot(page, 'CD-C4-10-person-sheet')
say('errors:', JSON.stringify(errors.slice(0, 5)))
await browser.close()
