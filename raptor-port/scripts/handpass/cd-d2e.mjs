/* D2 — what the board looks like right after "Load onto working copy". */
import { open, board, shot, tap } from './lib.mjs'
import { tapOilPerson, publishAL, PUB_STATE } from './cd-lib.mjs'

const di = 5
const say = (...a) => console.log(...a)
const state = p => p.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  const vis = e => !!(e.offsetParent || e.getClientRects().length)
  return {
    planBtn: (() => { const x = b.querySelector('[data-planmenu]'); return x ? (x.innerText || '').replace(/\s+/g, ' ').trim() : null })(),
    pubStrip: (() => { const x = b.querySelector('.sb-pub'); return x ? (x.innerText || '').replace(/\s+/g, ' ').trim() : null })(),
    oil: (() => { const o = document.querySelector('#sbOil'); return o ? { disabled: o.disabled } : null })(),
    tpl: (() => { const o = document.querySelector('#sbTpl'); return o ? { disabled: o.disabled } : null })(),
    restore: [...b.querySelectorAll('[data-restore],[data-golive]')].filter(vis).map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()),
    firstField: (() => { const f = [...b.querySelectorAll('[data-bfld]')].find(vis); return f ? { ro: f.readOnly, dis: f.disabled } : null })(),
    banner: [...b.querySelectorAll('*')].filter(e => vis(e) && (e.innerText || '').length < 90 && /read-only|preview|issued|look, don/i.test(e.innerText || '')).map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()).slice(0, 3),
  }
})

const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, di)
await page.locator('#sbOil').click(); await page.waitForTimeout(900)
await tapOilPerson(page, 'Saber', 0)
await page.locator('#sbOil').click(); await page.waitForTimeout(700)
await publishAL(page, di)
await board(page, di)
say('BEFORE:', JSON.stringify(await state(page)))

await tap(page, `[data-planmenu="${di}"]`); await page.waitForTimeout(700)
await page.locator('[data-planpv="2026-07-18#0"]:visible').first().click(); await page.waitForTimeout(1300)
say('IN THE PREVIEW:', JSON.stringify(await state(page)))
await page.locator('#schedBoard [data-restore]:visible').first().click()
await page.waitForTimeout(1500)
say('RIGHT AFTER "Load onto working copy":', JSON.stringify(await state(page)))
await shot(page, 'CD-D2-17-right-after-load')
await page.waitForTimeout(1500)
say('a second and a half later:', JSON.stringify(await state(page)))

/* does re-opening the board bring it back to life? */
await board(page, di)
say('after closing and re-opening the day:', JSON.stringify(await state(page)))
await shot(page, 'CD-D2-18-after-reopen')
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
