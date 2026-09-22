/* C2 part one — a request taken OFF the programme and put back, under an
   admin decision.  F19 / C7 / C15.
   Subject: Gambit's Meeting 13:00-14:00, which he himself answered "No OIL". */
import { open, board, shot, tap } from './lib.mjs'
import { dayHead, bars, modeSnap, tapOilPerson, warCells, publishAL, showInputs, history, PUB_STATE } from './cd-lib.mjs'

const di = 5, SAT = '2026-07-18'
const MEET = 'imubcmotlcg0zk3', GAM = 'bruise'
const say = (...a) => console.log(...a)
const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, di)
say('HEAD:', (await dayHead(page, di)).headRow)
say('WAR Gambit at the start:', JSON.stringify(await warCells(page, [[GAM, SAT]])))
await board(page, di)

/* 1 — the admin allows him over his own "No", and issues it */
await page.locator('#sbOil').click(); await page.waitForTimeout(800)
say('MODE Gambit before:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Gambit').slice(0, 1)))
await tapOilPerson(page, 'Gambit')
say('MODE Gambit after the allow:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Gambit').slice(0, 1)))
await shot(page, 'CD-C2-01-gambit-allowed')
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
const p1 = await publishAL(page, di)
say('PUBLISH:', p1.label, '->', p1.head && p1.head.headRow)
say('WAR Gambit after the allow is issued:', JSON.stringify(await warCells(page, [[GAM, SAT]])))
await board(page, di)

/* 2 — take the request off the programme (the panel's UNDO) */
await showInputs(page, di)
const accBtn = await page.evaluate(k => {
  const b = [...document.querySelectorAll(`#schedBoard [data-acck="${k}"]`)].find(e => e.offsetParent)
  return b ? { text: (b.innerText || '').trim(), acc: b.dataset.acc, cls: b.className } : null
}, MEET)
say('the control on his row reads:', JSON.stringify(accBtn))
await tap(page, `[data-acck="${MEET}"]`)
await page.waitForTimeout(900)
say('GROUND rows now:', JSON.stringify(await page.evaluate(i => window.DAYS[i].ground.map(g => `${g.prog}|${g.str}-${g.end}|${g.who}`), di)))
say('the control now reads:', JSON.stringify(await page.evaluate(k => {
  const b = [...document.querySelectorAll(`#schedBoard [data-acck="${k}"]`)].find(e => e.offsetParent)
  return b ? { text: (b.innerText || '').trim(), acc: b.dataset.acc } : null
}, MEET)))
say('HEAD after taking it off:', (await dayHead(page, di)).headRow)
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('MODE Gambit while the request is off the programme:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Gambit')))
await shot(page, 'CD-C2-02-request-removed')
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
const p2 = await publishAL(page, di)
say('PUBLISH:', p2.label, '->', p2.head && p2.head.headRow)
say('WAR Gambit with the request off:', JSON.stringify(await warCells(page, [[GAM, SAT]])))
await board(page, di)

/* 3 — put it back on the programme */
await showInputs(page, di)
await tap(page, `[data-acck="${MEET}"]`)
await page.waitForTimeout(1000)
say('GROUND rows after putting it back:', JSON.stringify(await page.evaluate(i => window.DAYS[i].ground.map(g => `${g.prog}|${g.str}-${g.end}|${g.who}`), di)))
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
say('MODE Gambit when the request is back:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Gambit').slice(0, 2)))
await shot(page, 'CD-C2-03-request-restored')
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
say('HEAD:', (await dayHead(page, di)).headRow)
const p3 = await publishAL(page, di)
say('PUBLISH:', p3.label, '->', p3.head && p3.head.headRow)
say('WAR Gambit after it is back and issued:', JSON.stringify(await warCells(page, [[GAM, SAT]])))
await shot(page, 'CD-C2-04-war-after-restore')
await board(page, di)
say('HISTORY:', JSON.stringify(await history(page)))
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
