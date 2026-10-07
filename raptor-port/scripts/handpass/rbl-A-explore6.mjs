/* exploratory: the Ground Programme's + Row, and a Common Programme / duty row's boxes */
import * as K from './rbl-A-lib.mjs'
const { B, W, X, MON, TUE } = K
const { browser, p, errors } = await K.fresh()
await K.boardTo(p, TUE)
const b = p.locator(`#schedBoard [data-gradd="${TUE}"]`).first()
await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await K.sleep(600)
const keys = await p.evaluate(() => {
  const o = []
  for (const e of document.querySelectorAll('#schedBoard [data-bfld^="gr:"], #schedBoard [data-bfld^="g:"], #schedBoard [data-bfld*="gr"], #schedBoard [data-fill^="g:"], #schedBoard [data-fill*="g:"]')) o.push((e.dataset.bfld ? 'bfld=' + e.dataset.bfld : 'fill=' + e.dataset.fill) + ' ' + e.tagName)
  return o
})
console.log(JSON.stringify(keys, null, 0))
console.log(JSON.stringify(await p.evaluate(i => window.DAYS[i].ground || window.DAYS[i].gr || Object.keys(window.DAYS[i]), TUE)).slice(0, 600))
await K.picEl(p, `#schedBoard [data-gradd="${TUE}"]`, 'explore6-ground', { pad: 400, maxH: 700 })
console.log('errors', errors)
await browser.close()
