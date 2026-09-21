/* D1 — Unpublish, change, and republish under the same label.  F22 / C11. */
import { open, board, shot, tap } from './lib.mjs'
import { dayHead, modeSnap, tapOilPerson, warCells, signAndPublish, publishAL, history, PUB_STATE } from './cd-lib.mjs'

const di = 5, SAT = '2026-07-18'
const FABLE = 'fable2'           // resolved below by callsign
const say = (...a) => console.log(...a)
const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, di)
const SDO = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Fable'))
say('the SDO is', SDO)
say('HEAD:', (await dayHead(page, di)).headRow)
say('WAR Fable while the day is out:', JSON.stringify(await warCells(page, [[SDO, SAT]])))
await board(page, di)

/* 1 — press Unpublish and read what it warns */
const unp = page.locator('#schedBoard button').filter({ hasText: /Unpublish/ }).first()
say('the Unpublish button reads:', (await unp.innerText()).trim(), '| title:', await unp.getAttribute('title'))
await unp.click(); await page.waitForTimeout(900)
say('after one press, the button reads:', await page.evaluate(() => {
  const b = [...document.querySelectorAll('#schedBoard button')].find(e => /Unpublish|Confirm|Sure/i.test(e.innerText || ''))
  return b ? { t: (b.innerText || '').trim(), title: b.title } : null
}))
await shot(page, 'CD-D1-01-unpublish-pressed')
const conf = page.locator('#schedBoard button').filter({ hasText: /withdraw|confirm|unpublish|yes/i }).first()
if (await conf.count() && await conf.isVisible()) { say('confirming with:', (await conf.innerText()).trim()); await conf.click(); await page.waitForTimeout(1200) }
say('HEAD after unpublish:', (await dayHead(page, di)).headRow)
await shot(page, 'CD-D1-02-unpublished')
say('WAR Fable during the gap:', JSON.stringify(await warCells(page, [[SDO, SAT]])))
await board(page, di)

/* 2 — take Fable off his desk in the mode, then publish again */
await page.locator('#sbOil').click(); await page.waitForTimeout(800)
say('MODE Fable before:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Fable')))
await tapOilPerson(page, 'Fable')
say('MODE Fable after:', JSON.stringify((await modeSnap(page)).people.filter(p => p.who === 'Fable').slice(0, 1)))
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
const r = await signAndPublish(page, di)
say('REPUBLISH:', JSON.stringify({ published: r.published, why: r.why, head: r.head && r.head.headRow }))
await shot(page, 'CD-D1-03-republished')
say('HEAD after republish:', (await dayHead(page, di)).headRow)
say('WAR Fable after republish:', JSON.stringify(await warCells(page, [[SDO, SAT]])))
await board(page, di)
say('HISTORY:', JSON.stringify(await history(page)))
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
