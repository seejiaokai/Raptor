/* C1 — the member edits his own request after the day went out.  F18 / C11.
   Subject: Talisman's Training 09:00-12:00 on the published Saturday. */
import { open, board, shot, tap } from './lib.mjs'
import { dayHead, bars, modeSnap, tapOilPerson, warCells, history, publishAL, pendingPanel, showInputs, PUB_STATE } from './cd-lib.mjs'

const di = 5, SAT = '2026-07-18'
const TRAIN = 'imubcmj77qa4e76'      // Talisman's Training request
const TAL = 'haowen'
const say = (...a) => console.log(...a)

const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, di)
say('HEAD at start:', (await dayHead(page, di)).headRow)
say('GROUND rows:', JSON.stringify(await page.evaluate(i => window.DAYS[i].ground.map(g => `${g.prog}|${g.str}-${g.end}|${g.who}`), di)))

/* 1 — deny Talisman on his Training, then issue it */
await page.locator('#sbOil').click(); await page.waitForTimeout(800)
say('MODE Talisman before:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Talisman').slice(0, 1)))
await tapOilPerson(page, 'Talisman')
say('MODE Talisman after tap:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Talisman').slice(0, 1)))
await shot(page, 'CD-C1-01-denied-in-mode')
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
say('HEAD after deny:', (await dayHead(page, di)).headRow)
say('BAR Talisman after deny:', JSON.stringify((await bars(page)).filter(b => b.who === 'Talisman').slice(0, 1)))
const p1 = await publishAL(page, di)
say('PUBLISH AL1:', JSON.stringify({ label: p1.label, published: p1.published, why: p1.why, head: p1.head && p1.head.headRow }))
await shot(page, 'CD-C1-02-al1-issued')
say('WAR after AL1:', JSON.stringify(await warCells(page, [[TAL, SAT]])))
await board(page, di)

/* 2 — the request is re-timed: 09:00-12:00 -> 08:00-16:00 */
await showInputs(page, di)
await tap(page, `[data-inpedit="${TRAIN}"]`); await page.waitForTimeout(900)
const pop = page.locator('#inpEditPop')
say('EDITOR:', (await pop.innerText()).replace(/\s+/g, ' ').slice(0, 240))
await shot(page, 'CD-C1-03-editor')
const times = pop.locator('input[type=time]')
await times.nth(0).fill('08:00'); await page.waitForTimeout(200)
await times.nth(1).fill('16:00'); await page.waitForTimeout(300)
await page.locator('#inpEditSave').click(); await page.waitForTimeout(1000)
const conf = page.locator('[data-testid="oilconf"]')
const asked = await conf.count() ? await conf.isVisible() : false
say('OIL question raised on the edit?', asked)
if (asked) {
  say('  it says:', (await conf.innerText()).replace(/\s+/g, ' ').slice(0, 260))
  await conf.locator('button').filter({ hasText: /^Yes/ }).first().click(); await page.waitForTimeout(300)
  await conf.getByRole('button', { name: 'Save', exact: true }).click(); await page.waitForTimeout(1000)
}
await page.waitForTimeout(600)
say('GROUND rows now:', JSON.stringify(await page.evaluate(i => window.DAYS[i].ground.map(g => `${g.prog}|${g.str}-${g.end}|${g.who}`), di)))
say('HEAD after the re-time:', (await dayHead(page, di)).headRow)
say('BAR Talisman after the re-time:', JSON.stringify((await bars(page)).filter(b => b.who === 'Talisman').slice(0, 2)))
await page.locator('#sbOil').click(); await page.waitForTimeout(800)
say('MODE Talisman after the re-time:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Talisman').slice(0, 2)))
await shot(page, 'CD-C1-04-after-member-edit')
await page.locator('#sbOil').click(); await page.waitForTimeout(600)
say('WAR after the re-time, before the next AL:', JSON.stringify(await warCells(page, [[TAL, SAT]])))
await board(page, di)
const pp = await pendingPanel(page)
say('PENDING CHIP:', pp.chip, '| PANEL:', pp.text.slice(0, 500))
await shot(page, 'CD-C1-05-pending-panel')

/* 3 — issue the next amendment and read the money */
const p2 = await publishAL(page, di)
say('PUBLISH next AL:', JSON.stringify({ label: p2.label, published: p2.published, why: p2.why, head: p2.head && p2.head.headRow }))
await shot(page, 'CD-C1-06-al2')
say('WAR after that AL:', JSON.stringify(await warCells(page, [[TAL, SAT]])))
await board(page, di)

/* 4 — the request changes hands */
await showInputs(page, di)
await tap(page, `[data-inpedit="${TRAIN}"]`); await page.waitForTimeout(900)
const who = page.locator('#inpEditPop select').nth(0)
const opts = await who.locator('option').evaluateAll(os => os.map(o => ({ v: o.value, t: (o.textContent || '').trim() })))
const newMan = opts.find(o => o.v && o.v !== TAL && /^(Rebel|Otter|Pixel|Widget|Zulu|Marlin|Jester)/i.test(o.t))
say('handing the request to:', JSON.stringify(newMan))
if (newMan) {
  await who.selectOption(newMan.v); await page.waitForTimeout(300)
  await page.locator('#inpEditSave').click(); await page.waitForTimeout(1000)
  const c2 = page.locator('[data-testid="oilconf"]')
  if (await c2.count() && await c2.isVisible()) {
    say('  OIL question on the handover:', (await c2.innerText()).replace(/\s+/g, ' ').slice(0, 200))
    await c2.locator('button').filter({ hasText: /^Yes/ }).first().click(); await page.waitForTimeout(300)
    await c2.getByRole('button', { name: 'Save', exact: true }).click(); await page.waitForTimeout(1000)
  }
}
await page.waitForTimeout(700)
say('GROUND rows after the handover:', JSON.stringify(await page.evaluate(i => window.DAYS[i].ground.map(g => `${g.prog}|${g.str}-${g.end}|${g.who}`), di)))
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
const ms = await modeSnap(page)
const nm = newMan ? newMan.t.split(/\s+/)[0] : ''
say('MODE Talisman after the handover:', JSON.stringify(ms.people.filter(p => p.who === 'Talisman').slice(0, 2)))
say('MODE ' + nm + ' after the handover:', JSON.stringify(ms.people.filter(p => p.who === nm).slice(0, 2)))
await shot(page, 'CD-C1-07-person-changed')
await page.locator('#sbOil').click(); await page.waitForTimeout(600)
say('HEAD after the handover:', (await dayHead(page, di)).headRow)
say('HISTORY:', (await history(page) || '').slice(0, 1400))
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
