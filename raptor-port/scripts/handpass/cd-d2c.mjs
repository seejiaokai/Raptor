/* D2 part three — load an issued version back onto the working copy and see
   what comes with it.  F23 / C14. */
import { open, board, shot, tap } from './lib.mjs'
import { dayHead, bars, modeSnap, tapOilPerson, warCells, publishAL, history, PUB_STATE } from './cd-lib.mjs'

const di = 5, SAT = '2026-07-18'
const say = (...a) => console.log(...a)
const planBtn = p => p.evaluate(() => { const b = document.querySelector('#schedBoard [data-planmenu]'); return b ? (b.innerText || '').replace(/\s+/g, ' ').trim() : null })
const headTxt = p => p.evaluate(() => { const b = document.querySelector('#schedBoard .sb-pub'); return b ? (b.innerText || '').replace(/\s+/g, ' ').trim() : null })

const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, di)
const SAB = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Saber'))

/* ORIG out; deny Saber on MASS BRIEF; issue AL1 (Saber FO -> HO) */
await page.locator('#sbOil').click(); await page.waitForTimeout(800)
await tapOilPerson(page, 'Saber', 0)
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
await publishAL(page, di)
say('after AL1, head:', await headTxt(page))
say('WAR Saber after AL1:', JSON.stringify(await warCells(page, [[SAB, SAT]])))
await board(page, di)

/* preview the ORIGINAL, then load it back */
await tap(page, `[data-planmenu="${di}"]`); await page.waitForTimeout(700)
await page.locator('[data-planpv="2026-07-18#0"]:visible').first().click(); await page.waitForTimeout(1300)
say('plan button in the preview:', await planBtn(page))
say('Saber bars in the ORIGINAL preview:', JSON.stringify((await bars(page)).filter(b => b.who === 'Saber')))
await shot(page, 'CD-D2-08-preview-original')

const restore = page.locator('#schedBoard [data-restore]:visible').first()
say('the button reads:', (await restore.innerText()).replace(/\s+/g, ' ').trim(), '| title:', await restore.getAttribute('title'))
await restore.click(); await page.waitForTimeout(1100)
const cf = await page.evaluate(() => [...document.querySelectorAll('.sheet,.pop,[role=dialog],.modal,.confirm,[class*=conf]')].filter(e => e.offsetParent)
  .map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 500)))
say('THE CONFIRM SAYS:', JSON.stringify(cf))
await shot(page, 'CD-D2-09-load-confirm')
const yes = page.locator('button').filter({ hasText: /^(Load|Yes|Confirm|Replace|Discard|Restore)/i }).first()
if (await yes.count() && await yes.isVisible()) { say('pressing:', (await yes.innerText()).trim()); await yes.click(); await page.waitForTimeout(1300) }
say('plan button after the load:', await planBtn(page))
say('head after the load:', await headTxt(page))
await shot(page, 'CD-D2-10-after-load')

await board(page, di)
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('MODE Saber after the load:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Saber')))
await page.locator('#sbOil').click(); await page.waitForTimeout(600)
say('BARS Saber after the load:', JSON.stringify((await bars(page)).filter(b => b.who === 'Saber').slice(0, 2)))
say('head:', await headTxt(page))

/* is the recovered copy LIVE or frozen?  the family-day count must still move */
const fam = await page.evaluate(() => {
  const r = [...document.querySelectorAll('#schedBoard .sb-arow')].find(e => /FAMILY DAY/.test(e.innerText || ''))
  return r ? (r.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 120) : null
})
say('FAMILY DAY row after the load:', fam)

const p2 = await publishAL(page, di)
say('PUBLISH:', p2.label, '->', await headTxt(page), '| why:', p2.why)
say('WAR Saber at the end:', JSON.stringify(await warCells(page, [[SAB, SAT]])))
await shot(page, 'CD-D2-11-war-after-load')
await board(page, di)
say('HISTORY:', JSON.stringify(await history(page)))
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
