/* C3 part two — the reorder and the man-swap legs, driven properly.
   The decision sits on OCU REVIEW this time. */
import { open, board, shot, tap, put } from './lib.mjs'
import { modeSnap, warCells, publishAL, dragRow, PUB_STATE } from './cd-lib.mjs'

const di = 5, SAT = '2026-07-18'
const say = (...a) => console.log(...a)
const headTxt = p => p.evaluate(() => { const b = document.querySelector('#schedBoard .sb-pub'); return b ? (b.innerText || '').replace(/\s+/g, ' ').trim() : null })
const ground = p => p.evaluate(i => window.DAYS[i].ground.map((g, n) => `${n}:${g.prog}|${(window.PEOPLE[g.who] || {}).cs || g.who}`), di)
const ocu = async p => (await modeSnap(p)).people.filter(x => /OCU/i.test(x.where)).map(x => `${x.who}:${/off/.test(x.cls) ? 'OFF' : 'on'}`)

const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, di)
const SAB = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Saber'))
say('GROUND:', JSON.stringify(await ground(page)))

/* deny Saber ON THE OCU REVIEW ROW */
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
const keys = await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilp]')].map((e, n) => ({ n, k: e.dataset.oilp, where: ((e.closest('tr,.sb-grow,.sb-arow') || {}).innerText || '').replace(/\s+/g, ' ').slice(0, 30) })).filter(x => x.k === 'stiff'))
say('Saber pucks in the mode:', JSON.stringify(keys))
const ocuKey = keys.find(k => /OCU/i.test(k.where))
await page.locator(`#schedBoard [data-oilp="stiff"]:visible`).nth(keys.findIndex(k => k === ocuKey)).click()
await page.waitForTimeout(700)
say('OCU REVIEW in the mode after the deny:', JSON.stringify(await ocu(page)))
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
const p1 = await publishAL(page, di)
say('AL1:', p1.label, '->', await headTxt(page))
say('WAR Saber after the deny is issued:', JSON.stringify(await warCells(page, [[SAB, SAT]])))
await board(page, di)
await shot(page, 'CD-C3-07-deny-on-ocu')

/* 1 — REORDER: drag OCU REVIEW (mv:g.5.0) onto the last ground row */
const moves = await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-move^="mv:g."]')].filter(e => e.offsetParent)
  .map(e => ({ k: e.dataset.move, row: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 26) })))
say('ground grips in screen order:', JSON.stringify(moves))
say(await dragRow(page, moves[0].k, moves[moves.length - 1].k))
say('GROUND after the drag:', JSON.stringify(await ground(page)))
say('head:', await headTxt(page))
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('OCU REVIEW in the mode after the reorder:', JSON.stringify(await ocu(page)))
say('the row that moved into position 0:', JSON.stringify((await modeSnap(page)).people.filter(x => /ADMIN|TRAINING|MEETING/i.test(x.where)).map(x => `${x.who} ${x.where.slice(0, 20)} ${/off/.test(x.cls) ? 'OFF' : 'on'}`)))
await shot(page, 'CD-C3-08-after-reorder')
await page.locator('#sbOil').click(); await page.waitForTimeout(600)

/* 2 — SWAP the man: arm his puck and pick someone else */
const ix = await page.evaluate(i => window.DAYS[i].ground.findIndex(g => /OCU/i.test(g.prog || '')), di)
const slot = `g:${di}.${ix}.0`
say('arming his seat', slot)
await tap(page, `[data-slot="${slot}"]`)
say('armed:', JSON.stringify(await page.evaluate(() => window.ARM && window.ARM.key)))
const pal = page.locator('#sbRoster .rpuck[data-person="dj"]').first()
if (await pal.count()) { await pal.click(); await page.waitForTimeout(800) }
say('GROUND after picking Ace:', JSON.stringify(await ground(page)))
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('OCU REVIEW in the mode after the swap:', JSON.stringify(await ocu(page)))
await shot(page, 'CD-C3-09-after-swap')
await page.locator('#sbOil').click(); await page.waitForTimeout(600)

/* 3 — and put Saber back on it */
await tap(page, `[data-slot="${slot}"]`)
const pal2 = page.locator(`#sbRoster .rpuck[data-person="${SAB}"]`).first()
if (await pal2.count()) { await pal2.click(); await page.waitForTimeout(800) }
say('GROUND with Saber back:', JSON.stringify(await ground(page)))
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('OCU REVIEW in the mode when Saber returns:', JSON.stringify(await ocu(page)))
await shot(page, 'CD-C3-10-saber-returns')
await page.locator('#sbOil').click(); await page.waitForTimeout(600)
say('head:', await headTxt(page))
const p2 = await publishAL(page, di)
say('PUBLISH:', p2.label, '->', await headTxt(page))
say('WAR Saber at the end:', JSON.stringify(await warCells(page, [[SAB, SAT], ['dj', SAT]])))
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
