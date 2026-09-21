/* C3 part three — swap the man on a row that carries a denial. */
import { open, board, shot, tap } from './lib.mjs'
import { modeSnap, warCells, publishAL, PUB_STATE } from './cd-lib.mjs'

const di = 5, SAT = '2026-07-18'
const say = (...a) => console.log(...a)
const headTxt = p => p.evaluate(() => { const b = document.querySelector('#schedBoard .sb-pub'); return b ? (b.innerText || '').replace(/\s+/g, ' ').trim() : null })
const ground = p => p.evaluate(i => window.DAYS[i].ground.map((g, n) => `${n}:${g.prog}|${(window.PEOPLE[g.who] || {}).cs || g.who}`), di)
const ocu = async p => (await modeSnap(p)).people.filter(x => /OCU/i.test(x.where)).map(x => `${x.who}:${/off/.test(x.cls) ? 'OFF' : 'on'}`)
const ocuSlot = p => p.evaluate(() => {
  const row = [...document.querySelectorAll('#schedBoard .sb-grow, #schedBoard tr')].find(e => e.offsetParent && /OCU REVIEW/i.test(e.innerText || ''))
  const pk = row && row.querySelector('.puck[data-person]')
  return pk ? { slot: pk.dataset.slot || (pk.closest('[data-slot]') || {}).dataset?.slot, person: pk.dataset.person } : null
})

const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, di)
const SAB = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Saber'))

/* deny Saber on OCU REVIEW and issue it */
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
const keys = await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilp]')].map(e => ({ k: e.dataset.oilp, where: ((e.closest('tr,.sb-grow,.sb-arow') || {}).innerText || '').replace(/\s+/g, ' ').slice(0, 24) })).filter(x => x.k === 'stiff'))
await page.locator('#schedBoard [data-oilp="stiff"]:visible').nth(keys.findIndex(k => /OCU/i.test(k.where))).click()
await page.waitForTimeout(700)
say('OCU REVIEW after the deny:', JSON.stringify(await ocu(page)))
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
await publishAL(page, di)
say('WAR Saber after the deny is issued:', JSON.stringify(await warCells(page, [[SAB, SAT], ['dj', SAT]])))
await board(page, di)

/* swap: arm his own puck, then pick Ace from the crew palette */
const s = await ocuSlot(page)
say('his puck sits on slot:', JSON.stringify(s))
if (s && s.slot) {
  await tap(page, `[data-slot="${s.slot}"]`)
  say('armed:', JSON.stringify(await page.evaluate(() => window.ARM && window.ARM.key)))
  const pal = page.locator('#sbRoster .rpuck[data-person="dj"]').first()
  await pal.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await pal.click(); await page.waitForTimeout(900)
}
say('GROUND after the swap:', JSON.stringify(await ground(page)))
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('OCU REVIEW in the mode after the swap:', JSON.stringify(await ocu(page)))
await shot(page, 'CD-C3-11-swap-ace-on')
await page.locator('#sbOil').click(); await page.waitForTimeout(600)
const p = await publishAL(page, di)
say('PUBLISH:', p.label, '->', await headTxt(page))
say('WAR after the swap is issued:', JSON.stringify(await warCells(page, [[SAB, SAT], ['dj', SAT]])))
await board(page, di)

/* and swap Saber back in */
const s2 = await ocuSlot(page)
if (s2 && s2.slot) {
  await tap(page, `[data-slot="${s2.slot}"]`)
  const pal = page.locator(`#sbRoster .rpuck[data-person="${SAB}"]`).first()
  await pal.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await pal.click(); await page.waitForTimeout(900)
}
say('GROUND with Saber back:', JSON.stringify(await ground(page)))
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('OCU REVIEW when Saber returns:', JSON.stringify(await ocu(page)))
await shot(page, 'CD-C3-12-saber-returns')
await page.locator('#sbOil').click(); await page.waitForTimeout(600)
const p2 = await publishAL(page, di)
say('PUBLISH:', p2.label, '->', await headTxt(page))
say('WAR at the end:', JSON.stringify(await warCells(page, [[SAB, SAT], ['dj', SAT]])))
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
