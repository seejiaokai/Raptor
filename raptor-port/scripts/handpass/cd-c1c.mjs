/* C1 part three — the MONEY when a request changes hands under a denial.
   The new man must have a row on the Leave War so the credit can be read. */
import { open, board, shot, tap } from './lib.mjs'
import { dayHead, modeSnap, tapOilPerson, warCells, publishAL, showInputs, history, PUB_STATE } from './cd-lib.mjs'

const di = 5, SAT = '2026-07-18'
const TRAIN = 'imubcmj77qa4e76', TAL = 'haowen'
const say = (...a) => console.log(...a)
const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, di)

/* pick a man who has a row on the war and is otherwise free today */
const NEW = await page.evaluate(() => {
  const busy = new Set()
  const d = window.DAYS[5]
  d.waves.forEach(w => w.formations.forEach(f => f.aircraft.forEach(a => { busy.add(a.p); busy.add(a.w) })))
  d.dutywaves.forEach(b => b.rows.forEach(r => busy.add(r.id)))
  d.ground.forEach(g => busy.add(g.who)); d.allhands.forEach(a => [].concat(a.who).forEach(x => busy.add(x)))
  d.sims.oft.forEach(s => { busy.add(s.p); busy.add(s.w) }); d.sims.amt.forEach(s => (s.pax || []).forEach(x => busy.add(x)))
  const free = Object.keys(window.PEOPLE).filter(id => !busy.has(id))
  return free.slice(0, 6).map(id => ({ id, cs: window.PEOPLE[id].cs }))
})
say('free men today:', JSON.stringify(NEW))

/* who does the war draw a row for? */
const { go } = await import('./lib.mjs')
await go(page, 'leavewar'); await page.waitForTimeout(900)
const onWar = await page.evaluate(ids => ids.filter(i => document.querySelector(`[data-testid="row-${i}"]`)), NEW.map(n => n.id))
say('of those, on the war:', JSON.stringify(onWar))
const pick = NEW.find(n => onWar.includes(n.id))
say('CHOSEN new holder:', JSON.stringify(pick))
say('his Saturday BEFORE anything:', JSON.stringify(await warCells(page, [[pick.id, SAT], [TAL, SAT]])))
await board(page, di)

/* deny Talisman on his Training and issue it */
await page.locator('#sbOil').click(); await page.waitForTimeout(800)
await tapOilPerson(page, 'Talisman')
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
say('AL1:', (await publishAL(page, di)).head.headRow)
await board(page, di)
say('WAR after the denial is issued:', JSON.stringify(await warCells(page, [[TAL, SAT], [pick.id, SAT]])))
await board(page, di)

/* hand the request to him */
await showInputs(page, di)
await tap(page, `[data-inpedit="${TRAIN}"]`); await page.waitForTimeout(900)
await page.locator('#inpEditPop select').nth(0).selectOption(pick.id)
await page.waitForTimeout(300)
await page.locator('#inpEditSave').click(); await page.waitForTimeout(1000)
const c = page.locator('[data-testid="oilconf"]')
if (await c.count() && await c.isVisible()) {
  await c.locator('button').filter({ hasText: /^Yes/ }).first().click(); await page.waitForTimeout(300)
  await c.getByRole('button', { name: 'Save', exact: true }).click(); await page.waitForTimeout(1000)
}
await page.waitForTimeout(700)
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
const m = await modeSnap(page)
say('MODE ' + pick.cs + ' the moment the request is his:', JSON.stringify(m.people.filter(p => p.who === pick.cs)))
await shot(page, 'CD-C1-12-new-holder-in-mode')
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
say('HEAD:', (await dayHead(page, di)).headRow)
const p2 = await publishAL(page, di)
say('PUBLISH:', p2.label, '->', p2.head && p2.head.headRow)
say('WAR after it is issued:', JSON.stringify(await warCells(page, [[pick.id, SAT], [TAL, SAT]])))
await shot(page, 'CD-C1-13-war-new-holder')
await board(page, di)
say('HISTORY:', JSON.stringify(await history(page)))
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
