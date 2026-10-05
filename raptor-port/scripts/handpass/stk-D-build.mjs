/* Walker D: build the 'everything Saturday' (+ BB wave, + a timed personal input accepted to Ground, + tracking on) through the app's controls
   once, and save the browser world so later scripts start from it. */
import * as H from './stk-D-lib.mjs'
import { buildSaturday } from './fixture.mjs'
import * as L from './dbrA-lib.mjs'
import { fileTimed, accBtn } from './p6-lib.mjs'
const { open, nav, openBoard, tap, type, sleep, pic, boxList, scopeSel } = H
const STATE = process.env.STK_STATE
const { browser, ctx, page, errors } = await open({ width: 1440, height: 900, who: 'a', fresh: false })
page.setDefaultTimeout(9000)
// Logic: tracking on first (admin edit)
await nav(page, 'logic')
await page.locator('#lgEdit').click().catch(() => {}); await sleep(300)
await page.locator('#lgMissionMix').check().catch(() => {}); await sleep(400)
console.log('tracking switch checked:', await page.locator('#lgMissionMix').isChecked().catch(() => 'n/a'))
const fx = await buildSaturday(page, 5)
console.log(fx.join('\n'))
// a BB wave
await tap(page, '[data-wvadd="5"]')
const names = await page.locator('.wavemenu button, .wavemenu [role=menuitem]').allInnerTexts().catch(() => [])
console.log('wave menu:', JSON.stringify(names))
const bb = page.getByRole('button', { name: /^BB/ })
if (await bb.count()) { await bb.first().click(); await sleep(600); console.log('BB wave added') } else { await page.keyboard.press('Escape'); console.log('no BB item in menu') }
await sleep(500)
console.log('waves on Saturday:', await page.evaluate(() => window.DAYS[5].waves.map(w => w.kind + '/' + (w.label || '') + '/' + w.formations.length)))
// the personal input through the Inputs page, accepted onto Saturday's ground through the board's own button
const iid = await fileTimed(L, page, { person: 'ignite', type: 'Training', iso: '2026-07-18', from: '11:00', to: '12:00', remarks: 'TAB INPUT' })
console.log('input filed', iid)
await sleep(500)
const acc = iid ? await accBtn(L, page, 5, iid, 'g') : 'no iid'
console.log('accepted:', acc)
await sleep(800)
console.log('input row:', JSON.stringify(await page.evaluate(i => window.INPUTS.find(x => x.iid === i), iid)))
console.log('ground rows with src:', JSON.stringify(await page.evaluate(() => window.DAYS[5].ground.map((g, i) => ({ i, prog: g.prog, src: g.src || null })))))
await pic(page, 'build-board-saturday')
await nav(page, 'editsched').catch(() => {})
await L.settle(page, 1200)
await ctx.storageState({ path: STATE })
console.log('state saved', STATE, 'errors', JSON.stringify(errors))
await browser.close()
