import * as L from './or-I-lib.mjs'
const { page, browser } = await L.start()
const r = await L.fileIt(page, { title: 'Range brief', kind: 'Meeting', pick: ['Ranger', 'Hex'], from: '09:00', to: '10:00', oil: 'close' })
await L.toWeek(page)
const ri = await L.rowIdx(page, r.iid)
const html = await page.evaluate(([di, ri]) => {
  const first = document.querySelector(`#eWeek .day:not(.peek) [data-slot="g:${di}.${ri}"]`)
  const row = first && first.closest('.pl-row')
  return row ? row.outerHTML : 'no row'
}, [L.DI, ri])
console.log('ROW', html)
// personal inputs line
const fold = page.locator(`#eWeek .sec-inp .pl-fold[data-pitog="${L.DI}"]`).first()
if (await fold.count()) { await fold.scrollIntoViewIfNeeded(); await fold.click(); await page.waitForTimeout(300) }
console.log('INPLINE', await page.evaluate(() => [...document.querySelectorAll('#eWeek .day:not(.peek) .sec-inp .pl-row')].map(e => e.outerHTML).join('\n---\n').slice(0, 3000)))
await L.openBoard(page)
console.log('BOARDROW', await page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')].filter(e => e.offsetParent).map(e => e.outerHTML).join('\n---\n').slice(0, 3500)))
console.log(L.errs)
await browser.close()
