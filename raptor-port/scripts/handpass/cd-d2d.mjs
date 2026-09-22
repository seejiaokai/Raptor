/* D2 final — load an issued version onto the working copy WHILE the working
   copy holds an unpublished decision, then undo and redo.  F23 / C14. */
import { open, board, shot, tap } from './lib.mjs'
import { modeSnap, tapOilPerson, warCells, publishAL, history, PUB_STATE } from './cd-lib.mjs'

const di = 5, SAT = '2026-07-18'
const say = (...a) => console.log(...a)
const headTxt = p => p.evaluate(() => { const b = document.querySelector('#schedBoard .sb-pub'); return b ? (b.innerText || '').replace(/\s+/g, ' ').trim() : null })
const brief = async p => (await modeSnap(p)).people.filter(x => /MASS BRIEF/i.test(x.where)).map(x => `${x.who}:${/off/.test(x.cls) ? 'OFF' : 'on'}`)

const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, di)
const SAB = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Saber'))
const TOR = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Torch'))

/* AL1: Saber off MASS BRIEF */
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
await tapOilPerson(page, 'Saber', 0)
say('MASS BRIEF after the deny:', JSON.stringify(await brief(page)))
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
await publishAL(page, di)
say('after AL1:', await headTxt(page), '| WAR:', JSON.stringify(await warCells(page, [[SAB, SAT], [TOR, SAT]])))
await board(page, di)

/* an UNPUBLISHED decision on top: Torch off the same row */
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
await tapOilPerson(page, 'Torch', 0)
say('MASS BRIEF with an unpublished deny on top:', JSON.stringify(await brief(page)))
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
say('head with an unpublished decision:', await headTxt(page))
await shot(page, 'CD-D2-12-unpublished-divergence')

/* preview the ORIGINAL and load it back */
await tap(page, `[data-planmenu="${di}"]`); await page.waitForTimeout(700)
await page.locator('[data-planpv="2026-07-18#0"]:visible').first().click(); await page.waitForTimeout(1300)
const restore = page.locator('#schedBoard [data-restore]:visible').first()
say('the button:', (await restore.innerText()).replace(/\s+/g, ' ').trim())
await restore.click(); await page.waitForTimeout(1300)
const asked = await page.evaluate(() => [...document.querySelectorAll('[class*=sheet],[role=dialog],.pop,.modal')].filter(e => e.offsetParent).map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 400)))
say('DID IT WARN ABOUT DISCARDING ANYTHING?', asked.length ? JSON.stringify(asked) : 'no — it just did it')
await shot(page, 'CD-D2-13-load-with-divergence')
const yes = page.locator('button').filter({ hasText: /^(Load|Yes|Confirm|Replace|Restore)/i }).first()
if (await yes.count() && await yes.isVisible() && !(await yes.isDisabled())) { say('pressing', (await yes.innerText()).trim()); await yes.click(); await page.waitForTimeout(1300) }
await board(page, di)
say('head after the load:', await headTxt(page))
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('MASS BRIEF after the load:', JSON.stringify(await brief(page)))
await shot(page, 'CD-D2-14-after-load')
await page.locator('#sbOil').click(); await page.waitForTimeout(600)

/* undo the load */
await page.locator('#sbUndo').click(); await page.waitForTimeout(1300)
say('head after Undo:', await headTxt(page))
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('MASS BRIEF after Undo:', JSON.stringify(await brief(page)))
await shot(page, 'CD-D2-15-after-undo')
await page.locator('#sbOil').click(); await page.waitForTimeout(600)
await page.locator('#sbRedo').click(); await page.waitForTimeout(1300)
say('head after Redo:', await headTxt(page))
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('MASS BRIEF after Redo:', JSON.stringify(await brief(page)))
await page.locator('#sbOil').click(); await page.waitForTimeout(600)
say('WAR through all of that:', JSON.stringify(await warCells(page, [[SAB, SAT], [TOR, SAT]])))
await board(page, di)
const p = await publishAL(page, di)
say('PUBLISH:', p.label, '->', await headTxt(page), '|', p.why || '')
say('WAR at the end:', JSON.stringify(await warCells(page, [[SAB, SAT], [TOR, SAT]])))
await shot(page, 'CD-D2-16-war-end')
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
