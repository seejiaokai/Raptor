/* D2 — loading the CURRENT issued version: what is left on screen, and is
   there still a way back to the live copy? */
import { open, board, shot, tap } from './lib.mjs'
import { tapOilPerson, publishAL, PUB_STATE } from './cd-lib.mjs'

const di = 5
const say = (...a) => console.log(...a)
const state = p => p.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  const vis = e => !!(e.offsetParent || e.getClientRects().length)
  return {
    plan: (() => { const x = b.querySelector('[data-planmenu]'); return x ? (x.innerText || '').replace(/\s+/g, ' ').trim() : null })(),
    pub: (() => { const x = b.querySelector('.sb-pub'); return x ? (x.innerText || '').replace(/\s+/g, ' ').trim() : null })(),
    oilDisabled: (document.querySelector('#sbOil') || {}).disabled,
    waysOut: [...b.querySelectorAll('[data-restore],[data-golive],[data-planmenu]')].filter(vis).map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()),
  }
})

const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, di)
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
await tapOilPerson(page, 'Saber', 0)
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
await publishAL(page, di)
await board(page, di)
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
await tapOilPerson(page, 'Ridge', 0)
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
say('BEFORE:', JSON.stringify(await state(page)))

for (const ver of ['2026-07-18#1', '2026-07-18#0']) {
  await tap(page, `[data-planmenu="${di}"]`); await page.waitForTimeout(700)
  const pv = page.locator(`[data-planpv="${ver}"]:visible`).first()
  if (!(await pv.count())) { say('no preview for ' + ver); continue }
  await pv.click(); await page.waitForTimeout(1300)
  say(`previewing ${ver}:`, JSON.stringify(await state(page)))
  await page.locator('#schedBoard [data-restore]:visible').first().click()
  await page.waitForTimeout(1800)
  say(`after loading ${ver}:`, JSON.stringify(await state(page)))
  await shot(page, 'CD-D2-22-loaded-' + ver.replace(/[^0-9a-z]/gi, ''))
  /* if it is stuck, take the way out and say so */
  const back = page.locator('#schedBoard [data-golive]:visible').first()
  if (await back.count()) { say('  pressing the way out:', (await back.innerText()).replace(/\s+/g, ' ').trim()); await back.click(); await page.waitForTimeout(1300); say('  then:', JSON.stringify(await state(page))) }
}
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
