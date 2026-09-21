/* C3 part four — swap the man on a row that carries a denial, by dragging the
   puck off and dropping a new man in. */
import { open, board, shot, tap, put } from './lib.mjs'
import { modeSnap, warCells, publishAL, dragPuckOff, PUB_STATE } from './cd-lib.mjs'

const di = 5, SAT = '2026-07-18'
const say = (...a) => console.log(...a)
const headTxt = p => p.evaluate(() => { const b = document.querySelector('#schedBoard .sb-pub'); return b ? (b.innerText || '').replace(/\s+/g, ' ').trim() : null })
const ground = p => p.evaluate(i => window.DAYS[i].ground.map((g, n) => `${n}:${g.prog}|${(window.PEOPLE[g.who] || {}).cs || g.who}`), di)
const ocu = async p => (await modeSnap(p)).people.filter(x => /OCU/i.test(x.where)).map(x => `${x.who}:${/off/.test(x.cls) ? 'OFF' : 'on'}`)

const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, di)
const SAB = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Saber'))
const ix = await page.evaluate(i => window.DAYS[i].ground.findIndex(g => /OCU/i.test(g.prog || '')), di)

await page.locator('#sbOil').click(); await page.waitForTimeout(900)
const keys = await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilp]')].map(e => ({ k: e.dataset.oilp, where: ((e.closest('tr,.sb-grow,.sb-arow') || {}).innerText || '').replace(/\s+/g, ' ').slice(0, 24) })).filter(x => x.k === 'stiff'))
await page.locator('#schedBoard [data-oilp="stiff"]:visible').nth(keys.findIndex(k => /OCU/i.test(k.where))).click()
await page.waitForTimeout(700)
say('OCU REVIEW after the deny:', JSON.stringify(await ocu(page)))
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
await publishAL(page, di)
say('WAR after the deny is issued (Saber, Ace):', JSON.stringify(await warCells(page, [[SAB, SAT], ['dj', SAT]])))
await board(page, di)

say(await dragPuckOff(page, 'OCU REVIEW', SAB))
say('GROUND after taking him off:', JSON.stringify(await ground(page)))
say('put Ace on:', await put(page, `[data-fill="g:${di}.${ix}.+"]`, ['dj']))
say('GROUND:', JSON.stringify(await ground(page)))
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('OCU REVIEW in the mode with the new man:', JSON.stringify(await ocu(page)))
await shot(page, 'CD-C3-13-new-man-on-denied-row')
await page.locator('#sbOil').click(); await page.waitForTimeout(600)
const p = await publishAL(page, di)
say('PUBLISH:', p.label, '->', await headTxt(page))
say('WAR after the swap is issued:', JSON.stringify(await warCells(page, [[SAB, SAT], ['dj', SAT]])))
await board(page, di)

/* now bring Saber back to the same row */
say(await dragPuckOff(page, 'OCU REVIEW', 'dj'))
say('put Saber back:', await put(page, `[data-fill="g:${di}.${ix}.+"]`, [SAB]))
say('GROUND:', JSON.stringify(await ground(page)))
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('OCU REVIEW when Saber returns:', JSON.stringify(await ocu(page)))
await shot(page, 'CD-C3-14-saber-returns')
await page.locator('#sbOil').click(); await page.waitForTimeout(600)
const p2 = await publishAL(page, di)
say('PUBLISH:', p2.label, '->', await headTxt(page))
say('WAR at the end:', JSON.stringify(await warCells(page, [[SAB, SAT], ['dj', SAT]])))
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
