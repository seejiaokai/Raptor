/* Walker E — the board's "+ INPUTS" door: the New input sheet, at both sizes, from the unpublished world. */
import * as E from './stk-E-lib.mjs'
for (const phone of [false, true]) {
  const SZ = phone ? 'phone' : 'desktop'
  const { browser, page, errors } = await E.world({ size: phone ? E.PHONE : E.DESK, phone, state: process.env.E_STATE_DIR + `/world-${SZ}.json` })
  await E.nav(page, 'editsched')
  await page.evaluate(d => { const b = document.querySelector(`#eWeek [data-sbday="${d}"]`); const dd = b.closest('.day'); const sc = dd.parentElement; if (sc && sc.scrollWidth > sc.clientWidth) sc.scrollLeft = dd.offsetLeft - (sc.firstElementChild ? sc.firstElementChild.offsetLeft : 0) }, 5)
  await E.sleep(300)
  await page.locator('#eWeek [data-sbday="5"]:visible').first().click(); await page.waitForSelector('#schedBoard', { state: 'visible' }); await E.sleep(600)
  const door = page.locator('#sbBoard [data-inpadd]').first(); await door.scrollIntoViewIfNeeded(); await door.click(); await E.sleep(800)
  const open = await page.locator('#inpEditPop:visible').count()
  const r = await page.evaluate(() => { const e = document.querySelector('#inpEditPop .airpop-box, #inpEditPop > div'); const q = (e || document.querySelector('#inpEditPop')).getBoundingClientRect(); return { top: Math.round(q.top), bottom: Math.round(q.bottom), vh: innerHeight, w: Math.round(q.width) } })
  const f = await E.pic(page, `newinput-${SZ}-board-new-input-sheet`)
  console.log(SZ, 'sheet open:', open, JSON.stringify(r), f, errors)
  await browser.close()
}
