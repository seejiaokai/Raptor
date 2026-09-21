/* C2 part one, read properly — WHERE Gambit's puck is, and WHAT the OIL
   tracker says the credit is FOR, while his request is off the programme. */
import { open, board, shot, tap, go } from './lib.mjs'
import { dayHead, modeSnap, tapOilPerson, warCells, publishAL, showInputs, PUB_STATE } from './cd-lib.mjs'

const di = 5, SAT = '2026-07-18'
const MEET = 'imubcmotlcg0zk3', GAM = 'bruise'
const say = (...a) => console.log(...a)

/** one person's boxes in the OIL tracker, by opening his own ledger */
async function tracker(page, pid, cs) {
  await go(page, 'leavewar'); await page.waitForTimeout(800)
  await page.locator('[data-testid="oil-tracker"]').first().click(); await page.waitForTimeout(1100)
  const rows = await page.evaluate(c => {
    const s = document.querySelector('[data-testid="oil-sheet"]') || [...document.querySelectorAll('.sheet')].find(e => e.offsetParent)
    if (!s) return null
    const lines = (s.innerText || '').split('\n').map(x => x.trim()).filter(Boolean)
    const at = lines.findIndex(l => l === c || l.startsWith(c + ' '))
    return at < 0 ? { seen: false, all: lines.slice(0, 6) } : { seen: true, block: lines.slice(at, at + 10) }
  }, cs)
  await page.keyboard.press('Escape'); await page.waitForTimeout(400)
  return rows
}

const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, di)
await page.locator('#sbOil').click(); await page.waitForTimeout(800)
await tapOilPerson(page, 'Gambit')
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
await publishAL(page, di)
say('WAR Gambit with the meeting allowed:', JSON.stringify(await warCells(page, [[GAM, SAT]])))
say('TRACKER Gambit:', JSON.stringify(await tracker(page, GAM, 'Gambit')))
await board(page, di)

await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('MODE Gambit pucks WITH the meeting on the programme:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Gambit')))
await page.locator('#sbOil').click(); await page.waitForTimeout(600)

/* take the request off the programme */
await showInputs(page, di)
await tap(page, `[data-acck="${MEET}"]`); await page.waitForTimeout(1000)
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('MODE Gambit pucks with it OFF the programme:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Gambit')))
await shot(page, 'CD-C2-05-removed-mode-detail')
await page.locator('#sbOil').click(); await page.waitForTimeout(600)
const p = await publishAL(page, di)
say('PUBLISH:', p.label, '->', p.head && p.head.headRow)
say('WAR Gambit with it off:', JSON.stringify(await warCells(page, [[GAM, SAT]])))
say('TRACKER Gambit with it off:', JSON.stringify(await tracker(page, GAM, 'Gambit')))
await shot(page, 'CD-C2-06-tracker-removed')
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
