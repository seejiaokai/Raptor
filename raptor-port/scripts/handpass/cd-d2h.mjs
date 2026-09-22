/* D2 — complete the two-tap load, then undo it. */
import { open, board, shot, tap } from './lib.mjs'
import { modeSnap, tapOilPerson, warCells, publishAL, PUB_STATE } from './cd-lib.mjs'

const di = 5, SAT = '2026-07-18'
const say = (...a) => console.log(...a)
const headTxt = p => p.evaluate(() => { const b = document.querySelector('#schedBoard .sb-pub'); return b ? (b.innerText || '').replace(/\s+/g, ' ').trim() : null })
const read = async (p, re) => (await modeSnap(p)).people.filter(x => re.test(x.where)).map(x => `${x.who}:${/off/.test(x.cls) ? 'OFF' : 'on'}`)

const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, di)
/* AL1 = Saber off MASS BRIEF */
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
await tapOilPerson(page, 'Saber', 0)
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
await publishAL(page, di)
await board(page, di)
/* unpublished: Ridge off COBRA */
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
await tapOilPerson(page, 'Ridge', 0)
say('before the load — COBRA:', JSON.stringify(await read(page, /COBRA/i)), '| MASS BRIEF:', JSON.stringify(await read(page, /MASS BRIEF/i)))
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
say('head:', await headTxt(page))

await tap(page, `[data-planmenu="${di}"]`); await page.waitForTimeout(700)
await page.locator('[data-planpv="2026-07-18#0"]:visible').first().click(); await page.waitForTimeout(1300)
const r = page.locator('#schedBoard [data-restore]:visible').first()
await r.click(); await page.waitForTimeout(1200)
say('the button now reads:', (await r.innerText()).replace(/\s+/g, ' ').trim(), '| title:', await r.getAttribute('title'))
await shot(page, 'CD-D2-23-discard-confirm')
await r.click(); await page.waitForTimeout(1800)
say('head after the load:', await headTxt(page))
await board(page, di)
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('after loading the ORIGINAL — COBRA:', JSON.stringify(await read(page, /COBRA/i)), '| MASS BRIEF:', JSON.stringify(await read(page, /MASS BRIEF/i)))
await shot(page, 'CD-D2-24-after-load')
await page.locator('#sbOil').click(); await page.waitForTimeout(600)
say('head:', await headTxt(page))
await page.locator('#sbUndo').click(); await page.waitForTimeout(1400)
say('head after Undo:', await headTxt(page))
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('after Undo — COBRA:', JSON.stringify(await read(page, /COBRA/i)), '| MASS BRIEF:', JSON.stringify(await read(page, /MASS BRIEF/i)))
await shot(page, 'CD-D2-25-after-undo')
await page.locator('#sbOil').click(); await page.waitForTimeout(600)
say('WAR through all of it:', JSON.stringify((await warCells(page, [['razer', SAT], ['stiff', SAT]])).map(c => c.pid + '=' + c.text)))
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
