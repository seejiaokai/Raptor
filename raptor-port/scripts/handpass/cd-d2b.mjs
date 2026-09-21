/* D2 part two — what is on screen while an issued version is being previewed,
   and how a scheduler gets back out of it. */
import { open, board, shot, tap } from './lib.mjs'
import { dayHead, bars, modeSnap, tapOilPerson, warCells, publishAL, history, PUB_STATE } from './cd-lib.mjs'

const di = 5, SAT = '2026-07-18'
const say = (...a) => console.log(...a)
const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, di)
const SAB = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Saber'))

await page.locator('#sbOil').click(); await page.waitForTimeout(800)
await tapOilPerson(page, 'Saber', 0)
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
await publishAL(page, di)
await board(page, di)

await tap(page, `[data-planmenu="${di}"]`); await page.waitForTimeout(700)
await page.locator('[data-planpv="2026-07-18#0"]:visible').first().click()
await page.waitForTimeout(1300)
await shot(page, 'CD-D2-07-preview-full')
const scr = await page.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  const vis = e => !!(e.offsetParent || e.getClientRects().length)
  return {
    topText: (b.innerText || '').replace(/\s+/g, ' ').slice(0, 700),
    buttons: [...b.querySelectorAll('button,[role=button]')].filter(vis)
      .map(e => ({ t: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 30), dis: e.disabled, d: Object.entries(e.dataset || {}).map(([k, v]) => k + '=' + v).join(' ') }))
      .filter(x => x.t || x.d).slice(0, 40),
    planAttrs: [...document.querySelectorAll('[data-plangolive],[data-planpv],[data-planmenu],[data-planload],[data-planuse]')].filter(vis)
      .map(e => ({ d: Object.entries(e.dataset).map(([k, v]) => k + '=' + v).join(' '), t: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 50) })),
  }
})
say('BOARD TEXT IN PREVIEW:', scr.topText)
say('\nBUTTONS IN PREVIEW:', JSON.stringify(scr.buttons, null, 0))
say('\nPLAN CONTROLS IN PREVIEW:', JSON.stringify(scr.planAttrs, null, 1))

/* is the day still editable while previewing? try to type in a field */
const w = await page.evaluate(() => {
  const f = [...document.querySelectorAll('#schedBoard [data-bfld]')].find(e => e.offsetParent)
  return f ? { tag: f.tagName, ro: f.readOnly, dis: f.disabled, k: f.dataset.bfld } : null
})
say('a text field in the preview:', JSON.stringify(w))

/* the way back */
const back = page.locator('#schedBoard [data-plangolive]').first()
say('is there a "live working copy" control?', await back.count() ? (await back.innerText()).replace(/\s+/g, ' ').trim() : 'NONE VISIBLE')
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
