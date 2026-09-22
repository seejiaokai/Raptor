/* What does the board's "+ INPUTS" door actually offer? The Type list is leave
   CODES, and picking a name that is not one of them hangs the driver. */
import { open, board, tap, STATE } from './lib.mjs'
const di = 5
const { browser, page } = await open({ state: STATE })
await board(page, di)
await tap(page, `[data-inpadd="${di}.g"]`)
await page.waitForTimeout(800)
console.log(JSON.stringify(await page.evaluate(() => {
  const pop = document.querySelector('#inpEditPop')
  if (!pop) return 'NO DIALOG'
  return [...pop.querySelectorAll('select')].map(s => ({
    id: s.id, label: s.getAttribute('aria-label'),
    opts: [...s.options].map(o => o.text.trim() + '=' + o.value).slice(0, 30),
  }))
}), null, 1).slice(0, 2000))
await browser.close()
