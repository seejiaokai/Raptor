/* D3 — a saved plan brought out while another plan holds decisions. F24 / C14. */
import { open, board, shot, tap } from './lib.mjs'
import { modeSnap, tapOilPerson, warCells, publishAL, planMenu, history, PUB_STATE } from './cd-lib.mjs'

const di = 5, SAT = '2026-07-18'
const say = (...a) => console.log(...a)
const headTxt = p => p.evaluate(() => { const b = document.querySelector('#schedBoard .sb-pub'); return b ? (b.innerText || '').replace(/\s+/g, ' ').trim() : null })
const planBtn = p => p.evaluate(() => { const b = document.querySelector('#schedBoard [data-planmenu]'); return b ? (b.innerText || '').replace(/\s+/g, ' ').trim() : null })

const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, di)
const RID = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Ridge'))
say('head:', await headTxt(page), '| plan:', await planBtn(page))

/* make a second plan through the day's own "+ Alt Plan" */
await tap(page, `[data-planmenu="${di}"]`); await page.waitForTimeout(700)
await page.locator('[data-plandup]:visible').first().click(); await page.waitForTimeout(1300)
say('plan button after + Alt Plan:', await planBtn(page))
say('head:', await headTxt(page))
await shot(page, 'CD-D3-01-alt-plan-made')
const pm = await planMenu(page, di)
say('PLANS MENU now:', JSON.stringify(pm.text))
say('  items:', JSON.stringify(pm.items))
await page.keyboard.press('Escape'); await page.waitForTimeout(400)

/* on the plan that is live now, deny Ridge on COBRA */
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('MODE Ridge on this plan:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Ridge')))
await tapOilPerson(page, 'Ridge', 0)
say('MODE Ridge after the deny:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Ridge')))
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
say('head on this plan:', await headTxt(page))
await shot(page, 'CD-D3-02-ridge-denied-on-alt')

/* switch back to the other plan and read Ridge there */
const others = await page.evaluate(() => {
  const b = document.querySelector('#schedBoard [data-planmenu]'); if (b) b.click(); return null
})
await page.waitForTimeout(800)
const picks = await page.evaluate(() => [...document.querySelectorAll('[data-planpick],[data-planuse],[data-plansel],[data-plango],[data-plangolive]')].filter(e => e.offsetParent)
  .map(e => ({ d: Object.entries(e.dataset).map(([k, v]) => k + '=' + v).join(' '), t: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 60) })))
say('PLAN SWITCHES OFFERED:', JSON.stringify(picks, null, 1))
await shot(page, 'CD-D3-03-plan-menu-open')
const sw = await page.evaluate(() => {
  const b = [...document.querySelectorAll('[data-plansel]')].filter(e => e.offsetParent)[0]
  if (!b) return null
  const t = (b.innerText || '').replace(/\s+/g, ' ').trim(); b.click(); return t
})
say('switching with:', sw); await page.waitForTimeout(1400)
say('plan button now:', await planBtn(page), '| head:', await headTxt(page))
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('MODE Ridge on the ORIGINAL plan:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Ridge')))
await shot(page, 'CD-D3-04-ridge-on-live-plan')
await page.locator('#sbOil').click(); await page.waitForTimeout(600)

/* and back to the alt plan again */
await tap(page, `[data-planmenu="${di}"]`); await page.waitForTimeout(800)
const alt = await page.evaluate(() => {
  const b = [...document.querySelectorAll('[data-plansel]')].filter(e => e.offsetParent && !/live now/i.test(e.innerText || ''))
  if (b.length) { const t = (b[0].innerText || '').replace(/\s+/g, ' ').trim(); b[0].click(); return t }
  return null
})
await page.waitForTimeout(1300)
say('switched back with:', alt, '| plan:', await planBtn(page))
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('MODE Ridge back on the alt plan:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Ridge')))
await page.locator('#sbOil').click(); await page.waitForTimeout(600)
say('head:', await headTxt(page))
say('WAR Ridge (nothing published yet from the alt plan):', JSON.stringify(await warCells(page, [[RID, SAT]])))
await board(page, di)
const p = await publishAL(page, di)
say('PUBLISH from the plan that is live:', p.label, '->', await headTxt(page), '| why:', p.why)
say('WAR Ridge after that:', JSON.stringify(await warCells(page, [[RID, SAT]])))
await shot(page, 'CD-D3-05-war-after-plan-publish')
await board(page, di)
say('HISTORY:', JSON.stringify((await history(page) || {}).top))
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
