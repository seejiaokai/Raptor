/* D2 — does loading an issued version throw away unpublished work, and does it
   say so?  Ridge's denial is the unpublished work here. */
import { open, board, shot, tap } from './lib.mjs'
import { modeSnap, tapOilPerson, warCells, publishAL, PUB_STATE } from './cd-lib.mjs'

const di = 5, SAT = '2026-07-18'
const say = (...a) => console.log(...a)
const headTxt = p => p.evaluate(() => { const b = document.querySelector('#schedBoard .sb-pub'); return b ? (b.innerText || '').replace(/\s+/g, ' ').trim() : null })
const cobra = async p => (await modeSnap(p)).people.filter(x => /COBRA/i.test(x.where)).map(x => `${x.who}:${/off/.test(x.cls) ? 'OFF' : 'on'}`)

const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, di)
/* AL1 so there are two issued versions to choose between */
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
await tapOilPerson(page, 'Saber', 0)
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
await publishAL(page, di)
await board(page, di)

/* the unpublished work: Ridge off COBRA */
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('COBRA before:', JSON.stringify(await cobra(page)))
await tapOilPerson(page, 'Ridge', 0)
say('COBRA with the unpublished deny:', JSON.stringify(await cobra(page)))
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
say('head:', await headTxt(page))
await shot(page, 'CD-D2-19-unpublished-deny')

/* preview AL1 and load it back over the top */
await tap(page, `[data-planmenu="${di}"]`); await page.waitForTimeout(700)
await page.locator('[data-planpv="2026-07-18#1"]:visible').first().click(); await page.waitForTimeout(1300)
const r = page.locator('#schedBoard [data-restore]:visible').first()
say('pressing:', (await r.innerText()).replace(/\s+/g, ' ').trim())
await r.click(); await page.waitForTimeout(1600)
const said = await page.evaluate(() => [...document.querySelectorAll('[class*=sheet],[role=dialog],.pop,.modal')].filter(e => e.offsetParent).map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 300)))
say('DID IT ASK ANYTHING?', said.length ? JSON.stringify(said) : 'no dialog at all')
await shot(page, 'CD-D2-20-loaded')
await board(page, di)
say('head after the load:', await headTxt(page))
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('COBRA after the load — is Ridge back on?', JSON.stringify(await cobra(page)))
await page.locator('#sbOil').click(); await page.waitForTimeout(600)
await page.locator('#sbUndo').click(); await page.waitForTimeout(1300)
say('head after Undo:', await headTxt(page))
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('COBRA after Undo — is the discarded deny back?', JSON.stringify(await cobra(page)))
await shot(page, 'CD-D2-21-after-undo')
await page.locator('#sbOil').click(); await page.waitForTimeout(600)
say('WAR:', JSON.stringify(await warCells(page, [['razer', SAT], ['stiff', SAT]])))
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
